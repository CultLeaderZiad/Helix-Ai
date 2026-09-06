import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * The supplied logo is a 1053x587 canvas with the monogram occupying roughly
 * the centre third. The tile crops to the mark and keeps the logo's own
 * off-white ground so the navy stays legible on dark surfaces.
 */
export function HelixMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('relative block shrink-0 overflow-hidden rounded-md bg-[#f5f6f8]', className)}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/helix-mark.png"
        alt=""
        width={1053}
        height={587}
        priority
        className="absolute top-1/2 left-1/2 h-auto -translate-x-1/2 -translate-y-1/2"
        style={{ width: size * 3.0, maxWidth: 'none', marginTop: size * -0.02 }}
      />
    </span>
  )
}
