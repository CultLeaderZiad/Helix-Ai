-- HELIX AI / Supabase: additive hardening of the supplied existing schema.
-- REVIEW AND TEST ON A SEPARATE SUPABASE PROJECT FIRST. Not executed by the app.
-- Prerequisite: the baseline schema supplied on 2026-09-07 already exists.
-- This is NOT a fresh-database bootstrap and is intended to run once.
--
-- Behavior:
-- * Auth app_metadata remains the sole authorization source.
-- * Helpers compare signed JWT metadata with current Supabase Auth metadata.
--   Previously issued tokens fail closed after role/client reassignment.
-- * Client users/staff may read their tenant's records, but cannot change
--   visibility, integrations, billing, activity, or operational records.
-- * Agency admins can manage operational records subject to tenant-safe FKs.
-- * Profile provisioning and authorization metadata remain service-role only;
--   authenticated users may update only their own full_name.
-- * Integration webhook URLs and system config JSON are not readable through
--   authenticated REST requests, including agency-admin requests. A future
--   privileged server action must explicitly authorize any secret management.
--
-- Run during a maintenance window: constraint validation scans existing data
-- and ALTER TABLE acquires locks. Violations abort the ENTIRE transaction;
-- this file never repairs, deletes, or silently reassigns production data.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- Abort on unexpected policies rather than silently destroying custom rules
-- or leaving permissive policies that could override the intended restrictions.
do $$
declare
  item record;
  expected text;
begin
  for item in
    select * from (values
      ('clients', 'clients_isolation'),
      ('client_systems', 'client_systems_isolation'),
      ('client_integrations', 'client_integrations_isolation'),
      ('contacts', 'contacts_isolation'),
      ('consent_records', 'consent_isolation'),
      ('conversations', 'conversations_isolation'),
      ('messages', 'messages_isolation'),
      ('bookings', 'bookings_isolation'),
      ('attribution_events', 'attribution_isolation'),
      ('reactivation_campaigns', 'reactivation_campaigns_isolation'),
      ('reactivation_touches', 'reactivation_touches_isolation'),
      ('invoices', 'invoices_isolation'),
      ('payment_promises', 'payment_promises_isolation'),
      ('collections_escalations', 'collections_escalations_isolation'),
      ('billing_accounts', 'billing_isolation'),
      ('activity_log', 'activity_log_isolation'),
      ('profiles', 'profiles_self_or_admin')
    ) as tables(table_name, policy_name)
  loop
    if to_regclass(format('public.%I', item.table_name)) is null then
      raise exception 'Missing baseline table: %', item.table_name;
    end if;
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = item.table_name
        and policyname = item.policy_name
    ) then
      raise exception 'Missing expected baseline policy %.%: review before migrating',
        item.table_name, item.policy_name;
    end if;
    for expected in
      select policyname::text from pg_policies
      where schemaname = 'public' and tablename = item.table_name
        and policyname <> item.policy_name
        and not (item.table_name = 'profiles' and policyname = 'profiles_self_update')
    loop
      raise exception 'Unexpected policy %.%: review before migrating', item.table_name, expected;
    end loop;
    raise notice 'Policy preflight PASS: public.% / expected policy % present / no unexpected policies',
      item.table_name, item.policy_name;
  end loop;
  raise notice 'Policy preflight PASS: all 17 baseline tables checked';
end;
$$;

-- SECURITY DEFINER is necessary to inspect the caller's current Auth metadata.
-- These functions accept no identity argument and disclose only caller scope.
-- Fully qualified names + empty search_path prevent object substitution.
create or replace function public.is_agency_admin()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users as u
    where u.id = (select auth.uid())
      and (select auth.jwt()) -> 'app_metadata' ->> 'role' = 'agency_admin'
      and u.raw_app_meta_data ->> 'role' = 'agency_admin'
      and ((select auth.jwt()) -> 'app_metadata' ->> 'client_id') is null
      and (u.raw_app_meta_data ->> 'client_id') is null
  );
$$;
alter function public.is_agency_admin() owner to postgres;

create or replace function public.requester_client_id()
returns uuid
language sql stable security definer
set search_path = ''
as $$
  select case
    when u.raw_app_meta_data ->> 'client_id'
      ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    then (u.raw_app_meta_data ->> 'client_id')::uuid
    else null
  end
  from auth.users as u
  where u.id = (select auth.uid())
    and u.raw_app_meta_data ->> 'role' in ('client_user', 'client_staff')
    and (select auth.jwt()) -> 'app_metadata' ->> 'role'
      = u.raw_app_meta_data ->> 'role'
    and (select auth.jwt()) -> 'app_metadata' ->> 'client_id'
      = u.raw_app_meta_data ->> 'client_id';
$$;
alter function public.requester_client_id() owner to postgres;
revoke all on function public.is_agency_admin() from public, anon, authenticated;
revoke all on function public.requester_client_id() from public, anon, authenticated;
grant execute on function public.is_agency_admin() to authenticated, service_role;
grant execute on function public.requester_client_id() to authenticated, service_role;

-- Reset both table and column grants, then install an explicit access matrix.
-- RLS does not restrict columns, and table-level REVOKE alone does not remove
-- any pre-existing column-level grants.
do $$
declare
  item record;
  column_names text;
  scope_expression text;
begin
  for item in
    select * from (values
      ('clients', 'clients_isolation'),
      ('client_systems', 'client_systems_isolation'),
      ('client_integrations', 'client_integrations_isolation'),
      ('contacts', 'contacts_isolation'),
      ('consent_records', 'consent_isolation'),
      ('conversations', 'conversations_isolation'),
      ('messages', 'messages_isolation'),
      ('bookings', 'bookings_isolation'),
      ('attribution_events', 'attribution_isolation'),
      ('reactivation_campaigns', 'reactivation_campaigns_isolation'),
      ('reactivation_touches', 'reactivation_touches_isolation'),
      ('invoices', 'invoices_isolation'),
      ('payment_promises', 'payment_promises_isolation'),
      ('collections_escalations', 'collections_escalations_isolation'),
      ('billing_accounts', 'billing_isolation'),
      ('activity_log', 'activity_log_isolation'),
      ('profiles', 'profiles_self_or_admin')
    ) as tables(table_name, policy_name)
  loop
    execute format('alter table public.%I enable row level security', item.table_name);
    execute format('revoke all on table public.%I from public, anon, authenticated', item.table_name);
    select string_agg(format('%I', column_name), ', ' order by ordinal_position)
      into column_names
      from information_schema.columns
      where table_schema = 'public' and table_name = item.table_name;
    execute format(
      'revoke select (%s), insert (%s), update (%s), references (%s) on public.%I from public, anon, authenticated',
      column_names, column_names, column_names, column_names, item.table_name
    );
    execute format('drop policy if exists %I on public.%I', item.policy_name, item.table_name);

    if item.table_name = 'profiles' then
      continue;
    end if;

    scope_expression := case when item.table_name = 'clients'
      then 'id = (select public.requester_client_id())'
      else 'client_id = (select public.requester_client_id())' end;

    execute format(
      'create policy tenant_read on public.%I for select to authenticated using ((select public.is_agency_admin()) or %s)',
      item.table_name, scope_expression
    );
    execute format(
      'create policy agency_manage on public.%I for all to authenticated using ((select public.is_agency_admin())) with check ((select public.is_agency_admin()))',
      item.table_name
    );

    if item.table_name not in ('client_integrations', 'client_systems') then
      execute format('grant select on public.%I to authenticated', item.table_name);
    end if;
    execute format('grant insert, update, delete on public.%I to authenticated', item.table_name);
  end loop;
end;
$$;

grant select (id, client_id, system_type, status, last_ping_at, created_at)
  on public.client_integrations to authenticated;
grant select (
  id, client_id, system_type, provenance, visible_to_client, active,
  setup_fee_cents, monthly_retainer_cents, created_at
) on public.client_systems to authenticated;

drop policy if exists profiles_self_update on public.profiles;
create policy profiles_read on public.profiles for select to authenticated
  using ((select public.is_agency_admin()) or id = (select auth.uid()));
create policy profiles_update_name on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));
grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

-- A profile is descriptive, not an authorization input. Keep its shape valid;
-- do not add an Auth hook that copies user-editable metadata into app_metadata.
alter table public.profiles add constraint profiles_role_client_shape check (
  (role = 'agency_admin' and client_id is null)
  or (role in ('client_user', 'client_staff') and client_id is not null)
) not valid;
alter table public.profiles validate constraint profiles_role_client_shape;

-- Composite parent keys let Postgres enforce tenant ownership of every link.
-- Existing single-column foreign keys are retained, including delete behavior.
alter table public.contacts add constraint contacts_client_id_id_key unique (client_id, id);
alter table public.conversations add constraint conversations_client_id_id_key unique (client_id, id);
alter table public.reactivation_campaigns add constraint reactivation_campaigns_client_id_id_key unique (client_id, id);
alter table public.invoices add constraint invoices_client_id_id_key unique (client_id, id);

alter table public.consent_records add constraint consent_records_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade not valid;
alter table public.conversations add constraint conversations_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade not valid;
alter table public.messages add constraint messages_tenant_conversation_fk
  foreign key (client_id, conversation_id) references public.conversations (client_id, id) on delete cascade not valid;
alter table public.bookings add constraint bookings_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade not valid;
alter table public.attribution_events add constraint attribution_events_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade not valid;
alter table public.reactivation_touches add constraint reactivation_touches_tenant_campaign_fk
  foreign key (client_id, campaign_id) references public.reactivation_campaigns (client_id, id) on delete cascade not valid;
alter table public.reactivation_touches add constraint reactivation_touches_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) on delete cascade not valid;
alter table public.invoices add constraint invoices_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) not valid;
alter table public.payment_promises add constraint payment_promises_tenant_invoice_fk
  foreign key (client_id, invoice_id) references public.invoices (client_id, id) on delete cascade not valid;
alter table public.payment_promises add constraint payment_promises_tenant_conversation_fk
  foreign key (client_id, extracted_from_conversation_id) references public.conversations (client_id, id) not valid;
alter table public.collections_escalations add constraint collections_escalations_tenant_invoice_fk
  foreign key (client_id, invoice_id) references public.invoices (client_id, id) on delete cascade not valid;
alter table public.activity_log add constraint activity_log_tenant_contact_fk
  foreign key (client_id, contact_id) references public.contacts (client_id, id) not valid;

alter table public.consent_records validate constraint consent_records_tenant_contact_fk;
alter table public.conversations validate constraint conversations_tenant_contact_fk;
alter table public.messages validate constraint messages_tenant_conversation_fk;
alter table public.bookings validate constraint bookings_tenant_contact_fk;
alter table public.attribution_events validate constraint attribution_events_tenant_contact_fk;
alter table public.reactivation_touches validate constraint reactivation_touches_tenant_campaign_fk;
alter table public.reactivation_touches validate constraint reactivation_touches_tenant_contact_fk;
alter table public.invoices validate constraint invoices_tenant_contact_fk;
alter table public.payment_promises validate constraint payment_promises_tenant_invoice_fk;
alter table public.payment_promises validate constraint payment_promises_tenant_conversation_fk;
alter table public.collections_escalations validate constraint collections_escalations_tenant_invoice_fk;
alter table public.activity_log validate constraint activity_log_tenant_contact_fk;

-- Supporting indexes for tenant filters and FK checks not covered by baseline.
create index if not exists idx_profiles_client on public.profiles (client_id);
create index if not exists idx_integrations_client on public.client_integrations (client_id);
create index if not exists idx_consent_client_contact on public.consent_records (client_id, contact_id);
create index if not exists idx_conversations_client_contact on public.conversations (client_id, contact_id);
create index if not exists idx_messages_client_conversation on public.messages (client_id, conversation_id);
create index if not exists idx_bookings_client_contact on public.bookings (client_id, contact_id);
create index if not exists idx_attribution_client_contact on public.attribution_events (client_id, contact_id);
create index if not exists idx_touches_client_campaign on public.reactivation_touches (client_id, campaign_id);
create index if not exists idx_touches_client_contact on public.reactivation_touches (client_id, contact_id);
create index if not exists idx_invoices_client_contact on public.invoices (client_id, contact_id);
create index if not exists idx_promises_client_invoice on public.payment_promises (client_id, invoice_id);
create index if not exists idx_promises_client_conversation on public.payment_promises (client_id, extracted_from_conversation_id);
create index if not exists idx_escalations_client_invoice on public.collections_escalations (client_id, invoice_id);
create index if not exists idx_activity_client_contact on public.activity_log (client_id, contact_id);

-- Prevent future unqualified resolution inside the existing trigger function.
alter function public.set_updated_at() set search_path = '';

notify pgrst, 'reload schema';
commit;

-- SQL Editor result grid: emitted only after the transaction above completes.
-- This confirms preflight/migration execution, NOT JWT or tenant-isolation tests.
select
  'PASS: 17 baseline tables; expected policies present; no unexpected policies' as policy_preflight,
  'COMMITTED: tenant hardening; Auth/RLS session tests still required' as migration_result;
