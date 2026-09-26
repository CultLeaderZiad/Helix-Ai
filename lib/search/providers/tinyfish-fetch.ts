import { ProviderCall, ProviderAvailability, CallCtx } from '@/lib/search/places/types'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

export interface TinyFishFetchItemResult {
  url: string
  final_url?: string
  title?: string
  description?: string
  language?: string
  text?: string
  links?: string[]
}

export interface TinyFishFetchErrorItem {
  url: string
  error: string
  status?: number
}

export interface TinyFishFetchResponse {
  results: TinyFishFetchItemResult[]
  errors: TinyFishFetchErrorItem[]
}

const TINYFISH_FETCH_BASE = process.env.TINYFISH_FETCH_URL || 'https://api.fetch.tinyfish.ai'

export class TinyFishFetchProvider {
  id = 'tinyfish_fetch' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.TINYFISH_API_KEY
    if (!key) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Page fetch unavailable. Set TINYFISH_API_KEY on the server.',
        reason_ar: 'جلب الصفحات غير متاح. أضف TINYFISH_API_KEY على الخادم.',
        env: ['TINYFISH_API_KEY']
      }
    }
    return {
      id: this.id,
      available: true,
      env: ['TINYFISH_API_KEY']
    }
  }

  async fetchUrls(
    urls: string[],
    options?: {
      format?: 'markdown' | 'html' | 'json'
      links?: boolean
      ttl?: number
      purpose?: string
      ctx?: CallCtx
    }
  ): Promise<ProviderCall<TinyFishFetchResponse>> {
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
    const targetUrls = urls.slice(0, 10)

    try {
      const res = await fetch(TINYFISH_FETCH_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          urls: targetUrls,
          format: options?.format || 'html',
          links: options?.links ?? true,
          ttl: options?.ttl ?? 86400,
          purpose: options?.purpose || 'Extract company contact details and description',
          per_url_timeout_ms: 25000
        }),
        signal: AbortSignal.timeout(35000)
      })

      const latency_ms = Date.now() - start
      if (res.status === 429) {
        return {
          ok: false,
          status: 'rate_limited',
          http_status: 429,
          latency_ms,
          units: targetUrls.length,
          cost_micros: 0,
          detail: 'TinyFish Fetch rate limit exceeded'
        }
      }

      if (!res.ok) {
        return {
          ok: false,
          status: 'error',
          http_status: res.status,
          latency_ms,
          units: targetUrls.length,
          cost_micros: 0,
          detail: `TinyFish Fetch HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const results: TinyFishFetchItemResult[] = Array.isArray(json.results) ? json.results : []
      const errors: TinyFishFetchErrorItem[] = Array.isArray(json.errors) ? json.errors : []

      await incrementProviderUsage(
        'tinyfish_fetch',
        options?.ctx?.clientId || null,
        targetUrls.length,
        0,
        0
      )

      return {
        ok: true,
        status: results.length > 0 ? 'ok' : 'empty',
        http_status: res.status,
        latency_ms,
        units: targetUrls.length,
        cost_micros: 0,
        data: { results, errors }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: targetUrls.length,
        cost_micros: 0,
        detail: err?.message || 'TinyFish Fetch request failed'
      }
    }
  }
}
