'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Building2, ShieldCheck, DollarSign, Radio, HelpCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

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
    <div className="mb-7 flex items-center justify-between border-b border-white/[0.06] pb-4">
      <nav
        className="inline-flex items-center gap-1 rounded-xl border border-white/[0.08] bg-[#0D121F]/80 p-1 backdrop-blur-md shadow-lg shadow-black/20 overflow-x-auto max-w-full"
        aria-label="Admin Navigation Tabs"
      >
        {TABS.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          return (
            <Link
              key={tab.name}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'group inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-white/[0.1] text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)] border border-white/[0.1] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              )}
            >
              <Icon
                className={cn(
                  'size-3.5 transition-colors',
                  isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
                aria-hidden="true"
              />
              <span>{tab.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="hidden sm:flex items-center gap-2">
        <Badge variant="verified" dot>
          SYSTEM HEALTHY
        </Badge>
      </div>
    </div>
  )
}
