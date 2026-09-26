import 'server-only'

import { cache } from 'react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { parseTenantClaims } from '@/lib/auth/claims'

/**
 * Lightweight server-side auth check for the public header and footer.
 * Returns { isAuthenticated, consoleHref } without throwing or redirecting.
 * Does NOT validate JWT claims alignment: use getVerifiedSession for protected routes.
 */
// Request-scoped only: never share authorization or personalized output across users.
export const getNavAuth = cache(async (): Promise<{ isAuthenticated: boolean; consoleHref: string }> => {
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      return { isAuthenticated: false, consoleHref: '/dashboard' }
    }
    const claims = parseTenantClaims(data.user.app_metadata)
    const consoleHref = claims?.role === 'agency_admin' ? '/admin' : '/dashboard'
    return { isAuthenticated: true, consoleHref }
  } catch {
    return { isAuthenticated: false, consoleHref: '/dashboard' }
  }
})
