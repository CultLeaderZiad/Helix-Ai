'use client'

import { useEffect } from 'react'

export function MarketingThemeSync({ defaultTheme }: { defaultTheme: 'light' | 'dark' }) {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('helix-mk-theme')
      const theme = (stored === 'light' || stored === 'dark') ? stored : defaultTheme
      const el = document.querySelector('.mk')
      if (el) {
        el.setAttribute('data-theme', theme)
      }
    } catch {
      // Storage access may be restricted
    }
  }, [defaultTheme])

  return null
}
