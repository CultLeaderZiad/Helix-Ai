import { createHash } from 'node:crypto'

/**
 * Lowercase hex SHA-256 of the signing secret.
 * Matches public.hash_integration_secret() (pgcrypto digest of the trimmed UTF-8 bytes).
 * sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
 */
export function hashWebhookSecret(secret: string): string {
  return createHash('sha256').update(secret.trim(), 'utf8').digest('hex')
}

/** Columns on system_webhooks_safe. Never includes secret_ciphertext or secret_hash. */
export const SYSTEM_WEBHOOK_SAFE_COLUMNS =
  'id, client_id, system_type, direction, label, webhook_url, enabled, has_secret, last_ping_at, last_status, last_error, created_at, updated_at' as const

/** Columns on whatsapp_credentials_safe. Never includes access_token or webhook_verify_token. */
export const WHATSAPP_CREDENTIAL_SAFE_COLUMNS =
  'id, client_id, waba_id, phone_number_id, phone_number, status, quality_rating, has_access_token, last_ping_at, created_at, updated_at' as const
