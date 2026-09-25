import { PlacesQuery, PlaceHit, CallCtx } from '@/lib/search/places/types'
import { searchPlacesWithFallback, PlacesChainResult } from '@/lib/search/places/index'
import { parseSearchQuery, ParsedSearchQuery } from '@/lib/search/query-parse'

export interface FindLeadsOptions {
  query: string
  limit?: number // 10, 20, 40, 60
  radiusM?: number // default 50000 (50 km)
  cityOverride?: string
  countryOverride?: string
  ctx?: CallCtx
}

export interface FindLeadsResult {
  parsed: ParsedSearchQuery
  hits: PlaceHit[]
  chainResult: PlacesChainResult
  totalFound: number
  websitesToEnrich: string[]
}

/**
 * Finds business leads matching natural language query:
 * - Parses query into intent, category, city, country.
 * - Queries the Places provider fallback chain (Google Places -> OSM -> ...).
 * - Extracts websites for downstream asynchronous site enrichment ticks.
 */
export async function findLeadsPipeline(options: FindLeadsOptions): Promise<FindLeadsResult> {
  const { query, limit = 20, radiusM = 50000, cityOverride, countryOverride, ctx } = options

  const parsed = parseSearchQuery(query)
  const city = cityOverride || parsed.city
  const country = countryOverride || parsed.country

  const placesQuery: PlacesQuery = {
    text: parsed.raw,
    category: parsed.category,
    city,
    country,
    radiusM: Math.min(radiusM, 50000),
    language: parsed.language,
    limit: Math.min(limit, 60)
  }

  const chainResult = await searchPlacesWithFallback(placesQuery, ctx)

  // Collect websites to enrich
  const websitesToEnrich: string[] = []
  const seenWebsites = new Set<string>()

  for (const hit of chainResult.hits) {
    if (hit.website && hit.website.trim().length > 0) {
      let clean = hit.website.trim()
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`
      }
      try {
        const u = new URL(clean)
        const root = u.hostname.replace(/^www\./, '').toLowerCase()
        if (!seenWebsites.has(root)) {
          seenWebsites.add(root)
          websitesToEnrich.push(clean)
        }
      } catch {}
    }
  }

  return {
    parsed,
    hits: chainResult.hits,
    chainResult,
    totalFound: chainResult.hits.length,
    websitesToEnrich
  }
}
