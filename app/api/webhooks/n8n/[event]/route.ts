import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { signHelixPayload } from '@/lib/webhooks/egress'

async function verifyTenantAuth(
  req: NextRequest,
  rawBody: string,
  tenantId?: string
): Promise<boolean> {
  const globalSecret = process.env.HELIX_WEBHOOK_SECRET?.trim()
  const allowedSecrets = globalSecret ? [globalSecret] : []

  // If tenant ID is known, lookup tenant's ingress webhook secret
  if (tenantId) {
    try {
      const supabase = createSupabaseAdminClient()
      const { data: webhook } = await supabase
        .from('system_webhooks')
        .select('secret_ciphertext, secret_hash')
        .eq('client_id', tenantId)
        .eq('direction', 'n8n_to_helix')
        .maybeSingle()

      if (webhook) {
        if (webhook.secret_ciphertext) allowedSecrets.push(webhook.secret_ciphertext)
        if (webhook.secret_hash && webhook.secret_hash !== webhook.secret_ciphertext) {
          allowedSecrets.push(webhook.secret_hash)
        }
      }
    } catch {
      // Fallback to global secret
    }
  }

  // 1. Check Bearer Token
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim()
    if (allowedSecrets.includes(token)) return true
  }

  // 2. Check HMAC Signature
  const signature = req.headers.get('x-helix-signature')
  const timestamp = req.headers.get('x-helix-timestamp')
  if (signature && timestamp) {
    const ts = parseInt(timestamp, 10)
    for (const sec of allowedSecrets) {
      const expectedSig = signHelixPayload(sec, rawBody, ts)
      if (
        signature.length === expectedSig.length &&
        crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
      ) {
        return true
      }
    }
  }

  return false
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ event: string }> }
) {
  const { event } = await context.params
  const rawBody = await req.text()

  let payload: any = {}
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 })
  }

  const tenantId =
    req.headers.get('x-helix-tenant') ||
    payload.tenant_id ||
    payload.client_id

  const isAuthed = await verifyTenantAuth(req, rawBody, tenantId)
  if (!isAuthed) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid Bearer token or HMAC signature' },
      { status: 401 }
    )
  }

  const data = payload.data || payload
  const normalizedEvent = event.toLowerCase()

  try {
    const supabase = createSupabaseAdminClient()

    switch (normalizedEvent) {
      case 'contact':
      case 'contact.upsert': {
        if (tenantId && data.phone) {
          const existing = await supabase
            .from('contacts')
            .select('id')
            .eq('client_id', tenantId)
            .eq('phone', data.phone)
            .maybeSingle()
          const row = {
            client_id: tenantId,
            phone: data.phone,
            full_name: data.full_name || data.name || null,
            email: data.email || null,
            lead_status: 'warm',
            source: 'n8n',
            updated_at: new Date().toISOString(),
          }
          const write = existing.data
            ? await supabase.from('contacts').update(row).eq('id', existing.data.id)
            : await supabase.from('contacts').insert(row)
          if (write.error) {
            return NextResponse.json({ error: write.error.message }, { status: 500 })
          }
        }
        break
      }

      case 'booking':
      case 'booking.upsert': {
        if (tenantId) {
          await supabase.from('activity_log').insert({
            client_id: tenantId,
            event_type: 'booking_created',
            title: `Booking: ${data.name || data.contact_name || 'New Appointment'}`,
            description: `Scheduled at ${data.scheduled_at || data.slot_start || new Date().toISOString()}`,
            metadata: data,
          })
        }
        break
      }

      case 'attribution':
      case 'attribution.record': {
        if (tenantId) {
          await supabase.from('activity_log').insert({
            client_id: tenantId,
            event_type: 'ad_attribution',
            title: `Attribution: ${data.campaign || 'Campaign Lead'}`,
            description: `Lead attributed via ${data.channel || 'WhatsApp/Ad'}`,
            metadata: data,
          })
        }
        break
      }

      case 'fact':
      case 'fact.observe': {
        // Human-in-the-loop truth engine with evidence band
        if (tenantId && data.contact_id && (data.field_name || data.fact_key)) {
          const fieldName = (data.field_name || data.fact_key || 'note').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 63)
          const fieldValue = String(data.field_value || data.fact_text || data.value || '').slice(0, 10000)
          const band = ['verified', 'probable', 'possible'].includes(data.evidence_band)
            ? data.evidence_band
            : 'probable'

          await supabase.from('contact_facts').insert({
            client_id: tenantId,
            contact_id: data.contact_id,
            field_name: fieldName,
            field_value: fieldValue,
            evidence_band: band,
            source_tool: data.source_tool || 'n8n_webhook',
            status: 'pending',
            score: typeof data.score === 'number' ? data.score : null,
            method: data.method || 'webhook_assertion',
            evidence: Array.isArray(data.evidence) ? data.evidence : [{ raw: data }],
            observed_at: new Date().toISOString(),
          })
        }
        break
      }

      case 'attention':
      case 'attention.enqueue': {
        if (tenantId) {
          await supabase.from('activity_log').insert({
            client_id: tenantId,
            event_type: 'human_handoff_requested',
            title: `Attention Required: ${data.reason || 'Client Human Handoff'}`,
            description: data.summary || 'Immediate human assistance required',
            metadata: { ...data, priority: 'urgent' },
          })
        }
        break
      }

      case 'invoice':
      case 'invoice.update': {
        if (tenantId) {
          await supabase.from('activity_log').insert({
            client_id: tenantId,
            event_type: 'invoice_status_changed',
            title: `Invoice ${data.invoice_id || 'Update'}: ${data.status || 'Updated'}`,
            description: `B2B collection event recorded via payment rail`,
            metadata: data,
          })
        }
        break
      }

      case 'system.health': {
        if (tenantId && data.system_type) {
          await supabase
            .from('system_webhooks')
            .update({
              last_ping_at: new Date().toISOString(),
              last_status: data.status === 'ok' ? 'ok' : 'failed',
              last_error: data.error || null,
              updated_at: new Date().toISOString(),
            })
            .eq('client_id', tenantId)
            .eq('system_type', data.system_type)
        }
        break
      }

      default:
        return NextResponse.json({ error: `Unsupported event: ${event}` }, { status: 400 })
    }

    return NextResponse.json({
      received: true,
      event: normalizedEvent,
      tenant_id: tenantId || null,
      processed_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 })
  }
}
