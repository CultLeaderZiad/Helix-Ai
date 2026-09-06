/**
 * Helix AI — canonical data model.
 *
 * These types are the contract every screen is built against. When the Neon
 * database is wired in, the Drizzle tables mirror these names 1:1 (snake_case
 * columns, same table names). Nothing in the UI may reference a field that is
 * not declared here.
 */

export type UserRole = 'admin' | 'client'

export interface User {
  id: string
  email: string
  role: UserRole
  /** Null for agency admins. Set for client portal users. */
  client_id: string | null
  full_name: string
  last_login_at: string | null
  failed_login_count: number
  locked_until: string | null
  created_at: string
}

export interface Session {
  id: string
  user_id: string
  /** 30 days when "keep me signed in" is checked, otherwise 12 hours. */
  expires_at: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

export type ClientStatus = 'active' | 'onboarding' | 'paused' | 'churned'

export interface Client {
  id: string
  name: string
  slug: string
  status: ClientStatus
  timezone: string
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD'
  account_manager_id: string
  created_at: string
}

export type IntegrationProvider =
  | 'gohighlevel'
  | 'twilio'
  | 'stripe'
  | 'google_calendar'
  | 'calendly'
  | 'meta_ads'
  | 'google_ads'
  | 'hubspot'

export type IntegrationStatus = 'connected' | 'degraded' | 'disconnected' | 'pending'

export interface ClientIntegration {
  id: string
  client_id: string
  provider: IntegrationProvider
  status: IntegrationStatus
  /** Heartbeat written by the sync worker. Liveness UI is derived from this. */
  last_ping_at: string | null
  last_error: string | null
  last_error_at: string | null
  connected_at: string | null
}

export type ContactStage =
  | 'new_lead'
  | 'contacted'
  | 'qualified'
  | 'booked'
  | 'showed'
  | 'no_show'
  | 'closed_won'
  | 'closed_lost'

export interface Contact {
  id: string
  client_id: string
  first_name: string
  last_name: string
  /** E.164, e.g. +14155550132 */
  phone: string
  email: string | null
  stage: ContactStage
  source: string
  created_at: string
  updated_at: string
}

export type BookingStatus = 'scheduled' | 'confirmed' | 'completed' | 'no_show' | 'cancelled' | 'rescheduled'

export interface Booking {
  id: string
  client_id: string
  contact_id: string
  starts_at: string
  ends_at: string
  status: BookingStatus
  /** True when the booking came back after a no-show or cancellation via automation. */
  recovered: boolean
  recovered_by_system: 'no_show_recovery' | 'reactivation' | 'speed_to_lead' | null
  created_at: string
}

export type AttributionActor = 'system' | 'human'

export interface AttributionEvent {
  id: string
  client_id: string
  contact_id: string
  booking_id: string | null
  invoice_id: string | null
  actor: AttributionActor
  /** e.g. 'sms_sent', 'call_placed', 'booking_created', 'payment_collected' */
  event_type: string
  system_name: string | null
  user_id: string | null
  payload: Record<string, unknown>
  occurred_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void'

export interface Invoice {
  id: string
  client_id: string
  contact_id: string | null
  number: string
  /** Minor units (cents). Format at the edge, never store floats. */
  amount_cents: number
  currency: Client['currency']
  status: InvoiceStatus
  issued_at: string
  due_at: string
  paid_at: string | null
}
