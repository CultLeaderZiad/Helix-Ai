'use client'

import React, { useState } from 'react'
import type { LeadGenSeeds } from '@/lib/leadgen/types'

interface SeedInputProps {
  seeds: LeadGenSeeds
  onChange: (updated: LeadGenSeeds) => void
  isArabic?: boolean
  disabled?: boolean
}

export function SeedInput({ seeds, onChange, isArabic = false, disabled = false }: SeedInputProps) {
  const [activeTab, setActiveTab] = useState<'urls' | 'sitemap' | 'shopify' | 'csv'>('urls')

  const handleUrlsChange = (raw: string) => {
    const list = raw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean)
    onChange({ ...seeds, urls: list })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-[#0f141b] dark:text-[#e8ecf2]">
          {isArabic ? 'مصادر الروابط والمدخلات (Seed Targets) *' : 'Seed Targets & Ingestion Sources *'}
        </label>
        <span className="text-[11px] font-mono text-[#5b6577] dark:text-[#8b95a7]">
          {seeds.urls.length} {isArabic ? 'روابط محددة' : 'seeds loaded'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#d9dee6] dark:border-white/10 gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab('urls')}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'urls'
              ? 'border-[#0e8da6] dark:border-[#38c6e0] text-[#0e8da6] dark:text-[#38c6e0]'
              : 'border-transparent text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
          }`}
        >
          {isArabic ? 'روابط مباشرة (URLs)' : 'Direct URLs'}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab('sitemap')}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'sitemap'
              ? 'border-[#0e8da6] dark:border-[#38c6e0] text-[#0e8da6] dark:text-[#38c6e0]'
              : 'border-transparent text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
          }`}
        >
          {isArabic ? 'خريطة الموقع (Sitemap)' : 'XML Sitemap'}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab('shopify')}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'shopify'
              ? 'border-[#0e8da6] dark:border-[#38c6e0] text-[#0e8da6] dark:text-[#38c6e0]'
              : 'border-transparent text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
          }`}
        >
          {isArabic ? 'متجر شوبيفاي (Shopify)' : 'Shopify Store'}
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setActiveTab('csv')}
          className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === 'csv'
              ? 'border-[#0e8da6] dark:border-[#38c6e0] text-[#0e8da6] dark:text-[#38c6e0]'
              : 'border-transparent text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]'
          }`}
        >
          {isArabic ? 'ملف دومينات (Domains CSV)' : 'Domains CSV'}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'urls' && (
        <div>
          <textarea
            rows={4}
            disabled={disabled}
            value={seeds.urls.join('\n')}
            onChange={e => handleUrlsChange(e.target.value)}
            placeholder={
              isArabic
                ? 'https://example-contractor.sa\nhttps://alkhalij-group.com/contact\nhttps://riyadh-engineering.com'
                : 'https://example-contractor.com\nhttps://partner-group.ae/contact\nhttps://gulf-enterprises.com'
            }
            className="w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] placeholder-[#8b95a7] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
          <p className="mt-1 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'أدخل رابطاً واحداً في كل سطر. يُقبل فقط بروتوكول https:// أو http:// العام.'
              : 'Enter one target URL per line. Only public HTTP/HTTPS endpoints are accepted. Localhost and private IPs are rejected.'}
          </p>
        </div>
      )}

      {activeTab === 'sitemap' && (
        <div>
          <input
            type="url"
            disabled={disabled}
            value={seeds.sitemap_url ?? ''}
            onChange={e => onChange({ ...seeds, sitemap_url: e.target.value })}
            placeholder="https://example.com/sitemap.xml"
            className="w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
          <p className="mt-1 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'سيقوم محرك SitemapSpider بقراءة مسارات التواصل والتعريف تلقائياً دون استهلاك زائد للصفحات.'
              : 'SitemapSpider will inspect the XML feed and queue relevant contact, team, and company pages within your page quota.'}
          </p>
        </div>
      )}

      {activeTab === 'shopify' && (
        <div>
          <input
            type="url"
            disabled={disabled}
            value={seeds.shopify_url ?? ''}
            onChange={e => onChange({ ...seeds, shopify_url: e.target.value })}
            placeholder="https://brand-store.com"
            className="w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
          <p className="mt-1 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'محرك ShopifySpider يستخرج بيانات المنتجات وصفحات /pages/contact و /policies لاستخراج بيانات الشركة.'
              : 'ShopifySpider accesses products.json and discovers brand contact/support emails with variant pricing.'}
          </p>
        </div>
      )}

      {activeTab === 'csv' && (
        <div>
          <textarea
            rows={4}
            disabled={disabled}
            value={seeds.domains_csv ?? ''}
            onChange={e => onChange({ ...seeds, domains_csv: e.target.value })}
            placeholder="domain,company_name\ncontractor-a.com,Contractor A\nlogistics-gulf.sa,Gulf Logistics"
            className="w-full rounded-md border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-3 py-2 font-mono text-xs text-[#0f141b] dark:text-[#e8ecf2] focus:border-[#0e8da6] focus:outline-none dark:focus:border-[#38c6e0]"
          />
          <p className="mt-1 text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'الصق قائمة منسقة بصيغة CSV تحتوي على أسماء النطاقات (domains).'
              : 'Paste comma-separated domains or domain feed lines for batch ingestion.'}
          </p>
        </div>
      )}
    </div>
  )
}
