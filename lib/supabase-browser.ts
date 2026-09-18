import { createBrowserClient } from '@supabase/ssr'
import { getSupabaseAnonKey, getSupabaseUrl } from '@/lib/supabase-env'

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  if (!url || !key) {
    throw new Error('Supabase browser client missing configuration.')
  }

  return createBrowserClient(url, key)
}
