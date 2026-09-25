import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { ForgotForm } from '@/components/auth/forgot-form'
import { getPublicPrefs } from '@/lib/public-prefs'

export const metadata: Metadata = {
  title: 'Reset password — Helix AI',
  robots: { index: false, follow: false },
}

export default async function ForgotPasswordPage() {
  const prefs = await getPublicPrefs()
  return (
    <AuthShell>
      <ForgotForm lang={prefs.lang} />
    </AuthShell>
  )
}
