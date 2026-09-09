'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface SignUpState {
  status: 'idle' | 'success' | 'field_error' | 'auth_error'
  errors?: Partial<Record<'full_name' | 'company_name' | 'email' | 'password' | 'confirm_password' | 'terms', string>>
  message?: string
  email?: string
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

  try {
    const supabase = await createSupabaseServerClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
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

    if (data.session) {
      // User created and auto-authenticated
      return { status: 'success', email }
    }

    // User created, confirmation email sent
    return { status: 'success', email }
  } catch {
    return {
      status: 'auth_error',
      message: 'Authentication service is temporarily unavailable. Try again shortly.',
    }
  }
}
