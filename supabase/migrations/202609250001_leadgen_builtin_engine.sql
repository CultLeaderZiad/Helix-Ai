-- 202609250001_leadgen_builtin_engine.sql
-- Helix AI Control Plane: Built-in TypeScript Lead Gen Engine with Cloudflare & Bright Data Quota Tracking

-- 1. Create leadgen_engine_usage table for daily/monthly aggregates and soft-cap enforcement
create table if not exists public.leadgen_engine_usage (
  id uuid primary key default gen_random_uuid(),
  usage_date date not null, -- UTC date for browser_ms / daily limits
  usage_month text not null, -- 'YYYY-MM' UTC for stealth monthly caps
  engine text not null check (engine in ('http', 'dynamic', 'stealth')),
  client_id uuid references public.clients(id) on delete set null,
  requests integer not null default 0,
  browser_ms bigint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (usage_date, usage_month, engine, client_id)
);

create index if not exists idx_leadgen_engine_usage_date on public.leadgen_engine_usage(usage_date);
create index if not exists idx_leadgen_engine_usage_month on public.leadgen_engine_usage(usage_month);

alter table public.leadgen_engine_usage enable row level security;

-- Agency Admin: full CRUD access
drop policy if exists "leadgen_engine_usage_admin_all" on public.leadgen_engine_usage;
create policy "leadgen_engine_usage_admin_all"
  on public.leadgen_engine_usage
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

-- 2. Alter leadgen_jobs table to add lease_until and cursor for chunked tick execution
alter table public.leadgen_jobs
  add column if not exists lease_until timestamptz,
  add column if not exists cursor jsonb not null default '{}'::jsonb;

-- 3. Extend engine_default check constraint to include 'auto'
alter table public.leadgen_jobs drop constraint if exists leadgen_jobs_engine_default_check;
alter table public.leadgen_jobs add constraint leadgen_jobs_engine_default_check
  check (engine_default in ('http', 'stealth', 'dynamic', 'auto'));

-- Trigger for leadgen_engine_usage updated_at
drop trigger if exists leadgen_engine_usage_set_updated_at on public.leadgen_engine_usage;
create trigger leadgen_engine_usage_set_updated_at before update on public.leadgen_engine_usage
  for each row execute function public.set_updated_at();
