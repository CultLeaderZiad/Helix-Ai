import 'server-only'

import { createClient } from '@supabase/supabase-js'

/**
 * Service-role client. Server-only by import; the service-role key bypasses
 * RLS and must never reach client-side code. Used by the agent queue runner
 * and by future privileged server actions.
 */
export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase service configuration is missing.')
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
