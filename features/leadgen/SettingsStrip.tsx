'use client'

import type { WorkerHealthResponse } from '@/lib/leadgen/types'

interface SettingsStripProps {
  health: WorkerHealthResponse | null
  isArabic?: boolean
}

export function SettingsStrip({ health, isArabic = false }: SettingsStripProps) {
  const isOnline = health?.worker === 'online'
  const proxyConfigured = health?.proxy === 'configured'
  const robotsObey = health?.robots_default ?? true

  return (
    <div
      role="region"
      aria-label={isArabic ? 'حالة محرك الاستخراج' : 'Extraction Engine Status'}
      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] px-4 py-2.5 text-xs text-[#5b6577] dark:text-[#8b95a7]"
    >
      <div className="flex flex-wrap items-center gap-4">
        {/* Worker health */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'المشغل الآلي:' : 'Scrapling Worker:'}
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
              ? isArabic
                ? `متصل (إصدار ${health?.scrapling_version ?? '0.3.1'})`
                : `Online (v${health?.scrapling_version ?? '0.3.1'})`
              : isArabic
              ? 'غير متصل (المشغل المستقل)'
              : 'Offline (Docker worker)'}
          </span>
        </div>

        {/* Engine mode */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'المحركات:' : 'Engines:'}
          </span>
          <span className="font-mono text-[11px] text-[#0f141b] dark:text-[#e8ecf2]">
            http · stealth (default) · dynamic
          </span>
        </div>

        {/* Proxy */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'البروكسي:' : 'Proxy Rotator:'}
          </span>
          <span
            className={`font-mono text-[11px] ${
              proxyConfigured
                ? 'text-[#1f8a3b] dark:text-[#3fb950]'
                : 'text-[#5b6577] dark:text-[#8b95a7]'
            }`}
          >
            {proxyConfigured ? (isArabic ? 'مفعّل' : 'Configured') : isArabic ? 'معطّل' : 'Off'}
          </span>
        </div>

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
            {robotsObey ? (isArabic ? 'التزام تلقائي (مفعّل)' : 'Obey (default ON)') : isArabic ? 'تجاوز' : 'Bypass'}
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
