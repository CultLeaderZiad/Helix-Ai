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

const COOKIE_BASE = 'path=/; max-age=31536000; SameSite=Lax'

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function writeLangCookies(lang: Language) {
  document.cookie = `helix_lang=${lang}; ${COOKIE_BASE}`
  document.cookie = `helix-lang=${lang}; ${COOKIE_BASE}`
}

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
    let stored: string | null = null
    try {
      stored = localStorage.getItem('helix.lang')
    } catch {
      stored = null
    }
    const saved = readCookie('helix_lang') ?? readCookie('helix-lang') ?? stored
    if (saved === 'en' || saved === 'ar') {
      try {
        writeLangCookies(saved)
        localStorage.setItem('helix.lang', saved)
      } catch {
        // ignore storage errors
      }
      if (saved !== initialLanguage) {
        setLanguageState(saved)
        document.documentElement.lang = saved
        document.documentElement.dir = saved === 'ar' ? 'rtl' : 'ltr'
      }
    }
  }, [initialLanguage])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('helix.lang', lang)
      writeLangCookies(lang)
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
