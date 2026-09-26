'use client'

import React from 'react'

interface EmptyStateProps {
  type: 'no_jobs' | 'worker_offline' | 'no_leads' | 'running_empty'
  isArabic?: boolean
  onAction?: () => void
  actionLabel?: string
}

export function EmptyState({ type, isArabic = false, onAction, actionLabel }: EmptyStateProps) {
  if (type === 'worker_offline') {
    return (
      <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-8 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#a86a00]/10 dark:bg-[#d29922]/15 text-[#a86a00] dark:text-[#d29922] font-mono text-sm">
          !
        </div>
        <h3>
          {isArabic ? 'البحث غير متاح حالياً' : 'Lead search is unavailable right now'}
        </h3>
        <p className="muted">
          {isArabic
            ? 'تم حفظ المهمة وستُعاد المحاولة. حاول بعد قليل.'
            : 'Your job is saved. Try again in a few minutes.'}
        </p>
      </div>
    )
  }

  if (type === 'no_jobs') {
    return (
      <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-10 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15 text-[#0e8da6] dark:text-[#38c6e0] font-mono text-sm">
          #
        </div>
        <h3>
          {isArabic ? 'لا توجد مهام بعد' : 'No jobs yet'}
        </h3>
        <p className="muted">
          {isArabic
            ? 'ابدأ بالبحث عن أنشطة في مدينة ما، أو أثرِ قائمة لديك.'
            : 'Start by finding businesses in a city, or enrich a list you already have.'}
        </p>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 rounded-md bg-[#0f141b] dark:bg-[#e8ecf2] px-4 py-2 text-xs font-semibold text-[#f4f6f9] dark:text-[#0b0e13] hover:opacity-90 transition-opacity"
          >
            {actionLabel ?? (isArabic ? 'مهمة جديدة' : 'New job')}
          </button>
        )}
      </div>
    )
  }

  if (type === 'no_leads') {
    return (
      <div className="rounded-xl border border-dashed border-[#d9dee6] dark:border-white/10 p-8 text-center">
        <h4>
          {isArabic ? 'لا توجد نتائج مطابقة' : 'No businesses matched'}
        </h4>
        <p className="muted">
          {isArabic
            ? 'جرّب نوع نشاط أعم أو مدينة قريبة. الحقول غير الموجودة تبقى فارغة.'
            : 'Try a broader type or a nearby city. Missing fields stay empty.'}
        </p>
      </div>
    )
  }

  // running_empty
  return (
    <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-6 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-[#0e8da6] border-t-transparent dark:border-[#38c6e0] dark:border-t-transparent" />
      <h4>{isArabic ? 'المهمة قيد التنفيذ' : 'This job is running'}</h4>
      <p className="muted">
        {isArabic ? 'أبقِ هذه الصفحة مفتوحة حتى يكتمل الحفظ.' : 'Keep this page open until saving finishes.'}
      </p>
    </div>
  )
}
