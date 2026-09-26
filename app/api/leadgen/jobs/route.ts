import { NextRequest, NextResponse } from 'next/server'
import { after } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { estimateJobCredits, trackJobUsage } from '@/lib/leadgen/credits'
import { isPrivateOrLocalhost, cleanDomain } from '@/lib/leadgen/ssrf'
import { executeJobTick } from '@/lib/leadgen/pipeline/tick'
import { findLeadsPipeline } from '@/lib/search/find-leads'
import type { CreateJobPayload, CreateJobResponse } from '@/lib/leadgen/types'

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  const { searchParams } = new URL(request.url)
  let clientId = session.claims.client_id

  if (session.claims.role === 'agency_admin') {
    const override = searchParams.get('client_id')
    if (override) clientId = override
  }

  let query = supabase
    .from('leadgen_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data: jobs, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }

  const resolvedJobs = (jobs ?? []).map((j: any) => ({
    ...j,
    job_kind: j.job_kind || j.brief?.job_kind || 'crawl'
  }))

  return NextResponse.json({ jobs: resolvedJobs }, { headers })
}

export async function POST(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  let body: CreateJobPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers })
  }

  const {
    brief,
    seeds,
    engine_default = 'auto',
    mode = 'crawl',
    recipe_id = 'mena-construction-contact',
    robots_obey = true,
    adaptive = true,
    capture_xhr_pattern,
    enrich_emails = true,
    generate_outreach = false,
    job_kind = 'crawl',
    find,
    hunter
  } = body

  // Tenancy & Client ID resolution
  let clientId = session.claims.client_id
  if (!clientId && session.claims.role === 'agency_admin') {
    const { data: firstClient } = await supabase
      .from('clients')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()
    if (firstClient?.id) clientId = firstClient.id
  }

  if (!clientId) {
    return NextResponse.json({ error: 'Client workspace not identified for job creation' }, { status: 400, headers })
  }

  let initialSeedUrls: string[] = []
  let placeBusinesses: any[] = []

  // 1. Mode Dispatch & Seeds Preparation
  if (job_kind === 'find') {
    if (!find?.query || !find.query.trim()) {
      return NextResponse.json({ error: 'Find query is required for find_leads mode' }, { status: 400, headers })
    }

    // Run Find Leads synchronously to discover seed places/websites
    const findRes = await findLeadsPipeline({
      query: find.query,
      limit: find.limit || 20,
      radiusM: find.radius_m || 50000,
      ctx: { clientId, userId: session.user.id }
    })

    initialSeedUrls = findRes.websitesToEnrich
    placeBusinesses = findRes.hits
  } else if (job_kind === 'enrich') {
    const rawSeeds = (seeds?.urls ?? []).map(u => u.trim()).filter(Boolean)
    if (rawSeeds.length === 0 && !seeds?.domains_csv) {
      return NextResponse.json({ error: 'At least one URL or domain is required for enrichment' }, { status: 400, headers })
    }

    // SSRF & Domain deduplication
    const seenDomains = new Set<string>()
    for (const raw of rawSeeds) {
      let url = raw
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`
      }
      if (isPrivateOrLocalhost(url)) {
        return NextResponse.json({ error: `Disallowed or private URL: ${raw}` }, { status: 400, headers })
      }
      const dom = cleanDomain(url)
      if (dom && !seenDomains.has(dom)) {
        seenDomains.add(dom)
        initialSeedUrls.push(url)
      }
    }
  } else {
    // Legacy crawl validation
    if (!brief || !brief.icp || !brief.icp.trim()) {
      return NextResponse.json({ error: 'Brief ICP is required' }, { status: 400, headers })
    }
    initialSeedUrls = (seeds?.urls ?? []).map(u => u.trim()).filter(Boolean)
    for (const url of initialSeedUrls) {
      if (isPrivateOrLocalhost(url)) {
        return NextResponse.json({ error: `Disallowed seed URL: ${url}` }, { status: 400, headers })
      }
    }
  }

  const maxPages = brief?.max_pages || (job_kind === 'enrich' ? initialSeedUrls.length * 4 : 80)
  const maxLeads = brief?.max_leads || (job_kind === 'enrich' ? initialSeedUrls.length : 20)

  // Usage & Credits estimation
  const estimatedCost = estimateJobCredits({
    maxPages,
    maxLeads,
    enrichEmails: enrich_emails,
    generateOutreach: generate_outreach,
  })

  const adminDb = createSupabaseAdminClient()
  const initialLogs: string[] = [
    `> engine: builtin/${engine_default}/v2 · ok`,
    `> mode: ${job_kind} · robots_obey=${robots_obey ? 'on' : 'off'}`,
    `> control_plane: helix-ai · ok`,
    `> brief · targets=${initialSeedUrls.length} · max_leads=${maxLeads}`
  ]

  const baseJobData: Record<string, any> = {
    client_id: clientId,
    user_id: session.user.id,
    status: 'queued',
    stage: 'brief',
    stage_label: 'Job queued',
    stage_index: 0,
    stages_total: 9,
    brief: {
      icp: brief?.icp || find?.query || 'General business enrichment',
      geos: brief?.geos ?? ['SA', 'AE', 'JO', 'EG'],
      languages: brief?.languages ?? ['ar', 'en'],
      exclude_domains: brief?.exclude_domains ?? [],
      max_pages: maxPages,
      max_leads: maxLeads,
      credit_budget: brief?.credit_budget ?? 50,
      outreach_min_score: brief?.outreach_min_score ?? 50,
      hunter: hunter || undefined,
      job_kind,
    },
    seeds: {
      urls: initialSeedUrls,
      sitemap_url: seeds?.sitemap_url || null,
      shopify_url: seeds?.shopify_url || null,
      domains_csv: seeds?.domains_csv || null,
    },
    engine_default,
    mode: 'crawl',
    recipe_id,
    robots_obey,
    adaptive,
    capture_xhr_pattern: capture_xhr_pattern || null,
    enrich_emails,
    generate_outreach,
    proxy_mode: 'off',
    logs: initialLogs,
    leads_count: 0,
    pages_fetched: 0,
    pages_blocked: 0,
    elapsed_ms: 0,
    credits_used: estimatedCost,
    credit_budget: brief?.credit_budget ?? 50,
  }

  // Attempt insert with job_kind column
  let { data: job, error: insertError } = await (adminDb as any)
    .from('leadgen_jobs')
    .insert({
      ...baseJobData,
      job_kind,
    })
    .select('*')
    .single()

  // Fallback if job_kind column is not in schema cache (PGRST204)
  if (insertError && (insertError.message?.includes('job_kind') || insertError.code === 'PGRST204')) {
    const fallbackRes = await (adminDb as any)
      .from('leadgen_jobs')
      .insert(baseJobData)
      .select('*')
      .single()

    job = fallbackRes.data
    insertError = fallbackRes.error
  }

  if (insertError || !job) {
    return NextResponse.json({ error: `Failed to enqueue job: ${insertError?.message}` }, { status: 500, headers })
  }

  // Pre-seed any Place hits without a website directly into leadgen_leads
  if (placeBusinesses.length > 0) {
    for (const hit of placeBusinesses) {
      if (!hit.website) {
        const fullPlacePayload: Record<string, any> = {
          job_id: job.id,
          client_id: clientId,
          company_name: hit.name,
          website: hit.maps_url || null,
          domain: null,
          address: hit.address || null,
          city: hit.city || null,
          country: hit.country || null,
          geo_source: hit.provider,
          place_id: hit.provider_place_id,
          place_provider: hit.provider,
          origin: 'find_leads',
          phones: hit.phone ? [hit.phone] : [],
          socials: {},
          extract_status: 'partial',
          fetch_status: 'ok',
          engine_used: 'builtin',
          email_source: 'none',
          phone_source: hit.phone ? hit.provider : 'none',
          lead_score: 25,
          priority: 'low',
          sources: { place_hit: hit, city: hit.city, country: hit.country, origin: 'find_leads' }
        }

        const { error: seedErr } = await (adminDb as any)
          .from('leadgen_leads')
          .insert(fullPlacePayload)

        if (seedErr && (seedErr.message?.includes('column') || seedErr.code === 'PGRST204')) {
          await (adminDb as any)
            .from('leadgen_leads')
            .insert({
              job_id: job.id,
              client_id: clientId,
              company_name: hit.name,
              website: hit.maps_url || null,
              domain: null,
              address: hit.address || null,
              phones: hit.phone ? [hit.phone] : [],
              socials: {},
              decision_makers: [],
              markdown_excerpt: hit.name,
              extract_status: 'partial',
              fetch_status: 'ok',
              engine_used: 'builtin',
              email_source: 'none',
              phone_source: hit.phone ? 'website' : 'none',
              lead_score: 25,
              priority: 'low',
              sources: { place_hit: hit, city: hit.city, country: hit.country, place_id: hit.provider_place_id, place_provider: hit.provider, origin: 'find_leads' }
            })
            .catch(() => {})
        }
      }
    }
  }

  await trackJobUsage(estimatedCost, clientId, job.id)

  // Asynchronous tick kickoff
  try {
    after(async () => {
      try {
        await executeJobTick(job.id)
      } catch (err) {
        console.error('[leadgen/jobs] Initial tick error:', err)
      }
    })
  } catch (err) {
    console.warn('[leadgen/jobs] after() not available; client will tick on mount:', err)
  }

  const responsePayload: CreateJobResponse = {
    job_id: job.id,
    status: job.status,
    stage: job.stage,
    stage_label: job.stage_label,
    stage_index: job.stage_index,
    stages_total: job.stages_total,
    credits_used: estimatedCost,
    created_at: job.created_at,
  }

  return NextResponse.json(responsePayload, { status: 201, headers })
}
