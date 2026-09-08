'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export type ResetState =
  | { status: 'idle' }
  | { status: 'sent'; email: string }
  | { status: 'error'; message: string }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Password reset entry point. Supabase Auth owns the flow; the app only
 * requests the email. The response never distinguishes existing accounts,
 * so this endpoint cannot be used to enumerate users.
 */
export async function resetPassword(_prev: ResetState, formData: FormData): Promise<ResetState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: 'error', message: 'Enter a valid work email.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      return {
        status: 'error',
        message: error.status === 429
          ? 'Too many reset requests. Please wait before trying again.'
          : 'The reset email could not be sent. Try again shortly.',
      }
    }
  } catch {
    return { status: 'error', message: 'The reset email could not be sent. Try again shortly.' }
  }

  return { status: 'sent', email }
}
