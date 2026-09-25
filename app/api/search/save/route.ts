import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

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

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers })
  }

  const { request_id, result_ids = [] } = body
  if (!request_id || !Array.isArray(result_ids) || result_ids.length === 0) {
    return NextResponse.json({ error: 'request_id and result_ids array required' }, { status: 400, headers })
  }

  const clientId = session.claims.client_id
  const adminDb = createSupabaseAdminClient()

  // 1. Fetch targeted search_results
  const { data: results, error: fetchErr } = await (adminDb as any)
    .from('search_results')
    .select('*')
    .eq('request_id', request_id)
    .in('id', result_ids)

  if (fetchErr || !results || results.length === 0) {
    return NextResponse.json({ error: 'No matching search results found' }, { status: 404, headers })
  }

  // 2. Create a find_leads job to house saved leads
  const baseJobData: Record<string, any> = {
    client_id: clientId,
    user_id: session.user.id,
    status: 'succeeded',
    stage: 'export',
    stage_label: 'Saved from Search',
    stage_index: 8,
    brief: {
      icp: 'Saved from Search Console',
      geos: ['SA', 'AE', 'EG', 'JO'],
      languages: ['ar', 'en'],
      max_pages: results.length * 4,
      max_leads: results.length,
      credit_budget: results.length,
      outreach_min_score: 50,
      job_kind: 'find'
    },
    seeds: {
      urls: results.map((r: any) => r.url).filter(Boolean)
    },
    engine_default: 'auto',
    mode: 'crawl',
    recipe_id: 'mena-construction-contact',
    robots_obey: true,
    adaptive: true,
    enrich_emails: true,
    generate_outreach: false,
    leads_count: results.length
  }

  let { data: job, error: jobErr } = await (adminDb as any)
    .from('leadgen_jobs')
    .insert({ ...baseJobData, job_kind: 'find' })
    .select('id')
    .single()

  if (jobErr && (jobErr.message?.includes('job_kind') || jobErr.code === 'PGRST204')) {
    const fallbackRes = await (adminDb as any)
      .from('leadgen_jobs')
      .insert(baseJobData)
      .select('id')
      .single()
    job = fallbackRes.data
    jobErr = fallbackRes.error
  }

  const savedLeadIds: string[] = []

  // 3. Save each result as a leadgen_leads row
  for (const item of results) {
    const payload = item.payload || {}
    let { data: leadRow, error: leadErr } = await (adminDb as any)
      .from('leadgen_leads')
      .insert({
        job_id: job?.id || null,
        client_id: clientId,
        company_name: item.title,
        website: item.url,
        domain: item.domain,
        address: payload.address || null,
        city: payload.city || null,
        country: payload.country || null,
        geo_source: item.place_provider || 'none',
        place_id: item.place_id,
        place_provider: item.place_provider,
        origin: 'search_save',
        phones: payload.phone ? [payload.phone] : [],
        socials: {},
        extract_status: item.url ? 'ok' : 'partial',
        fetch_status: 'ok',
        engine_used: 'builtin',
        email_source: 'none',
        phone_source: payload.phone ? (item.place_provider || 'website') : 'none',
        lead_score: 25,
        priority: 'low',
        sources: {
          search_result_id: item.id,
          sources: item.sources,
          city: payload.city || null,
          country: payload.country || null,
          place_id: item.place_id,
          place_provider: item.place_provider,
          origin: 'search_save'
        }
      })
      .select('id')
      .single()

    if (leadErr && (leadErr.message?.includes('column') || leadErr.code === 'PGRST204')) {
      const fallbackLead = await (adminDb as any)
        .from('leadgen_leads')
        .insert({
          job_id: job?.id || null,
          client_id: clientId,
          company_name: item.title,
          website: item.url,
          domain: item.domain,
          address: payload.address || null,
          phones: payload.phone ? [payload.phone] : [],
          socials: {},
          decision_makers: [],
          markdown_excerpt: item.snippet || item.title || '',
          extract_status: item.url ? 'ok' : 'partial',
          fetch_status: 'ok',
          engine_used: 'builtin',
          email_source: 'none',
          phone_source: payload.phone ? 'website' : 'none',
          lead_score: 25,
          priority: 'low',
          sources: {
            search_result_id: item.id,
            sources: item.sources,
            city: payload.city || null,
            country: payload.country || null,
            place_id: item.place_id,
            place_provider: item.place_provider,
            origin: 'search_save'
          }
        })
        .select('id')
        .single()
      leadRow = fallbackLead.data
      leadErr = fallbackLead.error
    }

    if (!leadErr && leadRow) {
      savedLeadIds.push(leadRow.id)
      // Link search_results.saved_lead_id
      await (adminDb as any)
        .from('search_results')
        .update({ saved_lead_id: leadRow.id })
        .eq('id', item.id)
        .catch(() => {})
    }
  }

  return NextResponse.json({
    ok: true,
    saved_count: savedLeadIds.length,
    job_id: job?.id,
    saved_lead_ids: savedLeadIds
  }, { headers })
}
