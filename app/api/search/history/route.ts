import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

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

  const clientId = session.claims.client_id
  let query = supabase
    .from('search_requests')
    .select('id, kind, origin, query, status, providers_used, results_count, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(20)

  if (session.claims.role !== 'agency_admin' && clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data: requests, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers })
  }

  return NextResponse.json({ requests: requests || [] }, { headers })
}
