export type LoginPath = '/admin' | '/dashboard'

const CLIENT_ROLES = new Set(['client_user', 'client_staff', 'client'])

/** Query values that ask for the agency console. Anything else is ignored. */
export function normalizePortalOverride(value: string | null | undefined): 'agency' | 'admin' | null {
  const raw = value?.trim().toLowerCase()
  if (raw === 'agency' || raw === 'admin') return raw
  return null
}

/**
 * Roles used for post-login routing.
 * The verified claim is the account role. An optional `roles` array on
 * app_metadata marks a dual-role account when it also lists the other side.
 */
export function loginRolesFromMetadata(role: string, metadata: unknown): string[] {
  const roles = new Set<string>()
  if (role) roles.add(role)
  if (metadata && typeof metadata === 'object' && Array.isArray((metadata as { roles?: unknown }).roles)) {
    for (const entry of (metadata as { roles: unknown[] }).roles) {
      if (typeof entry === 'string' && entry) roles.add(entry)
    }
  }
  return [...roles]
}

/**
 * Home path after a successful password sign-in.
 *
 * Single-role accounts always go to their own home. A client who opens
 * `?portal=agency` (or `admin`) still goes to `/dashboard`. An agency admin
 * who uses the normal login goes to `/admin`.
 *
 * The portal query forces `/admin` only for dual-role accounts whose primary
 * role is a client role. It never signs the user out.
 */
export function resolveLoginPath(input: {
  role: string
  roles?: readonly string[] | null
  portal?: string | null
}): LoginPath {
  const roles = new Set<string>()
  if (input.role) roles.add(input.role)
  for (const role of input.roles ?? []) {
    if (role) roles.add(role)
  }

  const agency = roles.has('agency_admin')
  const client = [...roles].some(role => CLIENT_ROLES.has(role))
  const dual = agency && client
  const wantsAgency = input.portal === 'agency' || input.portal === 'admin'

  if (input.role === 'agency_admin') return '/admin'
  if (dual && wantsAgency) return '/admin'
  if (agency && !client) return '/admin'
  return '/dashboard'
}
