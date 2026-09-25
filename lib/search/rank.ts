import { NormalizedSearchResult } from './normalize'

/**
 * Merges duplicate search results and ranks them deterministically:
 * Rank = 0.35 source agreement + 0.25 has website + 0.2 contact signals + 0.1 geo match + 0.1 provider rank
 */
export function mergeAndRankResults(
  results: NormalizedSearchResult[],
  queryContext?: { city?: string; country?: string }
): NormalizedSearchResult[] {
  const mergedMap = new Map<string, NormalizedSearchResult>()

  for (const item of results) {
    const key = item.domain || item.fingerprint

    if (!mergedMap.has(key)) {
      mergedMap.set(key, { ...item, sources: [...item.sources] })
    } else {
      const existing = mergedMap.get(key)!
      // Merge sources
      for (const s of item.sources) {
        if (!existing.sources.includes(s)) existing.sources.push(s)
      }
      // Merge payload properties (preserve existing payload while filling gaps)
      existing.payload = { ...item.payload, ...existing.payload }
      if (!existing.url && item.url) existing.url = item.url
      if (!existing.snippet && item.snippet) existing.snippet = item.snippet
      if (!existing.place_id && item.place_id) {
        existing.place_id = item.place_id
        existing.place_provider = item.place_provider
      }
    }
  }

  const mergedList = Array.from(mergedMap.values())

  // Compute scoring weights
  const scored = mergedList.map((item, index) => {
    let score = 0

    // 1. Source agreement (.35)
    score += Math.min(item.sources.length * 0.175, 0.35)

    // 2. Has website (.25)
    if (item.url && item.domain) {
      score += 0.25
    }

    // 3. Contact signals (.2)
    const hasPhone = Boolean(item.payload?.phone)
    const hasAddress = Boolean(item.payload?.address)
    if (hasPhone) score += 0.1
    if (hasAddress) score += 0.1

    // 4. Geo match (.1)
    if (queryContext?.city && item.payload?.city) {
      if (item.payload.city.toLowerCase() === queryContext.city.toLowerCase()) {
        score += 0.1
      }
    }

    // 5. Initial rank preservation (.1)
    const rankFraction = Math.max(0, (50 - index) / 50) * 0.1
    score += rankFraction

    return { item, score }
  })

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score)

  return scored.map(s => s.item)
}
