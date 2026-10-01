import crypto from 'crypto'

/** Reject timestamps more than five minutes off the verifier's clock. */
export const HELIX_WEBHOOK_MAX_AGE_SECONDS = 5 * 60

const TIMESTAMP_PATTERN = /^[0-9]{1,12}$/

export interface InboundWebhookRow {
  system_type?: string | null
  secret_ciphertext?: string | null
  secret_hash?: string | null
  enabled?: boolean | null
}

export type IngressAuthFailure =
  | 'missing_signature'
  | 'stale_timestamp'
  | 'missing_secret'
  | 'lookup_failed'
  | 'bad_signature'

export interface IngressAuthInput {
  rawBody: string
  signature?: string | null
  timestamp?: string | null
  /**
   * Ignored. Callers must not authenticate with the raw secret.
   * Present so a Bearer header cannot satisfy this check.
   */
  authorization?: string | null
  tenantId?: string | null
  systemType?: string | null
  globalSecret?: string | null
  lookupError?: string | null
  rows?: InboundWebhookRow[] | null
  nowSeconds?: number
}

/**
 * HMAC-SHA256 hex of `${timestamp}.${rawBody}`.
 * `timestamp` is a unix time in seconds and is interpolated in decimal form.
 */
export function signHelixPayload(secret: string, rawBody: string, timestamp: number): string {
  if (!Number.isInteger(timestamp) || timestamp < 0) {
    throw new Error('Webhook timestamp must be a non-negative integer number of seconds')
  }
  const signaturePayload = `${timestamp}.${rawBody}`
  return crypto.createHmac('sha256', secret).update(signaturePayload).digest('hex')
}

export function timingSafeEqualString(left: string, right: string): boolean {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function parseWebhookTimestamp(header: string | null | undefined): number | null {
  if (!header) return null
  const value = header.trim()
  if (!TIMESTAMP_PATTERN.test(value)) return null
  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed)) return null
  return parsed
}

export function isWebhookTimestampFresh(
  timestamp: number,
  nowSeconds: number,
  maxAgeSeconds = HELIX_WEBHOOK_MAX_AGE_SECONDS,
): boolean {
  return Math.abs(nowSeconds - timestamp) <= maxAgeSeconds
}

export function firstSigningSecret(...candidates: Array<string | null | undefined>): string | null {
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const trimmed = candidate.trim()
    if (trimmed) return trimmed
  }
  return null
}

/** Tenant key material, then the environment secret. Never invents a key. */
export function resolveEgressSecret(
  webhook: { secret_ciphertext?: string | null; secret_hash?: string | null },
  globalSecret?: string | null,
): string | null {
  return firstSigningSecret(webhook.secret_ciphertext, webhook.secret_hash, globalSecret)
}

export function helixWebhookHeaders(input: {
  secret: string
  rawBody: string
  timestamp: number
  eventId: string
  eventType: string
}): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'User-Agent': 'Helix-AI-ControlPlane/1.0',
    'X-Helix-Signature': signHelixPayload(input.secret, input.rawBody, input.timestamp),
    'X-Helix-Timestamp': String(input.timestamp),
    'X-Helix-Event-Id': input.eventId,
    'X-Helix-Event-Type': input.eventType,
  }
}

function secretsFromRow(row: InboundWebhookRow): string[] {
  const secrets: string[] = []
  for (const candidate of [row.secret_ciphertext, row.secret_hash]) {
    const secret = firstSigningSecret(candidate)
    if (secret && !secrets.includes(secret)) secrets.push(secret)
  }
  return secrets
}

/**
 * Secrets that may verify this inbound request.
 * A tenant that already has inbound rows never falls through to the global secret.
 * When `systemType` is set, only that system's row is eligible.
 */
export function selectIngressSecrets(input: {
  tenantId?: string | null
  systemType?: string | null
  globalSecret?: string | null
  rows?: InboundWebhookRow[] | null
}): string[] {
  const globalSecret = firstSigningSecret(input.globalSecret)
  const tenantId = input.tenantId?.trim() || ''
  if (!tenantId) return globalSecret ? [globalSecret] : []

  const rows = input.rows ?? []
  if (rows.length === 0) return globalSecret ? [globalSecret] : []

  const enabled = rows.filter((row) => row.enabled !== false)
  const systemType = input.systemType?.trim() || ''
  const pool = systemType
    ? enabled.filter((row) => row.system_type === systemType)
    : enabled

  const secrets: string[] = []
  for (const row of pool) {
    for (const secret of secretsFromRow(row)) {
      if (!secrets.includes(secret)) secrets.push(secret)
    }
  }
  return secrets
}

export function authorizeIngress(
  input: IngressAuthInput,
): { ok: true } | { ok: false; reason: IngressAuthFailure } {
  const signature = input.signature?.trim() || ''
  const timestampHeader = input.timestamp?.trim() || ''
  if (!signature || !timestampHeader) {
    return { ok: false, reason: 'missing_signature' }
  }

  const timestamp = parseWebhookTimestamp(timestampHeader)
  const nowSeconds = input.nowSeconds ?? Math.floor(Date.now() / 1000)
  if (timestamp === null || !isWebhookTimestampFresh(timestamp, nowSeconds)) {
    return { ok: false, reason: 'stale_timestamp' }
  }

  const tenantId = input.tenantId?.trim() || ''
  if (tenantId && input.lookupError) {
    return { ok: false, reason: 'lookup_failed' }
  }

  const secrets = selectIngressSecrets(input)
  if (secrets.length === 0) {
    return { ok: false, reason: 'missing_secret' }
  }

  // Compare every candidate. The match flag is updated after each compare so a
  // hit does not skip the remaining constant-time checks.
  let matched = false
  for (const secret of secrets) {
    const expected = signHelixPayload(secret, input.rawBody, timestamp)
    const equal = timingSafeEqualString(signature, expected)
    matched = matched || equal
  }

  if (!matched) return { ok: false, reason: 'bad_signature' }
  return { ok: true }
}
