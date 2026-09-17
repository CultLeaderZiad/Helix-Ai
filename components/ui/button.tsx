import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-xl font-medium whitespace-nowrap transition-all duration-150 outline-none select-none active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          'border border-transparent bg-gradient-to-r from-sky-400 to-sky-500 text-slate-950 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_28px_rgba(56,189,248,0.4)] hover:brightness-105',
        primary:
          'border border-transparent bg-gradient-to-r from-sky-400 to-sky-500 text-slate-950 font-semibold shadow-[0_0_20px_rgba(56,189,248,0.25)] hover:shadow-[0_0_28px_rgba(56,189,248,0.4)] hover:brightness-105',
        secondary:
          'border border-white/12 bg-white/6 text-slate-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:border-white/20 hover:bg-white/10 hover:text-white',
        outline:
          'border border-white/10 bg-transparent text-slate-300 hover:border-white/18 hover:bg-white/5 hover:text-white',
        ghost:
          'text-slate-400 hover:bg-white/8 hover:text-white',
        destructive:
          'border border-rose-500/30 bg-rose-500/10 text-rose-400 shadow-[0_0_14px_rgba(244,63,94,0.15)] hover:bg-rose-500/20',
        link: 'text-sky-400 underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-9 gap-2 px-4 text-xs font-semibold uppercase tracking-wider',
        xs: 'h-6 gap-1 px-2 text-[10px] font-mono',
        sm: 'h-7.5 gap-1.5 px-3 text-[11px] font-medium',
        lg: 'h-11 gap-2.5 px-6 text-sm font-semibold',
        icon: 'size-9 rounded-lg',
        'icon-xs': 'size-6 rounded-md',
        'icon-sm': 'size-7 rounded-md',
        'icon-lg': 'size-11 rounded-xl',
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
