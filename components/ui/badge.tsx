import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border font-mono text-[11px] font-semibold uppercase tracking-wider transition-colors select-none focus:outline-hidden',
  {
    variants: {
      variant: {
        default:
          'border-white/10 bg-white/5 text-slate-300 hover:bg-white/8',
        outline:
          'border-white/15 bg-transparent text-slate-300',
        cyan:
          'border-sky-500/30 bg-sky-500/10 text-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.15)]',
        verified:
          'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]',
        probable:
          'border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]',
        possible:
          'border-indigo-500/30 bg-indigo-500/10 text-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.15)]',
        danger:
          'border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.15)]',
        muted:
          'border-slate-800 bg-slate-900/60 text-slate-500',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-0.5 text-[11px]',
        lg: 'px-3 py-1 text-xs',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  const dotColorClass = {
    default: 'bg-slate-400',
    outline: 'bg-slate-400',
    cyan: 'bg-sky-400',
    verified: 'bg-emerald-400',
    probable: 'bg-amber-400',
    possible: 'bg-indigo-400',
    danger: 'bg-rose-400',
    muted: 'bg-slate-600',
  }[variant ?? 'default']

  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {dot && (
        <span
          className={cn('size-1.5 rounded-full shrink-0', dotColorClass)}
          aria-hidden="true"
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
