import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
        <h1 className="helix-title text-28">{title}</h1>
        {subtitle ? <p className="mt-1 text-13 text-helix-muted">{subtitle}</p> : null}
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
        'flex flex-col items-center justify-center rounded-[16px] border border-dashed border-helix-border bg-helix-canvas/60 px-6 py-12 text-center',
        className
      )}
    >
      <h3 className="helix-title text-15">{title}</h3>
      {body ? <p className="mt-1 max-w-md text-13 text-helix-muted">{body}</p> : null}
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
        'rounded-[16px] border border-helix-border bg-helix-surface px-5 py-4',
        className
      )}
    >
      <div className="helix-title text-28 tabular-nums leading-none">{value}</div>
      <p className="mt-1.5 text-13 text-helix-muted">{label}</p>
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
        'inline-flex items-center rounded-full px-2 py-0.5 text-11 font-medium',
        tone === 'core' && 'bg-helix-ink text-helix-surface',
        tone === 'demo' && 'bg-helix-accent-soft text-helix-accent',
        tone === 'preview' && 'border border-helix-border bg-helix-canvas text-helix-muted',
        tone === 'live' && 'bg-helix-accent-soft text-helix-ok',
        tone === 'accent' && 'bg-helix-accent-soft text-helix-accent',
        tone === 'warn' && 'bg-[#f8eedd] text-helix-warn',
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
    <nav aria-label="Section" className="mb-6 flex flex-wrap gap-1">
      {items.map(item => {
        const active = activeHref === item.href || activeHref.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'rounded-full px-3 py-1.5 text-13 transition-colors',
              active
                ? 'bg-helix-ink text-helix-surface'
                : 'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink'
            )}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

export function HelixSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn('helix-field', className)} {...props}>
      {children}
    </select>
  )
}

export { Button }
