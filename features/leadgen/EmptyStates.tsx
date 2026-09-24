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
        <h3 className="font-display text-base font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'محرك استخراج العملاء غير متصل' : 'Lead Engine Offline'}
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-[#5b6577] dark:text-[#8b95a7] leading-relaxed">
          {isArabic
            ? 'لم يتم تفعيل محرك الاستخراج الداخلي أو ربط مشغل مستقل. لتشغيل المحرك الداخلي مباشرة على Vercel، أضف المتغير LEADGEN_BUILTIN_ENGINE=true في إعدادات البيئة.'
            : 'Neither the built-in TypeScript engine nor an external Scrapling worker is online. To enable the built-in engine on Vercel Hobby, set LEADGEN_BUILTIN_ENGINE=true in environment variables.'}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded bg-[#eaeef3] dark:bg-[#171c25] px-3 py-1 font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
          <code>LEADGEN_BUILTIN_ENGINE=true</code>
        </div>
      </div>
    )
  }

  if (type === 'no_jobs') {
    return (
      <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-10 text-center">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15 text-[#0e8da6] dark:text-[#38c6e0] font-mono text-sm">
          #
        </div>
        <h3 className="font-display text-base font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'لا توجد مهام استخراج سابقة' : 'No Lead Generation Jobs Yet'}
        </h3>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-[#5b6577] dark:text-[#8b95a7] leading-relaxed">
          {isArabic
            ? 'ابدأ مهمة استخراج جديدة بتحديد مواصفات العميل المستهدف وقائمة الروابط أو المتاجر. سيقوم المحرك باستخراج جهات الاتصال العامة وتوثيق مصدر كل حقل بدقة.'
            : 'Configure an Ideal Customer Profile (ICP) brief and provide seed URLs, sitemaps, or a Shopify brand domain to discover verified business leads.'}
        </p>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="mt-4 rounded-md bg-[#0f141b] dark:bg-[#e8ecf2] px-4 py-2 text-xs font-semibold text-[#f4f6f9] dark:text-[#0b0e13] hover:opacity-90 transition-opacity"
          >
            {actionLabel ?? (isArabic ? 'إنشاء مهمة جديدة' : 'New Acquisition Job')}
          </button>
        )}
      </div>
    )
  }

  if (type === 'no_leads') {
    return (
      <div className="rounded-xl border border-dashed border-[#d9dee6] dark:border-white/10 p-8 text-center">
        <h4 className="font-display text-sm font-medium text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'لم يتم استخراج جهات اتصال بعد' : 'No Leads Extracted Yet'}
        </h4>
        <p className="mx-auto mt-1 max-w-sm text-xs text-[#5b6577] dark:text-[#8b95a7]">
          {isArabic
            ? 'تلتزم المنصة بعدم اختلاق أي بيانات. في حال كانت الصفحات عامة ولا تحتوي على بريد أو هاتف متاح، فستظهر النتيجة فارغة مع توثيق حالة الفحص.'
            : 'Zero fabrication guarantee: If target domains do not expose public contact points, leads remain empty. Review job logs for fetch and selector status.'}
        </p>
      </div>
    )
  }

  // running_empty
  return (
    <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-6 text-center">
      <div className="mx-auto mb-2 flex h-8 w-8 animate-spin items-center justify-center rounded-full border-2 border-[#0e8da6] border-t-transparent dark:border-[#38c6e0] dark:border-t-transparent" />
      <h4 className="font-display text-xs font-medium text-[#0f141b] dark:text-[#e8ecf2]">
        {isArabic ? 'المشغل الآلي قيد التنفيذ...' : 'Engine Actively Processing Pages...'}
      </h4>
      <p className="mt-1 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
        {isArabic
          ? 'يتم زحف الصفحات واستخراج الحقول مع الالتزام بمعدلات الطلبات المسموحة. أبقِ هذه الصفحة مفتوحة لمواصلة المعالجة.'
          : 'Pages are being fetched, throttled, and parsed. Keep this tab open to drive execution ticks.'}
      </p>
    </div>
  )
}
