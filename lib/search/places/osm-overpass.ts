import { PlacesProvider, PlacesQuery, PlaceHit, ProviderAvailability, CallCtx, ProviderCall } from './types'
import { geocodeLocation } from './geocode'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

const OVERPASS_INTERPRETER_URL = 'https://overpass-api.de/api/interpreter'

export class OsmOverpassProvider implements PlacesProvider {
  id = 'osm_overpass' as const

  async availability(): Promise<ProviderAvailability> {
    const isEnabled = process.env.OSM_ENABLED !== 'false'
    return {
      id: this.id,
      available: isEnabled,
      note_en: 'OpenStreetMap is free but often lacks phones and websites in this region.',
      note_ar: 'OpenStreetMap مجاني لكنه غالباً يفتقر إلى أرقام الهواتف والمواقع في هذه المنطقة.'
    }
  }

  unitCost(q: PlacesQuery): { units: number; cost_micros: number } {
    return { units: 1, cost_micros: 0 } // Free public service
  }

  async search(q: PlacesQuery, ctx?: CallCtx): Promise<ProviderCall<{ hits: PlaceHit[]; nextToken?: string }>> {
    const start = Date.now()

    // Geocode to get bbox or center point
    let lat = q.lat
    let lng = q.lng
    if ((lat === undefined || lng === undefined) && (q.city || q.country)) {
      const geo = await geocodeLocation(`${q.city || ''} ${q.country || ''}`.trim(), q.country)
      if (geo) {
        lat = geo.lat
        lng = geo.lng
      }
    }

    if (lat === undefined || lng === undefined) {
      return {
        ok: false,
        status: 'empty',
        latency_ms: Date.now() - start,
        units: 0,
        cost_micros: 0,
        detail: 'Cannot run Overpass query without center coordinates'
      }
    }

    const radiusM = Math.min(q.radiusM || 25000, 50000)
    const limit = Math.min(q.limit || 20, 40)
    const cleanTerm = q.text.replace(/[^a-zA-Z0-9\u0600-\u06FF\s]/g, '').trim()

    // Overpass QL query around center point
    const overpassQl = `
[out:json][timeout:25];
(
  nwr["name"~"${cleanTerm}",i](around:${radiusM},${lat},${lng});
  nwr["shop"](around:${radiusM},${lat},${lng});
  nwr["craft"](around:${radiusM},${lat},${lng});
  nwr["office"](around:${radiusM},${lat},${lng});
);
out center ${limit};
    `.trim()

    try {
      const contactEmail = process.env.OSM_CONTACT_EMAIL || 'support@helix-ai-two.vercel.app'
      const res = await fetch(OVERPASS_INTERPRETER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': `HelixAI/1.0 (+https://helix-ai-two.vercel.app; ${contactEmail})`
        },
        body: `data=${encodeURIComponent(overpassQl)}`,
        signal: AbortSignal.timeout(28000)
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
          detail: `Overpass HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const elements = Array.isArray(json.elements) ? json.elements : []
      const hits: PlaceHit[] = elements.map((el: any) => {
        const tags = el.tags || {}
        const name = tags.name || tags['name:en'] || tags['name:ar'] || 'Business'
        const phone = tags.phone || tags['contact:phone'] || tags['contact:mobile']
        const website = tags.website || tags['contact:website']
        const street = tags['addr:street']
        const housenumber = tags['addr:housenumber']
        const city = tags['addr:city'] || q.city
        const country = tags['addr:country'] || q.country
        const address = [housenumber, street, city, country].filter(Boolean).join(', ')

        return {
          provider: this.id,
          provider_place_id: `osm_${el.type}_${el.id}`,
          name,
          address: address || undefined,
          city,
          country,
          phone: phone || undefined,
          website: website || undefined,
          types: [tags.shop, tags.craft, tags.office, tags.amenity].filter(Boolean),
          fetched_at: new Date().toISOString()
        }
      })

      // Increment engine usage
      await incrementProviderUsage(
        'osm_overpass',
        ctx?.clientId || null,
        1,
        0,
        0
      )

      return {
        ok: true,
        status: hits.length > 0 ? 'ok' : 'empty',
        http_status: res.status,
        latency_ms,
        units: 1,
        cost_micros: 0,
        data: { hits }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'Overpass request failed'
      }
    }
  }
}
