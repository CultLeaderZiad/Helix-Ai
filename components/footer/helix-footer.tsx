import Link from 'next/link'
import { HelixMark } from '@/components/brand/helix-mark'

export function HelixFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#060910] text-slate-400">
      {/* Giant Typography Watermark Background (Matches Image 4) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-6 flex select-none justify-center opacity-[0.035] font-black tracking-tighter text-white"
        style={{ fontSize: 'clamp(7rem, 20vw, 24rem)', lineHeight: 0.8 }}
      >
        HELIX AI
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-14">
          {/* Brand Column (Left) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <HelixMark size={32} rounded="rounded-lg" />
              <span className="font-display text-xl font-bold tracking-wider text-white">
                Helix
              </span>
            </Link>
            <p className="max-w-sm text-sm text-slate-400 leading-relaxed">
              The all-in-one business platform. CRM, ERP, and automation — built for serious teams.
            </p>
            <p className="text-xs text-slate-500 font-mono">
              Regional GCC Enterprise &amp; MENA Operations Infrastructure.
            </p>
          </div>

          {/* Navigation Links Columns (Right) */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: PRODUCT */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-200">
                PRODUCT
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/dashboard/crm"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    CRM
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/studio"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Studio Sandbox
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/engine"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    AI Engine
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/integrations"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/pricing"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faq"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link
                    href="/updates"
                    className="hover:text-cyan-300 transition-colors"
                  >
                    Changelog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: COMPANY */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-200">
                COMPANY
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/about" className="hover:text-cyan-300 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-cyan-300 transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-cyan-300 transition-colors">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="hover:text-cyan-300 transition-colors">
                    Updates &amp; Releases
                  </Link>
                </li>
                <li>
                  <Link href="/about#careers" className="hover:text-cyan-300 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-cyan-300 transition-colors">
                    Agency Console
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: LEGAL */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-200">
                LEGAL
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/about#terms" className="hover:text-cyan-300 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/about#privacy" className="hover:text-cyan-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/about#security" className="hover:text-cyan-300 transition-colors">
                    Security &amp; Sovereign Data
                  </Link>
                </li>
                <li>
                  <Link href="/about#cookies" className="hover:text-cyan-300 transition-colors">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Operational Bar (Matches Image 4) */}
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono">
          <p className="text-slate-500">
            &copy; 2026 HELIX. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="size-2 rounded-xs bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="tracking-wider uppercase font-semibold text-[11px]">
              ALL SYSTEMS OPERATIONAL
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
