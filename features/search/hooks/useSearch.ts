'use client'

import { useState, useCallback, useEffect } from 'react'
import { NormalizedSearchResult } from '@/lib/search/normalize'
import { ProviderAvailability } from '@/lib/search/places/types'
import { SearchMode } from '../ModeTabs'

export function useSearch() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('everything')
  const [results, setResults] = useState<NormalizedSearchResult[]>([])
  const [providers, setProviders] = useState<ProviderAvailability[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedFingerprints, setSavedFingerprints] = useState<Set<string>>(new Set())
  const [enrichingUrl, setEnrichingUrl] = useState<string | null>(null)
  const [lastRequestId, setLastRequestId] = useState<string | null>(null)

  // 1. Fetch provider health on mount
  useEffect(() => {
    fetch('/api/search/health')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.providers)) setProviders(data.providers)
      })
      .catch(() => {})
  }, [])

  // 2. Perform search
  const performSearch = useCallback(async (q: string, m: SearchMode = mode) => {
    if (!q.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q.trim(), mode: m })
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Search request failed')
      }

      setResults(json.data?.results || [])
      setLastRequestId(json.request_id || null)
    } catch (err: any) {
      setError(err?.message || 'Search execution failed')
    } finally {
      setIsLoading(false)
    }
  }, [mode])

  // 3. Enrich a single target URL
  const enrichUrl = useCallback(async (url: string) => {
    setEnrichingUrl(url)
    try {
      const res = await fetch('/api/search/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const json = await res.json()
      if (json.ok && json.data) {
        // Update local result card payload
        setResults(prev => prev.map(item => {
          if (item.url === url) {
            return {
              ...item,
              snippet: json.data.description || item.snippet,
              payload: {
                ...item.payload,
                phone: json.data.phones?.[0] || item.payload?.phone,
                city: json.data.city || item.payload?.city,
                country: json.data.country || item.payload?.country,
                socials: json.data.socials
              }
            }
          }
          return item
        }))
      }
    } catch (err) {
      console.warn('Enrich failed:', err)
    } finally {
      setEnrichingUrl(null)
    }
  }, [])

  // 4. Save results to leads
  const saveResult = useCallback(async (item: NormalizedSearchResult) => {
    if (!lastRequestId) return
    try {
      await fetch('/api/search/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request_id: lastRequestId,
          result_ids: [item.fingerprint]
        })
      })
      setSavedFingerprints(prev => new Set(prev).add(item.fingerprint))
    } catch (err) {
      console.warn('Save failed:', err)
    }
  }, [lastRequestId])

  return {
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
  }
}
