import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/signup-form'
import { getPublicPrefs } from '@/lib/public-prefs'

export const metadata: Metadata = {
  title: 'Start your free trial — Helix AI',
  description: 'Create your workspace and start your 7-day unrestricted trial.',
  robots: { index: false, follow: false },
}

export default async function SignUpPage() {
  const prefs = await getPublicPrefs()
  return (
    <AuthShell>
      <SignUpForm lang={prefs.lang} />
    </AuthShell>
  )
}
