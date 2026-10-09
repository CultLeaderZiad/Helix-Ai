-- AI05: Revoke secret-column access from tenant roles
revoke select on public.system_webhooks from authenticated;
grant select (id, client_id, system_type, direction, label, webhook_url, enabled, last_ping_at, last_status, last_error, created_at, updated_at) on public.system_webhooks to authenticated;

-- (Keep INSERT/UPDATE/DELETE if any, but currently only agency_admin can do that)

-- AI15: Webhook Outbox table
create table if not exists public.system_webhook_outbox (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references public.system_webhooks(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  idempotency_key text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'delivered', 'failed', 'dead_letter')),
  attempts integer not null default 0,
  next_retry_at timestamptz not null default now(),
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_outbox_status_retry on public.system_webhook_outbox(status, next_retry_at);
create index if not exists idx_outbox_webhook on public.system_webhook_outbox(webhook_id);

alter table public.system_webhook_outbox enable row level security;
-- Internal table used by service role, so no policies needed for authenticated users.

-- AI07: Unsafe fact writes
-- Add explicit evidence tracking and human approval requirement to crm_facts
alter table public.crm_facts add column if not exists approval_required boolean not null default false;
alter table public.crm_facts add column if not exists approved_by uuid references auth.users(id);
alter table public.crm_facts add column if not exists approved_at timestamptz;
