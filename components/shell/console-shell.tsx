'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/auth/sign-in'
import { HelixMark } from '@/components/brand/helix-mark'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ConsoleVariant = 'admin' | 'client'

interface NavItem {
  href: string
  label: string
  match: (path: string) => boolean
}

const ADMIN_NAV: NavItem[] = [
  {
    href: '/admin',
    label: 'Roster',
    match: p => p.startsWith('/admin') && !p.startsWith('/admin/analytics'),
  },
  { href: '/admin/analytics', label: 'Analytics', match: p => p.startsWith('/admin/analytics') },
  { href: '/settings', label: 'Settings', match: p => p.startsWith('/settings') },
]

const CLIENT_NAV: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Home',
    match: p =>
      p.startsWith('/dashboard') &&
      !p.startsWith('/dashboard/contacts') &&
      !p.startsWith('/dashboard/queue'),
  },
  { href: '/dashboard/contacts', label: 'Contacts', match: p => p.startsWith('/dashboard/contacts') },
  { href: '/dashboard/queue', label: 'Queue', match: p => p.startsWith('/dashboard/queue') },
  { href: '/settings', label: 'Settings', match: p => p.startsWith('/settings') },
]

/**
 * Shared console chrome (spec §1.8): left sidebar at ≥1280px, top bar plus
 * bottom tab bar at 375px. Variant decides the nav set and the workspace
 * title; every route renders inside it and supplies its own session values.
 */
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
    return (
      <Link
        key={item.href}
        href={item.href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          layout === 'sidebar'
            ? 'flex min-h-[36px] items-center rounded-md px-3 text-body transition-colors hover:bg-muted'
            : 'flex min-h-[44px] items-center justify-center border-b-2 py-2 text-small',
          active
            ? layout === 'sidebar'
              ? 'bg-muted font-medium text-foreground'
              : 'border-accent text-foreground'
            : layout === 'sidebar'
              ? 'text-muted-foreground'
              : 'border-transparent text-muted-foreground',
        )}
      >
        {item.label}
      </Link>
    )
  }

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-panel lg:flex">
        <div className="flex items-center gap-3 border-b p-4">
          <HelixMark size={32} />
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-display text-body leading-tight">{title}</span>
            <span className="text-small text-muted-foreground">{descriptor}</span>
          </div>
        </div>
        <nav aria-label="Console" className="flex flex-1 flex-col gap-1 p-3">
          {nav.map(item => navLink(item, 'sidebar'))}
        </nav>
        <div className="border-t p-4">
          <p className="truncate text-small text-muted-foreground">{email}</p>
          <form action={signOut}>
            <Button type="submit" variant="ghost" size="sm" className="-ml-2 mt-2">
              Sign out
            </Button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-40 flex items-center gap-3 border-b bg-panel px-4 py-3 lg:hidden">
          <HelixMark size={32} />
          <div className="min-w-0">
            <p className="truncate font-display text-body leading-tight">{title}</p>
            <p className="text-small text-muted-foreground">{descriptor}</p>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        <nav
          aria-label="Console"
          className="sticky bottom-0 z-40 grid grid-cols-4 border-t bg-panel lg:hidden"
        >
          {nav.map(item => navLink(item, 'tab'))}
        </nav>
      </div>
    </div>
  )
}
