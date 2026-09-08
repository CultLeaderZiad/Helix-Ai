import type { EvidenceBand } from '../schema'

/**
 * Explicit source-tool → evidence-band lookup. The band is a property of WHICH
 * tool observed a fact, decided here in application code — never a model
 * self-confidence score, and never something a caller may pass in.
 *
 * A tool that is not listed here fails closed: evidenceBandForTool returns
 * null and recordContactFact refuses to store anything for it.
 */
export const TOOL_EVIDENCE_BANDS = {
  // Verified: the source system itself received the party's confirmation or
  // produced a machine-checked record of the fact.
  'missed_call_response.sms_thread': 'verified',
  'booking_receptionist.booking_confirmation': 'verified',
  'booking_receptionist.reschedule_confirmation': 'verified',
  'lead_attribution.form_submission': 'verified',
  'ar_collections.payment_receipt': 'verified',
  'reactivation.opt_in_reply': 'verified',
  // Probable: strong signal from a system-mediated exchange that was not an
  // explicit party confirmation of the recorded field.
  'missed_call_response.callback': 'probable',
  'lead_attribution.utm_match': 'probable',
  'reactivation.reply_sentiment': 'probable',
  'ar_collections.promise_to_pay': 'probable',
  // Possible: ambient or secondhand signal; human review required.
  'missed_call_response.voicemail_detection': 'possible',
  'reactivation.number_ported': 'possible',
  'lead_attribution.ip_geo': 'possible',
} as const satisfies Record<string, EvidenceBand>

export type SourceTool = keyof typeof TOOL_EVIDENCE_BANDS

/** Band carried by a tool's observations, or null when the tool is not
 *  authorized to record evidence at all (fail closed). */
export function evidenceBandForTool(sourceTool: string): EvidenceBand | null {
  return (TOOL_EVIDENCE_BANDS as Record<string, EvidenceBand>)[sourceTool] ?? null
}
