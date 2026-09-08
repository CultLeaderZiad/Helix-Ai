import Link from 'next/link'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  FileSearch,
  Mail,
  Phone,
  StickyNote,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import {
  FactReviewList,
  type ReviewableFact,
} from '@/components/crm/fact-review-list'
import type { CrmActivityType, DealStage, IntegrationStatus, SystemType } from '@/lib/schema'

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab: tabParam } = await searchParams
  const tab: Tab = (TABS as readonly string[]).includes(tabParam ?? '') ? (tabParam as Tab) : 'Overview'

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')
  if (!UUID.test(id)) notFound()

  // Tenant-scoped reads. RLS still protects every child table; the client_id
  // filters make cross-tenant UUID collisions resolve to nothing.
  const [clientRes, systemsRes, integrationsRes, invoicesRes, contactsRes, dealsRes, activitiesRes, factsRes] =
    await Promise.all([
      supabase.from('clients').select('business_name, vertical, status, timezone').eq('id', id).maybeSingle(),
      supabase
        .from('client_systems')
        .select('id, system_type, provenance, visible_to_client, active, setup_fee_cents, monthly_retainer_cents')
        .eq('client_id', id),
      supabase
        .from('client_integrations')
        .select('id, system_type, status, last_ping_at')
        .eq('client_id', id)
        .order('system_type'),
      supabase
        .from('invoices')
        .select('id, amount_cents, due_date, status, created_at')
        .eq('client_id', id)
        .order('due_date', { ascending: false })
        .limit(25),
      supabase.from('contacts').select('id, full_name, company_name, lead_status').eq('client_id', id),
      supabase.from('deals').select('stage, value_cents').eq('client_id', id),
      supabase
        .from('activities')
        .select('id, type, subject, occurred_at, contact_id, deal_id')
        .eq('client_id', id)
        .order('occurred_at', { ascending: false })
        .limit(20),
      supabase
        .from('contact_facts')
        .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
        .eq('client_id', id)
        .eq('status', 'pending')
        .order('observed_at', { ascending: false })
        .limit(100),
    ])

  const client = clientRes.data
  if (!client) notFound()

  const systems = systemsRes.data ?? []
  const integrations = integrationsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const contacts = contactsRes.data ?? []
  const deals = dealsRes.data ?? []
  const activities = activitiesRes.data ?? []
  const pendingFactsBase = (factsRes.data ?? []) as ReviewableFact[]

  const contactById = new Map(contacts.map(c => [c.id, c]))
  const contactNameById = new Map(contacts.map(c => [c.id, c.full_name ?? c.company_name ?? 'Unknown contact']))
  const contactCount = contacts.length
  const pendingFacts = pendingFactsBase.map(f => {
    const contact = contactById.get(f.contact_id)
    return { ...f, contact: contact ? { full_name: contact.full_name, company_name: contact.company_name } : null }
  })
  const openPipelineCents = deals
    .filter(d => OPEN_STAGES.includes(d.stage))
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const wonValueCents = deals
    .filter(d => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-5xl">
        <header className="flex flex-col gap-1">
          <Link
            href="/admin"
            className="self-start text-small text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            ← All clients
          </Link>
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h1 className="font-display text-h2">{client.business_name}</h1>
            <p className="text-small text-muted-foreground">{client.vertical ?? '—'}</p>
          </div>
        </header>

        <nav aria-label="Client sections" className="mt-6 flex gap-1 border-b">
          {TABS.map(t => (
            <Link
              key={t}
              href={`/admin/clients/${id}?tab=${t.toLowerCase()}`}
              aria-current={tab === t ? 'page' : undefined}
              className={`border-b-2 px-3 py-2 text-small ${
                tab === t
                  ? 'border-accent font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </Link>
          ))}
        </nav>

        {tab === 'Overview' ? (
          <section className="mt-8 flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Contacts</p>
                <p className="font-display text-h3 tabular-nums">{contactCount}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Open pipeline</p>
                <p className="font-display text-h3 tabular-nums">{formatCurrency(openPipelineCents)}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Closed won value</p>
                <p className="font-display text-h3 tabular-nums">{formatCurrency(wonValueCents)}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Overdue invoices</p>
                <p className={`font-display text-h3 tabular-nums ${overdueCount > 0 ? 'text-status-danger' : ''}`}>
                  {overdueCount}
                </p>
              </div>
            </div>

            <div>
              <h2 className="font-display text-h3">Recent activity</h2>
              {activities.length === 0 ? (
                <p className="mt-3 text-small text-muted-foreground">
                  No activity recorded yet for this workspace.
                </p>
              ) : (
                <ul className="mt-3 divide-y border">
                  {activities.map(activity => {
                    const Icon = ACTIVITY_ICON[activity.type as CrmActivityType] ?? StickyNote
                    const subject = activity.subject ?? 'Untitled activity'
                    const who = activity.contact_id ? (contactNameById.get(activity.contact_id) ?? null) : null
                    return (
                      <li key={activity.id} className="flex items-center gap-3 px-4 py-3">
                        <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-body">{subject}</p>
                          <p className="text-small text-muted-foreground">
                            {who ? `${who} · ` : ''}
                            {formatDateTime(activity.occurred_at)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </section>
        ) : null}

        {tab === 'Systems' ? (
          <section className="mt-8">
            <h2 className="font-display text-h3">Installed systems</h2>
            {systems.length === 0 ? (
              <p className="mt-3 text-small text-muted-foreground">
                No systems installed yet for this workspace.
              </p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {systems.map(system => (
                  <li key={system.id} className="border bg-panel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-body font-medium">
                          {SYSTEM_GLOSS[system.system_type as SystemType] ?? system.system_type}
                        </p>
                        <span className="rounded-sm border border-border bg-raised px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {system.provenance}
                        </span>
                        {system.active ? null : (
                          <span className="rounded-sm border border-border bg-raised px-1.5 py-0.5 text-xs font-medium text-muted-foreground">
                            Inactive
                          </span>
                        )}
                      </div>
                      <span className="text-small text-muted-foreground">
                        {system.visible_to_client ? 'Visible to client' : 'Internal only'}
                      </span>
                    </div>
                    <p className="mt-2 text-small tabular-nums text-muted-foreground">
                      Setup {system.setup_fee_cents != null ? formatCurrency(system.setup_fee_cents) : '—'} ·
                      Retainer{' '}
                      {system.monthly_retainer_cents != null
                        ? `${formatCurrency(system.monthly_retainer_cents)}/mo`
                        : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}

        {tab === 'Billing' ? (
          <section className="mt-8">
            <h2 className="font-display text-h3">Invoices</h2>
            {invoices.length === 0 ? (
              <p className="mt-3 text-small text-muted-foreground">
                No invoices recorded for this workspace yet.
              </p>
            ) : (
              <table className="mt-3 w-full border-collapse text-left">
                <thead>
                  <tr className="border-b text-small text-muted-foreground">
                    <th scope="col" className="py-2 pr-4 font-medium">Amount</th>
                    <th scope="col" className="py-2 pr-4 font-medium">Due</th>
                    <th scope="col" className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(invoice => (
                    <tr key={invoice.id} className="border-b">
                      <td className="py-3 pr-4 tabular-nums">{formatCurrency(invoice.amount_cents)}</td>
                      <td className="py-3 pr-4">{formatDate(invoice.due_date)}</td>
                      <td className="py-3 capitalize">{invoice.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        ) : null}

        {tab === 'Facts' ? (
          <section className="mt-8">
            <h2 className="font-display text-h3">Evidence review</h2>
            {pendingFacts.length === 0 ? (
              <p className="mt-3 text-small text-muted-foreground">
                No pending suggestions — the queue is clear.
              </p>
            ) : (
              <>
                <p className="mt-2 text-small text-muted-foreground">
                  Shown read-only here. Client-portal users approve or dismiss these from their own
                  workspace.
                </p>
                <FactReviewList facts={pendingFacts} />
              </>
            )}
          </section>
        ) : null}

        {tab === 'Queue' ? (
          <section className="mt-8">
            <h2 className="font-display text-h3">Agent queue</h2>
            <p className="mt-3 max-w-2xl text-small text-muted-foreground">
              Verified facts apply automatically through a leased work queue drained by the
              scheduled runner. Run summaries are written to service logs; the console does not
              expose queue state.
            </p>
          </section>
        ) : null}
      </div>
    </ConsoleShell>
  )
}


const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TABS = ['Overview', 'Systems', 'Billing', 'Facts', 'Queue'] as const
type Tab = (typeof TABS)[number]

const OPEN_STAGES: DealStage[] = [
  'DEMO_BOOKED',
  'QUALIFIED_TO_BUY',
  'DECISION_MAKER_BOUGHT_IN',
  'CONTRACT_SENT',
]

const SYSTEM_GLOSS: Record<SystemType, string> = {
  missed_call_response: 'Missed-call response',
  booking_receptionist: 'Booking receptionist',
  lead_attribution: 'Lead attribution',
  lead_reactivation: 'Lead reactivation',
  ar_collections: 'A/R collections',
}

const ACTIVITY_ICON: Record<CrmActivityType, typeof Phone> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle2,
  stage_change: BarChart3,
  enrichment: FileSearch,
}

const INTEGRATION_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
  unknown: 'Unknown',
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
