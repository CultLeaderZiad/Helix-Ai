'use client'

import React, { createContext, useContext, useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

export type Language = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

export interface LanguageContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  toggleLanguage: () => void
  dir: Direction
  isArabic: boolean
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function LanguageProvider({
  children,
  initialLanguage = 'en',
}: {
  children: React.ReactNode
  initialLanguage?: Language
}) {
  const router = useRouter()
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const [, startTransition] = useTransition()

  useEffect(() => {
    // Sync with localStorage on client mount if available
    const saved = localStorage.getItem('helix.lang')
    if (saved === 'en' || saved === 'ar') {
      if (saved !== language) {
        setLanguageState(saved)
        document.documentElement.lang = saved
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('helix.lang', lang)
      document.cookie = `helix-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    } catch {
      // ignore storage errors
    }
    startTransition(() => {
      router.refresh()
    })
  }

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en')
  }

  const dir: Direction = language === 'ar' ? 'rtl' : 'ltr'
  const isArabic = language === 'ar'

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        dir,
        isArabic,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    // Return sensible default if used outside provider
    return {
      language: 'en',
      setLanguage: () => {},
      toggleLanguage: () => {},
      dir: 'ltr',
      isArabic: false,
    }
  }
  return ctx
}
