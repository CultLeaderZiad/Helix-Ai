import type { LeadGenJob, LeadGenLead, LeadGenEngine, LeadGenMode, LeadGenStatus, LeadGenStage } from '@/lib/schema'

export type { LeadGenJob, LeadGenLead, LeadGenEngine, LeadGenMode, LeadGenStatus, LeadGenStage }

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
}

export interface WorkerHealthResponse {
  worker: 'online' | 'offline'
  scrapling_version?: string
  engines: LeadGenEngine[]
  browsers_ready: boolean
  proxy: 'configured' | 'off'
  robots_default: boolean
  queue_depth: number
  control_plane: 'helix-ai'
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
