/** Owner inbox. A confirmed sign-in with this address is provisioned as agency admin. */
export const HELIX_ADMIN_EMAIL = 'cultleaderzoz.dev@gmail.com'

export function agencyAdminEmails(extra: Array<string | undefined | null> = []): string[] {
  return [HELIX_ADMIN_EMAIL, ...extra]
    .flatMap(value => (value || '').split(','))
    .map(value => value.trim().toLowerCase())
    .filter(Boolean)
}

export function isAgencyAdminEmail(email: string, extra: Array<string | undefined | null> = []): boolean {
  return agencyAdminEmails(extra).includes(email.trim().toLowerCase())
}
