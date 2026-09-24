# HELIX-AI LEADGEN + SCRAPLING — Deep Spec

- **Product:** Helix-Ai · Lead Generation (Studio-class sellable surface)
- **Repo:** CultLeaderZiad/Helix-Ai (Next.js App Router + Supabase)
- **Status:** Implementation companion — same decisions as master prompt; do not fork product scope.
- **Date:** 2026-09-24 (Africa/Cairo / UTC+3)
- **Implementer:** Antigravity only

## Helix-Ai vs Helix Intelligence

| Dimension | Helix-Ai (THIS SPEC) | Helix Intelligence (sibling) |
|---|---|---|
| **Role** | Agency OS control plane + sellable Lead Generation page | Scout instrument |
| **Stack** | Next.js + Supabase | Vite/React + FastAPI |
| **UI route** | `/dashboard/lead-generation` | `/scout/lead-generation` |
| **API** | `app/api/leadgen/*` | `/api/v1/scout/leadgen/*` |
| **Jobs** | Supabase `leadgen_jobs` / `leadgen_leads` | Postgres `LeadGenJob` / `LeadGenLead` |
| **v1 execution** | Helix-Ai-owned Scrapling Docker worker | Intelligence-owned Scrapling Docker worker |
| **Shared worker** | Optional later — do not block v1 | Optional later |
| **P2** | Feature-flagged proxy to Intelligence leadgen API | — |
| **Catalog** | Additive `SystemType=lead_generation` | Not a Studio SKU |
| **CRM** | Optional Contact/Company upsert + ContactFact | Export only |
| **Design** | `docs/DESIGN-SPEC.md` System A | Dark instrument |

---

## 1. Executive Summary

Helix-Ai gains an enterprise Lead Generation page agencies can sell:

| Surface | Route | Engine | Input |
|---|---|---|---|
| **Lead Generation** | `/dashboard/lead-generation` | `scrapling_engine` (Docker worker) | Public websites / sitemaps / Shopify / directories |

Helix-Ai remains the control plane: UI, Supabase job state, thin Next API enqueue/read. Scrapling never enters the Next bundle. A dedicated worker claims `leadgen_jobs`, runs the 9-stage pipeline (Brief → Export), and writes `leadgen_leads`.

- **Catalog:** Additive `lead_generation` `SystemType` + `ClientSystem` engine config.
- **CRM:** Optional Wave D CRM upsert with `source=leadgen_scrapling` and honest `ContactFact`.
- **Credits:** Honest estimation & tracking; never fakes billing success.
- **Localization:** EN + AR supported.
- **Honesty:** Strict `docs/DESIGN-SPEC.md` compliance — zero fake demo leads.

---

## 2. Decisions Log

| # | Decision | Choice | Rationale |
|---|---|---|---|
| **D1** | Product home | Helix-Ai, not Intelligence | Agency OS sellable surface |
| **D2** | Control plane vs engine | UI+Supabase+API in Helix-Ai; Scrapling in Docker worker | Next must not import browsers/Scrapling |
| **D3** | v1 topology | Option B — Helix-Ai-owned worker claims jobs | Does not block on Intelligence |
| **D4** | P2 | Optional Intelligence API passthrough (flagged) | Reuse when ready; not Wave A–D gate |
| **D5** | Option C n8n | Later packaging only | Not A–C blocker |
| **D6** | UI route | `/dashboard/lead-generation` preferred | Matches `app/dashboard`, `app/studio`, `app/admin`, `app/settings` |
| **D7** | Alt route | Auth-gated `app/lead-generation` if needed | Document if used |
| **D8** | Nav | Discover sidebar; label exactly `Lead Generation` | Additive; next to Studio/Systems |
| **D9** | Data model | New `leadgen_jobs` + `leadgen_leads` | Do not overload Contact as job store |
| **D10** | Migrations | `supabase/` | Repo convention |
| **D11** | Catalog | Prefer additive `SystemType=lead_generation` | Do not break five core types |
| **D12** | Catalog fallback | `service_catalog` / `managed_engine` row | If enum change blocked |
| **D13** | Default engine | `stealth` | Unknown/Cloudflare targets |
| **D14** | robots | Default ON | Legal/honesty; audit if off |
| **D15** | MCP / [ai] | Internal/dev only v1 | Not customer surface |
| **D16** | Outreach | Draft only; never auto-send | Locked |
| **D17** | Fabrication | Forbidden | Empty + provenance; no fake demo leads |
| **D18** | Apify | Out of scope as core | Locked |
| **D19** | Scrapling in Next | Forbidden | Locked |
| **D20** | Client secrets | No `NEXT_PUBLIC_` scrape secrets | Locked |
| **D21** | CRM | Optional upsert Contact/Company + ContactFact | `source=leadgen_scrapling` |
| **D22** | Export v1 | CSV/JSONL first | Sheets/webhook if patterns exist |
| **D23** | Design | `docs/DESIGN-SPEC.md` System A | No gradients/glow/icon-boxes |
| **D24** | i18n | EN+AR where app already i18ns | RTL if AR |
| **D25** | Credits | Wire metering or honest TODO | Track `credits_used` always |
| **D26** | Implementer | Antigravity only | Cloud agent historically stopped |
| **D27** | Waves | A→B→C→D mandatory | Vertical slice before polish |
| **D28** | Shared worker | Optional later | Align with Intelligence pack without coupling |

---

## 3. Wave Delivery Structure

- **Wave A:** Route `/dashboard/lead-generation`, sidebar nav, migration + RLS, API stubs, worker health, empty states, `useLeadGenJob`, `SystemType` additive extension.
- **Wave B:** Dedicated Scrapling worker container, Supabase claim loop, pipeline brief → extract, 1-URL persist, usage tracking, Next boots cleanly without browser dependencies.
- **Wave C:** CrawlSpider, SitemapSpider, ShopifySpider, SiteToMarkdownSpider, 6 vertical recipes, adaptive selectors, pause/resume checkpoints, CSV/JSONL export.
- **Wave D:** Multi-source enrichment (website/Hunter), deterministic scoring, outreach drafts only, CRM upsert (`source=leadgen_scrapling`), `ContactFact` logging, and full acceptance.

---

## 4. API Endpoints

- `POST /api/leadgen/jobs`: Create and enqueue an acquisition job.
- `GET /api/leadgen/jobs`: List recent jobs for tenant.
- `GET /api/leadgen/jobs/[id]`: Retrieve job status and live execution logs.
- `GET /api/leadgen/jobs/[id]/leads`: List extracted leads.
- `POST /api/leadgen/jobs/[id]/pause`: Pause running job and save checkpoint.
- `POST /api/leadgen/jobs/[id]/resume`: Resume paused job.
- `GET /api/leadgen/jobs/[id]/export`: Export verified leads in CSV or JSONL.
- `POST /api/leadgen/jobs/[id]/crm-upsert`: Push leads to `contacts` and `companies` with verified `contact_facts`.
- `GET /api/leadgen/recipes`: Retrieve vertical recipes library.
- `GET /api/leadgen/worker/health`: Worker status and engine availability.

---

## 5. Security & Isolation Guarantees

1. `scrapling` is strictly isolated inside `workers/scrapling/`. Next.js server and client bundles NEVER import `scrapling`.
2. No scrape secrets or Hunter API keys are exposed to `NEXT_PUBLIC_*`.
3. Outreach messages are generated strictly as drafts and NEVER auto-sent.
4. Contact fields and facts are never hallucinated or fabricated. Empty fields remain empty with verifiable extraction status.
