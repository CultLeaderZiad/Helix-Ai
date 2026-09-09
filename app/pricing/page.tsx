import Link from 'next/link'
import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing — Helix AI',
  description: 'Transparent operations tiers with a 7-day unrestricted trial.',
}

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      {/* Lightfall Canvas */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LightfallCanvas
          colors={['#38BDF8', '#0EA5E9', '#0284C7']}
          backgroundColor="#0B0F19"
          speed={0.6}
          streakCount={6}
          density={0.7}
          glow={0.8}
          mouseInteraction={true}
          className="h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-[#0B0F19]/40 backdrop-blur-xs" />
      </div>

      <PillNav />

      <main className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-20 md:pt-36">
        <header className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-medium uppercase tracking-widest text-[#38BDF8]">
            Transparent Plans
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Start with a 7-day unrestricted trial.
          </h1>
          <p className="mt-4 text-base text-slate-300">
            Select the operations tier matching your agency or organizational scale. No hidden fees.
          </p>
        </header>

        {/* 3 Tier Cards Grid */}
        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Starter Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Starter</h3>
              <p className="mt-2 text-sm text-slate-300">
                For single-location operations automating primary customer communication.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tabular-nums text-white">$490</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-400">Includes 7 days free</div>

              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Up to 1,000 active contacts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Core CRM + WhatsApp integration</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Evidence review queue</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Email ticket support</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/signup?plan=starter"
                prefetch={false}
                className="flex h-11 w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Start 7-day trial
              </Link>
            </div>
          </div>

          {/* Growth Plan (Featured) */}
          <div className="relative flex flex-col justify-between rounded-2xl border-2 border-[#0EA5E9] bg-slate-900/80 p-8 shadow-2xl backdrop-blur-md">
            <div className="absolute -top-3.5 right-6 rounded-full bg-[#0EA5E9] px-3 py-0.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md">
              Most Popular
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-white">Growth</h3>
              <p className="mt-2 text-sm text-slate-300">
                For growing operations requiring end-to-end telemetry and multi-channel voice.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tabular-nums text-white">$1,250</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-400">Includes 7 days free</div>

              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Up to 10,000 active contacts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>AI voice engine + WhatsApp + Email</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Full evidence band classification</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Automated invoice generation</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Priority routing & webhooks</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/signup?plan=growth"
                prefetch={false}
                className="flex h-11 w-full items-center justify-center rounded-md bg-[#0EA5E9] text-sm font-medium text-white shadow-md transition-transform hover:scale-[1.01]"
              >
                Start 7-day trial
              </Link>
            </div>
          </div>

          {/* Scale Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-8 backdrop-blur-md">
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Agency Scale</h3>
              <p className="mt-2 text-sm text-slate-300">
                For agencies managing multi-tenant client rosters with custom LLM pipelines.
              </p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-4xl font-bold tabular-nums text-white">$2,800</span>
                <span className="text-sm text-slate-400">/ month</span>
              </div>
              <div className="mt-2 text-xs font-medium text-emerald-400">Includes 7 days free</div>

              <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Unlimited client workspaces</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Dedicated agent queue execution</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Custom dialect & voice tuning</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Multi-tenant client billing accounts</span>
                </li>
                <li className="flex items-center gap-3">
                  <Check className="size-4 shrink-0 text-[#38BDF8]" />
                  <span>Dedicated technical lead</span>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href="/signup?plan=scale"
                prefetch={false}
                className="flex h-11 w-full items-center justify-center rounded-md border border-slate-700 bg-slate-800/80 text-sm font-medium text-white transition-colors hover:bg-slate-700"
              >
                Start 7-day trial
              </Link>
            </div>
          </div>
        </div>

        {/* Commercial FAQ Section */}
        <section aria-label="Frequently Asked Questions" className="mx-auto mt-24 max-w-4xl border-t border-slate-800 pt-16">
          <h2 className="font-display text-2xl font-bold text-white text-center">Frequently asked questions</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div>
              <h4 className="text-base font-semibold text-slate-200">How does the 7-day trial operate?</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                You receive unrestricted access to all features within your selected tier. No credit card is
                charged during trial onboarding.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">Can I switch tiers later?</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Yes. Tier changes take effect immediately with prorated billing adjustments applied to your
                subsequent invoice.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">How is data isolated between clients?</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                Postgres Row-Level Security isolates every table query with signed JWT claims. Clients cannot
                cross-read adjacent database records.
              </p>
            </div>
            <div>
              <h4 className="text-base font-semibold text-slate-200">What happens when trial ends?</h4>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                You can activate a billing method inside Settings. Unconverted workspaces freeze gracefully
                without data loss.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
