import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { cleanDomain } from '@/lib/leadgen/ssrf'
import { buildUrlQueue } from './discover'
import { routeFetchTarget } from '@/lib/leadgen/engines/router'
import { extractContactsFromHtml } from './extract'
import { computeLeadScore } from './score'
import { generateOutreachDraft } from './outreach'
import type { JobCursor } from './types'

export interface TickResult {
  ok: boolean
  job_id?: string
  status?: string
  processed?: number
  remaining?: number
  leads_count?: number
  lease_until?: string | null
  cursor?: JobCursor
  reason?: string
}

/**
 * Executes a single chunked execution tick for a leadgen job.
 * Ensures strict lease-based mutual exclusion (idempotent, returns lease_held on race).
 */
export async function executeJobTick(jobId: string): Promise<TickResult> {
  const adminDb = createSupabaseAdminClient()
  const now = new Date()
  const nowIso = now.toISOString()
  // 55-second lease window for serverless wall-clock
  const leaseUntilIso = new Date(now.getTime() + 55000).toISOString()
  const tickId = `tick-${Math.random().toString(36).slice(2, 9)}`

  // 1. Atomic lease acquisition
  const { data: job, error: claimError } = await adminDb
    .from('leadgen_jobs')
    .update({
      status: 'running',
      lease_until: leaseUntilIso,
      owner_boot_id: tickId,
      heartbeat_at: nowIso,
    })
    .eq('id', jobId)
    .in('status', ['queued', 'running'])
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .select('*')
    .maybeSingle()

  if (claimError || !job) {
    return { ok: false, job_id: jobId, reason: 'lease_held' }
  }

  const startTime = Date.now()
  const maxTickDurationMs = 40000 // 40 seconds wall budget

  try {
    const brief = job.brief || {}
    const maxPages = brief.max_pages || 80
    const maxLeads = brief.max_leads || 50
    const outreachMinScore = brief.outreach_min_score ?? 50
    const icpText = brief.icp || ''
    const logs: string[] = Array.isArray(job.logs) ? [...job.logs] : []

    let leadsCount = Number(job.leads_count) || 0
    let pagesFetched = Number(job.pages_fetched) || 0
    let pagesBlocked = Number(job.pages_blocked) || 0

    // 2. Initialize or restore cursor
    let cursor: JobCursor = (job.cursor as JobCursor) || {
      seed_index: 0,
      url_queue: [],
      processed: 0,
      stage: 'brief',
    }

    if (!cursor.url_queue || (cursor.url_queue.length === 0 && cursor.processed === 0)) {
      logs.push(`> engine: builtin/${job.engine_default}/v1 · ok`)
      logs.push(`> robots: obey · ${job.robots_obey ? 'on' : 'off'}`)
      logs.push(`> control_plane: helix-ai · ok`)

      const initialQueue = await buildUrlQueue({
        seeds: job.seeds || { urls: [] },
        maxPages,
        mode: job.mode,
      })

      cursor = {
        seed_index: 0,
        url_queue: initialQueue,
        processed: 0,
        stage: 'fetch',
      }
      logs.push(`> discover · ${initialQueue.length} urls queued`)
    }

    // 3. Determine URL batch size based on engine speed
    let batchLimit = 5
    if (job.engine_default === 'dynamic' || job.engine_default === 'stealth') {
      batchLimit = 1
    } else if (job.engine_default === 'auto') {
      batchLimit = 2
    }

    // Process chunk of URLs
    while (
      cursor.url_queue.length > 0 &&
      batchLimit > 0 &&
      leadsCount < maxLeads &&
      Date.now() - startTime < maxTickDurationMs
    ) {
      const targetUrl = cursor.url_queue.shift()!
      batchLimit -= 1
      cursor.processed += 1

      const { result, logLines } = await routeFetchTarget(targetUrl, {
        engine: job.engine_default,
        clientId: job.client_id,
        robotsObey: job.robots_obey,
      })

      logs.push(...logLines)

      if (result.fetch_status === 'ok' && result.html) {
        pagesFetched += 1

        const contacts = extractContactsFromHtml(result.html, result.finalUrl || targetUrl)
        logs.push(
          `> extract · emails=${contacts.emails.length} phones=${contacts.phones.length} · adaptive=${job.adaptive ? 'on' : 'off'}`
        )

        const emailSource = contacts.emails.length > 0 ? 'website' : 'none'
        const phoneSource = contacts.phones.length > 0 ? 'website' : 'none'
        logs.push(`> enrich · email_source=${emailSource} · phone_source=${phoneSource}`)

        const scoreOutput = computeLeadScore(contacts, icpText)
        logs.push(`> score · ${scoreOutput.score} · priority=${scoreOutput.priority}`)

        const outreach = generateOutreachDraft({
          contacts,
          targetUrl: result.finalUrl || targetUrl,
          icpText,
          score: scoreOutput.score,
          outreachMinScore,
          enabled: Boolean(job.generate_outreach),
        })

        if (outreach) {
          logs.push('> outreach · generated')
        } else {
          logs.push('> outreach · skipped_low_priority_or_no_contact')
        }

        const domain = cleanDomain(result.finalUrl || targetUrl)

        // Insert leadgen lead
        await adminDb.from('leadgen_leads').insert({
          job_id: jobId,
          client_id: job.client_id,
          company_name: contacts.company_name,
          website: result.finalUrl || targetUrl,
          domain,
          emails: contacts.emails,
          phones: contacts.phones,
          socials: {},
          address: contacts.address,
          decision_makers: [],
          markdown_excerpt: contacts.markdown_excerpt,
          extract_status: contacts.extract_status,
          fetch_status: result.fetch_status,
          engine_used: result.engine,
          email_source: emailSource,
          phone_source: phoneSource,
          lead_score: scoreOutput.score,
          priority: scoreOutput.priority,
          outreach,
          sources: {
            recipe_id: job.recipe_id,
            target_url: targetUrl,
            score_breakdown: scoreOutput.breakdown,
          },
        })

        leadsCount += 1
      } else if (result.fetch_status === 'blocked' || result.fetch_status === 'rate_limited') {
        pagesBlocked += 1
      }
    }

    // 4. Check if job is finished
    const isFinished = cursor.url_queue.length === 0 || leadsCount >= maxLeads
    const nowFinishedIso = new Date().toISOString()
    const elapsedMs = (Number(job.elapsed_ms) || 0) + (Date.now() - startTime)

    if (isFinished) {
      logs.push(`> export · completed · total_leads=${leadsCount} · elapsed_ms=${elapsedMs}`)

      await adminDb
        .from('leadgen_jobs')
        .update({
          status: 'succeeded',
          stage: 'export',
          stage_label: 'Extraction completed',
          stage_index: 8,
          leads_count: leadsCount,
          pages_fetched: pagesFetched,
          pages_blocked: pagesBlocked,
          elapsed_ms: elapsedMs,
          lease_until: null,
          heartbeat_at: nowFinishedIso,
          completed_at: nowFinishedIso,
          cursor,
          logs: logs.slice(-50),
        })
        .eq('id', jobId)

      return {
        ok: true,
        job_id: jobId,
        status: 'succeeded',
        processed: cursor.processed,
        remaining: 0,
        leads_count: leadsCount,
        lease_until: null,
        cursor,
      }
    }

    // 5. Release lease for next tick while keeping status running
    await adminDb
      .from('leadgen_jobs')
      .update({
        status: 'running',
        stage: 'fetch',
        stage_label: 'Fetching target pages',
        stage_index: 3,
        leads_count: leadsCount,
        pages_fetched: pagesFetched,
        pages_blocked: pagesBlocked,
        elapsed_ms: elapsedMs,
        lease_until: null, // Clear lease so next polling tick can immediately proceed
        heartbeat_at: nowFinishedIso,
        cursor,
        logs: logs.slice(-50),
      })
      .eq('id', jobId)

    return {
      ok: true,
      job_id: jobId,
      status: 'running',
      processed: cursor.processed,
      remaining: cursor.url_queue.length,
      leads_count: leadsCount,
      lease_until: null,
      cursor,
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err)
    console.error(`[leadgen/tick] Error on job ${jobId}:`, err)

    await adminDb
      .from('leadgen_jobs')
      .update({
        status: 'failed',
        error_msg: errorMsg,
        lease_until: null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', jobId)

    return {
      ok: false,
      job_id: jobId,
      status: 'failed',
      reason: errorMsg,
    }
  }
}
