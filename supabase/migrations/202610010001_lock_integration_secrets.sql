-- Lock integration secrets away from client JWTs.
--
-- RLS cannot hide columns. system_webhooks_client_select and
-- whatsapp_credentials.tenant_read granted SELECT on the whole row, and
-- secret_hash was a second copy of the cleartext signing secret.
--
-- This migration:
--   * replaces that cleartext with sha256(secret) in secret_hash
--   * revokes anon/authenticated access to secret columns (table-level
--     GRANT SELECT includes every column, so it is revoked and replaced
--     with an explicit safe-column list)
--   * exposes security-invoker views that do not contain secret columns
--
-- Signing secrets stay on the base tables for the service role, which
-- bypasses RLS and keeps full table grants. Authenticated sessions,
-- including agency_admin, cannot read them.

begin;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- pgcrypto is normally already installed in `extensions` on Supabase.
do $migrate$
declare
  digest_schema text;
begin
  if not exists (select 1 from pg_extension where extname = 'pgcrypto') then
    execute 'create extension pgcrypto with schema extensions';
  end if;

  select n.nspname
    into digest_schema
  from pg_proc as p
  join pg_namespace as n on n.oid = p.pronamespace
  where p.proname = 'digest'
    and pg_get_function_identity_arguments(p.oid) = 'bytea, text'
  order by (n.nspname = 'extensions') desc
  limit 1;

  if digest_schema is null then
    raise exception 'pgcrypto digest(bytea, text) is not installed';
  end if;

  -- sha256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
  execute format(
    'create or replace function public.hash_integration_secret(raw text)
     returns text
     language sql
     immutable
     security definer
     set search_path = ''''
     as $body$
       select case
         when raw is null or btrim(raw) = '''' then null::text
         else encode(%I.digest(convert_to(btrim(raw), ''UTF8''), ''sha256''), ''hex'')
       end
     $body$',
    digest_schema
  );
end
$migrate$;

alter function public.hash_integration_secret(text) owner to postgres;
revoke all on function public.hash_integration_secret(text) from public, anon, authenticated;
grant execute on function public.hash_integration_secret(text) to service_role;

create or replace function public.system_webhooks_set_secret_hash()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.secret_ciphertext is not null and btrim(new.secret_ciphertext) = '' then
    new.secret_ciphertext := null;
  end if;
  new.secret_hash := public.hash_integration_secret(new.secret_ciphertext);
  return new;
end;
$$;

alter function public.system_webhooks_set_secret_hash() owner to postgres;
revoke all on function public.system_webhooks_set_secret_hash() from public, anon, authenticated;

drop trigger if exists system_webhooks_set_secret_hash on public.system_webhooks;
create trigger system_webhooks_set_secret_hash
  before insert or update on public.system_webhooks
  for each row execute function public.system_webhooks_set_secret_hash();

-- Existing rows stored the raw secret in both columns. Prefer ciphertext,
-- and if only secret_hash was populated, keep that value as the recoverable
-- secret before the trigger replaces secret_hash with its digest.
update public.system_webhooks
set secret_ciphertext = coalesce(
  nullif(btrim(secret_ciphertext), ''),
  nullif(btrim(secret_hash), '')
)
where nullif(btrim(secret_ciphertext), '') is not null
   or nullif(btrim(secret_hash), '') is not null;

alter table public.system_webhooks
  drop constraint if exists system_webhooks_secret_hash_sha256;
alter table public.system_webhooks
  add constraint system_webhooks_secret_hash_sha256
  check (secret_hash is null or secret_hash ~ '^[0-9a-f]{64}$');

alter table public.system_webhooks
  add column if not exists has_secret boolean
  generated always as (
    secret_ciphertext is not null and btrim(secret_ciphertext) <> ''
  ) stored;

alter table public.whatsapp_credentials
  add column if not exists has_access_token boolean
  generated always as (
    access_token is not null and btrim(access_token) <> ''
  ) stored;

-- Table-level REVOKE does not clear column grants. Reset both, then grant
-- only the columns a client session is allowed to see.
do $migrate$
declare
  target text;
  column_names text;
begin
  foreach target in array array['system_webhooks', 'whatsapp_credentials']
  loop
    execute format('revoke all on table public.%I from public, anon, authenticated', target);
    select string_agg(format('%I', column_name), ', ' order by ordinal_position)
      into column_names
    from information_schema.columns
    where table_schema = 'public' and table_name = target;
    execute format(
      'revoke select (%s), insert (%s), update (%s), references (%s) on public.%I from public, anon, authenticated',
      column_names, column_names, column_names, column_names, target
    );
  end loop;
end
$migrate$;

grant select (
  id, client_id, system_type, direction, label, webhook_url, enabled,
  has_secret, last_ping_at, last_status, last_error, created_at, updated_at
) on public.system_webhooks to authenticated;

grant select (
  id, client_id, waba_id, phone_number_id, phone_number, status,
  quality_rating, has_access_token, last_ping_at, created_at, updated_at
) on public.whatsapp_credentials to authenticated;

grant select, insert, update, delete on public.system_webhooks to service_role;
grant select, insert, update, delete on public.whatsapp_credentials to service_role;

comment on column public.system_webhooks.secret_ciphertext is
  'Signing secret. Not granted to anon or authenticated. Read and write with the service role.';
comment on column public.system_webhooks.secret_hash is
  'Lowercase hex SHA-256 of secret_ciphertext. Not the secret, and not granted to anon or authenticated.';
comment on column public.whatsapp_credentials.access_token is
  'Meta Cloud API access token. Not granted to anon or authenticated.';
comment on column public.whatsapp_credentials.webhook_verify_token is
  'Meta webhook verify token. Not granted to anon or authenticated.';

-- Supported read path. security_invoker keeps the base table RLS policies
-- (client rows only, agency admins see every tenant). Secret columns are
-- not in the projection, so select=* on the view cannot return them.
create or replace view public.system_webhooks_safe
with (security_barrier = true, security_invoker = true) as
select
  id,
  client_id,
  system_type,
  direction,
  label,
  webhook_url,
  enabled,
  has_secret,
  last_ping_at,
  last_status,
  last_error,
  created_at,
  updated_at
from public.system_webhooks;

create or replace view public.whatsapp_credentials_safe
with (security_barrier = true, security_invoker = true) as
select
  id,
  client_id,
  waba_id,
  phone_number_id,
  phone_number,
  status,
  quality_rating,
  has_access_token,
  last_ping_at,
  created_at,
  updated_at
from public.whatsapp_credentials;

revoke all on table public.system_webhooks_safe from public, anon, authenticated;
revoke all on table public.whatsapp_credentials_safe from public, anon, authenticated;
grant select on public.system_webhooks_safe to authenticated;
grant select on public.whatsapp_credentials_safe to authenticated;
grant select on public.system_webhooks_safe to service_role;
grant select on public.whatsapp_credentials_safe to service_role;

comment on view public.system_webhooks_safe is
  'Tenant-scoped webhook registry without signing secrets. Use this from user sessions.';
comment on view public.whatsapp_credentials_safe is
  'Tenant-scoped WhatsApp credential status without access_token or webhook_verify_token.';

notify pgrst, 'reload schema';

commit;
