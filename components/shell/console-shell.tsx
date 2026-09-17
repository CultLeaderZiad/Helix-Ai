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
  const descriptor = variant === 'admin' ? 'Agency Admin Console' : 'Enterprise Client Portal'

  const userInitial = email ? email.charAt(0).toUpperCase() : 'H'

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
            ? 'group relative flex min-h-[36px] items-center justify-between rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-150'
            : 'flex min-h-[48px] flex-col items-center justify-center gap-1 border-t-2 py-1 text-xs',
          active
            ? layout === 'sidebar'
              ? 'bg-white/[0.07] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/10'
              : 'border-sky-400 text-white font-medium'
            : layout === 'sidebar'
              ? 'text-slate-400 hover:bg-white/[0.03] hover:text-slate-200 border border-transparent'
              : 'border-transparent text-slate-400 hover:text-slate-200',
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {active && layout === 'sidebar' && (
            <span
              className="absolute left-0 top-1/2 h-4 w-[2.5px] -translate-y-1/2 rounded-r-full bg-sky-400"
              aria-hidden="true"
            />
          )}
          <Icon
            className={cn(
              'size-4 shrink-0 transition-colors duration-150',
              active ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200',
            )}
          />
          <span className="truncate tracking-tight">{item.label}</span>
        </div>

        {item.badge != null && layout === 'sidebar' ? (
          <span
            className={cn(
              'inline-flex items-center justify-center rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold tracking-wider uppercase',
              item.badgeVariant === 'purple'
                ? 'border border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
                : 'border border-sky-500/30 bg-sky-500/10 text-sky-400',
            )}
          >
            {item.badge}
          </span>
        ) : null}
      </Link>
    )
  }

  return (
    <div className="min-h-screen min-h-svh bg-[#080b11] text-slate-100 lg:grid lg:grid-cols-[252px_1fr]">
      {/* Desktop Sidebar */}
      <aside className="sticky top-0 hidden h-screen h-svh flex-col border-r border-white/[0.08] bg-[#0b0f17]/95 backdrop-blur-xl lg:flex">
        {/* Workspace Brand Header */}
        <div className="flex items-center gap-3 border-b border-white/[0.08] px-4 py-3.5">
          <div className="relative">
            <HelixMark size={32} rounded="rounded-lg" className="border border-white/[0.1] shadow-sm" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#0b0f17]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-display text-sm font-semibold tracking-tight text-white">
                {title}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="size-1 rounded-full bg-cyan-400/80 animate-pulse" />
              <span className="text-[10px] font-medium tracking-wide uppercase text-slate-400 font-mono">
                {variant === 'admin' ? 'GCC EAST · OPS' : 'ACTIVE CLIENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Item List */}
        <nav aria-label="Console" className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto">
          <div className="px-2 pb-1 pt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Navigation
            </p>
          </div>
          {nav.map(item => navLink(item, 'sidebar'))}
        </nav>

        {/* User Profile & Footer */}
        <div className="border-t border-white/[0.08] p-3 bg-white/[0.01]">
          <div className="flex items-center justify-between gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] p-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-md border border-white/[0.1] bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-slate-200 shadow-xs">
                {userInitial}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-200">{email}</p>
                <p className="text-[10px] text-slate-400 font-mono uppercase">
                  {variant === 'admin' ? 'Agency Administrator' : 'Client Operator'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 shrink-0">
              <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
              <form action={signOut}>
                <button
                  type="submit"
                  aria-label="Sign out"
                  title="Sign out"
                  className="flex size-7 items-center justify-center rounded-md text-slate-400 hover:bg-white/[0.08] hover:text-rose-400 transition-colors"
                >
                  <LogOut className="size-3.5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Top & Bottom Chrome */}
      <div className="flex min-h-screen min-h-svh flex-col">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-white/[0.08] bg-[#0b0f17]/95 px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2.5">
            <HelixMark size={26} rounded="rounded-md" />
            <div>
              <p className="truncate font-display text-xs font-bold text-white">{title}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase">{descriptor}</p>
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-white/[0.1] bg-white/[0.04] px-2.5 py-1 text-xs text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              Sign out
            </button>
          </form>
        </header>

        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7">{children}</main>

        <nav
          aria-label="Console"
          className="sticky bottom-0 z-40 flex items-center justify-around border-t border-white/[0.08] bg-[#0b0f17]/95 py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden"
        >
          {nav.slice(0, 5).map(item => navLink(item, 'tab'))}
        </nav>
      </div>
    </div>
  )
}
