import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Terms of Service — Helix AI',
  description: 'Commercial terms of service, platform warranty, and usage guidelines.',
}

export default async function TermsPage() {
  const navAuth = await getNavAuth()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
          <header className="border-b border-border pb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">Legal Agreement</div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
            <p className="mt-2 text-small text-muted-foreground tabular-nums">Effective September 2026</p>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
            <aside className="lg:block">
              {/* Desktop Nav */}
              <nav aria-label="Sections" className="hidden lg:block sticky top-28 space-y-2 text-small">
                <a href="#acceptance" className="block text-foreground hover:text-accent">
                  1. Acceptance
                </a>
                <a href="#services" className="block text-muted-foreground hover:text-accent">
                  2. Operations Console
                </a>
                <a href="#evidence" className="block text-muted-foreground hover:text-accent">
                  3. Evidence &amp; Verification
                </a>
                <a href="#tenancy" className="block text-muted-foreground hover:text-accent">
                  4. Tenancy &amp; Data
                </a>
                <a href="#trials" className="block text-muted-foreground hover:text-accent">
                  5. Trials &amp; Billing
                </a>
              </nav>

              {/* Mobile TOC Quick Links */}
              <div className="block lg:hidden rounded-lg border border-border bg-panel p-4 text-xs space-y-2">
                <span className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px] block">Table of Contents</span>
                <div className="flex flex-wrap gap-2 text-accent">
                  <a href="#acceptance" className="hover:underline">1. Acceptance</a> •
                  <a href="#services" className="hover:underline">2. Console</a> •
                  <a href="#evidence" className="hover:underline">3. Evidence</a> •
                  <a href="#tenancy" className="hover:underline">4. Tenancy</a> •
                  <a href="#trials" className="hover:underline">5. Trials</a>
                </div>
              </div>
            </aside>

            <article className="max-w-none text-body space-y-8 leading-relaxed">
              <section id="acceptance" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mt-2">
                  By accessing Helix AI, registering a workspace, or initiating a trial, you agree to be bound by
                  these Terms of Service. If you represent an agency or enterprise, you confirm authority to bind that
                  legal entity.
                </p>
              </section>

              <section id="services" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">2. Operations Console</h2>
                <p className="text-muted-foreground mt-2">
                  Helix AI provides an operations console for managing autonomous voice receptionists, messaging
                  pipelines, and client customer relations. You are responsible for ensuring that all interactions
                  conducted through your workspace comply with local telecommunications and data privacy laws.
                </p>
              </section>

              <section id="evidence" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">3. Evidence Bands &amp; Confidence</h2>
                <p className="text-muted-foreground mt-2">
                  Our systems score AI observations into evidence bands (verified, probable, possible). Helix AI does
                  not commit unverified observations into canonical tenant state without supervisor approval.
                </p>
              </section>

              <section id="tenancy" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">4. Tenancy &amp; Confidentiality</h2>
                <p className="text-muted-foreground mt-2">
                  All client workspaces operate under PostgreSQL Row-Level Security isolation. Helix AI maintains zero
                  shared cross-tenant memory or data leaks across client organizations.
                </p>
              </section>

              <section id="trials" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">5. Free Trials &amp; Billing</h2>
                <p className="text-muted-foreground mt-2">
                  The standard self-serve trial provides 7 days of unrestricted access. Following the trial period,
                  continued usage requires an active billing arrangement.
                </p>
              </section>
            </article>
          </div>
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
