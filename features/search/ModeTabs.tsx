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
    <div className="tabs" role="tablist">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeMode === tab.id}
          onClick={() => onChange(tab.id)}
          className={activeMode === tab.id ? 'on' : undefined}
        >
          {isArabic ? tab.labelAr : tab.labelEn}
        </button>
      ))}
    </div>
  )
}
