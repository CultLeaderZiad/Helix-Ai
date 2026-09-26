'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { HelixLang, HelixTheme } from '@/lib/public-prefs'
import { HelixFooter } from '@/components/footer/helix-footer'
import { MarketingPrefsContext, useMarketingPrefs } from '@/components/marketing/marketing-prefs'
import { PillNav } from '@/components/navigation/pill-nav'

export { useMarketingPrefs }

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`
}

export function PublicFrame({
  initialTheme,
  initialLang,
  themeChosen = false,
  isAuthenticated,
  consoleHref,
  children,
}: {
  initialTheme: HelixTheme
  initialLang: HelixLang
  themeChosen?: boolean
  isAuthenticated: boolean
  consoleHref: string
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<HelixTheme>(initialTheme)
  const [lang, setLangState] = useState<HelixLang>(initialLang)
  const [picked, setPicked] = useState(themeChosen)
  const pathname = usePathname()
  const router = useRouter()
  const ar = lang === 'ar'
  const effective: HelixTheme = pathname === '/pricing' && !picked ? 'day' : theme
  const dataTheme = effective === 'day' ? 'light' : 'dark'
  const agencyHref = consoleHref === '/admin' ? '/admin' : '/login?portal=agency'

  useEffect(() => {
    document.documentElement.lang = ar ? 'ar' : 'en'
    document.documentElement.dir = ar ? 'rtl' : 'ltr'
  }, [ar])

  function setTheme(next: HelixTheme) {
    setPicked(true)
    setThemeState(next)
    writeCookie('helix_theme', next)
  }

  function setLang(next: HelixLang) {
    setLangState(next)
    writeCookie('helix_lang', next)
    router.refresh()
  }

  return (
    <MarketingPrefsContext.Provider value={{ theme, lang, effective, setTheme, setLang }}>
      <div className="hx" data-theme={dataTheme} dir={ar ? 'rtl' : 'ltr'} lang={ar ? 'ar' : 'en'}>
        <PillNav isAuthenticated={isAuthenticated} consoleHref={consoleHref} />
        <div key={pathname} className="hx-main">
          {children}
        </div>
        <HelixFooter agencyHref={agencyHref} />
      </div>
    </MarketingPrefsContext.Provider>
  )
}
