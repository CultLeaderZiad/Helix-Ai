import type { Metadata } from 'next'
import { PricingBand } from '@/components/marketing/home-view'
import { SitePage } from '@/components/marketing/site-page'

export const metadata: Metadata = {
  title: 'Pricing — Helix AI',
  description:
    'Transparent operations tiers with regional economic modeling for GCC Enterprise (UAE, KSA, Qatar) and MENA SME (Egypt, Jordan). Includes 7-day unrestricted trial.',
}

export default function PricingPage() {
  return (
    <SitePage bare>
      <div style={{ paddingTop: 24 }}>
        <PricingBand full />
      </div>
    </SitePage>
  )
}
