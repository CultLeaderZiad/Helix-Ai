'use client'

import React, { useState } from 'react'
import { useSearch } from './hooks/useSearch'
import { ModeTabs } from './ModeTabs'
import { ProviderStatus } from './ProviderStatus'
import { ResultCard } from './ResultCard'
import { SEARCH_COPY } from './copy'
import { Search as SearchIcon } from 'lucide-react'

export function SearchPage() {
  const [isArabic, setIsArabic] = useState(false)
  const {
    query,
    setQuery,
    mode,
    setMode,
    results,
    providers,
    isLoading,
    error,
    savedFingerprints,
    enrichingUrl,
    performSearch,
    enrichUrl,
    saveResult
  } = useSearch()

  const copy = isArabic ? SEARCH_COPY.ar : SEARCH_COPY.en

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(query, mode)
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 font-sans transition-all text-foreground"
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            {copy.title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsArabic(!isArabic)}
          className="rounded border border-input bg-background px-2.5 py-1 text-xs font-mono font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {isArabic ? 'English (EN)' : 'العربية (AR)'}
        </button>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.placeholder}
          className="flex-1 rounded-md border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 transition-colors"
        >
          {isLoading ? copy.searching : copy.btnSearch}
        </button>
      </form>

      {/* Mode Tabs */}
      <ModeTabs
        activeMode={mode}
        onChange={(m) => {
          setMode(m)
          if (query.trim()) performSearch(query, m)
        }}
        isArabic={isArabic}
      />

      {/* Provider Health Row */}
      <ProviderStatus providers={providers} isArabic={isArabic} />

      {/* Error readout */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Results or Empty State */}
      {results.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {copy.resultsSummary.replace('{count}', String(results.length)).replace('{latency}', '1.8')}
            </span>
          </div>

          <div className="space-y-3">
            {results.map((item, idx) => (
              <ResultCard
                key={`${item.fingerprint}-${idx}`}
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
        <div className="rounded-xl border border-dashed border-border p-12 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <SearchIcon className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            {copy.emptyTitle}
          </h3>
          <p className="mx-auto max-w-sm text-xs text-muted-foreground">
            {copy.emptySubtitle}
          </p>
        </div>
      ) : null}
    </div>
  )
}
