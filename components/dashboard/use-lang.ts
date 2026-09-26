'use client'

import { useEffect, useState } from 'react'
import type { DashLang } from '@/lib/dashboard/lang'

export function useDashLang(initial: DashLang = 'en'): DashLang {
  const [lang, setLang] = useState<DashLang>(initial)

  useEffect(() => {
    const read = () => setLang(document.documentElement.lang === 'ar' ? 'ar' : 'en')
    read()
    const observer = new MutationObserver(read)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
    return () => observer.disconnect()
  }, [])

  return lang
}
