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
  { href: '/dashboard/search', label: 'Search', labelAr: 'بحث', icon: Search, badge: 'New', section: 'top', match: p => p.startsWith('/dashboard/search') },
  { href: '/dashboard/lead-generation', label: 'Lead Generation', labelAr: 'توليد العملاء', icon: Target, section: 'top', match: p => p.startsWith('/dashboard/lead-generation') },
  { href: '/dashboard/contacts', label: 'Contacts', labelAr: 'جهات الاتصال', icon: Users, section: 'top', match: p => p.startsWith('/dashboard/contacts') },
  { href: '/dashboard/crm', label: 'CRM', labelAr: 'إدارة العملاء', icon: Users, section: 'top', match: p => p.startsWith('/dashboard/crm') },
  { href: '/dashboard/queue', label: 'Attention queue', labelAr: 'طابور المتابعة', icon: Inbox, section: 'top', match: p => p.startsWith('/dashboard/queue') || p.startsWith('/dashboard/facts') },
  { href: '/dashboard/studio', label: 'Studio', labelAr: 'الاستوديو', icon: Bot, section: 'systems', match: p => p.startsWith('/dashboard/studio') },
  { href: '/dashboard/integrations', label: 'Integrations', labelAr: 'التكاملات', icon: Plug, section: 'systems', match: p => p.startsWith('/dashboard/integrations') },
  { href: '/dashboard/reports', label: 'Reports', labelAr: 'التقارير', icon: BarChart3, section: 'systems', match: p => p.startsWith('/dashboard/reports') },
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

  const sections: Array<{ id: NavItem['section']; label: string; labelAr: string }> = [
    { id: 'top', label: '', labelAr: '' },
    { id: 'systems', label: 'Systems', labelAr: 'الأنظمة' },
    { id: 'account', label: 'Account', labelAr: 'الحساب' },
  ]

  return (
    <div className="dash" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="app">
        <aside className={`sb${openNav ? ' open' : ''}`}>
          <div className="ws">
            <span className="m"><HelixMark size={16} light /></span>
            <div className="grow">
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#fff' }}>Helix AI</div>
              <div style={{ fontSize: 11.5, color: '#8a867f' }}>{workspace} · {variant === 'admin' ? (lang === 'ar' ? 'وكالة' : 'agency') : (lang === 'ar' ? 'عميل' : 'client')}</div>
            </div>
            <ChevronsUpDown size={14} />
          </div>
          {sections.map(section => (
            <div key={section.id}>
              {section.label ? <div className="sbl">{lang === 'ar' ? section.labelAr : section.label}</div> : null}
              {nav.filter(item => item.section === section.id).map(item => {
                const Icon = item.icon
                const on = item.match(pathname)
                return (
                  <Link key={item.href + item.label} href={item.href} className={`nv${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} onClick={() => setOpenNav(false)}>
                    <Icon size={16} />
                    <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                    {item.badge ? <span className="new">{lang === 'ar' ? 'جديد' : item.badge}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="grow" />
          <div className="nv" style={{ border: '1px solid var(--sb-line)', background: 'var(--sb2)' }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#34E0A1', color: '#04130D', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 600 }}>{initials}</span>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis' }}>{email || 'Signed in'}</div>
              <div style={{ fontSize: 11, color: '#8a867f' }}>{variant === 'admin' ? (lang === 'ar' ? 'مدير الوكالة' : 'Agency admin') : (lang === 'ar' ? 'عميل' : 'Client')}</div>
            </div>
            <form action={signOut} style={{ marginInlineStart: 'auto' }}>
              <button type="submit" aria-label={lang === 'ar' ? 'خروج' : 'Sign out'}><LogOut size={14} /></button>
            </form>
          </div>
        </aside>
        <main className="main">
          <header className="top">
            <button type="button" className="ib sb-toggle" aria-label="Menu" onClick={() => setOpenNav(value => !value)}>
              {openNav ? <X size={16} /> : <Menu size={16} />}
            </button>
            <div className="crumb">
              {workspace} <span style={{ color: '#c9c3b7' }}>/</span> <b>{crumbLabel(pathname, nav, lang)}</b>
            </div>
            <button type="button" className="cmdk" onClick={() => setPalette(true)}>
              <Search size={14} />
              <span className="grow">{lang === 'ar' ? 'ابحث أو انتقل…' : 'Search or jump to…'}</span>
              <span className="kbd">⌘K</span>
            </button>
            <div className="seg" role="group" aria-label="Language">
              <button type="button" className={lang === 'en' ? 'on' : undefined} onClick={() => setLang('en')}>EN</button>
              <button type="button" className={lang === 'ar' ? 'on' : undefined} onClick={() => setLang('ar')}>عربي</button>
            </div>
            <span className="ib" style={{ padding: 0 }}>
              <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
            </span>
          </header>
          <div className="page">{children}</div>
        </main>
      </div>
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={DASHBOARD_COMMANDS} />
    </div>
  )
}
