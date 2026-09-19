import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ClientStatus, IntegrationStatus, RegionTier } from '@/lib/schema'
import { isSampleWorkspace } from '@/lib/admin/sample'
import { SupabaseConfigError } from '@/lib/supabase-env'

export interface ClientRosterItem {
  id: string
  business_name: string
  vertical: string | null
  status: ClientStatus
  country?: string | null
  region_tier?: RegionTier
  updated_at: string
  systemCount: number
  integration: IntegrationStatus | null
  pendingFacts: number
  funnelStage: string
  isSample?: boolean
}

const CORE_SELECT = 'id, business_name, vertical, status, updated_at'
const FULL_SELECT = `${CORE_SELECT}, country, region_tier`

const INTEGRATION_RANK: Record<IntegrationStatus, number> = {
  disconnected: 3,
  degraded: 2,
  unknown: 1,
  connected: 0,
}

function worstIntegration(statuses: IntegrationStatus[]): IntegrationStatus | null {
  if (statuses.length === 0) return null
  return statuses.reduce((worst, s) => (INTEGRATION_RANK[s] > INTEGRATION_RANK[worst] ? s : worst))
}

function isMissingColumnError(message: string | undefined) {
  if (!message) return false
  const lower = message.toLowerCase()
  return (
    lower.includes('column') ||
    lower.includes('schema cache') ||
    lower.includes('country') ||
    lower.includes('region_tier') ||
    lower.includes('pgrst204')
  )
}

function humanizeRosterError(message: string | undefined, code?: string) {
  if (!message) return 'The client roster could not be loaded.'
  const lower = message.toLowerCase()
  if (code === '42501' || lower.includes('row-level security') || lower.includes('permission')) {
    return 'You do not have permission to read client workspaces. Check that this account is an agency admin.'
  }
  if (lower.includes('jwt') || lower.includes('not authenticated') || code === 'PGRST301') {
    return 'Your session expired. Sign in again, then retry the roster.'
  }
  if (isMissingColumnError(message)) {
    return 'Workspace schema is missing region columns. Showing the core roster until migrations are applied.'
  }
  return message
}

export interface RosterLoadResult {
  rows: ClientRosterItem[]
  error: string | null
  degraded: boolean
}

export async function loadClientRoster(supabase: SupabaseClient): Promise<RosterLoadResult> {
  const fullRes = await supabase.from('clients').select(FULL_SELECT).order('business_name')
  let degraded = false
  let clientRows = fullRes.data as Array<{
    id: string
    business_name: string
    vertical: string | null
    status: ClientStatus
    country?: string | null
    region_tier?: RegionTier
    updated_at: string
  }> | null
  let clientError = fullRes.error

  if (clientError && isMissingColumnError(clientError.message)) {
    const fallback = await supabase.from('clients').select(CORE_SELECT).order('business_name')
    if (!fallback.error) {
      clientRows = fallback.data as typeof clientRows
      clientError = null
      degraded = true
    } else {
      clientError = fallback.error
    }
  }

  const [systemsRes, integrationsRes, pendingFactsRes, dealsRes] = await Promise.all([
    supabase.from('client_systems').select('client_id'),
    supabase.from('client_integrations').select('client_id, status'),
    supabase.from('contact_facts').select('client_id').eq('status', 'pending'),
    supabase.from('deals').select('client_id, stage, updated_at').order('updated_at', { ascending: false }),
  ])

  if (clientError) {
    return {
      rows: [],
      error: humanizeRosterError(clientError.message, clientError.code),
      degraded: false,
    }
  }

  const rawClients = clientRows ?? []

  const systemsByClient = new Map<string, number>()
  for (const row of systemsRes.data ?? []) {
    systemsByClient.set(row.client_id, (systemsByClient.get(row.client_id) ?? 0) + 1)
  }

  const integrationsByClient = new Map<string, IntegrationStatus[]>()
  for (const row of integrationsRes.data ?? []) {
    const list = integrationsByClient.get(row.client_id) ?? []
    list.push(row.status as IntegrationStatus)
    integrationsByClient.set(row.client_id, list)
  }

  const pendingByClient = new Map<string, number>()
  for (const row of pendingFactsRes.data ?? []) {
    pendingByClient.set(row.client_id, (pendingByClient.get(row.client_id) ?? 0) + 1)
  }

  const latestDealByClient = new Map<string, string>()
  for (const deal of dealsRes.data ?? []) {
    if (!latestDealByClient.has(deal.client_id)) {
      latestDealByClient.set(deal.client_id, deal.stage)
    }
  }

  const rows: ClientRosterItem[] = rawClients.map(client => ({
    id: client.id,
    business_name: client.business_name,
    vertical: client.vertical,
    status: client.status,
    country: client.country ?? 'AE',
    region_tier: client.region_tier ?? 'gcc_enterprise',
    updated_at: client.updated_at,
    systemCount: systemsByClient.get(client.id) ?? 0,
    integration: worstIntegration(integrationsByClient.get(client.id) ?? []),
    pendingFacts: pendingByClient.get(client.id) ?? 0,
    funnelStage: latestDealByClient.get(client.id) ?? 'new_lead',
    isSample: isSampleWorkspace(client.vertical, client.business_name),
  }))

  return { rows, error: null, degraded }
}

export function rosterConfigErrorMessage(error: unknown) {
  if (error instanceof SupabaseConfigError) {
    return 'Supabase is not configured in this environment, so the roster cannot be fetched.'
  }
  if (error instanceof Error) return error.message
  return 'The client roster could not be loaded.'
}
