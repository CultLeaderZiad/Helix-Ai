'use client'

import React from 'react'
import type { LeadGenEngine, LeadGenMode } from '@/lib/leadgen/types'

interface EnginePickerProps {
  engine: LeadGenEngine
  mode: LeadGenMode
  adaptive: boolean
  robotsObey: boolean
  enrichEmails: boolean
  generateOutreach: boolean
  enginesAvailable?: { http: boolean; dynamic: boolean; stealth: boolean }
  onChange: (updated: {
    engine?: LeadGenEngine
    mode?: LeadGenMode
    adaptive?: boolean
    robotsObey?: boolean
    enrichEmails?: boolean
    generateOutreach?: boolean
  }) => void
  isArabic?: boolean
  disabled?: boolean
}

export function EnginePicker({
  engine,
  mode,
  adaptive,
  robotsObey,
  enrichEmails,
  generateOutreach,
  enginesAvailable = { http: true, dynamic: true, stealth: true },
  onChange,
  isArabic = false,
  disabled = false,
}: EnginePickerProps) {
  const engineOptions: Array<{
    id: LeadGenEngine
    label: string
    labelAr: string
    desc: string
    descAr: string
    isAvailable: boolean
    disabledReason?: string
    disabledReasonAr?: string
  }> = [
    {
      id: 'auto',
      label: 'Auto Escalation',
      labelAr: 'تصعيد تلقائي (موصى به)',
      desc: 'HTTP → Dynamic → Stealth',
      descAr: 'HTTP ثم ديناميكي ثم تخفي حسب الحاجة',
      isAvailable: true,
    },
    {
      id: 'http',
      label: 'HTTP Fast',
      labelAr: 'HTTP قياسي سريع',
      desc: 'Native fetch · TLS',
      descAr: 'جلب أصلي سريع للصفحات الثابتة',
      isAvailable: enginesAvailable.http,
    },
    {
      id: 'dynamic',
      label: 'Dynamic JS',
      labelAr: 'متصفح ديناميكي JS',
      desc: 'Cloudflare /content (bot-identified)',
      descAr: 'Cloudflare Browser Run (غير خفي)',
      isAvailable: enginesAvailable.dynamic,
      disabledReason: 'Dynamic unavailable — set CF_ACCOUNT_ID + CF_BROWSER_TOKEN on the server.',
      disabledReasonAr: 'المحرك الديناميكي غير متاح — يرجى ضبط CF_ACCOUNT_ID و CF_BROWSER_TOKEN على الخادم.',
    },
    {
      id: 'stealth',
      label: 'Stealthy',
      labelAr: 'تخفي تام',
      desc: 'Bright Data Web Unlocker',
      descAr: 'Bright Data Web Unlocker لتجاوز الحظر',
      isAvailable: enginesAvailable.stealth,
      disabledReason: 'Stealth unavailable — set BRIGHTDATA_API_TOKEN on the server.',
      disabledReasonAr: 'محرك التخفي غير متاح — يرجى ضبط BRIGHTDATA_API_TOKEN على الخادم.',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Engine Default */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'محرك الاستخراج (Extraction Engine)' : 'Extraction Engine & Tier'}
          </label>
          <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {engineOptions.map(item => {
              const isOptionDisabled = disabled || !item.isAvailable
              const isSelected = engine === item.id

              return (
                <div key={item.id} className="relative">
                  <button
                    type="button"
                    disabled={isOptionDisabled}
                    onClick={() => onChange({ engine: item.id })}
                    title={!item.isAvailable ? (isArabic ? item.disabledReasonAr : item.disabledReason) : undefined}
                    className={`w-full rounded-md border p-2 text-left transition-colors ${
                      isSelected
                        ? 'border-[#0f141b] dark:border-[#e8ecf2] bg-[#0f141b] dark:bg-[#e8ecf2] text-white dark:text-[#0b0e13]'
                        : item.isAvailable
                        ? 'border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] text-[#0f141b] dark:text-[#e8ecf2] hover:border-[#0e8da6] dark:hover:border-[#38c6e0]'
                        : 'border-[#d9dee6]/60 dark:border-white/5 bg-[#eaeef3]/40 dark:bg-[#171c25]/40 text-[#8b95a7] cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{isArabic ? item.labelAr : item.label}</span>
                      {!item.isAvailable && (
                        <span className="text-[10px] font-mono text-[#c62f2a] dark:text-[#f85149]">
                          {isArabic ? 'معطل' : 'Off'}
                        </span>
                      )}
                    </div>
                    <div className={`mt-0.5 text-[10px] font-mono ${isSelected ? 'opacity-85' : 'text-[#5b6577] dark:text-[#8b95a7]'}`}>
                      {isArabic ? item.descAr : item.desc}
                    </div>
                  </button>
                  {!item.isAvailable && (
                    <p className="mt-1 text-[10px] text-[#c62f2a] dark:text-[#f85149] leading-tight">
                      {isArabic ? item.disabledReasonAr : item.disabledReason}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Crawl Mode */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'نمط الاستكشاف (Discovery Spider Mode)' : 'Discovery Spider Mode'}
          </label>
          <select
            disabled={disabled}
            value={mode}
            onChange={e => onChange({ mode: e.target.value as LeadGenMode })}
            className="mt-1.5 w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 text-xs font-medium text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          >
            <option value="crawl">crawl (CrawlSpider · follow internal links)</option>
            <option value="sitemap">sitemap (SitemapSpider · XML feed parsing)</option>
            <option value="shopify">shopify (ShopifySpider · store heuristic)</option>
            <option value="digest">digest (SiteToMarkdownSpider · digest)</option>
            <option value="csv_feed">csv_feed (CSVFeedSpider · batch domain rows)</option>
          </select>
        </div>
      </div>

      {/* Feature Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Adaptive Relocate */}
        <label className="flex items-start gap-2.5 rounded-lg border border-[#d9dee6] dark:border-white/10 p-2.5 cursor-pointer hover:bg-[#eaeef3]/50 dark:hover:bg-[#171c25]/50 transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={adaptive}
            onChange={e => onChange({ adaptive: e.target.checked })}
            className="mt-0.5 rounded border-[#cfd6df] text-[#0e8da6] focus:ring-[#0e8da6]"
          />
          <div>
            <div className="text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'محددات متكيفة (Adaptive Selectors)' : 'Adaptive Selectors'}
            </div>
            <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic
                ? 'إعادة التموضع الذاتي للمحددات عند تغير هيكل صفحات الهدف.'
                : 'Automatically recovers selectors if page markup shifts.'}
            </div>
          </div>
        </label>

        {/* Robots Obey */}
        <label className="flex items-start gap-2.5 rounded-lg border border-[#d9dee6] dark:border-white/10 p-2.5 cursor-pointer hover:bg-[#eaeef3]/50 dark:hover:bg-[#171c25]/50 transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={robotsObey}
            onChange={e => onChange({ robotsObey: e.target.checked })}
            className="mt-0.5 rounded border-[#cfd6df] text-[#0e8da6] focus:ring-[#0e8da6]"
          />
          <div>
            <div className="text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'الالتزام بـ robots.txt' : 'Respect robots.txt (Default ON)'}
            </div>
            <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              {robotsObey ? (
                isArabic ? 'احترام تعليمات أصحاب المواقع وقواعد التردد.' : 'Honors Disallow & crawl-delay rules on target domains.'
              ) : (
                <span className="text-[#c62f2a] dark:text-[#f85149] font-medium">
                  {isArabic ? 'تحذير: سيتم تسجيل تجاوز القواعد في سجل التدقيق الأمني.' : 'Warning: Bypassing logs an immutable audit event.'}
                </span>
              )}
            </div>
          </div>
        </label>

        {/* Enrich Emails */}
        <label className="flex items-start gap-2.5 rounded-lg border border-[#d9dee6] dark:border-white/10 p-2.5 cursor-pointer hover:bg-[#eaeef3]/50 dark:hover:bg-[#171c25]/50 transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={enrichEmails}
            onChange={e => onChange({ enrichEmails: e.target.checked })}
            className="mt-0.5 rounded border-[#cfd6df] text-[#0e8da6] focus:ring-[#0e8da6]"
          />
          <div>
            <div className="text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'إثراء جهات الاتصال (Enrichment)' : 'Multi-source Contact Enrichment'}
            </div>
            <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic
                ? 'فحص صفحات /contact والبيانات المتاحة مع توثيق دقيق لمصدر البريد.'
                : 'Cross-checks contact pages & Hunter BYOK. Always logs honest source provenance.'}
            </div>
          </div>
        </label>

        {/* Generate Outreach */}
        <label className="flex items-start gap-2.5 rounded-lg border border-[#d9dee6] dark:border-white/10 p-2.5 cursor-pointer hover:bg-[#eaeef3]/50 dark:hover:bg-[#171c25]/50 transition-colors">
          <input
            type="checkbox"
            disabled={disabled}
            checked={generateOutreach}
            onChange={e => onChange({ generateOutreach: e.target.checked })}
            className="mt-0.5 rounded border-[#cfd6df] text-[#0e8da6] focus:ring-[#0e8da6]"
          />
          <div>
            <div className="text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'صياغة مسودات المراسلة (Drafts Only)' : 'Outreach Drafts (Drafts Only)'}
            </div>
            <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic
                ? 'توليد مسودة بريد أو رسالة فقط للعملاء المؤهلين. لن يتم الإرسال أبداً.'
                : 'Generates structured drafts for leads above score threshold. Never auto-sends.'}
            </div>
          </div>
        </label>
      </div>
    </div>
  )
}
