import type { LeadGenStage } from '@/lib/schema'

export type FetchEngineId = 'http' | 'dynamic' | 'stealth'

export interface FetchResult {
  ok: boolean
  engine: FetchEngineId
  status: number
  fetch_status: 'ok' | 'blocked' | 'rate_limited' | 'error'
  html: string
  finalUrl?: string
  browser_ms?: number
  error?: string
  escalated_from?: FetchEngineId
}

export interface JobCursor {
  seed_index: number
  url_queue: string[]
  processed: number
  stage?: LeadGenStage
}

export interface ExtractedContacts {
  company_name: string
  emails: string[]
  phones: string[]
  address: string | null
  markdown_excerpt: string
  extract_status: 'empty' | 'partial' | 'ok' | 'failed'
}

export interface OutreachDraft {
  subject: string
  body: string
  dm: string
  personalization_points: string[]
  skipped_reason?: string
}
