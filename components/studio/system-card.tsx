'use client'

import Link from 'next/link'
import {
  SYSTEM_TEMPLATES,
  formatCatalogPrice,
  type SystemTemplate,
} from '@/lib/studio/templates'
import { cn } from '@/lib/utils'
import { PlugZap, ArrowUpRight } from 'lucide-react'

function highlightLabel(template: SystemTemplate, isAr: boolean) {
  if (template.highlight === 'most_booked') return isAr ? 'الأكثر حجزاً' : 'Most booked'
  if (template.highlight === 'highest_roi') return isAr ? 'أعلى عائد' : 'Highest ROI'
  if (template.highlight === 'b2b_only') return isAr ? 'شركات فقط' : 'B2B only'
  return null
}

export function SystemCard({
  template,
  language = 'en',
  demoHref,
  guideHref,
  isAdmin = false,
  className,
}: {
  template: SystemTemplate
  language?: 'en' | 'ar'
  demoHref?: string
  guideHref?: string
  isAdmin?: boolean
  className?: string
}) {
  const isAr = language === 'ar'
  const content = template[language]
  const highlight = highlightLabel(template, isAr)
  const demo = demoHref ?? `/dashboard/studio?system=${template.id}`
  const guide = guideHref ?? `/dashboard/studio/guides/${template.id}`

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs transition-all hover:border-[#141414]/40 hover:shadow-xs',
        className
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              'rounded-[6px] px-2 py-0.5 text-[11px] font-medium tracking-wide uppercase',
              template.lane === 'core'
                ? 'bg-[#141414] text-white'
                : template.lane === 'add_on'
                ? 'border border-[#D9D4CB] bg-[#F7F5F0] text-[#141414]'
                : 'border border-dashed border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65]'
            )}
          >
            {template.lane === 'core'
              ? isAr
                ? 'أساسي'
                : 'Core System'
              : template.lane === 'add_on'
              ? isAr
                ? 'إضافة'
                : 'Add-on Pack'
              : isAr
              ? 'معاينة'
              : 'Preview'}
          </span>
          {highlight ? (
            <span
              className={cn(
                'rounded-[6px] px-2 py-0.5 text-[11px] font-semibold',
                template.highlight === 'b2b_only'
                  ? 'border border-amber-300 bg-amber-50 text-amber-900'
                  : 'bg-[#0B6E4F]/10 text-[#0B6E4F]'
              )}
            >
              {highlight}
            </span>
          ) : null}
        </div>

        <span className="text-[10px] font-mono text-[#9E9B95]">
          {template.systemTypeKey}
        </span>
      </div>

      <h3 className="mt-3 text-15 font-bold text-[#141414]">{content.name}</h3>
      <p className="mt-1.5 flex-1 text-13 leading-relaxed text-[#4A4844]">{content.description}</p>

      <p className="mt-4 text-13 font-semibold text-[#141414]">{formatCatalogPrice(template)}</p>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#D9D4CB]/60 pt-3">
        <div className="flex items-center gap-2">
          <Link
            href={demo}
            className="inline-flex items-center justify-center rounded-[8px] bg-[#141414] px-3 py-1.5 text-12 font-medium text-white transition-colors hover:bg-black"
          >
            {isAr ? 'جرّب العرض' : 'Try demo'}
          </Link>
          <Link
            href={guide}
            className="inline-flex items-center justify-center rounded-[8px] border border-[#D9D4CB] bg-[#FFFEFA] px-3 py-1.5 text-12 font-medium text-[#141414] transition-colors hover:bg-[#F3F1EC]"
          >
            {isAr ? 'الدليل' : 'Guide'}
          </Link>
        </div>

        <Link
          href={`/admin/webhooks?system=${template.systemTypeKey}`}
          className="inline-flex items-center gap-1 rounded-[6px] px-2 py-1 text-[11px] font-medium text-[#6E6B65] hover:bg-[#F3F1EC] hover:text-[#141414] transition-colors"
          title="Configure n8n Production Webhook"
        >
          <PlugZap className="size-3 text-[#0B6E4F]" />
          <span>{isAr ? 'تهيئة الويب هوك' : 'Configure webhooks'}</span>
          <ArrowUpRight className="size-2.5" />
        </Link>
      </div>
    </article>
  )
}

export function SystemCatalogGrid({
  language = 'en',
  templates = SYSTEM_TEMPLATES,
  isAdmin = true,
}: {
  language?: 'en' | 'ar'
  templates?: SystemTemplate[]
  isAdmin?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map(template => (
        <SystemCard key={template.id} template={template} language={language} isAdmin={isAdmin} />
      ))}
    </div>
  )
}
