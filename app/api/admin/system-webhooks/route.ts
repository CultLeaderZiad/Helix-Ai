import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import type { SystemType, WebhookDirection } from '@/lib/schema'

const VALID_SYSTEM_TYPES: SystemType[] = [
  'missed_call_response',
  'booking_receptionist',
  'lead_attribution',
  'lead_reactivation',
  'ar_collections',
  'rival_watch',
  'handbook_bot',
  'seo_scorecard',
  'deck_factory',
  'shorts_factory',
  'lead_generation',
]

const VALID_DIRECTIONS: WebhookDirection[] = ['helix_to_n8n', 'n8n_to_helix']

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('client_id')
    if (!clientId) {
      return NextResponse.json({ error: 'Missing client_id parameter' }, { status: 400, headers })
    }

    const { data: webhooks, error } = await supabase
      .from('system_webhooks')
      .select('id, client_id, system_type, direction, label, webhook_url, enabled, last_ping_at, last_status, last_error, created_at, updated_at, secret_ciphertext, secret_hash')
      .eq('client_id', clientId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    // Mask secrets before sending to client
    const sanitized = (webhooks || []).map(w => {
      const hasSecret = Boolean(w.secret_ciphertext || w.secret_hash)
      return {
        id: w.id,
        client_id: w.client_id,
        system_type: w.system_type,
        direction: w.direction,
        label: w.label,
        webhook_url: w.webhook_url,
        enabled: w.enabled,
        last_ping_at: w.last_ping_at,
        last_status: w.last_status,
        last_error: w.last_error,
        created_at: w.created_at,
        updated_at: w.updated_at,
        has_secret: hasSecret,
        secret_masked: hasSecret ? '••••••••••••' : null,
      }
    })

    return NextResponse.json({ webhooks: sanitized }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500, headers })
  }
}

export async function PUT(request: NextRequest) {
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
    const {
      client_id,
      system_type,
      direction = 'helix_to_n8n',
      webhook_url,
      secret,
      enabled = true,
      label,
    } = body

    if (!client_id) {
      return NextResponse.json({ error: 'client_id is required' }, { status: 400, headers })
    }

    if (!VALID_SYSTEM_TYPES.includes(system_type)) {
      return NextResponse.json({ error: `Invalid system_type: ${system_type}` }, { status: 400, headers })
    }

    if (!VALID_DIRECTIONS.includes(direction)) {
      return NextResponse.json({ error: `Invalid direction: ${direction}` }, { status: 400, headers })
    }

    if (!webhook_url || typeof webhook_url !== 'string') {
      return NextResponse.json({ error: 'webhook_url is required' }, { status: 400, headers })
    }

    // Strictly validate HTTPS protocol
    if (!/^https:\/\//i.test(webhook_url.trim())) {
      return NextResponse.json({ error: 'Production webhook URL must use secure HTTPS (https://...)' }, { status: 400, headers })
    }

    const trimmedUrl = webhook_url.trim()
    const trimmedLabel = label ? String(label).trim() : null

    // Prepare upsert payload
    const upsertData: Record<string, unknown> = {
      client_id,
      system_type,
      direction,
      webhook_url: trimmedUrl,
      label: trimmedLabel,
      enabled: Boolean(enabled),
      updated_at: new Date().toISOString(),
    }

    // Only update secret if provided
    if (secret && typeof secret === 'string' && secret.trim().length > 0) {
      const cleanSecret = secret.trim()
      upsertData.secret_ciphertext = cleanSecret
      upsertData.secret_hash = cleanSecret
    }

    const { data: saved, error } = await supabase
      .from('system_webhooks')
      .upsert(upsertData, { onConflict: 'client_id, system_type, direction' })
      .select('id, client_id, system_type, direction, label, webhook_url, enabled, last_ping_at, last_status, last_error, created_at, updated_at')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500, headers })
    }

    return NextResponse.json({
      success: true,
      webhook: saved,
      message: 'Webhook configuration saved and applied immediately.',
    }, { headers })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500, headers })
  }
}
