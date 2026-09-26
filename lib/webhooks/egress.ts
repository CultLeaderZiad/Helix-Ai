import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SystemType, WebhookStatus } from '@/lib/schema'

export interface HelixEventEnvelope<T = Record<string, unknown>> {
  id: string
  type: string
  tenant_id: string
  system_type: SystemType
  occurred_at: string
  idempotency_key: string
  data: T
}

export interface SendEventOptions<T = Record<string, unknown>> {
  supabase: SupabaseClient
  clientId: string
  systemType: SystemType
  eventType: string
  data: T
  idempotencyKey?: string
}

export interface EgressResult {
  delivered: boolean
  webhookId?: string
  status?: WebhookStatus
  statusCode?: number
  responsePayload?: unknown
  error?: string
}

/**
 * Generate an HMAC signature for the webhook payload.
 */
export function signHelixPayload(secret: string, rawBody: string, timestamp: number): string {
  const signaturePayload = `${timestamp}.${rawBody}`
  return crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex')
}

/**
 * Dispatches an event to the tenant's configured n8n webhook for this system.
 */
export async function sendHelixWebhookEvent<T = Record<string, unknown>>({
  supabase,
  clientId,
  systemType,
  eventType,
  data,
  idempotencyKey,
}: SendEventOptions<T>): Promise<EgressResult> {
  const eventId = `evt_${crypto.randomBytes(12).toString('hex')}`
  const nowIso = new Date().toISOString()
  const timestamp = Math.floor(Date.now() / 1000)
  const finalIdempotencyKey = idempotencyKey || `idemp_${crypto.randomUUID()}`

  // 1. Fetch webhook config for this tenant & system
  const { data: webhook, error: fetchErr } = await supabase
    .from('system_webhooks')
    .select('id, webhook_url, secret_hash, enabled')
    .eq('client_id', clientId)
    .eq('system_type', systemType)
    .eq('direction', 'helix_to_n8n')
    .maybeSingle()

  if (fetchErr || !webhook || !webhook.enabled || !webhook.webhook_url) {
    return {
      delivered: false,
      error: fetchErr ? fetchErr.message : 'No enabled egress webhook found for tenant and system',
    }
  }

  const envelope: HelixEventEnvelope<T> = {
    id: eventId,
    type: eventType,
    tenant_id: clientId,
    system_type: systemType,
    occurred_at: nowIso,
    idempotency_key: finalIdempotencyKey,
    data,
  }

  const rawBody = JSON.stringify(envelope)
  const secret = webhook.secret_hash || process.env.HELIX_WEBHOOK_SECRET || 'helix_default_secret'
  const signature = signHelixPayload(secret, rawBody, timestamp)

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 8000)

    const response = await fetch(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Helix-AI-ControlPlane/1.0',
        'X-Helix-Signature': signature,
        'X-Helix-Timestamp': String(timestamp),
        'X-Helix-Event-Id': eventId,
        'X-Helix-Event-Type': eventType,
        'Authorization': `Bearer ${secret}`,
      },
      body: rawBody,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    let responseData: unknown = null
    try {
      responseData = await response.json()
    } catch {
      responseData = await response.text()
    }

    const isOk = response.ok
    const status: WebhookStatus = isOk ? 'ok' : 'failed'
    const errorMsg = isOk ? null : `HTTP ${response.status}: ${JSON.stringify(responseData).slice(0, 200)}`

    // Update telemetry in background
    await supabase
      .from('system_webhooks')
      .update({
        last_ping_at: nowIso,
        last_status: status,
        last_error: errorMsg,
        updated_at: nowIso,
      })
      .eq('id', webhook.id)

    return {
      delivered: isOk,
      webhookId: webhook.id,
      status,
      statusCode: response.status,
      responsePayload: responseData,
      error: errorMsg || undefined,
    }
  } catch (err: any) {
    const errorMsg = err.name === 'AbortError' ? 'Webhook dispatch timed out after 8s' : err.message || 'Network error'

    await supabase
      .from('system_webhooks')
      .update({
        last_ping_at: nowIso,
        last_status: 'failed',
        last_error: errorMsg,
        updated_at: nowIso,
      })
      .eq('id', webhook.id)

    return {
      delivered: false,
      webhookId: webhook.id,
      status: 'failed',
      error: errorMsg,
    }
  }
}

/**
 * Diagnostic ping test for admin to verify connection to n8n webhook.
 */
export async function pingWebhookEndpoint(
  webhookId: string,
  supabase: SupabaseClient
): Promise<{ success: boolean; status: WebhookStatus; error?: string; latencyMs?: number }> {
  const { data: webhook, error } = await supabase
    .from('system_webhooks')
    .select('id, client_id, system_type, webhook_url, secret_hash, enabled')
    .eq('id', webhookId)
    .single()

  if (error || !webhook) {
    return { success: false, status: 'failed', error: 'Webhook record not found' }
  }

  const startTime = Date.now()
  const result = await sendHelixWebhookEvent({
    supabase,
    clientId: webhook.client_id,
    systemType: webhook.system_type as SystemType,
    eventType: 'system.health',
    data: {
      action: 'ping',
      sample: true,
      timestamp: new Date().toISOString(),
      agent: 'Helix Control Plane Ping Diagnostic',
    },
  })

  const latencyMs = Date.now() - startTime

  return {
    success: result.delivered,
    status: result.status || (result.delivered ? 'ok' : 'failed'),
    error: result.error,
    latencyMs,
  }
}

/**
 * Core System 1 Emitter: Missed-call triage
 * Telephony miss -> n8n -> WhatsApp recovery sequence
 */
export async function emitMissedCallEvent(
  supabase: SupabaseClient,
  clientId: string,
  data: {
    callerPhone: string
    callerName?: string
    timestamp: string
    callId: string
    durationSeconds?: number
    sourceChannel?: string
  }
): Promise<EgressResult> {
  return sendHelixWebhookEvent({
    supabase,
    clientId,
    systemType: 'missed_call_response',
    eventType: 'call.missed',
    idempotencyKey: `missed:${data.callId}`,
    data: {
      call_id: data.callId,
      caller_phone: data.callerPhone,
      caller_name: data.callerName || 'Unknown Caller',
      occurred_at: data.timestamp,
      duration_seconds: data.durationSeconds || 0,
      source_channel: data.sourceChannel || 'telephony_sip',
    },
  })
}

/**
 * Core System 2 Emitter: Booking receptionist
 * Vapi Voice + WA + Cal.com bilingual receptionist booking
 */
export async function emitBookingCreatedEvent(
  supabase: SupabaseClient,
  clientId: string,
  data: {
    bookingId: string
    contactName: string
    contactPhone: string
    contactEmail?: string
    slotStartTime: string
    slotEndTime: string
    assignedStaff?: string
    channel?: 'voice' | 'whatsapp' | 'cal_com'
  }
): Promise<EgressResult> {
  return sendHelixWebhookEvent({
    supabase,
    clientId,
    systemType: 'booking_receptionist',
    eventType: 'booking.created',
    idempotencyKey: `booking:${data.bookingId}`,
    data: {
      booking_id: data.bookingId,
      contact_name: data.contactName,
      contact_phone: data.contactPhone,
      contact_email: data.contactEmail,
      slot_start: data.slotStartTime,
      slot_end: data.slotEndTime,
      assigned_staff: data.assignedStaff,
      channel: data.channel || 'voice',
    },
  })
}
