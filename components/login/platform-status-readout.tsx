import type { PlatformStatus } from '@/lib/platform-status'

export function PlatformStatusReadout({ status }: { status: PlatformStatus }) {
  const isUnavailable = status.state === 'unavailable'

  return (
    <section
      aria-label="Platform status"
      className="w-full max-w-md rounded-xl border border-deep-foreground/15 bg-deep/70 p-4 text-deep-foreground"
    >
      <header className="flex items-baseline justify-between gap-4 pb-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.08em] text-deep-muted">
          Platform
        </h2>
        <span className="text-small text-deep-muted">Sign-in required</span>
      </header>

      {isUnavailable ? (
        <div className="border-t border-deep-foreground/10 pt-3">
          <p className="text-small text-deep-muted">Platform status will appear here shortly.</p>
        </div>
      ) : (
        <>
          <dl className="flex flex-col gap-3 border-t border-deep-foreground/10 pt-3">
            <div className="flex items-start justify-between gap-4 text-small">
              <dt className="flex items-center gap-2 text-deep-muted">
                <span
                  aria-hidden="true"
                  className={`size-2 shrink-0 rounded-full ${
                    status.state === 'operational'
                      ? 'bg-[#3fb950]'
                      : status.state === 'degraded'
                        ? 'bg-[#d29922]'
                        : 'bg-[#f85149]'
                  }`}
                />
                Integration health
              </dt>
              <dd className="font-medium">
                {status.state === 'operational'
                  ? 'All systems operational'
                  : status.state === 'degraded'
                    ? 'Some connectors delayed'
                    : 'Sign-in may be delayed'}
              </dd>
            </div>
            {status.updatedAt ? (
              <div className="flex items-start justify-between gap-4 text-small">
                <dt className="text-deep-muted">Data freshness</dt>
                <dd className="tabular-nums">Updated {status.updatedAt}</dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-small text-deep-muted">
            {status.message ??
              (status.state === 'partial_outage'
                ? 'We are restoring connector service. Workspaces are unaffected.'
                : '')}
          </p>
        </>
      )}
    </section>
  )
}