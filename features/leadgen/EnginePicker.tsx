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
  onChange,
  isArabic = false,
  disabled = false,
}: EnginePickerProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Engine Default */}
        <div>
          <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'محرك الجلب (Scrapling Fetcher Engine)' : 'Extraction Engine'}
          </label>
          <div className="mt-1.5 flex rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] p-1 gap-1">
            {[
              { id: 'stealth' as LeadGenEngine, label: 'Stealthy', desc: 'Cloudflare / WAF' },
              { id: 'http' as LeadGenEngine, label: 'HTTP Fast', desc: 'Standard TLS' },
              { id: 'dynamic' as LeadGenEngine, label: 'Dynamic JS', desc: 'Playwright headless' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ engine: item.id })}
                className={`flex-1 rounded py-1 px-2 text-center text-xs font-medium transition-colors ${
                  engine === item.id
                    ? 'bg-[#0f141b] dark:bg-[#e8ecf2] text-white dark:text-[#0b0e13]'
                    : 'text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
                }`}
              >
                <div>{item.label}</div>
                <div className="text-[10px] opacity-75 font-mono">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Crawl Mode */}
        <div>
          <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'نمط الاستكشاف (Discovery Mode)' : 'Discovery Spider Mode'}
          </label>
          <select
            disabled={disabled}
            value={mode}
            onChange={e => onChange({ mode: e.target.value as LeadGenMode })}
            className="mt-1.5 w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 text-xs font-medium text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          >
            <option value="crawl">crawl (CrawlSpider · follow links)</option>
            <option value="sitemap">sitemap (SitemapSpider · XML feed)</option>
            <option value="shopify">shopify (ShopifySpider · products+about)</option>
            <option value="digest">digest (SiteToMarkdownSpider · digest)</option>
            <option value="csv_feed">csv_feed (CSVFeedSpider · batch rows)</option>
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
              {isArabic ? 'محددات متكيفة (Adaptive CSS/XPath)' : 'Adaptive Selectors'}
            </div>
            <div className="text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic
                ? 'إعادة التموضع الذاتي للمحددات عند تغير هيكل صفحات الهدف.'
                : 'Scrapling adaptive=True automatically recovers selectors if page markup shifts.'}
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
