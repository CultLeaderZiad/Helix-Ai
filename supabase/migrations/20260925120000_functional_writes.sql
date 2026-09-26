-- Additive, non-destructive. Safe to run once on the existing project.
-- Public marketing inquiries, durable FAQ/pricing/changelog documents,
-- and client-workspace writes that RLS previously reserved for agency admins.

begin;

create table if not exists public.contact_inquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  volume text,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_inquiries enable row level security;

drop policy if exists contact_inquiries_admin_read on public.contact_inquiries;
create policy contact_inquiries_admin_read on public.contact_inquiries
  for select to authenticated
  using ((select public.is_agency_admin()));

grant select on public.contact_inquiries to authenticated;

create table if not exists public.site_documents (
  doc_key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.site_documents enable row level security;

drop policy if exists site_documents_public_read on public.site_documents;
create policy site_documents_public_read on public.site_documents
  for select to anon, authenticated
  using (doc_key in ('faqs', 'pricing', 'updates'));

drop policy if exists site_documents_admin_write on public.site_documents;
create policy site_documents_admin_write on public.site_documents
  for all to authenticated
  using ((select public.is_agency_admin()))
  with check ((select public.is_agency_admin()));

grant select on public.site_documents to anon, authenticated;
grant insert, update, delete on public.site_documents to authenticated;

-- Client operators can add and edit contacts in their own workspace.
-- Agency admins keep the existing agency_manage policy.
drop policy if exists contacts_tenant_insert on public.contacts;
create policy contacts_tenant_insert on public.contacts
  for insert to authenticated
  with check (client_id = (select public.requester_client_id()));

drop policy if exists contacts_tenant_update on public.contacts;
create policy contacts_tenant_update on public.contacts
  for update to authenticated
  using (client_id = (select public.requester_client_id()))
  with check (client_id = (select public.requester_client_id()));

drop policy if exists deals_tenant_insert on public.deals;
create policy deals_tenant_insert on public.deals
  for insert to authenticated
  with check (client_id = (select public.requester_client_id()));

commit;
