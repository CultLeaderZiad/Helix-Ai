# Scrapling Worker for Helix-Ai

Dedicated worker for web discovery, adaptive extraction, and lead generation in the Helix-Ai control plane.

## Architecture

- **Control Plane:** Next.js (App Router + Supabase) at `/dashboard/lead-generation`
- **Execution Engine:** Scrapling Python worker (`ghcr.io/d4vinci/scrapling:latest`)
- **Isolation Guarantee:** `scrapling` is **NEVER** imported into the Next.js bundle. Next only enqueues and reads job status from Supabase.
- **Attribution:** BSD 3-Clause license in `NOTICE`.

## Quickstart (Local Docker)

```bash
cd workers/scrapling
docker build -t helix-scrapling-worker .
docker run -p 8080:8080 \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
  helix-scrapling-worker
```

Or run directly with Python:

```bash
cd workers/scrapling
pip install -r requirements.txt
scrapling install
python main.py
```

## Endpoints

- `GET /health`: Returns `{ worker: "online", scrapling_version: "0.3.1", engines: ["http", "stealth", "dynamic"], browsers_ready: true, proxy: "off", robots_default: true, queue_depth: 0, control_plane: "helix-ai" }`
- `POST /jobs/{id}/start`: Manually trigger or accelerate claim for `job_id`.
- `POST /jobs/{id}/pause`: Signal a running job to write checkpoint and pause.

## Pipeline Stages

1. **Brief:** Validates ICP and quotas
2. **Seed:** Ingests seed URLs, sitemaps, and Shopify stores
3. **Discover:** Discovers target links
4. **Fetch:** Fetches via HTTP, Stealthy (TLS impersonation), or Dynamic (Playwright)
5. **Extract:** Extracts public email, telephone, and company data without fabrication
6. **Enrich:** Verifies public pages and optional Hunter BYOK
7. **Score:** Calculates deterministic 0–100 score and assigns priority band (high/med/low)
8. **Outreach:** Drafts outreach message only when score ≥ threshold and contact exists (never auto-sends)
9. **Export:** Prepares CSV/JSONL with source provenance and enables optional CRM push
