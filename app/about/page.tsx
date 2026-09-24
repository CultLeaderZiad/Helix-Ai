import type { Metadata } from 'next'
import Link from 'next/link'
import { PillNav } from '@/components/navigation/pill-nav'
import { ShieldCheck, Eye, Users, Globe2, ArrowRight } from 'lucide-react'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About — Helix AI',
  description: 'Our mission and architectural principles behind verified autonomous operations in the GCC and MENA regions.',
}

export default async function AboutPage() {
  const navAuth = await getNavAuth()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
          <header className="mx-auto max-w-3xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">Operational Truth</div>
            <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-5xl">
              We believe autonomous systems must be completely observable.
            </h1>
            <p className="mt-6 text-body text-muted-foreground leading-relaxed">
              Helix AI was created for organizations deploying AI voice receptionists, autonomous chat agents, and
              automated operational pipelines who cannot afford opaque failures or hallucinated records.
            </p>
          </header>

          {/* Regional Sovereignty Story */}
          <section aria-label="MENA and GCC Infrastructure" className="mt-16 rounded-xl border border-border bg-panel p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-accent">
                  <Globe2 className="size-4" /> Regional Infrastructure
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  Engineered for GCC Enterprise &amp; MENA Operations
                </h2>
                <p className="text-small text-muted-foreground leading-relaxed">
                  Our architecture respects regional data sovereignty laws across the UAE, Saudi Arabia, and Qatar.
                  Telephony models feature bilingual dialect adaptation for Khaleeji, Egyptian, and Modern Standard Arabic,
                  ensuring sub-400ms voice processing and direct WhatsApp Cloud API compliance.
                </p>
              </div>

              <div className="shrink-0">
                <Link href="/contact" className={buttonVariants({ size: 'default', className: 'gap-2' })}>
                  <span>Speak with an Architect</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Architectural Principles — No icon-in-colored-boxes */}
          <section aria-label="Core Principles" className="mt-20">
            <h2 className="font-display text-2xl font-bold text-center">Architectural Principles</h2>
            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-panel p-6">
                <Eye className="size-6 text-accent stroke-[1.5]" />
                <h3 className="mt-4 font-display text-h3 font-semibold">Never fabricate confidence</h3>
                <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                  When an AI agent interacts with a customer, every observation is categorized into verified, probable,
                  or possible evidence. We never present inferences as absolute facts.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-panel p-6">
                <ShieldCheck className="size-6 text-accent stroke-[1.5]" />
                <h3 className="mt-4 font-display text-h3 font-semibold">Tenancy is absolute</h3>
                <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                  PostgreSQL Row-Level Security separates client tenants at the database engine level. Agency admins
                  maintain unified supervision without risking cross-tenant data leakage.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-panel p-6">
                <Users className="size-6 text-accent stroke-[1.5]" />
                <h3 className="mt-4 font-display text-h3 font-semibold">Human in the decision loop</h3>
                <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                  High-impact profile modifications, disputed invoices, and low-confidence facts require human
                  review. The console makes approvals friction-free and auditable.
                </p>
              </div>
            </div>
          </section>

          {/* Bottom CTA Banner */}
          <section className="mt-20 rounded-xl border border-border bg-raised p-8 text-center space-y-4">
            <h3 className="font-display text-2xl font-bold text-foreground">
              Ready to verify what your autonomous systems are doing?
            </h3>
            <p className="text-small text-muted-foreground max-w-lg mx-auto">
              Start with a 7-day unrestricted trial or consult with our technical architects regarding sovereign deployments.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className={buttonVariants({ size: 'default' })}>
                Start Free Trial
              </Link>
              <Link href="/contact" className={buttonVariants({ variant: 'outline', size: 'default' })}>
                Contact Architecture Team
              </Link>
            </div>
          </section>
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
