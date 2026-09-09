'use server'

import { createSupabaseServerClient } from '@/lib/supabase'

export interface UpdatePasswordState {
  status: 'idle' | 'success' | 'field_error' | 'auth_error'
  error?: string
}

export async function updatePassword(
  _prev: UpdatePasswordState,
  formData: FormData
): Promise<UpdatePasswordState> {
  const password = String(formData.get('password') ?? '')
  const confirmPassword = String(formData.get('confirm_password') ?? '')

  if (!password || password.length < 8) {
    return { status: 'field_error', error: 'Password must be at least 8 characters long.' }
  }

  if (password !== confirmPassword) {
    return { status: 'field_error', error: 'Passwords do not match.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      return {
        status: 'auth_error',
        error: error.message || 'Unable to update password. Your reset link may have expired.',
      }
    }

    return { status: 'success' }
  } catch {
    return {
      status: 'auth_error',
      error: 'Authentication service is temporarily unavailable. Try again shortly.',
    }
  }
}
