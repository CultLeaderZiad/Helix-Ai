import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { ClientsRosterView, type ClientRosterItem } from '@/components/admin/clients-roster-view'
import type { IntegrationStatus, ClientStatus, RegionTier } from '@/lib/schema'

// Authenticated route: excluded from sitemap and marked unindexable here in
// addition to the noindex header set by proxy.ts for every matched path.
export const metadata = {
  title: 'HELIX AI — Agency Admin',
  robots: { index: false, follow: false },
}

type RosterRow = {
  id: string
  business_name: string
  vertical: string | null
  status: ClientStatus
  country?: string | null
  region_tier?: RegionTier
  updated_at: string
}

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

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  // RLS-scoped reads: clients returns every row to agency admins.
  const [clientsRes, systemsRes, integrationsRes, pendingFactsRes, dealsRes] = await Promise.all([
    supabase
      .from('clients')
      .select('id, business_name, vertical, status, country, region_tier, updated_at')
      .order('business_name'),
    supabase.from('client_systems').select('client_id'),
    supabase.from('client_integrations').select('client_id, status'),
    supabase.from('contact_facts').select('client_id').eq('status', 'pending'),
    supabase.from('deals').select('client_id, stage, updated_at').order('updated_at', { ascending: false }),
  ])

  const rawClients = (clientsRes.data ?? []) as any[]
  const clients: RosterRow[] = rawClients.map((c) => ({
    id: c.id,
    business_name: c.business_name,
    vertical: c.vertical,
    status: c.status,
    country: c.country ?? 'AE',
    region_tier: c.region_tier ?? 'gcc_enterprise',
    updated_at: c.updated_at,
  }))
  const systemsByClient = new Map<string, number>()
  for (const row of systemsRes.data ?? []) {
    systemsByClient.set(row.client_id, (systemsByClient.get(row.client_id) ?? 0) + 1)
  }
  const integrationsByClient = new Map<string, IntegrationStatus[]>()
  for (const row of integrationsRes.data ?? []) {
    const list = integrationsByClient.get(row.client_id) ?? []
    list.push(row.status)
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

  const rows: ClientRosterItem[] = clients.map(client => ({
    ...client,
    systemCount: systemsByClient.get(client.id) ?? 0,
    integration: worstIntegration(integrationsByClient.get(client.id) ?? []),
    pendingFacts: pendingByClient.get(client.id) ?? 0,
    funnelStage: latestDealByClient.get(client.id) ?? 'new_lead',
  }))
  const error = clientsRes.error

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-6xl">
        {error ? (
          <div role="alert" className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <p className="text-xs text-red-300">
              The client roster could not be loaded. Please retry shortly.
            </p>
          </div>
        ) : (
          <ClientsRosterView clients={rows} />
        )}
      </div>
    </ConsoleShell>
  )
}
