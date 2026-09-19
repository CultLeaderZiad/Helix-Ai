'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { signOut } from '@/lib/auth/sign-in'
import { HelixMark } from '@/components/brand/helix-mark'
import { NotificationBell } from '@/components/support/notification-bell'
import { JobSubnav } from '@/components/ui/helix'
import { ConsoleLanguageProvider, LanguageToggle } from '@/components/shell/console-language'
import { cn } from '@/lib/utils'
import { LogOut, Menu, X } from 'lucide-react'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  match: (path: string) => boolean
  group: 'primary' | 'destinations' | 'footer'
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Clients',
    group: 'primary',
    match: p => p === '/admin' || p.startsWith('/admin/clients'),
  },
  {
    href: '/admin/crm',
    label: 'Pipeline',
    group: 'primary',
    match: p => p.startsWith('/admin/crm'),
  },
  {
    href: '/admin/studio',
    label: 'Systems',
    group: 'primary',
    match: p => p.startsWith('/admin/studio') || p.startsWith('/admin/playbooks'),
  },
  {
    href: '/dashboard/engine',
    label: 'Intelligence',
    group: 'primary',
    match: p =>
      p.startsWith('/dashboard/engine') ||
      p.startsWith('/dashboard/reports') ||
      p.startsWith('/admin/analytics') ||
      p.startsWith('/admin/queue') ||
      p.startsWith('/dashboard/queue') ||
      p.startsWith('/dashboard/facts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Studio Builds',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'AI Engine',
    group: 'destinations',
    match: p => p === '/dashboard/engine' || p.startsWith('/dashboard/engine/'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    group: 'destinations',
    match: p => p.startsWith('/admin/analytics'),
  },
  {
    href: '/admin/queue',
    label: 'Agent Queue',
    group: 'destinations',
    match: p => p.startsWith('/admin/queue') || p.startsWith('/dashboard/queue'),
  },
  {
    href: '/admin/support',
    label: 'Support',
    group: 'footer',
    match: p => p.startsWith('/admin/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    group: 'footer',
    match: p => p.startsWith('/settings'),
  },
]

const CLIENT_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    group: 'primary',
    match: p => p === '/dashboard',
  },
  {
    href: '/dashboard/crm',
    label: 'Pipeline',
    group: 'primary',
    match: p => p.startsWith('/dashboard/crm') || p.startsWith('/dashboard/contacts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Systems',
    group: 'primary',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'Intelligence',
    group: 'primary',
    match: p =>
      p.startsWith('/dashboard/engine') ||
      p.startsWith('/dashboard/reports') ||
      p.startsWith('/dashboard/queue') ||
      p.startsWith('/dashboard/facts'),
  },
  {
    href: '/dashboard/studio',
    label: 'Studio Builds',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/studio'),
  },
  {
    href: '/dashboard/engine',
    label: 'AI Engine',
    group: 'destinations',
    match: p => p === '/dashboard/engine' || p.startsWith('/dashboard/engine/'),
  },
  {
    href: '/dashboard/reports',
    label: 'Reports',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/reports'),
  },
  {
    href: '/dashboard/queue',
    label: 'Agent Queue',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/queue'),
  },
  {
    href: '/dashboard/facts',
    label: 'Facts',
    group: 'destinations',
    match: p => p.startsWith('/dashboard/facts'),
  },
  {
    href: '/dashboard/support',
    label: 'Support',
    group: 'footer',
    match: p => p.startsWith('/dashboard/support'),
  },
  {
    href: '/settings',
    label: 'Settings',
    group: 'footer',
    match: p =>
      p.startsWith('/settings') ||
      p.startsWith('/dashboard/billing') ||
      p.startsWith('/dashboard/integrations'),
  },
]

const ADMIN_CONSOLE_LINKS = [
  { href: '/admin', label: 'Clients' },
  { href: '/admin/users', label: 'Team & Roles' },
  { href: '/admin/pricing', label: 'Pricing' },
  { href: '/admin/updates', label: 'Updates' },
  { href: '/admin/faq', label: 'FAQ' },
]

const ADMIN_SYSTEMS_LINKS = [
  { href: '/admin/studio', label: 'Catalog' },
  { href: '/dashboard/studio', label: 'Demos' },
  { href: '/admin/playbooks', label: 'Guides' },
]

const ADMIN_INTEL_LINKS = [
  { href: '/dashboard/engine', label: 'Engine' },
  { href: '/dashboard/reports', label: 'Reports' },
  { href: '/admin/analytics', label: 'Analytics' },
  { href: '/admin/queue', label: 'Queue' },
]

const CLIENT_INTEL_LINKS = [
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
      pathname === '/admin' ||
      pathname.startsWith('/admin/clients') ||
      pathname.startsWith('/admin/users') ||
      pathname.startsWith('/admin/pricing') ||
      pathname.startsWith('/admin/updates') ||
      pathname.startsWith('/admin/faq')
    ) {
      return ADMIN_CONSOLE_LINKS
    }
    if (pathname.startsWith('/admin/studio') || pathname.startsWith('/dashboard/studio') || pathname.startsWith('/admin/playbooks')) {
      return ADMIN_SYSTEMS_LINKS
    }
    if (
      pathname.startsWith('/dashboard/engine') ||
      pathname.startsWith('/dashboard/reports') ||
      pathname.startsWith('/admin/analytics') ||
      pathname.startsWith('/admin/queue') ||
      pathname.startsWith('/dashboard/queue') ||
      pathname.startsWith('/dashboard/facts')
    ) {
      return ADMIN_INTEL_LINKS
    }
    if (pathname.startsWith('/settings')) {
      return ADMIN_SETTINGS_LINKS
    }
    return null
  }

  if (
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

function SidebarNav({
  items,
  pathname,
  onNavigate,
}: {
  items: NavItem[]
  pathname: string
  onNavigate?: () => void
}) {
  const primary = items.filter(item => item.group === 'primary')
  const destinations = items.filter(item => item.group === 'destinations')
  const footer = items.filter(item => item.group === 'footer')

  const linkClass = (active: boolean) =>
    cn(
      'flex min-h-[36px] items-center rounded-[10px] px-3 py-2 text-14 font-medium transition-colors duration-150',
      active
        ? 'bg-white/10 text-[#FFFEFA]'
        : 'text-[#FFFEFA]/62 hover:bg-white/[0.06] hover:text-[#FFFEFA]',
    )

  return (
    <nav aria-label="Console" className="flex flex-1 flex-col px-3 pb-3">
      <div className="flex flex-col gap-0.5">
        {primary.map(item => (
          <Link
            key={`${item.group}-${item.label}`}
            href={item.href}
            aria-current={item.match(pathname) ? 'page' : undefined}
            onClick={onNavigate}
            className={linkClass(item.match(pathname))}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-5 flex flex-col gap-0.5">
        {destinations.map(item => (
          <Link
            key={`${item.group}-${item.label}`}
            href={item.href}
            aria-current={item.match(pathname) ? 'page' : undefined}
            onClick={onNavigate}
            className={linkClass(item.match(pathname))}
          >
            {item.label}
          </Link>
        ))}
      </div>
      <div className="mt-auto flex flex-col gap-0.5 pt-6">
        {footer.map(item => (
          <Link
            key={`${item.group}-${item.label}`}
            href={item.href}
            aria-current={item.match(pathname) ? 'page' : undefined}
            onClick={onNavigate}
            className={linkClass(item.match(pathname))}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
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
  const subnav = subnavFor(pathname, variant)
  const userInitial = email ? email.charAt(0).toUpperCase() : 'H'
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  return (
    <ConsoleLanguageProvider>
      <div className="flex min-h-dvh w-full bg-helix-canvas text-helix-ink">
        <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 flex-col bg-helix-sidebar text-[#FFFEFA] lg:flex">
          <div className="flex items-center gap-3 px-4 py-5">
            <HelixMark size={32} rounded="rounded-[10px]" className="border-white/10" />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-12 font-semibold uppercase tracking-[0.12em] text-[#FFFEFA]">
                {variant === 'admin' ? 'Direction 2 · Warm Command' : title}
              </span>
              <span className="mt-1 text-11 font-medium uppercase tracking-[0.08em] text-[#FFFEFA]/45">
                {variant === 'admin' ? 'Agency · Live' : 'Workspace'}
              </span>
            </div>
          </div>
          <SidebarNav items={nav} pathname={pathname} />
        </aside>

        {drawerOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              className="absolute inset-0 bg-helix-ink/40"
              onClick={() => setDrawerOpen(false)}
            />
            <aside className="relative flex h-full w-[min(20rem,86vw)] flex-col bg-helix-sidebar text-[#FFFEFA] shadow-helix">
              <div className="flex items-center justify-between px-4 py-4">
                <div className="flex items-center gap-3">
                  <HelixMark size={28} rounded="rounded-[8px]" className="border-white/10" />
                  <div>
                    <p className="text-12 font-semibold uppercase tracking-[0.12em]">{title}</p>
                    <p className="text-11 uppercase tracking-[0.08em] text-[#FFFEFA]/45">
                      {variant === 'admin' ? 'Agency · Live' : 'Workspace'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => setDrawerOpen(false)}
                  className="flex size-9 items-center justify-center rounded-[10px] text-[#FFFEFA]/70 hover:bg-white/10"
                >
                  <X className="size-4" />
                </button>
              </div>
              <SidebarNav items={nav} pathname={pathname} onNavigate={() => setDrawerOpen(false)} />
              <div className="border-t border-white/10 px-4 py-4">
                <p className="truncate text-12 text-[#FFFEFA]/55">{email}</p>
                <form action={signOut} className="mt-3">
                  <button
                    type="submit"
                    className="flex min-h-10 w-full items-center justify-center rounded-[10px] border border-white/15 text-13 text-[#FFFEFA]"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </aside>
          </div>
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col bg-helix-canvas">
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-helix-border bg-helix-canvas px-4 py-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] sm:px-5 lg:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                className="flex size-10 items-center justify-center rounded-[10px] border border-helix-border bg-helix-surface text-helix-ink lg:hidden"
                aria-label="Open navigation"
                aria-expanded={drawerOpen}
                onClick={() => setDrawerOpen(true)}
              >
                <Menu className="size-4" />
              </button>
              {subnav ? (
                <JobSubnav items={subnav} activeHref={pathname} className="mb-0" />
              ) : (
                <div className="flex items-center gap-2 lg:hidden">
                  <HelixMark size={26} rounded="rounded-[8px]" />
                  <p className="truncate text-13 font-semibold">{title}</p>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <LanguageToggle className="hidden sm:flex" />
              <div className="hidden items-center gap-1 lg:flex">
                <div className="flex size-7 items-center justify-center rounded-[8px] bg-helix-surface text-12 font-semibold text-helix-ink">
                  {userInitial}
                </div>
                <NotificationBell isAdmin={variant === 'admin'} clientId={null} />
                <form action={signOut}>
                  <button
                    type="submit"
                    aria-label="Sign out"
                    title="Sign out"
                    className="flex size-7 items-center justify-center rounded-[8px] text-helix-muted hover:bg-helix-surface hover:text-helix-ink"
                  >
                    <LogOut className="size-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-5 sm:px-5 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
    </ConsoleLanguageProvider>
  )
}
