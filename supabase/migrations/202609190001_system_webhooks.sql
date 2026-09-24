-- 202609190001_system_webhooks.sql
-- Helix AI Control Plane: Admin-editable n8n endpoints per tenant + system

create table if not exists public.system_webhooks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  system_type text not null,
  direction text not null check (direction in ('helix_to_n8n', 'n8n_to_helix')),
  label text,
  webhook_url text not null check (webhook_url ~ '^https://'),
  -- store secret encrypted or as vault ref; never select secret to client_user
  secret_ciphertext text,
  secret_hash text,
  enabled boolean not null default true,
  last_ping_at timestamptz,
  last_status text check (last_status is null or last_status in ('ok', 'failed', 'unknown', 'healthy', 'degraded')),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint system_webhooks_client_system_direction_uniq unique (client_id, system_type, direction)
);

create index if not exists idx_system_webhooks_client on public.system_webhooks(client_id);
create index if not exists idx_system_webhooks_type on public.system_webhooks(system_type);

-- Updated_at trigger
drop trigger if exists system_webhooks_set_updated_at on public.system_webhooks;
create trigger system_webhooks_set_updated_at before update on public.system_webhooks
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.system_webhooks enable row level security;

-- Agency Admin: full CRUD across all workspaces
drop policy if exists "system_webhooks_admin_all" on public.system_webhooks;
create policy "system_webhooks_admin_all"
  on public.system_webhooks
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

-- Client Users: read-only status for their own workspace (excluding sensitive secrets)
drop policy if exists "system_webhooks_client_select" on public.system_webhooks;
create policy "system_webhooks_client_select"
  on public.system_webhooks
  for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  );
