'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { HelixMark } from '@/components/brand/helix-mark'
import { NotificationBell } from '@/components/support/notification-bell'
import { JobSubnav } from '@/components/ui/helix'
import { cn } from '@/lib/utils'
import { LogOut } from 'lucide-react'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  match: (path: string) => boolean
  section?: 'primary' | 'secondary'
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Clients',
    section: 'primary',
    match: p => p === '/admin' || p.startsWith('/admin/clients'),
  },
  {
    href: '/admin/crm',
    label: 'Pipeline',
    section: 'primary',
    match: p => p.startsWith('/admin/crm'),
  },
  {
    href: '/admin/studio',
    label: 'Systems',
    section: 'primary',
    match: p =>
      p.startsWith('/admin/studio') ||
      p.startsWith('/admin/playbooks') ||
      p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'Intelligence',
    section: 'primary',
    match: p =>
      p.startsWith('/dashboard/engine') ||
      p.startsWith('/dashboard/reports') ||
      p.startsWith('/admin/analytics') ||
      p.startsWith('/admin/queue') ||
      p.startsWith('/dashboard/queue') ||
      p.startsWith('/dashboard/facts'),
  },
  {
    href: '/admin/support',
    label: 'Support',
    section: 'secondary',
    match: p => p.startsWith('/admin/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    section: 'secondary',
    match: p =>
      p.startsWith('/settings') ||
      p.startsWith('/admin/users') ||
      p.startsWith('/admin/pricing') ||
      p.startsWith('/admin/updates') ||
      p.startsWith('/admin/faq'),
  },
]

const CLIENT_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    section: 'primary',
    match: p => p === '/dashboard',
  },
  {
    href: '/dashboard/crm',
    label: 'Pipeline',
    section: 'primary',
    match: p => p.startsWith('/dashboard/crm') || p.startsWith('/dashboard/contacts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Systems',
    section: 'primary',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'Intelligence',
    section: 'primary',
    match: p =>
      p.startsWith('/dashboard/engine') ||
      p.startsWith('/dashboard/reports') ||
      p.startsWith('/dashboard/queue') ||
      p.startsWith('/dashboard/facts') ||
      p.startsWith('/dashboard/health'),
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    section: 'secondary',
    match: p => p.startsWith('/dashboard/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    section: 'secondary',
    match: p =>
      p.startsWith('/settings') ||
      p.startsWith('/dashboard/billing') ||
      p.startsWith('/dashboard/integrations'),
  },
]

const ADMIN_SYSTEMS_LINKS = [
  { href: '/admin/studio', label: 'Catalog' },
  { href: '/dashboard/studio', label: 'Demos' },
  { href: '/admin/playbooks', label: 'Guides' },
]

const ADMIN_INTEL_LINKS = [
  { href: '/dashboard/health', label: 'Health' },
  { href: '/dashboard/engine', label: 'Engine' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/queue', label: 'Queue' },
]

const CLIENT_INTEL_LINKS = [
  { href: '/dashboard/health', label: 'Health' },
  { href: '/dashboard/engine', label: 'Engine' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/dashboard/queue', label: 'Queue' },
  { href: '/dashboard/facts', label: 'Facts' },
]

const ADMIN_SETTINGS_LINKS = [
  { href: '/settings', label: 'Workspace' },
  { href: '/admin/users', label: 'Team' },
  { href: '/admin/pricing', label: 'Pricing' },
  { href: '/admin/updates', label: 'Updates' },
  { href: '/admin/faq', label: 'FAQ' },
]

const CLIENT_SETTINGS_LINKS = [
  { href: '/settings', label: 'Workspace' },
  { href: '/dashboard/integrations', label: 'Integrations' },
  { href: '/dashboard/billing', label: 'Billing' },
]

function subnavFor(pathname: string, variant: ConsoleVariant) {
  if (variant === 'admin') {
    if (
      pathname.startsWith('/admin/studio') ||
      pathname.startsWith('/dashboard/studio') ||
      pathname.startsWith('/admin/playbooks')
    ) {
      return ADMIN_SYSTEMS_LINKS
    }
    if (
      pathname.startsWith('/dashboard/health') ||
      pathname.startsWith('/dashboard/engine') ||
      pathname.startsWith('/dashboard/reports') ||
      pathname.startsWith('/admin/analytics') ||
      pathname.startsWith('/admin/queue') ||
      pathname.startsWith('/dashboard/queue') ||
      pathname.startsWith('/dashboard/facts')
    ) {
      return ADMIN_INTEL_LINKS
    }
    if (
      pathname.startsWith('/settings') ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/pricing') ||
      pathname.startsWith('/admin/updates') ||
      pathname.startsWith('/admin/faq')
    ) {
      return ADMIN_SETTINGS_LINKS
    }
    return null
  }

  if (
    pathname.startsWith('/dashboard/health') ||
    pathname.startsWith('/dashboard/engine') ||
    pathname.startsWith('/dashboard/reports') ||
    pathname.startsWith('/dashboard/queue') ||
    pathname.startsWith('/dashboard/facts')
  ) {
    return CLIENT_INTEL_LINKS
  }
  if (pathname.startsWith('/settings') || pathname.startsWith('/dashboard/billing') || pathname.startsWith('/dashboard/integrations')) {
    return CLIENT_SETTINGS_LINKS
  }
  return null
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
  const nav = variant === 'admin' ? ADMIN_NAV : CLIENT_NAV
  const title = variant === 'admin' ? 'Helix AI' : businessName ?? 'Workspace'
  const primary = nav.filter(item => item.section !== 'secondary')
  const secondary = nav.filter(item => item.section === 'secondary')
  const subnav = subnavFor(pathname, variant)
  const userInitial = email ? email.charAt(0).toUpperCase() : 'H'
  const mobileNav = [...primary, ...secondary].slice(0, 5)

  const navLink = (item: NavItem, layout: 'sidebar' | 'tab') => {
    const active = item.match(pathname)
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          layout === 'sidebar'
            ? 'flex min-h-[36px] items-center rounded-[12px] px-3 py-2 text-14 font-medium transition-colors duration-150'
            : 'flex min-h-[48px] flex-col items-center justify-center gap-1 border-t-2 py-1 text-12',
          active
            ? layout === 'sidebar'
              ? 'bg-helix-canvas text-helix-ink'
              : 'border-helix-ink text-helix-ink font-medium'
            : layout === 'sidebar'
              ? 'text-helix-muted hover:bg-helix-canvas/70 hover:text-helix-ink'
              : 'border-transparent text-helix-muted hover:text-helix-ink',
        )}
      >
        <span className="truncate">{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="min-h-screen min-h-svh bg-helix-canvas p-3 text-helix-ink sm:p-4 lg:p-6">
      <div className="helix-shell mx-auto flex min-h-[calc(100svh-1.5rem)] w-full max-w-[1280px] overflow-hidden lg:min-h-[calc(100svh-3rem)] lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="sticky top-0 hidden h-full min-h-[calc(100svh-3rem)] flex-col border-r border-helix-border bg-helix-surface lg:flex">
          <div className="flex items-center gap-3 px-4 py-5">
            <HelixMark size={32} rounded="rounded-[10px]" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-15 font-semibold tracking-[-0.03em] text-helix-ink">
                {title}
              </span>
              <span className="mt-0.5 text-11 font-medium uppercase tracking-[0.08em] text-helix-muted">
                {variant === 'admin' ? 'Agency' : 'Workspace'}
              </span>
            </div>
          </div>

          <nav aria-label="Console" className="flex flex-1 flex-col px-3 pb-3">
            <div className="flex flex-col gap-0.5">{primary.map(item => navLink(item, 'sidebar'))}</div>
            <div className="mt-auto flex flex-col gap-0.5 border-t border-helix-border pt-3">
              {secondary.map(item => navLink(item, 'sidebar'))}
              <div className="mt-3 flex items-center justify-between gap-2 rounded-[12px] px-2 py-2">
                <div className="flex min-w-0 items-center gap-2">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-[8px] bg-helix-canvas text-12 font-semibold text-helix-ink">
                    {userInitial}
                  </div>
                  <p className="truncate text-12 text-helix-muted">{email}</p>
                </div>
                <div className="flex shrink-0 items-center">
                  <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
                  <form action={signOut}>
                    <button
                      type="submit"
                      aria-label="Sign out"
                      title="Sign out"
                      className="flex size-7 items-center justify-center rounded-[8px] text-helix-muted hover:bg-helix-canvas hover:text-helix-ink"
                    >
                      <LogOut className="size-3.5" />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        <div className="flex min-h-0 flex-col bg-helix-surface">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-helix-border bg-helix-surface px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] lg:hidden">
            <div className="flex items-center gap-2.5">
              <HelixMark size={26} rounded="rounded-[8px]" />
              <div>
                <p className="truncate text-13 font-semibold text-helix-ink">{title}</p>
                <p className="text-11 uppercase tracking-[0.08em] text-helix-muted">
                  {variant === 'admin' ? 'Agency' : 'Workspace'}
                </p>
              </div>
            </div>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-[10px] border border-helix-border px-2.5 py-1 text-12 text-helix-ink hover:bg-helix-canvas"
              >
                Sign out
              </button>
            </form>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-7">
            {subnav ? <JobSubnav items={subnav} activeHref={pathname} /> : null}
            {children}
          </main>

          <nav
            aria-label="Console"
            className="sticky bottom-0 z-40 flex items-center justify-around border-t border-helix-border bg-helix-surface py-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] lg:hidden"
          >
            {mobileNav.map(item => navLink(item, 'tab'))}
          </nav>
        </div>
      </div>
    </div>
  )
}
