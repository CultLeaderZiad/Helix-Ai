import { greetingTitle, tx, welcomeTitle, type DashLang } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { OverviewBoard, emptyOverview, type OverviewBar, type OverviewJob, type OverviewModel } from '@/components/dashboard/overview-board'
import type { DealStage, IntegrationStatus, SystemType } from '@/lib/schema'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

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

const SYSTEM_NAME: Record<SystemType, { en: string; ar: string }> = {
  missed_call_response: { en: 'Missed-call response', ar: 'الرد على المكالمات الفائتة' },
  booking_receptionist: { en: 'Booking receptionist', ar: 'موظف الاستقبال والحجوزات' },
  lead_attribution: { en: 'Lead attribution', ar: 'تتبع مصدر العملاء' },
  lead_reactivation: { en: 'Lead reactivation', ar: 'إعادة تنشيط العملاء' },
  ar_collections: { en: 'Collections', ar: 'التحصيل' },
  rival_watch: { en: 'Rival Watch', ar: 'متابعة المنافسين' },
  handbook_bot: { en: 'Handbook answers', ar: 'إجابات الدليل' },
  seo_scorecard: { en: 'Visibility scorecard', ar: 'بطاقة الظهور' },
  deck_factory: { en: 'Deck factory', ar: 'عروض تقديمية' },
  shorts_factory: { en: 'Clip factory', ar: 'مقاطع قصيرة' },
  lead_generation: { en: 'Lead generation', ar: 'توليد العملاء' },
}

const ACTIVITY_SOURCE: Record<SystemType, { table: string; ts: string; en: string; ar: string }> = {
  missed_call_response: { table: 'conversations', ts: 'created_at', en: 'conversations handled', ar: 'محادثات تمت معالجتها' },
  booking_receptionist: { table: 'bookings', ts: 'scheduled_at', en: 'bookings captured', ar: 'حجوزات مسجّلة' },
  lead_attribution: { table: 'attribution_events', ts: 'occurred_at', en: 'attribution events', ar: 'أحداث تتبع' },
  lead_reactivation: { table: 'reactivation_touches', ts: 'created_at', en: 'reactivation touches', ar: 'محاولات إعادة تنشيط' },
  ar_collections: { table: 'payment_promises', ts: 'created_at', en: 'payment promises logged', ar: 'وعود دفع مسجّلة' },
  rival_watch: { table: 'activity_log', ts: 'created_at', en: 'competitor scans run', ar: 'فحوصات منافسين' },
  handbook_bot: { table: 'activity_log', ts: 'created_at', en: 'handbook questions answered', ar: 'أسئلة دليل تمت الإجابة عنها' },
  seo_scorecard: { table: 'activity_log', ts: 'created_at', en: 'visibility audits completed', ar: 'فحوصات ظهور مكتملة' },
  deck_factory: { table: 'activity_log', ts: 'created_at', en: 'proposal decks built', ar: 'عروض تم إعدادها' },
  shorts_factory: { table: 'activity_log', ts: 'created_at', en: 'video clips exported', ar: 'مقاطع تم تصديرها' },
  lead_generation: { table: 'leadgen_leads', ts: 'created_at', en: 'leads saved', ar: 'عملاء تم حفظهم' },
}

export const metadata = {
  title: 'Helix: Overview',
  robots: { index: false, follow: false },
}

function dayKey(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dubai', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(iso))
}

function recognizedChannel(row: Record<string, unknown>): 'whatsapp' | 'phone' | null {
  const raw = String(row.channel ?? row.source ?? row.via ?? row.medium ?? '').toLowerCase()
  if (!raw) return null
  if (raw.includes('whatsapp') || raw === 'wa') return 'whatsapp'
  if (raw.includes('phone') || raw.includes('voice') || raw.includes('call')) return 'phone'
  return null
}

function buildBars(rows: Array<Record<string, unknown>>, range: number, lang: DashLang): { bars: OverviewBar[]; mode: 'split' | 'total'; max: number } {
  const locale = lang === 'ar' ? 'ar' : 'en'
  const now = Date.now()
  const step = range === 90 ? 7 : 1
  const count = range === 90 ? 13 : range
  const buckets = Array.from({ length: count }, (_, index) => {
    const start = new Date(now - (count - 1 - index) * step * 86400000)
    return {
      key: dayKey(start.toISOString()),
      label: new Intl.DateTimeFormat(locale, { weekday: range === 7 ? 'short' : undefined, month: range === 7 ? undefined : 'short', day: 'numeric', timeZone: 'Asia/Dubai' }).format(start),
      whatsapp: 0,
      phone: 0,
      total: 0,
    }
  })
  let allRecognized = rows.length > 0
  for (const row of rows) {
    const when = String(row.scheduled_at || '')
    if (!when) continue
    const stamp = new Date(when).getTime()
    const bucket = [...buckets].reverse().find(item => new Date(item.key).getTime() <= stamp)
    if (!bucket) continue
    bucket.total += 1
    const channel = recognizedChannel(row)
    if (channel === 'whatsapp') bucket.whatsapp += 1
    else if (channel === 'phone') bucket.phone += 1
    else allRecognized = false
  }
  const mode = allRecognized ? 'split' : 'total'
  const bars = buckets.map(bucket => (
    mode === 'split'
      ? { day: bucket.label, whatsapp: bucket.whatsapp, phone: bucket.phone }
      : { day: bucket.label, whatsapp: bucket.total, phone: 0 }
  ))
  const max = bars.reduce((peak, bar) => {
    const value = bar.whatsapp + bar.phone
    return value > peak ? value : peak
  }, 0)
  return { bars, mode, max: max || 1 }
}

function jobCard(job: Record<string, unknown>, lang: DashLang): OverviewJob {
  const brief = (job.brief && typeof job.brief === 'object' ? job.brief : {}) as { icp?: string; max_leads?: number }
  const status = String(job.status || '')
  const kind = String(job.job_kind || '')
  const done = typeof job.leads_count === 'number' ? job.leads_count : 0
  const budget = typeof brief.max_leads === 'number' ? brief.max_leads : typeof job.credit_budget === 'number' ? job.credit_budget : 0
  const pct = budget > 0 ? Math.round((done / budget) * 100) : status === 'succeeded' ? 100 : 0
  const width = `${pct > 100 ? 100 : pct < 0 ? 0 : pct}%`
  const title = brief.icp?.trim() || tx(lang, kind === 'enrich' ? 'Enrich a list' : 'Find leads', kind === 'enrich' ? 'إثراء قائمة' : 'البحث عن عملاء')
  const right = status === 'running'
    ? tx(lang, 'Running', 'قيد التنفيذ')
    : status === 'succeeded'
      ? tx(lang, 'Done', 'مكتملة')
      : status === 'failed'
        ? tx(lang, 'Could not finish', 'تعذّر الإكمال')
        : status === 'paused'
          ? tx(lang, 'Paused', 'متوقفة')
          : tx(lang, 'Queued', 'قيد الانتظار')
  return {
    title,
    meta: tx(lang, kind === 'enrich' ? 'Enrich websites' : 'Find leads', kind === 'enrich' ? 'إثراء المواقع' : 'البحث عن عملاء'),
    width,
    left: budget > 0 ? tx(lang, `${done} of ${budget} saved`, `${done} من ${budget} محفوظة`) : tx(lang, `${done} saved`, `${done} محفوظة`),
    right,
  }
}

function signedDelta(current: number, previous: number | null): string | null {
  if (previous == null) return null
  const diff = current - previous
  if (diff === 0) return null
  return diff > 0 ? `+${diff}` : String(diff)
}

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>
}) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const [{ range: rangeRaw }, lang, theme] = await Promise.all([
    searchParams,
    readDashLang(),
    readDashTheme(),
  ])
  const range: 7 | 30 | 90 = rangeRaw === '30' ? 30 : rangeRaw === '90' ? 90 : 7
  const clientId = session.claims.client_id!
  const since = new Date(Date.now() - range * 86400000).toISOString()
  const prevSince = new Date(Date.now() - range * 2 * 86400000).toISOString()

  const [clientRes, profileRes, systemsRes, integrationsRes, pendingFactsRes, newContactsRes, bookingsCountRes, bookingsRowsRes, overdueRes, openDealsRes, conversationsRes, jobsRes, prevContactsRes, prevBookingsRes, prevConversationsRes] =
    await Promise.all([
      supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
      supabase.from('profiles').select('full_name').eq('id', session.user.id).maybeSingle(),
      supabase.from('client_systems').select('id, system_type, active, visible_to_client').eq('client_id', clientId),
      supabase.from('client_integrations').select('id, system_type, status').eq('client_id', clientId),
      supabase.from('contact_facts').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', since),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_at', since).neq('status', 'cancelled'),
      supabase.from('bookings').select('*').eq('client_id', clientId).gte('scheduled_at', since).neq('status', 'cancelled').limit(500),
      supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'overdue'),
      supabase.from('deals').select('value_cents, stage').eq('client_id', clientId),
      supabase.from('activities').select('id', { count: 'exact', head: true }).gte('occurred_at', since),
      supabase.from('leadgen_jobs').select('id, status, job_kind, brief, leads_count, credit_budget, created_at').eq('client_id', clientId).order('created_at', { ascending: false }).limit(3),
      supabase.from('contacts').select('id', { count: 'exact', head: true }).gte('created_at', prevSince).lt('created_at', since),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_at', prevSince).lt('scheduled_at', since).neq('status', 'cancelled'),
      supabase.from('activities').select('id', { count: 'exact', head: true }).gte('occurred_at', prevSince).lt('occurred_at', since),
    ])

  const client = clientRes.data
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
  const newContacts = newContactsRes.error ? null : (newContactsRes.count ?? 0)
  const windowBookings = bookingsCountRes.error ? null : (bookingsCountRes.count ?? 0)
  const overdueInvoices = overdueRes.count ?? 0
  const conversationsHandled = conversationsRes.error ? null : (conversationsRes.count ?? 0)
  const degradedIntegrations = integrations.filter(i => i.status === 'degraded' || i.status === 'disconnected').length
  const openDealCount = (openDealsRes.data ?? []).filter(deal => OPEN_STAGES.includes(deal.stage as DealStage)).length

  const activityEntries = await Promise.all(
    systems.filter(s => s.visible_to_client).map(async s => {
      const source = ACTIVITY_SOURCE[s.system_type as SystemType]
      if (!source) return null
      const { data, count, error } = await supabase
        .from(source.table)
        .select(source.ts, { count: 'exact' })
        .eq('client_id', clientId)
        .gte(source.ts, since)
        .order(source.ts, { ascending: false })
        .limit(1)
      if (error) return null
      const rows = (data ?? []) as unknown as Array<Record<string, string>>
      const last: string | null = rows.length ? rows[0][source.ts] : null
      return { systemId: s.id, count: count ?? 0, last, en: source.en, ar: source.ar }
    }),
  )
  const activityBySystem = new Map(
    activityEntries.filter((a): a is { systemId: string; count: number; last: string | null; en: string; ar: string } => a !== null)
      .map(a => [a.systemId, a]),
  )

  const visibleSystems = systems.filter(s => s.visible_to_client)
  const jobs = jobsRes.error ? [] : ((jobsRes.data ?? []) as Array<Record<string, unknown>>)
  const first = profileRes.data?.full_name?.trim().split(/\s+/)[0] || ''
  const decisions = [
    pendingFacts > 0
      ? {
          title: tx(lang, 'Confirm a detail', 'أكّد تفصيلاً'),
          body: tx(lang, `${pendingFacts} suggestion${pendingFacts === 1 ? '' : 's'} waiting. Nothing unclear is saved until you check.`, `${pendingFacts} اقتراح بانتظارك. لا يُحفظ شيء غير واضح قبل مراجعتك.`),
          action: 'Review',
          href: '/dashboard/queue',
        }
      : null,
    overdueInvoices > 0
      ? {
          title: tx(lang, 'Overdue invoices', 'فواتير متأخرة'),
          body: tx(lang, `${overdueInvoices} invoice${overdueInvoices === 1 ? '' : 's'} past due.`, `${overdueInvoices} فاتورة تجاوزت الاستحقاق.`),
          action: 'Review',
          href: '/dashboard/billing',
        }
      : null,
    degradedIntegrations > 0
      ? {
          title: tx(lang, 'A connection needs attention', 'اتصال يحتاج متابعة'),
          body: tx(lang, `${degradedIntegrations} connection${degradedIntegrations === 1 ? '' : 's'} not connected.`, `${degradedIntegrations} غير موصول.`),
          action: 'Review',
          href: '/dashboard/integrations',
        }
      : null,
  ].filter((item): item is NonNullable<typeof item> => item !== null)

  const measured = (newContacts ?? 0) + (windowBookings ?? 0) + (conversationsHandled ?? 0) + openDealCount
  const empty = measured === 0 && visibleSystems.length === 0 && pendingFacts === 0 && jobs.length === 0 && !clientRes.error
  const when = tx(lang, `In the last ${range} days`, range === 7 ? 'خلال الأسبوع الأخير' : range === 30 ? 'خلال آخر 30 يوماً' : 'خلال آخر 90 يوماً')
  const summary = `${when} ${tx(
    lang,
    `your workspace recorded ${conversationsHandled ?? 0} conversations and ${windowBookings ?? 0} appointments.`,
    `سجّلت مساحة العمل ${conversationsHandled ?? 0} محادثة و ${windowBookings ?? 0} موعداً.`,
  )}${decisions.length ? ` ${tx(lang, `${decisions.length} thing${decisions.length === 1 ? '' : 's'} need your decision.`, `${decisions.length} أمور تحتاج قرارك.`)}` : ''}`

  const chart = bookingsRowsRes.error ? null : buildBars((bookingsRowsRes.data ?? []) as Array<Record<string, unknown>>, range, lang)
  const formatWhen = (value: string) => new Date(value).toLocaleString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' })

  const live: OverviewModel = empty
    ? { ...emptyOverview(first, lang), range }
    : {
        variant: 'live',
        firstName: first,
        title: greetingTitle(lang, first || null),
        summary: clientRes.error
          ? tx(lang, 'Some workspace data could not be loaded. The counts below are what we could read.', 'تعذّر تحميل بعض بيانات مساحة العمل. الأرقام أدناه هي ما أمكن قراءته.')
          : summary,
        range,
        kpis: [
          {
            label: tx(lang, 'Appointments booked', 'المواعيد المحجوزة'),
            value: windowBookings == null ? '-' : String(windowBookings),
            hint: tx(lang, `Last ${range} days`, range === 7 ? 'الأسبوع الأخير' : range === 30 ? 'آخر 30 يوماً' : 'آخر 90 يوماً'),
            delta: signedDelta(windowBookings ?? 0, bookingsCountRes.error || prevBookingsRes.error ? null : (prevBookingsRes.count ?? 0)),
          },
          {
            label: tx(lang, 'New contacts', 'جهات اتصال جديدة'),
            value: newContacts == null ? '-' : String(newContacts),
            hint: tx(lang, `Last ${range} days`, range === 7 ? 'الأسبوع الأخير' : range === 30 ? 'آخر 30 يوماً' : 'آخر 90 يوماً'),
            delta: signedDelta(newContacts ?? 0, newContactsRes.error || prevContactsRes.error ? null : (prevContactsRes.count ?? 0)),
          },
          {
            label: tx(lang, 'Conversations handled', 'المحادثات المُدارة'),
            value: conversationsHandled == null ? '-' : String(conversationsHandled),
            hint: tx(lang, 'Recorded activity in this window', 'نشاط مسجّل في هذه المدة'),
            delta: signedDelta(conversationsHandled ?? 0, conversationsRes.error || prevConversationsRes.error ? null : (prevConversationsRes.count ?? 0)),
          },
          {
            label: tx(lang, 'Needs a decision', 'يحتاج قراراً'),
            value: pendingFactsRes.error ? '-' : String(pendingFacts),
            hint: pendingFacts ? tx(lang, 'Waiting in the review queue', 'بانتظارك في قائمة المراجعة') : tx(lang, 'Nothing waiting', 'لا شيء بانتظارك'),
          },
        ],
        bars: chart?.bars ?? null,
        barsMode: chart?.mode ?? 'total',
        barMax: chart?.max ?? 1,
        chartError: Boolean(bookingsRowsRes.error),
        decisions,
        activity: visibleSystems.flatMap(system => {
          const activity = activityBySystem.get(system.id)
          if (!activity?.last && !activity?.count) return []
          const name = SYSTEM_NAME[system.system_type as SystemType]
          return [{
            verb: tx(lang, 'Recorded', 'تم التسجيل'),
            text: `${activity?.count ?? 0} ${lang === 'ar' ? activity?.ar : activity?.en}`,
            meta: name ? (lang === 'ar' ? name.ar : name.en) : system.system_type,
            time: activity?.last ? formatWhen(activity.last) : '',
            tone: 'ok' as const,
          }]
        }),
        systems: visibleSystems.map(system => {
          const activity = activityBySystem.get(system.id)
          const name = SYSTEM_NAME[system.system_type as SystemType]
          return {
            name: name ? (lang === 'ar' ? name.ar : name.en) : system.system_type.replaceAll('_', ' '),
            meta: activity?.last
              ? tx(lang, `Last activity ${formatWhen(activity.last)}`, `آخر نشاط ${formatWhen(activity.last)}`)
              : tx(lang, 'No activity recorded yet', 'لا يوجد نشاط مسجّل بعد'),
            status: system.active ? 'run' as const : 'pause' as const,
          }
        }),
        jobs: jobs.map(job => jobCard(job, lang)),
      }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null} lang={lang} theme={theme}>
      <OverviewBoard model={live} lang={lang} />
    </ConsoleShell>
  )
}
