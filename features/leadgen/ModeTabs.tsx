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
    <div className="tabs" role="tablist">
      <button type="button" role="tab" aria-selected={activeTab === 'find'} className={activeTab === 'find' ? 'on' : undefined} onClick={() => onChange('find')}>
        {isArabic ? 'البحث عن عملاء' : 'Find leads'}
      </button>
      <button type="button" role="tab" aria-selected={activeTab === 'enrich'} className={activeTab === 'enrich' ? 'on' : undefined} onClick={() => onChange('enrich')}>
        {isArabic ? 'إثراء المواقع' : 'Enrich websites'}
      </button>
    </div>
  )
}
