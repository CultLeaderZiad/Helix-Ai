import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { pingWebhookEndpoint } from '@/lib/webhooks/egress'

export async function POST(request: NextRequest) {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
    }
    if (session.claims.role !== 'agency_admin') {
      return NextResponse.json({ error: 'Access denied. Agency admin only.' }, { status: 403, headers })
    }

    const body = await request.json()
    let webhookId = body.webhook_id

    // If client_id + system_type + direction is provided instead of webhook_id
    if (!webhookId && body.client_id && body.system_type) {
      const direction = body.direction || 'helix_to_n8n'
      const { data: found } = await supabase
        .from('system_webhooks')
        .select('id')
        .eq('client_id', body.client_id)
        .eq('system_type', body.system_type)
        .eq('direction', direction)
        .maybeSingle()

      if (found) {
        webhookId = found.id
      }
    }

    if (!webhookId) {
      return NextResponse.json({ error: 'webhook_id or (client_id, system_type) is required' }, { status: 400, headers })
    }

    const pingResult = await pingWebhookEndpoint(webhookId, supabase)

    return NextResponse.json({
      ok: pingResult.success,
      status: pingResult.success ? 'ok' : 'failed',
      latency_ms: pingResult.latencyMs ?? 0,
      error: pingResult.error,
      timestamp: new Date().toISOString(),
    }, { headers })
  } catch (err: any) {
    return NextResponse.json({
      ok: false,
      status: 'failed',
      error: err.message || 'Ping failed',
    }, { status: 500, headers })
  }
}
