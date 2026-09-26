import Link from 'next/link'
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  Check,
  Headset,
  MessageCircle,
  Mic,
  PhoneMissed,
  Plus,
  RefreshCw,
} from 'lucide-react'

export type OverviewBar = { day: string; whatsapp: number; phone: number }
export type OverviewDecision = { title: string; body: string; action: string; href: string }
export type OverviewActivity = { verb: string; text: string; meta: string; time: string; tone: 'ok' | 'plain' }
export type OverviewSystem = { name: string; meta: string; status: 'run' | 'pause' }
export type OverviewJob = { title: string; meta: string; width: string; left: string; right: string }
export type OverviewKpi = { label: string; value: string; small?: string; foot: string; delta?: string; spark?: string }

export type OverviewModel = {
  variant: 'example' | 'empty' | 'live'
  firstName: string
  summary: string
  kpis: OverviewKpi[]
  bars: OverviewBar[] | null
  barMax: number
  decisions: OverviewDecision[]
  activity: OverviewActivity[]
  systems: OverviewSystem[]
  jobs: OverviewJob[]
}

const SPARKS = [
  'M0 24 L15 20 L30 22 L45 14 L60 16 L75 8 L92 5',
  'M0 18 L15 22 L30 14 L45 18 L60 10 L75 12 L92 8',
  'M0 20 L15 16 L30 18 L45 10 L60 14 L75 9 L92 11',
  'M0 8 L15 12 L30 10 L45 16 L60 14 L75 18 L92 20',
]

export const EXAMPLE_OVERVIEW: OverviewModel = {
  variant: 'example',
  firstName: 'Nadia',
  summary: 'This week your systems replied to 38 enquiries and booked 11 appointments. 2 things need your decision.',
  kpis: [
    { label: 'Appointments booked', value: '11', foot: 'vs previous 7 days', delta: '+3', spark: SPARKS[0] },
    { label: 'Missed calls answered', value: '17', small: 'of 18', foot: "1 caller isn't on WhatsApp", spark: SPARKS[1] },
    { label: 'Conversations handled', value: '38', foot: 'vs previous 7 days', delta: '+6', spark: SPARKS[2] },
    { label: 'Median first reply', value: '18', small: 'sec', foot: 'Day and night, including weekends', spark: SPARKS[3] },
  ],
  barMax: 4,
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
    { title: 'Confirm a detail', body: "Caller's name was unclear in a voice call. Nothing is saved until you check.", action: 'Review', href: '/dashboard/facts' },
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

export function emptyOverview(firstName: string): OverviewModel {
  return {
    variant: 'empty',
    firstName,
    summary: 'Your workspace is ready. Connect WhatsApp and your calendar, then the first conversation will show up here.',
    kpis: [
      { label: 'Appointments booked', value: '—', foot: 'Appears after your first conversation' },
      { label: 'Missed calls answered', value: '—', foot: 'Appears after your first conversation' },
      { label: 'Conversations handled', value: '—', foot: 'Appears after your first conversation' },
      { label: 'Median first reply', value: '—', foot: 'Appears after your first conversation' },
    ],
    bars: null,
    barMax: 4,
    decisions: [],
    activity: [],
    systems: [],
    jobs: [],
  }
}

function Spark({ d }: { d?: string }) {
  if (!d) return null
  return (
    <svg className="spark" viewBox="0 0 92 30" aria-hidden>
      <path d={d} fill="none" stroke="#0E6E4F" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function OverviewBoard({ model }: { model: OverviewModel }) {
  const empty = model.variant === 'empty'
  const max = model.barMax || 1
  return (
    <>
      <div className="ph">
        <div>
          <h1>{empty ? `Welcome to Helix, ${model.firstName}` : `Good morning, ${model.firstName}`}</h1>
          <p>{model.summary}</p>
        </div>
        {empty ? null : (
          <div className="row gap-12">
            <div className="seg" aria-hidden><span className="on">7 days</span><span>30 days</span><span>90 days</span></div>
            <Link className="btn-o" href="/dashboard/reports">Report</Link>
          </div>
        )}
      </div>
      <div className="kpis">
        {model.kpis.map(kpi => (
          <div className="kpi" key={kpi.label}>
            <div className="kpi-l">{kpi.label}</div>
            <div className="kpi-v">
              <b className="num">{kpi.value}{kpi.small ? <small>{kpi.small}</small> : null}</b>
              <Spark d={kpi.spark} />
            </div>
            <div className="foot">{kpi.delta ? <><span className="delta">{kpi.delta}</span>&nbsp;</> : null}{kpi.foot}</div>
          </div>
        ))}
      </div>
      <div className="row2">
        <div className="pnl">
          <div className="pnl-h">
            <b>Appointments booked <small>last 7 days</small></b>
            <div className="legend"><span><i style={{ background: '#0E6E4F' }} />Via WhatsApp</span><span><i style={{ background: '#9FD1B9' }} />Via phone</span></div>
          </div>
          {model.bars && model.bars.some(b => b.whatsapp + b.phone > 0) ? (
            <>
              <div className="chart">
                <div className="yax">{[4, 3, 2, 1, 0].map(n => <span key={n}>{n}</span>)}</div>
                <div className="plot">
                  {model.bars.map(bar => (
                    <div className="col" key={bar.day}>
                      <i className="vo" style={{ height: `${(bar.phone / max) * 100}%` }} />
                      <i className="wa" style={{ height: `${(bar.whatsapp / max) * 100}%` }} />
                      <span>{bar.day}</span>
                    </div>
                  ))}
                </div>
              </div>
              <table className="sr-chart" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', border: 0 }}>
                <caption>Appointments booked, last 7 days</caption>
                <thead><tr><th>Day</th><th>WhatsApp</th><th>Phone</th></tr></thead>
                <tbody>
                  {model.bars.map(bar => (
                    <tr key={bar.day}><td>{bar.day}</td><td>{bar.whatsapp}</td><td>{bar.phone}</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p>No bookings by day yet. The chart appears after the first appointment.</p>
          )}
        </div>
        <div className="pnl">
          <div className="pnl-h"><b>Needs your decision</b>{model.decisions.length ? <Link className="link" href="/dashboard/facts" style={{ fontSize: 13 }}>Open queue</Link> : null}</div>
          {model.decisions.length ? (
            <ul className="att">
              {model.decisions.map(item => (
                <li key={item.title}>
                  <span className="ic a">{item.action === 'Reply' ? <Headset size={16} /> : <AlertCircle size={16} />}</span>
                  <div><b>{item.title}</b><span>{item.body}</span></div>
                  <Link className="act" href={item.href}>{item.action}</Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="allgood"><Check size={16} />Nothing needs you right now.</div>
          )}
          {model.decisions.length ? <div className="allgood"><Check size={16} />Everything else this week was handled automatically.</div> : null}
        </div>
      </div>
      <div className="row3">
        <div className="pnl">
          <div className="pnl-h"><b>Recent activity</b>{model.activity.length ? <Link className="link" href="/dashboard/contacts" style={{ fontSize: 13 }}>View all</Link> : null}</div>
          {model.activity.length ? (
            <ul className="feed">
              {model.activity.map(row => (
                <li key={row.verb + row.time + row.text}>
                  <span className={`ic${row.tone === 'ok' ? ' g' : ''}`}>
                    {row.verb.startsWith('Booked') ? <CalendarCheck size={15} /> : row.verb.startsWith('Replied') ? <MessageCircle size={15} /> : row.verb.startsWith('Reminder') ? <Bell size={15} /> : <Headset size={15} />}
                  </span>
                  <span className="t"><em>{row.verb}</em> {row.text}<small>{row.meta}</small></span>
                  <time>{row.time}</time>
                </li>
              ))}
            </ul>
          ) : (
            <p>No activity yet. Once your systems go live, every reply and booking shows up here.</p>
          )}
        </div>
        <div className="pnl">
          <div className="pnl-h"><b>Your systems</b><Link className="link" href="/dashboard/studio" style={{ fontSize: 13 }}>Manage</Link></div>
          {model.systems.length ? (
            <ul className="sys">
              {model.systems.map(system => (
                <li key={system.name}>
                  <span className="ic">{system.name.includes('Booking') ? <Mic size={16} /> : system.status === 'pause' ? <RefreshCw size={16} /> : <PhoneMissed size={16} />}</span>
                  <div><b>{system.name}</b><span>{system.meta}</span></div>
                  <span className={system.status === 'run' ? 'st run' : 'st pause'}>{system.status === 'run' ? 'Running' : 'Paused'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No systems are visible yet. They appear here as onboarding finishes.</p>
          )}
          <div className="add"><span>Add lead qualification, collections and more</span><Link className="link" href="/studio">Browse systems</Link></div>
        </div>
      </div>
      <div className="pnl lg">
        <div className="pnl-h">
          <b>Lead generation <small>{empty ? 'no jobs yet' : 'your latest jobs'}</small></b>
          <Link className="btn-d" href="/dashboard/lead-generation"><Plus size={14} />New search</Link>
        </div>
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
          <p>No jobs yet. Start by finding businesses in a city, or enrich a list you already have.</p>
        )}
      </div>
      {empty ? (
        <div className="pnl" style={{ marginTop: 14 }}>
          <div className="pnl-h"><b>Setup</b></div>
          <ul className="sys">
            <li><div><b>Connect WhatsApp</b><span>Your own business number</span></div><Link href="/dashboard/integrations">Connect</Link></li>
            <li><div><b>Connect your calendar</b><span>Cal.com or Google Calendar</span></div><Link href="/dashboard/integrations">Connect</Link></li>
            <li><div><b>Confirm business hours</b><span>So replies stay inside quiet hours</span></div><Link href="/settings">Review</Link></li>
            <li><div><b>Test a missed call</b><span>After the first two are connected</span></div><span>Waiting</span></li>
          </ul>
        </div>
      ) : null}
    </>
  )
}
