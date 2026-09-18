import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border font-medium select-none',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-helix-ink text-white',
        outline: 'border-helix-border bg-transparent text-helix-muted',
        core: 'border-transparent bg-helix-ink text-white',
        demo: 'border-transparent bg-helix-accent-soft text-helix-accent',
        preview: 'border-helix-border bg-helix-canvas text-helix-muted',
        live: 'border-transparent bg-helix-accent-soft text-helix-ok',
        cyan: 'border-transparent bg-helix-accent-soft text-helix-accent',
        verified: 'border-transparent bg-helix-accent-soft text-helix-ok',
        probable: 'border-transparent bg-[#f8eedd] text-helix-warn',
        possible: 'border-helix-border bg-helix-canvas text-helix-muted',
        danger: 'border-transparent bg-helix-danger/10 text-helix-danger',
        muted: 'border-helix-border bg-helix-canvas text-helix-muted',
        b2b: 'border-transparent bg-[#f8eedd] text-helix-warn',
        accent: 'border-transparent bg-helix-accent text-white',
      },
      size: {
        sm: 'px-2 py-0.5 text-11',
        default: 'px-2.5 py-0.5 text-12',
        lg: 'px-3 py-1 text-13',
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
    default: 'bg-white',
    outline: 'bg-helix-muted',
    core: 'bg-white',
    demo: 'bg-helix-accent',
    preview: 'bg-helix-muted',
    live: 'bg-helix-ok',
    cyan: 'bg-helix-accent',
    verified: 'bg-helix-ok',
    probable: 'bg-helix-warn',
    possible: 'bg-helix-muted',
    danger: 'bg-helix-danger',
    muted: 'bg-helix-muted',
    b2b: 'bg-helix-warn',
    accent: 'bg-white',
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
