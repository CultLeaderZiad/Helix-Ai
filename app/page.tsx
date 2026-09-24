import Link from 'next/link'
import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
import { ShieldCheck, Activity, Database, ArrowRight } from 'lucide-react'
import { LandingDemo } from '@/components/studio/landing-demo'
import { HelixFooter } from '@/components/footer/helix-footer'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { getPublicFaqs } from '@/lib/faq/actions'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Helix AI — The operations console for autonomous intelligence',
  description:
    'Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Know exactly what your autonomous systems did.',
}

export default async function LandingPage() {
  const [faqs, navAuth] = await Promise.all([getPublicFaqs(), getNavAuth()])

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      {/* Lightfall WebGL Ambient Canvas - Scoped to Hero Section */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] max-h-[880px] overflow-hidden z-0">
        <LightfallCanvas
          colors={['#0e8da6', '#38c6e0', '#07101a']}
          backgroundColor="#0b0e13"
          speed={0.5}
          streakCount={5}
          density={0.6}
          glow={0.5}
          mouseInteraction={true}
          className="h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />
      </div>

      <div className="relative z-10">
        {/* Global Public Navigation */}
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        {/* Hero Section */}
        <main className="mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center md:pt-36">
          <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
            <Activity className="size-3.5 mr-1 text-accent" />
            Autonomous AI Operations Platform
          </Badge>

          <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
            The console that tells you exactly what happened.
          </h1>

          <p className="mt-6 max-w-2xl text-base text-muted-foreground text-pretty sm:text-lg leading-relaxed">
            Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Stop
            guessing what your autonomous systems did.
          </p>

          {/* CTA Buttons — Single cyan accent, flat panels, no gradients */}
          <div className="mt-9 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row sm:gap-4">
            <Link
              href="/signup"
              className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto gap-2' })}
            >
              <span>Start free trial</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: 'outline', size: 'lg', className: 'w-full sm:w-auto' })}
            >
              Sign in to Console
            </Link>
          </div>

          {/* Value Micro-Pill */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5 text-accent" />
            <span>7-day unrestricted trial • No credit card required • PostgreSQL tenant isolation</span>
          </div>

          {/* Studio Animated Motion Showcase */}
          <section
            aria-label="Studio Live Workflow Preview"
            className="mt-14 w-full scroll-mt-28"
          >
            <div className="mb-4 text-center">
              <span className="font-mono text-xs uppercase tracking-wider text-accent font-semibold">
                Interactive System Architecture
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Watch How Helix AI Powers Real Autonomous Workflows
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
                A pre-choreographed walkthrough demonstrating automated voice reception, instant WhatsApp confirmation, and live CRM telemetry.
              </p>
            </div>

            <LandingDemo />
          </section>

          {/* Feature Proof Pillars — Rebuilt WITHOUT icon-in-a-colored-box */}
          <section
            id="features"
            aria-label="Capabilities"
            className="mt-20 scroll-mt-28 grid w-full grid-cols-1 gap-6 text-left md:grid-cols-3"
          >
            <div className="rounded-xl border border-border bg-panel p-6">
              <Activity className="size-6 text-accent stroke-[1.5]" />
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground font-mono">
                Observability
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">Activity telemetry</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Full audit trace for every customer interaction across voice engines, WhatsApp, and inbound
                channels.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <ShieldCheck className="size-6 text-accent stroke-[1.5]" />
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground font-mono">
                Intelligence
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">
                Evidence band verification
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Observations categorized as verified, probable, or possible. Only verified facts modify core
                records without human review.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <Database className="size-6 text-accent stroke-[1.5]" />
              <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-muted-foreground font-mono">
                Tenancy
              </div>
              <h3 className="mt-1 font-display text-lg font-semibold text-foreground">Multi-tenant isolation</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                Row-level database separation guarantees agency clients never inspect adjacent workspace
                identities or data.
              </p>
            </div>
          </section>

          {/* How It Works Section */}
          <section
            id="how"
            aria-label="How It Works"
            className="mt-24 scroll-mt-28 w-full text-left"
          >
            <div className="text-center">
              <div className="font-mono text-xs font-semibold uppercase tracking-wider text-accent">
                Deterministic Execution
              </div>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How Helix AI Operates
              </h2>
              <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground">
                From voice ingestion to automated dispute resolution, every agent observation is validated before updating operational state.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-panel p-6">
                <div className="font-mono text-xs font-bold text-accent">STEP 01</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Ingest Raw Telemetry</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Connect Retell, Vapi, Bland AI, or custom voice pipelines. Streaming audio and transcripts are hashed and securely persisted.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-panel p-6">
                <div className="font-mono text-xs font-bold text-accent">STEP 02</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Classify Evidence Bands</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Intents and claims are scored into Verified (ground truth), Probable (requires validation), and Possible (flagged for human review).
                </p>
              </div>

              <div className="rounded-xl border border-border bg-panel p-6">
                <div className="font-mono text-xs font-bold text-accent">STEP 03</div>
                <h3 className="mt-2 font-display text-lg font-semibold text-foreground">Execute Console Actions</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  PostgreSQL RLS ensures isolated execution. Human supervisors approve high-impact changes with complete cryptographic audit trails.
                </p>
              </div>
            </div>
          </section>
        </main>

        {/* FAQ Section — Inline on Home Page */}
        <section id="faq" aria-label="Frequently Asked Questions" className="relative z-10">
          <FaqAccordion initialFaqs={faqs} />
        </section>
      </div>

      <HelixFooter />
    </div>
  )
}
