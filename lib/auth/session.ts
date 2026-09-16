import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import { parseTenantClaims } from './claims'

/**
 * Validate both the signed JWT used by RLS and the current Supabase Auth user.
 * Reject stale tenant/role claims after administrative reassignment.
 * Automatically refreshes session if user was newly provisioned and JWT is pending refresh.
 */
export async function getVerifiedSession(supabase: SupabaseClient) {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError || !userData.user) return null

  let { data: jwtData, error: jwtError } = await supabase.auth.getClaims()
  let current = parseTenantClaims(userData.user.app_metadata)
  let signed = jwtError || !jwtData ? null : parseTenantClaims(jwtData.claims.app_metadata)

  // If user was newly provisioned or claims updated, refresh session to obtain up-to-date JWT
  if (!signed || !current || signed.role !== current.role || signed.client_id !== current.client_id) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
    if (!refreshError && refreshed?.session) {
      const { data: newJwt } = await supabase.auth.getClaims()
      if (newJwt) {
        jwtData = newJwt
        signed = parseTenantClaims(newJwt.claims.app_metadata)
      }
      const { data: newUserData } = await supabase.auth.getUser()
      if (newUserData?.user) {
        current = parseTenantClaims(newUserData.user.app_metadata)
      }
    }
  }

  if (
    !current ||
    !signed ||
    !jwtData ||
    jwtData.claims.sub !== userData.user.id ||
    current.role !== signed.role ||
    current.client_id !== signed.client_id
  ) return null

  return { user: userData.user, claims: signed }
}