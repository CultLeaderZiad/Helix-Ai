/**
 * Public login status contract. Tenant health belongs behind Supabase RLS.
 * A public aggregate has not been implemented; never substitute sample rows.
 */
export interface PlatformStatus {
  state: 'not_implemented'
  message: string
}

export async function getPlatformStatus(): Promise<PlatformStatus> {
  return {
    state: 'not_implemented',
    message: 'Public health summary — not yet implemented. Sign in to access tenant integration health when available.',
  }
}