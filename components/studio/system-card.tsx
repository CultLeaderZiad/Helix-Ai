'use client'

import Link from 'next/link'
import { Pill } from '@/components/ui/helix'
import { buttonVariants } from '@/components/ui/button'
import {
  SYSTEM_TEMPLATES,
  formatCatalogPrice,
  type SystemTemplate,
} from '@/lib/studio/templates'
import { cn } from '@/lib/utils'
import { RequestBuildButton } from '@/components/studio/request-build-button'
import { useConsoleLanguage } from '@/components/shell/console-language'

function highlightLabel(template: SystemTemplate, isAr: boolean) {
  if (template.highlight === 'most_booked') return isAr ? 'الأكثر حجزاً' : 'Most booked'
  if (template.highlight === 'highest_roi') return isAr ? 'أعلى عائد' : 'Highest ROI'
  if (template.highlight === 'b2b_only') return isAr ? 'شركات فقط' : 'B2B only'
  return null
}

export function SystemCard({
  template,
  language,
  demoHref,
  guideHref,
  brandName,
  className,
  onDemo,
}: {
  template: SystemTemplate
  language?: 'en' | 'ar'
  demoHref?: string
  guideHref?: string
  brandName?: string
  className?: string
  onDemo?: () => void
}) {
  const consoleLanguage = useConsoleLanguage()
  const resolvedLanguage = language ?? consoleLanguage.language
  const isAr = resolvedLanguage === 'ar'
  const content = template[resolvedLanguage]
  const highlight = highlightLabel(template, isAr)
  const demo = demoHref ?? `/dashboard/studio?system=${template.id}`
  const guide = guideHref ?? `/dashboard/studio/guides/${template.id}`

  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-[16px] border border-helix-border bg-helix-surface p-5',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-1.5">
        <Pill tone={template.lane === 'core' ? 'core' : 'preview'}>
          {template.lane === 'core' ? (isAr ? 'أساسي' : 'Core') : isAr ? 'معاينة' : 'Preview'}
        </Pill>
        {highlight ? (
          <Pill tone={template.highlight === 'b2b_only' ? 'warn' : 'live'}>{highlight}</Pill>
        ) : null}
      </div>

      <h3 className="mt-3 helix-title text-15">{content.name}</h3>
      <p className="mt-1.5 flex-1 text-13 leading-relaxed text-helix-muted">{content.description}</p>

      <p className="mt-4 text-13 font-medium text-helix-ink">{formatCatalogPrice(template)}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {onDemo ? (
          <button type="button" onClick={onDemo} className={buttonVariants({ size: 'sm' })}>
            {isAr ? 'جرّب العرض' : 'Try demo'}
          </button>
        ) : (
          <Link href={demo} className={buttonVariants({ size: 'sm' })}>
            {isAr ? 'جرّب العرض' : 'Try demo'}
          </Link>
        )}
        <Link
          href={guide}
          className={buttonVariants({ variant: 'secondary', size: 'sm' })}
        >
          {isAr ? 'الدليل' : 'Guide'}
        </Link>
        <RequestBuildButton
          templateId={template.id}
          brandName={brandName}
          language={resolvedLanguage}
        />
      </div>
    </article>
  )
}

export function SystemCatalogGrid({
  language,
  templates = SYSTEM_TEMPLATES,
  brandName,
}: {
  language?: 'en' | 'ar'
  templates?: SystemTemplate[]
  brandName?: string
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {templates.map(template => (
        <SystemCard key={template.id} template={template} language={language} brandName={brandName} />
      ))}
    </div>
  )
}
