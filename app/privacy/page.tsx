import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Privacy Policy — Helix AI',
  description: 'Telemetry privacy disclosures, data retention rules, and PostgreSQL RLS tenant isolation.',
}

export default async function PrivacyPage() {
  const navAuth = await getNavAuth()
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
          <header className="border-b border-border pb-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">Privacy &amp; Compliance</div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
            <p className="mt-2 text-small text-muted-foreground tabular-nums">Effective September 2026</p>
          </header>

          <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
            <aside className="lg:block">
              {/* Desktop Nav */}
              <nav aria-label="Sections" className="hidden lg:block sticky top-28 space-y-2 text-small">
                <a href="#collection" className="block text-foreground hover:text-accent">
                  1. Information Collected
                </a>
                <a href="#telemetry" className="block text-muted-foreground hover:text-accent">
                  2. Telemetry &amp; Logs
                </a>
                <a href="#security" className="block text-muted-foreground hover:text-accent">
                  3. Security &amp; Isolation
                </a>
                <a href="#rights" className="block text-muted-foreground hover:text-accent">
                  4. Data Subject Rights
                </a>
              </nav>

              {/* Mobile TOC Quick Links */}
              <div className="block lg:hidden rounded-lg border border-border bg-panel p-4 text-xs space-y-2">
                <span className="font-semibold text-foreground uppercase tracking-wider font-mono text-[11px] block">Table of Contents</span>
                <div className="flex flex-wrap gap-2 text-accent">
                  <a href="#collection" className="hover:underline">1. Collection</a> •
                  <a href="#telemetry" className="hover:underline">2. Telemetry</a> •
                  <a href="#security" className="hover:underline">3. Security</a> •
                  <a href="#rights" className="hover:underline">4. Rights</a>
                </div>
              </div>
            </aside>

            <article className="max-w-none text-body space-y-8 leading-relaxed">
              <section id="collection" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">1. Information We Collect</h2>
                <p className="text-muted-foreground mt-2">
                  We process account credentials, company profile data, communication telemetry (call recordings,
                  transcripts, message payloads), and observation audit trails strictly for executing your configured
                  operations pipelines.
                </p>
              </section>

              <section id="telemetry" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">2. Telemetry Retention</h2>
                <p className="text-muted-foreground mt-2">
                  Live communication logs are retained according to workspace policy, defaulting to 90 days. Raw
                  audio streams are processed for fact extraction and transcription with tenant cryptographic hashing.
                </p>
              </section>

              <section id="security" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">3. Security &amp; Tenant Isolation</h2>
                <p className="text-muted-foreground mt-2">
                  Database records are partitioned using cryptographic tenant claims and PostgreSQL Row-Level
                  Security. Data is encrypted in transit using TLS 1.3 and at rest with AES-256. Cross-tenant data leaks
                  fail closed at the database engine layer.
                </p>
              </section>

              <section id="rights" className="scroll-mt-32">
                <h2 className="font-display text-h3 font-semibold text-foreground">4. Data Subject Rights</h2>
                <p className="text-muted-foreground mt-2">
                  You retain full ownership of customer contacts and telemetry. You may request data exports or
                  permanent deletion of tenant records at any time through your operations console.
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
