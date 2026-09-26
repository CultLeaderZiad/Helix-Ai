import Link from 'next/link'
import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
import { ShieldCheck, Activity, Database, ArrowRight } from 'lucide-react'
import { LandingDemo } from '@/components/studio/landing-demo'
import { LiveAgentTerminal } from '@/components/terminal/live-agent-terminal'
import { HelixFooter } from '@/components/footer/helix-footer'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { getPublicFaqs } from '@/lib/faq/actions'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Helix AI — The operations console for autonomous intelligence',
  description:
    'Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Know exactly what your autonomous systems did.',
}

export default async function LandingPage() {
  const [faqs, navAuth] = await Promise.all([getPublicFaqs(), getNavAuth()])
  return (


    <div className="relative min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      {/* Lightfall WebGL Ambient Canvas - Scoped to Hero Section to eliminate idle GPU load on scroll */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[100vh] max-h-[960px] overflow-hidden z-0">
        <LightfallCanvas
          colors={['#38BDF8', '#0EA5E9', '#0284C7']}
          backgroundColor="#0B0F19"
          speed={0.6}
          streakCount={6}
          density={0.7}
          glow={0.8}
          mouseInteraction={true}
          className="h-full w-full opacity-80"
        />
        {/* Fine gradient dissolve masks */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/25 via-transparent to-[#0B0F19]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0B0F19] to-transparent" />
      </div>


      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center md:pt-36">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.15)]">
          <Activity className="size-3.5" />
          Autonomous AI Operations Platform
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          The console that tells you exactly what happened.
        </h1>

        <p className="mt-6 max-w-2xl text-base text-slate-300 text-pretty sm:text-lg leading-relaxed">
          Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Stop
          guessing what your autonomous systems did.
        </p>

        {/* CTA Buttons */}
        <div className="mt-9 flex w-full flex-col items-center justify-center gap-3.5 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/signup"
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-sky-500 px-8 text-sm font-semibold text-slate-950 shadow-[0_0_24px_rgba(56,189,248,0.3)] transition-all duration-200 hover:shadow-[0_0_32px_rgba(56,189,248,0.5)] hover:brightness-105 active:scale-[0.98] sm:w-auto"
          >
            Start free trial
          </Link>
          <Link
            href="/dashboard/studio"
            className="flex h-12 w-full items-center justify-center rounded-xl border border-slate-700/80 bg-slate-900/80 px-8 text-sm font-medium text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-slate-600 hover:bg-slate-800 hover:text-white active:scale-[0.98] sm:w-auto"
          >
            Open Studio
          </Link>
        </div>

        {/* Value Micro-Pill */}
        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="size-3.5 text-sky-400" />
          <span>7-day unrestricted trial • No credit card required • Instant tenant isolation</span>
        </div>

        {/* Live Flowing Agentic Terminal (Proof Module) */}
        <section
          aria-label="Live Flowing Agentic Terminal"
          className="mt-14 w-full scroll-mt-28"
        >
          <div className="mb-4 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Live Agentic Pipeline
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Watch Autonomous Systems Run Live
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
              Inspect live webhook ingress, dialect extraction, n8n orchestration, and instant WhatsApp & Cal.com dispatches.
            </p>
          </div>

          <LiveAgentTerminal />

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-6 py-2.5 text-xs font-bold text-slate-950 shadow-md hover:bg-emerald-400 transition-all active:scale-98"
            >
              <span>Start Your Build</span>
              <ArrowRight className="size-3.5" />
            </Link>
            <Link
              href="/dashboard/studio"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-all active:scale-98"
            >
              <span>Explore Interactive Studio</span>
            </Link>
          </div>
        </section>

        {/* Feature Proof Pillars */}
        <section
          id="features"
          aria-label="Capabilities"
          className="mt-20 scroll-mt-28 grid w-full grid-cols-1 gap-6 text-left md:grid-cols-3"
        >
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-[#38BDF8]">
              <Activity className="size-5" />
            </div>
            <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Observability
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">Activity telemetry</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Full audit trace for every customer interaction across voice engines, WhatsApp, and inbound
              channels.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-[#38BDF8]">
              <ShieldCheck className="size-5" />
            </div>
            <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Intelligence
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">
              Evidence band verification
            </h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Observations categorized as verified, probable, or possible. Only verified facts modify core
              records without human review.
            </p>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-md">
            <div className="flex size-10 items-center justify-center rounded-lg bg-sky-500/10 text-[#38BDF8]">
              <Database className="size-5" />
            </div>
            <div className="mt-4 text-[11px] font-medium uppercase tracking-wider text-slate-400">
              Tenancy
            </div>
            <h3 className="mt-1 font-display text-lg font-semibold text-white">Multi-tenant isolation</h3>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
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
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#38BDF8]">
              Deterministic Execution
            </div>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How Helix AI Operates
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-400">
              From voice ingestion to automated dispute resolution, every agent observation is validated before updating operational state.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-bold text-[#38BDF8]">STEP 01</div>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">Ingest Raw Telemetry</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Connect Retell, Vapi, Bland AI, or custom voice pipelines. Streaming audio and transcripts are hashed and securely persisted.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-bold text-[#38BDF8]">STEP 02</div>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">Classify Evidence Bands</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                Intents and claims are scored into Verified (100% ground truth), Probable (requires validation), and Possible (flagged for human review).
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md">
              <div className="font-mono text-xs font-bold text-[#38BDF8]">STEP 03</div>
              <h3 className="mt-2 font-display text-lg font-semibold text-white">Execute Console Actions</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
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
  )
}
