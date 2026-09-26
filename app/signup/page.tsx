import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { SignUpForm } from '@/components/auth/signup-form'
import { getPublicPrefs } from '@/lib/public-prefs'

export const metadata: Metadata = {
  title: 'Create your workspace: Helix',
  description: 'Create your Helix workspace.',
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
