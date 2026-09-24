import type { LeadGenBrief } from './types'

export const SCRAPLING_CREDIT_BASE = Number(process.env.SCRAPLING_CREDIT_BASE || '1.0')
export const SCRAPLING_CREDIT_PER_PAGE = Number(process.env.SCRAPLING_CREDIT_PER_PAGE || '0.15')
export const ENRICH_CREDIT_PER_LEAD = 0.25
export const OUTREACH_CREDIT_PER_LEAD = 0.10

export interface CreditEstimateInput {
  maxPages: number
  maxLeads: number
  enrichEmails: boolean
  generateOutreach: boolean
}

export function estimateJobCredits(input: CreditEstimateInput): number {
  const base = SCRAPLING_CREDIT_BASE
  const pagesCost = (input.maxPages || 0) * SCRAPLING_CREDIT_PER_PAGE
  const enrichCost = input.enrichEmails ? (input.maxLeads || 0) * ENRICH_CREDIT_PER_LEAD : 0
  const outreachCost = input.generateOutreach ? (input.maxLeads || 0) * OUTREACH_CREDIT_PER_LEAD : 0
  
  const total = base + pagesCost + enrichCost + outreachCost
  return Math.round(total * 100) / 100
}

/**
 * Record usage on the job.
 * Note: Helix-Ai billing integration hook is pending dedicated ledger tables.
 * TODO(billing): When invoice/usage metering ledger table is provisioned for add-on usage,
 * insert debits against client_id account balance here. Never fake a charge.
 */
export async function trackJobUsage(creditsUsed: number, clientId: string, jobId: string) {
  // Honest tracking hook: usage is persisted on the leadgen_jobs row directly.
  return {
    tracked: true,
    creditsUsed,
    clientId,
    jobId,
    billingHook: 'pending_ledger_provisioning',
  }
}
