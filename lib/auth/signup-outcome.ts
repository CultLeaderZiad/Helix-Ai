export interface SignUpApiUser {
  identities?: Array<unknown> | null
}

export interface SignUpApiError {
  message?: string
  status?: number
}

export type SignUpOutcome =
  | { kind: 'already_registered' }
  | { kind: 'confirm_email' }
  | { kind: 'session' }
  | { kind: 'error'; message: string }

/**
 * Map a Supabase signUp payload to what the UI is allowed to claim.
 * An empty identities array is Supabase's signal that the email is already
 * registered while confirmations are on: it is not proof that a message was sent.
 */
export function interpretSignUp(input: {
  error: SignUpApiError | null
  user: SignUpApiUser | null
  session: unknown
}): SignUpOutcome {
  if (input.error) {
    const msg = input.error.message || ''
    const lower = msg.toLowerCase()
    if (
      lower.includes('already registered') ||
      lower.includes('already been registered') ||
      (input.error.status === 422 && (lower.includes('registered') || lower.includes('exists')))
    ) {
      return { kind: 'already_registered' }
    }
    if (lower.includes('redirect') || lower.includes('not allowed')) {
      return {
        kind: 'error',
        message:
          'The confirmation link was rejected by Supabase. Set NEXT_PUBLIC_SITE_URL to this site and add it under Authentication → URL Configuration.',
      }
    }
    if (input.error.status === 429 || lower.includes('rate limit')) {
      return {
        kind: 'error',
        message: 'Too many signup attempts. Wait a few minutes, then try again.',
      }
    }
    return {
      kind: 'error',
      message: msg || 'Account creation could not be completed. Try again.',
    }
  }

  const identities = input.user?.identities
  if (input.user && Array.isArray(identities) && identities.length === 0) {
    return { kind: 'already_registered' }
  }

  if (!input.session) return { kind: 'confirm_email' }
  return { kind: 'session' }
}
