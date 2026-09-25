'use client'

import React from 'react'
import { ProviderAvailability } from '@/lib/search/places/types'

interface ProviderStatusProps {
  providers: ProviderAvailability[]
  isArabic?: boolean
}

export function ProviderStatus({ providers, isArabic }: ProviderStatusProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground py-2 border-b border-border/60">
      {providers.map(p => {
        const isAvail = p.available
        const name = p.id.replace(/_/g, ' ')
        const tooltip = !isAvail ? (isArabic ? p.reason_ar : p.reason_en) : (isArabic ? p.note_ar : p.note_en)

        return (
          <span
            key={p.id}
            title={tooltip || undefined}
            className="flex items-center gap-1.5 cursor-help select-none"
          >
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                isAvail ? 'bg-emerald-500' : 'bg-muted-foreground/30'
              }`}
            />
            <span className={isAvail ? 'text-foreground' : 'text-muted-foreground/70'}>
              {name}
            </span>
            {!isAvail && p.env && p.env.length > 0 && (
              <span className="text-[10px] font-mono text-muted-foreground/60">
                ({p.env[0]})
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
