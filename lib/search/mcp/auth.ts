import crypto from 'node:crypto'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface AuthenticatedApiKey {
  id: string
  client_id: string | null
  label: string
  scopes: string[]
  rate_per_minute: number
}

/**
 * Validates a Bearer token against stored sha256(pepper + secret) hash in helix_api_keys.
 * Uses constant-time buffer comparison to prevent timing attacks.
 */
export async function authenticateMcpKey(authHeader: string | null): Promise<AuthenticatedApiKey | null> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim()
  if (!token.startsWith('hx_live_')) {
    return null
  }

  const pepper = process.env.HELIX_API_KEY_PEPPER || 'helix-default-salt-pepper'
  const computedHash = crypto
    .createHash('sha256')
    .update(`${pepper}${token}`)
    .digest('hex')

  const supabase = createSupabaseAdminClient()
  const { data: keyRecord, error } = await (supabase as any)
    .from('helix_api_keys')
    .select('id, client_id, label, scopes, rate_per_minute, key_hash, revoked_at')
    .eq('key_hash', computedHash)
    .is('revoked_at', null)
    .maybeSingle()

  if (error || !keyRecord) {
    return null
  }

  // Constant-time compare
  const computedBuf = Buffer.from(computedHash, 'utf8')
  const recordBuf = Buffer.from(keyRecord.key_hash, 'utf8')
  if (computedBuf.length !== recordBuf.length || !crypto.timingSafeEqual(computedBuf, recordBuf)) {
    return null
  }

  // Update last_used_at
  await (supabase as any)
    .from('helix_api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('id', keyRecord.id)
    .catch(() => {})

  return {
    id: keyRecord.id,
    client_id: keyRecord.client_id,
    label: keyRecord.label,
    scopes: keyRecord.scopes || [],
    rate_per_minute: keyRecord.rate_per_minute || 10
  }
}
