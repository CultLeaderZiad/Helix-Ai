import type { Metadata } from 'next'
import { HomeView } from '@/components/marketing/home-view'
import { SitePage } from '@/components/marketing/site-page'

export const metadata: Metadata = {
  title: 'Helix AI — AI systems that answer, qualify and book',
  description:
    'Helix builds and runs WhatsApp and voice receptionists, lead generation and CRM automations on n8n — with a console that shows exactly what every agent did.',
}

export default function LandingPage() {
  return (
    <SitePage bare>
      <HomeView />
    </SitePage>
  )
}
