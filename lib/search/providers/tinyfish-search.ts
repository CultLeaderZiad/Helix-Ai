import { ProviderCall, ProviderAvailability, CallCtx } from '@/lib/search/places/types'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

export interface TinyFishSearchResultItem {
  position: number
  site_name?: string
  title: string
  snippet: string
  url: string
  date?: string
}

export interface TinyFishSearchResponse {
  query: string
  results: TinyFishSearchResultItem[]
  total_results: number
  page: number
}

const TINYFISH_SEARCH_BASE = process.env.TINYFISH_SEARCH_URL || 'https://api.search.tinyfish.ai'

export class TinyFishSearchProvider {
  id = 'tinyfish_search' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.TINYFISH_API_KEY
    if (!key) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Web search unavailable. Set TINYFISH_API_KEY on the server.',
        reason_ar: 'البحث في الويب غير متاح. أضف TINYFISH_API_KEY على الخادم.',
        env: ['TINYFISH_API_KEY']
      }
    }
    return {
      id: this.id,
      available: true,
      env: ['TINYFISH_API_KEY']
    }
  }

  async search(
    query: string,
    options?: {
      location?: string
      language?: 'en' | 'ar'
      includeDomains?: string[]
      excludeDomains?: string[]
      page?: number
      ctx?: CallCtx
    }
  ): Promise<ProviderCall<TinyFishSearchResponse>> {
    const key = process.env.TINYFISH_API_KEY
    if (!key) {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'TINYFISH_API_KEY missing'
      }
    }

    const start = Date.now()
    const page = options?.page ?? 0
    let url = `${TINYFISH_SEARCH_BASE}/?query=${encodeURIComponent(query)}&page=${page}`

    if (options?.location) {
      url += `&location=${encodeURIComponent(options.location.toUpperCase())}`
    }
    if (options?.language) {
      url += `&language=${encodeURIComponent(options.language)}`
    }
    if (options?.includeDomains && options.includeDomains.length > 0) {
      url += `&include_domains=${encodeURIComponent(options.includeDomains.join(','))}`
    }
    if (options?.excludeDomains && options.excludeDomains.length > 0) {
      url += `&exclude_domains=${encodeURIComponent(options.excludeDomains.join(','))}`
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'X-API-Key': key,
          'Accept': 'application/json',
          'User-Agent': 'HelixAI/1.0 (+https://helix-ai-two.vercel.app)'
        },
        signal: AbortSignal.timeout(10000)
      })

      const latency_ms = Date.now() - start
      if (res.status === 429) {
        return {
          ok: false,
          status: 'rate_limited',
          http_status: 429,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: 'TinyFish Search rate limit exceeded'
        }
      }

      if (!res.ok) {
        return {
          ok: false,
          status: 'error',
          http_status: res.status,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: `TinyFish Search HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const results: TinyFishSearchResultItem[] = Array.isArray(json.results) ? json.results : []

      // Usage tracking: free tier, cost 0
      await incrementProviderUsage(
        'tinyfish_search',
        options?.ctx?.clientId || null,
        1,
        0,
        0
      )

      return {
        ok: true,
        status: results.length > 0 ? 'ok' : 'empty',
        http_status: res.status,
        latency_ms,
        units: 1,
        cost_micros: 0,
        data: {
          query: json.query || query,
          results,
          total_results: json.total_results || results.length,
          page
        }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'TinyFish Search fetch failed'
      }
    }
  }
}
