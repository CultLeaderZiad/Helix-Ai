'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, ShieldCheck, DollarSign, Radio, HelpCircle } from 'lucide-react'

const TABS = [
  { name: 'Clients', href: '/admin', icon: Building2 },
  { name: 'Team & Roles', href: '/admin/users', icon: ShieldCheck },
  { name: 'Pricing', href: '/admin/pricing', icon: DollarSign },
  { name: 'Updates', href: '/admin/updates', icon: Radio },
  { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
]

export function AdminTabs() {
  const pathname = usePathname()

  return (
    <div className="mb-8 border-b border-border">
      <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={cn(
                isActive
                  ? 'border-accent text-accent'
                  : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
                'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors'
              )}
            >
              <Icon
                className={cn(
                  isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground',
                  'mr-2 size-4'
                )}
                aria-hidden="true"
              />
              {tab.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
