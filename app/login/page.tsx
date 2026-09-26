import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { AuthShell } from '@/components/auth/auth-shell'
import { LoginForm } from '@/components/login/login-form'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { normalizePortalOverride } from '@/lib/auth/portal-route'
import { getPublicPrefs } from '@/lib/public-prefs'

export const metadata: Metadata = {
  title: 'Sign in: Helix AI',
  description: 'Sign in to your Helix workspace.',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; portal?: string }>
}) {
  const navAuth = await getNavAuth()
  if (navAuth.isAuthenticated) {
    redirect(navAuth.consoleHref)
  }

  const [prefs, params] = await Promise.all([getPublicPrefs(), searchParams])

  return (
    <AuthShell>
      <LoginForm
        lang={prefs.lang}
        verifyFailed={params.error === 'verification_failed'}
        portal={normalizePortalOverride(params.portal)}
      />
    </AuthShell>
  )
}
