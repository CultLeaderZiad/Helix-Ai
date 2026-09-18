import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabaseServiceRoleKey, getSupabaseUrl, SupabaseConfigError } from '@/lib/supabase-env'

/**
 * Service-role client. Server-only by import; the service-role key bypasses
 * RLS and must never reach client-side code. Used by the agent queue runner
 * and by future privileged server actions.
 */
export function createSupabaseAdminClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseServiceRoleKey()
  if (!url || !key) throw new SupabaseConfigError('Supabase service configuration is missing.')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
