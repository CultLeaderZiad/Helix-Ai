import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { cleanDomain } from '@/lib/leadgen/ssrf'
import { buildUrlQueue } from './discover'
import { enrichDomain } from '@/lib/search/enrich/enrich-domain'
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
 * Handles both legacy 'crawl' jobs and v2 'enrich' / 'find' jobs.
 * Enforces exactly one lead per domain via upsert on (job_id, domain).
 */
export async function executeJobTick(jobId: string): Promise<TickResult> {
  const adminDb = createSupabaseAdminClient()
  const now = new Date()
  const nowIso = now.toISOString()
  const leaseUntilIso = new Date(now.getTime() + 55000).toISOString()
  const tickId = `tick-${Math.random().toString(36).slice(2, 9)}`

  // 1. Atomic lease acquisition
  const { data: job, error: claimError } = await (adminDb as any)
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
  const maxTickDurationMs = 38000 // Keep under Vercel serverless ceiling

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

    const jobKind = job.job_kind || job.brief?.job_kind || 'crawl'

    // 2. Initialize cursor
    let cursor: JobCursor = (job.cursor as JobCursor) || {
      seed_index: 0,
      url_queue: [],
      processed: 0,
      stage: 'brief',
    }

    if (!cursor.url_queue || (cursor.url_queue.length === 0 && cursor.processed === 0)) {
      logs.push(`> engine: builtin/${job.engine_default}/v2 · ok`)
      logs.push(`> mode: ${jobKind} · robots_obey=${job.robots_obey ? 'on' : 'off'}`)

      // Queue domain / URL targets
      let initialTargets: string[] = []
      if (jobKind === 'enrich' || jobKind === 'find') {
        const seedList = job.seeds?.urls || []
        const uniqueDomains = new Set<string>()
        for (const u of seedList) {
          const dom = cleanDomain(u)
          if (dom && !uniqueDomains.has(dom)) {
            uniqueDomains.add(dom)
            initialTargets.push(u)
          }
        }
      } else {
        initialTargets = await buildUrlQueue({
          seeds: job.seeds || { urls: [] },
          maxPages,
          mode: job.mode,
        })
      }

      cursor = {
        seed_index: 0,
        url_queue: initialTargets,
        processed: 0,
        stage: 'fetch',
      }
      logs.push(`> discover · ${initialTargets.length} targets queued`)
    }

    // 3. Process batch of targets
    if (jobKind === 'enrich' || jobKind === 'find') {
      // Process 1 domain per tick for comprehensive multi-page enrichment
      const batchLimit = 1
      let processedInTick = 0

      while (
        cursor.url_queue.length > 0 &&
        processedInTick < batchLimit &&
        leadsCount < maxLeads &&
        Date.now() - startTime < maxTickDurationMs
      ) {
        const targetUrl = cursor.url_queue.shift()!
        processedInTick += 1
        cursor.processed += 1

        const enrichRes = await enrichDomain({
          domainOrUrl: targetUrl,
          pagesPerSite: 4,
          engine: job.engine_default || 'auto',
          robotsObey: job.robots_obey ?? true,
          clientId: job.client_id,
          hunter: job.brief?.hunter,
          icpText
        })

        logs.push(...enrichRes.logs)
        pagesFetched += enrichRes.pages_checked

        const outreach = generateOutreachDraft({
          contacts: {
            company_name: enrichRes.company,
            emails: enrichRes.all_emails,
            phones: enrichRes.phones,
            address: null,
            markdown_excerpt: enrichRes.description || '',
            extract_status: 'ok'
          },
          targetUrl: enrichRes.website,
          icpText,
          score: enrichRes.score,
          outreachMinScore,
          enabled: Boolean(job.generate_outreach),
        })

        // Upsert lead exactly once per (job_id, domain) with fallback
        const fullLeadPayload = {
          job_id: jobId,
          client_id: job.client_id,
          company_name: enrichRes.company,
          website: enrichRes.website,
          domain: enrichRes.domain,
          description: enrichRes.description || null,
          description_source: enrichRes.description_source,
          city: enrichRes.city || null,
          country: enrichRes.country || null,
          geo_source: enrichRes.geo_source,
          origin: jobKind === 'find' ? 'find_leads' : 'enrich_url',
          pages_checked: enrichRes.pages_checked,
          people: enrichRes.people,
          emails: enrichRes.all_emails,
          phones: enrichRes.phones,
          socials: enrichRes.socials,
          decision_makers: enrichRes.decision_makers,
          extract_status: 'complete',
          fetch_status: 'ok',
          engine_used: job.engine_default,
          email_source: enrichRes.email_source,
          phone_source: enrichRes.phones.length > 0 ? 'website' : 'none',
          lead_score: enrichRes.score,
          priority: enrichRes.score_priority,
          outreach,
          sources: {
            recipe_id: job.recipe_id,
            domain: enrichRes.domain,
            sources: enrichRes.sources,
            description: enrichRes.description || null,
            city: enrichRes.city || null,
            country: enrichRes.country || null,
            people: enrichRes.people,
            origin: jobKind === 'find' ? 'find_leads' : 'enrich_url'
          }
        }

        let { error: upsertErr } = await (adminDb as any)
          .from('leadgen_leads')
          .upsert(fullLeadPayload, { onConflict: 'job_id, domain' })

        if (upsertErr) {
          // Fallback if columns or (job_id, domain) unique index are missing
          const baseLeadPayload = {
            job_id: jobId,
            client_id: job.client_id,
            company_name: enrichRes.company,
            website: enrichRes.website,
            domain: enrichRes.domain,
            markdown_excerpt: enrichRes.description || '',
            emails: enrichRes.all_emails,
            phones: enrichRes.phones,
            socials: enrichRes.socials,
            decision_makers: enrichRes.decision_makers,
            extract_status: 'complete',
            fetch_status: 'ok',
            engine_used: job.engine_default,
            email_source: enrichRes.email_source,
            phone_source: enrichRes.phones.length > 0 ? 'website' : 'none',
            lead_score: enrichRes.score,
            priority: enrichRes.score_priority,
            outreach,
            sources: fullLeadPayload.sources
          }

          let existingQuery = (adminDb as any)
            .from('leadgen_leads')
            .select('id')
            .eq('job_id', jobId)

          if (enrichRes.domain) {
            existingQuery = existingQuery.eq('domain', enrichRes.domain)
          } else {
            existingQuery = existingQuery.eq('company_name', enrichRes.company)
          }

          const { data: existing } = await existingQuery.maybeSingle()

          if (existing?.id) {
            await (adminDb as any)
              .from('leadgen_leads')
              .update(baseLeadPayload)
              .eq('id', existing.id)
          } else {
            const { error: insErr } = await (adminDb as any)
              .from('leadgen_leads')
              .insert(baseLeadPayload)
            if (!insErr) {
              leadsCount += 1
            }
          }
        } else {
          leadsCount += 1
        }
      }
    } else {
      // Legacy crawl mode
      let batchLimit = 2
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
          const domain = cleanDomain(result.finalUrl || targetUrl)
          const scoreOutput = computeLeadScore(contacts, icpText)

          const outreach = generateOutreachDraft({
            contacts,
            targetUrl: result.finalUrl || targetUrl,
            icpText,
            score: scoreOutput.score,
            outreachMinScore,
            enabled: Boolean(job.generate_outreach),
          })

          const crawlLeadPayload = {
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
            email_source: contacts.emails.length > 0 ? 'website' : 'none',
            phone_source: contacts.phones.length > 0 ? 'website' : 'none',
            lead_score: scoreOutput.score,
            priority: scoreOutput.priority,
            outreach,
            sources: {
              recipe_id: job.recipe_id,
              target_url: targetUrl,
              score_breakdown: scoreOutput.breakdown,
            }
          }

          const { error: crawlUpsertErr } = await (adminDb as any)
            .from('leadgen_leads')
            .upsert(crawlLeadPayload, { onConflict: 'job_id, domain' })

          if (crawlUpsertErr) {
            let existingQuery = (adminDb as any)
              .from('leadgen_leads')
              .select('id')
              .eq('job_id', jobId)

            if (domain) {
              existingQuery = existingQuery.eq('domain', domain)
            } else {
              existingQuery = existingQuery.eq('website', result.finalUrl || targetUrl)
            }

            const { data: existing } = await existingQuery.maybeSingle()

            if (existing?.id) {
              await (adminDb as any)
                .from('leadgen_leads')
                .update(crawlLeadPayload)
                .eq('id', existing.id)
            } else {
              const { error: insErr } = await (adminDb as any)
                .from('leadgen_leads')
                .insert(crawlLeadPayload)
              if (!insErr) {
                leadsCount += 1
              }
            }
          } else {
            leadsCount += 1
          }
        }
      }
    }

    // 4. Check if job is finished
    const isFinished = cursor.url_queue.length === 0 || leadsCount >= maxLeads
    const nowFinishedIso = new Date().toISOString()
    const elapsedMs = (Number(job.elapsed_ms) || 0) + (Date.now() - startTime)

    if (isFinished) {
      logs.push(`> export · completed · total_leads=${leadsCount} · elapsed_ms=${elapsedMs}`)

      await (adminDb as any)
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

    // 5. Release lease for next tick
    await (adminDb as any)
      .from('leadgen_jobs')
      .update({
        status: 'running',
        stage: 'fetch',
        stage_label: 'Enriching target domains',
        stage_index: 3,
        leads_count: leadsCount,
        pages_fetched: pagesFetched,
        pages_blocked: pagesBlocked,
        elapsed_ms: elapsedMs,
        lease_until: null,
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

    await (adminDb as any)
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
