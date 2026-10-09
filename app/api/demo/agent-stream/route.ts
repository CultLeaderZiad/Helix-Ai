import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    const { getVerifiedSession } = await import('@/lib/auth/session')
    const session = await getVerifiedSession(supabase)
    if (!session || !session.claims.client_id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { checkCapability } = await import('@/lib/auth/capabilities')
    const hasCapability = await checkCapability(session.claims.client_id, 'crm_core')
    if (!hasCapability) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const { checkRateLimit } = await import('@/lib/security/rate-limit')
    const rl = await checkRateLimit(session.claims.client_id)
    if (!rl.allowed) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }

    // Query recent automation events
    const { data: events } = await supabase
      .from('automation_events')
      .select('id, system_type, event_type, status, created_at, metadata')
      .eq('client_id', session.claims.client_id)
      .order('created_at', { ascending: false })
      .limit(15)

    return NextResponse.json({
      success: true,
      mode: 'live',
      events: events ?? [],
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to fetch stream telemetry',
      },
      { status: 500 }
    )
  }
}
