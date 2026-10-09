export const publicConfig = {
  get NEXT_PUBLIC_SUPABASE_URL() {
    const val = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!val) throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
    return val
  },
  get NEXT_PUBLIC_SUPABASE_ANON_KEY() {
    const val = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!val) throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is missing')
    return val
  }
}

export function validatePublicConfig() {
  publicConfig.NEXT_PUBLIC_SUPABASE_URL
  publicConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY
}
