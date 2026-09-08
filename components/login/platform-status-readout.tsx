import type { PlatformStatus } from '@/lib/platform-status'

export function PlatformStatusReadout({ status }: { status: PlatformStatus }) {
  return (
    <section
      aria-label="Platform status"
      className="w-full max-w-md border border-deep-foreground/15 bg-deep/70 p-4 text-deep-foreground"
    >
      <header className="flex items-baseline justify-between gap-4 pb-3">
        <p className="text-small font-medium uppercase tracking-[0.08em] text-deep-muted">
          Platform
        </p>
        <span className="text-small text-deep-muted">Sign in required</span>
      </header>
      <div className="border-t border-deep-foreground/10 pt-3">
        <p className="text-small text-deep-foreground">
          Integration health is not shown on this page. Sign in to view each workspace&apos;s live
          integration status.
        </p>
      </div>
      <p className="mt-4 text-small text-deep-muted">{status.message}</p>
    </section>
  )
}