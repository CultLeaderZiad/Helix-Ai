import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { ShieldCheck, Eye, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About — Helix AI',
  description: 'Our mission and architectural principles behind verified autonomous operations.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
        <header className="mx-auto max-w-3xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Operational Truth</div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
            We believe autonomous systems must be completely observable.
          </h1>
          <p className="mt-6 text-body text-muted-foreground leading-relaxed">
            Helix AI was created for organizations deploying AI voice receptionists, autonomous chat agents, and
            automated pipeline systems who cannot afford opaque failures or hallucinated records.
          </p>
        </header>

        <section aria-label="Core Principles" className="mt-20">
          <h2 className="font-display text-2xl font-bold text-center">Architectural Principles</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-panel p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Eye className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-h3 font-semibold">Never fabricate confidence</h3>
              <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                When an AI agent interacts with a customer, every observation is categorized into verified, probable,
                or possible evidence. We never present inferences as absolute facts.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-h3 font-semibold">Tenancy is absolute</h3>
              <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                PostgreSQL Row-Level Security separates client tenants at the database engine level. Agency admins
                maintain unified supervision without risking cross-tenant data leakage.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <div className="flex size-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <Users className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-h3 font-semibold">Human in the decision loop</h3>
              <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                High-impact profile modifications, disputed invoices, and low-confidence facts require human
                review. The console makes approvals friction-free and audible.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
