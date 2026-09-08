-- HELIX AI / Supabase: CRM intelligence layer (evidence ledger + work queue).
-- REVIEW AND TEST ON A SEPARATE SUPABASE PROJECT FIRST. Not executed by the app.
-- Prerequisite: baseline schema + migration 202609070001_tenant_hardening applied.
-- Strictly additive and single-use: never drops or rewrites existing objects;
-- the only existing-table changes are the new nullable contacts.company_id
-- column and a non-invasive unique key profiles (client_id, id), which
-- tenant-composite owner links require and which existing data cannot violate.
--
-- Ported patterns (reference: trycompai/crm, MIT — reimplemented for this
-- schema, never imported):
--   * Evidence ledger: contact_facts stores every AI-observed fact with an
--     evidence_band (verified/probable/possible) set by WHICH TOOL observed it
--     via the explicit lookup table in application code (lib/crm/evidence-bands.ts),
--     never a model self-confidence score. Only verified facts auto-write to
--     the contact record, through the durable queue; everything else waits
--     for human review at /dashboard/facts.
--   * Work queue: agent_tasks leased via FOR UPDATE SKIP LOCKED and drained by
--     the Vercel Cron route /api/cron/process-agent-tasks. Native Postgres only.
--
-- Multi-tenant from creation: every table is client_id-scoped and protected by
-- the is_agency_admin() / requester_client_id() pattern. The reference repo's
-- single-tenant assumption is deliberately not carried forward.
--
-- Queue state (agent_tasks) is intentionally NOT writable over REST by any
-- authenticated role: leases, completion, failure and cancellation mutate only
-- through the service-role functions below, so lease integrity cannot be
-- hand-edited from a browser session.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- Abort rather than run against a partial or already-migrated database.
do $$
declare
  baseline_table text;
  baseline_fn text;
  new_table text;
  present integer := 0;
begin
  if current_setting('server_version_num')::int < 160000 then
    raise exception 'PostgreSQL 16+ required (found %); the ON DELETE SET NULL column-list syntax needs it',
      current_setting('server_version');
  end if;
  foreach baseline_table in array array['clients','contacts','profiles','activity_log'] loop
    if to_regclass(format('public.%I', baseline_table)) is null then
      raise exception 'Missing baseline table: % (apply the baseline schema and 202609070001 first)', baseline_table;
    end if;
  end loop;
  foreach baseline_fn in array array['is_agency_admin()','requester_client_id()','set_updated_at()'] loop
    if to_regprocedure('public.' || baseline_fn) is null then
      raise exception 'Missing baseline function: public.% (apply 202609070001 first)', baseline_fn;
    end if;
  end loop;
  foreach new_table in array array['companies','deals','activities','deal_contacts','custom_properties','contact_facts','agent_tasks'] loop
    if to_regclass(format('public.%I', new_table)) is not null then
      present := present + 1;
    end if;
  end loop;
  if present = 7 then
    raise exception 'ALREADY APPLIED: all 7 tables from this migration exist; nothing to do';
  elsif present > 0 then
    raise exception 'Partial state: % of 7 expected tables already exist; review before migrating', present;
  end if;
  if exists (select 1 from information_schema.columns
             where table_schema = 'public' and table_name = 'contacts' and column_name = 'company_id') then
    raise exception 'contacts.company_id already exists; unexpected state';
  end if;
  raise notice 'Preflight PASS: baseline present; none of the 7 new tables exist; contacts.company_id absent';
end;
$$;

-- Accounts, tenant-scoped like every CRM object.
create table public.companies (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  domain text,
  industry text,
  location text,
  employee_count integer,
  phone text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.companies add constraint companies_client_id_id_key unique (client_id, id);
create index if not exists idx_companies_client on public.companies (client_id);

-- Profiles gains a tenant-composite key so the owner links below can never
-- point across tenants. Additive: uniqueness already follows from profiles.id
-- being the primary key, so no existing data can conflict.
alter table public.profiles add constraint profiles_client_id_id_key unique (client_id, id);

-- Pipeline with the ported stage set; tenant-safe company and owner links.
create table public.deals (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid,
  name text not null,
  stage text not null default 'DEMO_BOOKED'
    check (stage in ('DEMO_BOOKED','QUALIFIED_TO_BUY','UNQUALIFIED_TO_BUY',
                     'DECISION_MAKER_BOUGHT_IN','CONTRACT_SENT','CLOSED_WON','CLOSED_LOST')),
  value_cents integer check (value_cents is null or value_cents >= 0),
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  expected_close_date date,
  owner_profile_id uuid,
  source text,
  custom_fields jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.deals add constraint deals_client_id_id_key unique (client_id, id);
alter table public.deals add constraint deals_tenant_company_fk
  foreign key (client_id, company_id) references public.companies (client_id, id)
  on delete set null (company_id);
alter table public.deals add constraint deals_tenant_owner_fk
  foreign key (client_id, owner_profile_id) references public.profiles (client_id, id)
  on delete set null (owner_profile_id);
create index if not exists idx_deals_client on public.deals (client_id);
create index if not exists idx_deals_client_stage on public.deals (client_id, stage);

-- Timeline records for companies/contacts/deals. Distinct from the baseline
-- activity_log (voice-system operations log); activities carry the ported
-- ActivityType set: note/call/email/meeting/task/stage_change/enrichment.
create table public.activities (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  company_id uuid,
  contact_id uuid,
  deal_id uuid,
  type text not null
    check (type in ('note','call','email','meeting','task','stage_change','enrichment')),
  subject text,
  body text,
  occurred_at timestamptz not null default now(),
  due_at timestamptz,
  completed_at timestamptz,
  created_by_profile_id uuid,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.activities add constraint activities_client_id_id_key unique (client_id, id);
alter table public.activities add constraint activities_tenant_company_fk
  foreign key (client_id, company_id) references public.companies (client_id, id)
  on delete cascade;
alter table public.activities add constraint activities_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id)
  on delete cascade;
alter table public.activities add constraint activities_tenant_deal_fk
  foreign key (client_id, deal_id) references public.deals (client_id, id)
  on delete cascade;
alter table public.activities add constraint activities_tenant_author_fk
  foreign key (client_id, created_by_profile_id) references public.profiles (client_id, id)
  on delete set null (created_by_profile_id);
create index if not exists idx_activities_client on public.activities (client_id);
create index if not exists idx_activities_client_contact on public.activities (client_id, contact_id);
create index if not exists idx_activities_client_deal on public.activities (client_id, deal_id);
create index if not exists idx_activities_client_company on public.activities (client_id, company_id);

-- Deal↔contact association (ported many-to-many), tenant-composite on both
-- sides so a link can never cross tenants.
create table public.deal_contacts (
  deal_id uuid not null,
  contact_id uuid not null,
  client_id uuid not null references public.clients(id) on delete cascade,
  role text,
  created_at timestamptz not null default now(),
  primary key (deal_id, contact_id)
);
alter table public.deal_contacts add constraint deal_contacts_tenant_deal_fk
  foreign key (client_id, deal_id) references public.deals (client_id, id) on delete cascade;
alter table public.deal_contacts add constraint deal_contacts_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade;
create index if not exists idx_deal_contacts_client_contact
  on public.deal_contacts (client_id, contact_id);

-- Custom-field registry: typed fields defined per tenant. Values live in the
-- entity tables' custom_fields JSONB; this registry governs label, type, agent
-- fillability and UI placement only. Ported from the reference
-- fieldDefinition/fieldOption pair; options is a JSONB array of {label, value}.
create table public.custom_properties (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  entity text not null check (entity in ('company','contact','deal')),
  key text not null check (key ~ '^[a-z0-9_]{1,63}$'),
  label text not null,
  type text not null check (
    type in ('text','long_text','number','date','checkbox','select','url','email','phone','user')
  ),
  agent_filled boolean not null default true,
  agent_brief text,
  required boolean not null default false,
  show_on_sheet boolean not null default true,
  show_on_table boolean not null default false,
  show_on_filter boolean not null default false,
  position integer not null default 0,
  options jsonb not null default '[]'::jsonb check (jsonb_typeof(options) = 'array'),
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.custom_properties add constraint custom_properties_client_entity_key_key
  unique (client_id, entity, key);
create index if not exists idx_custom_properties_client_entity
  on public.custom_properties (client_id, entity, position);

-- Evidence ledger: every AI-observed fact, immutable once written. Bands and
-- status transitions are decided only by this schema's checks/triggers and the
-- privileged functions in Part 4 — never by REST writers. Ported shape from
-- contactFact (field/value/band/evidence/score/decidedBy/supersededAt).
create table public.contact_facts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_id uuid not null,
  field_name text not null check (field_name ~ '^[a-z0-9_]{1,63}$'),
  field_value text not null check (length(field_value) <= 10000),
  evidence_band text not null check (evidence_band in ('verified','probable','possible')),
  source_tool text not null,
  status text not null default 'pending'
    check (status in ('pending','applied','dismissed','superseded')),
  evidence jsonb not null default '[]'::jsonb check (jsonb_typeof(evidence) = 'array'),
  score numeric check (score is null or (score >= 0 and score <= 100)),
  method text,
  source_url text,
  session_id text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  observed_at timestamptz not null default now(),
  superseded_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.contact_facts add constraint contact_facts_client_id_id_key unique (client_id, id);
alter table public.contact_facts add constraint contact_facts_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade;
alter table public.contact_facts add constraint contact_facts_tenant_reviewer_fk
  foreign key (client_id, reviewed_by) references public.profiles (client_id, id)
  on delete set null (reviewed_by);
-- At most one live suggestion and one applied fact per tenant+contact+field.
create unique index if not exists uq_contact_facts_pending_field
  on public.contact_facts (client_id, contact_id, field_name) where status = 'pending';
create unique index if not exists uq_contact_facts_applied_field
  on public.contact_facts (client_id, contact_id, field_name) where status = 'applied';
create index if not exists idx_contact_facts_client_status
  on public.contact_facts (client_id, status, observed_at desc);

-- Work queue, ported from agentTask (kind/reason/payload/priority/budget/
-- attempts/dueAt/leasedUntil/startedAt/finishedAt/outcome/subject). Leased via
-- FOR UPDATE SKIP LOCKED by claim_agent_tasks() in Part 4; queue state is NOT
-- writable over REST by any authenticated role — see Part 5 grants.
create table public.agent_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  contact_id uuid,
  company_id uuid,
  deal_id uuid,
  kind text not null check (kind in ('apply_contact_fact')),
  reason text not null default '',
  payload jsonb not null default '{}'::jsonb,
  priority integer not null default 0 check (priority >= 0),
  budget integer not null default 4 check (budget >= 1 and budget <= 10),
  attempts integer not null default 0 check (attempts >= 0),
  due_at timestamptz not null default now(),
  leased_until timestamptz,
  session_id text,
  started_at timestamptz,
  finished_at timestamptz,
  outcome text,
  subject text,
  created_at timestamptz not null default now()
);
alter table public.agent_tasks add constraint agent_tasks_client_id_id_key unique (client_id, id);
alter table public.agent_tasks add constraint agent_tasks_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade;
alter table public.agent_tasks add constraint agent_tasks_tenant_company_fk
  foreign key (client_id, company_id) references public.companies (client_id, id) on delete cascade;
alter table public.agent_tasks add constraint agent_tasks_tenant_deal_fk
  foreign key (client_id, deal_id) references public.deals (client_id, id) on delete cascade;
-- The claim scan: unfinished tasks that are due and not actively leased.
create index if not exists idx_agent_tasks_claim
  on public.agent_tasks (due_at, priority desc, created_at)
  where finished_at is null;
-- Ported partial index: open-task lookup per kind+subject.
create index if not exists idx_agent_tasks_kind_subject
  on public.agent_tasks (kind, subject) where finished_at is null;
create index if not exists idx_agent_tasks_client
  on public.agent_tasks (client_id, created_at desc);

-- Band-aware supersede BEFORE INSERT: the ledger keeps every observation, but
-- only one live fact may exist per field. A verified observation supersedes
-- both pending and applied siblings (the queue immediately re-applies it); a
-- lower band only supersedes pending suggestions — an applied value stays
-- authoritative unless a verified observation replaces it.
create or replace function public.supersede_previous_facts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.contact_facts
     set status = 'superseded', superseded_at = now()
   where client_id = new.client_id
     and contact_id = new.contact_id
     and field_name = new.field_name
     and status = any (case when new.evidence_band = 'verified'
                            then array['pending','applied']
                            else array['pending'] end)
     and id <> new.id;
  return new;
end;
$$;
alter function public.supersede_previous_facts() owner to postgres;
drop trigger if exists contact_facts_supersede_previous on public.contact_facts;
create trigger contact_facts_supersede_previous
  before insert on public.contact_facts
  for each row execute function public.supersede_previous_facts();

-- Only verified facts earn an automatic apply task; probable/possible facts
-- wait for human review at /dashboard/facts. One task per fact, idempotent
-- because apply_contact_fact requires the fact to still be pending.
create or replace function public.enqueue_fact_task()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.evidence_band = 'verified' then
    insert into public.agent_tasks
      (client_id, contact_id, kind, reason, payload, priority, budget,
       due_at, session_id, subject)
    values (new.client_id, new.contact_id, 'apply_contact_fact',
            'Auto-write verified fact to the contact record',
            jsonb_build_object('fact_id', new.id), 0, 4, now(),
            new.session_id, 'contact_fact:' || new.id);
  end if;
  return new;
end;
$$;
alter function public.enqueue_fact_task() owner to postgres;
drop trigger if exists contact_facts_enqueue_task on public.contact_facts;
create trigger contact_facts_enqueue_task
  after insert on public.contact_facts
  for each row execute function public.enqueue_fact_task();

-- Queue lease protocol. Called only by the service-role runner
-- (lib/crm/agent-queue.ts via /api/cron/process-agent-tasks): revoked from
-- every REST-facing role, so lease state cannot be hand-edited from a session.
create or replace function public.claim_agent_tasks(
  p_limit integer default 5,
  p_lease_seconds integer default 300
)
returns setof public.agent_tasks
language sql
security definer
set search_path = ''
as $$
  with eligible as (
    select id
    from public.agent_tasks
    where finished_at is null
      and due_at <= now()
      and (leased_until is null or leased_until <= now())
      and attempts < budget
    order by due_at asc, priority desc, created_at asc
    limit greatest(least(coalesce(p_limit, 5), 50), 1)
    for update skip locked
  )
  update public.agent_tasks as t
     set attempts = t.attempts + 1,
         leased_until = now() + make_interval(secs => greatest(least(coalesce(p_lease_seconds, 300), 3600), 5)),
         started_at = coalesce(t.started_at, now())
    from eligible
   where t.id = eligible.id
  returning t.*;
$$;
alter function public.claim_agent_tasks(integer, integer) owner to postgres;

create or replace function public.complete_agent_task(
  p_task_id uuid,
  p_outcome text
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  update public.agent_tasks
     set finished_at = now(),
         outcome = coalesce(p_outcome, 'done'),
         leased_until = null
   where id = p_task_id
     and finished_at is null
     and leased_until > now()
  returning true;
$$;
alter function public.complete_agent_task(uuid, text) owner to postgres;

-- Failed lease: release for retry, or dead-letter once the budget is spent.
create or replace function public.fail_agent_task(
  p_task_id uuid,
  p_outcome text
)
returns boolean
language sql
security definer
set search_path = ''
as $$
  update public.agent_tasks
     set leased_until = null,
         outcome = case when attempts >= budget
                        then 'budget_exhausted: ' || coalesce(p_outcome, 'error')
                        else coalesce(p_outcome, 'error') end,
         finished_at = case when attempts >= budget then now() else finished_at end
   where id = p_task_id
     and finished_at is null
     and leased_until > now()
  returning true;
$$;
alter function public.fail_agent_task(uuid, text) owner to postgres;

create or replace function public.cancel_agent_task(p_task_id uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
  update public.agent_tasks
     set finished_at = now(),
         outcome = 'cancelled',
         leased_until = null
   where id = p_task_id
     and finished_at is null
  returning true;
$$;
alter function public.cancel_agent_task(uuid) owner to postgres;

revoke all on function public.claim_agent_tasks(integer, integer) from public, anon, authenticated;
revoke all on function public.complete_agent_task(uuid, text) from public, anon, authenticated;
revoke all on function public.fail_agent_task(uuid, text) from public, anon, authenticated;
revoke all on function public.cancel_agent_task(uuid) from public, anon, authenticated;
grant execute on function public.claim_agent_tasks(integer, integer) to service_role;
grant execute on function public.complete_agent_task(uuid, text) to service_role;
grant execute on function public.fail_agent_task(uuid, text) to service_role;
grant execute on function public.cancel_agent_task(uuid) to service_role;

-- Fact application/review. apply_contact_fact is the ONLY writer from the
-- ledger to the contact record, used by both the queue runner (verified
-- facts, reviewer null) and the human-review server action (reviewer set).
-- A human approval is authoritative: it supersedes an applied sibling first,
-- keeping the one-applied-fact-per-field invariant intact.
create or replace function public.apply_contact_fact(
  p_fact_id uuid,
  p_reviewer_profile_id uuid default null
)
returns public.contact_facts
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_fact public.contact_facts;
  v_contact_id uuid;
begin
  select * into v_fact from public.contact_facts
   where id = p_fact_id for update;
  if v_fact.id is null then
    raise exception 'Fact % not found', p_fact_id;
  end if;
  if v_fact.status <> 'pending' then
    raise exception 'Fact % is not pending (status: %)', p_fact_id, v_fact.status;
  end if;

  select id into v_contact_id from public.contacts
   where client_id = v_fact.client_id and id = v_fact.contact_id for update;
  if v_contact_id is null then
    raise exception 'Contact % not found for fact %', v_fact.contact_id, p_fact_id;
  end if;

  -- Native contact columns are written directly; every other field lands in
  -- the custom_fields JSONB under the registry's key.
  if v_fact.field_name = 'full_name' then
    update public.contacts set full_name = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'phone' then
    update public.contacts set phone = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'email' then
    update public.contacts set email = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'company_name' then
    update public.contacts set company_name = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'company_id' then
    update public.contacts
       set company_id = v_fact.field_value::uuid where id = v_contact_id;
  elsif v_fact.field_name = 'source' then
    update public.contacts set source = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'lead_status' then
    if v_fact.field_value not in ('cold','warm','hot','customer','lost') then
      raise exception 'Illegal lead_status value: %', v_fact.field_value;
    end if;
    update public.contacts set lead_status = v_fact.field_value where id = v_contact_id;
  elsif v_fact.field_name = 'do_not_contact' then
    update public.contacts
       set do_not_contact = lower(v_fact.field_value) in ('true','t','yes','1','y')
     where id = v_contact_id;
  else
    update public.contacts
       set custom_fields = coalesce(custom_fields, '{}'::jsonb)
         || jsonb_build_object(v_fact.field_name, to_jsonb(v_fact.field_value))
     where id = v_contact_id;
  end if;

  -- The applied value being replaced (if any) leaves a superseded trail.
  update public.contact_facts
     set status = 'superseded', superseded_at = now()
   where client_id = v_fact.client_id and contact_id = v_fact.contact_id
     and field_name = v_fact.field_name and status = 'applied' and id <> v_fact.id;

  insert into public.activities
    (client_id, contact_id, type, subject, body, meta, created_by_profile_id)
  values
    (v_fact.client_id, v_fact.contact_id, 'enrichment',
     'Applied ' || v_fact.evidence_band || ' fact: ' || v_fact.field_name,
     v_fact.field_value,
     jsonb_build_object('fact_id', v_fact.id, 'band', v_fact.evidence_band,
                        'source_tool', v_fact.source_tool),
     p_reviewer_profile_id);

  update public.contact_facts
     set status = 'applied', reviewed_by = p_reviewer_profile_id, reviewed_at = now()
   where id = v_fact.id
   returning * into v_fact;
  return v_fact;
end;
$$;
alter function public.apply_contact_fact(uuid, uuid) owner to postgres;

-- Human rejection of a pending suggestion; also cancels any not-yet-run
-- auto-apply task so the queue never resurrects a dismissed fact.
create or replace function public.dismiss_contact_fact(
  p_fact_id uuid,
  p_reviewer_profile_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.contact_facts
     set status = 'dismissed', reviewed_by = p_reviewer_profile_id, reviewed_at = now()
   where id = p_fact_id and status = 'pending';
  if not found then
    raise exception 'Fact % is not pending', p_fact_id;
  end if;
  update public.agent_tasks
     set finished_at = now(), outcome = 'cancelled: fact dismissed', leased_until = null
   where subject = 'contact_fact:' || p_fact_id and finished_at is null;
  return true;
end;
$$;
alter function public.dismiss_contact_fact(uuid, uuid) owner to postgres;

revoke all on function public.apply_contact_fact(uuid, uuid) from public, anon, authenticated;
revoke all on function public.dismiss_contact_fact(uuid, uuid) from public, anon, authenticated;
grant execute on function public.apply_contact_fact(uuid, uuid) to service_role;
grant execute on function public.dismiss_contact_fact(uuid, uuid) to service_role;

-- Link contacts to companies (nullable; existing rows unaffected).
alter table public.contacts add column company_id uuid;
alter table public.contacts add constraint contacts_tenant_company_fk
  foreign key (client_id, company_id) references public.companies (client_id, id)
  on delete set null (company_id);
create index if not exists idx_contacts_client_company
  on public.contacts (client_id, company_id);
-- Migration 202609070001 granted SELECT/INSERT/UPDATE/DELETE on the contacts
-- table (not per-column) to authenticated, so the new column inherits those
-- grants; RLS still scopes every row to the requester's tenant.

-- RLS matrix for the new tables.
alter table public.companies enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.deal_contacts enable row level security;
alter table public.custom_properties enable row level security;
alter table public.contact_facts enable row level security;
alter table public.agent_tasks enable row level security;

-- Standard tenant scoping, mirroring migration 202609070001: client roles read
-- their tenant's rows; agency admins manage everything.
create policy tenant_read on public.companies for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.companies for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));
create policy tenant_read on public.deals for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.deals for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));
create policy tenant_read on public.activities for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.activities for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));
create policy tenant_read on public.deal_contacts for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.deal_contacts for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));
create policy tenant_read on public.custom_properties for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));
create policy agency_manage on public.custom_properties for all to authenticated
  using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()));

-- The evidence ledger is read-only over REST for EVERY authenticated role,
-- agency admins included: writing facts is reserved to recordContactFact
-- (service role), which fixes the band via the tool lookup. A REST writer
-- could otherwise set evidence_band='verified' by hand and trigger an
-- automatic contact write — precisely what the band discipline forbids.
create policy tenant_read on public.contact_facts for select to authenticated
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));

-- agent_tasks: no policies and no grants for anon/authenticated at all. The
-- queue mutates only through the service-role functions above; even reading
-- queue state over REST is reserved to the service role.

-- Keep updated_at honest on the mutable CRM tables, same as the baseline.
create trigger companies_set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();
create trigger deals_set_updated_at before update on public.deals
  for each row execute function public.set_updated_at();
create trigger activities_set_updated_at before update on public.activities
  for each row execute function public.set_updated_at();
create trigger custom_properties_set_updated_at before update on public.custom_properties
  for each row execute function public.set_updated_at();

-- Grants. Supabase default privileges would hand full access to every new
-- table to anon and authenticated; reset and grant the intended matrix.
revoke all on table public.companies, public.deals, public.activities,
  public.deal_contacts, public.custom_properties, public.contact_facts,
  public.agent_tasks from public, anon, authenticated;

grant select, insert, update, delete on public.companies to authenticated;
grant select, insert, update, delete on public.deals to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, update, delete on public.deal_contacts to authenticated;
grant select, insert, update, delete on public.custom_properties to authenticated;
-- Evidence ledger: read-only over REST (see Part 7).
grant select on public.contact_facts to authenticated;
-- agent_tasks: deliberately nothing for anon/authenticated. service_role
-- keeps its default privileges for the queue runner and verification harness.

notify pgrst, 'reload schema';
commit;

-- SQL Editor result grid: emitted only after the transaction above completes.
-- Confirms object creation only; run scripts/verify-crm-intelligence.mjs for
-- the live RLS / queue / review assertions.
select
  (select count(*) from pg_catalog.pg_class c
     join pg_catalog.pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind = 'r' and c.relname in
      ('companies','deals','activities','deal_contacts','custom_properties',
       'contact_facts','agent_tasks')) as crm_tables_expected_7,
  (select count(*) from information_schema.triggers
    where event_object_schema = 'public' and event_object_table = 'contact_facts') as fact_triggers_expected_2,
  (select current_setting('server_version')) as postgres_version,
  'COMMITTED: CRM intelligence layer applied; run scripts/verify-crm-intelligence.mjs next' as migration_result;