'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { name: 'Clients Roster', href: '/admin' },
  { name: 'Lead Gen & Search', href: '/admin/leadgen' },
  { name: 'Webhooks & n8n', href: '/admin/webhooks' },
  { name: 'Team & Roles', href: '/admin/users' },
  { name: 'Pricing Manager', href: '/admin/pricing' },
  { name: 'Release Updates', href: '/admin/updates' },
  { name: 'FAQ & Docs', href: '/admin/faq' },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-helix-border">
      <nav className="flex flex-wrap items-center gap-6" aria-label="Admin Sections">
        {TABS.map(tab => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative pb-3 text-13 font-medium transition-colors',
                isActive
                  ? 'text-helix-ink font-semibold'
                  : 'text-helix-muted hover:text-helix-ink'
              )}
            >
              {tab.name}
              {isActive && (
                <span className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-helix-ink" />
              )}
            </Link>
          )
        })}
      </nav>
      <div className="hidden sm:flex items-center gap-2 pb-3">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-helix-border bg-helix-surface px-2.5 py-0.5 text-[11px] font-mono font-medium text-helix-accent">
          <span className="size-1.5 rounded-full bg-helix-accent" />
          Live Agency Roster
        </span>
      </div>
    </div>
  )
}
