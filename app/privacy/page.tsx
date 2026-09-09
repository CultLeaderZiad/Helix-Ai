import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'

export const metadata: Metadata = {
  title: 'Privacy Policy — Helix AI',
  description: 'Telemetry privacy disclosures, data retention rules, and GDPR compliance commitments.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
        <header className="border-b border-border pb-8">
          <div className="text-xs font-semibold uppercase tracking-wider text-accent">Privacy & Compliance</div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-small text-muted-foreground tabular-nums">Effective September 2026</p>
        </header>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <nav aria-label="Sections" className="sticky top-28 space-y-2 text-small">
              <a href="#collection" className="block text-foreground hover:text-accent">
                1. Information Collected
              </a>
              <a href="#telemetry" className="block text-muted-foreground hover:text-accent">
                2. Telemetry & Logs
              </a>
              <a href="#security" className="block text-muted-foreground hover:text-accent">
                3. Security & Isolation
              </a>
              <a href="#rights" className="block text-muted-foreground hover:text-accent">
                4. Data Subject Rights
              </a>
            </nav>
          </aside>

          <article className="prose prose-slate dark:prose-invert max-w-none text-body space-y-8 leading-relaxed">
            <section id="collection">
              <h2 className="font-display text-h3 font-semibold text-foreground">1. Information We Collect</h2>
              <p className="text-muted-foreground">
                We process account credentials, company profile data, communication telemetry (call recordings,
                transcripts, message payloads), and observation audit trails strictly for executing your configured
                operations pipelines.
              </p>
            </section>

            <section id="telemetry">
              <h2 className="font-display text-h3 font-semibold text-foreground">2. Telemetry Retention</h2>
              <p className="text-muted-foreground">
                Live communication logs are retained according to workspace policy, defaulting to 90 days. Raw
                audio streams are scrubbed following fact extraction and transcription.
              </p>
            </section>

            <section id="security">
              <h2 className="font-display text-h3 font-semibold text-foreground">3. Security & Isolation</h2>
              <p className="text-muted-foreground">
                Database records are partitioned using cryptographic tenant claims and PostgreSQL Row-Level
                Security. Data is encrypted in transit using TLS 1.3 and at rest with AES-256.
              </p>
            </section>

            <section id="rights">
              <h2 className="font-display text-h3 font-semibold text-foreground">4. Data Rights (GDPR / CCPA)</h2>
              <p className="text-muted-foreground">
                You retain full ownership of customer contacts and telemetry. You may request data exports or
                complete tenant purges at any time through your agency console administrator.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  )
}
