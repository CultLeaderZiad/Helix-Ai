import { HelixMark } from '@/components/marketing/helix-mark'
import { Bell, Calendar, CalendarCheck, Headset, HelpCircle, Inbox, LayoutDashboard, MessageCircle, PhoneMissed, Plug, Search, SlidersHorizontal, Target, BarChart3, RefreshCw } from 'lucide-react'

const NAV = [
  ['Overview', LayoutDashboard, true],
  ['Review queue', Inbox, false],
  ['Conversations', MessageCircle, false],
  ['Contacts', Calendar, false],
  ['Bookings', CalendarCheck, false],
] as const

export function ExampleOverview({ mode = 'example' }: { mode?: 'example' | 'empty' }) {
  if (mode === 'empty') {
    return (
      <div className="dash" data-theme="light">
        <div className="app">
          <aside className="side">
            <div className="ws"><div className="ws-logo"><HelixMark size={16} /></div><div><b>Your workspace</b><small>Client workspace</small></div></div>
            <a className="it on" href="#empty"><LayoutDashboard size={16} />Overview</a>
            <div className="me"><div className="av">HX</div><div><b style={{ fontSize: 13.5 }}>Signed in</b><small>Client</small></div></div>
          </aside>
          <main className="main">
            <div className="content">
              <div className="ph"><div><h1>Welcome to Helix</h1><p>Your workspace is ready. Connect WhatsApp and your calendar, then the first conversation will show up here.</p></div></div>
              <div className="kpis">
                {['Appointments booked', 'Missed calls answered', 'Conversations handled', 'Median first reply'].map(label => (
                  <div className="kpi" key={label}><div className="kpi-l">{label}</div><div className="kpi-v"><b>—</b></div><div className="foot">Appears after your first conversation</div></div>
                ))}
              </div>
              <div className="pnl" style={{ marginTop: 14 }}><b>No activity yet.</b><p>Once your systems go live, every reply and booking shows up here.</p></div>
            </div>
          </main>
        </div>
      </div>
    )
  }
  return (
    <div className="dash" data-theme="light">
      <div className="app">
        <aside className="side">
          <div className="ws">
            <div className="ws-logo"><HelixMark size={16} /></div>
            <div><b>Example Dental Clinic</b><small>Client workspace</small></div>
          </div>
          {NAV.map(([label, Icon, on]) => (
            <a key={label} className={`it${on ? ' on' : ''}`} href="#example">{Icon ? <Icon size={16} /> : null}{label}{label === 'Review queue' ? <span className="badge">2</span> : null}</a>
          ))}
          <div className="grp">Growth</div>
          <a className="it" href="#example"><Target size={16} />Lead generation</a>
          <a className="it" href="#example"><Search size={16} />Search<span className="new">New</span></a>
          <a className="it" href="#example"><BarChart3 size={16} />Reports</a>
          <div className="grp">Workspace</div>
          <a className="it" href="#example"><SlidersHorizontal size={16} />Systems</a>
          <a className="it" href="#example"><Plug size={16} />Integrations</a>
          <div className="me"><div className="av">NK</div><div><b style={{ fontSize: 13.5 }}>Nadia K.</b><small style={{ color: 'var(--text-3)' }}>Clinic manager</small></div></div>
        </aside>
        <main className="main">
          <div className="top">
            <div className="search"><Search size={16} />Search contacts, bookings, conversations<span className="kbd">⌘K</span></div>
            <div className="top-r"><span className="iconbtn"><Bell size={16} /></span><span className="iconbtn"><HelpCircle size={16} /></span></div>
          </div>
          <div className="banner"><span>You’re viewing <b>example data</b>. Numbers, names and times on this screen are illustrative.</span></div>
          <div className="content">
            <div className="ph">
              <div>
                <h1>Good morning, Nadia</h1>
                <p>This week your systems replied to 38 enquiries and booked 11 appointments. 2 things need your decision.</p>
              </div>
            </div>
            <div className="kpis">
              <div className="kpi"><div className="kpi-l">Appointments booked</div><div className="kpi-v"><b className="num">11</b></div><div className="foot">+3 vs previous 7 days</div></div>
              <div className="kpi"><div className="kpi-l">Missed calls answered</div><div className="kpi-v"><b className="num">17<small>of 18</small></b></div><div className="foot">1 caller isn’t on WhatsApp</div></div>
              <div className="kpi"><div className="kpi-l">Conversations handled</div><div className="kpi-v"><b className="num">38</b></div><div className="foot">+6 vs previous 7 days</div></div>
              <div className="kpi"><div className="kpi-l">Median first reply</div><div className="kpi-v"><b className="num">18<small>sec</small></b></div><div className="foot">Day and night, including weekends</div></div>
            </div>
            <div className="row3">
              <div className="pnl">
                <div className="pnl-h"><b>Recent activity</b></div>
                <ul className="feed">
                  <li><span className="ic g"><CalendarCheck size={15} /></span><span className="t"><em>Booked</em> teeth cleaning for Thursday, 6:15 PM<small>New patient · via WhatsApp · Missed-call triage</small></span><time>9:44 PM</time></li>
                  <li><span className="ic g"><MessageCircle size={15} /></span><span className="t"><em>Replied</em> to a missed call from <bdi dir="ltr">+971 50 ••• 4182</bdi><small>In Arabic · 20 seconds after the call</small></span><time>9:41 PM</time></li>
                  <li><span className="ic"><Headset size={15} /></span><span className="t"><em>Handed to your team:</em> insurance question<small>Customer typed “agent”</small></span><time>6:02 PM</time></li>
                </ul>
              </div>
              <div className="pnl">
                <div className="pnl-h"><b>Your systems</b></div>
                <ul className="sys">
                  <li><span className="ic"><PhoneMissed size={16} /></span><div><b>Missed-call triage</b><span>Last activity 9:41 PM</span></div><span className="st run">Running</span></li>
                  <li><span className="ic"><RefreshCw size={16} /></span><div><b>Lead reactivation</b><span>Paused by you on Sep 21</span></div><span className="st pause">Paused</span></li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
