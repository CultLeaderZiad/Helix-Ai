import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import type { DealStage, IntegrationStatus, SystemType } from '@/lib/schema'

const OPEN_STAGES: DealStage[] = [
  'DEMO_BOOKED',
  'QUALIFIED_TO_BUY',
  'DECISION_MAKER_BOUGHT_IN',
  'CONTRACT_SENT',
]

const SYSTEM_NAME: Record<SystemType, string> = {
  missed_call_response: 'Missed-call response',
  booking_receptionist: 'Booking receptionist',
  lead_attribution: 'Lead attribution',
  lead_reactivation: 'Lead reactivation',
  ar_collections: 'A/R collections',
}

// The real table each system's weekly activity sentence is computed from.
const ACTIVITY_SOURCE: Record<SystemType, { table: string; ts: string; label: string }> = {
  missed_call_response: { table: 'conversations', ts: 'created_at', label: 'conversations handled' },
  booking_receptionist: { table: 'bookings', ts: 'scheduled_at', label: 'bookings captured' },
  lead_attribution: { table: 'attribution_events', ts: 'occurred_at', label: 'attribution events' },
  lead_reactivation: { table: 'reactivation_touches', ts: 'created_at', label: 'reactivation touches' },
  ar_collections: { table: 'payment_promises', ts: 'created_at', label: 'payment promises logged' },
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatShort(value: string): string {
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}


// Authenticated route: excluded from sitemap and marked unindexable here in
// addition to the noindex header set by proxy.ts for every matched path.
export const metadata = {
  title: 'HELIX AI — Client Dashboard',
  robots: { index: false, follow: false },
}

export default async function ClientDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const clientId = session.claims.client_id!
  const weekAgoIso = new Date(Date.now() - 7 * 86400000).toISOString()
  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)

  // Tenant-scoped reads; RLS double-gates every table.
  const [clientRes, systemsRes, integrationsRes, pendingFactsRes, newContactsRes, monthBookingsRes, overdueRes, openDealsRes] =
    await Promise.all([
      supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
      supabase
        .from('client_systems')
        .select('id, system_type, active, visible_to_client')
        .eq('client_id', clientId),
      supabase.from('client_integrations').select('id, system_type, status').eq('client_id', clientId),
      supabase.from('contact_facts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase
        .from('contacts')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString()),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .gte('scheduled_at', monthStart.toISOString())
        .neq('status', 'cancelled'),
      supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
      supabase.from('deals').select('value_cents, stage').eq('client_id', clientId),
    ])

  const client = clientRes.data
  const clientError = clientRes.error
  const systems = (systemsRes.data ?? []) as Array<{
    id: string
    system_type: string
    active: boolean
    visible_to_client: boolean
  }>
  const integrations = (integrationsRes.data ?? []) as Array<{
    id: string
    system_type: string
    status: IntegrationStatus
  }>
  const pendingFacts = pendingFactsRes.count ?? 0
  const newContacts = newContactsRes.count ?? 0
  const monthBookings = monthBookingsRes.count ?? 0
  const overdueInvoices = overdueRes.count ?? 0
  const pipelineCents = (openDealsRes.data ?? [])
    .filter(d => OPEN_STAGES.includes(d.stage as DealStage))
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const degradedIntegrations = integrations.filter(
    i => i.status === 'degraded' || i.status === 'disconnected',
  ).length

  // Per-system weekly activity: one tenant-scoped count per installed system,
  // each against that system's real table. A failed count degrades to null and
  // the card simply reports no measured activity.
  const activityEntries = await Promise.all(
    systems.map(async s => {
      const source = ACTIVITY_SOURCE[s.system_type as SystemType]
      if (!source) return null
      const { data } = await supabase
        .from(source.table)
        .select(source.ts)
        .gte(source.ts, weekAgoIso)
      const rows = (data ?? []) as unknown as Array<Record<string, string>>
      const last = rows.length > 0 ? rows.reduce((a, r) => (r[source.ts] > a ? r[source.ts] : a), rows[0][source.ts]) : null
      return { systemId: s.id, count: rows.length, last, label: source.label }
    }),
  )
  const activityBySystem = new Map(
    activityEntries.filter((a): a is { systemId: string; count: number; last: string | null; label: string } => a !== null)
      .map(a => [a.systemId, a]),
  )

  const rank: Record<IntegrationStatus, number> = { disconnected: 3, degraded: 2, unknown: 1, connected: 0 }
  const worstIntegration = (systemType: string): IntegrationStatus | null => {
    const statuses = integrations.filter(i => i.system_type === systemType).map(i => i.status)
    if (statuses.length === 0) return null
    return statuses.reduce((worst, s) => (rank[s] > rank[worst] ? s : worst))
  }

  // KPI: conversations handled this month across all activity types.
  const { count: conversationsHandled } = await supabase
    .from('activities')
    .select('id', { count: 'exact', head: true })
    .gte('occurred_at', monthStart.toISOString())

  const visibleSystems = systems.filter(s => s.visible_to_client && s.active)
  const attentionRows =
    (pendingFacts > 0 ? ['facts'] : [])
      .concat(overdueInvoices > 0 ? ['invoices'] : [])
      .concat(degradedIntegrations > 0 ? ['integrations'] : [])

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-h2">{client?.business_name ?? 'Your workspace'}</h1>
            <p className="mt-1 text-small text-muted-foreground">Here's what happened lately</p>
          </div>
        </header>

        <section aria-label="Evidence review" className="mt-8 border bg-panel p-4 lg:p-5">
          <h2 className="font-display text-h3">Evidence review</h2>
          <p className="mt-1 text-small text-muted-foreground">
            AI observations waiting for a human decision. Only tool-verified facts are auto-written to contact records; everything else lands here.
          </p>
          <p className="mt-4 text-body">
            {pendingFacts != null && pendingFacts > 0 ? (
              <span>
                <span className="font-medium text-foreground">{pendingFacts}</span>{' '}
                <span className="text-muted-foreground">pending suggestion{pendingFacts === 1 ? '' : 's'}.</span>{' '}
                <Link href="/dashboard/facts" className="text-accent underline-offset-4 hover:underline">
                  Review now →
                </Link>
              </span>
            ) : (
              <span className="text-muted-foreground">
                Nothing to review right now.
              </span>
            )}
          </p>
        </section>

        <section aria-label="Your systems" className="mt-8">
          <h2 className="font-display text-h3">Your systems</h2>
          {clientError ? (
            <p role="alert" className="mt-3 border border-status-danger/40 bg-status-danger/10 p-3 text-small">
              System cards could not be loaded. Retry shortly.
            </p>
          ) : visibleSystems.length === 0 ? (
            <p className="mt-3 text-small text-muted-foreground">
              No systems are visible to you yet. Your agency installs systems here as onboarding completes.
            </p>
          ) : (
            <div className={`mt-3 grid gap-4 ${visibleSystems.length >= 3 ? 'lg:grid-cols-3' : visibleSystems.length === 2 ? 'sm:grid-cols-2' : ''}`}>
              {visibleSystems.map(system => {
                const activity = activityBySystem.get(system.id)
                const status = worstIntegration(system.system_type)
                const systemName = SYSTEM_NAME[system.system_type as SystemType] ?? system.system_type
                return (
                  <article key={system.id} className="border bg-panel p-4">
                    <p className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground">System</p>
                    <h3 className="mt-1 font-display text-h3">{systemName}</h3>
                    <p className="mt-2 text-body">
                      {activity && activity.count > 0
                        ? `${activity.count} ${activity.label} this week`
                        : `No measured ${activity ? activity.label : 'activity'} in the last 7 days.`}
                    </p>
                    {status ? (
                      <p className="mt-3">
                        <span
                          className={`rounded-sm border px-1.5 py-0.5 text-xs font-medium ${
                            status === 'connected'
                              ? 'border-status-success/40 bg-status-success/10 text-status-success'
                              : status === 'degraded'
                                ? 'border-status-warning/40 bg-status-warning/10 text-status-warning'
                                : 'border-border bg-raised text-muted-foreground'
                          }`}
                        >
                          {status === 'connected' ? 'Running' : status === 'degraded' ? 'Attention' : 'Off'}
                        </span>
                      </p>
                    ) : null}
                    <p className="mt-3 text-small text-muted-foreground">
                      {activity?.last ? `Last activity ${formatShort(activity.last)}` : 'No activity recorded yet in this period.'}
                    </p>
                    <Link
                      href="/dashboard/contacts"
                      className="mt-2 inline-block text-small text-accent underline-offset-4 hover:underline"
                    >
                      Open →
                    </Link>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section aria-label="This month" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border bg-panel p-4">
            <p className="text-small text-muted-foreground">New contacts this month</p>
            <p className="font-display text-h3 tabular-nums">{newContacts}</p>
          </div>
          <div className="border bg-panel p-4">
            <p className="text-small text-muted-foreground">Bookings this month</p>
            <p className="font-display text-h3 tabular-nums">{monthBookings}</p>
          </div>
          <div className="border bg-panel p-4">
            <p className="text-small text-muted-foreground">Conversations handled</p>
            <p className="font-display text-h3 tabular-nums">{conversationsHandled ?? 0}</p>
          </div>
          <div className="border bg-panel p-4">
            <p className="text-small text-muted-foreground">Pipeline</p>
            <p className="font-display text-h3 tabular-nums">{formatCurrency(pipelineCents)}</p>
          </div>
        </section>

        {attentionRows.length > 0 ? (
          <section aria-label="Needs your attention" className="mt-8 border bg-panel p-4 lg:p-5">
            <h2 className="font-display text-h3">Needs your attention</h2>
            <ul className="mt-3 flex flex-col divide-y">
              {attentionRows.map(row => (
                <li key={row} className="flex items-center justify-between gap-3 py-2">
                  {row === 'facts' ? (
                    <>
                      <span className="text-body">
                        <span className="font-medium tabular-nums">{pendingFacts}</span> pending suggestion{pendingFacts === 1 ? '' : 's'}
                      </span>
                      <Link href="/dashboard/facts" className="text-small text-accent underline-offset-4 hover:underline">
                        View →
                      </Link>
                    </>
                  ) : row === 'invoices' ? (
                    <>
                      <span className="text-body">
                        <span className="font-medium tabular-nums">{overdueInvoices}</span> overdue invoice{overdueInvoices === 1 ? '' : 's'}
                      </span>
                      <span className="text-small text-muted-foreground">Billing arrives in a later release.</span>
                    </>
                  ) : (
                    <>
                      <span className="text-body">
                        <span className="font-medium tabular-nums">{degradedIntegrations}</span> integration{degradedIntegrations === 1 ? '' : 's'} degraded or offline
                      </span>
                      <span className="text-small text-muted-foreground">Health arrives in a later release.</span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </ConsoleShell>
  )
}
