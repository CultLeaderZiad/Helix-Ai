'use client'

import { useEffect, useState } from 'react'
import type { PlatformStatus } from '@/lib/platform-status'
import { cn } from '@/lib/utils'

function relative(from: string, now: number) {
  const s = Math.max(0, Math.round((now - Date.parse(from)) / 1000))
  if (s < 60) return `${s}s ago`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s ago`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m ago`
}

function ageTone(from: string, now: number, warnAfterSec: number, dangerAfterSec: number) {
  const s = (now - Date.parse(from)) / 1000
  if (s > dangerAfterSec) return 'bg-status-danger'
  if (s > warnAfterSec) return 'bg-status-warning'
  return 'bg-status-success'
}

export function PlatformStatusReadout({ status }: { status: PlatformStatus }) {
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const { integrations } = status
  const total = integrations.connected + integrations.degraded + integrations.disconnected + integrations.pending
  const generated = new Date(status.generated_at)

  return (
    <section
      aria-label="Platform status"
      className="w-full max-w-md border border-deep-foreground/15 bg-deep/70 p-4 text-deep-foreground backdrop-blur-md"
    >
      <header className="flex items-baseline justify-between gap-4 pb-3">
        <h2 className="text-small font-medium uppercase tracking-[0.08em] text-deep-muted">Platform</h2>
        <time
          dateTime={status.generated_at}
          className="text-small tabular-nums text-deep-muted"
          title="Snapshot generated at"
        >
          {generated.toISOString().slice(11, 19)} UTC
        </time>
      </header>

      <dl className="flex flex-col gap-3 border-t border-deep-foreground/10 pt-3">
        <div className="flex items-start justify-between gap-4">
          <dt className="flex items-center gap-2 text-small text-deep-muted">
            <span
              aria-hidden="true"
              className={cn(
                'size-2 shrink-0 rounded-full',
                now ? ageTone(status.last_event_at, now, 60, 300) : 'bg-deep-muted',
              )}
            />
            attribution_events
          </dt>
          <dd className="text-small tabular-nums">
            {now ? `last ${relative(status.last_event_at, now)}` : '—'}
          </dd>
        </div>

        <div className="flex items-start justify-between gap-4">
          <dt className="flex items-center gap-2 text-small text-deep-muted">
            <span
              aria-hidden="true"
              className={cn(
                'size-2 shrink-0 rounded-full',
                now ? ageTone(status.last_ping_at, now, 120, 600) : 'bg-deep-muted',
              )}
            />
            client_integrations
          </dt>
          <dd className="flex flex-col items-end text-small tabular-nums">
            <span>
              {integrations.connected}
              <span className="text-deep-muted"> / {total} connected</span>
            </span>
            <span className="text-deep-muted">
              {integrations.degraded} degraded · {integrations.disconnected} disconnected · {integrations.pending}{' '}
              pending
            </span>
            <span className="text-deep-muted">{now ? `last ping ${relative(status.last_ping_at, now)}` : '—'}</span>
          </dd>
        </div>
      </dl>
    </section>
  )
}
