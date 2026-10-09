import crypto from 'crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { signHelixPayload } from '@/lib/webhooks/egress'

export interface IngressAuthResult {
  authorized: boolean;
  clientId?: string;
  systemType?: string;
  error?: string;
}

export async function verifyIngressAuth(
  req: Request,
  rawBody: string
): Promise<IngressAuthResult> {
  const authHeader = req.headers.get('authorization')
  const signature = req.headers.get('x-helix-signature')
  const timestampStr = req.headers.get('x-helix-timestamp')
  const eventId = req.headers.get('x-helix-event-id')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { authorized: false, error: 'Missing or invalid Authorization Bearer token' }
  }

  const token = authHeader.slice(7).trim()
  if (!token) {
    return { authorized: false, error: 'Empty token' }
  }

  if (!signature || !timestampStr || !eventId) {
    return { authorized: false, error: 'Missing required Helix security headers (signature, timestamp, event-id)' }
  }

  const timestamp = parseInt(timestampStr, 10)
  if (isNaN(timestamp)) {
    return { authorized: false, error: 'Invalid timestamp' }
  }

  // Reject stale requests (older than 5 minutes or in the future)
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - timestamp) > 300) {
    return { authorized: false, error: 'Stale request timestamp' }
  }

  const supabase = createSupabaseAdminClient()

  // Find the exact webhook configuration by the token (secret)
  // We check both secret_hash and secret_ciphertext
  const { data: webhooks, error } = await supabase
    .from('system_webhooks')
    .select('id, client_id, system_type, secret_hash, secret_ciphertext, enabled')
    .eq('direction', 'n8n_to_helix')
    .eq('enabled', true)

  if (error || !webhooks || webhooks.length === 0) {
    return { authorized: false, error: 'No active webhooks configured' }
  }

  const match = webhooks.find(w => w.secret_hash === token || w.secret_ciphertext === token)
  if (!match) {
    return { authorized: false, error: 'Invalid token' }
  }

  // Verify HMAC signature
  const expectedSig = signHelixPayload(token, rawBody, timestamp)
  if (
    signature.length !== expectedSig.length ||
    !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))
  ) {
    return { authorized: false, error: 'Invalid HMAC signature' }
  }

  // Check replay using idempotency
  // Assuming there's a table to track processed events or we can track in Redis
  // For now, we will use a basic table or outbox idempotency check if needed
  // But wait, the audit said "persist event IDs and results atomically. Reject replay and invalid payloads."
  const { data: replayCheck } = await supabase
    .from('system_webhook_outbox')
    .select('id')
    .eq('idempotency_key', eventId)
    .maybeSingle()

  if (replayCheck) {
    return { authorized: false, error: 'Replay detected' }
  }

  // Record this event ID to prevent replay
  await supabase.from('system_webhook_outbox').insert({
    webhook_id: match.id,
    client_id: match.client_id,
    event_type: 'ingress',
    payload: { id: eventId, type: 'ingress' },
    idempotency_key: eventId,
    status: 'delivered'
  })

  return {
    authorized: true,
    clientId: match.client_id,
    systemType: match.system_type
  }
}
