import type { Metadata } from 'next'
import { AboutView } from '@/components/marketing/about-view'

export const metadata: Metadata = {
  title: 'About: Helix',
  description: 'Helix is a founder-led studio that designs, builds and runs AI systems for businesses in the GCC and MENA.',
}

export default function AboutPage() {
  return (
          <AboutView />
      )
}
