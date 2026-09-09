import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Updates — Helix AI',
  description: 'Changelog, system upgrades, and platform releases for Helix AI.',
}

const RELEASES = [
  {
    version: 'v2.4.0',
    date: 'September 2026',
    title: 'Dual-workspace authentication & cross-tenant RLS isolation',
    highlights: [
      'Segmented authentication supporting Agency Operator and Client Portal routing.',
      'Hardware-level PostgreSQL RLS enforcement with tenant-scoped cryptographic tokens.',
      'Public navigation redesign with high-contrast framing and mobile-first touch targets.',
    ],
  },
  {
    version: 'v2.3.1',
    date: 'August 2026',
    title: 'Realtime telemetry ingest and webhook integrity validation',
    highlights: [
      'Sub-50ms ingestion pipeline for Retell AI, Vapi, and Bland AI voice sessions.',
      'Automated HMAC-SHA256 signature verification on incoming webhooks.',
      'Real-time confidence scoring matrix for extracted caller intentions.',
    ],
  },
  {
    version: 'v2.2.0',
    date: 'July 2026',
    title: 'Operational truth engine & human-in-the-loop review queues',
    highlights: [
      'Tri-state evidence tagging: verified, probable, and possible assertions.',
      'One-click dispute resolution for agency administrators with audit trails.',
      'Automated CSV & JSON log exports for enterprise compliance audits.',
    ],
  },
]

export default function UpdatesPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav />

      <main className="mx-auto max-w-4xl px-4 pt-28 pb-24 md:pt-36">
        <header className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            <Sparkles className="size-3.5" />
            Platform Changelog
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Continuous engineering updates
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-body text-muted-foreground leading-relaxed">
            Every feature, security hardening, and performance improvement shipped to the Helix AI platform.
          </p>
        </header>

        <div className="mt-16 space-y-12">
          {RELEASES.map((release) => (
            <article
              key={release.version}
              className="rounded-2xl border border-border bg-panel p-6 sm:p-8 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-accent/15 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                    {release.version}
                  </span>
                  <time className="text-small text-muted-foreground">{release.date}</time>
                </div>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1 text-small font-medium text-accent hover:underline"
                >
                  Start free trial <ArrowUpRight className="size-3.5" />
                </Link>
              </div>

              <h2 className="mt-4 font-display text-xl font-bold text-foreground">
                {release.title}
              </h2>

              <ul className="mt-4 space-y-2">
                {release.highlights.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-small text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}
