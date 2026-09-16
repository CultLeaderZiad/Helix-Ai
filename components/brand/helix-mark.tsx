import Image from 'next/image'
import { cn } from '@/lib/utils'

export function HelixMark({
  size = 40,
  className,
  rounded = 'rounded-xl',
}: {
  size?: number
  className?: string
  rounded?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/15 bg-gradient-to-b from-[#141b2b] to-[#080d16] shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_0_0_rgba(255,255,255,0.15)] transition-all duration-300 hover:border-cyan-500/50 hover:shadow-[0_0_18px_rgba(0,210,255,0.35)]',
        rounded,
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/helix-logo.png"
        alt="Helix AI Logo"
        width={640}
        height={640}
        priority
        className="h-full w-full object-cover scale-125 -translate-y-[4%] select-none pointer-events-none"
      />
    </span>
  )
}
