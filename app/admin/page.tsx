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

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  let rawClients: RosterRow[] = []
  let queryError: string | null = null

  const primaryRes = await supabase
    .from('clients')
    .select('id, business_name, vertical, status, country, region_tier, updated_at')
    .order('business_name')

  if (primaryRes.error) {
    const safeRes = await supabase
      .from('clients')
      .select('id, business_name, vertical, status, updated_at')
      .order('business_name')
    if (safeRes.error) queryError = safeRes.error.message
    else rawClients = (safeRes.data ?? []) as RosterRow[]
  } else {
    rawClients = (primaryRes.data ?? []) as RosterRow[]
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
    country: c.country ?? null,
    region_tier: c.region_tier,
    updated_at: c.updated_at,
    systemCount: systemsByClient.get(c.id) ?? 0,
    integration: worstIntegration(integrationsByClient.get(c.id) ?? []),
    pendingFacts: pendingByClient.get(c.id) ?? 0,
    funnelStage: latestDealByClient.get(c.id) ?? 'new_lead',
  }))

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <AdminTabs />

        {queryError ? (
          <p role="alert" className="mb-6 rounded-xl border border-status-danger/40 bg-status-danger/10 px-4 py-3 text-xs">
            Client roster could not be loaded. {queryError}
          </p>
        ) : null}

        {dbRows.length === 0 && !queryError ? (
          <p className="mb-6 rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-3 text-xs text-[#6E6B65]">
            No client workspaces yet. A workspace appears here after a confirmed signup is provisioned.
            <span className="mt-1 block" dir="rtl" lang="ar">
              لا توجد مساحات عمل بعد. تظهر المساحة هنا بعد تأكيد التسجيل وتجهيز الحساب.
            </span>
          </p>
        ) : null}

        <ClientsRosterView clients={dbRows} />
      </div>
    </ConsoleShell>
  )
}
