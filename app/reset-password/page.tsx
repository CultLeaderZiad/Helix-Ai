import type { Metadata } from 'next'
import { AuthShell } from '@/components/auth/auth-shell'
import { ResetForm } from '@/components/auth/reset-form'
import { getPublicPrefs } from '@/lib/public-prefs'

export const metadata: Metadata = {
  title: 'Set a new password: Helix AI',
  robots: { index: false, follow: false },
}

export default async function ResetPasswordPage() {
  const prefs = await getPublicPrefs()
  return (
    <AuthShell>
      <ResetForm lang={prefs.lang} />
    </AuthShell>
  )
}
