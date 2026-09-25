import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface GeoPoint {
  lat: number
  lng: number
  country?: string
}

/**
 * Geocode a location (city or address) using Google Geocoding (if key present)
 * or Nominatim (with >= 1.1s spacing and identifying UA).
 * Results are cached in `search_geo_cache` table.
 */
export async function geocodeLocation(
  query: string,
  countryHint?: string
): Promise<GeoPoint | null> {
  const cleanQ = query.trim()
  if (!cleanQ) return null

  const cacheKey = `geo:${cleanQ.toLowerCase()}:${countryHint || ''}`
  const supabase = createSupabaseAdminClient()

  // 1. Check database cache
  try {
    const { data: cached } = await (supabase as any)
      .from('search_geo_cache')
      .select('lat, lng, country, fetched_at, provider')
      .eq('key', cacheKey)
      .single()

    if (cached && typeof cached.lat === 'number' && typeof cached.lng === 'number') {
      // If Google provider, ensure fetched_at <= 30 days
      if (cached.provider === 'google_geocode') {
        const fetchedAt = new Date(cached.fetched_at).getTime()
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
        if (fetchedAt > thirtyDaysAgo) {
          return { lat: cached.lat, lng: cached.lng, country: cached.country }
        }
      } else {
        // OSM forever
        return { lat: cached.lat, lng: cached.lng, country: cached.country }
      }
    }
  } catch {
    // Cache miss or table not yet created
  }

  // 2. Try Google Geocoding if key configured
  const googleKey = process.env.GOOGLE_PLACES_API_KEY
  if (googleKey) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanQ)}${
        countryHint ? `&components=country:${countryHint.toUpperCase()}` : ''
      }&key=${googleKey}`

      const res = await fetch(gUrl, { signal: AbortSignal.timeout(6000) })
      if (res.ok) {
        const json = await res.json()
        if (json.status === 'OK' && json.results && json.results.length > 0) {
          const loc = json.results[0].geometry?.location
          if (loc && typeof loc.lat === 'number' && typeof loc.lng === 'number') {
            const point: GeoPoint = { lat: loc.lat, lng: loc.lng, country: countryHint }

            // Store in cache
            await (supabase as any)
              .from('search_geo_cache')
              .upsert({
                key: cacheKey,
                provider: 'google_geocode',
                lat: loc.lat,
                lng: loc.lng,
                country: countryHint || null,
                fetched_at: new Date().toISOString()
              })
              .catch(() => {})

            return point
          }
        }
      }
    } catch {
      // Fallback to Nominatim
    }
  }

  // 3. Fallback to OpenStreetMap Nominatim
  try {
    const contactEmail = process.env.OSM_CONTACT_EMAIL || 'support@helix-ai-two.vercel.app'
    const nomUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cleanQ)}&format=jsonv2&limit=1${
      countryHint ? `&countrycodes=${countryHint.toLowerCase()}` : ''
    }`

    const res = await fetch(nomUrl, {
      headers: {
        'User-Agent': `HelixAI/1.0 (+https://helix-ai-two.vercel.app; ${contactEmail})`,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(8000)
    })

    if (res.ok) {
      const items = await res.json()
      if (Array.isArray(items) && items.length > 0) {
        const item = items[0]
        const lat = parseFloat(item.lat)
        const lng = parseFloat(item.lon)
        if (!isNaN(lat) && !isNaN(lng)) {
          const point: GeoPoint = { lat, lng, country: item.address?.country_code?.toUpperCase() || countryHint }

          // Store in cache
          await (supabase as any)
            .from('search_geo_cache')
            .upsert({
              key: cacheKey,
              provider: 'nominatim',
              lat,
              lng,
              country: point.country || null,
              fetched_at: new Date().toISOString()
            })
            .catch(() => {})

          return point
        }
      }
    }
  } catch (err) {
    console.warn('[geocodeLocation] Geocoding failed:', err)
  }

  return null
}
