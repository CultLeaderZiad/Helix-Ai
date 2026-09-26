'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { authCallbackUrl } from '@/lib/auth/site-url'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface PasswordResetState {
  status: 'idle' | 'success' | 'field_error' | 'auth_error'
  error?: string
}

export async function requestPasswordReset(
  _prev: PasswordResetState,
  formData: FormData
): Promise<PasswordResetState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return {
      status: 'field_error',
      error: 'Enter the email address for your workspace.',
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: authCallbackUrl('/reset-password'),
    })
    if (error) {
      const lower = error.message.toLowerCase()
      if (error.status === 429 || lower.includes('rate')) {
        return {
          status: 'auth_error',
          error: 'Too many reset requests. Wait before trying again.',
        }
      }
      if (lower.includes('redirect') || lower.includes('not allowed')) {
        return {
          status: 'auth_error',
          error: 'Supabase rejected the reset link. Add this site to the Auth redirect allow-list.',
        }
      }
      return {
        status: 'auth_error',
        error: error.message || 'The reset email could not be sent. Try again shortly.',
      }
    }
  } catch {
    return {
      status: 'auth_error',
      error: 'The reset email could not be sent. Authentication is not configured or is temporarily unavailable.',
    }
  }

  return { status: 'success' }
}
