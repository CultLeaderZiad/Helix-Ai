'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { NotificationBell } from '@/components/support/notification-bell'
import { CommandPalette, DASHBOARD_COMMANDS } from '@/components/dashboard/command-palette'
import { HelixMark } from '@/components/marketing/helix-mark'
import {
  BarChart3,
  Bot,
  ChevronsUpDown,
  Cpu,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plug,
  Search,
  Settings,
  Target,
  Users,
  X,
} from 'lucide-react'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  labelAr: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string
  match: (path: string) => boolean
  section: 'top' | 'systems' | 'account'
}

const CLIENT_NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', labelAr: 'نظرة عامة', icon: LayoutDashboard, section: 'top', match: p => p === '/dashboard' },
  { href: '/dashboard/queue', label: 'Review queue', labelAr: 'قائمة المراجعة', icon: Inbox, section: 'top', match: p => p.startsWith('/dashboard/queue') || p.startsWith('/dashboard/facts') },
  { href: '/dashboard/contacts', label: 'Contacts', labelAr: 'جهات الاتصال', icon: Users, section: 'top', match: p => p.startsWith('/dashboard/contacts') },
  { href: '/dashboard/crm', label: 'Bookings', labelAr: 'الحجوزات', icon: Users, section: 'top', match: p => p.startsWith('/dashboard/crm') },
  { href: '/dashboard/lead-generation', label: 'Lead generation', labelAr: 'توليد العملاء', icon: Target, section: 'systems', match: p => p.startsWith('/dashboard/lead-generation') },
  { href: '/dashboard/search', label: 'Search', labelAr: 'البحث', icon: Search, badge: 'New', section: 'systems', match: p => p.startsWith('/dashboard/search') },
  { href: '/dashboard/reports', label: 'Reports', labelAr: 'التقارير', icon: BarChart3, section: 'systems', match: p => p.startsWith('/dashboard/reports') },
  { href: '/dashboard/studio', label: 'Systems', labelAr: 'الأنظمة', icon: Bot, section: 'account', match: p => p.startsWith('/dashboard/studio') },
  { href: '/dashboard/integrations', label: 'Integrations', labelAr: 'التكاملات', icon: Plug, section: 'account', match: p => p.startsWith('/dashboard/integrations') },
  { href: '/dashboard/engine', label: 'AI Engine', labelAr: 'المحرك', icon: Cpu, section: 'systems', match: p => p.startsWith('/dashboard/engine') },
  { href: '/dashboard/billing', label: 'Billing', labelAr: 'الفوترة', icon: CreditCard, section: 'account', match: p => p.startsWith('/dashboard/billing') },
  { href: '/dashboard/support', label: 'Support', labelAr: 'الدعم', icon: LifeBuoy, section: 'account', match: p => p.startsWith('/dashboard/support') },
  { href: '/settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings, section: 'account', match: p => p.startsWith('/settings') },
]

const ADMIN_NAV: NavItem[] = [
  { href: '/admin', label: 'Clients', labelAr: 'العملاء', icon: LayoutDashboard, section: 'top', match: p => p === '/admin' || p.startsWith('/admin/clients') },
  { href: '/admin/crm', label: 'Pipeline', labelAr: 'المسار', icon: Users, section: 'top', match: p => p.startsWith('/admin/crm') },
  { href: '/admin/studio', label: 'Systems', labelAr: 'الأنظمة', icon: Bot, section: 'systems', match: p => p.startsWith('/admin/studio') },
  { href: '/dashboard/lead-generation', label: 'Lead Generation', labelAr: 'توليد العملاء', icon: Target, section: 'systems', match: p => p.startsWith('/dashboard/lead-generation') || p.startsWith('/admin/leadgen') },
  { href: '/admin/queue', label: 'Agent Queue', labelAr: 'طابور الوكلاء', icon: Inbox, section: 'systems', match: p => p.startsWith('/admin/queue') },
  { href: '/admin/analytics', label: 'Analytics', labelAr: 'التحليلات', icon: BarChart3, section: 'systems', match: p => p.startsWith('/admin/analytics') },
  { href: '/admin/support', label: 'Support', labelAr: 'الدعم', icon: LifeBuoy, section: 'account', match: p => p.startsWith('/admin/support') },
  { href: '/settings', label: 'Settings', labelAr: 'الإعدادات', icon: Settings, section: 'account', match: p => p.startsWith('/settings') || p.startsWith('/admin/users') || p.startsWith('/admin/pricing') || p.startsWith('/admin/faq') || p.startsWith('/admin/updates') || p.startsWith('/admin/webhooks') },
]

function crumbLabel(pathname: string, nav: NavItem[], lang: 'en' | 'ar') {
  const hit = nav.find(item => item.match(pathname))
  if (!hit) return lang === 'ar' ? 'اللوحة' : 'Console'
  return lang === 'ar' ? hit.labelAr : hit.label
}

export function ConsoleShell({
  variant,
  email,
  businessName,
  children,
}: {
  variant: ConsoleVariant
  email: string
  businessName: string | null
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [openNav, setOpenNav] = useState(false)
  const [palette, setPalette] = useState(false)
  const [lang, setLang] = useState<'en' | 'ar'>('en')
  const nav = variant === 'admin' ? ADMIN_NAV : CLIENT_NAV
  const workspace = businessName || (variant === 'admin' ? 'Agency' : 'Workspace')
  const initials = (email || 'HX').slice(0, 2).toUpperCase()

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setPalette(open => !open)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [lang])

  const sections: Array<{ id: NavItem['section']; label: string; labelAr: string }> = variant === 'client'
    ? [
        { id: 'top', label: '', labelAr: '' },
        { id: 'systems', label: 'Growth', labelAr: 'النمو' },
        { id: 'account', label: 'Workspace', labelAr: 'مساحة العمل' },
      ]
    : [
        { id: 'top', label: '', labelAr: '' },
        { id: 'systems', label: 'Systems', labelAr: 'الأنظمة' },
        { id: 'account', label: 'Account', labelAr: 'الحساب' },
      ]

  return (
    <div className="dash" data-theme="light" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="app">
        <aside className={`side${openNav ? ' open' : ''}`}>
          <div className="ws">
            <div className="ws-logo"><HelixMark size={16} /></div>
            <div>
              <b>{workspace}</b>
              <small>{variant === 'admin' ? (lang === 'ar' ? 'مساحة الوكالة' : 'Agency workspace') : (lang === 'ar' ? 'مساحة العميل' : 'Client workspace')}</small>
            </div>
            <ChevronsUpDown size={16} />
          </div>
          {sections.map(section => (
            <div key={section.id}>
              {section.label ? <div className="grp">{lang === 'ar' ? section.labelAr : section.label}</div> : null}
              {nav.filter(item => item.section === section.id).map(item => {
                const Icon = item.icon
                const on = item.match(pathname)
                return (
                  <Link key={item.href + item.label} href={item.href} className={`it${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} onClick={() => setOpenNav(false)}>
                    <Icon size={16} />
                    <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                    {item.badge ? <span className="new">{lang === 'ar' ? 'جديد' : item.badge}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="me">
            <div className="av">{initials}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <b style={{ fontSize: 13.5, fontWeight: 500, display: 'block' }}>{email || 'Signed in'}</b>
              <small style={{ fontSize: 12, color: 'var(--text-3)' }}>{variant === 'admin' ? (lang === 'ar' ? 'مدير الوكالة' : 'Agency admin') : (lang === 'ar' ? 'عميل' : 'Client')}</small>
            </div>
            <form action={signOut}>
              <button type="submit" aria-label={lang === 'ar' ? 'خروج' : 'Sign out'} style={{ background: 'none', border: 0, color: 'var(--text-3)' }}><LogOut size={14} /></button>
            </form>
          </div>
        </aside>
        <main className="main">
          <header className="top">
            <button type="button" className="iconbtn sb-toggle" aria-label="Menu" onClick={() => setOpenNav(value => !value)}>
              {openNav ? <X size={16} /> : <Menu size={16} />}
            </button>
            <button type="button" className="search" onClick={() => setPalette(true)}>
              <Search size={16} />
              <span>{lang === 'ar' ? 'ابحث في جهات الاتصال والحجوزات والمحادثات' : 'Search contacts, bookings, conversations'}</span>
              <span className="kbd">⌘K</span>
            </button>
            <div className="top-r">
              <div className="lang" role="group" aria-label="Language">
                <button type="button" className={lang === 'en' ? 'on' : undefined} onClick={() => setLang('en')}>EN</button>
                <button type="button" className={lang === 'ar' ? 'on' : undefined} onClick={() => setLang('ar')}>ع</button>
              </div>
              <span className="iconbtn"><NotificationBell isAdmin={variant === 'admin'} clientId={null} /></span>
            </div>
          </header>
          <div className="content">{children}</div>
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={DASHBOARD_COMMANDS} />
    </div>
  )
}
