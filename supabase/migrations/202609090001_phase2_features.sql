-- ============================================================================
-- HELIX AI — Phase 2 Features & Regional Architecture Migration
--
-- Adds:
--  1. Regional tiering on clients (gcc_enterprise vs mena_sme, country ISO)
--  2. whatsapp_credentials (Meta Cloud API credentials per client)
--  3. admin_updates & admin_update_recipients (operational broadcasts)
--  4. staff_invites (workspace onboarding tokens)
--  5. contact_notes (internal CRM commentary)
--  6. attention_queue (AI observation evidence review ledger)
--  7. export_log (data export audit trail)
--  8. onboarding_checklist_items (workspace setup milestones)
--  9. monthly_feedback (NPS & satisfaction surveys)
-- 10. churn_retention_flags (risk management)
-- 11. Realtime publication additions
-- 12. Strict RLS on all 9 new tables
-- ============================================================================

set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- 1. Regional columns on clients
alter table public.clients add column if not exists country text;
alter table public.clients add column if not exists region_tier text not null default 'gcc_enterprise'
  check (region_tier in ('gcc_enterprise', 'mena_sme'));

-- 2. WhatsApp Credentials
create table if not exists public.whatsapp_credentials (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  waba_id text,
  phone_number_id text,
  phone_number text,
  access_token text,
  webhook_verify_token text,
  status text not null default 'pending'
    check (status in ('pending', 'connected', 'degraded', 'disconnected')),
  quality_rating text default 'UNKNOWN',
  last_ping_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.whatsapp_credentials add constraint whatsapp_credentials_client_id_id_key unique (client_id, id);
create index if not exists idx_whatsapp_credentials_client on public.whatsapp_credentials (client_id);

-- 3. Admin Updates & Recipients
create table if not exists public.admin_updates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  severity text not null default 'info'
    check (severity in ('info', 'warning', 'critical')),
  published_at timestamptz not null default now(),
  created_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_update_recipients (
  update_id uuid not null references public.admin_updates(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (update_id, client_id)
);
create index if not exists idx_admin_update_recipients_client on public.admin_update_recipients (client_id);

-- 4. Staff Invites
create table if not exists public.staff_invites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade,
  email text not null,
  role text not null check (role in ('agency_admin', 'client_user', 'client_staff')),
  token text not null unique,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_staff_invites_client on public.staff_invites (client_id);
create index if not exists idx_staff_invites_token on public.staff_invites (token);

-- 5. Contact Notes
create table if not exists public.contact_notes (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_id uuid not null,
  author_profile_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.contact_notes add constraint contact_notes_client_id_id_key unique (client_id, id);
alter table public.contact_notes add constraint contact_notes_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade;
create index if not exists idx_contact_notes_client on public.contact_notes (client_id);
create index if not exists idx_contact_notes_client_contact on public.contact_notes (client_id, contact_id);

-- 6. Attention Queue
create table if not exists public.attention_queue (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_id uuid,
  source text not null default 'voice_agent'
    check (source in ('voice_agent', 'whatsapp_agent', 'system_alert')),
  observation text not null,
  suggested_action text,
  confidence numeric(4,3) check (confidence >= 0 and confidence <= 1),
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'dismissed')),
  meta jsonb not null default '{}'::jsonb,
  reviewed_at timestamptz,
  reviewed_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.attention_queue add constraint attention_queue_client_id_id_key unique (client_id, id);
create index if not exists idx_attention_queue_client on public.attention_queue (client_id);
create index if not exists idx_attention_queue_client_status on public.attention_queue (client_id, status);

-- 7. Export Log
create table if not exists public.export_log (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  export_type text not null
    check (export_type in ('contacts', 'deals', 'activities', 'facts')),
  row_count integer not null check (row_count >= 0),
  format text not null default 'csv'
    check (format in ('csv', 'json')),
  created_at timestamptz not null default now()
);
create index if not exists idx_export_log_client on public.export_log (client_id);

-- 8. Onboarding Checklist Items
create table if not exists public.onboarding_checklist_items (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  item_key text not null,
  title text not null,
  description text,
  completed boolean not null default false,
  completed_at timestamptz,
  completed_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (client_id, item_key)
);
create index if not exists idx_onboarding_items_client on public.onboarding_checklist_items (client_id);

-- 9. Monthly Feedback
create table if not exists public.monthly_feedback (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  cycle_date date not null,
  nps_score integer check (nps_score between 0 and 10),
  feedback_text text,
  submitted_by_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (client_id, cycle_date)
);
create index if not exists idx_monthly_feedback_client on public.monthly_feedback (client_id);

-- 10. Churn Retention Flags
create table if not exists public.churn_retention_flags (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  risk_level text not null
    check (risk_level in ('low', 'medium', 'high', 'critical')),
  reason text not null,
  flagged_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution_notes text,
  created_at timestamptz not null default now()
);
create index if not exists idx_churn_flags_client on public.churn_retention_flags (client_id);

-- Updated_at triggers
create trigger whatsapp_credentials_set_updated_at before update on public.whatsapp_credentials
  for each row execute function public.set_updated_at();
create trigger contact_notes_set_updated_at before update on public.contact_notes
  for each row execute function public.set_updated_at();

-- 11. Row-Level Security Enablement
alter table public.whatsapp_credentials enable row level security;
alter table public.admin_updates enable row level security;
alter table public.admin_update_recipients enable row level security;
alter table public.staff_invites enable row level security;
alter table public.contact_notes enable row level security;
alter table public.attention_queue enable row level security;
alter table public.export_log enable row level security;
alter table public.onboarding_checklist_items enable row level security;
alter table public.monthly_feedback enable row level security;
alter table public.churn_retention_flags enable row level security;

-- 12. RLS Policies
-- whatsapp_credentials
create policy tenant_read on public.whatsapp_credentials for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.whatsapp_credentials for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- admin_updates
create policy updates_read on public.admin_updates for select to authenticated
  using (true);
create policy agency_manage on public.admin_updates for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- admin_update_recipients
create policy tenant_read on public.admin_update_recipients for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_mark_read on public.admin_update_recipients for update to authenticated
  using (client_id = (select public.requester_client_id()))
  with check (client_id = (select public.requester_client_id()));
create policy agency_manage on public.admin_update_recipients for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- staff_invites
create policy tenant_read on public.staff_invites for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.staff_invites for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- contact_notes
create policy tenant_read on public.contact_notes for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_manage on public.contact_notes for all to authenticated
  using (client_id = (select public.requester_client_id()))
  with check (client_id = (select public.requester_client_id()));
create policy agency_manage on public.contact_notes for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- attention_queue
create policy tenant_read on public.attention_queue for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_review on public.attention_queue for update to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()))
  with check ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.attention_queue for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- export_log
create policy tenant_read on public.export_log for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_insert on public.export_log for insert to authenticated
  with check (client_id = (select public.requester_client_id()));
create policy agency_manage on public.export_log for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- onboarding_checklist_items
create policy tenant_read on public.onboarding_checklist_items for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_update on public.onboarding_checklist_items for update to authenticated
  using (client_id = (select public.requester_client_id()))
  with check (client_id = (select public.requester_client_id()));
create policy agency_manage on public.onboarding_checklist_items for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- monthly_feedback
create policy tenant_read on public.monthly_feedback for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy tenant_write on public.monthly_feedback for insert to authenticated
  with check (client_id = (select public.requester_client_id()));
create policy agency_manage on public.monthly_feedback for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- churn_retention_flags (restricted to agency admins)
create policy agency_manage on public.churn_retention_flags for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- 13. Default Privileges
revoke all on table public.whatsapp_credentials, public.admin_updates,
  public.admin_update_recipients, public.staff_invites, public.contact_notes,
  public.attention_queue, public.export_log, public.onboarding_checklist_items,
  public.monthly_feedback, public.churn_retention_flags from public, anon, authenticated;

grant select, insert, update, delete on public.whatsapp_credentials to authenticated;
grant select, insert, update, delete on public.admin_updates to authenticated;
grant select, insert, update, delete on public.admin_update_recipients to authenticated;
grant select, insert, update, delete on public.staff_invites to authenticated;
grant select, insert, update, delete on public.contact_notes to authenticated;
grant select, insert, update, delete on public.attention_queue to authenticated;
grant select, insert, update, delete on public.export_log to authenticated;
grant select, insert, update, delete on public.onboarding_checklist_items to authenticated;
grant select, insert, update, delete on public.monthly_feedback to authenticated;
grant select, insert, update, delete on public.churn_retention_flags to authenticated;

-- 14. CRM Funnel Stages Expansion (deals & client_systems)
-- Expanded pipeline: new_lead -> engaged -> studio_completed -> call_booked -> proposal_sent -> closed_won / closed_lost
alter table public.deals drop constraint if exists deals_stage_check;
alter table public.deals add constraint deals_stage_check
  check (stage in (
    'new_lead',
    'engaged',
    'studio_completed',
    'call_booked',
    'proposal_sent',
    'closed_won',
    'closed_lost',
    'DEMO_BOOKED',
    'QUALIFIED_TO_BUY',
    'UNQUALIFIED_TO_BUY',
    'DECISION_MAKER_BOUGHT_IN',
    'CONTRACT_SENT'
  ));

alter table public.client_systems add column if not exists stage text default 'new_lead'
  check (stage in (
    'new_lead',
    'engaged',
    'studio_completed',
    'call_booked',
    'proposal_sent',
    'closed_won',
    'closed_lost'
  ));

notify pgrst, 'reload schema';

