'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { NotificationBell } from '@/components/support/notification-bell'
import { cn } from '@/lib/utils'
import {
  Users,
  Sparkles,
  ListTodo,
  PlugZap,
  CreditCard,
  Settings,
  Building2,
  BarChart3,
  LogOut,
  Cpu,
  HelpCircle,
  LayoutDashboard,
  Menu,
  X,
  Target,
} from 'lucide-react'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  match: (path: string) => boolean
  section?: 'primary' | 'secondary'
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Clients',
    icon: Building2,
    section: 'primary',
    match: p => p === '/admin' || (p.startsWith('/admin/clients') && !p.startsWith('/admin/crm')),
  },
  {
    href: '/admin/crm',
    label: 'Pipeline',
    icon: Users,
    section: 'primary',
    match: p => p.startsWith('/admin/crm'),
  },
  {
    href: '/admin/studio',
    label: 'Systems',
    icon: Sparkles,
    section: 'primary',
    match: p => p === '/admin/studio' || p.startsWith('/admin/studio'),
  },
  {
    href: '/dashboard/lead-generation',
    label: 'Lead Generation',
    icon: Target,
    section: 'primary',
    match: p => p.startsWith('/dashboard/lead-generation'),
  },
  {
    href: '/dashboard/engine',
    label: 'Intelligence',
    icon: Cpu,
    section: 'primary',
    match: p => p.startsWith('/dashboard/engine'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: BarChart3,
    section: 'primary',
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    section: 'primary',
    match: p => p.startsWith('/admin/analytics'),
  },
  {
    href: '/admin/queue',
    label: 'Agent Queue',
    icon: ListTodo,
    section: 'primary',
    match: p => p.startsWith('/admin/queue') || p.startsWith('/dashboard/queue'),
  },
  {
    href: '/admin/support',
    label: 'Support',
    icon: HelpCircle,
    section: 'secondary',
    match: p => p.startsWith('/admin/support') || p.startsWith('/dashboard/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    section: 'secondary',
    match: p =>
      p.startsWith('/settings') ||
      p.startsWith('/admin/users') ||
      p.startsWith('/admin/pricing') ||
      p.startsWith('/admin/updates') ||
      p.startsWith('/admin/webhooks') ||
      p.startsWith('/admin/faq'),
  },
]

const CLIENT_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    section: 'primary',
    match: p => p === '/dashboard',
  },
  {
    href: '/dashboard/crm',
    label: 'Pipeline',
    icon: Users,
    section: 'primary',
    match: p => p.startsWith('/dashboard/crm') || p.startsWith('/dashboard/contacts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Systems',
    icon: Sparkles,
    section: 'primary',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/lead-generation',
    label: 'Lead Generation',
    icon: Target,
    section: 'primary',
    match: p => p.startsWith('/dashboard/lead-generation'),
  },
  {
    href: '/dashboard/engine',
    label: 'AI Engine',
    icon: Cpu,
    section: 'primary',
    match: p => p.startsWith('/dashboard/engine'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: BarChart3,
    section: 'primary',
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/dashboard/queue',
    label: 'Queue',
    icon: ListTodo,
    section: 'primary',
    match: p => p.startsWith('/dashboard/queue') || p.startsWith('/dashboard/facts'),
  },
  {
    href: '/dashboard/integrations',
    label: 'Integrations',
    icon: PlugZap,
    section: 'secondary',
    match: p => p.startsWith('/dashboard/integrations'),
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: CreditCard,
    section: 'secondary',
    match: p => p.startsWith('/dashboard/billing'),
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HelpCircle,
    section: 'secondary',
    match: p => p.startsWith('/dashboard/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    section: 'secondary',
    match: p => p.startsWith('/settings'),
  },
]

// Secondary Top Rail for Intelligence / Engine
const INTEL_TABS = [
  { href: '/dashboard/engine', label: 'Engine' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/queue', label: 'Queue' },
]

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
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)
  const [language, setLanguage] = useState<'en' | 'ar'>('en')

  const nav = variant === 'admin' ? ADMIN_NAV : CLIENT_NAV
  const title = variant === 'admin' ? 'Helix AI' : businessName ?? 'Workspace'
  const primary = nav.filter(item => item.section !== 'secondary')
  const secondary = nav.filter(item => item.section === 'secondary')

  const isIntelRoute =
    pathname.startsWith('/dashboard/engine') ||
    pathname.startsWith('/dashboard/reports') ||
    pathname.startsWith('/admin/analytics') ||
    pathname.startsWith('/admin/queue') ||
    pathname.startsWith('/dashboard/queue')

  return (
    <div className="h-screen h-dvh w-full overflow-hidden bg-[#F3F1EC] text-[#141414] flex flex-col lg:flex-row">
      {/* Desktop Dark Ink Sidebar - 100% Fixed & Never Cut Off */}
      <aside className="hidden lg:flex w-[240px] shrink-0 h-full flex-col border-r border-[#2B2A27] bg-[#1C1B19] text-white select-none z-30">
        {/* Workspace Brand Header (Pinned at Top of Sidebar) */}
        <div className="px-5 py-4 border-b border-[#2B2A27] shrink-0">
          <span className="block font-display text-13 font-bold tracking-wider text-white uppercase">
            {variant === 'admin' ? 'DIRECTION 2 · WARM COMMAND' : title}
          </span>
          <span className="mt-0.5 block text-[10px] font-mono tracking-widest text-[#9E9B95] uppercase">
            {variant === 'admin' ? 'AGENCY' : 'CLIENT WORKSPACE'}
          </span>
        </div>

        {/* Navigation Item List (Independently Scrollable if height is constrained) */}
        <nav aria-label="Console" className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-0.5">
          {primary.map(item => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center justify-between rounded-[8px] px-3 py-2 text-13 font-medium transition-colors duration-150',
                  active
                    ? 'bg-[#2B2A27] text-white font-semibold'
                    : 'text-[#9E9B95] hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <span>{item.label}</span>
                {item.badge && (
                  <span className="rounded bg-[#0B6E4F] px-1.5 py-0.2 text-[9px] font-mono text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Secondary Links & User Account (Pinned at Bottom of Sidebar) */}
        <div className="shrink-0 border-t border-[#2B2A27] px-3 py-3 flex flex-col gap-0.5 bg-[#1C1B19]">
          {secondary.map(item => {
            const active = item.match(pathname)
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  'flex items-center justify-between rounded-[8px] px-3 py-1.5 text-13 font-medium transition-colors duration-150',
                  active
                    ? 'bg-[#2B2A27] text-white font-semibold'
                    : 'text-[#9E9B95] hover:bg-white/[0.04] hover:text-white'
                )}
              >
                <span>{item.label}</span>
              </Link>
            )
          })}

          <div className="mt-2 flex items-center justify-between border-t border-[#2B2A27]/80 px-1 pt-2.5 text-12 text-[#9E9B95]">
            <span className="truncate text-[11px] max-w-[130px] font-mono">{email}</span>
            <div className="flex items-center gap-1">
              <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="p-1 text-[#9E9B95] hover:text-rose-400 transition-colors"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-[#2B2A27] bg-[#1C1B19] px-4 py-3 text-white shrink-0 lg:hidden">
        <div>
          <span className="font-display text-13 font-bold uppercase">{title}</span>
          <span className="ml-2 text-[10px] font-mono text-[#9E9B95] uppercase">
            {variant === 'admin' ? 'AGENCY' : 'CLIENT'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileDrawerOpen(!mobileDrawerOpen)}
          className="rounded-md border border-[#33312D] p-1.5 text-[#9E9B95] hover:text-white"
        >
          {mobileDrawerOpen ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </header>

      {/* Mobile Drawer Dropdown */}
      {mobileDrawerOpen && (
        <div className="border-b border-[#2B2A27] bg-[#1C1B19] px-4 py-3 text-white lg:hidden shrink-0">
          <nav className="flex flex-col gap-1">
            {[...primary, ...secondary].map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded px-2.5 py-1.5 text-13 text-[#9E9B95] hover:bg-[#2B2A27] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* Main Fluid Canvas with Dedicated Independent Scrolling */}
      <div className="flex-1 h-full min-w-0 flex flex-col overflow-y-auto bg-[#F3F1EC]">
        {/* Sticky Top Secondary Rail (Always Visible on Scroll) */}
        <header className="sticky top-0 z-20 shrink-0 border-b border-[#D9D4CB]/70 bg-[#F3F1EC]/90 backdrop-blur-md px-6 py-2.5 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          {(isIntelRoute || variant === 'admin') ? (
            <nav className="flex items-center gap-1.5" aria-label="Intelligence Sections">
              {INTEL_TABS.map(tab => {
                const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`)
                return (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    className={cn(
                      'rounded-[8px] px-3.5 py-1.5 text-13 font-medium transition-colors',
                      active
                        ? 'bg-[#141414] text-white shadow-xs'
                        : 'text-[#6E6A63] hover:text-[#141414] hover:bg-[#E6E2D9]'
                    )}
                  >
                    {tab.label}
                  </Link>
                )
              })}
            </nav>
          ) : (
            <div />
          )}

          {/* Language Toggle Pill */}
          <div className="flex items-center rounded-[8px] border border-[#D9D4CB] bg-[#FFFEFA] p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'rounded-[6px] px-3 py-1 text-12 font-medium transition-colors',
                language === 'en' ? 'bg-[#141414] text-white' : 'text-[#6E6A63] hover:text-[#141414]'
              )}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={cn(
                'rounded-[6px] px-3 py-1 text-12 font-medium transition-colors',
                language === 'ar' ? 'bg-[#141414] text-white' : 'text-[#6E6A63] hover:text-[#141414]'
              )}
            >
              العربية
            </button>
          </div>
        </header>

        {/* Standardized Fixed Format Content Container */}
        <main className="flex-1 w-full px-6 py-6 sm:px-8 sm:py-8 max-w-[1520px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
