import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
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

const STATUS_CHIP: Record<ClientStatus, string> = {
  active: 'border-status-success/40 bg-status-success/10 text-status-success',
  onboarding: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
  paused: 'border-border bg-raised text-muted-foreground',
  churned: 'border-border bg-raised text-muted-foreground',
}

const STATUS_LABEL: Record<ClientStatus, string> = {
  active: 'Active',
  onboarding: 'Onboarding',
  paused: 'Paused',
  churned: 'Churned',
}

const FUNNEL_STAGE_CONFIG: Record<string, { label: string; chip: string }> = {
  new_lead: { label: 'New Lead', chip: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  engaged: { label: 'Engaged', chip: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' },
  studio_completed: { label: 'Studio Done', chip: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  call_booked: { label: 'Call Booked', chip: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  proposal_sent: { label: 'Proposal Sent', chip: 'border-orange-500/40 bg-orange-500/10 text-orange-400' },
  closed_won: { label: 'Closed Won', chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  closed_lost: { label: 'Closed Lost', chip: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
  // legacy
  DEMO_BOOKED: { label: 'Call Booked', chip: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  QUALIFIED_TO_BUY: { label: 'Studio Done', chip: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  DECISION_MAKER_BOUGHT_IN: { label: 'Engaged', chip: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' },
  CONTRACT_SENT: { label: 'Proposal Sent', chip: 'border-orange-500/40 bg-orange-500/10 text-orange-400' },
  CLOSED_WON: { label: 'Closed Won', chip: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  CLOSED_LOST: { label: 'Closed Lost', chip: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
}

// Severity order for the worst-integration readout: disconnected outranks
// degraded outranks unknown outranks connected.
const INTEGRATION_RANK: Record<IntegrationStatus, number> = {
  disconnected: 3,
  degraded: 2,
  unknown: 1,
  connected: 0,
}

const INTEGRATION_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
  unknown: 'Unknown',
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
      .select('id, business_name, vertical, status, updated_at')
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

  const rows = clients.map(client => ({
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
        <AdminTabs />
        <header>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="font-display text-h2">Clients</h1>
            <p className="text-small tabular-nums text-muted-foreground">
              {rows.length} workspace{rows.length === 1 ? '' : 's'}
            </p>
          </div>
          <p className="mt-1 text-small text-muted-foreground">
            Every client workspace with regional positioning, CRM funnel stage, and live integration state.
          </p>
        </header>

        {error ? (
          <div role="alert" className="mt-8 border border-status-danger/40 bg-status-danger/10 p-4">
            <p className="text-small text-foreground">
              The client roster could not be loaded. Retry shortly.
            </p>
          </div>
        ) : rows.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-h3">No clients provisioned yet.</h2>
            <p className="max-w-md text-small text-muted-foreground">
              Workspaces appear here the moment their client record is created.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop roster table */}
            <table className="mt-8 hidden w-full border-collapse text-left md:table">
              <thead>
                <tr className="border-b text-small text-muted-foreground">
                  <th scope="col" className="py-2 pr-4 font-medium">Workspace</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Region</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Funnel Stage</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Vertical</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">Systems</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Integrations</th>
                  <th scope="col" className="py-2 text-right font-medium">Pending</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => {
                  const stageConfig = FUNNEL_STAGE_CONFIG[row.funnelStage] ?? {
                    label: row.funnelStage,
                    chip: 'border-border bg-raised text-muted-foreground',
                  }
                  return (
                    <tr key={row.id} className="border-b hover:bg-raised/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">
                        <Link href={`/admin/clients/${row.id}`} className="hover:text-primary transition-colors underline-offset-4 hover:underline">
                          {row.business_name}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center gap-1 rounded bg-raised px-1.5 py-0.5 border text-xs text-muted-foreground font-mono">
                          {row.country ? `${row.country} · ` : ''}
                          {row.region_tier === 'mena_sme' ? 'MENA SME' : 'GCC Ent.'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${stageConfig.chip}`}>
                          {stageConfig.label}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">{row.vertical ?? '—'}</td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-sm border px-1.5 py-0.5 text-xs font-medium ${STATUS_CHIP[row.status]}`}
                        >
                          {STATUS_LABEL[row.status]}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-right tabular-nums">{row.systemCount}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {row.integration ? INTEGRATION_LABEL[row.integration] : '—'}
                      </td>
                      <td className="py-3 text-right tabular-nums">
                        {row.pendingFacts > 0 ? (
                          <span className="text-status-warning">{row.pendingFacts}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {/* Mobile roster cards */}
            <ul className="mt-6 flex flex-col gap-3 md:hidden">
              {rows.map(row => {
                const stageConfig = FUNNEL_STAGE_CONFIG[row.funnelStage] ?? {
                  label: row.funnelStage,
                  chip: 'border-border bg-raised text-muted-foreground',
                }
                return (
                  <li key={row.id} className="border bg-panel p-4">
                    <div className="flex items-start justify-between gap-3">
                      <Link href={`/admin/clients/${row.id}`} className="font-display text-h3 hover:text-primary transition-colors">
                        {row.business_name}
                      </Link>
                      <span
                        className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-xs font-medium ${STATUS_CHIP[row.status]}`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded bg-raised px-1.5 py-0.5 border text-xs text-muted-foreground font-mono">
                        {row.country ? `${row.country} · ` : ''}
                        {row.region_tier === 'mena_sme' ? 'MENA SME' : 'GCC Ent.'}
                      </span>
                      <span className={`inline-flex items-center rounded-sm border px-2 py-0.5 text-xs font-medium ${stageConfig.chip}`}>
                        {stageConfig.label}
                      </span>
                    </div>
                    <p className="mt-2 text-small text-muted-foreground">{row.vertical ?? '—'}</p>
                    <dl className="mt-3 flex items-center gap-6 text-small">
                      <div>
                        <dt className="text-muted-foreground">Systems</dt>
                        <dd className="tabular-nums">{row.systemCount}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Integrations</dt>
                        <dd>{row.integration ? INTEGRATION_LABEL[row.integration] : '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-muted-foreground">Pending review</dt>
                        <dd className={row.pendingFacts > 0 ? 'tabular-nums text-status-warning' : 'tabular-nums text-muted-foreground'}>
                          {row.pendingFacts}
                        </dd>
                      </div>
                    </dl>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>
    </ConsoleShell>
  )
}
