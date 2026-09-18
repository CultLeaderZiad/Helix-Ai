import * as React from 'react'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: string
  title?: string
  value: string | number
  delta?: string
  change?: string
  deltaType?: 'positive' | 'negative' | 'neutral'
  changeType?: 'positive' | 'negative' | 'neutral'
  subtext?: string
  hint?: string
  icon?: React.ComponentType<{ className?: string }> | React.ReactNode
  badge?: string
}

export function KpiCard({
  label,
  title,
  value,
  delta,
  change,
  deltaType,
  changeType = 'positive',
  subtext,
  hint,
  icon: IconOrElement,
  badge,
  className,
  ...props
}: KpiCardProps) {
  const displayLabel = label ?? title ?? ''
  const displayDelta = delta ?? change
  const effectiveDeltaType = deltaType ?? changeType
  const displaySubtext = subtext ?? hint

  const renderIcon = () => {
    if (!IconOrElement) return null
    if (React.isValidElement(IconOrElement)) {
      return (
        <div className="flex size-7 items-center justify-center rounded-[10px] border border-helix-border bg-helix-canvas text-helix-muted">
          {IconOrElement}
        </div>
      )
    }
    const IconComponent = IconOrElement as React.ComponentType<{ className?: string }>
    return (
      <div className="flex size-7 items-center justify-center rounded-[10px] border border-helix-border bg-helix-canvas text-helix-muted">
        <IconComponent className="size-3.5" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-[16px] border border-helix-border bg-helix-surface px-5 py-4',
        className
      )}
      {...props}
    >
      {(IconOrElement || badge) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">{renderIcon()}</div>
          {badge && (
            <span className="rounded-full bg-helix-accent-soft px-2 py-0.5 text-11 font-medium text-helix-accent">
              {badge}
            </span>
          )}
        </div>
      )}

      <div className="flex items-baseline justify-between gap-2">
        <div className="helix-title text-28 tabular-nums">{value}</div>
        {displayDelta && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-11 font-medium',
              effectiveDeltaType === 'positive' && 'bg-helix-accent-soft text-helix-ok',
              effectiveDeltaType === 'negative' && 'bg-helix-danger/10 text-helix-danger',
              effectiveDeltaType === 'neutral' && 'bg-helix-canvas text-helix-muted'
            )}
          >
            {effectiveDeltaType === 'positive' && <ArrowUpRight className="size-3" />}
            {effectiveDeltaType === 'negative' && <ArrowDownRight className="size-3" />}
            {effectiveDeltaType === 'neutral' && <Minus className="size-3" />}
            <span>{displayDelta}</span>
          </div>
        )}
      </div>

      <div className="mt-1 text-13 text-helix-muted">{displayLabel}</div>

      {displaySubtext && (
        <div className="mt-1 text-12 text-helix-muted leading-normal">{displaySubtext}</div>
      )}
    </div>
  )
}
