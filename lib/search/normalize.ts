import { PlaceHit } from '@/lib/search/places/types'
import { TinyFishSearchResultItem } from './providers/tinyfish-search'

export interface NormalizedSearchResult {
  result_type: 'business' | 'web_page' | 'social_profile' | 'news'
  title: string
  url?: string
  domain?: string
  snippet?: string
  sources: string[]
  place_id?: string
  place_provider?: string
  payload: Record<string, any>
  fingerprint: string
  in_leads?: boolean
  lead_id?: string
}

export function normalizePlaceHit(hit: PlaceHit): NormalizedSearchResult {
  let domain = ''
  if (hit.website) {
    try {
      domain = new URL(hit.website).hostname.replace(/^www\./, '').toLowerCase()
    } catch {}
  }

  const fingerprint = hit.provider_place_id || domain || hit.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '')

  return {
    result_type: 'business',
    title: hit.name,
    url: hit.website || hit.maps_url,
    domain: domain || undefined,
    snippet: [hit.address, hit.types?.join(', ')].filter(Boolean).join(' · '),
    sources: [hit.provider],
    place_id: hit.provider_place_id,
    place_provider: hit.provider,
    payload: {
      address: hit.address,
      city: hit.city,
      country: hit.country,
      phone: hit.phone,
      website: hit.website,
      maps_url: hit.maps_url,
      rating: hit.rating,
      rating_count: hit.rating_count,
      types: hit.types,
      business_status: hit.business_status,
      places: { [hit.provider]: hit }
    },
    fingerprint
  }
}

export function normalizeWebHit(hit: TinyFishSearchResultItem): NormalizedSearchResult {
  let domain = ''
  let result_type: NormalizedSearchResult['result_type'] = 'web_page'

  try {
    const u = new URL(hit.url)
    domain = u.hostname.replace(/^www\./, '').toLowerCase()
    if (domain.includes('instagram.com') || domain.includes('tiktok.com') || domain.includes('linkedin.com')) {
      result_type = 'social_profile'
    }
  } catch {}

  return {
    result_type,
    title: hit.title,
    url: hit.url,
    domain: domain || undefined,
    snippet: hit.snippet,
    sources: ['tinyfish_search'],
    payload: {
      position: hit.position,
      site_name: hit.site_name,
      date: hit.date
    },
    fingerprint: domain || hit.url
  }
}
