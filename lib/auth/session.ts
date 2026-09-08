import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { parseTenantClaims } from './claims'

/**
 * Validate both the signed JWT used by RLS and the current Supabase Auth user.
 * Reject stale tenant/role claims after administrative reassignment.
 */
export async function getVerifiedSession(supabase: SupabaseClient) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null

  const { data: jwtData, error: jwtError } = await supabase.auth.getClaims()
  if (jwtError || !jwtData) return null

  const current = parseTenantClaims(userData.user.app_metadata)
  const signed = parseTenantClaims(jwtData.claims.app_metadata)
  if (
    !current ||
    !signed ||
    jwtData.claims.sub !== userData.user.id ||
    current.role !== signed.role ||
    current.client_id !== signed.client_id
  ) return null

  return { user: userData.user, claims: signed }
}