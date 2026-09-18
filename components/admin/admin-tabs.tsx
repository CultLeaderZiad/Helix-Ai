'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { name: 'Clients', href: '/admin' },
  { name: 'Team & roles', href: '/admin/users' },
  { name: 'Pricing', href: '/admin/pricing' },
  { name: 'Updates', href: '/admin/updates' },
  { name: 'FAQ', href: '/admin/faq' },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-6">
      <nav className="flex flex-wrap gap-1" aria-label="Admin">
        {TABS.map(tab => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'rounded-full px-3 py-1.5 text-13 transition-colors',
                isActive ? 'bg-helix-ink text-white' : 'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink'
              )}
            >
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
