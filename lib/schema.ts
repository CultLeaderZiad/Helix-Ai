/**
 * Helix AI — Supabase public-schema contracts.
 * Auth users and sessions are owned by Supabase Auth, not public tables.
 * Authorization reads signed app_metadata, never editable user_metadata.
 */
export type UserRole = 'agency_admin' | 'client_user' | 'client_staff'
export type ClientStatus = 'active' | 'onboarding' | 'paused' | 'churned'
export type SystemType =
  | 'missed_call_response'
  | 'booking_receptionist'
  | 'lead_attribution'
  | 'lead_reactivation'
  | 'ar_collections'

export interface Profile {
  id: string
  client_id: string | null
  role: UserRole
  full_name: string | null
  email: string | null
  created_at: string
}

export type RegionTier = 'gcc_enterprise' | 'mena_sme'
export type RiskLevel = 'healthy' | 'watch' | 'at_risk' | 'critical'

export interface Client {
  id: string
  business_name: string
  vertical: string | null
  timezone: string | null
  dialect: string | null
  whatsapp_number: string | null
  status: ClientStatus
  country?: string | null
  region_tier?: RegionTier
  current_health_score?: number | null
  current_risk_level?: RiskLevel
  last_health_calculated_at?: string | null
  primary_champion_user_id?: string | null
  last_portal_activity_at?: string | null
  churn_risk_notes?: string | null
  created_at: string
  updated_at: string
}

export interface ClientSystem {
  id: string
  client_id: string
  system_type: SystemType
  provenance: 'template' | 'custom'
  /** Existing Supabase column implementing the system visibility flag. */
  visible_to_client: boolean
  active: boolean
  stage?: DealStage
  config: Record<string, unknown>
  setup_fee_cents: number | null
  monthly_retainer_cents: number | null
  created_at: string
}

export type IntegrationStatus = 'connected' | 'degraded' | 'disconnected' | 'unknown'

/** Safe readout projection: deliberately excludes the private webhook URL. */
export interface ClientIntegration {
  id: string
  client_id: string
  system_type: string
  status: IntegrationStatus
  last_ping_at: string | null
  created_at: string
}

export interface Contact {
  id: string
  client_id: string
  full_name: string | null
  phone: string | null
  email: string | null
  company_name: string | null
  company_id: string | null
  source: string | null
  lead_status: 'cold' | 'warm' | 'hot' | 'customer' | 'lost'
  utm_campaign: string | null
  utm_source: string | null
  cost_per_lead_cents: number | null
  custom_fields: Record<string, unknown>
  do_not_contact: boolean
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  client_id: string
  contact_id: string
  scheduled_at: string
  status: 'booked' | 'confirmed' | 'completed' | 'no_show' | 'cancelled'
  cal_com_booking_id: string | null
  created_at: string
}

export interface AttributionEvent {
  id: string
  client_id: string
  contact_id: string
  event_type: 'lead_captured' | 'qualified' | 'booked' | 'closed_won' | 'closed_lost'
  revenue_cents: number | null
  ad_platform: string | null
  campaign_id: string | null
  occurred_at: string
}

export interface Invoice {
  id: string
  client_id: string
  contact_id: string | null
  amount_cents: number
  due_date: string
  status: 'pending' | 'overdue' | 'paid' | 'disputed'
  created_at: string
}

/**
 * CRM intelligence layer. Patterns ported from trycompai/crm (MIT) and
 * re-implemented for this multi-tenant schema; nothing is imported from it.
 */
export type DealStage =
  | 'new_lead'
  | 'engaged'
  | 'studio_completed'
  | 'call_booked'
  | 'proposal_sent'
  | 'closed_won'
  | 'closed_lost'
  | 'DEMO_BOOKED'
  | 'QUALIFIED_TO_BUY'
  | 'UNQUALIFIED_TO_BUY'
  | 'DECISION_MAKER_BOUGHT_IN'
  | 'CONTRACT_SENT'

export const FUNNEL_STAGES: { key: DealStage; label: string; order: number }[] = [
  { key: 'new_lead', label: 'New Lead', order: 1 },
  { key: 'engaged', label: 'Engaged', order: 2 },
  { key: 'studio_completed', label: 'Studio Completed', order: 3 },
  { key: 'call_booked', label: 'Call Booked', order: 4 },
  { key: 'proposal_sent', label: 'Proposal Sent', order: 5 },
  { key: 'closed_won', label: 'Closed Won', order: 6 },
  { key: 'closed_lost', label: 'Closed Lost', order: 7 },
]

export type CrmActivityType =
  | 'note'
  | 'call'
  | 'email'
  | 'meeting'
  | 'task'
  | 'stage_change'
  | 'enrichment'

export type CustomPropertyEntity = 'company' | 'contact' | 'deal'
export type CustomPropertyType =
  | 'text'
  | 'long_text'
  | 'number'
  | 'date'
  | 'checkbox'
  | 'select'
  | 'url'
  | 'email'
  | 'phone'
  | 'user'

/** Set by WHICH source tool observed a fact — never a model self-score. */
export type EvidenceBand = 'verified' | 'probable' | 'possible'

export type FactStatus = 'pending' | 'applied' | 'dismissed' | 'superseded'

/** The task kinds the queue runner understands. */
export type AgentTaskKind =
  | 'apply_contact_fact'
  | 'calculate_client_health'
  | 'create_churn_signal'
  | 'notify_churn_risk'
  | 'schedule_qbr'
  | 'generate_monthly_report'
  | 'check_portal_activity'
  | 'route_inbound_lead'
  | 'classify_omnichannel_message'
  | 'triage_customer_review'
  | 'audit_competitor_prices'
  | 'generate_contract_agreement'

export interface Company {
  id: string
  client_id: string
  name: string
  domain: string | null
  industry: string | null
  location: string | null
  employee_count: number | null
  phone: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  client_id: string
  company_id: string | null
  name: string
  stage: DealStage
  value_cents: number | null
  currency: string
  expected_close_date: string | null
  owner_profile_id: string | null
  source: string | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface CrmActivity {
  id: string
  client_id: string
  company_id: string | null
  contact_id: string | null
  deal_id: string | null
  type: CrmActivityType
  subject: string | null
  body: string | null
  occurred_at: string
  due_at: string | null
  completed_at: string | null
  created_by_profile_id: string | null
  meta: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface DealContact {
  deal_id: string
  contact_id: string
  client_id: string
  role: string | null
  created_at: string
}

export interface CustomPropertyOption {
  label: string
  value?: string
}

export interface CustomProperty {
  id: string
  client_id: string
  entity: CustomPropertyEntity
  key: string
  label: string
  type: CustomPropertyType
  agent_filled: boolean
  agent_brief: string | null
  required: boolean
  show_on_sheet: boolean
  show_on_table: boolean
  show_on_filter: boolean
  position: number
  options: CustomPropertyOption[]
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface ContactFact {
  id: string
  client_id: string
  contact_id: string
  field_name: string
  field_value: string
  evidence_band: EvidenceBand
  source_tool: string
  status: FactStatus
  evidence: Array<Record<string, unknown>>
  score: number | null
  method: string | null
  source_url: string | null
  session_id: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  observed_at: string
  superseded_at: string | null
  created_at: string
}

export interface AgentTask {
  id: string
  client_id: string
  contact_id: string | null
  company_id: string | null
  deal_id: string | null
  kind: string
  reason: string
  payload: Record<string, unknown>
  priority: number
  budget: number
  attempts: number
  due_at: string
  leased_until: string | null
  session_id: string | null
  started_at: string | null
  finished_at: string | null
  outcome: string | null
  subject: string | null
  created_at: string
}

export interface WhatsAppCredential {
  id: string
  client_id: string
  waba_id: string | null
  phone_number_id: string | null
  phone_number: string | null
  status: 'pending' | 'connected' | 'degraded' | 'disconnected'
  quality_rating: string | null
  last_ping_at: string | null
  created_at: string
  updated_at: string
}

export interface AdminUpdate {
  id: string
  title: string
  body: string
  severity: 'info' | 'warning' | 'critical'
  published_at: string
  created_by_profile_id: string | null
  created_at: string
}

export interface StaffInvite {
  id: string
  client_id: string | null
  email: string
  role: UserRole
  token: string
  expires_at: string
  accepted_at: string | null
  created_at: string
}

export interface ContactNote {
  id: string
  client_id: string
  contact_id: string
  author_profile_id: string | null
  body: string
  created_at: string
  updated_at: string
}

export interface AttentionQueueItem {
  id: string
  client_id: string
  contact_id: string | null
  source: 'voice_agent' | 'whatsapp_agent' | 'system_alert'
  observation: string
  suggested_action: string | null
  confidence: number | null
  status: 'pending' | 'approved' | 'dismissed'
  meta: Record<string, unknown>
  reviewed_at: string | null
  reviewed_by_profile_id: string | null
  created_at: string
}

export interface ExportLog {
  id: string
  client_id: string
  actor_profile_id: string | null
  export_type: 'contacts' | 'deals' | 'activities' | 'facts'
  row_count: number
  format: 'csv' | 'json'
  created_at: string
}

export interface OnboardingChecklistItem {
  id: string
  client_id: string
  item_key: string
  title: string
  description: string | null
  completed: boolean
  completed_at: string | null
  completed_by_profile_id: string | null
  created_at: string
}

export interface MonthlyFeedback {
  id: string
  client_id: string
  cycle_date: string
  nps_score: number | null
  feedback_text: string | null
  submitted_by_profile_id: string | null
  created_at: string
}

export interface ChurnRetentionFlag {
  id: string
  client_id: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  reason: string
  flagged_at: string
  resolved_at: string | null
  resolution_notes: string | null
  created_at: string
}

export type SupportTicketStatus = 'open' | 'resolved'

export interface SupportTicket {
  id: string
  client_id: string
  subject: string
  status: SupportTicketStatus
  unread_by_admin: boolean
  unread_by_client: boolean
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  client_id: string
  sender_profile_id: string
  body: string
  created_at: string
}

export interface ClientHealthScore {
  id: string
  client_id: string
  score: number
  risk_level: RiskLevel
  portal_activity_score: number
  system_usage_score: number
  support_sentiment_score: number
  report_engagement_score: number
  payment_health_score: number
  champion_engagement_score: number
  calculated_at: string
  previous_score?: number | null
  notes?: string | null
  created_at: string
  updated_at: string
}

export type ChurnSignalType =
  | 'low_portal_activity'
  | 'no_report_opens'
  | 'high_support_volume'
  | 'negative_sentiment'
  | 'payment_late'
  | 'champion_inactive'
  | 'system_offline'
  | 'integration_failure'
  | 'missed_qbr'
  | 'scope_complaint'
  | 'other'

export type ChurnSignalSeverity = 'low' | 'medium' | 'high' | 'critical'

export interface ClientChurnSignal {
  id: string
  client_id: string
  signal_type: ChurnSignalType
  severity: ChurnSignalSeverity
  title: string
  description?: string | null
  detected_at: string
  resolved_at?: string | null
  resolved_by?: string | null
  related_entity_type?: string | null
  related_entity_id?: string | null
  created_at: string
}

export type SuccessEventType =
  | 'first_value_delivered'
  | 'monthly_report_opened'
  | 'positive_feedback'
  | 'system_usage_spike'
  | 'qbr_completed'
  | 'upsell_accepted'
  | 'referral_given'
  | 'other'

export interface ClientSuccessEvent {
  id: string
  client_id: string
  event_type: SuccessEventType
  title: string
  description?: string | null
  value_impact?: number | null
  occurred_at: string
  created_by?: string | null
  created_at: string
}

export interface ClientHealthSnapshot {
  id: string
  client_id: string
  score: number
  risk_level: RiskLevel
  snapshot_date: string
  created_at: string
}
