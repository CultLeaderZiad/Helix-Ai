'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface PillNavProps {
  isAuthenticated?: boolean
  consoleHref?: string
}

export function PillNav({
  isAuthenticated: propAuthenticated,
  consoleHref: propConsoleHref = '/dashboard',
}: PillNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [lang, setLang] = useState<'EN' | 'AR'>('AR')
  const [isAuthenticated, setIsAuthenticated] = useState(propAuthenticated ?? false)
  const [consoleHref, setConsoleHref] = useState(propConsoleHref)

  // Non-blocking client auth check: allows parent page to be 100% static
  useEffect(() => {
    if (propAuthenticated !== undefined) {
      setIsAuthenticated(propAuthenticated)
      return
    }
    try {
      const hasAuthCookie = document.cookie
        .split(';')
        .some((c) => c.trim().startsWith('sb-') && c.includes('-auth-token'))
      if (hasAuthCookie) {
        setIsAuthenticated(true)
        setConsoleHref('/dashboard')
      }
    } catch {
      // Safe fallback
    }
  }, [propAuthenticated])

  const toggleLang = () => {
    setLang((prev) => (prev === 'AR' ? 'EN' : 'AR'))
  }

  const buildHref = isAuthenticated ? consoleHref : '/signup'
  const buildLabel = isAuthenticated ? 'Console' : 'Start Build'

  return (
    <header className="pill-nav-wrapper">
      <nav
        className="pill-nav"
        aria-label="Primary"
        style={
          {
            '--base': '#ffffff',
            '--pill-bg': '#0a0a0a',
            '--hover-text': '#050505',
            '--pill-text': '#ffffff',
          } as React.CSSProperties
        }
      >
        {/* Brand Logo - White disc with HLX */}
        <Link
          className="pill-logo"
          href="/"
          aria-label="Home"
          id="pillLogo"
          prefetch={false}
        >
          <span>HLX</span>
        </Link>

        {/* Desktop Navigation Items inside White Pill Enclosure */}
        <div className="pill-nav-items desktop-only" id="navItems">
          <ul className="pill-list" role="menubar">
            {/* Features */}
            <li role="none">
              <Link role="menuitem" href="/#features" className="pill">
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack">
                  <span className="pill-label">Features</span>
                  <span className="pill-label-hover" aria-hidden="true">Features</span>
                </span>
              </Link>
            </li>

            {/* How It Works */}
            <li role="none">
              <Link role="menuitem" href="/#how" className="pill">
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack">
                  <span className="pill-label">How It Works</span>
                  <span className="pill-label-hover" aria-hidden="true">How It Works</span>
                </span>
              </Link>
            </li>

            {/* Pricing */}
            <li role="none">
              <Link role="menuitem" href="/pricing" prefetch={false} className="pill">
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack">
                  <span className="pill-label">Pricing</span>
                  <span className="pill-label-hover" aria-hidden="true">Pricing</span>
                </span>
              </Link>
            </li>

            {/* Team */}
            <li role="none">
              <Link role="menuitem" href="/team" prefetch={false} className="pill">
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack">
                  <span className="pill-label">Team</span>
                  <span className="pill-label-hover" aria-hidden="true">Team</span>
                </span>
              </Link>
            </li>

            {/* Start Build (Silver Pill) */}
            <li role="none" style={{ marginLeft: '1.25rem' }}>
              <Link role="menuitem" href={buildHref} prefetch={false} className="pill pill-silver">
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="pill-label">
                    {buildLabel}{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                  <span className="pill-label-hover" aria-hidden="true">
                    {buildLabel}{' '}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </span>
                </span>
              </Link>
            </li>

            {/* Language Switcher */}
            <li role="none" style={{ marginLeft: '0.5rem' }}>
              <button
                type="button"
                role="menuitem"
                onClick={toggleLang}
                className="pill"
                style={{ minWidth: '42px', padding: '0 12px', justifyContent: 'center', fontWeight: 800, fontSize: '13px', letterSpacing: '0.5px' }}
                aria-label={`Switch language to ${lang === 'AR' ? 'Arabic' : 'English'}`}
              >
                <span className="hover-circle" aria-hidden="true" />
                <span className="label-stack">
                  <span className="pill-label">{lang}</span>
                  <span className="pill-label-hover" aria-hidden="true">{lang}</span>
                </span>
              </button>
            </li>
          </ul>
        </div>

        {/* Mobile: Start Build CTA shown directly in nav */}
        <Link href={buildHref} className="mobile-nav-cta">
          {buildLabel}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Mobile: Right actions (Language + Hamburger) */}
        <div className="mobile-right-actions">
          <button
            type="button"
            onClick={toggleLang}
            style={{
              color: '#fff',
              fontWeight: 800,
              fontSize: '13px',
              textDecoration: 'none',
              padding: '0 8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
            aria-label="Toggle language"
          >
            {lang}
          </button>

          <button
            type="button"
            id="hamburgerBtn"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Menu"
            aria-expanded={mobileOpen}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px',
              padding: '6px',
            }}
          >
            <span
              className="hamburger-line"
              style={{
                width: '18px',
                height: '2px',
                backgroundColor: '#fff',
                transition: '0.3s transform ease, 0.3s opacity ease',
                borderRadius: '2px',
                transform: mobileOpen ? 'translateY(3px) rotate(45deg)' : 'none',
              }}
            />
            <span
              className="hamburger-line"
              style={{
                width: '18px',
                height: '2px',
                backgroundColor: '#fff',
                transition: '0.3s transform ease, 0.3s opacity ease',
                borderRadius: '2px',
                transform: mobileOpen ? 'translateY(-3px) rotate(-45deg)' : 'none',
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileOpen && (
        <div
          className="mt-2 flex w-[calc(100vw-32px)] max-w-[343px] flex-col gap-1 rounded-2xl border border-white/20 bg-black/95 p-3 shadow-2xl backdrop-blur-xl md:hidden"
        >
          <Link
            href="/#features"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white"
          >
            Features
          </Link>
          <Link
            href="/#how"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white"
          >
            How It Works
          </Link>
          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white"
          >
            Pricing
          </Link>
          <Link
            href="/team"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 items-center rounded-lg px-3 text-sm font-semibold uppercase tracking-wider text-white/80 hover:bg-white/10 hover:text-white"
          >
            Team
          </Link>
          <div className="mt-2 border-t border-white/10 pt-2">
            <Link
              href={buildHref}
              onClick={() => setMobileOpen(false)}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-slate-200 to-slate-300 text-sm font-bold uppercase tracking-wider text-black"
            >
              {buildLabel}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            {!isAuthenticated && (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-2 flex h-11 items-center justify-center rounded-lg border border-white/20 text-sm font-semibold uppercase tracking-wider text-white hover:bg-white/10"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
