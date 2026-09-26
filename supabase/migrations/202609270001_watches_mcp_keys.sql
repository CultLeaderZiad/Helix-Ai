-- Migration: 202609270001_watches_mcp_keys.sql
-- Description: Saved search watches, search watches cron/open triggers, and peppered MCP API keys

-- 1. search_watches table
create table if not exists public.search_watches (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  kind text not null check (kind in ('search_web', 'find_leads')),
  query text not null,
  params jsonb not null default '{}'::jsonb,
  cadence text not null default 'daily' check (cadence in ('daily', 'weekly')),
  active boolean not null default true,
  last_run_at timestamptz,
  last_request_id uuid references public.search_requests(id) on delete set null,
  new_results_count integer not null default 0,
  last_seen_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_search_watches_client on public.search_watches(client_id, active);
create index if not exists idx_search_watches_cadence on public.search_watches(active, last_run_at);

-- FK on search_requests.watch_id
alter table public.search_requests
  drop constraint if exists fk_search_requests_watch;
alter table public.search_requests
  add constraint fk_search_requests_watch foreign key (watch_id) references public.search_watches(id) on delete set null;

-- 2. helix_api_keys table (for MCP tools & external integrations)
create table if not exists public.helix_api_keys (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references public.clients(id) on delete cascade, -- null = agency admin scope
  label text not null,
  key_prefix text not null,                                      -- e.g. hx_live_a1b2
  key_hash text not null unique,                                 -- sha256(pepper + secret)
  scopes text[] not null default '{"read", "write"}'::text[],
  rate_per_minute integer not null default 10,
  last_used_at timestamptz,
  revoked_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_helix_api_keys_lookup on public.helix_api_keys(key_hash) where revoked_at is null;

-- 3. Row Level Security

alter table public.search_watches enable row level security;
alter table public.helix_api_keys enable row level security;

-- search_watches policies
create policy search_watches_admin_all on public.search_watches
  for all to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'agency_admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'agency_admin');

create policy search_watches_client_scoped on public.search_watches
  for all to authenticated
  using (
    (auth.jwt()->'app_metadata'->>'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt()->'app_metadata'->>'client_id')::uuid
  )
  with check (
    (auth.jwt()->'app_metadata'->>'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt()->'app_metadata'->>'client_id')::uuid
  );

-- helix_api_keys policies (agency_admin only)
create policy helix_api_keys_admin_only on public.helix_api_keys
  for all to authenticated
  using ((auth.jwt()->'app_metadata'->>'role') = 'agency_admin')
  with check ((auth.jwt()->'app_metadata'->>'role') = 'agency_admin');
