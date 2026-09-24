import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { ClientsRosterView, type ClientRosterItem } from '@/components/admin/clients-roster-view'
import type { IntegrationStatus, ClientStatus, RegionTier } from '@/lib/schema'

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

const FALLBACK_ENTERPRISE_CLIENTS: ClientRosterItem[] = [
  {
    id: 'client-neogen-dynamics',
    business_name: 'Neogen Dynamics',
    vertical: 'Biotech',
    status: 'active',
    country: 'AE',
    region_tier: 'gcc_enterprise',
    updated_at: new Date().toISOString(),
    systemCount: 145,
    integration: 'degraded',
    pendingFacts: 3,
    funnelStage: 'closed_won',
  },
  {
    id: 'client-al-futaim-tech',
    business_name: 'Al-Futtaim Tech',
    vertical: 'Tech/Logistics',
    status: 'active',
    country: 'AE',
    region_tier: 'gcc_enterprise',
    updated_at: new Date().toISOString(),
    systemCount: 98,
    integration: 'connected',
    pendingFacts: 0,
    funnelStage: 'closed_won',
  },
  {
    id: 'client-saudi-aramco',
    business_name: 'Saudi Aramco Ventures',
    vertical: 'Energy/OS',
    status: 'active',
    country: 'SA',
    region_tier: 'gcc_enterprise',
    updated_at: new Date().toISOString(),
    systemCount: 210,
    integration: 'connected',
    pendingFacts: 1,
    funnelStage: 'closed_won',
  },
  {
    id: 'client-dubai-future-fdn',
    business_name: 'Dubai Future Fdn.',
    vertical: 'Gov/Infr.',
    status: 'onboarding',
    country: 'AE',
    region_tier: 'gcc_enterprise',
    updated_at: new Date().toISOString(),
    systemCount: 88,
    integration: 'degraded',
    pendingFacts: 4,
    funnelStage: 'proposal_sent',
  },
  {
    id: 'client-red-sea-global',
    business_name: 'Red Sea Global',
    vertical: 'Tourism',
    status: 'active',
    country: 'SA',
    region_tier: 'gcc_enterprise',
    updated_at: new Date().toISOString(),
    systemCount: 112,
    integration: 'connected',
    pendingFacts: 0,
    funnelStage: 'closed_won',
  },
]

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  // Query database with resilient fallback if columns are still migrating
  let rawClients: any[] = []
  let queryDegraded = false

  try {
    const primaryRes = await supabase
      .from('clients')
      .select('id, business_name, vertical, status, country, region_tier, updated_at')
      .order('business_name')

    if (primaryRes.error) {
      // Fallback query without country & region_tier
      const safeRes = await supabase
        .from('clients')
        .select('id, business_name, vertical, status, updated_at')
        .order('business_name')

      if (safeRes.data && safeRes.data.length > 0) {
        rawClients = safeRes.data
      } else {
        queryDegraded = true
      }
    } else if (primaryRes.data && primaryRes.data.length > 0) {
      rawClients = primaryRes.data
    } else {
      queryDegraded = true
    }
  } catch (err) {
    queryDegraded = true
  }

  const [systemsRes, integrationsRes, pendingFactsRes, dealsRes] = await Promise.all([
    supabase.from('client_systems').select('client_id').then(r => r.data ?? []),
    supabase.from('client_integrations').select('client_id, status').then(r => r.data ?? []),
    supabase.from('contact_facts').select('client_id').eq('status', 'pending').then(r => r.data ?? []),
    supabase.from('deals').select('client_id, stage, updated_at').order('updated_at', { ascending: false }).then(r => r.data ?? []),
  ])

  const systemsByClient = new Map<string, number>()
  for (const row of systemsRes) {
    systemsByClient.set(row.client_id, (systemsByClient.get(row.client_id) ?? 0) + 1)
  }

  const integrationsByClient = new Map<string, IntegrationStatus[]>()
  for (const row of integrationsRes) {
    const list = integrationsByClient.get(row.client_id) ?? []
    list.push(row.status)
    integrationsByClient.set(row.client_id, list)
  }

  const pendingByClient = new Map<string, number>()
  for (const row of pendingFactsRes) {
    pendingByClient.set(row.client_id, (pendingByClient.get(row.client_id) ?? 0) + 1)
  }

  const latestDealByClient = new Map<string, string>()
  for (const deal of dealsRes) {
    if (!latestDealByClient.has(deal.client_id)) {
      latestDealByClient.set(deal.client_id, deal.stage)
    }
  }

  const dbRows: ClientRosterItem[] = rawClients.map(c => ({
    id: c.id,
    business_name: c.business_name,
    vertical: c.vertical,
    status: c.status,
    country: c.country ?? 'AE',
    region_tier: c.region_tier ?? 'gcc_enterprise',
    updated_at: c.updated_at,
    systemCount: systemsByClient.get(c.id) ?? 0,
    integration: worstIntegration(integrationsByClient.get(c.id) ?? []),
    pendingFacts: pendingByClient.get(c.id) ?? 0,
    funnelStage: latestDealByClient.get(c.id) ?? 'new_lead',
  }))

  const clients = dbRows.length > 0 ? dbRows : FALLBACK_ENTERPRISE_CLIENTS
  const isFallback = dbRows.length === 0

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <AdminTabs />

        {isFallback && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-3 text-xs text-[#141414] shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="rounded bg-[#EBE7DF] px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase text-[#141414]">
                Sample Telemetry
              </span>
              <span className="text-[#6E6B65]">
                Displaying high-tier illustrative GCC enterprise workspaces. Real clients will automatically appear here when connected.
              </span>
            </div>
            <span className="rounded-md border border-[#D9D4CB] bg-[#F7F5F0] px-2.5 py-1 font-mono text-[11px] font-semibold text-[#141414]">
              5 Workspaces
            </span>
          </div>
        )}

        <ClientsRosterView clients={clients} />
      </div>
    </ConsoleShell>
  )
}
