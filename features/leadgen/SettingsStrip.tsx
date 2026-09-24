'use client'

import type { WorkerHealthResponse } from '@/lib/leadgen/types'

interface SettingsStripProps {
  health: WorkerHealthResponse | null
  isArabic?: boolean
}

export function SettingsStrip({ health, isArabic = false }: SettingsStripProps) {
  const isOnline = health?.worker === 'online'
  const isBuiltin = health?.mode === 'builtin'
  const robotsObey = health?.robots_default ?? true
  const quotas = health?.quotas
  const available = health?.engines_available

  const stealthRemaining = quotas ? Math.max(0, quotas.stealth_month_cap - quotas.stealth_month_used) : null
  const browserSecondsRemaining = quotas ? Math.max(0, quotas.browser_seconds_cap - quotas.browser_seconds_used) : null

  return (
    <div
      role="region"
      aria-label={isArabic ? 'حالة محرك الاستخراج' : 'Extraction Engine Status'}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] px-4 py-2.5 text-xs text-[#5b6577] dark:text-[#8b95a7]"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Engine status chip */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'محرك الاستخراج:' : 'Lead Engine:'}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded px-2 py-0.5 font-mono text-[11px] font-medium ${
              isOnline
                ? 'bg-[#1f8a3b]/10 dark:bg-[#3fb950]/15 text-[#1f8a3b] dark:text-[#3fb950]'
                : 'bg-[#c62f2a]/10 dark:bg-[#f85149]/15 text-[#c62f2a] dark:text-[#f85149]'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isOnline ? 'bg-[#1f8a3b] dark:bg-[#3fb950]' : 'bg-[#c62f2a] dark:bg-[#f85149]'
              }`}
            />
            {isOnline
              ? isBuiltin
                ? isArabic
                  ? 'محرك مدمج (متصل)'
                  : 'Built-in Engine (Online)'
                : isArabic
                ? `مشغل خارجي (v${health?.scrapling_version ?? '0.3.1'})`
                : `External Worker (v${health?.scrapling_version ?? '0.3.1'})`
              : isArabic
              ? 'غير متصل'
              : 'Offline'}
          </span>
        </div>

        {/* Engine availability */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'المحركات:' : 'Engines:'}
          </span>
          <span className="font-mono text-[11px] text-[#0f141b] dark:text-[#e8ecf2]">
            auto · http
            <span className={available?.dynamic ? 'text-[#1f8a3b] dark:text-[#3fb950]' : 'text-[#8b95a7] opacity-60'}>
              {' '}· dynamic{available && !available.dynamic ? ' (off)' : ''}
            </span>
            <span className={available?.stealth ? 'text-[#1f8a3b] dark:text-[#3fb950]' : 'text-[#8b95a7] opacity-60'}>
              {' '}· stealth{available && !available.stealth ? ' (off)' : ''}
            </span>
          </span>
        </div>

        {/* Quota Chips */}
        {quotas && (
          <div className="flex items-center gap-2">
            <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'الحصص المتبقية:' : 'Quotas:'}
            </span>
            <span className="inline-flex items-center gap-2 font-mono text-[11px]">
              <span className="rounded bg-[#eaeef3] dark:bg-[#171c25] px-1.5 py-0.5 text-[#0f141b] dark:text-[#e8ecf2]">
                {isArabic ? `التخفي: ${stealthRemaining}/${quotas.stealth_month_cap}` : `Stealth: ${stealthRemaining}/${quotas.stealth_month_cap}`}
              </span>
              <span className="rounded bg-[#eaeef3] dark:bg-[#171c25] px-1.5 py-0.5 text-[#0f141b] dark:text-[#e8ecf2]">
                {isArabic ? `المتصفح: ${browserSecondsRemaining}ث/${quotas.browser_seconds_cap}ث` : `Browser: ${browserSecondsRemaining}s/${quotas.browser_seconds_cap}s`}
              </span>
            </span>
          </div>
        )}

        {/* Robots */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'ملف الروبوتات:' : 'Robots.txt:'}
          </span>
          <span
            className={`font-mono text-[11px] ${
              robotsObey
                ? 'text-[#1f8a3b] dark:text-[#3fb950]'
                : 'text-[#a86a00] dark:text-[#d29922]'
            }`}
          >
            {robotsObey ? (isArabic ? 'التزام تلقائي' : 'Obey (ON)') : isArabic ? 'تجاوز' : 'Bypass'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
          control_plane: helix-ai
        </span>
      </div>
    </div>
  )
}
