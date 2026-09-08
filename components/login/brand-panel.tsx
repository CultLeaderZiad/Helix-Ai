import type { PlatformStatus } from '@/lib/platform-status'
import { PlatformStatusReadout } from '@/components/login/platform-status-readout'
import { HelixMark } from '@/components/brand/helix-mark'

export function BrandPanel({ status }: { status: PlatformStatus }) {
  return (
    <aside className="relative flex h-[224px] flex-col justify-between overflow-hidden bg-deep text-deep-foreground lg:h-full lg:min-h-svh">
      <div className="relative flex items-center gap-3 p-6 lg:p-12">
        <HelixMark size={40} />
        <div className="flex flex-col">
          <span className="font-display text-h3 leading-none tracking-tight">Helix AI</span>
          <span className="text-small text-deep-muted">Operations console</span>
        </div>
      </div>

      <div className="relative hidden px-12 lg:block">
        <h1 className="font-display text-h1 text-balance font-semibold leading-[1.05] tracking-tight">
          The console that tells you exactly what happened.
        </h1>
      </div>

      <div className="relative hidden p-12 lg:block">
        <PlatformStatusReadout status={status} />
      </div>
    </aside>
  )
}

