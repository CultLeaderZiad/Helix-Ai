import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import type { IntegrationStatus, ClientStatus } from '@/lib/schema'

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

  // All four reads are RLS-scoped: clients returns every row to agency admins,
  // the child tables resolve per tenant through their isolation policies.
  const [clientsRes, systemsRes, integrationsRes, pendingFactsRes] = await Promise.all([
    supabase
      .from('clients')
      .select('id, business_name, vertical, status, updated_at')
      .order('business_name'),
    supabase.from('client_systems').select('client_id'),
    supabase.from('client_integrations').select('client_id, status'),
    supabase.from('contact_facts').select('client_id').eq('status', 'pending'),
  ])

  const clients = (clientsRes.data ?? []) as RosterRow[]
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

  const rows = clients.map(client => ({
    ...client,
    systemCount: systemsByClient.get(client.id) ?? 0,
    integration: worstIntegration(integrationsByClient.get(client.id) ?? []),
    pendingFacts: pendingByClient.get(client.id) ?? 0,
  }))
  const error = clientsRes.error

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-5xl">
        <header>
          <div className="flex items-baseline justify-between gap-4">
            <h1 className="font-display text-h2">Clients</h1>
            <p className="text-small tabular-nums text-muted-foreground">
              {rows.length} workspace{rows.length === 1 ? '' : 's'}
            </p>
          </div>
          <p className="mt-1 text-small text-muted-foreground">
            Every workspace on the book, with live system and integration state.
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
                  <th scope="col" className="py-2 pr-4 font-medium">Vertical</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Status</th>
                  <th scope="col" className="py-2 pr-4 text-right font-medium">Systems</th>
                  <th scope="col" className="py-2 pr-4 font-medium">Integrations</th>
                  <th scope="col" className="py-2 text-right font-medium">Pending review</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(row => (
                  <tr key={row.id} className="border-b">
                    <td className="py-3 pr-4 font-medium">{row.business_name}</td>
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
                ))}
              </tbody>
            </table>
            {/* Mobile roster cards */}
            <ul className="mt-6 flex flex-col gap-3 md:hidden">
              {rows.map(row => (
                <li key={row.id} className="border bg-panel p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-display text-h3">{row.business_name}</h2>
                    <span
                      className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-xs font-medium ${STATUS_CHIP[row.status]}`}
                    >
                      {STATUS_LABEL[row.status]}
                    </span>
                  </div>
                  <p className="mt-1 text-small text-muted-foreground">{row.vertical ?? '—'}</p>
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
              ))}
            </ul>
          </>
        )}
      </div>
    </ConsoleShell>
  )
}
