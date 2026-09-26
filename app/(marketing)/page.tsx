import type { Metadata } from 'next'
import { HomeView } from '@/components/marketing/home-view'
import { getPricingAction } from '@/lib/pricing/actions'

export const metadata: Metadata = {
  title: 'Helix: Missed calls answered. Appointments booked.',
  description:
    'Helix builds and runs AI systems that answer, qualify and book, in Arabic and English, for clinics, real-estate and service businesses across the GCC and MENA.',
}

export default async function LandingPage() {
  const pricing = await getPricingAction()
  return (
          <HomeView plans={pricing.gcc_enterprise.plans} />
      )
}
