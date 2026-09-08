'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface PasswordResetState {
  status: 'idle' | 'success' | 'field_error'
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
    await supabase.auth.resetPasswordForEmail(email)
  } catch {
    // Deliberately swallow to never disclose account existence
  }

  return { status: 'success' }
}
