import { PublicFrame } from '@/components/marketing/public-frame'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { getPublicPrefs } from '@/lib/public-prefs'

export async function SitePage({
  children,
  bare = false,
}: {
  children: React.ReactNode
  bare?: boolean
}) {
  const [prefs, auth] = await Promise.all([getPublicPrefs(), getNavAuth()])
  return (
    <PublicFrame
      initialTheme={prefs.theme}
      initialLang={prefs.lang}
      isAuthenticated={auth.isAuthenticated}
      consoleHref={auth.consoleHref}
    >
      {bare ? children : <main className="page-main"><div className="wrap">{children}</div></main>}
    </PublicFrame>
  )
}
