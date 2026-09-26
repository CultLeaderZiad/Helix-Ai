import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })

  const clientId = session.claims.client_id
  let query = supabase.from('search_watches').select('*').order('created_at', { ascending: false })

  if (session.claims.role !== 'agency_admin' && clientId) {
    query = query.eq('client_id', clientId)
  }

  const { data: watches, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers })
  return NextResponse.json({ watches: watches || [] }, { headers })
}

export async function POST(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })

  const clientId = session.claims.client_id
  if (!clientId) return NextResponse.json({ error: 'Client workspace required' }, { status: 400, headers })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers })
  }

  const { name, query, kind = 'search_web', cadence = 'daily', params = {} } = body
  if (!name || !query) {
    return NextResponse.json({ error: 'name and query are required' }, { status: 400, headers })
  }

  // Enforce max 10 watches per client
  const { count } = await supabase
    .from('search_watches')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', clientId)

  if ((count ?? 0) >= 10) {
    return NextResponse.json({ error: 'Maximum limit of 10 watches per client reached' }, { status: 400, headers })
  }

  const { data: watch, error: insertErr } = await supabase
    .from('search_watches')
    .insert({
      client_id: clientId,
      user_id: session.user.id,
      name,
      query,
      kind,
      cadence,
      params,
      active: true
    })
    .select('*')
    .single()

  if (insertErr || !watch) {
    return NextResponse.json({ error: insertErr?.message || 'Failed to create watch' }, { status: 500, headers })
  }

  return NextResponse.json({ ok: true, watch }, { status: 201, headers })
}
