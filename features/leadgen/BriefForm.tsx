'use client'

import React from 'react'
import type { LeadGenBrief } from '@/lib/leadgen/types'

interface BriefFormProps {
  brief: LeadGenBrief
  onChange: (updated: LeadGenBrief) => void
  isArabic?: boolean
  disabled?: boolean
}

const AVAILABLE_GEOS = [
  { code: 'SA', label: 'Saudi Arabia (SA)', labelAr: 'المملكة العربية السعودية' },
  { code: 'AE', label: 'United Arab Emirates (AE)', labelAr: 'الإمارات العربية المتحدة' },
  { code: 'JO', label: 'Jordan (JO)', labelAr: 'الأردن' },
  { code: 'EG', label: 'Egypt (EG)', labelAr: 'مصر' },
  { code: 'QA', label: 'Qatar (QA)', labelAr: 'قطر' },
  { code: 'KW', label: 'Kuwait (KW)', labelAr: 'الكويت' },
  { code: 'BH', label: 'Bahrain (BH)', labelAr: 'البحرين' },
  { code: 'OM', label: 'Oman (OM)', labelAr: 'عُمان' },
]

export function BriefForm({ brief, onChange, isArabic = false, disabled = false }: BriefFormProps) {
  const toggleGeo = (geoCode: string) => {
    const exists = brief.geos.includes(geoCode)
    const nextGeos = exists
      ? brief.geos.filter(g => g !== geoCode)
      : [...brief.geos, geoCode]
    onChange({ ...brief, geos: nextGeos })
  }

  const toggleLang = (lang: string) => {
    const exists = brief.languages.includes(lang)
    const nextLangs = exists
      ? brief.languages.filter(l => l !== lang)
      : [...brief.languages, lang]
    onChange({ ...brief, languages: nextLangs })
  }

  return (
    <div className="space-y-4">
      {/* ICP Brief */}
      <div>
        <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'وصف العميل المثالي (ICP Brief) *' : 'Ideal Customer Profile (ICP Brief) *'}
        </label>
        <p className="mt-0.5 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
          {isArabic
            ? 'حدد معايير النشاط المستهدف، الحجم، والصناعة لتوجيه خوارزمية التقييم والتنقيب.'
            : 'Describe your target company type, industry vertical, and role priorities for score calculation.'}
        </p>
        <textarea
          rows={3}
          disabled={disabled}
          value={brief.icp}
          onChange={e => onChange({ ...brief, icp: e.target.value })}
          placeholder={
            isArabic
              ? 'مثال: شركات مقاولات رئيسية في الرياض وجدة، تنفذ مشاريع تجارية وسكنية كبرى...'
              : 'e.g., Commercial construction main contractors in Riyadh & Dubai, active in enterprise developments...'
          }
          className="mt-1.5 w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 text-xs text-[#0f141b] dark:text-[#e8ecf2] placeholder-[#8b95a7] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
        />
      </div>

      {/* Target Geos */}
      <div>
        <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'الدول والأسواق المستهدفة' : 'Target Geographic Markets'}
        </label>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {AVAILABLE_GEOS.map(geo => {
            const selected = brief.geos.includes(geo.code)
            return (
              <button
                key={geo.code}
                type="button"
                disabled={disabled}
                onClick={() => toggleGeo(geo.code)}
                className={`rounded border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  selected
                    ? 'border-[#0e8da6] dark:border-[#38c6e0] bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15 text-[#0e8da6] dark:text-[#38c6e0]'
                    : 'border-[#d9dee6] dark:border-white/10 bg-[#eaeef3] dark:bg-[#171c25] text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
                }`}
              >
                {isArabic ? geo.labelAr : geo.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Languages */}
      <div>
        <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'اللغات المطلوبة' : 'Target Content Languages'}
        </label>
        <div className="mt-1.5 flex gap-2">
          {['ar', 'en'].map(lang => {
            const selected = brief.languages.includes(lang)
            return (
              <button
                key={lang}
                type="button"
                disabled={disabled}
                onClick={() => toggleLang(lang)}
                className={`rounded border px-3 py-1 text-xs font-medium ${
                  selected
                    ? 'border-[#0e8da6] dark:border-[#38c6e0] bg-[#0e8da6]/10 dark:bg-[#38c6e0]/15 text-[#0e8da6] dark:text-[#38c6e0]'
                    : 'border-[#d9dee6] dark:border-white/10 text-[#5b6577] dark:text-[#8b95a7]'
                }`}
              >
                {lang === 'ar' ? (isArabic ? 'العربية (Arabic)' : 'Arabic (AR)') : isArabic ? 'الإنجليزية (English)' : 'English (EN)'}
              </button>
            )
          })}
        </div>
      </div>

      {/* Numerical budgets & limits */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic ? 'الحد الأقصى للصفحات' : 'Max Pages Crawled'}
          </label>
          <input
            type="number"
            min={5}
            max={500}
            disabled={disabled}
            value={brief.max_pages}
            onChange={e => onChange({ ...brief, max_pages: parseInt(e.target.value, 10) || 10 })}
            className="mt-1 w-full rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1.5 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic ? 'الحد الأقصى للعملاء' : 'Max Leads Extracted'}
          </label>
          <input
            type="number"
            min={1}
            max={250}
            disabled={disabled}
            value={brief.max_leads}
            onChange={e => onChange({ ...brief, max_leads: parseInt(e.target.value, 10) || 10 })}
            className="mt-1 w-full rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1.5 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic ? 'ميزانية الرصيد' : 'Credit Budget'}
          </label>
          <input
            type="number"
            min={5}
            max={500}
            disabled={disabled}
            value={brief.credit_budget}
            onChange={e => onChange({ ...brief, credit_budget: parseFloat(e.target.value) || 20 })}
            className="mt-1 w-full rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1.5 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic ? 'أدنى درجة للمسودة' : 'Min Outreach Score'}
          </label>
          <input
            type="number"
            min={0}
            max={100}
            disabled={disabled}
            value={brief.outreach_min_score}
            onChange={e => onChange({ ...brief, outreach_min_score: parseInt(e.target.value, 10) || 50 })}
            className="mt-1 w-full rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1.5 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
        </div>
      </div>
    </div>
  )
}
