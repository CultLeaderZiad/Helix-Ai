import { cookies } from 'next/headers'

export type Language = 'en' | 'ar'
export type Direction = 'ltr' | 'rtl'

export async function getLang(): Promise<Language> {
  const cookieStore = await cookies()
  const langCookie = cookieStore.get('helix-lang')?.value
  return langCookie === 'ar' ? 'ar' : 'en'
}

export function dirOf(lang: Language): Direction {
  return lang === 'ar' ? 'rtl' : 'ltr'
}

/**
 * Format numbers using Latin numerals for both English and Arabic (ar-AE Latin numerals)
 */
export function formatNumber(
  num: number,
  lang: Language = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, options).format(num)
}
