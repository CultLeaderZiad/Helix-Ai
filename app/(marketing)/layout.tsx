import { PublicFrame } from '@/components/marketing/public-frame'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { getPublicPrefs } from '@/lib/public-prefs'

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [prefs, auth] = await Promise.all([getPublicPrefs(), getNavAuth()])
  return (
    <PublicFrame
      initialTheme={prefs.theme}
      initialLang={prefs.lang}
      themeChosen={prefs.themeChosen}
      isAuthenticated={auth.isAuthenticated}
      consoleHref={auth.consoleHref}
    >
      {children}
    </PublicFrame>
  )
}
