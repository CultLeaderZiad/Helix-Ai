import type { Metadata } from 'next'
import { FaqAccordion } from '@/components/faq/faq-accordion'
import { getPublicFaqs } from '@/lib/faq/actions'

export const metadata: Metadata = {
  title: 'FAQ: Helix AI',
  description: 'Plain answers about phone numbers, languages, setup, ownership and plans.',
}

export default async function FaqPage() {
  const faqs = await getPublicFaqs()
  return (
          <FaqAccordion initialFaqs={faqs} />
      )
}
