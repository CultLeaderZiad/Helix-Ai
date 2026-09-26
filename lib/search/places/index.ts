import { PlacesProvider, PlacesProviderId, PlacesQuery, PlaceHit, ProviderAvailability, CallCtx } from './types'
import { GooglePlacesProvider } from './google'
import { OsmOverpassProvider } from './osm-overpass'
import { FoursquarePlacesProvider } from './foursquare'
import { BrightDataSerpProvider } from './brightdata-serp'

export interface PlacesChainResult {
  hits: PlaceHit[]
  providers_used: PlacesProviderId[]
  provider_reports: Array<{
    provider: PlacesProviderId
    status: string
    hits_count: number
    latency_ms: number
    detail?: string
  }>
}

/**
 * Registry of available places providers.
 */
export function getPlacesProvider(id: PlacesProviderId): PlacesProvider | null {
  switch (id) {
    case 'google_places':
      return new GooglePlacesProvider()
    case 'osm_overpass':
      return new OsmOverpassProvider()
    case 'foursquare':
      return new FoursquarePlacesProvider()
    case 'brightdata_serp':
      return new BrightDataSerpProvider()
    default:
      return null
  }
}

/**
 * Runs fallback provider chain according to PLACES_PROVIDER_ORDER (or default order).
 * Stops when gathered hits >= query.limit.
 * Deduplicates hits by normalized name + city or website domain.
 */
export async function searchPlacesWithFallback(
  query: PlacesQuery,
  ctx?: CallCtx
): Promise<PlacesChainResult> {
  const envOrder = (process.env.PLACES_PROVIDER_ORDER || 'google_places,osm_overpass')
    .split(',')
    .map(s => s.trim()) as PlacesProviderId[]

  const providersUsed: PlacesProviderId[] = []
  const reports: PlacesChainResult['provider_reports'] = []
  const accumulatedHits: PlaceHit[] = []
  const seenFingerprints = new Set<string>()

  function makeFp(hit: PlaceHit): string {
    if (hit.website) {
      try {
        const h = new URL(hit.website).hostname.replace(/^www\./, '').toLowerCase()
        return `dom:${h}`
      } catch {}
    }
    const cleanName = hit.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '')
    const cleanCity = (hit.city || '').toLowerCase().trim()
    return `name:${cleanName}:${cleanCity}`
  }

  for (const provId of envOrder) {
    if (accumulatedHits.length >= query.limit) break

    const provider = getPlacesProvider(provId)
    if (!provider) continue

    const avail = await provider.availability()
    if (!avail.available) {
      reports.push({
        provider: provId,
        status: 'unavailable',
        hits_count: 0,
        latency_ms: 0,
        detail: avail.reason_en
      })
      continue
    }

    providersUsed.push(provId)
    const needed = query.limit - accumulatedHits.length
    const callRes = await provider.search({ ...query, limit: needed }, ctx)

    reports.push({
      provider: provId,
      status: callRes.status,
      hits_count: callRes.data?.hits?.length || 0,
      latency_ms: callRes.latency_ms,
      detail: callRes.detail
    })

    if (callRes.ok && callRes.data?.hits) {
      for (const h of callRes.data.hits) {
        const fp = makeFp(h)
        if (!seenFingerprints.has(fp)) {
          seenFingerprints.add(fp)
          accumulatedHits.push(h)
          if (accumulatedHits.length >= query.limit) break
        }
      }
    }
  }

  return {
    hits: accumulatedHits,
    providers_used: providersUsed,
    provider_reports: reports
  }
}
