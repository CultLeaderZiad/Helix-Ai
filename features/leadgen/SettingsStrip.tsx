'use client'

import type { WorkerHealthResponse } from '@/lib/leadgen/types'

interface SettingsStripProps {
  health: WorkerHealthResponse | null
  isArabic?: boolean
}

export function SettingsStrip({ health, isArabic = false }: SettingsStripProps) {
  const isOnline = health?.worker === 'online'
  const robotsObey = health?.robots_default ?? true
  const quotas = health?.quotas

  const placeLookups = quotas
    ? { used: quotas.stealth_month_used, cap: quotas.stealth_month_cap }
    : null

  return (
    <div className="pnl" role="region" aria-label={isArabic ? 'حالة البحث' : 'Search status'}>
      <div className="row-between">
        <div>
          <b>{isArabic ? 'البحث عن العملاء' : 'Lead search'}</b>
          <p className="faint">
            {isOnline
              ? (isArabic ? 'جاهز' : 'Ready')
              : (isArabic ? 'غير متاح الآن' : 'Not available right now')}
          </p>
        </div>
        {placeLookups ? (
          <p className="faint">
            {isArabic
              ? `عمليات البحث: ${placeLookups.used} من ${placeLookups.cap} هذا الشهر`
              : `Lookups: ${placeLookups.used} of ${placeLookups.cap} this month`}
          </p>
        ) : null}
      </div>
      <p className="faint" style={{ marginTop: 8 }}>
        {robotsObey
          ? (isArabic ? 'نحترم تعليمات المواقع حول الصفحات المسموحة.' : 'We follow each site’s page rules.')
          : (isArabic ? 'تعليمات المواقع غير مفعّلة.' : 'Site page rules are turned off.')}
      </p>
    </div>
  )
}
