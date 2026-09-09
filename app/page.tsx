import Link from 'next/link'
import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
import { ShieldCheck, Activity, Database } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Helix AI — The operations console for autonomous intelligence',
  description:
    'Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Know exactly what your autonomous systems did.',
}

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      {/* Lightfall WebGL Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0F19]/40 via-transparent to-[#0B0F19]" />
      </div>

      {/* Global Public Navigation */}
      <PillNav />

      {/* Hero Section */}
      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl flex-col items-center justify-center px-4 pt-28 pb-16 text-center md:pt-36">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-[#38BDF8]">
          AI Operations Platform
        </div>

        <h1 className="mt-6 font-display text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
          The console that tells you exactly what happened.
        </h1>

        <p className="mt-6 max-w-2xl text-base text-slate-300 text-pretty sm:text-lg">
          Realtime activity telemetry, multi-tenant CRM, and human-verified agent observations. Stop
          guessing what your autonomous systems did.
        </p>

        <div className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
          <Link
            href="/signup"
            prefetch={false}
            className="flex h-12 w-full items-center justify-center rounded-md bg-[#0EA5E9] px-8 text-base font-medium text-white shadow-lg transition-transform hover:scale-[1.02] sm:w-auto"
          >
            Start free trial
          </Link>
          <Link
            href="/login"
            prefetch={false}
            className="flex h-12 w-full items-center justify-center rounded-md border border-slate-700 bg-slate-900/60 px-8 text-base font-medium text-slate-200 backdrop-blur-xs transition-colors hover:bg-slate-800/80 sm:w-auto"
          >
            Sign in
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">7-day unrestricted trial. No credit card required.</p>

        {/* Feature Proof Pillars */}
        <section
          id="features"
          aria-label="Capabilities"
          className="mt-24 scroll-mt-28 grid w-full grid-cols-1 gap-6 text-left md:grid-cols-3"
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

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#0B0F19]/80 py-8 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 px-4 text-xs text-slate-400 sm:flex-row">
          <p>© 2026 Helix AI Technologies. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="hover:text-white transition-colors">
              Pricing
            </Link>
            <Link href="/about" className="hover:text-white transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-white transition-colors">
              Contact
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
