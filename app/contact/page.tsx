import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { SitePage } from '@/components/marketing/site-page'

export const metadata: Metadata = {
  title: 'Contact — Helix AI',
  description: 'Get in touch with the Helix AI operations team for enterprise inquiries.',
}

export default function ContactPage() {
  return (
    <SitePage>
      <ContactForm />
    </SitePage>
  )
}
