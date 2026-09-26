import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, DataTable, EmptyState, PageHead, Panel, Stat } from '@/components/admin/v5'

export const metadata = {
  title: 'HELIX AI: Analytics',
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
      <AdminFrame>
        <PageHead
          title="Analytics"
          titleAr="التحليلات"
          lede={`Performance across every workspace · ${label}`}
          ledeAr="الأداء عبر كل مساحات العمل"
          actions={
            <nav className="hx-admin-switch" aria-label="Period">
              {PERIODS.map(p => (
                <Link
                  key={p}
                  href={
                    p === 'Custom'
                      ? '/admin/analytics?period=Custom&from=2026-08-01&to=2026-09-01'
                      : `/admin/analytics?period=${encodeURIComponent(p)}`
                  }
                  aria-current={period === p ? 'page' : undefined}
                  className={period === p ? 'on' : undefined}
                >
                  {p}
                  {p === 'Custom' ? '…' : ''}
                </Link>
              ))}
            </nav>
          }
        />

        {queryError ? (
          <p role="alert" className="hx-admin-alert">
            Analytics data could not be loaded. Retry shortly.
            <span className="hx-admin-ar" lang="ar" dir="rtl">تعذّر تحميل التحليلات. أعد المحاولة قريباً.</span>
          </p>
        ) : zeroActivity ? (
          <EmptyState
            title="No activity in this period."
            titleAr="لا نشاط في هذه الفترة."
            body="Events and bookings appear here once workspaces capture them. Widen the period to see earlier activity."
            bodyAr="تظهر الأحداث والحجوزات هنا بعد أن تسجّلها مساحات العمل."
          />
        ) : (
          <>
            <section className="hx-admin-stats" aria-label="Key figures">
              <Stat label="Closed-won revenue" labelAr="إيراد الصفقات المغلقة" value={currency(wonRevenueCents)} />
              <Stat label="Bookings" labelAr="الحجوزات" value={bookings.length - cancelledCount} />
              <Stat label="No-shows" labelAr="غياب" value={noShowCount} />
              <Stat label="Pending review" labelAr="بانتظار المراجعة" value={pendingFacts.length} />
            </section>

            <Panel title="Lead funnel" titleAr="مسار العملاء">
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(['lead_captured', 'qualified', 'booked', 'closed_won'] as const).map(stage => {
                  const count = eventCounts.get(stage) ?? 0
                  const max = Math.max(
                    1,
                    ...(['lead_captured', 'qualified', 'booked', 'closed_won'] as const).map(
                      s => eventCounts.get(s) ?? 0,
                    ),
                  )
                  return (
                    <li key={stage} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 120 }}>{stage.replace(/_/g, ' ')}</span>
                      <span className="hx-admin-bar">
                        <span style={{ width: `${Math.round((count / max) * 100)}%` }} />
                      </span>
                      <span style={{ width: 32, textAlign: 'end' }}>{count}</span>
                    </li>
                  )
                })}
              </ul>
            </Panel>

            <Panel title="Bookings by day" titleAr="الحجوزات حسب اليوم">
              <div className="hx-admin-trend" aria-hidden="true">
                {trend.map(day => (
                  <span key={day.date} style={{ height: `${Math.max(4, Math.round((day.booked / trendMax) * 100))}%` }} />
                ))}
              </div>
              <p className="hx-admin-lede">
                {trend[0]?.date} → {trend[trend.length - 1]?.date} · peak day {trendMax}
              </p>
            </Panel>

            <section className="hx-admin-stats" aria-label="Attention">
              <Stat label="Pending review" labelAr="بانتظار المراجعة" value={pendingFacts.length} hint="Open the client roster to review." hintAr="راجعها من قائمة العملاء." />
              <Stat label="Degraded integrations" labelAr="تكاملات متدهورة" value={degradedCount} hint="Per-workspace status on the roster." hintAr="الحالة لكل مساحة في القائمة." />
              <Stat label="Overdue invoices" labelAr="فواتير متأخرة" value={overdueCount} hint="Shown on each workspace billing tab." hintAr="تظهر في تبويب الفوترة لكل مساحة." />
            </section>

            <Panel title="Attribution by platform" titleAr="الإسناد حسب المنصة">
              {platformRows.length === 0 ? (
                <EmptyState
                  title="No closed outcomes in this period"
                  titleAr="لا نتائج مغلقة في هذه الفترة"
                />
              ) : (
                <DataTable
                  columns={[
                    { key: 'platform', label: 'Platform' },
                    { key: 'won', label: 'Won', align: 'end' },
                    { key: 'lost', label: 'Lost', align: 'end' },
                    { key: 'rate', label: 'Win rate', align: 'end' },
                    { key: 'revenue', label: 'Revenue', align: 'end' },
                  ]}
                >
                  {platformRows.map(row => (
                    <tr key={row.platform}>
                      <td>{row.platform}</td>
                      <td style={{ textAlign: 'end' }}>{row.won}</td>
                      <td style={{ textAlign: 'end' }}>{row.lost}</td>
                      <td style={{ textAlign: 'end' }}>{row.winRate == null ? '-' : `${row.winRate}%`}</td>
                      <td style={{ textAlign: 'end' }}>{currency(row.revenueCents)}</td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </Panel>

            <Panel title="Workspaces" titleAr="مساحات العمل">
              {clientRows.length === 0 ? (
                <EmptyState title="No workspaces provisioned yet" titleAr="لا مساحات مجهزة بعد" />
              ) : (
                <DataTable
                  columns={[
                    { key: 'name', label: 'Workspace' },
                    { key: 'bookings', label: 'Bookings', align: 'end' },
                    { key: 'won', label: 'Won', align: 'end' },
                    { key: 'lost', label: 'Lost', align: 'end' },
                    { key: 'revenue', label: 'Revenue', align: 'end' },
                  ]}
                >
                  {clientRows.map(row => (
                    <tr key={row.id}>
                      <td>
                        <Link href={`/admin/clients/${row.id}`}>{row.name}</Link>
                      </td>
                      <td style={{ textAlign: 'end' }}>{row.bookings}</td>
                      <td style={{ textAlign: 'end' }}>{row.won}</td>
                      <td style={{ textAlign: 'end' }}>{row.lost}</td>
                      <td style={{ textAlign: 'end' }}>{currency(row.revenueCents)}</td>
                    </tr>
                  ))}
                </DataTable>
              )}
            </Panel>
          </>
        )}
      </AdminFrame>
    </ConsoleShell>
  )
}

