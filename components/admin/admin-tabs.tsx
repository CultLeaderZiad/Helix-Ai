'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { name: 'Clients Roster', href: '/admin' },
  { name: 'Lead Gen Usage', href: '/admin/leadgen' },
  { name: 'Webhooks & n8n', href: '/admin/webhooks' },
  { name: 'Team & Roles', href: '/admin/users' },
  { name: 'Pricing Manager', href: '/admin/pricing' },
  { name: 'Release Updates', href: '/admin/updates' },
  { name: 'FAQ & Docs', href: '/admin/faq' },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#D9D4CB] pb-3">
      <nav className="flex flex-wrap items-center gap-1.5" aria-label="Admin Sections">
        {TABS.map(tab => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-12 font-medium transition-colors',
                isActive
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#6E6A63] hover:bg-[#E6E2D9] hover:text-[#141414]'
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
      <div className="hidden sm:flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D9D4CB] bg-[#FFFEFA] px-2.5 py-0.5 text-[11px] font-mono font-medium text-[#0B6E4F]">
          <span className="size-1.5 rounded-full bg-[#0B6E4F]" />
          Live Agency Roster
        </span>
      </div>
    </div>
  )
}
