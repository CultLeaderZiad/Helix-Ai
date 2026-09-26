import type { Metadata } from 'next'
import { PricingView } from '@/components/marketing/pricing-view'
import { SitePage } from '@/components/marketing/site-page'
import { getPricingAction } from '@/lib/pricing/actions'

export const metadata: Metadata = {
  title: 'Pricing — Helix',
  description: 'Simple monthly plans in AED. A one-time setup fee, then a monthly fee to run, monitor and improve the system.',
}

export default async function PricingPage() {
  const pricing = await getPricingAction()
  return (
    <SitePage forceTheme="light">
      <PricingView plans={pricing.gcc_enterprise.plans} />
    </SitePage>
  )
}
