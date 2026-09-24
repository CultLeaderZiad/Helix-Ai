-- Public contact form inquiry persistence
create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  work_email text not null,
  company_name text,
  monthly_volume text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

create policy contact_inquiries_admin on public.contact_inquiries
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

create policy contact_inquiries_insert on public.contact_inquiries
  for insert to anon, authenticated
  with check (true);
