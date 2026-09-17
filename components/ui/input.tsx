import * as React from 'react'
import { cn } from '@/lib/utils'

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          'h-10 w-full min-w-0 rounded-xl border border-white/12 bg-[#080D17]/90 px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] transition-all outline-none focus-visible:border-sky-500/50 focus-visible:ring-2 focus-visible:ring-sky-500/20 disabled:pointer-events-none disabled:opacity-50',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
