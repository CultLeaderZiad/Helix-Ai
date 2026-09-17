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
        <div className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
          {IconOrElement}
        </div>
      )
    }
    const IconComponent = IconOrElement as React.ComponentType<{ className?: string }>
    return (
      <div className="flex size-7 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300">
        <IconComponent className="size-3.5" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-col justify-between rounded-xl border border-white/10 bg-[#0D121F] p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_8px_20px_-4px_rgba(0,0,0,0.4)] transition-all duration-200 hover:border-white/20',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {renderIcon()}
          <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            {displayLabel}
          </span>
        </div>

        {badge && (
          <span className="rounded-md border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-sky-400">
            {badge}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-2">
        <div className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {value}
        </div>

        {delta && (
          <div
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-mono text-[11px] font-medium',
              deltaType === 'positive' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
              deltaType === 'negative' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
              deltaType === 'neutral' && 'bg-slate-800 text-slate-400 border border-slate-700'
            )}
          >
            {deltaType === 'positive' && <ArrowUpRight className="size-3" />}
            {deltaType === 'negative' && <ArrowDownRight className="size-3" />}
            {deltaType === 'neutral' && <Minus className="size-3" />}
            <span>{delta}</span>
          </div>
        )}
      </div>

      {subtext && (
        <div className="mt-2 text-[11px] text-slate-400 leading-normal">
          {subtext}
        </div>
      )}
    </div>
  )
}
