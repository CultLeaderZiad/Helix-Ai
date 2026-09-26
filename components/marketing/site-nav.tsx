'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, ArrowRight, ArrowLeft } from 'lucide-react'
import { useLanguage } from '@/components/shell/language-context'
import { marketingCopy } from '@/content/marketing/copy'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface SiteNavProps {
  isAuthenticated?: boolean
  consoleHref?: string
}

export function SiteNav({
  isAuthenticated = false,
  consoleHref = '/dashboard',
}: SiteNavProps) {
  const pathname = usePathname()
  const { language, toggleLanguage, isArabic, dir } = useLanguage()
  const copy = marketingCopy[language].nav
  const [mobileOpen, setMobileOpen] = useState(false)

  const navLinks = [
    { label: copy.links.systems, href: '/#systems' },
    { label: copy.links.leadgen, href: '/lead-gen' },
    { label: copy.links.howItWorks, href: '/#how' },
    { label: copy.links.pricing, href: '/pricing' },
    { label: copy.links.studio, href: '/studio' },
  ]

  return (
    <header className="sticky top-0 z-50 w-full px-4 sm:px-8 pt-4 pb-3 transition-colors">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
        {/* Brand Mark */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-lg py-1 transition-opacity hover:opacity-90"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10141A] border border-white/10 text-white shadow-sm">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#34E0A1"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <span className="font-semibold text-[17px] tracking-tight text-[#F2F4F7]">
            Helix <span className="font-medium text-[#9AA3B2]">AI</span>
          </span>
        </Link>

        {/* Desktop Pill Links */}
        <nav
          aria-label="Marketing Navigation"
          className="hidden md:flex items-center gap-1 rounded-full border border-white/10 bg-[#10141A]/85 px-3 py-1.5 backdrop-blur-xl shadow-lg shadow-black/20"
        >
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && !item.href.includes('#'))

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3.5 py-1.5 text-[13.5px] rounded-full transition-all duration-150 ${
                  isActive
                    ? 'text-white font-medium bg-white/10 shadow-sm'
                    : 'text-[#9AA3B2] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5">
          {/* Language Toggle Pill */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center gap-1 h-9 rounded-full border border-white/10 bg-[#10141A]/70 px-3 text-[12.5px] font-medium text-[#9AA3B2] transition hover:border-white/20 hover:text-white"
            aria-label="Toggle Language"
          >
            <span className={!isArabic ? 'text-[#34E0A1] font-semibold' : ''}>EN</span>
            <span className="text-white/20">|</span>
            <span className={isArabic ? 'text-[#34E0A1] font-semibold' : ''}>عربي</span>
          </button>

          {/* Sign in / Console link */}
          <div className="hidden sm:flex items-center">
            {isAuthenticated ? (
              <Link
                href={consoleHref}
                className="flex items-center gap-2 px-3 py-1.5 text-[13.5px] font-medium text-[#F2F4F7] hover:text-white transition"
              >
                <span className="h-2 w-2 rounded-full bg-[#34E0A1] animate-pulse" />
                <span>{copy.console}</span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-1.5 text-[13.5px] font-medium text-[#9AA3B2] hover:text-[#F2F4F7] transition"
              >
                {copy.signIn}
              </Link>
            )}
          </div>

          {/* Primary CTA */}
          <a
            href="https://helixx.xo.je/build"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 h-9 rounded-full bg-[#34E0A1] px-4 text-[13px] font-semibold text-[#04130D] shadow-[0_0_0_1px_rgba(52,224,161,0.5),0_8px_20px_-6px_rgba(52,224,161,0.55),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:brightness-105 active:scale-98"
          >
            <span>{copy.cta}</span>
          </a>

          {/* Mobile Sheet Trigger */}
          <div className="md:hidden flex items-center">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-[#10141A]/70 text-[#F2F4F7] hover:bg-white/10"
                aria-label="Open menu"
              >
                <Menu className="h-4.5 w-4.5" />
              </SheetTrigger>
              <SheetContent
                side={dir === 'rtl' ? 'right' : 'left'}
                className="w-[280px] sm:w-[320px] border-white/10 bg-[#0B0E13] p-6 text-white"
              >
                <SheetHeader className="text-start pb-4 border-b border-white/10">
                  <SheetTitle className="text-white flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#10141A] border border-white/10 text-[#34E0A1]">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </div>
                    <span>Helix AI</span>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-2 py-6">
                  {navLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-[15px] font-medium text-[#9AA3B2] hover:text-white rounded-lg hover:bg-white/[0.04] transition"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>

                <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
                  {isAuthenticated ? (
                    <Link
                      href={consoleHref}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] text-[14px] font-medium text-white"
                    >
                      <span>{copy.console}</span>
                      {isArabic ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
                    </Link>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setMobileOpen(false)}
                      className="px-3 py-2 text-[14px] font-medium text-[#9AA3B2] hover:text-white"
                    >
                      {copy.signIn}
                    </Link>
                  )}

                  <a
                    href="https://helixx.xo.je/build"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center h-10 rounded-full bg-[#34E0A1] text-[13.5px] font-semibold text-[#04130D] shadow-md transition"
                  >
                    {copy.cta}
                  </a>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
