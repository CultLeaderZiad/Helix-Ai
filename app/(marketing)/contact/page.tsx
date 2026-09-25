import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { HelixFooter } from '@/components/footer/helix-footer'
import { ContactForm } from '@/components/contact/contact-form'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Contact — Helix AI',
  description: 'Get in touch with the Helix AI operations team for enterprise inquiries.',
}

export default async function ContactPage() {
  const navAuth = await getNavAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
        <ContactForm />
      </main>

      <HelixFooter />
    </div>
  )
}
