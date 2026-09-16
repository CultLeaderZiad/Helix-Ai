create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  subject text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  unread_by_admin boolean not null default true,
  unread_by_client boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null,
  client_id uuid not null,
  sender_profile_id uuid references public.profiles(id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  constraint support_messages_tenant_ticket_fk foreign key (client_id, ticket_id) references public.support_tickets(client_id, id) on delete cascade
);

alter table public.support_tickets add constraint support_tickets_client_id_id_key unique (client_id, id);

create index idx_support_tickets_client on public.support_tickets (client_id);
create index idx_support_messages_ticket on public.support_messages (ticket_id);

alter table public.support_tickets enable row level security;
alter table public.support_messages enable row level security;

-- Support Tickets Policies
create policy tickets_read on public.support_tickets for select to authenticated 
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));

create policy tickets_insert on public.support_tickets for insert to authenticated 
  with check (client_id = (select public.requester_client_id()));

create policy tickets_update on public.support_tickets for update to authenticated 
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()))
  with check ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));

create policy tickets_delete on public.support_tickets for delete to authenticated 
  using ((select public.is_agency_admin()));

-- Support Messages Policies
create policy messages_read on public.support_messages for select to authenticated 
  using ((select public.is_agency_admin()) or client_id = (select public.requester_client_id()));

create policy messages_insert on public.support_messages for insert to authenticated 
  with check (((select public.is_agency_admin()) or client_id = (select public.requester_client_id())));

-- Enable Realtime for live notifications
alter publication supabase_realtime add table public.support_tickets;
alter publication supabase_realtime add table public.support_messages;
