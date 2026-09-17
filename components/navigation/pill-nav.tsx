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
      {/* Floating Dark Cyber-Glass Capsule */}
      <div className="relative flex items-center justify-between gap-1.5 sm:gap-2 rounded-full border border-white/15 bg-[#080D17]/95 px-2 py-1.5 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_0_rgba(255,255,255,0.2)] backdrop-blur-2xl transition-all duration-300 hover:border-white/25">
        {/* Subtle top cyan ambient glow highlight */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[1px] left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#38C6E0]/50 to-transparent"
        />

        {/* Brand Mark: Clean circular badge showing "HLX AI" */}
        <Link
          href="/"
          aria-label="HLX AI Home"
          className="group flex items-center gap-2 rounded-full py-0.5 pl-0.5 pr-2.5 transition-all duration-200 active:scale-95"
        >
          <div className="flex h-7.5 w-7.5 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white text-black font-black text-[11px] sm:text-[12px] tracking-tight shadow-[0_0_12px_rgba(255,255,255,0.4)] transition-transform group-hover:scale-105">
            HLX
          </div>
          <span className="font-display text-[13px] sm:text-[14px] font-bold tracking-wider text-white group-hover:text-cyan-300 transition-colors">
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
                    ? 'border-white/20 bg-white/12 font-semibold text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                    : 'border-white/10 bg-white/[0.05] font-medium text-slate-300 hover:border-white/15 hover:bg-white/[0.10] hover:text-white'
                }`}
              >
                {isActive && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-[#38C6E0] shadow-[0_0_8px_#38C6E0]"
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
          <div className="h-4 w-[1px] bg-white/15" aria-hidden="true" />

          {isAuthenticated ? (
            <Link
              href={consoleHref}
              className="group flex items-center gap-2 whitespace-nowrap rounded-full bg-gradient-to-r from-[#38C6E0] to-[#0284C7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#050B14] shadow-[0_0_18px_rgba(56,198,224,0.35)] transition-all duration-200 hover:shadow-[0_0_26px_rgba(56,198,224,0.55)] active:scale-95"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span>Console</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-slate-300 transition-all duration-200 hover:bg-white/[0.08] hover:text-white"
              >
                Console
              </Link>
              <Link
                href="/signup"
                className="group flex items-center gap-1.5 whitespace-nowrap rounded-full bg-gradient-to-r from-[#38C6E0] to-[#0284C7] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#050B14] shadow-[0_0_18px_rgba(56,198,224,0.35)] transition-all duration-200 hover:shadow-[0_0_26px_rgba(56,198,224,0.55)] active:scale-95"
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
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#38C6E0] to-[#0284C7] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#050B14] shadow-[0_0_14px_rgba(56,198,224,0.35)]"
          >
            <span>{isAuthenticated ? 'Console' : 'Get Started'}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileOpen}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-white/5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white active:scale-95"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="mt-2 w-[calc(100vw-32px)] max-w-sm rounded-2xl border border-white/15 bg-[#080D17]/98 p-3 shadow-2xl backdrop-blur-2xl lg:hidden">
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
                      ? 'border-white/15 bg-white/10 font-semibold text-white'
                      : 'border-white/8 bg-white/[0.04] text-slate-300 hover:border-white/12 hover:bg-white/[0.08] hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-[#38C6E0] shadow-[0_0_6px_#38C6E0]" />
                    )}
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-500" />
                </Link>
              )
            })}
          </div>

          <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
            {isAuthenticated ? (
              <Link
                href={consoleHref}
                onClick={() => setMobileOpen(false)}
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#38C6E0] to-[#0284C7] text-xs font-bold uppercase tracking-wider text-[#050B14] shadow-[0_0_16px_rgba(56,198,224,0.35)]"
              >
                <span>Open Console</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#38C6E0] to-[#0284C7] text-xs font-bold uppercase tracking-wider text-[#050B14] shadow-[0_0_16px_rgba(56,198,224,0.35)]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xs font-semibold uppercase tracking-wider text-slate-200 hover:bg-white/10"
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
