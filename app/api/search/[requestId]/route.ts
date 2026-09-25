import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const { requestId } = await params
  if (!requestId) {
    return NextResponse.json({ error: 'Request ID is required' }, { status: 400, headers })
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  const clientId = session.claims.client_id

  // Fetch search request
  let reqQuery = supabase.from('search_requests').select('*').eq('id', requestId).single()
  if (session.claims.role !== 'agency_admin' && clientId) {
    reqQuery = supabase.from('search_requests').select('*').eq('id', requestId).eq('client_id', clientId).single()
  }

  const { data: searchReq, error: reqErr } = await reqQuery
  if (reqErr || !searchReq) {
    return NextResponse.json({ error: 'Search request not found' }, { status: 404, headers })
  }

  // Fetch results and events
  const [resultsRes, eventsRes] = await Promise.all([
    supabase.from('search_results').select('*').eq('request_id', requestId).order('rank', { ascending: true }),
    supabase.from('search_events').select('*').eq('request_id', requestId).order('created_at', { ascending: true })
  ])

  return NextResponse.json({
    request: searchReq,
    results: resultsRes.data || [],
    events: eventsRes.data || []
  }, { headers })
}
