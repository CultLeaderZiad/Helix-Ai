import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[12px] font-medium whitespace-nowrap transition-all duration-150 outline-none select-none active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 focus-visible:ring-2 focus-visible:ring-helix-ink/15",
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-helix-ink text-white hover:bg-helix-ink/90',
        primary:
          'border border-transparent bg-helix-ink text-white hover:bg-helix-ink/90',
        secondary:
          'border border-helix-border bg-helix-surface text-helix-ink hover:bg-helix-canvas',
        outline:
          'border border-helix-border bg-transparent text-helix-ink hover:bg-helix-canvas',
        accent:
          'border border-transparent bg-helix-accent text-white hover:bg-helix-accent/90',
        ghost:
          'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink',
        destructive:
          'border border-helix-danger/20 bg-helix-danger/8 text-helix-danger hover:bg-helix-danger/12',
        link: 'text-helix-accent underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 gap-2 px-4 text-13',
        xs: 'h-7 gap-1 px-2.5 text-12',
        sm: 'h-8 gap-1.5 px-3 text-13',
        lg: 'h-11 gap-2 px-5 text-14 font-semibold',
        icon: 'size-9 rounded-[12px]',
        'icon-xs': 'size-6 rounded-[8px]',
        'icon-sm': 'size-8 rounded-[10px]',
        'icon-lg': 'size-11 rounded-[12px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
