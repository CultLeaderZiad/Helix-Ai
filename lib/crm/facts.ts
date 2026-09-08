import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { ContactFact } from '@/lib/schema'
import { evidenceBandForTool } from './evidence-bands'

export interface RecordFactInput {
  client_id: string
  contact_id: string
  field_name: string
  field_value: string
  source_tool: string
  /** Raw observations behind the fact; the band still comes from the tool. */
  evidence?: Array<Record<string, unknown>>
  method?: string
  source_url?: string
  session_id?: string
  /** Deterministic evidence price computed by ledger rules, never a model score. */
  score?: number
}

/**
 * The only sanctioned insert path for AI-observed facts. The evidence band
 * comes from the explicit tool lookup in evidence-bands.ts — not from the
 * caller, not from any model. Unknown tools are refused outright.
 *
 * Pass the service-role client (lib/supabase-admin): contact_facts is
 * SELECT-only over REST, so tenant sessions cannot mint evidence. Verified
 * bands auto-enqueue their apply task via a database trigger; humans review
 * the rest at /dashboard/facts.
 */
export async function recordContactFact(
  supabase: SupabaseClient,
  input: RecordFactInput,
): Promise<ContactFact> {
  const band = evidenceBandForTool(input.source_tool)
  if (!band) {
    throw new Error(
      `Source tool '${input.source_tool}' is not registered in the evidence-band lookup; fact refused.`,
    )
  }
  const { data, error } = await supabase
    .from('contact_facts')
    .insert({
      client_id: input.client_id,
      contact_id: input.contact_id,
      field_name: input.field_name,
      field_value: input.field_value,
      evidence_band: band,
      source_tool: input.source_tool,
      evidence: input.evidence ?? [],
      method: input.method ?? null,
      source_url: input.source_url ?? null,
      session_id: input.session_id ?? null,
      score: input.score ?? null,
    })
    .select(
      'id, client_id, contact_id, field_name, field_value, evidence_band, source_tool, status, evidence, score, method, source_url, session_id, reviewed_by, reviewed_at, observed_at, superseded_at, created_at',
    )
    .single()
  if (error || !data) {
    throw new Error(`Failed to record fact: ${error?.message ?? 'no row returned'}`)
  }
  return data as ContactFact
}
