import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { OverviewBoard, emptyOverview, type OverviewModel } from '@/components/dashboard/overview-board'
import type { DealStage, IntegrationStatus, SystemType } from '@/lib/schema'

const OPEN_STAGES: DealStage[] = [
  'new_lead',
  'engaged',
  'studio_completed',
  'call_booked',
  'proposal_sent',
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
  ar_collections: 'A/R collections (B2B)',
  rival_watch: 'Rival Watch',
  handbook_bot: 'Handbook Answers',
  seo_scorecard: 'Visibility Scorecard',
  deck_factory: 'Deck Factory',
  shorts_factory: 'Clip Factory',
  lead_generation: 'Lead Generation',
}

// The real table each system's weekly activity sentence is computed from.
const ACTIVITY_SOURCE: Record<SystemType, { table: string; ts: string; label: string }> = {
  missed_call_response: { table: 'conversations', ts: 'created_at', label: 'conversations handled' },
  booking_receptionist: { table: 'bookings', ts: 'scheduled_at', label: 'bookings captured' },
  lead_attribution: { table: 'attribution_events', ts: 'occurred_at', label: 'attribution events' },
  lead_reactivation: { table: 'reactivation_touches', ts: 'created_at', label: 'reactivation touches' },
  ar_collections: { table: 'payment_promises', ts: 'created_at', label: 'payment promises logged' },
  rival_watch: { table: 'activity_log', ts: 'created_at', label: 'competitor scans run' },
  handbook_bot: { table: 'activity_log', ts: 'created_at', label: 'SOP queries answered' },
  seo_scorecard: { table: 'activity_log', ts: 'created_at', label: 'visibility audits completed' },
  deck_factory: { table: 'activity_log', ts: 'created_at', label: 'proposal decks built' },
  shorts_factory: { table: 'activity_log', ts: 'created_at', label: 'video clips exported' },
  lead_generation: { table: 'leadgen_leads', ts: 'created_at', label: 'verified leads extracted' },
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
    systems.filter(s => s.visible_to_client && s.active).map(async s => {
      const source = ACTIVITY_SOURCE[s.system_type as SystemType]
      if (!source) return null
      const { data, count, error } = await supabase
        .from(source.table)
        .select(source.ts, { count: 'exact' })
        .eq('client_id', clientId)
        .gte(source.ts, weekAgoIso)
        .order(source.ts, { ascending: false })
        .limit(1)
      if (error) return null
      const rows = (data ?? []) as unknown as Array<Record<string, string>>
      const last: string | null = rows.length ? rows[0][source.ts] : null
      return { systemId: s.id, count: count ?? 0, last, label: source.label }
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

  const empty = (newContacts ?? 0) === 0 && (monthBookings ?? 0) === 0 && (conversationsHandled ?? 0) === 0 && visibleSystems.length === 0 && pendingFacts === 0
  const first = (client?.business_name ?? session.user.email ?? 'there').split(/[\s@]/)[0] || 'there'
  const decisions = [
    pendingFacts > 0 ? { title: 'Confirm a detail', body: `${pendingFacts} suggestion${pendingFacts === 1 ? '' : 's'} waiting. Nothing unclear is saved until you check.`, action: 'Review', href: '/dashboard/facts' } : null,
    overdueInvoices > 0 ? { title: 'Overdue invoices', body: `${overdueInvoices} invoice${overdueInvoices === 1 ? '' : 's'} past due.`, action: 'Review', href: '/dashboard/billing' } : null,
    degradedIntegrations > 0 ? { title: 'A connection needs attention', body: `${degradedIntegrations} integration${degradedIntegrations === 1 ? '' : 's'} degraded or offline.`, action: 'Review', href: '/dashboard/integrations' } : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  const live: OverviewModel = empty
    ? emptyOverview(first)
    : {
        variant: 'live',
        firstName: first,
        summary: `This month your systems recorded ${conversationsHandled ?? 0} conversations and ${monthBookings ?? 0} bookings.${decisions.length ? ` ${decisions.length} thing${decisions.length === 1 ? '' : 's'} need your decision.` : ''}`,
        kpis: [
          { label: 'Appointments booked', value: String(monthBookings ?? 0), foot: 'From your workspace this month' },
          { label: 'New contacts', value: String(newContacts ?? 0), foot: 'From your workspace this month' },
          { label: 'Conversations handled', value: String(conversationsHandled ?? 0), foot: 'From your workspace this month' },
          { label: 'Needs a decision', value: String(pendingFacts ?? 0), foot: pendingFacts ? 'Waiting in the review queue' : 'Nothing waiting' },
        ],
        bars: null,
        barMax: 4,
        decisions,
        activity: visibleSystems.flatMap(system => {
          const activity = activityBySystem.get(system.id)
          if (!activity?.last && !activity?.count) return []
          const name = SYSTEM_NAME[system.system_type as SystemType] ?? system.system_type
          return [{
            verb: 'Recorded',
            text: `${activity?.count ?? 0} ${activity?.label ?? 'events'}`,
            meta: name,
            time: activity?.last ? formatShort(activity.last) : '',
            tone: 'ok' as const,
          }]
        }),
        systems: visibleSystems.map(system => {
          const activity = activityBySystem.get(system.id)
          const status = worstIntegration(system.system_type)
          return {
            name: SYSTEM_NAME[system.system_type as SystemType] ?? system.system_type,
            meta: activity?.last ? `Last activity ${formatShort(activity.last)}` : 'No activity recorded yet',
            status: status === 'connected' ? 'run' as const : 'pause' as const,
          }
        }),
        jobs: [],
      }
  if (clientError && !empty) {
    live.summary = 'Some workspace data could not be loaded. The counts below are what we could read.'
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <OverviewBoard model={live} />
    </ConsoleShell>
  )
}
