'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { parseTenantClaims } from '@/lib/auth/claims'
import { SupabaseConfigError } from '@/lib/supabase-env'
import { redirect } from 'next/navigation'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface SignUpState {
  status: 'idle' | 'success' | 'field_error' | 'auth_error'
  errors?: Partial<Record<'full_name' | 'company_name' | 'email' | 'password' | 'confirm_password' | 'terms', string>>
  message?: string
  email?: string
}

function unavailable(err: unknown): SignUpState {
  console.error('signUp failed:', err)
  const configMissing = err instanceof SupabaseConfigError
  return {
    status: 'auth_error',
    message: configMissing
      ? 'Authentication is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to .env.local and restart the app.'
      : 'Authentication service is temporarily unavailable. Try again shortly.',
  }
}

export async function signUpUser(_prev: SignUpState, formData: FormData): Promise<SignUpState> {
  const fullName = String(formData.get('full_name') ?? '').trim()
  const companyName = String(formData.get('company_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')
  const termsAccepted = formData.get('terms') === 'on' || formData.get('terms') === 'true'

  const errors: Partial<Record<'full_name' | 'company_name' | 'email' | 'password' | 'confirm_password' | 'terms', string>> = {}

  if (!fullName) errors.full_name = 'Enter your full name.'
  if (!companyName) errors.company_name = 'Enter your company or agency name.'
  if (!EMAIL_RE.test(email) || email.length > 254) errors.email = 'Enter a valid work email address.'
  if (!password || password.length < 8) errors.password = 'Password must contain at least 8 characters.'
  if (password !== confirmPassword) errors.confirm_password = 'Passwords do not match.'
  if (!termsAccepted) errors.terms = 'You must accept the Terms of Service to continue.'

  if (Object.keys(errors).length > 0) {
    return { status: 'field_error', errors }
  }

  let destination: string | null = null
  try {
    const supabase = await createSupabaseServerClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=/dashboard`,
        data: {
          full_name: fullName,
          company_name: companyName,
        },
      },
    })

    if (error) {
      if (error.message.toLowerCase().includes('already registered') || error.status === 422) {
        return {
          status: 'auth_error',
          message: 'An account with this email already exists.',
        }
      }
      return {
        status: 'auth_error',
        message: error.message || 'Account creation could not be completed. Try again.',
      }
    }

    if (data.user) {
      try {
        const { ensureUserProvisioned } = await import('@/lib/auth/provisioning')
        await ensureUserProvisioned(data.user.id)
      } catch (provisionError) {
        console.error('signUp provisioning failed:', provisionError)
      }
    }

    if (!data.session) {
      return { status: 'success', email }
    }

    const { data: refreshed } = await supabase.auth.refreshSession()
    const { data: userData } = await supabase.auth.getUser()
    const claims = parseTenantClaims(userData?.user?.app_metadata ?? refreshed?.user?.app_metadata)
    destination = claims?.role === 'agency_admin' ? '/admin' : '/dashboard'
  } catch (err) {
    return unavailable(err)
  }

  if (!destination) return { status: 'success', email }
  redirect(destination)
}
