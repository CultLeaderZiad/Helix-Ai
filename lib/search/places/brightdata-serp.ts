import { PlacesProvider, PlacesQuery, PlaceHit, ProviderAvailability, CallCtx, ProviderCall } from '@/lib/search/places/types'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

export class BrightDataSerpProvider implements PlacesProvider {
  id = 'brightdata_serp' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.BRIGHTDATA_API_KEY || process.env.BRIGHTDATA_API_TOKEN
    const zone = process.env.BRIGHTDATA_SERP_ZONE

    if (!key || !zone) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Bright Data SERP Maps disabled. Set BRIGHTDATA_SERP_ZONE on the server.',
        reason_ar: 'بحث خرائط Bright Data معطل. أضف BRIGHTDATA_SERP_ZONE على الخادم.',
        env: ['BRIGHTDATA_SERP_ZONE']
      }
    }

    return {
      id: this.id,
      available: true,
      env: ['BRIGHTDATA_API_KEY', 'BRIGHTDATA_SERP_ZONE']
    }
  }

  unitCost(q: PlacesQuery): { units: number; cost_micros: number } {
    return { units: 1, cost_micros: 1500 } // $1.50 per 1k successful requests = 1,500 micros
  }

  async search(q: PlacesQuery, ctx?: CallCtx): Promise<ProviderCall<{ hits: PlaceHit[]; nextToken?: string }>> {
    const key = process.env.BRIGHTDATA_API_KEY || process.env.BRIGHTDATA_API_TOKEN
    const zone = process.env.BRIGHTDATA_SERP_ZONE

    if (!key || !zone) {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'BRIGHTDATA_SERP_ZONE or API key missing'
      }
    }

    const start = Date.now()
    const cleanQuery = encodeURIComponent(`${q.text} ${q.city || ''}`.trim())
    const gmapsUrl = `https://www.google.com/maps/search/${cleanQuery}/?hl=${q.language || 'en'}&gl=${(q.country || 'sa').toLowerCase()}&brd_json=1`

    try {
      const res = await fetch('https://api.brightdata.com/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`
        },
        body: JSON.stringify({
          zone,
          url: gmapsUrl,
          format: 'raw'
        }),
        signal: AbortSignal.timeout(25000)
      })

      const latency_ms = Date.now() - start
      if (!res.ok) {
        return {
          ok: false,
          status: 'error',
          http_status: res.status,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: `Bright Data SERP HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const organic = Array.isArray(json.organic) ? json.organic : []

      const hits: PlaceHit[] = organic.map((item: any, idx: number) => ({
        provider: this.id,
        provider_place_id: item.place_id || `bd_${idx}_${Date.now()}`,
        name: item.title || item.name || 'Business',
        address: item.address,
        city: q.city,
        country: q.country,
        phone: item.phone,
        website: item.link || item.website,
        rating: typeof item.rating === 'number' ? item.rating : undefined,
        rating_count: typeof item.reviews === 'number' ? item.reviews : undefined,
        fetched_at: new Date().toISOString()
      }))

      await incrementProviderUsage(
        'brightdata_serp',
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
        detail: err?.message || 'Bright Data SERP failed'
      }
    }
  }
}
