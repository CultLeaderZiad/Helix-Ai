import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { GitCommit, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getUpdates } from '@/lib/updates/updates-store'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Updates — Helix AI',
  description: 'Changelog, system upgrades, and platform releases for Helix AI.',
}

export default async function UpdatesPage() {
  const [releases, navAuth] = await Promise.all([Promise.resolve(getUpdates(false)), getNavAuth()])

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="mx-auto max-w-4xl px-4 pt-28 pb-24 md:pt-36">
          <header className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent font-mono">
              <GitCommit className="size-3.5" />
              Platform Changelog
            </div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl text-foreground">
              Continuous engineering updates
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-body text-muted-foreground leading-relaxed">
              Every feature, security hardening, and performance improvement shipped to the Helix AI platform.
            </p>
          </header>

          <div className="mt-16 space-y-8">
            {releases.map((release) => (
              <article
                key={release.version}
                className="rounded-xl border border-border bg-panel p-6 sm:p-8 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
                  <span className="rounded-md bg-accent/10 px-2.5 py-1 font-mono text-xs font-semibold text-accent">
                    {release.version}
                  </span>
                  <time className="text-small text-muted-foreground font-mono">{release.date}</time>
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

          <div className="mt-16 rounded-xl border border-border bg-raised p-8 text-center space-y-3">
            <h3 className="font-display text-xl font-bold text-foreground">Deploying autonomous operations?</h3>
            <p className="text-small text-muted-foreground max-w-md mx-auto">
              Get started with a 7-day unrestricted trial or review sovereign tenancy with our architects.
            </p>
            <div className="pt-2">
              <Button asChild size="default">
                <Link href="/signup">
                  <span>Start Free Trial</span>
                  <ArrowRight className="size-4 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
