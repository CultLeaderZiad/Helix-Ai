'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Menu, X, ChevronRight } from 'lucide-react'

interface PillNavProps {
  isAuthenticated?: boolean
  consoleHref?: string
}

const NAV_ITEMS = [
  { label: 'Updates', href: '/updates' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
] as const

export function PillNav({
  isAuthenticated: propAuthenticated = false,
  consoleHref: propConsoleHref = '/dashboard',
}: PillNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const isAuthenticated = propAuthenticated
  const consoleHref = propConsoleHref

  return (
    <header className="fixed top-[max(0.75rem,env(safe-area-inset-top))] sm:top-5 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-auto max-w-[calc(100vw-24px)]">
      {/* Floating Capsule */}
      <div className="relative flex items-center justify-between gap-1.5 sm:gap-2 rounded-full border border-border bg-panel/95 px-2 py-1.5 shadow-md transition-all duration-300">
        {/* Brand Mark: Clean circular badge showing "HLX AI" */}
        <Link
          href="/"
          aria-label="HLX AI Home"
          className="group flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2.5 transition-all duration-200 active:scale-95"
        >
          <div className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-foreground text-background font-black text-[11px] sm:text-[12px] tracking-tight transition-transform group-hover:scale-105">
            HLX
          </div>
          <span className="font-display text-[13px] sm:text-[14px] font-bold tracking-wider text-foreground group-hover:text-foreground/80 transition-colors">
            AI
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 px-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[13px] tracking-wide transition-all duration-200 ${
                  isActive
                    ? 'border-border bg-raised font-semibold text-foreground'
                    : 'border-transparent font-medium text-muted-foreground hover:bg-raised hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent"
                    aria-hidden="true"
                  />
                )}
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-2 pl-1">
          <div className="h-4 w-[1px] bg-border" aria-hidden="true" />

          {isAuthenticated ? (
            <Link
              href={consoleHref}
              className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground transition-all duration-200 hover:bg-accent/90 active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-foreground" />
              </span>
              <span>Console</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-all duration-200 hover:bg-raised hover:text-foreground"
              >
                Console
              </Link>
              <Link
                href="/signup"
                className="group flex items-center gap-1.5 whitespace-nowrap rounded-full bg-accent px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground transition-all duration-200 hover:bg-accent/90 active:scale-95"
              >
                <span>Get Started</span>
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile / Tablet View (<1024px) */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          <Link
            href={isAuthenticated ? consoleHref : '/signup'}
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent-foreground"
          >
            <span>{isAuthenticated ? 'Console' : 'Get Started'}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-raised text-foreground transition-colors hover:bg-panel active:scale-95"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="mt-2 w-[calc(100vw-32px)] max-w-sm rounded-xl border border-border bg-panel p-3 shadow-xl lg:hidden">
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'border-border bg-raised font-semibold text-foreground'
                      : 'border-transparent text-muted-foreground hover:bg-raised hover:text-foreground'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              )
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {isAuthenticated ? (
              <Link
                href={consoleHref}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-xs font-semibold uppercase tracking-wider text-accent-foreground"
              >
                <span>Open Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-accent text-xs font-semibold uppercase tracking-wider text-accent-foreground"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl border border-border bg-raised text-xs font-medium uppercase tracking-wider text-foreground hover:bg-panel"
                >
                  Console
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
