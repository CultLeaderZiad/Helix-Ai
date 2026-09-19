import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAnonKey, getSupabaseUrl, SupabaseConfigError } from '@/lib/supabase-env'

/** User-scoped Supabase client. All database requests remain subject to RLS. */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()
  if (!url || !key) throw new SupabaseConfigError()
  return createServerClient(url, key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => {
        // Server Components cannot write cookies; proxy.ts handles refresh there.
        try {
          for (const { name, value, options } of values) {
            cookieStore.set(name, value, options)
          }
        } catch {
          // Expected only when called during Server Component rendering.
        }
      },
    },
  })
}