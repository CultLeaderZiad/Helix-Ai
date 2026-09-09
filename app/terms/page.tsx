import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'

export const metadata: Metadata = {
  title: 'Terms of Service — Helix AI',
  description: 'Commercial terms of service, platform warranty, and usage guidelines.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
        <header className="border-b border-border pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Legal Agreement</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-small text-muted-foreground tabular-nums">Effective September 2026</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav aria-label="Sections" className="sticky top-28 space-y-2 text-small">
              <a href="#acceptance" className="block text-foreground hover:text-accent">
                1. Acceptance
              </a>
              <a href="#services" className="block text-muted-foreground hover:text-accent">
                2. Operations Console
              </a>
              <a href="#evidence" className="block text-muted-foreground hover:text-accent">
                3. Evidence & Verification
              </a>
              <a href="#tenancy" className="block text-muted-foreground hover:text-accent">
                4. Tenancy & Data
              </a>
              <a href="#trials" className="block text-muted-foreground hover:text-accent">
                5. Trials & Billing
              </a>
            </nav>
          </aside>

          <article className="prose prose-slate dark:prose-invert max-w-none text-body space-y-8 leading-relaxed">
            <section id="acceptance">
              <h2 className="font-display text-h3 font-semibold text-foreground">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing Helix AI, registering a workspace, or initiating a trial, you agree to be bound by
                these Terms of Service. If you represent an agency or enterprise, you confirm authority to bind that
                legal entity.
              </p>
            </section>

            <section id="services">
              <h2 className="font-display text-h3 font-semibold text-foreground">2. Operations Console Usage</h2>
              <p className="text-muted-foreground">
                Helix AI grants a revocable, non-exclusive license to operate telemetry monitoring, CRM intelligence
                functions, and communication agent connectors in accordance with your subscription tier.
              </p>
            </section>

            <section id="evidence">
              <h2 className="font-display text-h3 font-semibold text-foreground">3. Evidence Bands & Review</h2>
              <p className="text-muted-foreground">
                Autonomous observations are classified as verified, probable, or possible. You acknowledge that
                probable and possible facts require human review within the console before committing to contact
                profiles.
              </p>
            </section>

            <section id="tenancy">
              <h2 className="font-display text-h3 font-semibold text-foreground">4. Tenancy & Confidentiality</h2>
              <p className="text-muted-foreground">
                All client workspaces operate under PostgreSQL Row-Level Security isolation. Helix AI maintains zero
                shared cross-tenant memory or data leaks across client organizations.
              </p>
            </section>

            <section id="trials">
              <h2 className="font-display text-h3 font-semibold text-foreground">5. Free Trials & Billing</h2>
              <p className="text-muted-foreground">
                The standard self-serve trial provides 7 days of unrestricted access. Following the trial period,
                continued usage requires an active billing arrangement.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
