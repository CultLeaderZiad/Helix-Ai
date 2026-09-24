import Link from 'next/link'
import { HelixMark } from '@/components/brand/helix-mark'

export function HelixFooter() {
  return (
    <footer className="border-t border-border bg-panel text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 lg:gap-14">
          {/* Brand Column (Left) */}
          <div className="md:col-span-5 lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-85"
            >
              <HelixMark size={32} rounded="rounded-md" />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">
                Helix AI
              </span>
            </Link>
            <p className="max-w-sm text-sm text-muted-foreground leading-relaxed">
              Autonomous voice, messaging, and operational systems built for verified enterprise execution.
            </p>
            <p className="text-xs text-muted-foreground font-mono">
              Regional GCC Enterprise &amp; MENA Operations Infrastructure.
            </p>
          </div>

          {/* Navigation Links Columns (Right) */}
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            {/* Column 1: PRODUCT */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                Platform
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors">
                    Pricing &amp; Retainers
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="hover:text-foreground transition-colors">
                    Changelog &amp; Releases
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-foreground transition-colors">
                    Operations Console
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Start 7-Day Trial
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: COMPANY */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                Company
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact Architects
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-foreground transition-colors">
                    Knowledge Base
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="hover:text-foreground transition-colors">
                    Platform Updates
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: LEGAL */}
            <div>
              <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-foreground">
                Legal
              </h3>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#security" className="hover:text-foreground transition-colors">
                    Security &amp; Tenancy
                  </Link>
                </li>
                <li>
                  <Link href="/privacy#rights" className="hover:text-foreground transition-colors">
                    Data Subject Rights
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Flat, no watermark, no pulse glow */}
        <div className="mt-14 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <p>
            &copy; 2026 Helix AI. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="tracking-wider uppercase font-medium text-[11px] text-foreground">
              PostgreSQL RLS Isolated Tenancy
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
