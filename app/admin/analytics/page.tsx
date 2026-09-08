import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import type { IntegrationStatus } from '@/lib/schema'

export const metadata = {
  title: 'HELIX AI — Analytics',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const PERIODS = ['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'] as const
type Period = (typeof PERIODS)[number]

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function periodBounds(period: Period, from?: string, to?: string): { start: Date; end: Date; label: string } {
  const now = new Date()
  const end = new Date(now)
  end.setUTCHours(0, 0, 0, 0)
  end.setUTCDate(end.getUTCDate() + 1) // exclusive upper bound: today included
  if (period === 'Last 7 days') {
    return { start: new Date(end.getTime() - 7 * 86400000), end, label: 'Last 7 days' }
  }
  if (period === 'Last 30 days') {
    return { start: new Date(end.getTime() - 30 * 86400000), end, label: 'Last 30 days' }
  }
  if (period === 'Last 90 days') {
    return { start: new Date(end.getTime() - 90 * 86400000), end, label: 'Last 90 days' }
  }
  // Custom: both bounds inclusive of the chosen days.
  const start = from ? new Date(`${from}T00:00:00.000Z`) : new Date(end.getTime() - 30 * 86400000)
  const endExclusive = to ? new Date(`${to}T00:00:00.000Z`) : end
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)
  return { start, end: endExclusive, label: `${from ?? 'start'} → ${to ?? 'today'}` }
}

function countBy<T>(rows: T[], key: (row: T) => string): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const k = key(row)
    map.set(k, (map.get(k) ?? 0) + 1)
  }
  return map
}

type EventRow = {
  id: string
  client_id: string
  event_type: string
  revenue_cents: number | null
  ad_platform: string | null
  occurred_at: string
}

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; from?: string; to?: string }>
}) {
  const { period: periodParam, from, to } = await searchParams
  const period: Period = (PERIODS as readonly string[]).includes(periodParam ?? '')
    ? (periodParam as Period)
    : 'Last 30 days'

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const { start, end, label } = periodBounds(period, from, to)
  const startIso = start.toISOString()
  const endIso = end.toISOString()

  // Cross-tenant reads: agency admins see every row, per the RLS grant matrix.
  const [eventsRes, bookingsRes, pendingFactsRes, clientsRes, integrationsRes, invoicesRes] =
    await Promise.all([
    supabase
      .from('attribution_events')
      .select('id, client_id, event_type, revenue_cents, ad_platform, occurred_at')
      .gte('occurred_at', startIso)
      .lt('occurred_at', endIso),
    supabase
      .from('bookings')
      .select('id, client_id, status, scheduled_at')
      .gte('scheduled_at', startIso)
      .lt('scheduled_at', endIso),
    supabase.from('contact_facts').select('id, client_id').eq('status', 'pending'),
    supabase.from('clients').select('id, business_name'),
    supabase.from('client_integrations').select('id, status'),
    supabase.from('invoices').select('id, status'),
  ])

  const queryError =
    eventsRes.error || bookingsRes.error || pendingFactsRes.error || clientsRes.error ||
    integrationsRes.error || invoicesRes.error
  const events = (eventsRes.data ?? []) as EventRow[]
  const bookings = bookingsRes.data ?? []
  const pendingFacts = pendingFactsRes.data ?? []
  const clients = clientsRes.data ?? []
  const integrations = integrationsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const degradedCount = integrations.filter(
    i => i.status === 'degraded' || i.status === 'disconnected',
  ).length
  const overdueCount = invoices.filter(i => i.status === 'overdue').length
  const clientNameById = new Map(clients.map(c => [c.id, c.business_name]))

  const eventCounts = countBy(events, e => e.event_type)
  const noShowCount = bookings.filter(b => b.status === 'no_show').length
  const cancelledCount = bookings.filter(b => b.status === 'cancelled').length
  const wonRevenueCents = events
    .filter(e => e.event_type === 'closed_won')
    .reduce((sum, e) => sum + (e.revenue_cents ?? 0), 0)

  // Platform attribution: closed outcomes only, win rate = won / (won + lost).
  const byPlatform = new Map<string, { won: number; lost: number; revenueCents: number }>()
  for (const e of events) {
    if (e.event_type !== 'closed_won' && e.event_type !== 'closed_lost') continue
    const key = e.ad_platform ?? 'Unattributed'
    const entry = byPlatform.get(key) ?? { won: 0, lost: 0, revenueCents: 0 }
    if (e.event_type === 'closed_won') {
      entry.won += 1
      entry.revenueCents += e.revenue_cents ?? 0
    } else {
      entry.lost += 1
    }
    byPlatform.set(key, entry)
  }
  const platformRows = [...byPlatform.entries()]
    .map(([platform, v]) => ({
      platform,
      ...v,
      winRate: v.won + v.lost > 0 ? Math.round((v.won / (v.won + v.lost)) * 100) : null,
    }))
    .sort((a, b) => b.revenueCents - a.revenueCents)

  // Workspace comparison, revenue-sorted, names linked to the detail screen.
  const byClient = new Map<string, { revenueCents: number; won: number; lost: number; bookings: number }>()
  for (const c of clients) byClient.set(c.id, { revenueCents: 0, won: 0, lost: 0, bookings: 0 })
  for (const e of events) {
    const entry = byClient.get(e.client_id)
    if (!entry) continue
    if (e.event_type === 'closed_won') {
      entry.revenueCents += e.revenue_cents ?? 0
      entry.won += 1
    } else if (e.event_type === 'closed_lost') {
      entry.lost += 1
    }
  }
  for (const b of bookings) {
    const entry = byClient.get(b.client_id)
    if (entry && b.status !== 'cancelled') entry.bookings += 1
  }
  const clientRows = [...byClient.entries()]
    .map(([id, v]) => ({ id, name: clientNameById.get(id) ?? 'Unknown workspace', ...v }))
    .sort((a, b) => b.revenueCents - a.revenueCents)

  // Daily booked-trend buckets for the bar chart.
  const dayCount = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000))
  const trend = Array.from({ length: dayCount }, (_, i) => ({
    date: new Date(start.getTime() + i * 86400000).toISOString().slice(0, 10),
    booked: 0,
  }))
  for (const b of bookings) {
    if (b.status === 'cancelled') continue
    const bucket = trend.find(t => t.date === b.scheduled_at.slice(0, 10))
    if (bucket) bucket.booked += 1
  }
  const trendMax = Math.max(1, ...trend.map(t => t.booked))

  const currency = (cents: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
  const zeroActivity = events.length === 0 && bookings.length === 0

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-h2">Analytics</h1>
            <p className="mt-1 text-small text-muted-foreground">
              Performance across every workspace
            </p>
          </div>
          <nav aria-label="Period" className="flex border">
            {PERIODS.map(p => (
              <Link
                key={p}
                href={
                  p === 'Custom'
                    ? '/admin/analytics?period=Custom&from=2026-08-01&to=2026-09-01'
                    : `/admin/analytics?period=${encodeURIComponent(p)}`
                }
                aria-current={period === p ? 'page' : undefined}
                className={`px-3 py-2 text-small ${
                  period === p ? 'bg-raised font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {p}
                {p === 'Custom' ? '…' : ''}
              </Link>
            ))}
          </nav>
        </header>

        {queryError ? (
          <div role="alert" className="mt-8 border border-status-danger/40 bg-status-danger/10 p-4">
            <p className="text-small text-foreground">
              Analytics data could not be loaded. Retry shortly.
            </p>
          </div>
        ) : zeroActivity ? (
          <div className="mt-16 flex flex-col items-center gap-2 text-center">
            <h2 className="font-display text-h3">No activity in this period.</h2>
            <p className="max-w-md text-small text-muted-foreground">
              Events and bookings appear here once workspaces capture them. Widen the period to see
              earlier activity.
            </p>
          </div>
        ) : (
          <>
            <section aria-label="Key figures" className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Closed-won revenue</p>
                <p className="font-display text-h3 tabular-nums">{currency(wonRevenueCents)}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Bookings</p>
                <p className="font-display text-h3 tabular-nums">{bookings.length - cancelledCount}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">No-shows</p>
                <p className="font-display text-h3 tabular-nums">{noShowCount}</p>
              </div>
              <div className="border bg-panel p-4">
                <p className="text-small text-muted-foreground">Pending review</p>
                <p className="font-display text-h3 tabular-nums">{pendingFacts.length}</p>
              </div>
            </section>

            <section aria-label="Lead funnel" className="mt-8">
              <h2 className="font-display text-h3">Lead funnel</h2>
              <ul className="mt-3 flex flex-col gap-2">
                {(['lead_captured', 'qualified', 'booked', 'closed_won'] as const).map(stage => {
                  const count = eventCounts.get(stage) ?? 0
                  const max = Math.max(
                    1,
                    ...(['lead_captured', 'qualified', 'booked', 'closed_won'] as const).map(
                      s => eventCounts.get(s) ?? 0,
                    ),
                  )
                  return (
                    <li key={stage} className="flex items-center gap-3">
                      <span className="w-32 shrink-0 text-small capitalize">{stage.replace(/_/g, ' ')}</span>
                      <span className="h-6 flex-1 bg-raised">
                        <span
                          className="block h-6 bg-accent"
                          style={{ width: `${Math.round((count / max) * 100)}%` }}
                        />
                      </span>
                      <span className="w-10 shrink-0 text-right text-small tabular-nums">{count}</span>
                    </li>
                  )
                })}
              </ul>
            </section>

            <section aria-label="Bookings trend" className="mt-8">
              <h2 className="font-display text-h3">Bookings by day</h2>
              <div className="mt-3 flex h-24 items-end gap-1" aria-hidden="true">
                {trend.map(day => (
                  <span
                    key={day.date}
                    className="flex-1 bg-accent/80"
                    style={{ height: `${Math.max(4, Math.round((day.booked / trendMax) * 100))}%` }}
                  />
                ))}
              </div>
              <p className="mt-2 text-small text-muted-foreground">
                {trend[0]?.date} → {trend[trend.length - 1]?.date} · peak day{' '}
                <span className="tabular-nums">{trendMax}</span>
              </p>
            </section>

            <section aria-label="Attention" className="mt-8">
              <h2 className="font-display text-h3">Needs attention</h2>
              <ul className="mt-3 grid gap-4 sm:grid-cols-3">
                <li className="border bg-panel p-4">
                  <p className="text-small text-muted-foreground">Pending evidence</p>
                  <p className="font-display text-h3 tabular-nums">{pendingFacts.length}</p>
                  <Link href="/admin" className="mt-2 inline-block text-small text-accent underline-offset-4 hover:underline">
                    Review →
                  </Link>
                </li>
                <li className="border bg-panel p-4">
                  <p className="text-small text-muted-foreground">Degraded integrations</p>
                  <p className="font-display text-h3 tabular-nums">{degradedCount}</p>
                  <p className="mt-2 text-small text-muted-foreground">Per-workspace status on the roster.</p>
                </li>
                <li className="border bg-panel p-4">
                  <p className="text-small text-muted-foreground">Overdue invoices</p>
                  <p className="font-display text-h3 tabular-nums">{overdueCount}</p>
                  <p className="mt-2 text-small text-muted-foreground">Per-workspace detail under Billing.</p>
                </li>
              </ul>
            </section>

            <section aria-label="Platform attribution" className="mt-8">
              <h2 className="font-display text-h3">Attribution by platform</h2>
              {platformRows.length === 0 ? (
                <p className="mt-3 text-small text-muted-foreground">
                  No closed outcomes recorded in this period yet.
                </p>
              ) : (
                <table className="mt-3 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b text-small text-muted-foreground">
                      <th scope="col" className="py-2 pr-4 font-medium">Platform</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Won</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Lost</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Win rate</th>
                      <th scope="col" className="py-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {platformRows.map(row => (
                      <tr key={row.platform} className="border-b">
                        <td className="py-3 pr-4">{row.platform}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{row.won}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{row.lost}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">
                          {row.winRate == null ? '—' : `${row.winRate}%`}
                        </td>
                        <td className="py-3 text-right tabular-nums">{currency(row.revenueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>

            <section aria-label="Workspace comparison" className="mt-8 pb-4">
              <h2 className="font-display text-h3">Workspaces</h2>
              {clientRows.length === 0 ? (
                <p className="mt-3 text-small text-muted-foreground">No workspaces provisioned yet.</p>
              ) : (
                <table className="mt-3 w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b text-small text-muted-foreground">
                      <th scope="col" className="py-2 pr-4 font-medium">Workspace</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Bookings</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Won</th>
                      <th scope="col" className="py-2 pr-4 text-right font-medium">Lost</th>
                      <th scope="col" className="py-2 text-right font-medium">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientRows.map(row => (
                      <tr key={row.id} className="border-b">
                        <td className="py-3 pr-4">
                          <Link
                            href={`/admin/clients/${row.id}`}
                            className="text-accent underline-offset-4 hover:underline"
                          >
                            {row.name}
                          </Link>
                        </td>
                        <td className="py-3 pr-4 text-right tabular-nums">{row.bookings}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{row.won}</td>
                        <td className="py-3 pr-4 text-right tabular-nums">{row.lost}</td>
                        <td className="py-3 text-right tabular-nums">{currency(row.revenueCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          </>
        )}
      </div>
    </ConsoleShell>
  )
}

