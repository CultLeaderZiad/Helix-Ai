import { PlacesProvider, PlacesQuery, PlaceHit, ProviderAvailability, CallCtx, ProviderCall } from './types'
import { geocodeLocation } from './geocode'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

const GOOGLE_PLACES_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText'

export class GooglePlacesProvider implements PlacesProvider {
  id = 'google_places' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Google Maps unavailable. Set GOOGLE_PLACES_API_KEY on the server.',
        reason_ar: 'خرائط Google غير متاحة. أضف GOOGLE_PLACES_API_KEY على الخادم.',
        env: ['GOOGLE_PLACES_API_KEY']
      }
    }

    // Check Google trial status if defined
    const billingMode = process.env.GOOGLE_BILLING_MODE || 'trial'
    const trialEnds = process.env.GOOGLE_TRIAL_ENDS
    if (billingMode === 'trial' && trialEnds) {
      const endsTime = new Date(trialEnds).getTime()
      if (!isNaN(endsTime) && Date.now() > endsTime) {
        return {
          id: this.id,
          available: false,
          reason_en: `Google trial ended on ${trialEnds}. Upgrade billing before Places will resume.`,
          reason_ar: `انتهت الفترة التجريبية لـ Google في ${trialEnds}. قم بترقية الفوترة لاستئناف الخدمة.`,
          env: ['GOOGLE_TRIAL_ENDS']
        }
      }
    }

    const trialNoteEn = billingMode === 'trial' && trialEnds
      ? `Google Maps runs on trial credit until ${trialEnds}. Upgrade billing before then or it stops.`
      : undefined
    const trialNoteAr = billingMode === 'trial' && trialEnds
      ? `تعمل خرائط Google برصيد تجريبي حتى ${trialEnds}. فعّل الفوترة قبل ذلك وإلا ستتوقف.`
      : undefined

    return {
      id: this.id,
      available: true,
      env: ['GOOGLE_PLACES_API_KEY'],
      note_en: trialNoteEn,
      note_ar: trialNoteAr
    }
  }

  unitCost(q: PlacesQuery): { units: number; cost_micros: number } {
    const tier = process.env.GOOGLE_PLACES_FIELD_TIER || 'enterprise'
    // Enterprise SKU is $35/1K after free tier = 35,000 micros
    // Pro SKU is $32/1K after free tier = 32,000 micros
    return {
      units: 1,
      cost_micros: tier === 'pro' ? 32000 : 35000
    }
  }

  async search(q: PlacesQuery, ctx?: CallCtx): Promise<ProviderCall<{ hits: PlaceHit[]; nextToken?: string }>> {
    const key = process.env.GOOGLE_PLACES_API_KEY
    if (!key) {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'GOOGLE_PLACES_API_KEY missing'
      }
    }

    const start = Date.now()
    const tier = process.env.GOOGLE_PLACES_FIELD_TIER || 'enterprise'

    // Build field mask
    let fieldMask = 'places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.types,nextPageToken'
    if (tier === 'enterprise') {
      fieldMask += ',places.websiteUri,places.nationalPhoneNumber,places.internationalPhoneNumber,places.rating,places.userRatingCount,places.businessStatus,places.googleMapsUri'
    }

    // Geocode if city/country is given and coordinates are missing
    let centerLat = q.lat
    let centerLng = q.lng
    if ((centerLat === undefined || centerLng === undefined) && (q.city || q.country)) {
      const geo = await geocodeLocation(`${q.city || ''} ${q.country || ''}`.trim(), q.country)
      if (geo) {
        centerLat = geo.lat
        centerLng = geo.lng
      }
    }

    // Text query construction
    let textQuery = q.text.trim()
    if (q.city && !textQuery.toLowerCase().includes(q.city.toLowerCase())) {
      textQuery = `${textQuery} in ${q.city}`
    }

    const body: Record<string, any> = {
      textQuery,
      pageSize: Math.min(q.limit || 20, 20),
      languageCode: q.language || 'en'
    }

    if (q.country) {
      body.regionCode = q.country.toUpperCase()
    }

    if (centerLat !== undefined && centerLng !== undefined) {
      body.locationBias = {
        circle: {
          center: { latitude: centerLat, longitude: centerLng },
          radius: Math.min(q.radiusM || 50000, 50000)
        }
      }
    }

    try {
      const res = await fetch(GOOGLE_PLACES_SEARCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': key,
          'X-Goog-FieldMask': fieldMask
        },
        body: JSON.stringify(body),
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
          detail: `Google Places HTTP ${res.status}`
        }
      }

      const json = await res.json()
      const rawPlaces = Array.isArray(json.places) ? json.places : []
      const hits: PlaceHit[] = rawPlaces.map((p: any) => {
        // Extract city from addressComponents if present
        let extractedCity = q.city
        let extractedCountry = q.country
        if (Array.isArray(p.addressComponents)) {
          for (const c of p.addressComponents) {
            if (c.types?.includes('locality')) extractedCity = c.longText || c.shortText
            if (c.types?.includes('country')) extractedCountry = c.shortText
          }
        }

        return {
          provider: this.id,
          provider_place_id: p.id || '',
          name: p.displayName?.text || p.name || 'Unknown Business',
          address: p.formattedAddress,
          city: extractedCity,
          country: extractedCountry,
          phone: p.internationalPhoneNumber || p.nationalPhoneNumber,
          website: p.websiteUri,
          maps_url: p.googleMapsUri,
          rating: typeof p.rating === 'number' ? p.rating : undefined,
          rating_count: typeof p.userRatingCount === 'number' ? p.userRatingCount : undefined,
          types: Array.isArray(p.types) ? p.types : [],
          business_status: p.businessStatus,
          fetched_at: new Date().toISOString()
        }
      })

      // Increment engine usage
      await incrementProviderUsage(
        'google_places',
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
        data: {
          hits,
          nextToken: json.nextPageToken
        }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'Google Places fetch failed'
      }
    }
  }
}
