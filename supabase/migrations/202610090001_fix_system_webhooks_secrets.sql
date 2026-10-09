-- 202610090001_fix_system_webhooks_secrets.sql
-- Remove client SELECT policy so secrets are not exposed to clients

drop policy if exists "system_webhooks_client_select" on public.system_webhooks;
