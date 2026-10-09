import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { verifyIngressAuth } from '@/lib/webhooks/ingress-auth'
import { recordContactFact } from '@/lib/crm/facts'

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

  const authResult = await verifyIngressAuth(req, rawBody)
  if (!authResult.authorized || !authResult.clientId) {
    return NextResponse.json(
      { error: authResult.error || 'Unauthorized' },
      { status: 401 }
    )
  }

  const tenantId = authResult.clientId
  const systemType = authResult.systemType || 'n8n_webhook'
  const data = payload.data || payload
  const normalizedEvent = event.toLowerCase()

  try {
    const supabase = createSupabaseAdminClient()

    switch (normalizedEvent) {
      case 'contact':
      case 'contact.upsert': {
        if (data.phone) {
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
        await supabase.from('activity_log').insert({
          client_id: tenantId,
          event_type: 'booking_created',
          title: `Booking: ${data.name || data.contact_name || 'New Appointment'}`,
          description: `Scheduled at ${data.scheduled_at || data.slot_start || new Date().toISOString()}`,
          metadata: data,
        })
        break
      }

      case 'attribution':
      case 'attribution.record': {
        await supabase.from('activity_log').insert({
          client_id: tenantId,
          event_type: 'ad_attribution',
          title: `Attribution: ${data.campaign || 'Campaign Lead'}`,
          description: `Lead attributed via ${data.channel || 'WhatsApp/Ad'}`,
          metadata: data,
        })
        break
      }

      case 'fact':
      case 'fact.observe': {
        if (data.contact_id && (data.field_name || data.fact_key)) {
          const fieldName = (data.field_name || data.fact_key || 'note').toLowerCase().replace(/[^a-z0-9_]/g, '_').slice(0, 63)
          const fieldValue = String(data.field_value || data.fact_text || data.value || '').slice(0, 10000)

          await recordContactFact(supabase, {
            client_id: tenantId,
            contact_id: data.contact_id,
            field_name: fieldName,
            field_value: fieldValue,
            source_tool: systemType,
            evidence: Array.isArray(data.evidence) ? data.evidence : [{ raw: data }],
            method: data.method || 'webhook_assertion',
            score: typeof data.score === 'number' ? data.score : null
          })
        }
        break
      }

      case 'attention':
      case 'attention.enqueue': {
        await supabase.from('activity_log').insert({
          client_id: tenantId,
          event_type: 'human_handoff_requested',
          title: `Attention Required: ${data.reason || 'Client Human Handoff'}`,
          description: data.summary || 'Immediate human assistance required',
          metadata: { ...data, priority: 'urgent' },
        })
        break
      }

      case 'invoice':
      case 'invoice.update': {
        await supabase.from('activity_log').insert({
          client_id: tenantId,
          event_type: 'invoice_status_changed',
          title: `Invoice ${data.invoice_id || 'Update'}: ${data.status || 'Updated'}`,
          description: `B2B collection event recorded via payment rail`,
          metadata: data,
        })
        break
      }

      case 'system.health': {
        break
      }

      default:
        return NextResponse.json({ error: `Unsupported event: ${event}` }, { status: 400 })
    }

    return NextResponse.json({
      received: true,
      event: normalizedEvent,
      tenant_id: tenantId,
      processed_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Processing failed' }, { status: 500 })
  }
}
