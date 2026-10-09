'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X } from 'lucide-react'
import { AnimatePresence, m } from 'motion/react'
import { useMarketingPrefs } from '@/components/marketing/marketing-prefs'

const NAV = {
  en: [
    { href: '/updates', label: 'Updates' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
  ],
  ar: [
    { href: '/updates', label: 'التحديثات' },
    { href: '/pricing', label: 'الأسعار' },
    { href: '/about', label: 'من نحن' },
  ],
} as const

export function PillNav({
  isAuthenticated,
  consoleHref,
}: {
  isAuthenticated: boolean
  consoleHref: string
}) {
  const pathname = usePathname()
  const { lang, effective, setLang, setTheme } = useMarketingPrefs()
  const [open, setOpen] = useState(false)
  const ar = lang === 'ar'
  const items = NAV[lang]
  const deskLabel = ar ? 'اللوحة' : 'Console'
  const deskHref = isAuthenticated ? consoleHref : '/login'

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <m.header
      className="hx-nav"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="pill-bar">
        <span className="pill-sheen" aria-hidden="true" />
        <Link href="/" className="pill-brand" aria-label={ar ? 'هيلكس، الرئيسية' : 'Helix home'}>
          <span className="pill-mark">HLX</span>
          <span className="pill-ai">AI</span>
        </Link>

        <nav className="pill-links" aria-label={ar ? 'التنقل' : 'Main'}>
          {items.map(item => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={active ? 'pill-link is-active' : 'pill-link'}
                aria-current={active ? 'page' : undefined}
              >
                {active ? (
                  <m.span
                    layoutId="pill-tab"
                    className="pill-tab"
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                ) : null}
                <span className="pill-link-label">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pill-tools">
          <div className="pill-lang" role="group" aria-label={ar ? 'اللغة' : 'Language'}>
            <button type="button" className={!ar ? 'on' : undefined} onClick={() => setLang('en')}>
              EN
            </button>
            <button type="button" className={ar ? 'on' : undefined} onClick={() => setLang('ar')}>
              ع
            </button>
          </div>
          <Link href={deskHref} className="pill-console">
            <span className="hx-live" aria-hidden="true">
              <span className="hx-live-ping" />
              <span className="hx-live-dot" />
            </span>
            <span>{deskLabel}</span>
            <ArrowRight className="arrow" aria-hidden="true" />
          </Link>
        </div>

        <div className="pill-mobile">
          <Link href={deskHref} className="pill-console">
            <span className="hx-live" aria-hidden="true">
              <span className="hx-live-ping" />
              <span className="hx-live-dot" />
            </span>
            <span>{deskLabel}</span>
          </Link>
          <button
            type="button"
            className="pill-menu"
            aria-expanded={open}
            aria-label={open ? (ar ? 'إغلاق القائمة' : 'Close menu') : ar ? 'فتح القائمة' : 'Open menu'}
            onClick={() => setOpen(value => !value)}
          >
            {open ? <X size={16} strokeWidth={1.5} /> : <Menu size={16} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            className="pill-sheet"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {items.map(item => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link key={item.href} href={item.href} className={active ? 'is-active' : undefined} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              )
            })}
            <div className="pill-sheet-tools">
              <div className="pill-lang" role="group" aria-label={ar ? 'اللغة' : 'Language'}>
                <button type="button" className={!ar ? 'on' : undefined} onClick={() => setLang('en')}>EN</button>
                <button type="button" className={ar ? 'on' : undefined} onClick={() => setLang('ar')}>ع</button>
              </div>
              <button type="button" onClick={() => setTheme(effective === 'day' ? 'night' : 'day')}>
                {effective === 'day' ? (ar ? 'داكن' : 'Dark') : ar ? 'فاتح' : 'Light'}
              </button>
            </div>
          </m.div>
        ) : null}
      </AnimatePresence>
    </m.header>
  )
}
