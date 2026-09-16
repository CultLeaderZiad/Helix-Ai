import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { ensureUserProvisioned } from '@/lib/auth/provisioning'
import { parseTenantClaims } from '@/lib/auth/claims'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  const supabase = await createSupabaseServerClient()

  try {
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.user) {
        // Ensure user is provisioned with client workspace and app_metadata claims
        await ensureUserProvisioned(data.user.id)
        
        // Refresh session to bake updated app_metadata into current access token JWT
        await supabase.auth.refreshSession()
        
        // Refetch latest user to inspect claims
        const { data: userData } = await supabase.auth.getUser()
        const claims = parseTenantClaims(userData?.user?.app_metadata ?? data.user.app_metadata)
        const destination = claims?.role === 'agency_admin' ? '/admin' : next.startsWith('/') ? next : '/dashboard'
        return NextResponse.redirect(new URL(destination, request.url))
      }
    }

    if (token_hash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type as any,
      })
      if (!error && data.user) {
        await ensureUserProvisioned(data.user.id)
        await supabase.auth.refreshSession()
        const { data: userData } = await supabase.auth.getUser()
        const claims = parseTenantClaims(userData?.user?.app_metadata ?? data.user.app_metadata)
        const destination = claims?.role === 'agency_admin' ? '/admin' : next.startsWith('/') ? next : '/dashboard'
        return NextResponse.redirect(new URL(destination, request.url))
      }
    }

    // Check if session is already active in cookies
    const { data: existingData } = await supabase.auth.getUser()
    if (existingData?.user) {
      await ensureUserProvisioned(existingData.user.id)
      await supabase.auth.refreshSession()
      const claims = parseTenantClaims(existingData.user.app_metadata)
      const destination = claims?.role === 'agency_admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(destination, request.url))
    }
  } catch (err) {
    console.error('Auth callback exception:', err)
  }

  return NextResponse.redirect(new URL('/login?error=verification_failed', request.url))
}
