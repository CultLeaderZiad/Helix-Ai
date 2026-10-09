import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { safeFetchFull } from '@/lib/http/safe-fetch'
import { signHelixPayload } from '@/lib/webhooks/egress'

export async function processWebhookOutbox(limit = 50) {
  const supabase = createSupabaseAdminClient()
  const nowIso = new Date().toISOString()

  // Claim pending/failed events due for retry
  const { data: events, error: fetchErr } = await (supabase as any)
    .from('system_webhook_outbox')
    .select('*, system_webhooks(webhook_url, secret_hash, enabled)')
    .in('status', ['pending', 'failed'])
    .lte('next_retry_at', nowIso)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (fetchErr || !events || events.length === 0) {
    return { processed: 0 }
  }

  // Mark as processing
  const eventIds = events.map((e: any) => e.id)
  await (supabase as any)
    .from('system_webhook_outbox')
    .update({ status: 'processing', updated_at: nowIso })
    .in('id', eventIds)

  let successCount = 0

  for (const event of events) {
    const webhook = event.system_webhooks
    if (!webhook || !webhook.enabled || !webhook.webhook_url) {
      await (supabase as any).from('system_webhook_outbox').update({
        status: 'dead_letter',
        last_error: 'Webhook disabled or deleted',
        updated_at: new Date().toISOString()
      }).eq('id', event.id)
      continue
    }

    const secret = webhook.secret_hash
    if (!secret) {
      await (supabase as any).from('system_webhook_outbox').update({
        status: 'dead_letter',
        last_error: 'No webhook secret configured',
        updated_at: new Date().toISOString()
      }).eq('id', event.id)
      continue
    }

    const rawBody = JSON.stringify(event.payload)
    const timestamp = Math.floor(Date.now() / 1000)
    const signature = signHelixPayload(secret, rawBody, timestamp)

    try {
      const { res, data, text } = await safeFetchFull(webhook.webhook_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Helix-AI-ControlPlane/1.0',
          'X-Helix-Signature': signature,
          'X-Helix-Timestamp': String(timestamp),
          'X-Helix-Event-Id': event.payload.id,
          'X-Helix-Event-Type': event.event_type,
          'Authorization': `Bearer ${secret}`,
        },
        body: rawBody,
        timeoutMs: 8000
      })

      const isOk = res.ok
      const responseData = data !== null ? data : text
      const errorMsg = isOk ? null : `HTTP ${res.status}: ${JSON.stringify(responseData).slice(0, 200)}`

      if (isOk) {
        await (supabase as any).from('system_webhook_outbox').update({
          status: 'delivered',
          updated_at: new Date().toISOString()
        }).eq('id', event.id)
        
        await (supabase as any).from('system_webhooks').update({
          last_ping_at: new Date().toISOString(),
          last_status: 'ok',
          last_error: null,
          updated_at: new Date().toISOString()
        }).eq('id', event.webhook_id)

        successCount++
      } else {
        throw new Error(errorMsg || 'Non-2xx response')
      }
    } catch (err: any) {
      const attempts = event.attempts + 1
      const isDead = attempts >= 5
      const backoffMinutes = Math.pow(2, attempts) // 2, 4, 8, 16, 32 mins
      const nextRetryAt = new Date(Date.now() + backoffMinutes * 60000).toISOString()
      
      const errorMsg = err.name === 'AbortError' ? 'Webhook dispatch timed out' : err.message || 'Network error'

      await (supabase as any).from('system_webhook_outbox').update({
        status: isDead ? 'dead_letter' : 'failed',
        attempts,
        next_retry_at: isDead ? event.next_retry_at : nextRetryAt,
        last_error: errorMsg,
        updated_at: new Date().toISOString()
      }).eq('id', event.id)

      await (supabase as any).from('system_webhooks').update({
        last_ping_at: new Date().toISOString(),
        last_status: 'failed',
        last_error: errorMsg,
        updated_at: new Date().toISOString()
      }).eq('id', event.webhook_id)
    }
  }

  return { processed: events.length, success: successCount }
}
