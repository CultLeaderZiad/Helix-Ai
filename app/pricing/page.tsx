import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { PricingView } from '@/components/pricing/pricing-view'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getPricingConfigs } from '@/lib/pricing/pricing-store'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Pricing — Helix AI',
  description:
    'Transparent operations tiers with regional economic modeling for GCC Enterprise (UAE, KSA, Qatar) and MENA SME (Egypt, Jordan). Includes 7-day unrestricted trial.',
}

export default async function PricingPage() {
  const [configs, navAuth] = await Promise.all([Promise.resolve(getPricingConfigs()), getNavAuth()])

  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-20 md:pt-36">
          <PricingView initialConfigs={configs} />
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
