export type PlacesProviderId = 'google_places' | 'foursquare' | 'osm_overpass' | 'brightdata_serp'

export interface PlacesQuery {
  text: string
  category?: string
  city?: string
  country?: string // ISO2 (e.g. SA, AE, EG)
  lat?: number
  lng?: number
  radiusM?: number // <= 50000
  language?: 'en' | 'ar'
  limit: number // <= 60
}

export interface PlaceHit {
  provider: PlacesProviderId
  provider_place_id: string
  name: string
  address?: string
  city?: string
  country?: string
  phone?: string
  website?: string
  maps_url?: string
  rating?: number
  rating_count?: number
  types?: string[]
  business_status?: string
  fetched_at: string
}

export interface ProviderAvailability {
  id: PlacesProviderId | string
  available: boolean
  reason_en?: string
  reason_ar?: string
  env?: string[]
  quota?: {
    used: number
    cap: number
    period: 'minute' | 'hour' | 'day' | 'month'
  }
  note_en?: string
  note_ar?: string
}

export interface CallCtx {
  clientId?: string | null
  userId?: string | null
  requestId?: string
}

export interface ProviderCall<T> {
  ok: boolean
  status: 'ok' | 'empty' | 'not_found' | 'blocked' | 'rate_limited' | 'quota_blocked' | 'unavailable' | 'error' | 'pending'
  http_status?: number
  latency_ms: number
  units: number
  cost_micros: number
  external_ref?: string
  detail?: string
  data?: T
}

export interface PlacesProvider {
  id: PlacesProviderId
  availability(): Promise<ProviderAvailability>
  search(q: PlacesQuery, ctx?: CallCtx): Promise<ProviderCall<{ hits: PlaceHit[]; nextToken?: string }>>
  unitCost(q: PlacesQuery): { units: number; cost_micros: number }
}
