'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import type { HelixLang, HelixTheme } from '@/lib/public-prefs'
import { marketingCopy } from '@/components/marketing/copy'
import { HelixMark } from '@/components/marketing/helix-mark'

type Prefs = { theme: HelixTheme; lang: HelixLang; setTheme: (t: HelixTheme) => void; setLang: (l: HelixLang) => void }

const PrefsContext = createContext<Prefs | null>(null)

export function useMarketingPrefs() {
  const ctx = useContext(PrefsContext)
  if (!ctx) throw new Error('useMarketingPrefs must be used inside PublicFrame')
  return ctx
}

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${value};path=/;max-age=31536000;samesite=lax`
}

export function PublicFrame({
  initialTheme,
  initialLang,
  isAuthenticated,
  consoleHref,
  children,
}: {
  initialTheme: HelixTheme
  initialLang: HelixLang
  isAuthenticated: boolean
  consoleHref: string
  children: React.ReactNode
}) {
  const [theme, setThemeState] = useState<HelixTheme>(initialTheme)
  const [lang, setLangState] = useState<HelixLang>(initialLang)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const copy = marketingCopy[lang]
  const day = theme === 'day'

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.lang = lang === 'ar' ? 'ar' : 'en'
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
  }, [theme, lang])

  function setTheme(next: HelixTheme) {
    setThemeState(next)
    writeCookie('helix_theme', next)
  }

  function setLang(next: HelixLang) {
    setLangState(next)
    writeCookie('helix_lang', next)
    router.refresh()
  }

  const active = (id: string) => {
    if (id === 'pricing') return pathname.startsWith('/pricing')
    if (id === 'studio') return pathname.startsWith('/studio')
    if (id === 'systems') return pathname === '/'
    return false
  }

  return (
    <PrefsContext.Provider value={{ theme, lang, setTheme, setLang }}>
      <div className={`mk${day ? ' day' : ''}`}>
        <header className="wrap" style={{ position: 'relative', zIndex: 6 }}>
          <nav className="nav" aria-label={lang === 'ar' ? 'التنقل' : 'Main'}>
            <Link href="/" className="brand" aria-label="Helix AI">
              <span className="mark">
                <HelixMark size={18} light={day} />
              </span>
              <span style={{ fontFamily: 'var(--font-geist), sans-serif' }}>{copy.brand}</span>
            </Link>
            <div className="navlinks">
              {copy.nav.map(item => (
                <Link key={item.id} href={item.href} className={active(item.id) ? 'on' : undefined}>
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="navright">
              <span className="lang" role="group" aria-label={lang === 'ar' ? 'اللغة' : 'Language'}>
                <button type="button" className={lang === 'en' ? 'on' : undefined} onClick={() => setLang('en')}>
                  EN
                </button>
                <button type="button" className={lang === 'ar' ? 'on' : undefined} onClick={() => setLang('ar')}>
                  عربي
                </button>
              </span>
              <Link href={isAuthenticated ? consoleHref : '/login'} className="btn btn-quiet hide-sm">
                {isAuthenticated ? copy.console : copy.signIn}
              </Link>
              <Link href="/signup" className={`hide-sm ${day ? 'btn btn-ink' : 'btn btn-primary'}`}>
                {copy.build} <ArrowRight className="s14" size={14} style={{ transform: lang === 'ar' ? 'scaleX(-1)' : undefined }} />
              </Link>
              <button
                type="button"
                className="menu-btn"
                aria-expanded={open}
                aria-label={open ? 'Close menu' : 'Open menu'}
                onClick={() => setOpen(v => !v)}
              >
                {open ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </nav>
          <div className={`mob-menu${open ? ' open' : ''}`}>
            {copy.nav.map(item => (
              <Link key={item.id} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href={isAuthenticated ? consoleHref : '/login'} onClick={() => setOpen(false)}>
              {isAuthenticated ? copy.console : copy.signIn}
            </Link>
            <button type="button" onClick={() => setTheme(day ? 'night' : 'day')}>
              {day ? (lang === 'ar' ? 'الوضع الليلي' : 'Night') : lang === 'ar' ? 'الوضع النهاري' : 'Daylight'}
            </button>
          </div>
        </header>
        {children}
        <footer className="footer">
          <div className="wrap row" style={{ justifyContent: 'space-between', fontSize: 13, color: 'var(--subtle)' }}>
            <Link href="/" className="brand" style={{ fontSize: 15, color: 'var(--text)' }}>
              <span className="mark" style={{ width: 26, height: 26 }}>
                <HelixMark size={15} light={day} />
              </span>
              Helix AI
            </Link>
            <div className="row" style={{ gap: 24, flexWrap: 'wrap' }}>
              {copy.footerLinks.map(link => (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ))}
              <button type="button" onClick={() => setTheme(day ? 'night' : 'day')} style={{ color: 'var(--subtle)' }}>
                {day ? (lang === 'ar' ? 'ليلي' : 'Night') : lang === 'ar' ? 'نهاري' : 'Daylight'}
              </button>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <span className="dot" />© 2026 Helix
            </div>
          </div>
        </footer>
      </div>
    </PrefsContext.Provider>
  )
}
