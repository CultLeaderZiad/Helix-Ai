import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { SitePage } from '@/components/marketing/site-page'
import { getPublicFaqs } from '@/lib/faq/actions'

export const metadata: Metadata = {
  title: 'FAQ — Helix AI',
  description: 'Frequently asked questions about Helix AI architecture, security, integrations, and pricing.',
}

export default async function FaqPage() {
  const faqs = await getPublicFaqs()
  return (
    <SitePage>
      <FaqAccordion initialFaqs={faqs} />
    </SitePage>
  )
}
