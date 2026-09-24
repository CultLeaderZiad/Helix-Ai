'use client'

import React from 'react'

interface ExportBarProps {
  onExportCsv: () => void
  onExportJsonl: () => void
  leadCount: number
  disabled?: boolean
  isArabic?: boolean
}

export function ExportBar({
  onExportCsv,
  onExportJsonl,
  leadCount,
  disabled = false,
  isArabic = false,
}: ExportBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] px-4 py-2.5">
      <div className="text-xs text-[#5b6577] dark:text-[#8b95a7]">
        <span className="font-semibold text-[#0f141b] dark:text-[#e8ecf2]">{leadCount}</span>{' '}
        {isArabic ? 'جهات اتصال موثقة جاهزة للتصدير' : 'verified leads available for export'}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled || leadCount === 0}
          onClick={onExportCsv}
          className="rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-1.5 text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2] hover:bg-[#eaeef3] dark:hover:bg-[#171c25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isArabic ? 'تصدير CSV (مع المصادر)' : 'Export CSV (Provenance)'}
        </button>

        <button
          type="button"
          disabled={disabled || leadCount === 0}
          onClick={onExportJsonl}
          className="rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-1.5 text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2] hover:bg-[#eaeef3] dark:hover:bg-[#171c25] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isArabic ? 'تصدير JSONL' : 'Export JSONL'}
        </button>
      </div>
    </div>
  )
}
