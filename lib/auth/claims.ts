import type { UserRole } from '@/lib/schema'

export interface TenantClaims {
  role: UserRole
  client_id: string | null
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Input must be app_metadata from a verified Supabase JWT or Auth user. */
export function parseTenantClaims(metadata: unknown): TenantClaims | null {
  if (!metadata || typeof metadata !== 'object') return null
  const { role, client_id } = metadata as Record<string, unknown>
  if (role === 'agency_admin') {
    return client_id == null ? { role, client_id: null } : null
  }
  if (
    (role === 'client_user' || role === 'client_staff') &&
    typeof client_id === 'string' &&
    UUID.test(client_id)
  ) {
    return { role, client_id }
  }
  return null
}