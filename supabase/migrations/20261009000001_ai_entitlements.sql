-- Authoritative entitlements and limits
CREATE TABLE ai_entitlements (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'inactive',
  features TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Deny client modifications
ALTER TABLE ai_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own entitlements" ON ai_entitlements FOR SELECT USING (client_id = auth.uid());
-- Only service_role can mutate

CREATE TABLE ai_usage_limits (
  client_id UUID PRIMARY KEY REFERENCES clients(id) ON DELETE CASCADE,
  api_requests_per_minute INT NOT NULL DEFAULT 10,
  max_concurrent_tasks INT NOT NULL DEFAULT 1,
  monthly_search_quota INT NOT NULL DEFAULT 100,
  monthly_search_used INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE ai_usage_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can view own limits" ON ai_usage_limits FOR SELECT USING (client_id = auth.uid());
-- Only service_role can mutate
