import { PlacesProvider, PlacesQuery, PlaceHit, ProviderAvailability, CallCtx, ProviderCall } from '@/lib/search/places/types'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

const FOURSQUARE_API_BASE = 'https://places-api.foursquare.com/places/search'

export class FoursquarePlacesProvider implements PlacesProvider {
  id = 'foursquare' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.FOURSQUARE_API_KEY
    if (!key) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Foursquare unavailable. Set FOURSQUARE_API_KEY on the server.',
        reason_ar: 'Foursquare غير متاح. أضف FOURSQUARE_API_KEY على الخادم.',
        env: ['FOURSQUARE_API_KEY']
      }
    }
    return {
      id: this.id,
      available: true,
      env: ['FOURSQUARE_API_KEY'],
      note_en: 'Powered by Foursquare (names, categories, and geolocations).',
      note_ar: 'مدعوم من Foursquare (الأسماء والتصنيفات والمواقع الجغرافية).'
    }
  }

  unitCost(q: PlacesQuery): { units: number; cost_micros: number } {
    return { units: 1, cost_micros: 15000 } // $15 / 1k Pro calls after free tier
  }

  async search(q: PlacesQuery, ctx?: CallCtx): Promise<ProviderCall<{ hits: PlaceHit[]; nextToken?: string }>> {
    const key = process.env.FOURSQUARE_API_KEY
    if (!key) {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'FOURSQUARE_API_KEY missing'
      }
    }

    const start = Date.now()
    const limit = Math.min(q.limit || 20, 50)
    let url = `${FOURSQUARE_API_BASE}?query=${encodeURIComponent(q.text)}&limit=${limit}`

    if (q.lat !== undefined && q.lng !== undefined) {
      url += `&ll=${q.lat},${q.lng}&radius=${Math.min(q.radiusM || 50000, 100000)}`
    } else if (q.city) {
      url += `&near=${encodeURIComponent(`${q.city}, ${q.country || ''}`.trim())}`
    }

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Accept': 'application/json',
          'X-Places-Api-Version': '2025-06-15'
        },
        signal: AbortSignal.timeout(10000)
      })

      const latency_ms = Date.now() - start
      if (!res.ok) {
        return {
          ok: false,
          status: res.status === 429 ? 'rate_limited' : 'error',
          http_status: res.status,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: `Foursquare HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const rawResults = Array.isArray(json.results) ? json.results : []

      const hits: PlaceHit[] = rawResults.map((r: any) => ({
        provider: this.id,
        provider_place_id: r.fsq_place_id || r.fsq_id || '',
        name: r.name || 'Business',
        address: r.location?.formatted_address || r.location?.address,
        city: r.location?.locality || q.city,
        country: r.location?.country || q.country,
        phone: r.tel || undefined,
        website: r.website || undefined,
        types: Array.isArray(r.categories) ? r.categories.map((c: any) => c.name) : [],
        fetched_at: new Date().toISOString()
      }))

      await incrementProviderUsage(
        'foursquare',
        ctx?.clientId || null,
        1,
        0,
        this.unitCost(q).cost_micros
      )

      return {
        ok: true,
        status: hits.length > 0 ? 'ok' : 'empty',
        http_status: res.status,
        latency_ms,
        units: 1,
        cost_micros: this.unitCost(q).cost_micros,
        data: { hits }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'Foursquare request failed'
      }
    }
  }
}
