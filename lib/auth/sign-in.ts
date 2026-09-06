'use server'

import type { UserRole } from '@/lib/schema'

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
      code: 'INVALID_CREDENTIALS' | 'ROLE_MISMATCH' | 'LOCKED'
      message: string
      /** Present for LOCKED. users.locked_until */
      locked_until?: string
      /** Present for ROLE_MISMATCH. The portal the account actually belongs to. */
      actual_role?: UserRole
      values: { email: string; portal: Portal }
    }
  | {
      status: 'success'
      user: { email: string; role: UserRole; full_name: string }
      session: { expires_at: string }
      redirect_to: string
    }

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MAX_FAILED = 5
const LOCK_MINUTES = 15
const SESSION_LONG_MS = 30 * 24 * 60 * 60 * 1000
const SESSION_SHORT_MS = 12 * 60 * 60 * 1000

/**
 * In-memory stand-in for users.failed_login_count / users.locked_until.
 * Replaced by real column updates once Better Auth + Neon are wired.
 */
const attempts = new Map<string, { count: number; locked_until: number | null }>()

interface VerifiedUser {
  email: string
  role: UserRole
  full_name: string
}

/**
 * Credential seam. Until the auth provider is connected this only resolves
 * accounts on the internal dev domain so every UI state is reachable; every
 * other email is treated as not found. Production rejects everything here.
 */
async function verifyCredentials(email: string, password: string): Promise<VerifiedUser | null> {
  if (process.env.NODE_ENV === 'production') return null
  if (!email.endsWith('@helix.local') || password.length < 8) return null
  const local = email.split('@')[0]
  const isClient = local.startsWith('client.')
  const nameSource = isClient ? local.slice('client.'.length) : local
  const full_name = nameSource
    .split('.')
    .filter(Boolean)
    .map(part => part[0].toUpperCase() + part.slice(1))
    .join(' ')
  return { email, role: isClient ? 'client' : 'admin', full_name }
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') ?? '')
  const portal: Portal = formData.get('portal') === 'client' ? 'client' : 'admin'
  const remember = formData.get('remember') === 'on'
  const values = { email, portal }

  const errors: Partial<Record<'email' | 'password', string>> = {}
  if (!email) errors.email = 'Enter your work email.'
  else if (!EMAIL_RE.test(email)) errors.email = 'That does not look like a valid email address.'
  if (!password) errors.password = 'Enter your password.'
  if (errors.email || errors.password) {
    return { status: 'field_error', errors, values }
  }

  const record = attempts.get(email) ?? { count: 0, locked_until: null }
  if (record.locked_until && record.locked_until > Date.now()) {
    return {
      status: 'auth_error',
      code: 'LOCKED',
      message: `Too many failed attempts. This account is locked until ${new Date(record.locked_until).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      locked_until: new Date(record.locked_until).toISOString(),
      values,
    }
  }

  // Constant-ish response time so timing does not reveal whether the account exists.
  const [user] = await Promise.all([
    verifyCredentials(email, password),
    new Promise(resolve => setTimeout(resolve, 650)),
  ])

  if (!user) {
    const count = record.count + 1
    const locked_until = count >= MAX_FAILED ? Date.now() + LOCK_MINUTES * 60 * 1000 : null
    attempts.set(email, { count: locked_until ? 0 : count, locked_until })
    if (locked_until) {
      return {
        status: 'auth_error',
        code: 'LOCKED',
        message: `Too many failed attempts. This account is locked for ${LOCK_MINUTES} minutes.`,
        locked_until: new Date(locked_until).toISOString(),
        values,
      }
    }
    const remaining = MAX_FAILED - count
    return {
      status: 'auth_error',
      code: 'INVALID_CREDENTIALS',
      message:
        remaining <= 2
          ? `Email or password did not match. ${remaining} attempt${remaining === 1 ? '' : 's'} left before a ${LOCK_MINUTES}-minute lock.`
          : 'Email or password did not match an account.',
      values,
    }
  }

  if (user.role !== portal) {
    return {
      status: 'auth_error',
      code: 'ROLE_MISMATCH',
      message:
        user.role === 'client'
          ? 'This account belongs to a client workspace. Switch to Client portal to continue.'
          : 'This account is an agency admin. Switch to Agency console to continue.',
      actual_role: user.role,
      values,
    }
  }

  attempts.delete(email)
  const expires_at = new Date(Date.now() + (remember ? SESSION_LONG_MS : SESSION_SHORT_MS)).toISOString()

  return {
    status: 'success',
    user,
    session: { expires_at },
    redirect_to: user.role === 'admin' ? '/admin/clients' : '/portal',
  }
}
