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

export interface Client {
  id: string
  business_name: string
  vertical: string | null
  timezone: string | null
  dialect: string | null
  whatsapp_number: string | null
  status: ClientStatus
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
  | 'DEMO_BOOKED'
  | 'QUALIFIED_TO_BUY'
  | 'UNQUALIFIED_TO_BUY'
  | 'DECISION_MAKER_BOUGHT_IN'
  | 'CONTRACT_SENT'
  | 'CLOSED_WON'
  | 'CLOSED_LOST'

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

/** The only task kinds the queue runner currently understands. */
export type AgentTaskKind = 'apply_contact_fact'

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