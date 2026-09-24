import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export { Button }
export { Badge } from '@/components/ui/badge'
export { KpiCard } from '@/components/ui/kpi-card'
export { Input } from '@/components/ui/input'
export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from '@/components/ui/table'

export function PageHeader({
  title,
  subtitle,
  actions,
  className,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h1 className="font-display text-24 font-bold tracking-tight text-[#141414]">{title}</h1>
        {subtitle ? <p className="mt-1 text-13 text-[#6E6B65]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export function EmptyState({
  title,
  body,
  action,
  className,
}: {
  title: string
  body?: string
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D9D4CB] bg-[#FFFEFA] px-6 py-12 text-center',
        className
      )}
    >
      <h3 className="text-15 font-semibold text-[#141414]">{title}</h3>
      {body ? <p className="mt-1 max-w-md text-13 text-[#6E6B65]">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  )
}

export function HelixKpi({
  value,
  label,
  className,
}: {
  value: React.ReactNode
  label: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-3.5 shadow-2xs',
        className
      )}
    >
      <div className="font-display text-24 font-bold text-[#141414] tabular-nums leading-none">{value}</div>
      <p className="mt-1.5 text-12 text-[#6E6B65]">{label}</p>
    </div>
  )
}

export function Pill({
  children,
  tone = 'preview',
  className,
}: {
  children: React.ReactNode
  tone?: 'core' | 'demo' | 'preview' | 'live' | 'accent' | 'warn'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-11 font-medium',
        tone === 'core' && 'bg-[#141414] text-white',
        tone === 'demo' && 'border border-[#D9D4CB] bg-[#F7F5F0] text-[#141414]',
        tone === 'preview' && 'border border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65]',
        tone === 'live' && 'bg-[#0B6E4F]/10 text-[#0B6E4F] border border-[#0B6E4F]/30',
        tone === 'accent' && 'bg-[#0B6E4F]/10 text-[#0B6E4F] border border-[#0B6E4F]/30',
        tone === 'warn' && 'bg-amber-500/10 text-amber-800 border border-amber-500/30',
        className
      )}
    >
      {children}
    </span>
  )
}

export function JobSubnav({
  items,
  activeHref,
}: {
  items: { href: string; label: string }[]
  activeHref: string
}) {
  return (
    <nav aria-label="Section" className="mb-6 flex flex-wrap gap-1.5">
      {items.map(item => {
        const active = activeHref === item.href || activeHref.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-lg px-3 py-1.5 text-12 font-medium transition-all duration-150',
              active
                ? 'bg-[#141414] text-white shadow-xs'
                : 'text-[#6E6B65] hover:bg-[#E6E2D9] hover:text-[#141414]'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
