import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { runAction } from '@/lib/search/bus'

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

  const { url, hunter = false } = body
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'Target URL is required' }, { status: 400, headers })
  }

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
    return NextResponse.json({ error: 'Client workspace not identified' }, { status: 400, headers })
  }

  const res = await runAction({
    kind: 'enrich_url',
    origin: 'search_page',
    actor: {
      type: 'session',
      userId: session.user.id,
      clientId
    },
    input: {
      url,
      params: { hunter: { enabled: hunter } }
    }
  })

  return NextResponse.json(res, { status: res.ok ? 200 : 500, headers })
}
