'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

export type ConsoleLanguage = 'en' | 'ar'

const STORAGE_KEY = 'helix-console-language'

const ConsoleLanguageContext = createContext<{
  language: ConsoleLanguage
  setLanguage: (language: ConsoleLanguage) => void
}>({
  language: 'en',
  setLanguage: () => {},
})

export function ConsoleLanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<ConsoleLanguage>('en')

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'ar' || stored === 'en') setLanguageState(stored)
  }, [])

  const setLanguage = (next: ConsoleLanguage) => {
    setLanguageState(next)
    window.localStorage.setItem(STORAGE_KEY, next)
  }

  return (
    <ConsoleLanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </ConsoleLanguageContext.Provider>
  )
}

export function useConsoleLanguage() {
  return useContext(ConsoleLanguageContext)
}

export function LanguageToggle({ className }: { className?: string }) {
  const { language, setLanguage } = useConsoleLanguage()

  return (
    <div className={cn('flex items-center rounded-[12px] border border-helix-border bg-helix-surface p-1', className)}>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={cn(
          'rounded-[10px] px-3 py-1.5 text-13',
          language === 'en' ? 'bg-helix-ink text-helix-surface' : 'text-helix-muted hover:text-helix-ink',
        )}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('ar')}
        className={cn(
          'rounded-[10px] px-3 py-1.5 text-13',
          language === 'ar' ? 'bg-helix-ink text-helix-surface' : 'text-helix-muted hover:text-helix-ink',
        )}
      >
        العربية
      </button>
    </div>
  )
}
