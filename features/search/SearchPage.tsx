'use client'

import React, { useState } from 'react'
import { useSearch } from './hooks/useSearch'
import { ModeTabs } from './ModeTabs'
import { ResultCard } from './ResultCard'
import { SEARCH_COPY } from './copy'
import { Search as SearchIcon } from 'lucide-react'
import { useDashLang } from '@/components/dashboard/use-lang'
import { EmptyState, FormField, InlineError, PageHead } from '@/components/dashboard/ui'
import { tx, type DashLang } from '@/lib/dashboard/lang'

const EXAMPLES = {
  en: ['Dental clinics in Jumeirah with online booking', 'Physiotherapy centres in Riyadh', 'Salons in Doha with WhatsApp'],
  ar: ['عيادات أسنان في جميرا تتيح الحجز الإلكتروني', 'مراكز علاج طبيعي في الرياض', 'صالونات في الدوحة مع واتساب'],
}

export function SearchPage({ lang: langProp }: { lang?: DashLang }) {
  const lang = useDashLang(langProp ?? 'en')
  const isArabic = lang === 'ar'
  const [language, setLanguage] = useState<'any' | 'ar' | 'en'>('any')
  const [region, setRegion] = useState('any')
  const {
    query,
    setQuery,
    mode,
    setMode,
    results,
    isLoading,
    error,
    savedFingerprints,
    enrichingUrl,
    performSearch,
    enrichUrl,
    saveResult,
  } = useSearch()

  const copy = isArabic ? SEARCH_COPY.ar : SEARCH_COPY.en

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const extras = [
      region === 'any' ? '' : region,
      language === 'ar' ? (isArabic ? 'بالعربية' : 'in Arabic') : language === 'en' ? (isArabic ? 'بالإنجليزية' : 'in English') : '',
    ].filter(Boolean)
    const full = [query.trim(), ...extras].join(' ')
    performSearch(full, mode)
  }

  const unavailable = error && /unavailable|timeout|fetch|network|5\d\d/i.test(error)
  const limited = error && /limit|429|rate/i.test(error)

  return (
    <div className="stack">
      <PageHead
        title={tx(lang, 'Search', 'البحث')}
        lede={tx(lang, 'Research a business or topic across the web. Results show their source.', 'ابحث عن نشاط تجاري أو موضوع عبر الإنترنت. تظهر النتائج مع مصدرها.')}
      />
      <form onSubmit={handleFormSubmit} className="pnl">
        <FormField label={tx(lang, 'Search', 'البحث')} htmlFor="helix-search">
          <div className="search-xl">
            <SearchIcon size={18} />
            <input
              id="helix-search"
              type="text"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder={tx(lang, 'e.g. dental clinics in Jumeirah with online booking', 'مثال: عيادات أسنان في جميرا تتيح الحجز الإلكتروني')}
            />
          </div>
        </FormField>
        <div className="filters">
          <label className="faint">
            {tx(lang, 'Language', 'اللغة')}
            <select className="fld" value={language} onChange={event => setLanguage(event.target.value as 'any' | 'ar' | 'en')} style={{ marginInlineStart: 8 }}>
              <option value="any">{tx(lang, 'Any', 'أي لغة')}</option>
              <option value="ar">{tx(lang, 'Arabic', 'العربية')}</option>
              <option value="en">{tx(lang, 'English', 'الإنجليزية')}</option>
            </select>
          </label>
          <label className="faint">
            {tx(lang, 'Region', 'المنطقة')}
            <select className="fld" value={region} onChange={event => setRegion(event.target.value)} style={{ marginInlineStart: 8 }}>
              <option value="any">{tx(lang, 'Any', 'أي منطقة')}</option>
              <option value="United Arab Emirates">{tx(lang, 'UAE', 'الإمارات')}</option>
              <option value="Saudi Arabia">{tx(lang, 'KSA', 'السعودية')}</option>
              <option value="Qatar">{tx(lang, 'Qatar', 'قطر')}</option>
              <option value="Egypt">{tx(lang, 'Egypt', 'مصر')}</option>
              <option value="Jordan">{tx(lang, 'Jordan', 'الأردن')}</option>
            </select>
          </label>
          <button type="submit" className="btn-d" disabled={isLoading || !query.trim()}>
            {isLoading ? copy.searching : copy.btnSearch}
          </button>
        </div>
      </form>

      <ModeTabs
        activeMode={mode}
        onChange={next => {
          setMode(next)
          if (query.trim()) performSearch(query, next)
        }}
        isArabic={isArabic}
      />

      {error ? (
        <InlineError>
          {limited
            ? tx(lang, "You've reached today's search limit. It resets at midnight (Dubai time).", 'وصلت إلى حد البحث اليومي، ويتجدد عند منتصف الليل بتوقيت دبي.')
            : unavailable
              ? tx(lang, 'Search is temporarily unavailable. Try again in a few minutes.', 'البحث غير متاح مؤقتاً. حاول بعد دقائق.')
              : tx(lang, 'Search could not be completed. Try again.', 'تعذر إكمال البحث. أعد المحاولة.')}
        </InlineError>
      ) : null}

      {results.length > 0 ? (
        <div>
          <p className="faint">{tx(lang, `${results.length} results`, `${results.length} نتائج`)}</p>
          <div className="stack">
            {results.map((item, index) => (
              <ResultCard
                key={`${item.fingerprint}-${index}`}
                result={item}
                onEnrich={enrichUrl}
                onSave={saveResult}
                isEnriching={enrichingUrl === item.url}
                isSaved={savedFingerprints.has(item.fingerprint)}
                isArabic={isArabic}
              />
            ))}
          </div>
        </div>
      ) : !isLoading ? (
        <div className="pnl">
          <EmptyState
            title={results.length === 0 && query ? tx(lang, 'Nothing found. Try fewer words or a different language.', 'لا توجد نتائج. جرّب كلمات أقل أو لغة مختلفة.') : tx(lang, 'Search the web for a business or topic.', 'ابحث في الإنترنت عن نشاط أو موضوع.')}
            body={tx(lang, 'Searches you save appear with the result.', 'ما تحفظه يظهر مع النتيجة.')}
          />
          {!query ? (
            <div className="ph-actions" style={{ marginTop: 12 }}>
              {EXAMPLES[lang].map(example => (
                <button key={example} type="button" className="btn-o" onClick={() => setQuery(example)}>
                  {example}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
