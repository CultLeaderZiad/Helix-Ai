'use client'

import { createContext, useContext } from 'react'
import type { HelixLang, HelixTheme } from '@/lib/public-prefs'

export type MarketingPrefs = {
  theme: HelixTheme
  effective: HelixTheme
  lang: HelixLang
  setTheme: (t: HelixTheme) => void
  setLang: (l: HelixLang) => void
}

export const MarketingPrefsContext = createContext<MarketingPrefs | null>(null)

export function useMarketingPrefs() {
  const ctx = useContext(MarketingPrefsContext)
  if (!ctx) throw new Error('useMarketingPrefs must be used inside PublicFrame')
  return ctx
}
