'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { parseTenantClaims } from '@/lib/auth/claims'
import { SupabaseConfigError } from '@/lib/supabase-env'
import { redirect } from 'next/navigation'

export type Portal = 'admin' | 'client'

export type SignInState =
  | { status: 'idle' }
  | {
      status: 'field_error'
      errors: Partial<Record<'email' | 'password', string>>
      values: { email: string; portal: Portal }
    }
  | {
      status: 'auth_error'
      code: 'INVALID_CREDENTIALS' | 'ROLE_MISMATCH' | 'UNAVAILABLE' | 'CLAIMS_MISSING' | 'EMAIL_NOT_CONFIRMED'
      message: string
      actual_portal?: Portal
      values: { email: string; portal: Portal }
    }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function unavailable(values: { email: string; portal: Portal }, err: unknown): SignInState {
  console.error('signIn failed:', err)
  const configMissing = err instanceof SupabaseConfigError
  return {
    status: 'auth_error',
    code: 'UNAVAILABLE',
    message: configMissing
      ? 'Authentication is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local and restart the app.'
      : 'Authentication is temporarily unavailable. Please try again later.',
    values,
  }
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const portal: Portal = formData.get('portal') === 'client' ? 'client' : 'admin'
  const values = { email, portal }
  const errors: Partial<Record<'email' | 'password', string>> = {}
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter the email address for your workspace.'
  if (!password || password.length > 4096) errors.password = 'Enter your password.'
  if (errors.email || errors.password) return { status: 'field_error', errors, values }

  let portalPath: string | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error || !data.session) {
      const lower = (error?.message || '').toLowerCase()
      if (error?.code === 'email_not_confirmed' || lower.includes('email not confirmed')) {
        return {
          status: 'auth_error',
          code: 'EMAIL_NOT_CONFIRMED',
          message: 'This email is not confirmed yet. Use the link in the confirmation message, or resend it below.',
          values,
        }
      }
      return {
        status: 'auth_error',
        code: 'INVALID_CREDENTIALS',
        message: error?.status === 429
          ? 'Too many sign-in requests. Please wait before trying again.'
          : 'That email and password combination did not match. Check with your account manager if you have lost access.',
        values,
      }
    }

    let claims = null
    try {
      const { data: verified, error: claimsError } = await supabase.auth.getClaims(data.session.access_token)
      claims = claimsError ? null : parseTenantClaims(verified?.claims.app_metadata)
    } catch (claimsReadError) {
      console.error('signIn getClaims failed:', claimsReadError)
    }
    let current = parseTenantClaims(data.user.app_metadata)

    if (!claims || !current || claims.role !== current.role || claims.client_id !== current.client_id) {
      // User may have confirmed email before provisioning. Auto-provision workspace now.
      try {
        const { ensureUserProvisioned } = await import('@/lib/auth/provisioning')
        const provisioned = await ensureUserProvisioned(data.user.id)
        if (provisioned) {
          const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession()
          if (!refreshError && refreshed.session) {
            const { data: newVerified } = await supabase.auth.getClaims(refreshed.session.access_token)
            claims = parseTenantClaims(newVerified?.claims.app_metadata)
            current = provisioned
          }
        }
      } catch (provisionError) {
        console.error('signIn provisioning failed:', provisionError)
      }
    }

    if (!claims || !current || claims.role !== current.role || claims.client_id !== current.client_id) {
      await supabase.auth.signOut({ scope: 'local' })
      return {
        status: 'auth_error',
        code: 'CLAIMS_MISSING',
        message: 'Workspace access has not been provisioned. Contact your account manager.',
        values,
      }
    }

    const actualPortal: Portal = claims.role === 'agency_admin' ? 'admin' : 'client'
    if (portal !== actualPortal) {
      await supabase.auth.signOut({ scope: 'local' })
      return {
        status: 'auth_error',
        code: 'ROLE_MISMATCH',
        message: actualPortal === 'admin'
          ? 'This account is an agency admin. Switch to the Agency console.'
          : 'This account is a client workspace. Switch to the Client portal.',
        actual_portal: actualPortal,
        values,
      }
    }

    portalPath = actualPortal === 'admin' ? '/admin' : '/dashboard'
  } catch (err) {
    return unavailable(values, err)
  }

  // redirect() throws its own control-flow signal; it must run outside the
  // try block so the UNAVAILABLE handler above cannot swallow the navigation.
  redirect(portalPath)
}

export async function signOut() {
  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.auth.signOut({ scope: 'local' })
  if (error) throw new Error('Sign-out could not be completed.')
  redirect('/login')
}
