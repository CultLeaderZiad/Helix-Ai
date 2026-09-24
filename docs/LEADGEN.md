# HELIX-AI LEAD GENERATION ENGINE SPECIFICATION

**Product:** Helix-Ai (`CultLeaderZiad/Helix-Ai`)  
**Design System:** `docs/DESIGN-SPEC.md` System A — calm agency console, flat tokens, data honesty, EN+AR  
**Routes:** `/dashboard/lead-generation` (Studio/Portal client surface) & `/admin/leadgen` (Agency Admin usage view)

---

## 1. Architectural Overview

Helix-Ai includes a **built-in TypeScript lead generation engine** running directly within the Next.js runtime on Vercel Hobby. This supersedes the hard requirement for an external Docker Scrapling container.

```
Browser (Lead Gen tab open)
 │
 ├── poll GET /api/leadgen/jobs/[id] (~1.8s)
 └── POST /api/leadgen/jobs/[id]/tick (drives progress while visible)
       ▼
Next.js on Vercel (Hobby Serverless)
 ├── Enqueue: POST /api/leadgen/jobs → creates job + after() kicks 1st tick
 ├── Tick Engine: atomic lease mutex → fetches batch → extracts → scores → saves leads
 └── Engine Routing:
       ├── http    → Native fetch with SSRF guard, size cap, and robots.txt cache
       ├── dynamic → Cloudflare Browser Run Quick Action (/content)
       ├── stealth → Bright Data Web Unlocker Direct API (/request)
       └── auto    → HTTP → Dynamic (on empty/SPA) → Stealth (on 403/429/blocked)
       ▼
Supabase PostgreSQL
 ├── leadgen_jobs (includes lease_until, cursor jsonb)
 ├── leadgen_leads (provenance-tracked contacts & outreach drafts)
 └── leadgen_engine_usage (daily/monthly accounting for soft caps)
```

---

## 2. Verified External API Contracts

### 2.1 Cloudflare Browser Run — `/content` Quick Action
- **Quick Action Docs:** https://developers.cloudflare.com/browser-run/quick-actions/content-endpoint/
- **API Reference:** https://developers.cloudflare.com/api/resources/browser_rendering/subresources/content/methods/create/
- **Limits:** https://developers.cloudflare.com/browser-run/limits/
- **Pricing:** https://developers.cloudflare.com/browser-run/pricing/

**Endpoint:**
```http
POST https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/browser-rendering/content
Authorization: Bearer {CF_BROWSER_TOKEN}
Content-Type: application/json

{
  "url": "https://example.com",
  "gotoOptions": {
    "waitUntil": "networkidle0",
    "timeout": 45000
  }
}
```
- **X-Browser-Ms-Used:** Captured from response headers and accumulated into `leadgen_engine_usage.browser_ms`.
- **Bot Identity:** Cloudflare Browser Run traffic is identified by Cloudflare as automated browser traffic. It renders client-side JS / SPAs, but is **not stealthy** against bot challenges.
- **Default Soft Cap:** 540 seconds (9 minutes) per UTC day (under the 10 min/day free limit).

### 2.2 Bright Data Web Unlocker — Direct API
- **First Request:** https://docs.brightdata.com/scraping-automation/web-unlocker/send-your-first-request
- **API Reference:** https://docs.brightdata.com/api-reference/rest-api/unlocker/unlock-website
- **Introduction:** https://docs.brightdata.com/scraping-automation/web-unlocker/introduction
- **Error Codes:** https://docs.brightdata.com/scraping-automation/web-unlocker/error-codes

**Endpoint:**
```http
POST https://api.brightdata.com/request
Authorization: Bearer {BRIGHTDATA_API_TOKEN}
Content-Type: application/json

{
  "zone": "helix_unlocker",
  "url": "https://example.com",
  "format": "raw"
}
```
- **Default Soft Cap:** 4,500 requests per UTC month (under standard free allowance).

---

## 3. Engine Routing & Escalation

| Engine | Implementation | Trigger / Use Case |
|---|---|---|
| `http` | Native `fetch` with AbortSignal | Static sites, sitemaps, fast contact pages. |
| `dynamic` | Cloudflare Browser Run `/content` | JavaScript-heavy SPAs, dynamic DOMs (non-stealth). |
| `stealth` | Bright Data Web Unlocker | WAF-protected sites, Cloudflare challenges, captchas. |
| `auto` | Adaptive Escalation Router | Starts HTTP → escalates to Dynamic on empty/JS-shell → escalates to Stealth on 403/429/WAF block. |

### Canonical Job Logs
The engine logs exact operational decisions without fabrication:
```
> engine: builtin/auto/v1 · ok
> robots: obey · on
> control_plane: helix-ai · ok
> discover · 12 urls queued
> fetch · example.com · http·ok
> extract · emails=2 phones=1 · adaptive=on
> enrich · email_source=website · phone_source=website
> score · 80 · priority=high
> outreach · generated
> fetch · spa-example.com · http·empty → escalate→dynamic
> fetch · spa-example.com · dynamic·ok · browser_ms=1640
> fetch · protected.com · http·blocked → escalate→stealth
> fetch · protected.com · stealth·ok
> export · completed · total_leads=5 · elapsed_ms=8420
```

---

## 4. Chunked Execution & Honest Pause Semantics

Vercel Hobby enforces serverless wall-clock timeouts (≤ 60s) and restricts Cron Jobs to once daily (`0 0 * * *`). Continuous long background loops cannot run on Hobby.

### Execution Protocol
1. **Kickoff:** When a job is enqueued (`POST /api/leadgen/jobs`), `after()` from `next/server` immediately calls `executeJobTick(job.id)` without an external HTTP roundtrip.
2. **Mutual Exclusion:** Each tick atomically acquires a 55-second lease in `leadgen_jobs` (`WHERE (lease_until IS NULL OR lease_until < now())`). Parallel tick attempts receive `409 { ok: false, reason: "lease_held" }`.
3. **Tab-Driven Polling:** While the operator has the Lead Generation page open (`document.visibilityState === 'visible'`), `useLeadGenJob` polls every ~1.8s and triggers `POST /api/leadgen/jobs/[id]/tick`.
4. **Honest Pause:** If the browser tab is closed, ticks stop. The job remains in `running` state in Postgres. When the page is reopened, ticks immediately resume from the persisted `cursor`. If heartbeat exceeds 2 minutes, the UI shows:
   - *EN:* `Paused — open this page to continue processing.`
   - *AR:* `متوقف مؤقتاً — أبقِ هذه الصفحة مفتوحة لمواصلة معالجة مهام استخراج العملاء.`

---

## 5. Security Checklist

1. **SSRF Guard:** Every fetch URL, sitemap URL, discovery subpath, and redirect target is validated through `isPrivateOrLocalhost` (`lib/leadgen/ssrf.ts`). Loopback (`127.0.0.1`, `localhost`), link-local (`169.254.x`), private subnets (`10.x`, `192.168.x`, `172.16-31.x`), and non-HTTP(S) schemes are strictly rejected.
2. **Zero Fabrication:** The engine never hallucinates fake emails, phone numbers, or company names. Empty stays empty with honest provenance (`email_source: 'none'`, `phone_source: 'none'`).
3. **Drafts Only:** Outreach is generated strictly as structured drafts (`subject`, `body`, `dm`, `personalization_points`). Never auto-sent.
4. **Server-Only Credentials:** Tokens (`CF_BROWSER_TOKEN`, `BRIGHTDATA_API_TOKEN`, `SUPABASE_SERVICE_ROLE_KEY`) are server-only and never exposed to the client bundle or logged.
5. **Robots Obedience:** Default `ON`. When enabled, `robots.txt` is fetched and cached per domain. Disallow rules for user-agent `*` are respected.

---

## 6. Environment Variables

Add to `.env.local` or Vercel Project Settings:

```bash
# Enable built-in TypeScript engine (default: true)
LEADGEN_BUILTIN_ENGINE=true
LEADGEN_PREFER_EXTERNAL_WORKER=false

# Cloudflare Browser Run (Dynamic Engine)
CF_ACCOUNT_ID=your_cloudflare_account_id
CF_BROWSER_TOKEN=your_cloudflare_browser_rendering_api_token
LEADGEN_BROWSER_DAILY_SECONDS_CAP=540

# Bright Data Web Unlocker (Stealth Engine)
BRIGHTDATA_API_TOKEN=your_brightdata_api_token
BRIGHTDATA_UNLOCKER_ZONE=helix_unlocker
LEADGEN_STEALTH_MONTHLY_CAP=4500
```

---

## 7. Verification & Smoke Testing

### Automated Unit Test
Run the contact extraction and scoring verification script:
```bash
node scripts/verify-leadgen-extract.mjs
```

### Manual Smoke Test on Vercel
1. Navigate to `/dashboard/lead-generation`.
2. Confirm the Settings Strip displays `Lead Engine: Built-in Engine (Online)`.
3. Enqueue a job with 2–3 public business URLs using `Auto Escalation` or `HTTP Fast`.
4. Observe real-time logs in the terminal viewer as pages are fetched, scored, and saved.
5. Open `/admin/leadgen` as an `agency_admin` to inspect the daily and monthly quota counters.
