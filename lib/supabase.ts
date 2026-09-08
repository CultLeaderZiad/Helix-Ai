import 'server-only'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** User-scoped Supabase client. All database requests remain subject to RLS. */
export async function createSupabaseServerClient() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Supabase server configuration is missing.')

  const cookieStore = await cookies()
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