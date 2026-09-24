-- 202609240001_leadgen.sql
-- Helix AI Control Plane: Lead Generation + Scrapling Job State & Leads
-- Scrapling execution runs in a separate Docker worker; Helix-Ai is the control plane.

create table if not exists public.leadgen_jobs (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'paused', 'succeeded', 'failed')),
  stage text not null default 'brief' check (stage in ('brief', 'seed', 'discover', 'fetch', 'extract', 'enrich', 'score', 'outreach', 'export')),
  stage_label text not null default 'Job queued',
  stage_index integer not null default 0,
  stages_total integer not null default 9,
  brief jsonb not null default '{}'::jsonb,
  seeds jsonb not null default '{}'::jsonb,
  engine_default text not null default 'stealth' check (engine_default in ('http', 'stealth', 'dynamic')),
  mode text not null default 'crawl' check (mode in ('crawl', 'sitemap', 'shopify', 'csv_feed', 'digest')),
  recipe_id text not null default 'mena-construction-contact',
  robots_obey boolean not null default true,
  adaptive boolean not null default true,
  capture_xhr_pattern text,
  enrich_emails boolean not null default true,
  generate_outreach boolean not null default true,
  proxy_mode text not null default 'off',
  checkpoint_path text,
  logs text[] not null default '{}'::text[],
  leads_count integer not null default 0,
  pages_fetched integer not null default 0,
  pages_blocked integer not null default 0,
  elapsed_ms integer not null default 0,
  credits_used numeric(10,2) not null default 0,
  credit_budget numeric(10,2) not null default 50,
  error_msg text,
  owner_boot_id text,
  heartbeat_at timestamptz,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

create table if not exists public.leadgen_leads (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.leadgen_jobs(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  company_name text,
  website text,
  domain text,
  emails text[] not null default '{}'::text[],
  phones text[] not null default '{}'::text[],
  socials jsonb not null default '{}'::jsonb,
  address text,
  decision_makers jsonb not null default '[]'::jsonb,
  markdown_excerpt text,
  markdown_artifact_path text,
  extract_status text not null default 'ok' check (extract_status in ('empty', 'partial', 'ok', 'failed')),
  fetch_status text not null default 'ok' check (fetch_status in ('ok', 'blocked', 'rate_limited', 'error')),
  engine_used text not null default 'stealth',
  email_source text not null default 'none' check (email_source in ('website', 'hunter', 'bio', 'none')),
  phone_source text not null default 'none' check (phone_source in ('website', 'bio', 'none')),
  lead_score integer not null default 0 check (lead_score >= 0 and lead_score <= 100),
  priority text not null default 'low' check (priority in ('high', 'med', 'low')),
  outreach jsonb,
  sources jsonb not null default '{}'::jsonb,
  crm_contact_id uuid references public.contacts(id) on delete set null,
  crm_company_id uuid references public.companies(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_leadgen_jobs_client on public.leadgen_jobs(client_id);
create index if not exists idx_leadgen_jobs_status on public.leadgen_jobs(status);
create index if not exists idx_leadgen_jobs_created on public.leadgen_jobs(created_at desc);

create index if not exists idx_leadgen_leads_job on public.leadgen_leads(job_id);
create index if not exists idx_leadgen_leads_client on public.leadgen_leads(client_id);
create index if not exists idx_leadgen_leads_domain on public.leadgen_leads(domain);
create index if not exists idx_leadgen_leads_score on public.leadgen_leads(lead_score desc);

-- Triggers for updated_at
drop trigger if exists leadgen_jobs_set_updated_at on public.leadgen_jobs;
create trigger leadgen_jobs_set_updated_at before update on public.leadgen_jobs
  for each row execute function public.set_updated_at();

drop trigger if exists leadgen_leads_set_updated_at on public.leadgen_leads;
create trigger leadgen_leads_set_updated_at before update on public.leadgen_leads
  for each row execute function public.set_updated_at();

-- Enable RLS
alter table public.leadgen_jobs enable row level security;
alter table public.leadgen_leads enable row level security;

-- Agency Admin: full CRUD across all tenants
drop policy if exists "leadgen_jobs_admin_all" on public.leadgen_jobs;
create policy "leadgen_jobs_admin_all"
  on public.leadgen_jobs
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

drop policy if exists "leadgen_leads_admin_all" on public.leadgen_leads;
create policy "leadgen_leads_admin_all"
  on public.leadgen_leads
  for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

-- Client Users: scoped to their own client_id
drop policy if exists "leadgen_jobs_client_select" on public.leadgen_jobs;
create policy "leadgen_jobs_client_select"
  on public.leadgen_jobs
  for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  );

drop policy if exists "leadgen_jobs_client_insert" on public.leadgen_jobs;
create policy "leadgen_jobs_client_insert"
  on public.leadgen_jobs
  for insert
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  );

drop policy if exists "leadgen_jobs_client_update" on public.leadgen_jobs;
create policy "leadgen_jobs_client_update"
  on public.leadgen_jobs
  for update
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  )
  with check (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  );

drop policy if exists "leadgen_leads_client_select" on public.leadgen_leads;
create policy "leadgen_leads_client_select"
  on public.leadgen_leads
  for select
  using (
    (auth.jwt() -> 'app_metadata' ->> 'role') in ('client_user', 'client_staff')
    and client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid
  );

-- Realtime publication
alter publication supabase_realtime add table public.leadgen_jobs;
alter publication supabase_realtime add table public.leadgen_leads;
