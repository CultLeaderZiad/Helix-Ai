import { ProviderAvailability } from '@/lib/search/places/types'

export type SearchRequestKind = 'search_web' | 'find_leads' | 'enrich_url' | 'get_watch_results' | 'run_watch'
export type SearchRequestOrigin = 'search_page' | 'leadgen' | 'watch_cron' | 'watch_open' | 'mcp'
export type SearchRequestStatus = 'running' | 'succeeded' | 'partial' | 'failed'

export interface SearchActionActor {
  type: 'session' | 'api_key'
  userId?: string | null
  clientId: string
  keyId?: string
}

export interface SearchActionPayload {
  kind: SearchRequestKind
  origin: SearchRequestOrigin
  actor: SearchActionActor
  input: {
    query?: string
    url?: string
    mode?: string
    country?: string
    language?: 'en' | 'ar'
    limit?: number
    params?: Record<string, any>
  }
}

export interface SearchActionResult<T = any> {
  ok: boolean
  request_id?: string
  status: SearchRequestStatus
  data?: T
  error?: string
  providers_used?: string[]
}
