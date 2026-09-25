'use client'

import { useState } from 'react'
import {
  Bell,
  Bot,
  ChevronsUpDown,
  CreditCard,
  FileBarChart,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  Plug,
  Radar,
  Search,
  Settings,
  Users,
} from 'lucide-react'
import { HelixMark } from '@/components/marketing/helix-mark'
import { CommandPalette, type PaletteCommand } from '@/components/dashboard/command-palette'

const NAV = [
  { href: '/dev/design/overview', id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/dev/design/search', id: 'search', label: 'Search', icon: Search, badge: 'New' },
  { href: '/dev/design/leadgen', id: 'lead', label: 'Lead Generation', icon: Radar },
  { href: '/dev/design/overview', id: 'contacts', label: 'Contacts', icon: Users },
  { href: '/dev/design/overview', id: 'crm', label: 'CRM', icon: Users },
  { href: '/dev/design/overview', id: 'queue', label: 'Attention queue', icon: Inbox, count: '3' },
]

const SAMPLE_COMMANDS: PaletteCommand[] = [
  { group: 'Pages', label: 'Lead Generation', href: '/dev/design/leadgen', hint: 'G L', icon: 'radar' },
  { group: 'Pages', label: 'Search', href: '/dev/design/search', hint: 'G S', icon: 'search' },
  { group: 'Actions', label: 'New “Find leads” job', href: '/dev/design/leadgen', icon: 'plus' },
  { group: 'Actions', label: 'Enrich a website…', href: '/dev/design/leadgen', icon: 'globe' },
  { group: 'Actions', label: 'Export last job (.xlsx)', href: '/dev/design/leadgen', icon: 'download' },
  { group: 'Recent jobs', label: 'dental clinics in Dubai', href: '/dev/design/leadgen', badge: 'running', icon: 'history' },
]

export function SampleFrame({
  active,
  crumb,
  children,
  palette = false,
  toast = false,
}: {
  active: 'overview' | 'search' | 'lead'
  crumb: string
  children: React.ReactNode
  palette?: boolean
  toast?: boolean
}) {
  const [open, setOpen] = useState(palette)
  return (
    <div className="dash">
      <div className="app">
        <aside className="sb">
          <div className="ws">
            <span className="m"><HelixMark size={16} light /></span>
            <div className="grow">
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>Helix AI</div>
              <div style={{ fontSize: 11.5, color: '#8a867f' }}>Demo Dental · client</div>
            </div>
            <ChevronsUpDown size={14} />
          </div>
          {NAV.map(item => {
            const Icon = item.icon
            const selected = (active === 'overview' && item.id === 'overview') || (active === 'search' && item.id === 'search') || (active === 'lead' && item.id === 'lead')
            return (
              <a key={item.id} href={item.href} className={`nv${selected ? ' on' : ''}`}>
                <Icon size={16} />
                <span>{item.label}</span>
                {item.badge ? <span className="new">{item.badge}</span> : null}
                {item.count ? <span className="b">{item.count}</span> : null}
              </a>
            )
          })}
          <div className="sbl">Systems</div>
          <a className="nv" href="/dev/design/overview"><Bot size={16} /><span>Studio</span></a>
          <a className="nv" href="/dev/design/overview"><Plug size={16} /><span>Integrations</span></a>
          <a className="nv" href="/dev/design/overview"><FileBarChart size={16} /><span>Reports</span></a>
          <div className="sbl">Account</div>
          <a className="nv" href="/dev/design/overview"><CreditCard size={16} /><span>Billing</span></a>
          <a className="nv" href="/dev/design/overview"><LifeBuoy size={16} /><span>Support</span></a>
          <a className="nv" href="/dev/design/overview"><Settings size={16} /><span>Settings</span></a>
          <div className="grow" />
          <div className="nv" style={{ border: '1px solid var(--sb-line)', background: 'var(--sb2)' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#34E0A1', color: '#04130D', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>ZS</span>
            <div>
              <div style={{ fontSize: 13, color: '#fff' }}>Ziad Sabry</div>
              <div style={{ fontSize: 11, color: '#8a867f' }}>Agency admin</div>
            </div>
          </div>
        </aside>
        <main className="main">
          <header className="top">
            <div className="crumb">Demo Dental <span style={{ color: '#c9c3b7' }}>/</span> <b>{crumb}</b></div>
            <button type="button" className="cmdk" onClick={() => setOpen(true)}>
              <Search size={14} />
              <span className="grow">Search or jump to…</span>
              <span className="kbd">⌘K</span>
            </button>
            <div className="seg"><span className="on">EN</span><span>عربي</span></div>
            <span className="ib">
              <Bell size={14} />
              <span style={{ position: 'absolute', top: 8, right: 9, width: 6, height: 6, borderRadius: '50%', background: '#D97706' }} />
            </span>
          </header>
          <div className="page">{children}</div>
        </main>
      </div>
      {toast && !open ? (
        <div className="toast">
          <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,224,161,.16)', color: '#34E0A1', display: 'grid', placeItems: 'center', flex: 'none' }}>✓</span>
          <div className="grow">
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Enrich job finished</div>
            <div style={{ fontSize: 12.5, color: '#A39F97', marginTop: 2 }}>acme-roofing.sa + 11 URLs · 12 websites checked</div>
          </div>
          <span style={{ fontSize: 12.5, color: '#34E0A1', fontWeight: 500 }}>View</span>
        </div>
      ) : null}
      <CommandPalette open={open} onClose={() => setOpen(false)} commands={SAMPLE_COMMANDS} initialQuery={palette ? 'lead' : ''} />
    </div>
  )
}
