import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
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
    <div className="relative min-h-screen bg-[#070A11] text-[#F8FAFC]">
      {/* Subtle WebGL Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LightfallCanvas
          colors={['#38BDF8', '#0EA5E9', '#818CF8']}
          backgroundColor="#070A11"
          speed={0.4}
          streakCount={4}
          density={0.5}
          glow={0.6}
          mouseInteraction={true}
          className="h-full w-full opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#070A11]/60 via-transparent to-[#070A11]" />
      </div>

      <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

      <main className="relative z-10 pt-28 pb-20 md:pt-36">
        <FaqAccordion initialFaqs={faqs} />
      </main>

      <HelixFooter />
    </div>
  )
}
