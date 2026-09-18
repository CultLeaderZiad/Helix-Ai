import Image from 'next/image'
import { cn } from '@/lib/utils'

export function HelixMark({
  size = 40,
  className,
  rounded = 'rounded-[10px]',
}: {
  size?: number
  className?: string
  rounded?: string
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden border border-helix-border bg-helix-ink',
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
