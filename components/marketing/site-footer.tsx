'use client'

import React from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/shell/language-context'
import { marketingCopy } from '@/content/marketing/copy'

export function SiteFooter() {
  const { language } = useLanguage()
  const copy = marketingCopy[language].footer

  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#07090C] text-[#9AA3B2] transition-colors">
      <div className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5 md:gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10141A] border border-white/10 text-[#34E0A1]">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
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
            <p className="mt-4 max-w-sm text-[13.5px] leading-relaxed text-[#6B7482]">
              {copy.tagline}
            </p>
          </div>

          {/* Links: Product */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#F2F4F7]">
              {copy.columns.product.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {copy.columns.product.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-[#9AA3B2] transition hover:text-[#34E0A1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Company */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#F2F4F7]">
              {copy.columns.company.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {copy.columns.company.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-[#9AA3B2] transition hover:text-[#34E0A1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links: Legal */}
          <div>
            <h4 className="text-[12px] font-semibold uppercase tracking-wider text-[#F2F4F7]">
              {copy.columns.legal.title}
            </h4>
            <ul className="mt-4 space-y-2.5">
              {copy.columns.legal.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[13.5px] text-[#9AA3B2] transition hover:text-[#34E0A1]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/[0.08] pt-8 sm:flex-row">
          <p className="text-[12.5px] text-[#6B7482]">
            {copy.copyright}
          </p>
          <div className="flex items-center gap-6 text-[12.5px] text-[#6B7482]">
            <span>Dubai · Riyadh · Doha · Cairo</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
