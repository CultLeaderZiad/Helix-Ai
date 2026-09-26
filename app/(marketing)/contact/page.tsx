import type { Metadata } from 'next'
import { ContactForm } from '@/components/contact/contact-form'
import { SitePage } from '@/components/marketing/site-page'

export const metadata: Metadata = {
  title: 'Book a discovery call — Helix',
  description: 'Tell us how enquiries reach you. We reply with a time for a short call and a live walkthrough.',
}

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string | string[]; systems?: string | string[]; scope?: string | string[] }>
}) {
  const query = await searchParams
  const one = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value)
  const systems = Array.isArray(query.systems) ? query.systems.join(',') : query.systems
  return (
    <SitePage>
      <ContactForm plan={one(query.plan)} systems={systems} scope={one(query.scope)} />
    </SitePage>
  )
}
