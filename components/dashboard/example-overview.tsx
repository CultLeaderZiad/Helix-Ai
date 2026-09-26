import Link from 'next/link'
import {
  BarChart3,
  Bell,
  Calendar,
  CreditCard,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  MessageCircle,
  Plug,
  Search,
  SlidersHorizontal,
  Target,
  Users,
} from 'lucide-react'
import { HelixMark } from '@/components/marketing/helix-mark'
import { EXAMPLE_OVERVIEW, OverviewBoard, emptyOverview } from '@/components/dashboard/overview-board'

const NAV = [
  { label: 'Overview', icon: LayoutDashboard, on: true },
  { label: 'Review queue', icon: Inbox, badge: '2' },
  { label: 'Conversations', icon: MessageCircle },
  { label: 'Contacts', icon: Users },
  { label: 'Bookings', icon: Calendar },
]

export function ExampleOverview({ mode = 'example' }: { mode?: 'example' | 'empty' }) {
  const example = mode === 'example'
  const model = example ? EXAMPLE_OVERVIEW : emptyOverview('there')
  return (
    <div className="dash" data-theme="light" data-screen={example ? 'example-overview' : 'empty-overview'}>
      <div className="app">
        <aside className="side">
          <div className="ws">
            <div className="ws-logo"><HelixMark size={16} /></div>
            <div>
              <b>{example ? 'Example Dental Clinic' : 'Your workspace'}</b>
              <small>Client workspace</small>
            </div>
          </div>
          {NAV.map(item => {
            const Icon = item.icon
            return (
              <a key={item.label} className={`it${item.on ? ' on' : ''}`} href="#overview">
                <Icon size={16} />
                {item.label}
                {item.badge && example ? <span className="badge">{item.badge}</span> : null}
              </a>
            )
          })}
          <div className="grp">Growth</div>
          <a className="it" href="#overview"><Target size={16} />Lead generation</a>
          <a className="it" href="#overview"><Search size={16} />Search<span className="new">New</span></a>
          <a className="it" href="#overview"><BarChart3 size={16} />Reports</a>
          <div className="grp">Workspace</div>
          <a className="it" href="#overview"><SlidersHorizontal size={16} />Systems</a>
          <a className="it" href="#overview"><Plug size={16} />Integrations</a>
          <a className="it" href="#overview"><CreditCard size={16} />Billing</a>
          <a className="it" href="#overview"><LifeBuoy size={16} />Support</a>
          <div className="me">
            <div className="av">{example ? 'NK' : 'HX'}</div>
            <div>
              <b style={{ fontSize: 13.5, fontWeight: 500, display: 'block' }}>{example ? 'Nadia K.' : 'Signed in'}</b>
              <small style={{ fontSize: 12, color: 'var(--text-3)' }}>{example ? 'Clinic manager' : 'Client'}</small>
            </div>
          </div>
        </aside>
        <main className="main">
          <div className="top">
            <div className="search"><Search size={16} />Search contacts, bookings, conversations<span className="kbd">⌘K</span></div>
            <div className="top-r">
              <div className="lang"><span className="on">EN</span><span>ع</span></div>
              <span className="iconbtn"><Bell size={16} /></span>
              <span className="iconbtn"><HelpCircle size={16} /></span>
            </div>
          </div>
          {example ? (
            <div className="banner">You’re viewing <b style={{ fontWeight: 600 }}>example data</b>. Numbers, names and times on this screen are illustrative.</div>
          ) : null}
          <div className="content">
            <OverviewBoard model={model} />
          </div>
        </main>
      </div>
      <Link href="/dashboard" style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden' }}>Open the live workspace</Link>
    </div>
  )
}
