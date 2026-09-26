'use client'

import React from 'react'
import { NormalizedSearchResult } from '@/lib/search/normalize'

interface ResultCardProps {
  result: NormalizedSearchResult
  onEnrich?: (url: string) => void
  onSave?: (result: NormalizedSearchResult) => void
  onWatch?: (result: NormalizedSearchResult) => void
  isEnriching?: boolean
  isSaved?: boolean
  isArabic?: boolean
}

export function ResultCard({
  result,
  onEnrich,
  onSave,
  onWatch,
  isEnriching,
  isSaved,
  isArabic
}: ResultCardProps) {
  const payload = result.payload || {}
  const phone = payload.phone
  const city = payload.city
  const country = payload.country
  const address = payload.address

  // TODO(scout-handoff): Send verified business payload {domain, company, socials, country} to Scout via webhook

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-2.5 transition-colors hover:border-foreground/20">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-foreground">
              {result.title}
            </h3>
            {result.in_leads && (
              <span className="inline-block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                {isArabic ? 'موجود في عملائك' : 'Already in leads'}
              </span>
            )}
            <span className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground uppercase">
              {result.result_type.replace('_', ' ')}
            </span>
          </div>

          {result.url && (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block font-mono text-xs text-primary hover:underline truncate max-w-lg"
              dir="ltr"
            >
              {result.domain || result.url}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {result.url && onEnrich && (
            <button
              type="button"
              disabled={isEnriching}
              onClick={() => onEnrich(result.url!)}
              className="rounded border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {isEnriching ? (isArabic ? 'جاري الإثراء...' : 'Enriching...') : (isArabic ? 'إثراء' : 'Enrich')}
            </button>
          )}

          {onSave && (
            <button
              type="button"
              disabled={isSaved}
              onClick={() => onSave(result)}
              className="rounded border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
            >
              {isSaved ? (isArabic ? 'تم الحفظ' : 'Saved') : (isArabic ? 'حفظ' : 'Save')}
            </button>
          )}

          {onWatch && (
            <button
              type="button"
              onClick={() => onWatch(result)}
              className="rounded border border-input bg-background px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted transition-colors"
            >
              {isArabic ? 'مراقبة' : 'Watch'}
            </button>
          )}
        </div>
      </div>

      {result.snippet && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {result.snippet}
        </p>
      )}

      {/* Meta Row: Phone, Location, Sources */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground pt-1 border-t border-border/40">
        {(city || country) && (
          <span>
            {[city, country].filter(Boolean).join(', ')}
          </span>
        )}

        {phone && (
          <span dir="ltr" className="font-mono">
            {phone}
          </span>
        )}

        <div className="ms-auto flex items-center gap-1">
          <span>{isArabic ? 'المصادر:' : 'Sources:'}</span>
          {result.sources.map(s => (
            <span key={s} className="font-mono text-[10px] text-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
