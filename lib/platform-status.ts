import type { ClientIntegration, IntegrationStatus } from '@/lib/schema'

export interface PlatformStatus {
  /** Most recent attribution_events.occurred_at across all clients. */
  last_event_at: string
  /** Aggregated from client_integrations grouped by status. */
  integrations: Record<IntegrationStatus, number>
  /** Most recent client_integrations.last_ping_at. */
  last_ping_at: string
  generated_at: string
}

/**
 * Data seam. Today this returns a snapshot shaped exactly like the future
 * query; when Neon is connected it becomes:
 *
 *   SELECT status, count(*) FROM client_integrations GROUP BY status;
 *   SELECT max(occurred_at) FROM attribution_events;
 *   SELECT max(last_ping_at) FROM client_integrations;
 */
export async function getPlatformStatus(): Promise<PlatformStatus> {
  const now = Date.now()
  const rows: Pick<ClientIntegration, 'status' | 'last_ping_at'>[] = [
    ...Array.from({ length: 38 }, (_, i) => ({
      status: 'connected' as const,
      last_ping_at: new Date(now - (i * 7 + 4) * 1000).toISOString(),
    })),
    { status: 'degraded', last_ping_at: new Date(now - 11 * 60 * 1000).toISOString() },
    { status: 'degraded', last_ping_at: new Date(now - 26 * 60 * 1000).toISOString() },
    { status: 'disconnected', last_ping_at: new Date(now - 3 * 60 * 60 * 1000).toISOString() },
    { status: 'pending', last_ping_at: null },
  ]

  const integrations: Record<IntegrationStatus, number> = {
    connected: 0,
    degraded: 0,
    disconnected: 0,
    pending: 0,
  }
  let lastPing = 0
  for (const row of rows) {
    integrations[row.status] += 1
    if (row.last_ping_at) lastPing = Math.max(lastPing, Date.parse(row.last_ping_at))
  }

  return {
    last_event_at: new Date(now - 14 * 1000).toISOString(),
    integrations,
    last_ping_at: new Date(lastPing).toISOString(),
    generated_at: new Date(now).toISOString(),
  }
}
