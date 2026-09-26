import type { Metadata } from 'next'
import { Sparkles, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { SitePage } from '@/components/marketing/site-page'
import { getUpdates } from '@/lib/updates/updates-store'

export const metadata: Metadata = {
  title: 'Updates — Helix AI',
  description: 'Changelog, system upgrades, and platform releases for Helix AI.',
}

export default function UpdatesPage() {
  const releases = getUpdates(false)

  return (
    <SitePage>
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
          {releases.map((release) => (
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
                  Book a call <ArrowUpRight className="size-3.5" />
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
    </SitePage>
  )
}
