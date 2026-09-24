-- ============================================================================
-- HELIX AI — Churn Prevention & Client Health Intelligence Migration
-- File: supabase/migrations/20260924104000_churn_prevention.sql
-- ============================================================================

-- 1. EXTEND EXISTING clients TABLE
alter table public.clients
  add column if not exists current_health_score integer default 70,
  add column if not exists current_risk_level text default 'healthy'
    check (current_risk_level in ('healthy', 'watch', 'at_risk', 'critical')),
  add column if not exists last_health_calculated_at timestamptz,
  add column if not exists primary_champion_user_id uuid references auth.users(id) on delete set null,
  add column if not exists last_portal_activity_at timestamptz,
  add column if not exists churn_risk_notes text;

-- 2. NEW TABLE: client_health_scores
create table if not exists public.client_health_scores (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  
  -- Core score (0–100)
  score integer not null check (score >= 0 and score <= 100),
  risk_level text not null check (risk_level in ('healthy', 'watch', 'at_risk', 'critical')),
  
  -- Component signals (stored for transparency & auditing)
  portal_activity_score integer default 0,
  system_usage_score integer default 0,
  support_sentiment_score integer default 0,
  report_engagement_score integer default 0,
  payment_health_score integer default 0,
  champion_engagement_score integer default 0,
  
  -- Metadata
  calculated_at timestamptz not null default now(),
  previous_score integer,
  notes text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  constraint client_health_scores_client_calc_unique unique (client_id, calculated_at)
);

create index if not exists idx_client_health_scores_client_id on public.client_health_scores(client_id);
create index if not exists idx_client_health_scores_risk_level on public.client_health_scores(risk_level);
create index if not exists idx_client_health_scores_calculated_at on public.client_health_scores(calculated_at desc);

-- 3. NEW TABLE: client_churn_signals
create table if not exists public.client_churn_signals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  
  signal_type text not null check (signal_type in (
    'low_portal_activity',
    'no_report_opens',
    'high_support_volume',
    'negative_sentiment',
    'payment_late',
    'champion_inactive',
    'system_offline',
    'integration_failure',
    'missed_qbr',
    'scope_complaint',
    'other'
  )),
  
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  title text not null,
  description text,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolved_by uuid references auth.users(id) on delete set null,
  
  -- Link to source entity if available
  related_entity_type text, -- e.g. 'support_ticket', 'client_system', 'deal'
  related_entity_id uuid,
  
  created_at timestamptz not null default now()
);

create index if not exists idx_client_churn_signals_client_id on public.client_churn_signals(client_id);
create index if not exists idx_client_churn_signals_unresolved on public.client_churn_signals(client_id) where resolved_at is null;

-- 4. NEW TABLE: client_success_events (Positive Counter-Signals)
create table if not exists public.client_success_events (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  
  event_type text not null check (event_type in (
    'first_value_delivered',
    'monthly_report_opened',
    'positive_feedback',
    'system_usage_spike',
    'qbr_completed',
    'upsell_accepted',
    'referral_given',
    'other'
  )),
  
  title text not null,
  description text,
  value_impact numeric, -- estimated revenue or staff hours saved
  occurred_at timestamptz not null default now(),
  
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_client_success_events_client_id on public.client_success_events(client_id);

-- 5. NEW TABLE: client_health_snapshots (Historical Trendlines)
create table if not exists public.client_health_snapshots (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  score integer not null check (score >= 0 and score <= 100),
  risk_level text not null check (risk_level in ('healthy', 'watch', 'at_risk', 'critical')),
  snapshot_date date not null default current_date,
  created_at timestamptz not null default now(),
  
  constraint client_health_snapshots_client_date_unique unique (client_id, snapshot_date)
);

create index if not exists idx_client_health_snapshots_client_date on public.client_health_snapshots(client_id, snapshot_date desc);

-- 6. EXTEND agent_tasks KINDS FOR CHURN & HEALTH WORKLOADS
alter table public.agent_tasks
  drop constraint if exists agent_tasks_kind_check;

alter table public.agent_tasks
  add constraint agent_tasks_kind_check
  check (kind in (
    'apply_contact_fact',
    'calculate_client_health',
    'create_churn_signal',
    'notify_churn_risk',
    'schedule_qbr',
    'generate_monthly_report',
    'check_portal_activity',
    'route_inbound_lead',
    'classify_omnichannel_message',
    'triage_customer_review',
    'audit_competitor_prices',
    'generate_contract_agreement'
  ));

-- 7. ROW-LEVEL SECURITY (RLS) POLICIES
alter table public.client_health_scores enable row level security;
alter table public.client_churn_signals enable row level security;
alter table public.client_success_events enable row level security;
alter table public.client_health_snapshots enable row level security;

-- Client Health Scores Policies
create policy health_scores_admin on public.client_health_scores
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

create policy health_scores_client_read on public.client_health_scores
  for select to authenticated
  using (client_id = (select public.requester_client_id()));

-- Client Churn Signals Policies
create policy churn_signals_admin on public.client_churn_signals
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

create policy churn_signals_client_read on public.client_churn_signals
  for select to authenticated
  using (client_id = (select public.requester_client_id()));

-- Client Success Events Policies
create policy success_events_admin on public.client_success_events
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

create policy success_events_client_read on public.client_success_events
  for select to authenticated
  using (client_id = (select public.requester_client_id()));

-- Client Health Snapshots Policies
create policy health_snapshots_admin on public.client_health_snapshots
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

create policy health_snapshots_client_read on public.client_health_snapshots
  for select to authenticated
  using (client_id = (select public.requester_client_id()));

-- Realtime publication for churn signals & score changes
alter publication supabase_realtime add table public.client_health_scores;
alter publication supabase_realtime add table public.client_churn_signals;
