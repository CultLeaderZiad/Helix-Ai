-- 202609260001_search_bus_leadgen_v2.sql
-- Lead Gen v2 (Enrich / Find modes) + Search Bus schema + places/hunter support

-- 1. Extend leadgen_leads with descriptions, geo, place attributes, and origin
alter table public.leadgen_leads
  add column if not exists description text,
  add column if not exists description_source text not null default 'none',
  add column if not exists city text,
  add column if not exists country text,
  add column if not exists geo_source text not null default 'none',
  add column if not exists place_id text,
  add column if not exists place_provider text,
  add column if not exists origin text not null default 'crawl',
  add column if not exists pages_checked integer not null default 0,
  add column if not exists places_fetched_at timestamptz,
  add column if not exists people jsonb not null default '[]'::jsonb;

-- Check constraints for leadgen_leads sources & origin
alter table public.leadgen_leads drop constraint if exists leadgen_leads_description_source_check;
alter table public.leadgen_leads add constraint leadgen_leads_description_source_check
  check (description_source in ('meta','og','jsonld','page','tinyfish_fetch','tinyfish_agent','google_places','none'));

alter table public.leadgen_leads drop constraint if exists leadgen_leads_geo_source_check;
alter table public.leadgen_leads add constraint leadgen_leads_geo_source_check
  check (geo_source in ('schema_org','address_text','tld','google_places','foursquare','osm','none'));

alter table public.leadgen_leads drop constraint if exists leadgen_leads_origin_check;
alter table public.leadgen_leads add constraint leadgen_leads_origin_check
  check (origin in ('crawl','enrich_url','find_leads','search_save','watch'));

-- Deduplicate any existing duplicate (job_id, domain) rows before adding unique index
delete from public.leadgen_leads a
using public.leadgen_leads b
where a.id < b.id
  and a.job_id = b.job_id
  and a.domain is not null
  and a.domain = b.domain;

create unique index if not exists uq_leadgen_leads_job_domain
  on public.leadgen_leads(job_id, domain) where domain is not null;

create index if not exists idx_leadgen_leads_place
  on public.leadgen_leads(place_id);

-- 2. Extend leadgen_jobs with job_kind
alter table public.leadgen_jobs
  add column if not exists job_kind text not null default 'crawl';

alter table public.leadgen_jobs drop constraint if exists leadgen_jobs_job_kind_check;
alter table public.leadgen_jobs add constraint leadgen_jobs_job_kind_check
  check (job_kind in ('crawl','enrich','find'));

-- 3. Search Requests Table
create table if not exists public.search_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  kind text not null check (kind in ('search_web','find_leads','enrich_url','get_watch_results','run_watch')),
  origin text not null check (origin in ('search_page','leadgen','watch_cron','watch_open','mcp')),
  query text not null,
  params jsonb not null default '{}'::jsonb,
  status text not null default 'running' check (status in ('running','succeeded','partial','failed')),
  providers_used text[] not null default '{}',
  results_count integer not null default 0,
  cost_micros bigint not null default 0,
  error_msg text,
  watch_id uuid,
  leadgen_job_id uuid references public.leadgen_jobs(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists idx_search_requests_client
  on public.search_requests(client_id, created_at desc);

-- 4. Search Events Table
create table if not exists public.search_events (
  id bigint generated always as identity primary key,
  request_id uuid not null references public.search_requests(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  provider text not null,
  status text not null check (status in ('ok','empty','not_found','blocked','rate_limited','quota_blocked','unavailable','error','pending')),
  http_status integer,
  latency_ms integer,
  units integer not null default 1,
  cost_micros bigint not null default 0,
  external_ref text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_events_request
  on public.search_events(request_id);

create index if not exists idx_search_events_provider_time
  on public.search_events(provider, created_at desc);

-- 5. Search Results Table
create table if not exists public.search_results (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.search_requests(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  rank integer not null,
  result_type text not null check (result_type in ('business','web_page','social_profile','news')),
  title text,
  url text,
  domain text,
  snippet text,
  sources text[] not null default '{}',
  place_id text,
  place_provider text,
  payload jsonb not null default '{}'::jsonb,
  fingerprint text not null,
  is_new boolean not null default true,
  saved_lead_id uuid references public.leadgen_leads(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_search_results_request
  on public.search_results(request_id, rank);

create index if not exists idx_search_results_fp
  on public.search_results(client_id, fingerprint);

-- 6. Search Geo Cache
create table if not exists public.search_geo_cache (
  key text primary key,
  provider text not null,
  lat double precision,
  lng double precision,
  country text,
  fetched_at timestamptz not null default now()
);

-- 7. Engine Usage Extensions & Atomic Increment RPC
alter table public.leadgen_engine_usage drop constraint if exists leadgen_engine_usage_engine_check;
alter table public.leadgen_engine_usage add constraint leadgen_engine_usage_engine_check check (engine in
  ('http','dynamic','stealth','tinyfish_search','tinyfish_fetch','tinyfish_agent','google_places','google_geocode',
   'foursquare','osm_overpass','nominatim','brightdata_serp','hunter'));

alter table public.leadgen_engine_usage add column if not exists cost_micros bigint not null default 0;

-- Merge duplicate rows where client_id is null before unique index
delete from public.leadgen_engine_usage a
using public.leadgen_engine_usage b
where a.id < b.id
  and a.usage_date = b.usage_date
  and a.usage_month = b.usage_month
  and a.engine = b.engine
  and a.client_id is null
  and b.client_id is null;

create unique index if not exists uq_leadgen_engine_usage_bucket on public.leadgen_engine_usage
  (usage_date, usage_month, engine, coalesce(client_id, '00000000-0000-0000-0000-000000000000'::uuid));

create or replace function public.increment_provider_usage(
  p_engine text,
  p_client uuid,
  p_requests int,
  p_browser_ms bigint,
  p_cost_micros bigint
)
returns void language sql security definer set search_path = public as $$
  insert into public.leadgen_engine_usage(usage_date, usage_month, engine, client_id, requests, browser_ms, cost_micros)
  values (
    (now() at time zone 'utc')::date,
    to_char(now() at time zone 'utc', 'YYYY-MM'),
    p_engine,
    p_client,
    p_requests,
    p_browser_ms,
    p_cost_micros
  )
  on conflict (usage_date, usage_month, engine, coalesce(client_id, '00000000-0000-0000-0000-000000000000'::uuid))
  do update set
    requests = leadgen_engine_usage.requests + excluded.requests,
    browser_ms = leadgen_engine_usage.browser_ms + excluded.browser_ms,
    cost_micros = leadgen_engine_usage.cost_micros + excluded.cost_micros,
    updated_at = now();
$$;

revoke all on function public.increment_provider_usage(text,uuid,int,bigint,bigint) from public, anon, authenticated;

-- 8. Row Level Security Policies
alter table public.search_requests enable row level security;
alter table public.search_events enable row level security;
alter table public.search_results enable row level security;
alter table public.search_geo_cache enable row level security;

-- Admin policies
drop policy if exists "search_requests_admin_all" on public.search_requests;
create policy "search_requests_admin_all" on public.search_requests for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

drop policy if exists "search_events_admin_all" on public.search_events;
create policy "search_events_admin_all" on public.search_events for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

drop policy if exists "search_results_admin_all" on public.search_results;
create policy "search_results_admin_all" on public.search_results for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

drop policy if exists "search_geo_cache_admin_all" on public.search_geo_cache;
create policy "search_geo_cache_admin_all" on public.search_geo_cache for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'agency_admin');

-- Client read policies (scoped to client_id)
drop policy if exists "search_requests_client_select" on public.search_requests;
create policy "search_requests_client_select" on public.search_requests for select
  using (client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid);

drop policy if exists "search_events_client_select" on public.search_events;
create policy "search_events_client_select" on public.search_events for select
  using (client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid);

drop policy if exists "search_results_client_select" on public.search_results;
create policy "search_results_client_select" on public.search_results for select
  using (client_id = (auth.jwt() -> 'app_metadata' ->> 'client_id')::uuid);
