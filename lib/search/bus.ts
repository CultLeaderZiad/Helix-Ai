import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'
import { SearchActionPayload, SearchActionResult } from './types'
import { enrichDomain } from './enrich/enrich-domain'
import { findLeadsPipeline } from './find-leads'
import { TinyFishSearchProvider } from './providers/tinyfish-search'
import { normalizePlaceHit, normalizeWebHit, NormalizedSearchResult } from './normalize'
import { mergeAndRankResults } from './rank'
import { searchHelixLeadsDb } from './providers/helix-leads-db'

/**
 * Central Search/Action Bus coordinating all search, enrich, and find requests.
 */
export async function runAction(payload: SearchActionPayload): Promise<SearchActionResult> {
  const { kind, origin, actor, input } = payload
  const supabase = createSupabaseAdminClient()

  // 1. SSRF and basic validations
  if (kind === 'enrich_url') {
    if (!input.url || isPrivateOrLocalhost(input.url)) {
      return { ok: false, status: 'failed', error: 'Invalid or forbidden target URL' }
    }
  } else if (kind === 'search_web' || kind === 'find_leads') {
    if (!input.query || input.query.trim().length === 0) {
      return { ok: false, status: 'failed', error: 'Search query is required' }
    }
  }

  // 2. Insert search_requests
  let requestId: string | undefined
  try {
    const { data: reqRow, error: reqErr } = await (supabase as any)
      .from('search_requests')
      .insert({
        client_id: actor.clientId,
        user_id: actor.userId || null,
        kind,
        origin,
        query: input.query || input.url || '',
        params: input.params || {},
        status: 'running',
        providers_used: []
      })
      .select('id')
      .single()

    if (!reqErr && reqRow) {
      requestId = reqRow.id
    }
  } catch (err) {
    console.warn('[search/bus] Failed to insert search_requests record:', err)
  }

  const providersUsed: string[] = []

  try {
    // 3. Dispatch based on kind
    if (kind === 'enrich_url') {
      const enrichRes = await enrichDomain({
        domainOrUrl: input.url!,
        pagesPerSite: 4,
        clientId: actor.clientId,
        hunter: input.params?.hunter
      })

      providersUsed.push(...enrichRes.sources)

      if (requestId) {
        await (supabase as any)
          .from('search_events')
          .insert({
            request_id: requestId,
            client_id: actor.clientId,
            provider: 'helix_enrich',
            status: 'ok',
            units: 1,
            cost_micros: 0,
            detail: `Enriched ${enrichRes.domain} (${enrichRes.pages_checked} pages)`
          })
          .catch(() => {})

        await (supabase as any)
          .from('search_requests')
          .update({
            status: 'succeeded',
            providers_used: providersUsed,
            results_count: 1,
            completed_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .catch(() => {})
      }

      return {
        ok: true,
        request_id: requestId,
        status: 'succeeded',
        data: enrichRes,
        providers_used: providersUsed
      }
    } else if (kind === 'search_web' || kind === 'find_leads') {
      const mode = input.mode || 'everything'
      const query = input.query!.trim()
      const normalizedHits: NormalizedSearchResult[] = []

      // In parallel:
      // A. Places chain (if mode === 'everything' or 'businesses')
      let placesPromise: Promise<any> = Promise.resolve(null)
      if (mode === 'everything' || mode === 'businesses') {
        placesPromise = findLeadsPipeline({
          query,
          limit: input.limit || 20,
          cityOverride: input.country,
          ctx: { clientId: actor.clientId, userId: actor.userId, requestId }
        }).catch(err => {
          console.warn('[search/bus] Places pipeline error:', err)
          return null
        })
      }

      // B. TinyFish Web Search (if mode === 'everything' || 'web' || 'social' || 'news')
      let webPromise: Promise<any> = Promise.resolve(null)
      if (mode !== 'businesses') {
        const tfSearch = new TinyFishSearchProvider()
        webPromise = tfSearch.search(query, {
          language: input.language,
          location: input.country,
          ctx: { clientId: actor.clientId, userId: actor.userId, requestId }
        }).catch(err => {
          console.warn('[search/bus] TinyFish search error:', err)
          return null
        })
      }

      // C. Cross reference tenant's existing leads
      const existingLeadsPromise = searchHelixLeadsDb(actor.clientId, query, 5)

      const [placesRes, webRes, existingLeads] = await Promise.all([
        placesPromise,
        webPromise,
        existingLeadsPromise
      ])

      // Record places hits and events
      if (placesRes && placesRes.chainResult) {
        providersUsed.push(...placesRes.chainResult.providers_used)
        for (const hit of placesRes.hits) {
          normalizedHits.push(normalizePlaceHit(hit))
        }

        if (requestId) {
          for (const rep of placesRes.chainResult.provider_reports) {
            await (supabase as any)
              .from('search_events')
              .insert({
                request_id: requestId,
                client_id: actor.clientId,
                provider: rep.provider,
                status: rep.status,
                latency_ms: rep.latency_ms,
                units: 1,
                detail: rep.detail || `Returned ${rep.hits_count} hits`
              })
              .catch(() => {})
          }
        }
      }

      // Record web hits and events
      if (webRes) {
        if (webRes.ok && webRes.data?.results) {
          providersUsed.push('tinyfish_search')
          for (const item of webRes.data.results) {
            normalizedHits.push(normalizeWebHit(item))
          }
        }

        if (requestId) {
          await (supabase as any)
            .from('search_events')
            .insert({
              request_id: requestId,
              client_id: actor.clientId,
              provider: 'tinyfish_search',
              status: webRes.status,
              http_status: webRes.http_status,
              latency_ms: webRes.latency_ms,
              units: 1,
              detail: webRes.detail || `Returned ${webRes.data?.results?.length ?? 0} results`
            })
            .catch(() => {})
        }
      }

      // Merge and rank
      const rankedResults = mergeAndRankResults(normalizedHits, {
        city: placesRes?.parsed?.city,
        country: placesRes?.parsed?.country
      })

      // Cross-reference existing tenant leads
      if (existingLeads && existingLeads.length > 0) {
        const leadDomainSet = new Set(existingLeads.map((l: any) => l.domain).filter(Boolean))
        for (const item of rankedResults) {
          if (item.domain && leadDomainSet.has(item.domain)) {
            item.in_leads = true
          }
        }
      }

      // Persist results
      if (requestId) {
        let rank = 1
        for (const res of rankedResults.slice(0, 50)) {
          await (supabase as any)
            .from('search_results')
            .insert({
              request_id: requestId,
              client_id: actor.clientId,
              rank: rank++,
              result_type: res.result_type,
              title: res.title,
              url: res.url || null,
              domain: res.domain || null,
              snippet: res.snippet || null,
              sources: res.sources,
              place_id: res.place_id || null,
              place_provider: res.place_provider || null,
              payload: res.payload,
              fingerprint: res.fingerprint
            })
            .catch(() => {})
        }

        await (supabase as any)
          .from('search_requests')
          .update({
            status: rankedResults.length > 0 ? 'succeeded' : 'partial',
            providers_used: providersUsed,
            results_count: rankedResults.length,
            completed_at: new Date().toISOString()
          })
          .eq('id', requestId)
          .catch(() => {})
      }

      return {
        ok: true,
        request_id: requestId,
        status: rankedResults.length > 0 ? 'succeeded' : 'partial',
        data: {
          results: rankedResults,
          total: rankedResults.length,
          existing_matches: existingLeads
        },
        providers_used: providersUsed
      }
    }

    return {
      ok: false,
      request_id: requestId,
      status: 'failed',
      error: `Unsupported action kind: ${kind}`
    }
  } catch (err: any) {
    if (requestId) {
      await (supabase as any)
        .from('search_requests')
        .update({
          status: 'failed',
          error_msg: err?.message || 'Action failed',
          completed_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .catch(() => {})
    }

    return {
      ok: false,
      request_id: requestId,
      status: 'failed',
      error: err?.message || 'Search bus execution error'
    }
  }
}
