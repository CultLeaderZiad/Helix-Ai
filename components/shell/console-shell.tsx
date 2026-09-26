'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { NotificationBell } from '@/components/support/notification-bell'
import { CommandPalette, DASHBOARD_COMMANDS, type PaletteCommand } from '@/components/dashboard/command-palette'
import { HelixMark } from '@/components/marketing/helix-mark'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import '@/components/dashboard/dash.css'
import {
  BarChart3,
  Bot,
  Calendar,
  ChevronsUpDown,
  CircleHelp,
  CreditCard,
  Inbox,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  MessageCircle,
  Plug,
  Search,
  Settings,
  Target,
  Users,
  X,
} from 'lucide-react'
import type { DashLang, DashTheme } from '@/lib/dashboard/lang'

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
  { href: '/dashboard/conversations', label: 'Conversations', labelAr: 'المحادثات', icon: MessageCircle, section: 'top', match: p => p.startsWith('/dashboard/conversations') },
  { href: '/dashboard/contacts', label: 'Contacts', labelAr: 'جهات الاتصال', icon: Users, section: 'top', match: p => p.startsWith('/dashboard/contacts') || p.startsWith('/dashboard/crm') },
  { href: '/dashboard/bookings', label: 'Bookings', labelAr: 'الحجوزات', icon: Calendar, section: 'top', match: p => p.startsWith('/dashboard/bookings') },
  { href: '/dashboard/lead-generation', label: 'Lead generation', labelAr: 'توليد العملاء', icon: Target, section: 'systems', match: p => p.startsWith('/dashboard/lead-generation') },
  { href: '/dashboard/search', label: 'Search', labelAr: 'البحث', icon: Search, badge: 'New', section: 'systems', match: p => p.startsWith('/dashboard/search') },
  { href: '/dashboard/reports', label: 'Reports', labelAr: 'التقارير', icon: BarChart3, section: 'systems', match: p => p.startsWith('/dashboard/reports') },
  { href: '/dashboard/systems', label: 'Systems', labelAr: 'الأنظمة', icon: Bot, section: 'account', match: p => p.startsWith('/dashboard/systems') || p.startsWith('/dashboard/studio') },
  { href: '/dashboard/integrations', label: 'Integrations', labelAr: 'التكاملات', icon: Plug, section: 'account', match: p => p.startsWith('/dashboard/integrations') },
  { href: '/dashboard/billing', label: 'Billing', labelAr: 'الفوترة', icon: CreditCard, section: 'account', match: p => p.startsWith('/dashboard/billing') },
  { href: '/dashboard/support', label: 'Support', labelAr: 'الدعم', icon: LifeBuoy, section: 'account', match: p => p.startsWith('/dashboard/support') },
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

const ADMIN_COMMANDS: PaletteCommand[] = [
  { group: 'Pages', label: 'Clients', href: '/admin', icon: 'radar' },
  { group: 'Pages', label: 'Pipeline', href: '/admin/crm', icon: 'search' },
  { group: 'Pages', label: 'Systems', href: '/admin/studio', icon: 'search' },
  { group: 'Pages', label: 'Support', href: '/admin/support', icon: 'search' },
  { group: 'Pages', label: 'Settings', href: '/settings', icon: 'search' },
]

const MOBILE_TABS = ['/dashboard', '/dashboard/queue', '/dashboard/conversations', '/dashboard/bookings'] as const

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeLangCookie(lang: DashLang) {
  const base = 'path=/; max-age=31536000; SameSite=Lax'
  document.cookie = `helix_lang=${lang}; ${base}`
  document.cookie = `helix-lang=${lang}; ${base}`
  document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return (parts[0] || 'HX').slice(0, 2).toUpperCase()
}

export function ConsoleShell({
  variant,
  email,
  businessName,
  children,
  lang: langProp,
  theme: themeProp,
}: {
  variant: ConsoleVariant
  email: string
  businessName: string | null
  children: React.ReactNode
  lang?: DashLang
  theme?: DashTheme
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [openNav, setOpenNav] = useState(false)
  const [more, setMore] = useState(false)
  const [palette, setPalette] = useState(false)
  const [lang, setLang] = useState<DashLang>(langProp ?? 'en')
  const [theme, setTheme] = useState<DashTheme>(themeProp ?? 'day')
  const [profileName, setProfileName] = useState<string | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [reviewCount, setReviewCount] = useState<number | null>(null)
  const nav = variant === 'admin' ? ADMIN_NAV : CLIENT_NAV
  const workspace = businessName || (variant === 'admin' ? 'Agency' : (lang === 'ar' ? 'مساحة العمل' : 'Workspace'))
  const role = variant === 'admin' ? (lang === 'ar' ? 'الوكالة' : 'Agency') : (lang === 'ar' ? 'عميل' : 'Client')
  const primaryName = profileName || null
  const initials = initialsFrom(primaryName || email || 'HX')

  useEffect(() => {
    const cookieLang = readCookie('helix_lang') || readCookie('helix-lang')
    const nextLang: DashLang = langProp ?? (cookieLang === 'ar' ? 'ar' : 'en')
    const cookieTheme = readCookie('helix_theme')
    const nextTheme: DashTheme = themeProp ?? (cookieTheme === 'night' ? 'night' : 'day')
    setLang(nextLang)
    setTheme(nextTheme)
    document.documentElement.lang = nextLang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr'
  }, [langProp, themeProp])

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
    let cancelled = false
    async function loadProfile() {
      try {
        const supabase = createSupabaseBrowserClient()
        const { data: auth } = await supabase.auth.getUser()
        const user = auth.user
        if (!user || cancelled) return
        const { data } = await supabase.from('profiles').select('full_name, client_id').eq('id', user.id).maybeSingle()
        if (cancelled) return
        if (data?.full_name) setProfileName(data.full_name)
        if (data?.client_id) setClientId(data.client_id)
        if (variant !== 'client') return
        const { count, error } = await supabase
          .from('contact_facts')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
        if (!cancelled && !error && typeof count === 'number' && count > 0) setReviewCount(count)
      } catch {
        // Leave the badge off when the count cannot be read.
      }
    }
    loadProfile()
    return () => {
      cancelled = true
    }
  }, [variant])

  function chooseLang(next: DashLang) {
    setLang(next)
    writeLangCookie(next)
    router.refresh()
  }

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

  const mobileMore = CLIENT_NAV.filter(item => !MOBILE_TABS.includes(item.href as (typeof MOBILE_TABS)[number]))
  const commands = variant === 'admin' ? ADMIN_COMMANDS : DASHBOARD_COMMANDS

  return (
    <div className="dash" data-variant={variant} data-theme={theme} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="app">
        <aside className={`side${openNav ? ' open' : ''}`}>
          <div className="ws">
            <div className="ws-logo"><HelixMark size={16} /></div>
            <div>
              <b>{workspace}</b>
              <small>{variant === 'admin' ? (lang === 'ar' ? 'مساحة الوكالة' : 'Agency workspace') : (lang === 'ar' ? 'مساحة العميل' : 'Client workspace')}</small>
            </div>
            <ChevronsUpDown className="chev" size={16} aria-hidden />
          </div>
          {sections.map(section => (
            <div key={section.id}>
              {section.label ? <div className="grp">{lang === 'ar' ? section.labelAr : section.label}</div> : null}
              {nav.filter(item => item.section === section.id).map(item => {
                const Icon = item.icon
                const on = item.match(pathname)
                const count = item.href === '/dashboard/queue' ? reviewCount : null
                return (
                  <Link key={item.href} href={item.href} className={`it${on ? ' on' : ''}`} aria-current={on ? 'page' : undefined} onClick={() => setOpenNav(false)}>
                    <Icon size={16} />
                    <span>{lang === 'ar' ? item.labelAr : item.label}</span>
                    {count ? <span className="badge">{count}</span> : null}
                    {item.badge && !count ? <span className="new">{lang === 'ar' ? 'جديد' : item.badge}</span> : null}
                  </Link>
                )
              })}
            </div>
          ))}
          <div className="me">
            <div className="av" aria-hidden>{initials}</div>
            <div className="who">
              <b>{primaryName || role}</b>
              <small>{primaryName ? role : email || (lang === 'ar' ? 'تم تسجيل الدخول' : 'Signed in')}</small>
              {variant === 'client' ? (
                <Link href="/settings" className="faint">{lang === 'ar' ? 'الإعدادات' : 'Settings'}</Link>
              ) : null}
            </div>
            <form action={signOut}>
              <button type="submit" className="signout" aria-label={lang === 'ar' ? 'خروج' : 'Sign out'}><LogOut size={14} /></button>
            </form>
          </div>
        </aside>
        <main className="main">
          <header className="top">
            <button type="button" className="iconbtn sb-toggle" aria-label={lang === 'ar' ? 'القائمة' : 'Menu'} onClick={() => setOpenNav(value => !value)}>
              {openNav ? <X size={16} /> : <Menu size={16} />}
            </button>
            <Link href={variant === 'admin' ? '/admin' : '/dashboard'} className="top-logo ws-logo" aria-label="Helix">
              <HelixMark size={16} />
            </Link>
            <button type="button" className="search" onClick={() => setPalette(true)}>
              <Search size={16} />
              <span>{lang === 'ar' ? 'ابحث في جهات الاتصال والحجوزات والمحادثات' : 'Search contacts, bookings, conversations'}</span>
              <span className="kbd">⌘K</span>
            </button>
            <div className="top-r">
              <div className="lang" role="group" aria-label={lang === 'ar' ? 'اللغة' : 'Language'}>
                <button type="button" className={lang === 'en' ? 'on' : undefined} onClick={() => chooseLang('en')}>EN</button>
                <button type="button" className={lang === 'ar' ? 'on' : undefined} onClick={() => chooseLang('ar')}>ع</button>
              </div>
              <NotificationBell isAdmin={variant === 'admin'} clientId={clientId} />
              <Link className="iconbtn" href={variant === 'admin' ? '/admin/support' : '/dashboard/support'} aria-label={lang === 'ar' ? 'مساعدة' : 'Help'}>
                <CircleHelp size={16} />
              </Link>
              <div className="av top-av" aria-hidden>{initials}</div>
            </div>
          </header>
          <div className="content">{children}</div>
        </main>
      </div>
      {variant === 'client' ? (
        <nav className="tabbar" aria-label={lang === 'ar' ? 'التنقل' : 'Navigation'}>
          {MOBILE_TABS.map(href => {
            const item = CLIENT_NAV.find(entry => entry.href === href)!
            const Icon = item.icon
            const on = item.match(pathname)
            const short = href === '/dashboard/queue'
              ? (lang === 'ar' ? 'المراجعة' : 'Review')
              : href === '/dashboard/conversations'
                ? (lang === 'ar' ? 'المحادثات' : 'Conversations')
                : href === '/dashboard/bookings'
                  ? (lang === 'ar' ? 'الحجوزات' : 'Bookings')
                  : (lang === 'ar' ? 'نظرة' : 'Overview')
            return (
              <Link key={href} href={href} className={on ? 'on' : undefined} onClick={() => setMore(false)}>
                <Icon size={16} />
                <span>{short}</span>
              </Link>
            )
          })}
          <button type="button" className={more ? 'on' : undefined} onClick={() => setMore(value => !value)}>
            <Menu size={16} />
            <span>{lang === 'ar' ? 'المزيد' : 'More'}</span>
          </button>
        </nav>
      ) : null}
      {variant === 'client' && more ? (
        <div className="more">
          {mobileMore.map(item => {
            const Icon = item.icon
            return (
              <Link key={item.href} href={item.href} className={`it${item.match(pathname) ? ' on' : ''}`} onClick={() => setMore(false)}>
                <Icon size={16} />
                <span>{lang === 'ar' ? item.labelAr : item.label}</span>
              </Link>
            )
          })}
          <Link href="/settings" className={`it${pathname.startsWith('/settings') ? ' on' : ''}`} onClick={() => setMore(false)}>
            <Settings size={16} />
            <span>{lang === 'ar' ? 'الإعدادات' : 'Settings'}</span>
          </Link>
        </div>
      ) : null}
      <CommandPalette open={palette} onClose={() => setPalette(false)} commands={commands} />
    </div>
  )
}
