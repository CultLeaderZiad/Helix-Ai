import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400, headers })
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  let query = supabase
    .from('leadgen_leads')
    .select('*')
    .eq('job_id', id)
    .order('lead_score', { ascending: false })

  if (session.claims.role !== 'agency_admin' && session.claims.client_id) {
    query = query.eq('client_id', session.claims.client_id)
  }

  const { data: leads, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }

  const normalizedLeads = (leads ?? []).map((lead: any) => ({
    ...lead,
    description: lead.description || lead.sources?.description || lead.markdown_excerpt || null,
    city: lead.city || lead.sources?.city || null,
    country: lead.country || lead.sources?.country || null,
    people: lead.people || lead.sources?.people || lead.decision_makers || [],
    origin: lead.origin || lead.sources?.origin || 'crawl'
  }))

  return NextResponse.json({ leads: normalizedLeads }, { headers })
}
