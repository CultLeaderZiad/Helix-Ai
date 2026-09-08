import type { PlatformStatus } from '@/lib/platform-status'

export function PlatformStatusReadout({ status }: { status: PlatformStatus }) {
  return (
    <section
      aria-label="Platform status"
      className="w-full max-w-md border border-deep-foreground/15 bg-deep/70 p-4 text-deep-foreground"
    >
      <header className="flex items-baseline justify-between gap-4 pb-3">
        <h2 className="text-small font-medium uppercase tracking-[0.08em] text-deep-muted">
          Platform
        </h2>
        <span className="text-small text-deep-muted">Sign-in required</span>
      </header>
      <dl className="flex flex-col gap-3 border-t border-deep-foreground/10 pt-3">
        <div className="flex items-start justify-between gap-4 text-small">
          <dt className="flex items-center gap-2 text-deep-muted">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-deep-muted" />
            Integration health
          </dt>
          <dd>Not loaded</dd>
        </div>
        <div className="flex items-start justify-between gap-4 text-small">
          <dt className="text-deep-muted">Data freshness</dt>
          <dd>Not measured</dd>
        </div>
      </dl>
      <p className="mt-4 text-small text-deep-muted">{status.message}</p>
    </section>
  )
}