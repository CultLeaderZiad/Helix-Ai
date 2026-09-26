import { PublicFrame } from '@/components/marketing/public-frame'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { getPublicPrefs } from '@/lib/public-prefs'

export async function SitePage({
  children,
  forceTheme,
}: {
  children: React.ReactNode
  bare?: boolean
  forceTheme?: 'light' | 'dark' | 'site'
}) {
  const [prefs, auth] = await Promise.all([getPublicPrefs(), getNavAuth()])
  return (
    <PublicFrame
      initialTheme={prefs.theme}
      initialLang={prefs.lang}
      isAuthenticated={auth.isAuthenticated}
      consoleHref={auth.consoleHref}
      themeMode={forceTheme ?? 'site'}
    >
      {children}
    </PublicFrame>
  )
}
