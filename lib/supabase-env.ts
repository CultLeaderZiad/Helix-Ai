import { publicConfig } from '@/lib/config/public'

export function getSupabaseUrl(): string {
  return publicConfig.NEXT_PUBLIC_SUPABASE_URL.trim()
}

export function getSupabaseAnonKey(): string {
  return publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY.trim()
}

export function getSupabaseServiceRoleKey(): string {
  const val = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || ''
  if (!val) throw new SupabaseConfigError()
  return val.trim()
}

export class SupabaseConfigError extends Error {
  constructor(message = 'Supabase server configuration is missing.') {
    super(message)
    this.name = 'SupabaseConfigError'
  }
}
