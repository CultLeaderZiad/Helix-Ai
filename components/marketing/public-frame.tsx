'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import type { HelixLang, HelixTheme } from '@/lib/public-prefs'
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

const NAV = {
  en: [
    { href: '/#systems', label: 'Systems' },
    { href: '/#how', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/studio', label: 'Studio' },
    { href: '/about', label: 'About' },
  ],
  ar: [
    { href: '/#systems', label: 'الأنظمة' },
    { href: '/#how', label: 'كيف نعمل' },
    { href: '/pricing', label: 'الأسعار' },
    { href: '/studio', label: 'الاستوديو' },
    { href: '/about', label: 'من نحن' },
  ],
}

export function PublicFrame({
  initialTheme,
  initialLang,
  isAuthenticated,
  consoleHref,
  children,
  themeMode = 'site',
}: {
  initialTheme: HelixTheme
  initialLang: HelixLang
  isAuthenticated: boolean
  consoleHref: string
  children: React.ReactNode
  themeMode?: 'site' | 'light' | 'dark'
}) {
  const [theme, setThemeState] = useState<HelixTheme>(initialTheme)
  const [lang, setLangState] = useState<HelixLang>(initialLang)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const ar = lang === 'ar'
  const copy = NAV[lang]
  const forced = themeMode === 'light' ? 'day' : themeMode === 'dark' ? 'night' : theme
  const dataTheme = forced === 'day' ? 'light' : 'dark'

  useEffect(() => {
    document.documentElement.lang = ar ? 'ar' : 'en'
    document.documentElement.dir = ar ? 'rtl' : 'ltr'
  }, [ar])

  function setTheme(next: HelixTheme) {
    setThemeState(next)
    writeCookie('helix_theme', next)
  }

  function setLang(next: HelixLang) {
    setLangState(next)
    writeCookie('helix_lang', next)
    router.refresh()
  }

  return (
    <PrefsContext.Provider value={{ theme, lang, setTheme, setLang }}>
      <div className="hx" data-theme={dataTheme} dir={ar ? 'rtl' : 'ltr'} lang={ar ? 'ar' : 'en'}>
        <header className="container nav">
          <Link href="/" className="brand" aria-label="Helix">
            <HelixMark size={24} />
            <span className="word">HELIX</span>
          </Link>
          <nav className="nav-links d-only" aria-label={ar ? 'التنقل' : 'Main'}>
            {copy.map(item => (
              <Link key={item.href} href={item.href} style={pathname === item.href ? { color: 'var(--text)' } : undefined}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="nav-right">
            <div className="lang d-only" role="group" aria-label="Language">
              <button type="button" className={!ar ? 'on' : undefined} onClick={() => setLang('en')}>EN</button>
              <button type="button" className={`ar ${ar ? 'on' : ''}`} onClick={() => setLang('ar')}>ع</button>
            </div>
            <Link className="d-only" href={isAuthenticated ? consoleHref : '/login'}>
              {isAuthenticated ? (ar ? 'لوحتك' : 'Dashboard') : ar ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
            <Link className="btn btn-primary btn-sm d-only" href="/contact">
              {ar ? 'احجز مكالمة' : 'Book a call'}
            </Link>
            <button type="button" className="m-only" aria-label={open ? 'Close' : 'Menu'} onClick={() => setOpen(v => !v)} style={{ background: 'none', border: 0, color: 'var(--text)' }}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </header>
        {open ? (
          <div className="m-only" style={{ position: 'fixed', inset: 0, background: 'var(--bg)', zIndex: 30, padding: '88px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {copy.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)} style={{ fontSize: 28 }}>
                {item.label}
              </Link>
            ))}
            <Link href={isAuthenticated ? consoleHref : '/login'} onClick={() => setOpen(false)} style={{ fontSize: 28 }}>
              {ar ? 'تسجيل الدخول' : 'Sign in'}
            </Link>
            <Link className="btn btn-primary" href="/contact" onClick={() => setOpen(false)} style={{ justifyContent: 'center' }}>
              {ar ? 'احجز مكالمة' : 'Book a call'}
            </Link>
          </div>
        ) : null}
        {children}
        <footer>
          <div className="container">
            <div className="foot">
              <div>
                <Link href="/" className="brand">
                  <HelixMark size={22} />
                  <span className="word">HELIX</span>
                </Link>
                <p className="muted small" style={{ marginTop: 16, maxWidth: 300 }}>
                  {ar
                    ? 'أنظمة ذكاء اصطناعي ترد وتؤهّل وتحجز، بالعربي والإنجليزي. للأعمال في الخليج والشرق الأوسط.'
                    : 'AI systems that answer, qualify and book, in Arabic and English. For businesses across the GCC and MENA.'}
                </p>
              </div>
              <div>
                <h6>{ar ? 'المنتج' : 'Product'}</h6>
                <Link href="/#systems">{ar ? 'الأنظمة' : 'Systems'}</Link>
                <Link href="/studio">{ar ? 'الاستوديو' : 'Studio'}</Link>
                <Link href="/pricing">{ar ? 'الأسعار' : 'Pricing'}</Link>
                <Link href="/login">{ar ? 'دخول العملاء' : 'Client sign in'}</Link>
              </div>
              <div>
                <h6>{ar ? 'الشركة' : 'Company'}</h6>
                <Link href="/about">{ar ? 'من نحن' : 'About'}</Link>
                <Link href="/contact">{ar ? 'تواصل' : 'Contact'}</Link>
                <Link href="/updates">{ar ? 'التحديثات' : 'Updates'}</Link>
              </div>
              <div>
                <h6>{ar ? 'قانوني' : 'Legal'}</h6>
                <Link href="/privacy">{ar ? 'الخصوصية' : 'Privacy'}</Link>
                <Link href="/terms">{ar ? 'الشروط' : 'Terms'}</Link>
              </div>
            </div>
            <div className="foot-bottom">
              <span>© 2026 Helix</span>
              <span>
                <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>
                  {ar ? 'English' : 'العربية'}
                </button>
                {' · '}
                <button type="button" onClick={() => setTheme(theme === 'day' ? 'night' : 'day')} style={{ background: 'none', border: 0, color: 'inherit', cursor: 'pointer' }}>
                  {theme === 'day' ? (ar ? 'داكن' : 'Dark') : ar ? 'فاتح' : 'Light'}
                </button>
              </span>
            </div>
          </div>
        </footer>
      </div>
    </PrefsContext.Provider>
  )
}
