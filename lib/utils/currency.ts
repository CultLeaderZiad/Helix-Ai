export function formatCurrency(cents: number, currency: string, language: 'en' | 'ar' = 'en'): string {
  const value = cents / 100
  return new Intl.NumberFormat(language === 'ar' ? 'ar-AE' : 'en-AE', {
    style: 'currency',
    currency: currency,
  }).format(value)
}

export function localizeError(errorKey: string, language: 'en' | 'ar' = 'en'): string {
  const errors = {
    unauthorized: { en: 'Unauthorized access', ar: 'دخول غير مصرح به' },
    rate_limit: { en: 'Rate limit exceeded', ar: 'تجاوزت الحد المسموح' },
    not_found: { en: 'Resource not found', ar: 'المورد غير موجود' },
    validation: { en: 'Invalid input', ar: 'إدخال غير صالح' },
    default: { en: 'An unexpected error occurred', ar: 'حدث خطأ غير متوقع' },
  }
  return (errors as any)[errorKey]?.[language] || errors.default[language]
}
