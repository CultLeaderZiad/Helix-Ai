import crypto from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { SystemType, WebhookStatus } from '@/lib/schema'
import { safeFetchFull } from '@/lib/http/safe-fetch'

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
  status?: WebhookStatus | 'pending'
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
 * Dispatches an event to the tenant's configured n8n webhook outbox.
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
  const finalIdempotencyKey = idempotencyKey || `idemp_${crypto.randomUUID()}`

  // 1. Fetch webhook config for this tenant & system
  const { data: webhook, error: fetchErr } = await supabase
    .from('system_webhooks')
    .select('id, enabled, secret_hash')
    .eq('client_id', clientId)
    .eq('system_type', systemType)
    .eq('direction', 'helix_to_n8n')
    .maybeSingle()

  if (fetchErr || !webhook || !webhook.enabled) {
    return {
      delivered: false,
      error: fetchErr ? fetchErr.message : 'No enabled egress webhook found for tenant and system',
    }
  }
  
  if (!webhook.secret_hash) {
    return {
      delivered: false,
      error: 'No webhook secret configured',
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

  // AI15: Write to outbox instead of inline fetch
  const { error: insertErr } = await (supabase as any)
    .from('system_webhook_outbox')
    .insert({
      webhook_id: webhook.id,
      client_id: clientId,
      event_type: eventType,
      payload: envelope,
      idempotency_key: finalIdempotencyKey,
      status: 'pending'
    })

  if (insertErr) {
    return {
      delivered: false,
      error: 'Failed to enqueue webhook event: ' + insertErr.message
    }
  }

  return {
    delivered: true, // Successfully enqueued
    webhookId: webhook.id,
    status: 'pending'
  }
}

/**
 * Diagnostic ping test for admin to verify connection to n8n webhook inline.
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

  if (!webhook.secret_hash) {
    return { success: false, status: 'failed', error: 'No webhook secret configured' }
  }

  const eventId = `ping_${crypto.randomBytes(6).toString('hex')}`
  const timestamp = Math.floor(Date.now() / 1000)
  
  const envelope: HelixEventEnvelope<any> = {
    id: eventId,
    type: 'system.health',
    tenant_id: webhook.client_id,
    system_type: webhook.system_type as SystemType,
    occurred_at: new Date().toISOString(),
    idempotency_key: eventId,
    data: {
      action: 'ping',
      sample: true,
      timestamp: new Date().toISOString(),
      agent: 'Helix Control Plane Ping Diagnostic',
    }
  }

  const rawBody = JSON.stringify(envelope)
  const signature = signHelixPayload(webhook.secret_hash, rawBody, timestamp)

  const startTime = Date.now()
  let isOk = false
  let errorMsg: string | undefined

  try {
    const { res, data, text } = await safeFetchFull(webhook.webhook_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Helix-AI-ControlPlane/1.0',
        'X-Helix-Signature': signature,
        'X-Helix-Timestamp': String(timestamp),
        'X-Helix-Event-Id': eventId,
        'X-Helix-Event-Type': 'system.health',
        'Authorization': `Bearer ${webhook.secret_hash}`,
      },
      body: rawBody,
      timeoutMs: 8000
    })

    isOk = res.ok
    if (!isOk) {
      const responseData = data !== null ? data : text
      errorMsg = `HTTP ${res.status}: ${JSON.stringify(responseData).slice(0, 200)}`
    }
  } catch (err: any) {
    isOk = false
    errorMsg = err.name === 'AbortError' ? 'Ping timed out' : err.message || 'Network error'
  }

  const latencyMs = Date.now() - startTime

  // Update telemetry
  await supabase
    .from('system_webhooks')
    .update({
      last_ping_at: new Date().toISOString(),
      last_status: isOk ? 'ok' : 'failed',
      last_error: errorMsg || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', webhook.id)

  return {
    success: isOk,
    status: isOk ? 'ok' : 'failed',
    error: errorMsg,
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
