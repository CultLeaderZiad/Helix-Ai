import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getPublicFaqs } from '@/lib/faq/actions'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'FAQ — Helix AI',
  description: 'Frequently asked questions about Helix AI architecture, security, integrations, and pricing.',
}

export default async function FaqPage() {
  const [faqs, navAuth] = await Promise.all([getPublicFaqs(), getNavAuth()])

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="relative z-10 pt-28 pb-20 md:pt-36">
          <FaqAccordion initialFaqs={faqs} />
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
