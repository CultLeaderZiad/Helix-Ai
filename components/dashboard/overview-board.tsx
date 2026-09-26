import Link from 'next/link'
import '@/components/dashboard/dash.css'
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  Check,
  Headset,
  MessageCircle,
  PhoneMissed,
  Plus,
  RefreshCw,
} from 'lucide-react'
import { EmptyState, InlineError, KpiCard, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { tx, type DashLang } from '@/lib/dashboard/lang'

export type OverviewBar = { day: string; whatsapp: number; phone: number }
export type OverviewDecision = { title: string; body: string; action: string; href: string }
export type OverviewActivity = { verb: string; text: string; meta: string; time: string; tone: 'ok' | 'plain' }
export type OverviewSystem = { name: string; meta: string; status: 'run' | 'pause' }
export type OverviewJob = { title: string; meta: string; width: string; left: string; right: string }
export type OverviewKpi = { label: string; value: string; small?: string; hint?: string; foot?: string; delta?: string | null }

export type OverviewModel = {
  variant: 'example' | 'empty' | 'live'
  firstName: string
  title?: string
  summary: string
  kpis: OverviewKpi[]
  bars: OverviewBar[] | null
  barsMode?: 'split' | 'total'
  barMax: number
  range?: 7 | 30 | 90
  chartError?: boolean
  decisions: OverviewDecision[]
  activity: OverviewActivity[]
  systems: OverviewSystem[]
  jobs: OverviewJob[]
}

export const EXAMPLE_OVERVIEW: OverviewModel = {
  variant: 'example',
  firstName: 'Nadia',
  summary: 'This week your systems replied to 38 enquiries and booked 11 appointments. 2 things need your decision.',
  kpis: [
    { label: 'Appointments booked', value: '11', hint: 'vs previous 7 days', delta: '+3' },
    { label: 'Missed calls answered', value: '17', small: 'of 18', hint: "1 caller isn't on WhatsApp" },
    { label: 'Conversations handled', value: '38', hint: 'vs previous 7 days', delta: '+6' },
    { label: 'Median first reply', value: '18', small: 'sec', hint: 'Day and night, including weekends' },
  ],
  barMax: 4,
  barsMode: 'split',
  bars: [
    { day: 'Sat', whatsapp: 0, phone: 1 },
    { day: 'Sun', whatsapp: 1, phone: 1 },
    { day: 'Mon', whatsapp: 1, phone: 0 },
    { day: 'Tue', whatsapp: 1, phone: 1 },
    { day: 'Wed', whatsapp: 2, phone: 1 },
    { day: 'Thu', whatsapp: 1, phone: 0 },
    { day: 'Fri', whatsapp: 0, phone: 1 },
  ],
  decisions: [
    { title: 'Confirm a detail', body: "Caller's name was unclear in a voice call. Nothing is saved until you check.", action: 'Review', href: '/dashboard/queue' },
    { title: 'Customer asked for a person', body: 'Question about insurance coverage, waiting since 6:02 PM.', action: 'Reply', href: '/dashboard/queue' },
  ],
  activity: [
    { verb: 'Booked', text: 'teeth cleaning for Thursday, 6:15 PM', meta: 'New patient · via WhatsApp · Missed-call triage', time: '9:44 PM', tone: 'ok' },
    { verb: 'Replied', text: 'to a missed call from +971 50 ••• 4182', meta: 'In Arabic · 20 seconds after the call', time: '9:41 PM', tone: 'ok' },
    { verb: 'Handed to your team:', text: 'insurance question', meta: 'Customer typed “agent”', time: '6:02 PM', tone: 'plain' },
    { verb: 'Reminder sent', text: "for tomorrow's 10:30 AM check-up", meta: 'Confirmed by the patient', time: '5:00 PM', tone: 'plain' },
    { verb: 'Booked', text: 'consultation for Sunday, 11:00 AM', meta: 'Returning patient · via phone · Booking receptionist', time: '2:18 PM', tone: 'ok' },
  ],
  systems: [
    { name: 'Missed-call triage', meta: 'Last activity 9:41 PM', status: 'run' },
    { name: 'Booking receptionist', meta: 'Last activity 2:18 PM', status: 'run' },
    { name: 'Lead reactivation', meta: 'Paused by you on Sep 21', status: 'pause' },
  ],
  jobs: [
    { title: 'Dental clinics in Dubai', meta: 'Find leads · started 10:12 AM', width: '70%', left: '14 of 20 enriched', right: 'Running' },
    { title: 'Clinic websites list (12 URLs)', meta: 'Enrich websites · yesterday', width: '100%', left: '12 of 12 checked', right: 'Done · CSV ready' },
    { title: 'Physiotherapy centres, Riyadh', meta: 'Find leads · queued', width: '0%', left: 'Waiting to start', right: 'Queued' },
  ],
}

export function emptyOverview(firstName: string, lang: DashLang = 'en'): OverviewModel {
  const foot = tx(lang, 'Appears after your first conversation', 'تظهر بعد أول محادثة')
  return {
    variant: 'empty',
    firstName,
    title: firstName
      ? tx(lang, `Welcome to Helix, ${firstName}`, `مرحباً بك في Helix يا ${firstName}`)
      : tx(lang, 'Welcome to Helix', 'مرحباً بك في Helix'),
    summary: tx(
      lang,
      'Your workspace is ready. Connect WhatsApp and your calendar, then the first conversation will show up here.',
      'مساحة العمل جاهزة. اربط واتساب والتقويم، ثم ستظهر أول محادثة هنا.',
    ),
    kpis: [
      { label: tx(lang, 'Appointments booked', 'المواعيد المحجوزة'), value: '-', hint: foot },
      { label: tx(lang, 'Missed calls answered', 'المكالمات الفائتة التي تم الرد عليها'), value: '-', hint: foot },
      { label: tx(lang, 'Conversations handled', 'المحادثات المُدارة'), value: '-', hint: foot },
      { label: tx(lang, 'Median first reply', 'متوسط زمن أول رد'), value: '-', hint: foot },
    ],
    bars: null,
    barMax: 4,
    decisions: [],
    activity: [],
    systems: [],
    jobs: [],
  }
}

function actionLabel(action: string, lang: DashLang) {
  const key = action.toLowerCase()
  if (key.startsWith('reply')) return tx(lang, 'Reply', 'رد')
  if (key.startsWith('review')) return tx(lang, 'Review', 'مراجعة')
  return action
}

function statusLabel(status: OverviewSystem['status'], lang: DashLang) {
  return status === 'run' ? tx(lang, 'Running', 'يعمل') : tx(lang, 'Paused', 'متوقف مؤقتاً')
}

export function OverviewBoard({ model, lang = 'en' }: { model: OverviewModel; lang?: DashLang }) {
  const empty = model.variant === 'empty'
  const range = model.range ?? 7
  const max = model.barMax || 1
  const title = model.title ?? (empty ? `Welcome to Helix, ${model.firstName}` : `Good morning, ${model.firstName}`)
  const split = model.barsMode !== 'total'
  const hasBars = Boolean(model.bars && model.bars.some(bar => bar.whatsapp + bar.phone > 0))
  const rangeLabel = tx(lang, `last ${range} days`, range === 7 ? 'الأسبوع الأخير' : range === 30 ? 'آخر 30 يوماً' : 'آخر 90 يوماً')

  return (
    <>
      <PageHead
        title={title}
        lede={model.summary}
        actions={empty ? null : (
          <>
            <div className="seg" role="group" aria-label={tx(lang, 'Date range', 'المدة')}>
              {([7, 30, 90] as const).map(value => (
                <Link key={value} href={`/dashboard?range=${value}`} className={range === value ? 'on' : undefined} aria-current={range === value ? 'true' : undefined}>
                  {tx(lang, `${value} days`, value === 7 ? '٧ أيام' : value === 30 ? '٣٠ يوماً' : '٩٠ يوماً')}
                </Link>
              ))}
            </div>
            <Link className="btn-o" href="/dashboard/reports">{tx(lang, 'Report', 'تقرير')}</Link>
          </>
        )}
      />
      <div className="kpis">
        {model.kpis.map(kpi => (
          <KpiCard key={kpi.label} label={kpi.label} value={kpi.value} small={kpi.small} hint={kpi.hint ?? kpi.foot} delta={kpi.delta} />
        ))}
      </div>
      <div className="row2">
        <Panel
          title={<>{tx(lang, 'Appointments booked', 'المواعيد المحجوزة')} <small>{rangeLabel}</small></>}
          extra={hasBars ? (
            <div className="legend">
              {split ? (
                <>
                  <span><i style={{ background: '#0E6E4F' }} />{tx(lang, 'Via WhatsApp', 'عبر واتساب')}</span>
                  <span><i style={{ background: '#9FD1B9' }} />{tx(lang, 'Via phone', 'عبر الهاتف')}</span>
                </>
              ) : (
                <span><i style={{ background: '#0E6E4F' }} />{tx(lang, 'Booked', 'محجوز')}</span>
              )}
            </div>
          ) : null}
        >
          {model.chartError ? (
            <InlineError>{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</InlineError>
          ) : hasBars && model.bars ? (
            <>
              <div className="chart" aria-hidden>
                <div className="yax">{[max, Math.ceil(max * 0.75), Math.ceil(max * 0.5), Math.ceil(max * 0.25), 0].filter((n, i, arr) => arr.indexOf(n) === i).map(n => <span key={n}>{n}</span>)}</div>
                <div className="plot">
                  {model.bars.map(bar => (
                    <div className="col" key={bar.day} title={`${bar.day}: ${bar.whatsapp + bar.phone}`}>
                      {split ? <i className="vo" style={{ height: `${(bar.phone / max) * 100}%` }} /> : null}
                      <i className="wa" style={{ height: `${((split ? bar.whatsapp : bar.whatsapp + bar.phone) / max) * 100}%` }} />
                      <span>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <table className="sr-only">
                <caption>{tx(lang, 'Appointments booked', 'المواعيد المحجوزة')}, {rangeLabel}</caption>
                <thead><tr><th>{tx(lang, 'Day', 'اليوم')}</th><th>{tx(lang, 'WhatsApp', 'واتساب')}</th><th>{tx(lang, 'Phone', 'الهاتف')}</th></tr></thead>
                <tbody>
                  {model.bars.map(bar => (
                    <tr key={bar.day}><td>{bar.day}</td><td>{bar.whatsapp}</td><td>{bar.phone}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <EmptyState title={tx(lang, 'No bookings by day yet.', 'لا توجد حجوزات حسب اليوم بعد.')} body={tx(lang, 'The chart appears after the first appointment.', 'يظهر المخطط بعد أول موعد.')} />
          )}
        </Panel>
        <Panel
          title={tx(lang, 'Needs your decision', 'يحتاج قرارك')}
          extra={model.decisions.length ? <Link className="link" href="/dashboard/queue">{tx(lang, 'Open queue', 'افتح القائمة')}</Link> : null}
        >
          {model.decisions.length ? (
            <ul className="att">
              {model.decisions.map(item => (
                <li key={item.title}>
                  <span className="ic">{item.action.toLowerCase().startsWith('reply') ? <Headset size={16} /> : <AlertCircle size={16} />}</span>
                  <div><b>{item.title}</b><span>{item.body}</span></div>
                  <Link className="act" href={item.href}>{actionLabel(item.action, lang)}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="allgood"><Check size={16} />{tx(lang, 'Nothing needs you right now.', 'لا شيء يحتاجك الآن.')}</div>
          )}
          {model.decisions.length ? <div className="allgood"><Check size={16} />{tx(lang, 'Everything else this week was handled automatically.', 'كل ما عدا ذلك هذا الأسبوع تمّت معالجته تلقائياً.')}</div> : null}
        </Panel>
      </div>
      <div className="row3">
        <Panel
          title={tx(lang, 'Recent activity', 'النشاط الأخير')}
          extra={model.activity.length ? <Link className="link" href="/dashboard/contacts">{tx(lang, 'View all', 'عرض الكل')}</Link> : null}
        >
          {model.activity.length ? (
            <ul className="feed">
              {model.activity.map(row => (
                <li key={row.verb + row.time + row.text}>
                  <span className={`ic${row.tone === 'ok' ? ' g' : ''}`}>
                    {row.verb.toLowerCase().includes('book') || row.verb.includes('حجز') ? <CalendarCheck size={15} /> : row.verb.toLowerCase().includes('repl') || row.verb.includes('رد') ? <MessageCircle size={15} /> : row.verb.toLowerCase().includes('remind') || row.verb.includes('تذكير') ? <Bell size={15} /> : <Headset size={15} />}
                  </span>
                  <span className="t"><em>{row.verb}</em> {row.text}<small>{row.meta}</small></span>
                  <time>{row.time}</time>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={tx(lang, 'No activity yet.', 'لا يوجد نشاط بعد.')} body={tx(lang, 'Once your systems go live, every reply and booking shows up here.', 'عند تشغيل أنظمتك سيظهر هنا كل رد وكل حجز.')} />
          )}
        </Panel>
        <Panel
          title={tx(lang, 'Your systems', 'أنظمتك')}
          extra={<Link className="link" href="/dashboard/systems">{tx(lang, 'Manage', 'إدارة')}</Link>}
        >
          {model.systems.length ? (
            <ul className="sys">
              {model.systems.map(system => (
                <li key={system.name}>
                  <span className="ic">{system.status === 'pause' ? <RefreshCw size={16} /> : <PhoneMissed size={16} />}</span>
                  <div><b>{system.name}</b><span>{system.meta}</span></div>
                  <StatusChip tone={system.status === 'run' ? 'ok' : 'neutral'}>{statusLabel(system.status, lang)}</StatusChip>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState title={tx(lang, 'No systems are visible yet.', 'لا تظهر أنظمة بعد.')} body={tx(lang, 'They appear here as onboarding finishes.', 'تظهر هنا عند اكتمال التجهيز.')} />
          )}
          <div className="add">
            <span>{tx(lang, 'Add lead qualification, collections and more', 'أضف تأهيل العملاء والتحصيل والمزيد')}</span>
            <Link className="link" href="/dashboard/systems">{tx(lang, 'Browse systems', 'تصفح الأنظمة')}</Link>
          </div>
        </Panel>
      </div>
      <Panel
        className="lg"
        title={<>{tx(lang, 'Lead generation', 'توليد العملاء')} <small>{empty || model.jobs.length === 0 ? tx(lang, 'no jobs yet', 'لا توجد مهام بعد') : tx(lang, 'your latest jobs', 'أحدث المهام')}</small></>}
        extra={<Link className="btn-d" href="/dashboard/lead-generation"><Plus size={14} />{tx(lang, 'New search', 'بحث جديد')}</Link>}
      >
        {model.jobs.length ? (
          <div className="jobs">
            {model.jobs.map(job => (
              <div className="job" key={job.title}>
                <b>{job.title}</b>
                <small>{job.meta}</small>
                <div className="bar"><i style={{ width: job.width }} /></div>
                <div className="meta"><span>{job.left}</span><span>{job.right}</span></div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title={tx(lang, 'No jobs yet.', 'لا توجد مهام بعد.')} body={tx(lang, 'Start by finding businesses in a city, or enrich a list you already have.', 'ابدأ بالبحث عن أنشطة في مدينة ما، أو أثرِ قائمة لديك.')} />
        )}
      </Panel>
      {empty ? (
        <Panel className="lg" title={tx(lang, 'Setup', 'الإعداد')}>
          <ul className="setup">
            <li>
              <div><b>{tx(lang, 'Connect WhatsApp', 'ربط واتساب')}</b><span>{tx(lang, 'Your own business number', 'رقم عملك')}</span></div>
              <Link className="act" href="/dashboard/integrations">{tx(lang, 'Connect', 'ربط')}</Link>
            </li>
            <li>
              <div><b>{tx(lang, 'Connect your calendar', 'ربط التقويم')}</b><span>{tx(lang, 'Cal.com or Google Calendar', 'Cal.com أو تقويم Google')}</span></div>
              <Link className="act" href="/dashboard/integrations">{tx(lang, 'Connect', 'ربط')}</Link>
            </li>
            <li>
              <div><b>{tx(lang, 'Confirm business hours', 'تأكيد ساعات العمل')}</b><span>{tx(lang, 'So replies stay inside quiet hours', 'لتبقى الردود ضمن ساعات الهدوء')}</span></div>
              <Link className="act" href="/settings">{tx(lang, 'Review', 'مراجعة')}</Link>
            </li>
            <li>
              <div><b>{tx(lang, 'Test a missed call', 'اختبار مكالمة فائتة')}</b><span>{tx(lang, 'After the first two are connected', 'بعد ربط الخطوتين الأوليين')}</span></div>
              <span className="act">{tx(lang, 'Waiting', 'بانتظار')}</span>
            </li>
          </ul>
        </Panel>
      ) : null}
    </>
  )
}
