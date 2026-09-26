'use client'

import {
  AlertTriangle,
  BookmarkPlus,
  CalendarCheck,
  Check,
  ChevronDown,
  Database,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  History,
  Loader,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pause,
  Phone,
  PhoneCall,
  PhoneMissed,
  Plus,
  Radar,
  Receipt,
  RefreshCw,
  ScanSearch,
  Search,
  Server,
  ShieldCheck,
} from 'lucide-react'

const BARS: Array<[number, number, number]> = [
  [5, 19, 45], [6, 25, 55], [4, 12, 35], [8, 27, 55], [12, 17, 33], [8, 21, 64], [8, 13, 41],
  [14, 10, 43], [7, 18, 46], [8, 19, 40], [5, 21, 70], [14, 20, 68], [7, 26, 54], [11, 17, 41],
]

function Spark({ up = true, id = 'g' }: { up?: boolean; id?: string }) {
  const points = up
    ? '0.0,32.0 9.5,26.9 18.9,29.5 28.4,21.8 37.8,24.4 47.3,16.7 56.7,19.3 66.2,14.2 75.6,16.7 85.1,9.1 94.5,11.6 104.0,4.0'
    : '0.0,4.0 9.5,9.8 18.9,9.8 28.4,15.7 37.8,15.7 47.3,21.5 56.7,21.5 66.2,21.5 75.6,27.3 85.1,27.3 94.5,29.7 104.0,32.0'
  return (
    <svg width="104" height="36" viewBox="0 0 104 36" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#12A579" stopOpacity=".22" />
          <stop offset="1" stopColor="#12A579" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`0,36 ${points} 104,36`} fill={`url(#${id})`} />
      <polyline points={points} fill="none" stroke="#12A579" strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

function Kpi({ label, value, delta, icon, down = false, gid }: { label: string; value: string; delta: string; icon: React.ReactNode; down?: boolean; gid: string }) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{label}</span>
        <span style={{ color: 'var(--subtle)' }}>{icon}</span>
      </div>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 }}>
        <div>
          <div className="num" style={{ fontSize: 32, fontWeight: 600, letterSpacing: '-0.03em' }}>{value}</div>
          <div className="row" style={{ gap: 6, marginTop: 6 }}>
            <span className="chip ok">{delta}</span>
            <span style={{ fontSize: 12, color: 'var(--subtle)' }}>vs prev.</span>
          </div>
        </div>
        <Spark up={!down} id={gid} />
      </div>
    </div>
  )
}

export function SampleOverview() {
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="row" style={{ gap: 10 }}>
            <h1 className="pt">Overview</h1>
            <span className="sample">Sample data</span>
          </div>
          <div className="sub">3 systems live · last event 2 minutes ago</div>
        </div>
        <div className="row" style={{ gap: 10 }}>
          <div className="seg"><span>7d</span><span className="on">30d</span><span>90d</span></div>
          <span className="btn btn-out"><Download size={14} />Report</span>
          <span className="btn btn-acc"><Plus size={14} />New job</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 22 }}>
        <Kpi label="Conversations handled" value="1,284" delta="+12.4%" icon={<MessageSquare size={14} />} gid="k1" />
        <Kpi label="Bookings created" value="96" delta="+8" icon={<CalendarCheck size={14} />} gid="k2" />
        <Kpi label="Leads found" value="412" delta="+140" icon={<Radar size={14} />} gid="k3" />
        <Kpi label="Median first reply" value="4.2s" delta="−0.6s" icon={<MessageCircle size={14} />} down gid="k4" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="ch">
            <h3>Conversations by channel</h3>
            <span style={{ fontSize: 12, color: 'var(--subtle)' }}>last 14 days</span>
            <span className="grow" />
            <span className="row" style={{ gap: 12, fontSize: 12, color: 'var(--muted)' }}>
              <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#0B6E4F' }} />WhatsApp</span>
              <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#7CCBB0' }} />Voice</span>
              <span className="row" style={{ gap: 5 }}><i style={{ width: 8, height: 8, borderRadius: 2, background: '#D9D3C7' }} />Email</span>
            </span>
          </div>
          <div style={{ padding: '18px 18px 12px', display: 'grid', gridTemplateColumns: '36px 1fr', gap: 8 }}>
            <div className="col mono" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--subtle)', height: 220, paddingBottom: 18 }}>
              <span>120</span><span>80</span><span>40</span><span>0</span>
            </div>
            <div>
              <div className="row" style={{ gap: 10, height: 202, alignItems: 'stretch', borderBottom: '1px solid var(--line)', background: 'repeating-linear-gradient(to top,transparent 0 66px,#F0ECE4 66px 67px)' }}>
                {BARS.map((bar, index) => (
                  <div key={index} className="col" style={{ flex: 1, justifyContent: 'flex-end', gap: 2, height: '100%' }}>
                    <div style={{ height: `${bar[0]}%`, background: '#D9D3C7', borderRadius: 3 }} />
                    <div style={{ height: `${bar[1]}%`, background: '#7CCBB0', borderRadius: 3 }} />
                    <div style={{ height: `${bar[2]}%`, background: '#0B6E4F', borderRadius: 3 }} />
                  </div>
                ))}
              </div>
              <div className="row mono" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--subtle)', marginTop: 6 }}>
                <span>Sep 12</span><span>Sep 15</span><span>Sep 18</span><span>Sep 21</span><span>Sep 25</span>
              </div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="ch"><h3>Systems</h3><span className="grow" /><span className="btn btn-ghost" style={{ height: 28, padding: '0 6px' }}>Manage →</span></div>
          <SystemRow icon={<PhoneCall size={14} />} name="Booking receptionist" meta="412 calls · 30d" chip={<span className="chip ok"><span className="dot pulse" />Live</span>} />
          <SystemRow icon={<PhoneMissed size={14} />} name="Missed-call triage" meta="188 text-backs · 30d" chip={<span className="chip ok"><span className="dot pulse" />Live</span>} />
          <SystemRow icon={<RefreshCw size={14} />} name="Lead reactivation" meta="Paused by you · Sep 21" chip={<span className="chip warn">Paused</span>} />
          <SystemRow icon={<Server size={14} />} name="Lead Gen worker" meta="HTTP · Dynamic engines" chip={<span className="chip ok"><span className="dot pulse" />Online</span>} />
          <SystemRow icon={<Receipt size={14} />} name="AR collections" meta="Add from Studio" chip={<span className="chip">Not installed</span>} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 440px', gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="ch"><h3>Activity</h3><span className="chip ok"><span className="dot pulse" />Live</span><span className="grow" /><span style={{ fontSize: 12, color: 'var(--subtle)' }}>Example</span></div>
          <Activity icon={<MessageCircle size={14} />} tone="info" title={<>WhatsApp reply qualified as <b>booking</b></>} meta="+971 50 *** 4182 · Probable" time="2m" tint />
          <Activity icon={<CalendarCheck size={14} />} tone="ok" title={<>Booking held <b>Thu 17:15</b> on Cal.com</>} meta="Booking receptionist" time="6m" />
          <Activity icon={<Radar size={14} />} tone="ok" title={<>Lead Gen job <b>dental clinics Dubai</b> enriched 14/20</>} meta="Find leads · running" time="9m" />
          <Activity icon={<AlertTriangle size={14} />} tone="warn" title={<>Fact needs review: <b>caller name</b> uncertain</>} meta="Attention queue" time="21m" />
          <Activity icon={<PhoneMissed size={14} />} tone="ok" title={<>Missed call → WhatsApp sent in <b>4.1s</b></>} meta="Missed-call triage" time="34m" />
          <Activity icon={<Database size={14} />} title={<>12 contacts upserted to CRM</>} meta="Lead Gen export" time="1h" />
        </div>
        <div className="card">
          <div className="ch"><h3>Lead Gen jobs</h3><span className="grow" /><span className="btn btn-ghost" style={{ height: 28 }}>Open →</span></div>
          <Job name="dental clinics in Dubai" meta="Find leads" status={<span className="chip info">running</span>} width="70%" note="14 / 20 enriched" />
          <Job name="acme-roofing.sa + 11 URLs" meta="Enrich websites" status={<span className="chip ok">done</span>} width="100%" note="12 / 12 done" />
          <Job name="Instagram fitness coaches Cairo" meta="Find leads" status={<span className="chip">queued</span>} width="0%" note="Queued" />
          <div className="row" style={{ gap: 12, padding: '14px 18px' }}>
            <span className="chip warn"><AlertTriangle size={12} />3 facts need review</span>
            <span className="grow" />
            <span className="btn btn-out" style={{ height: 30 }}>Review</span>
          </div>
        </div>
      </div>
      <div style={{ height: 96 }} />
    </>
  )
}

function SystemRow({ icon, name, meta, chip }: { icon: React.ReactNode; name: string; meta: string; chip: React.ReactNode }) {
  return (
    <div className="row" style={{ gap: 12, padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
      <span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--surface2)', border: '1px solid var(--line)', color: 'var(--muted)' }}>{icon}</span>
      <div className="grow">
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</div>
        <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{meta}</div>
      </div>
      {chip}
    </div>
  )
}

function Activity({ icon, title, meta, time, tone, tint }: { icon: React.ReactNode; title: React.ReactNode; meta: string; time: string; tone?: string; tint?: boolean }) {
  return (
    <div className="row" style={{ gap: 12, padding: '11px 18px', borderBottom: '1px solid var(--line)', background: tint ? 'linear-gradient(90deg,#F1F8F4,transparent)' : undefined }}>
      <span className={`chip ${tone ?? ''}`} style={{ width: 30, height: 30, padding: 0, justifyContent: 'center', borderRadius: 9 }}>{icon}</span>
      <div className="grow">
        <div style={{ fontSize: 13.5 }}>{title}</div>
        <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{meta}</div>
      </div>
      <span className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>{time}</span>
    </div>
  )
}

function Job({ name, meta, status, width, note }: { name: string; meta: string; status: React.ReactNode; width: string; note: string }) {
  return (
    <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line)' }}>
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{meta}</div>
        </div>
        {status}
      </div>
      <div className="row" style={{ gap: 10, marginTop: 10 }}>
        <div className="bar grow"><i style={{ width }} /></div>
        <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>{note}</span>
      </div>
    </div>
  )
}

export function SampleLeadgen() {
  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div className="row" style={{ gap: 10 }}><h1 className="pt">Lead Generation</h1><span className="sample">Sample data</span></div>
          <div className="sub">Find businesses or enrich your own list. Every field shows where it came from: empty stays empty.</div>
        </div>
        <span className="btn btn-out"><History size={14} />History · 12 jobs</span>
      </div>
      <div className="card row" style={{ marginTop: 18, padding: '10px 16px', gap: 18, fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap' }}>
        <span className="row" style={{ gap: 6 }}><span className="dot pulse" /><b style={{ color: 'var(--ink)', fontWeight: 500 }}>Worker online</b></span>
        <span>Engines: <span className="dot" /> HTTP <span className="dot" /> Dynamic <span className="dot off" /> Stealth</span>
        <span>Hunter <b className="mono" style={{ color: 'var(--ink)' }}>38</b> credits</span>
        <span className="grow" />
        <span className="row" style={{ gap: 6, color: 'var(--subtle)' }}><ShieldCheck size={14} />robots.txt respected</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '14px 16px', background: 'var(--surface2)' }}>
              <div className="row" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: '#fff', border: '1px solid var(--line)' }}><Globe size={14} /></span><div className="grow"><div style={{ fontWeight: 500 }}>Enrich websites</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Paste up to 25 URLs you already have</div></div></div>
            </div>
            <div style={{ border: '1.5px solid var(--accent)', borderRadius: 12, padding: '14px 16px', background: '#F3FAF6', boxShadow: '0 0 0 4px rgba(18,165,121,.10)' }}>
              <div className="row" style={{ gap: 10 }}><span style={{ width: 32, height: 32, borderRadius: 9, display: 'grid', placeItems: 'center', background: 'var(--accent)', color: '#fff' }}><Radar size={14} /></span><div className="grow"><div style={{ fontWeight: 500 }}>Find leads</div><div style={{ fontSize: 12.5, color: 'var(--muted)' }}>Describe who you want: we search maps + web</div></div><span style={{ width: 16, height: 16, borderRadius: '50%', border: '5px solid var(--accent)' }} /></div>
            </div>
          </div>
          <div style={{ marginTop: 18, fontSize: 13, fontWeight: 500 }}>What are you looking for?</div>
          <div className="row" style={{ marginTop: 8, height: 48, border: '1px solid var(--ink)', borderRadius: 12, padding: '0 14px', gap: 10, boxShadow: '0 0 0 3px rgba(20,20,20,.06)' }}>
            <Search size={18} style={{ color: 'var(--subtle)' }} />
            <span style={{ fontSize: 15 }}>dental clinics in Dubai with WhatsApp</span>
            <span className="grow" />
            <span className="chip"><MapPin size={12} />AE · auto</span>
          </div>
          <div className="row" style={{ gap: 8, marginTop: 10, fontSize: 12.5, color: 'var(--subtle)' }}>
            Try: <span className="chip">roofing contractors in Jeddah</span><span className="chip">Instagram fitness coaches in Cairo</span>
          </div>
          <div className="row" style={{ gap: 22, marginTop: 18, flexWrap: 'wrap' }}>
            <div>
              <div className="label">Sources</div>
              <div className="row" style={{ gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                <span className="chip ok"><span className="dot" />Google Maps</span>
                <span className="chip"><span className="dot off" />Foursquare</span>
                <span className="chip ok"><span className="dot" />OpenStreetMap</span>
                <span className="chip ok"><span className="dot" />Web search</span>
              </div>
            </div>
            <div>
              <div className="label">How many</div>
              <div className="seg" style={{ marginTop: 8 }}><span>10</span><span className="on">20</span><span>40</span><span>60</span></div>
            </div>
            <div>
              <div className="label">Emails</div>
              <div className="row" style={{ gap: 8, marginTop: 12, fontSize: 13 }}><span style={{ width: 16, height: 16, borderRadius: 4, background: 'var(--accent)', color: '#fff', display: 'grid', placeItems: 'center' }}><Check size={12} /></span>Hunter decision-makers</div>
            </div>
          </div>
          <div className="row" style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--line)', gap: 12 }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>Advanced</span>
            <span className="grow" />
            <span className="mono" style={{ fontSize: 12, color: 'var(--muted)' }}>≈ 24 credits</span>
            <span className="btn btn-acc" style={{ height: 40, padding: '0 18px' }}><Radar size={14} />Find leads</span>
          </div>
        </div>
        <div className="card">
          <div className="ch"><h3>Job progress</h3><span className="chip info"><Loader size={12} />running</span><span className="grow" /><span className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>#a41f</span></div>
          <div style={{ padding: '16px 18px' }}>
            <div className="num" style={{ fontSize: 34, fontWeight: 600 }}>70<span style={{ fontSize: 18, color: 'var(--muted)' }}>%</span></div>
            <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>14 of 20 websites enriched · ~1 min left</div>
            <div className="bar" style={{ height: 8, marginTop: 12 }}><i style={{ width: '70%' }} /></div>
            <div style={{ marginTop: 16 }}>
              <Step done label="Search sources" meta="18 found" />
              <Step done label="Collect websites" meta="15 sites · 3 no site" />
              <Step label="Enrich contacts" meta="14 / 20" current />
              <Step label="Score & dedupe" meta="waiting" idle />
              <Step label="Ready to export" meta="waiting" idle />
            </div>
            <div className="mono" style={{ marginTop: 12, background: '#141414', color: '#C9C3B7', borderRadius: 10, padding: '10px 12px', fontSize: 11.5, lineHeight: 1.8 }}>
              <div><span style={{ color: '#6d6a64' }}>12:04:18</span> fetch pearlsmile.example/contact · 200</div>
              <div><span style={{ color: '#6d6a64' }}>12:04:19</span> email found · source=site</div>
              <div style={{ color: '#34E0A1' }}><span style={{ color: '#6d6a64' }}>12:04:23</span> 14/20 enriched ▍</div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16, overflow: 'hidden' }}>
        <div className="ch">
          <h3>Results</h3>
          <span style={{ fontSize: 12.5, color: 'var(--muted)' }}>20 leads · 14 enriched · 1 selected</span>
          <span className="grow" />
          <span className="btn btn-out"><FileSpreadsheet size={14} />Export .xlsx</span>
          <span className="btn btn-out">CSV</span>
          <span className="btn btn-ink"><Database size={14} />Send to CRM</span>
        </div>
        <table className="tbl">
          <thead><tr><th>Company</th><th>Description</th><th>Email</th><th>Phone</th><th>City</th><th>Score</th><th>Source</th></tr></thead>
          <tbody>
            <LeadRow selected name="Pearl Smile Dental" domain="pearlsmile.example" desc="Family and cosmetic dentistry in Jumeirah; WhatsApp bookings." email="info@pearlsmile…" phone="+971 4 3•• ••••" city="Dubai" score={86} source="Google Maps · site" />
            <LeadRow name="Marina Dental Care" domain="marinadental.example" desc="Implants, orthodontics and emergency dental care." email="-" phone="+971 4 4•• ••••" city="Dubai" score={78} source="Google Maps" />
            <LeadRow name="Al Barsha Dental Studio" domain="barshadental.example" desc="Clinic page lists Arabic & English speaking staff." email="hello@barsha…" phone="+971 50 •••" city="Dubai" score={72} source="Web search · site" />
            <LeadRow name="Jumeirah Family Clinic" domain="jfc.example" desc="Multi-specialty clinic; dental department on 2nd floor." email="-" phone="+971 4 3•• ••••" city="Dubai" score={61} source="OSM · site" warn />
            <LeadRow name="Deira Smile Centre" domain="deirasmile.example" desc="Description not found on site" email="-" phone="-" city="Dubai" score={40} source="Google Maps" empty />
          </tbody>
        </table>
      </div>
    </>
  )
}

function Step({ done, current, idle, label, meta }: { done?: boolean; current?: boolean; idle?: boolean; label: string; meta: string }) {
  return (
    <div className="row" style={{ gap: 10, padding: '7px 0' }}>
      <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'grid', placeItems: 'center', background: done ? 'var(--accent-soft)' : current ? 'var(--info-soft)' : 'transparent', color: done ? 'var(--accent)' : 'var(--info)', border: idle ? '1.5px solid var(--line2)' : undefined, boxShadow: current ? '0 0 0 3px rgba(14,116,144,.12)' : undefined }}>
        {done ? <Check size={12} /> : current ? <Loader size={12} /> : null}
      </span>
      <span className="grow" style={{ fontSize: 13, fontWeight: current ? 500 : 400, color: idle ? 'var(--subtle)' : undefined }}>{label}</span>
      <span className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>{meta}</span>
    </div>
  )
}

function LeadRow({ selected, name, domain, desc, email, phone, city, score, source, warn, empty }: { selected?: boolean; name: string; domain: string; desc: string; email: string; phone: string; city: string; score: number; source: string; warn?: boolean; empty?: boolean }) {
  return (
    <tr className={selected ? 'sel' : undefined}>
      <td>
        <div className="row" style={{ gap: 10 }}>
          <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid ' + (selected ? 'var(--accent)' : 'var(--line2)'), background: selected ? 'var(--accent)' : '#fff', color: '#fff', display: 'grid', placeItems: 'center' }}>{selected ? <Check size={12} /> : null}</span>
          <div><div style={{ fontWeight: 500 }}>{name}</div><div className="mono" style={{ fontSize: 11.5, color: 'var(--subtle)' }}>{domain}</div></div>
        </div>
      </td>
      <td style={{ color: empty ? 'var(--subtle)' : 'var(--muted)', fontSize: 12.5, fontStyle: empty ? 'italic' : undefined }}>{desc}</td>
      <td className="mono" style={{ fontSize: 12 }}>{email}</td>
      <td className="mono" style={{ fontSize: 12 }}>{phone}</td>
      <td>{city}</td>
      <td><div className="row" style={{ gap: 8 }}><div className="bar" style={{ width: 44 }}><i style={{ width: `${score}%`, background: warn ? '#D97706' : empty ? '#C9C3B7' : undefined }} /></div><span className="mono">{score}</span></div></td>
      <td><span className="chip" style={{ fontSize: 11 }}>{source}</span></td>
    </tr>
  )
}

export function SampleSearch({ note }: { note?: string }) {
  return (
    <>
      <div className="row" style={{ gap: 10 }}>
        <h1 className="pt">Search</h1>
        <span className="sample">Sample data</span>
      </div>
      <div className="sub">{note ?? 'Search the web and maps for companies. Nothing is saved until you choose Save.'}</div>
      <div className="row" style={{ gap: 10, marginTop: 18 }}>
        <div className="row grow" style={{ height: 52, border: '1px solid var(--line2)', background: '#fff', borderRadius: 14, padding: '0 16px', gap: 12, boxShadow: '0 1px 2px rgba(0,0,0,.04),0 8px 24px -12px rgba(20,20,20,.12)' }}>
          <Search size={18} style={{ color: 'var(--subtle)' }} />
          <span style={{ fontSize: 16 }}>roofing contractors in Jeddah</span>
          <span className="grow" />
          <span className="chip"><MapPin size={12} />SA · ar + en</span>
          <span className="kbd">↵</span>
        </div>
        <span className="btn btn-acc" style={{ height: 52, padding: '0 22px', borderRadius: 14, fontSize: 14.5 }}>Search</span>
      </div>
      <div className="row" style={{ gap: 18, marginTop: 14, borderBottom: '1px solid var(--line)' }}>
        <span style={{ padding: '8px 2px 11px', fontSize: 13.5, fontWeight: 500, borderBottom: '2px solid var(--ink)', marginBottom: -1 }}>Everything <span className="mono" style={{ fontSize: 11.5, color: 'var(--subtle)' }}>18</span></span>
        <span style={{ padding: '8px 2px 11px', fontSize: 13.5, color: 'var(--muted)' }}>Businesses <span className="mono" style={{ fontSize: 11.5 }}>12</span></span>
        <span style={{ padding: '8px 2px 11px', fontSize: 13.5, color: 'var(--muted)' }}>Web 4</span>
        <span style={{ padding: '8px 2px 11px', fontSize: 13.5, color: 'var(--muted)' }}>Social profiles 2</span>
        <span className="grow" />
        <span className="row" style={{ gap: 12, fontSize: 12, color: 'var(--muted)', paddingBottom: 8 }}>
          <span className="row" style={{ gap: 5 }}><span className="dot" />Web search</span>
          <span className="row" style={{ gap: 5 }}><span className="dot" />Google Maps</span>
          <span className="row" style={{ gap: 5 }}><span className="dot off" />Foursquare</span>
          <span className="row" style={{ gap: 5 }}><span className="dot" />Hunter 38</span>
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, marginTop: 16 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="ch" style={{ background: 'var(--surface2)' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}><b style={{ color: 'var(--ink)' }}>18 results</b> · Google Maps 12 · Web 9 · OSM 2 · <span className="mono">2.4s</span></span>
            <span className="grow" />
            <span className="btn btn-out" style={{ height: 30 }}><BookmarkPlus size={14} />Save all as leads</span>
          </div>
          <Result selected name="Red Sea Roofing Co." domain="redsearoofing.example" kind="Business" body="Commercial roofing and waterproofing contractor serving Jeddah and Makkah." meta={['Jeddah, SA', '+966 12 6•• ••••', 'info@redsea…']} actions={['Enrich', 'Save', 'Watch']} />
          <Result name="Al Hamra Waterproofing" domain="alhamra-wp.example" kind="Business" saved body="Page description: “Roof insulation, membranes and maintenance contracts.”" meta={['Jeddah, SA', '+966 55 •••', 'no email found']} actions={['Open lead']} />
          <Result name="Obhur Building Services" domain="obhur-bs.example" kind="Business" body="" loading />
          <Result name="Top roofing companies in Jeddah: directory" domain="dir.example" kind="Web" body="Directory page listing 30+ roofing and insulation contractors with phone numbers." meta={['Web page · Arabic + English']} actions={['Extract companies', 'Open']} />
          <Result name="@jeddah.roofing.pro" domain="instagram.com" kind="Social profile" info body="Bio: “Roof repair & waterproofing · Jeddah · WhatsApp in bio”: URL, title and snippet only." meta={['Instagram', 'bio website: jrp.example']} actions={['Enrich bio website']} />
          <div className="row" style={{ justifyContent: 'center', padding: 14 }}><span className="btn btn-ghost">Load more <ChevronDown size={14} /></span></div>
        </div>
        <div className="col" style={{ gap: 16 }}>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="label">Recent searches</div>
            {['dental clinics Dubai', 'clinics Riyadh with WhatsApp', 'Shopify brands Kuwait', 'construction fit-out Doha'].map((item, index) => (
              <div key={item} className="row" style={{ gap: 10, padding: '9px 0', borderBottom: '1px solid var(--line)', fontSize: 13 }}>
                <History size={14} style={{ color: 'var(--subtle)' }} /><span className="grow">{item}</span><span className="mono" style={{ fontSize: 11.5, color: 'var(--subtle)' }}>{[20, 34, 12, 18][index]}</span>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: '14px 16px' }}>
            <div className="label">Watches</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 8, lineHeight: 1.55 }}>Get an alert when a saved search finds new companies.</div>
            <span className="btn btn-out" style={{ marginTop: 12, height: 32 }}>Create watch</span>
          </div>
          <div className="card" style={{ padding: '14px 16px', background: '#141414', color: '#fff', borderColor: '#141414' }}>
            <div className="row" style={{ gap: 10 }}><span className="num" style={{ fontSize: 22, fontWeight: 600 }}>1</span><span style={{ fontSize: 13, color: '#A39F97' }}>selected</span><span className="grow" /><span className="kbd" style={{ background: '#1F1E1B', borderColor: '#333', color: '#A39F97' }}>⌘S</span></div>
            <div className="row" style={{ gap: 8, marginTop: 12 }}>
              <span className="btn" style={{ background: '#34E0A1', color: '#04130D', height: 32 }}>Save as leads</span>
              <span className="btn" style={{ borderColor: '#333', color: '#fff', height: 32 }}>Enrich</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function Result({ selected, name, domain, kind, body, meta = [], actions = [], saved, loading, info }: { selected?: boolean; name: string; domain: string; kind: string; body: string; meta?: string[]; actions?: string[]; saved?: boolean; loading?: boolean; info?: boolean }) {
  return (
    <div style={{ padding: '16px 18px', borderBottom: '1px solid var(--line)', background: selected ? '#F3FAF6' : undefined }}>
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <span style={{ width: 16, height: 16, borderRadius: 4, border: '1.5px solid ' + (selected ? 'var(--accent)' : 'var(--line2)'), background: selected ? 'var(--accent)' : '#fff', color: '#fff', display: 'grid', placeItems: 'center', marginTop: 3, flex: 'none' }}>{selected ? <Check size={12} /> : null}</span>
        <div className="grow">
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em' }}>{name}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>{domain}</span>
            {saved ? <span className="chip ok"><Check size={12} />Already in your leads</span> : null}
            <span className="grow" />
            <span className={`chip${kind === 'Business' || saved ? ' ok' : ''}${info ? ' info' : ''}`}>{kind}</span>
          </div>
          {loading ? (
            <div className="col" style={{ gap: 8, marginTop: 10 }}>
              <div className="skel" style={{ width: '80%', height: 10 }} />
              <div className="skel" style={{ width: '55%', height: 10 }} />
              <span className="chip info" style={{ marginTop: 4 }}><Loader size={12} />Enriching · checking contact page</span>
            </div>
          ) : (
            <>
              {body ? <div style={{ fontSize: 13.5, color: 'var(--muted)', marginTop: 6, lineHeight: 1.55 }}>{body}</div> : null}
              <div className="row" style={{ gap: 14, marginTop: 10, fontSize: 12.5, color: 'var(--muted)', flexWrap: 'wrap' }}>
                {meta.map(item => <span key={item} className="row" style={{ gap: 5 }}>{item.includes('+') ? <Phone size={12} /> : item.includes('@') || item.includes('email') ? <Mail size={12} /> : item.includes('Jeddah') ? <MapPin size={12} /> : <Globe size={12} />}{item}</span>)}
                {selected ? <span className="row" style={{ gap: 6 }}><Globe size={14} /><MessageCircle size={14} /><Mail size={14} /></span> : null}
              </div>
              <div className="row" style={{ gap: 8, marginTop: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--subtle)' }}>Sources:</span>
                <span className="chip" style={{ fontSize: 11 }}>Google Maps</span>
                {selected ? <span className="chip" style={{ fontSize: 11 }}>Web search</span> : null}
                <span className="grow" />
                {actions.map(action => (
                  <span key={action} className={`btn ${action === 'Save' || action === 'Watch' || action === 'Open' ? 'btn-out' : 'btn-ink'}`} style={{ height: 30, padding: '0 10px', fontSize: 12.5 }}>
                    {action === 'Enrich' || action.startsWith('Enrich') ? <ScanSearch size={12} /> : action === 'Open' ? <ExternalLink size={12} /> : null}
                    {action}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export function SearchWorkspace() {
  return (
    <SampleSearch note="Example layout. Maps, web search, and Hunter are not connected yet: results below are a labeled sample, not a live search. Nothing is saved." />
  )
}
