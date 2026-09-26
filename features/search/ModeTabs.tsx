'use client'

import React from 'react'

export type SearchMode = 'everything' | 'businesses' | 'web' | 'social' | 'news'

interface ModeTabsProps {
  activeMode: SearchMode
  onChange: (mode: SearchMode) => void
  isArabic?: boolean
}

export function ModeTabs({ activeMode, onChange, isArabic }: ModeTabsProps) {
  const tabs: Array<{ id: SearchMode; labelEn: string; labelAr: string }> = [
    { id: 'everything', labelEn: 'Everything', labelAr: 'الكل' },
    { id: 'businesses', labelEn: 'Businesses', labelAr: 'الشركات' },
    { id: 'web', labelEn: 'Web', labelAr: 'الويب' },
    { id: 'social', labelEn: 'Social profiles', labelAr: 'حسابات التواصل' },
    { id: 'news', labelEn: 'News', labelAr: 'الأخبار' }
  ]

  return (
    <div className="flex border-b border-border mb-4 overflow-x-auto">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`px-3 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeMode === tab.id
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          {isArabic ? tab.labelAr : tab.labelEn}
        </button>
      ))}
    </div>
  )
}
