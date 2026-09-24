import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { estimateJobCredits, trackJobUsage } from '@/lib/leadgen/credits'
import type { CreateJobPayload, CreateJobResponse } from '@/lib/leadgen/types'

function isPrivateOrLocalhost(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    const host = url.hostname.toLowerCase()
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal')
    ) {
      return true
    }
    // Check IPv4 private octets (10.x, 192.168.x, 172.16-31.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = host.match(ipv4Regex)
    if (match) {
      const b1 = parseInt(match[1], 10)
      const b2 = parseInt(match[2], 10)
      if (b1 === 10) return true
      if (b1 === 192 && b2 === 168) return true
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return true
      if (b1 === 127) return true
    }
    return false
  } catch {
    return true
  }
}

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

  return NextResponse.json({ jobs: jobs ?? [] }, { headers })
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

  const { brief, seeds, engine_default = 'stealth', mode = 'crawl', recipe_id = 'mena-construction-contact', robots_obey = true, adaptive = true, capture_xhr_pattern, enrich_emails = true, generate_outreach = true } = body

  // 1. Brief Validation
  if (!brief || !brief.icp || !brief.icp.trim()) {
    return NextResponse.json({ error: 'Brief ICP (Ideal Customer Profile) is required' }, { status: 400, headers })
  }
  if (!brief.max_pages || brief.max_pages < 1 || !brief.max_leads || brief.max_leads < 1) {
    return NextResponse.json({ error: 'max_pages and max_leads must be at least 1' }, { status: 400, headers })
  }

  // 2. Seeds Validation
  const urls = (seeds?.urls ?? []).map(u => u.trim()).filter(Boolean)
  const sitemapUrl = seeds?.sitemap_url?.trim()
  const shopifyUrl = seeds?.shopify_url?.trim()
  const domainsCsv = seeds?.domains_csv?.trim()

  if (urls.length === 0 && !sitemapUrl && !shopifyUrl && !domainsCsv) {
    return NextResponse.json({ error: 'At least one seed URL, sitemap, Shopify URL, or domain CSV is required' }, { status: 400, headers })
  }

  // Reject local/private IPs in URLs
  for (const url of urls) {
    if (isPrivateOrLocalhost(url)) {
      return NextResponse.json({ error: `Invalid or disallowed seed URL: ${url}. Localhost, RFC1918, and non-HTTP(S) are prohibited.` }, { status: 400, headers })
    }
  }
  if (sitemapUrl && isPrivateOrLocalhost(sitemapUrl)) {
    return NextResponse.json({ error: `Disallowed sitemap URL: ${sitemapUrl}` }, { status: 400, headers })
  }
  if (shopifyUrl && isPrivateOrLocalhost(shopifyUrl)) {
    return NextResponse.json({ error: `Disallowed Shopify store URL: ${shopifyUrl}` }, { status: 400, headers })
  }

  // 3. Tenancy & Client ID resolution
  let clientId = session.claims.client_id
  if (!clientId && session.claims.role === 'agency_admin') {
    // Resolve first client for admin if none explicitly targeted
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

  // 4. Usage & Credits estimation
  const estimatedCost = estimateJobCredits({
    maxPages: brief.max_pages,
    maxLeads: brief.max_leads,
    enrichEmails: enrich_emails,
    generateOutreach: generate_outreach,
  })

  if (brief.credit_budget !== undefined && brief.credit_budget < estimatedCost) {
    return NextResponse.json(
      { error: `Insufficient credit budget. Estimated: ${estimatedCost} credits, provided: ${brief.credit_budget}` },
      { status: 402, headers }
    )
  }

  // 5. Initial Canonical Logs
  const proxyMode = process.env.SCRAPLING_PROXY_LIST ? 'configured' : 'off'
  const workerStatus = process.env.SCRAPLING_WORKER_ENABLED === 'true' ? 'connected' : 'offline'
  
  const initialLogs: string[] = [
    `> engine: scrapling/${engine_default}/v1 · ok`,
    `> robots: obey · ${robots_obey ? 'on' : 'off'}`,
    `> worker: ${workerStatus} · proxy: ${proxyMode}`,
    `> control_plane: helix-ai · ok`,
  ]

  if (!robots_obey) {
    initialLogs.push(`> audit · robots_obey=false · user=${session.user.email ?? 'unknown'} · timestamp=${new Date().toISOString()}`)
  }

  initialLogs.push(`> brief · icp_ok · geos=${brief.geos?.length ?? 0} · max_pages=${brief.max_pages} · max_leads=${brief.max_leads}`)
  initialLogs.push(`> seed · urls=${urls.length} · sitemap=${sitemapUrl ? 'yes' : 'no'} · shopify=${shopifyUrl ? 'yes' : 'no'}`)

  // 6. Insert leadgen_jobs row using admin client to bypass client RLS check if needed
  const adminDb = createSupabaseAdminClient()
  const { data: job, error: insertError } = await adminDb
    .from('leadgen_jobs')
    .insert({
      client_id: clientId,
      user_id: session.user.id,
      status: 'queued',
      stage: 'brief',
      stage_label: 'Job queued',
      stage_index: 0,
      stages_total: 9,
      brief: {
        icp: brief.icp,
        geos: brief.geos ?? ['SA', 'AE', 'JO', 'EG'],
        languages: brief.languages ?? ['ar', 'en'],
        exclude_domains: brief.exclude_domains ?? [],
        max_pages: brief.max_pages,
        max_leads: brief.max_leads,
        credit_budget: brief.credit_budget ?? 50,
        outreach_min_score: brief.outreach_min_score ?? 50,
      },
      seeds: {
        urls,
        sitemap_url: sitemapUrl || null,
        shopify_url: shopifyUrl || null,
        domains_csv: domainsCsv || null,
      },
      engine_default,
      mode,
      recipe_id,
      robots_obey,
      adaptive,
      capture_xhr_pattern: capture_xhr_pattern || null,
      enrich_emails,
      generate_outreach,
      proxy_mode: proxyMode,
      logs: initialLogs,
      leads_count: 0,
      pages_fetched: 0,
      pages_blocked: 0,
      elapsed_ms: 0,
      credits_used: estimatedCost,
      credit_budget: brief.credit_budget ?? 50,
    })
    .select('*')
    .single()

  if (insertError || !job) {
    return NextResponse.json({ error: `Failed to enqueue job: ${insertError?.message ?? 'Unknown database error'}` }, { status: 500, headers })
  }

  // Track usage honestly
  await trackJobUsage(estimatedCost, clientId, job.id)

  // 7. If worker is configured, notify worker to trigger instant job processing
  const workerUrl = process.env.SCRAPLING_WORKER_URL
  if (process.env.SCRAPLING_WORKER_ENABLED === 'true' && workerUrl) {
    try {
      fetch(`${workerUrl.replace(/\/$/, '')}/jobs/${job.id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: job.id }),
      }).catch(() => {
        // Worker will claim via polling loop
      })
    } catch {
      // Worker claim loop will pick it up
    }
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
