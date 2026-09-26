import type { Language } from './server'

/**
 * Format numbers using Latin digits across both English and Arabic.
 * Using locale `ar-AE-u-nu-latn` ensures Arabic text retains standard Western/Latin numerals (0-9).
 */
export function formatNumber(
  value: number,
  lang: Language = 'en',
  options?: Intl.NumberFormatOptions
): string {
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, options).format(value)
}

/**
 * Format currency values given in cents.
 */
export function formatCurrencyCents(
  cents: number,
  currency: string = 'USD',
  lang: Language = 'en'
): string {
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

/**
 * Format compact numbers (e.g. 1.2K, 45M) with Latin digits.
 */
export function formatCompactNumber(
  value: number,
  lang: Language = 'en'
): string {
  const locale = lang === 'ar' ? 'ar-AE-u-nu-latn' : 'en-US'
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(value)
}

/**
 * Format relative elapsed time (e.g. "2 min ago", "منذ دقيقتين").
 */
export function formatRelativeTime(
  date: Date | string | number,
  lang: Language = 'en'
): string {
  const then = new Date(date).getTime()
  const now = Date.now()
  const diffInSeconds = Math.max(0, Math.floor((now - then) / 1000))

  if (diffInSeconds < 60) {
    return lang === 'ar' ? 'الآن' : 'just now'
  }
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return lang === 'ar' ? `منذ ${diffInMinutes} د` : `${diffInMinutes}m ago`
  }
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return lang === 'ar' ? `منذ ${diffInHours} س` : `${diffInHours}h ago`
  }
  const diffInDays = Math.floor(diffInHours / 24)
  return lang === 'ar' ? `منذ ${diffInDays} ي` : `${diffInDays}d ago`
}
