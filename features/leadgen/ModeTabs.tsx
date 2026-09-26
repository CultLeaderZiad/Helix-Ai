'use client'

import React from 'react'

export type LeadGenModeTab = 'enrich' | 'find'

interface ModeTabsProps {
  activeTab: LeadGenModeTab
  onChange: (tab: LeadGenModeTab) => void
  isArabic?: boolean
}

export function ModeTabs({ activeTab, onChange, isArabic }: ModeTabsProps) {
  return (
    <div className="flex border-b border-border mb-6">
      <button
        type="button"
        onClick={() => onChange('enrich')}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'enrich'
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        {isArabic ? 'إثراء رابط' : 'Enrich a URL'}
      </button>
      <button
        type="button"
        onClick={() => onChange('find')}
        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
          activeTab === 'find'
            ? 'border-foreground text-foreground'
            : 'border-transparent text-muted-foreground hover:text-foreground'
        }`}
      >
        {isArabic ? 'البحث عن عملاء' : 'Find leads'}
      </button>
    </div>
  )
}
