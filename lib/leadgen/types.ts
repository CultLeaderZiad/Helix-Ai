import type { LeadGenJob, LeadGenLead, LeadGenEngine, LeadGenMode, LeadGenStatus, LeadGenStage, LeadGenJobKind } from '@/lib/schema'

export type { LeadGenJob, LeadGenLead, LeadGenEngine, LeadGenMode, LeadGenStatus, LeadGenStage, LeadGenJobKind }

export interface LeadGenDecisionMaker {
  name: string
  title?: string
  email?: string
  phone?: string
  linkedin_url?: string
}

export interface LeadGenBrief {
  icp: string
  geos: string[]
  languages: string[]
  exclude_domains: string[]
  max_pages: number
  max_leads: number
  credit_budget: number
  outreach_min_score: number
}

export interface LeadGenSeeds {
  urls: string[]
  sitemap_url?: string | null
  shopify_url?: string | null
  domains_csv?: string | null
}

export interface LeadGenRecipe {
  id: string
  label: string
  label_ar?: string
  description: string
  mode: LeadGenMode
  engine_default: LeadGenEngine
  adaptive: boolean
  max_pages: number
  allow: string[]
  deny: string[]
  shopify?: {
    include_variants?: boolean
    max_products?: number
  }
  link_extractor?: {
    allow_domains?: string[]
    unique?: boolean
  }
  selectors: Record<string, { css: string; attr?: string; adaptive?: boolean }>
  extract: Record<string, string>
  ad_block: boolean
  robots_obey: boolean
}

export interface CreateJobPayload {
  brief: LeadGenBrief
  seeds: LeadGenSeeds
  engine_default: LeadGenEngine
  mode: LeadGenMode
  recipe_id: string
  robots_obey: boolean
  adaptive: boolean
  capture_xhr_pattern?: string | null
  enrich_emails: boolean
  generate_outreach: boolean
  job_kind?: LeadGenJobKind
  find?: {
    query: string
    sources?: string[]
    limit?: number
    radius_m?: number
  }
  hunter?: {
    enabled: boolean
    departments?: string[]
    limit?: number
  }
}

export interface WorkerHealthResponse {
  worker: 'online' | 'offline'
  mode?: 'builtin' | 'scrapling'
  scrapling_version?: string
  engines: LeadGenEngine[]
  engines_available?: { http: boolean; dynamic: boolean; stealth: boolean }
  browsers_ready: boolean
  proxy: 'configured' | 'off'
  robots_default: boolean
  queue_depth: number
  control_plane: 'helix-ai'
  quotas?: {
    stealth_month_used: number
    stealth_month_cap: number
    browser_seconds_used: number
    browser_seconds_cap: number
  }
  pause_semantics?: 'tab_driven_ticks'
  error?: string
}

export interface CreateJobResponse {
  job_id: string
  status: LeadGenStatus
  stage: LeadGenStage
  stage_label: string
  stage_index: number
  stages_total: number
  credits_used: number
  created_at: string
}
