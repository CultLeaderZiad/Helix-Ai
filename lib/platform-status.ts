/**
 * Public login status contract. Tenant health belongs behind Supabase RLS.
 * A public aggregate has not been implemented; never substitute sample rows.
 */
export type PlatformStatusState = 'operational' | 'degraded' | 'partial_outage' | 'unavailable'

export interface PlatformStatus {
  state: PlatformStatusState
  updatedAt?: string
  message?: string
}

export async function getPlatformStatus(): Promise<PlatformStatus> {
  return {
    state: 'unavailable',
    message: 'Platform status will appear here shortly.',
  }
}