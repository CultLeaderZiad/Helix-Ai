'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { HelixMark } from '@/components/brand/helix-mark'
import { NotificationBell } from '@/components/support/notification-bell'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Sparkles,
  ListTodo,
  PlugZap,
  CreditCard,
  Settings,
  Building2,
  BarChart3,
  ShieldCheck,
  LogOut,
  Cpu,
  FileText,
  BookOpen,
  HelpCircle,
  DollarSign,
  Radio,
} from 'lucide-react'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  badgeVariant?: 'cyan' | 'purple'
  match: (path: string) => boolean
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Admin Console',
    icon: Building2,
    match: p => p === '/admin' || p.startsWith('/admin/clients') || p.startsWith('/admin/users') || p.startsWith('/admin/pricing') || p.startsWith('/admin/updates') || p.startsWith('/admin/faq'),
  },
  {
    href: '/admin/crm',
    label: 'Cross-Client CRM',
    icon: Users,
    match: p => p.startsWith('/admin/crm'),
  },
  {
    href: '/admin/studio',
    label: 'Studio Builds',
    icon: Sparkles,
    badge: 'NEW',
    badgeVariant: 'cyan',
    match: p => p.startsWith('/admin/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'AI Engine',
    icon: Cpu,
    badge: 'AI',
    badgeVariant: 'purple',
    match: p => p.startsWith('/dashboard/engine'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: FileText,
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/admin/playbooks',
    label: 'Playbooks',
    icon: BookOpen,
    match: p => p.startsWith('/admin/playbooks'),
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    icon: BarChart3,
    match: p => p.startsWith('/admin/analytics'),
  },
  {
    href: '/admin/queue',
    label: 'Agent Queue',
    icon: ListTodo,
    match: p => p.startsWith('/admin/queue'),
  },
  {
    href: '/admin/support',
    label: 'Support Tickets',
    icon: HelpCircle,
    match: p => p.startsWith('/admin/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    match: p => p.startsWith('/settings'),
  },
]

const CLIENT_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Overview',
    icon: LayoutDashboard,
    match: p => p === '/dashboard',
  },
  {
    href: '/dashboard/crm',
    label: 'CRM',
    icon: Users,
    match: p => p.startsWith('/dashboard/crm') || p.startsWith('/dashboard/contacts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Studio',
    icon: Sparkles,
    badge: 'NEW',
    badgeVariant: 'cyan',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'AI Engine',
    icon: Cpu,
    badge: 'AI',
    badgeVariant: 'purple',
    match: p => p.startsWith('/dashboard/engine'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    icon: FileText,
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/dashboard/queue',
    label: 'Queue',
    icon: ListTodo,
    badge: 3,
    badgeVariant: 'purple',
    match: p => p.startsWith('/dashboard/queue') || p.startsWith('/dashboard/facts'),
  },
  {
    href: '/dashboard/integrations',
    label: 'Integrations',
    icon: PlugZap,
    match: p => p.startsWith('/dashboard/integrations'),
  },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: CreditCard,
    match: p => p.startsWith('/dashboard/billing'),
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    icon: HelpCircle,
    match: p => p.startsWith('/dashboard/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: Settings,
    match: p => p.startsWith('/settings'),
  },
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
  const nav = variant === 'admin' ? ADMIN_NAV : CLIENT_NAV
  const title = variant === 'admin' ? 'Helix AI' : businessName ?? 'Workspace'
  const descriptor = variant === 'admin' ? 'Operations console' : 'Client portal'

  const navLink = (item: NavItem, layout: 'sidebar' | 'tab') => {
    const active = item.match(pathname)
    const Icon = item.icon
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          layout === 'sidebar'
            ? 'group relative flex min-h-[42px] items-center justify-between rounded-full px-4 text-sm font-medium transition-all duration-200'
            : 'flex min-h-[48px] flex-col items-center justify-center gap-1 border-t-2 py-1 text-xs',
          active
            ? layout === 'sidebar'
              ? 'bg-[#00d2ff]/15 text-[#00f2fe] border border-[#00d2ff]/35 shadow-[0_0_20px_rgba(0,210,255,0.22)]'
              : 'border-[#00d2ff] text-[#00f2fe]'
            : layout === 'sidebar'
              ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
              : 'border-transparent text-slate-400 hover:text-slate-200',
        )}
      >
        <div className="flex items-center gap-3">
          <Icon
            className={cn(
              'size-4 shrink-0 transition-transform duration-200',
              active ? 'text-[#00f2fe]' : 'text-slate-400 group-hover:text-slate-200',
            )}
          />
          <span className="truncate">{item.label}</span>
        </div>

        {item.badge != null && layout === 'sidebar' ? (
          <span
            className={cn(
              'flex h-5 items-center justify-center rounded-full px-2 text-[10px] font-semibold tracking-wide uppercase',
              item.badgeVariant === 'purple'
                ? 'bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.3)]',
            )}
          >
            {item.badge}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <div className="min-h-screen min-h-svh bg-[#0B0F19] text-slate-100 lg:grid lg:grid-cols-[260px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen h-svh flex-col border-r border-slate-800/80 bg-[#0c111d] lg:flex">
        <div className="flex items-center gap-3 border-b border-slate-800/80 p-4">
          <HelixMark size={36} rounded="rounded-xl" className="shadow-[0_0_15px_rgba(0,210,255,0.2)]" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-sm font-bold tracking-wide text-white">
              {title}
            </span>
            <span className="text-[11px] font-medium text-slate-400">{descriptor}</span>
          </div>
        </div>

        <nav aria-label="Console" className="flex flex-1 flex-col gap-1.5 p-4">
          {nav.map(item => navLink(item, 'sidebar'))}
        </nav>

        <div className="border-t border-slate-800/80 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-slate-300">{email}</p>
              <p className="text-[11px] text-slate-500 capitalize">{variant === 'admin' ? 'Agency Admin' : 'Client User'}</p>
            </div>
            <div className="flex items-center gap-1">
              <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-rose-400 transition-colors"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top & Bottom Chrome */}
      <div className="flex min-h-screen min-h-svh flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800/80 bg-[#0c111d]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <HelixMark size={28} rounded="rounded-lg" />
            <div>
              <p className="truncate font-display text-xs font-bold text-white">{title}</p>
              <p className="text-[10px] text-slate-400">{descriptor}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-slate-700 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300"
            >
              Sign out
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>

        <nav
          aria-label="Console"
          className="sticky bottom-0 z-40 flex items-center justify-around border-t border-slate-800 bg-[#0c111d]/95 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        >
          {nav.slice(0, 5).map(item => navLink(item, 'tab'))}
        </nav>
      </div>
    </div>
  )
}
