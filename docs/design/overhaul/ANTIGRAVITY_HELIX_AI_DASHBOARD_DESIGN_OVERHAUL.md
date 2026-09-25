# ANTIGRAVITY — Helix AI Dashboards (client + admin) Design Overhaul · "Warm Command 2.0"

> Repo: `CultLeaderZiad/Helix-Ai` (branch `main`) · Next.js 16.3 App Router · React 19 · Tailwind v4 · shadcn (base-nova) · Supabase · Vercel Hobby.
> Prepared for Ziad Sabry on 2026-09-25. Grounded in `design-research/HELIX_DESIGN_RESEARCH.md`, `design-research/dashboard_*.png`, and `design-research/html/dash.css` + `dashboard_*.html`.
> Sister prompt: `ANTIGRAVITY_HELIX_AI_FRONTER_DESIGN_OVERHAUL.md` (marketing). Both prompts specify the shared foundation files (§4.6) identically.
> Business-logic owner for Lead Gen v2 + Search: `ANTIGRAVITY_HELIX_AI_SEARCH_PAGE_TINYFISH_LEADGEN_V2.md` ("V2"). **This prompt only restyles and restructures UI.**
> This prompt contains no API keys and must never add any.

---

## §0 How to use this prompt

1. **One wave per Antigravity run.** Waves are D0 → D5 (§11). Each wave ends with checks and a commit.
2. **Attach these PNGs** from `design-research/`, in this order:
   1. `dashboard_overview.png` — shell (sidebar + topbar) and Overview. Attach it for **every** wave, since it defines the shell.
   2. `dashboard_leadgen.png` — Lead Generation (waves D3, D5)
   3. `dashboard_search.png` — Search (wave D4)
   4. `dashboard_cmdk.png` — ⌘K palette (waves D1, D4)
3. **What to paste.** Copy the block under **`## PASTE: Antigravity`** at the bottom and replace `D__` with the wave. If Antigravity needs more detail, paste the matching section from §6 as well.
4. **Order relative to the V2 prompt.** Recommended sequence: V2 W1 → V2 W2 → D0 → D1 → D2 → **D3** (needs V2 W1) → **D4** (needs V2 W2) → D5 → V2 W3. If you need to run D3 or D4 before V2:
   - **D3 before V2 W1:** restyle whatever `features/leadgen/*` exists. Keep every hook call, prop, API route, and state variable unchanged, and don't create `ModeTabs`/`EnrichForm`/`FindForm` yourself (V2 owns them). When V2 W1 lands later, re-run D3 against the new components.
   - **D4 before V2 W2:** skip it. `/dashboard/search` doesn't exist yet, so don't create it here and don't link to it.
   - **Watches rail:** don't render it until V2 W3 has shipped `WatchesRail`.
5. **Coordination with the Fronter prompt.** Whichever of F0/D0 runs first creates the shared foundation (§4.6: fonts, motion tokens, reduced-motion hook, `language-context.tsx`, `DirectionProvider`, shadcn `rtl:true`). The second one verifies it and doesn't duplicate anything.
6. After each wave, compare with the PNG at 1440×900, then at 1024 and 390 wide, in EN and in عربي.

---

## §1 Goal and non-negotiables

**Goal.** Move the console from Warm Command v1 to **Warm Command 2.0**:
- warm paper canvas `#F4F2ED`, white surfaces, an ink sidebar `#161513`, and an emerald accent `#0B6E4F`
- a shadcn Sidebar shell that collapses to icons, with a shared EN/AR toggle, a breadcrumb topbar, and a ⌘K palette
- an honest Overview built on real tenant data, with NumberFlow counters
- Lead Generation and Search surfaces that match the mockups on top of V2 logic
- consistent toasts, skeletons, empty states, and page transitions across client and admin

**Non-negotiables:**
1. **No fake data in production.** The mockups carry `SAMPLE DATA` chips and sample numbers; none of that ships. Every number comes from a real query, or the slot shows an honest empty state or is omitted.
   - "Median first reply" and "Conversations by channel" have **no confirmed data source** (§2). Use the replacements in §6.3.
   - Don't show "Live" unless `useRealtime().connected` is true.
2. **Don't rewrite business logic.** Keep these unchanged in behaviour and signature: `features/leadgen/hooks/useLeadGenJob.ts`, V2's `features/search/hooks/useSearch.ts`, every `app/api/**` route, export and CRM functions, Supabase queries (except where §6.3 adds read-only range/aggregate queries to the Overview page), `lib/leadgen/**`, `lib/search/**`, and migrations. Restyling means JSX structure, classNames, presentational components, and motion.
3. **No glow or gradients in the dashboard.** Flatten everything the mockup draws as a gradient: progress bars, sparkline areas (10% flat fill), the activity-row highlight, and the skeleton base (the shimmer sweep is the one allowed animated gradient, per DESIGN-SPEC §1.10). The only allowed rings are 3 px focus rings and the live-dot pulse ring. No purple, no Sparkles icon (the current `console-shell.tsx` imports `Sparkles`; replace it).
4. **EN + AR.** One language state for the whole console, set by the topbar EN/عربي segmented control and persisted (cookie + localStorage). Full RTL: the sidebar moves to the right, logical CSS only. Latin digits for data (`ar-AE`); phones, domains, emails, and IDs inside `<bdi dir="ltr">`.
5. **Reduced motion** on every animated element: `MotionConfig reducedMotion="user"`, `useReducedMotionSafe()`, and a CSS media query. Skeletons stay static, counters jump, there are no page transitions, and the palette appears without scaling.
6. **Performance.**
   - Dashboard routes stay server-rendered with streaming (`loading.tsx`).
   - The shell must not re-mount on navigation within `/dashboard/*` (layout-level shell, §6.1).
   - Chart JS (recharts) loads only on pages that render charts (`next/dynamic` for chart islands).
   - No CLS from skeleton → content (identical heights).
   - INP < 200 ms on table interactions.
   - Tables with more than 100 rows paginate (TanStack `getPaginationRowModel`, 25/page) — don't virtualise yet.
7. **Accessibility.** Keyboard-complete sidebar, palette, tables, and mode cards. Visible focus. AA contrast. `aria-live` only where it's useful (§8).
8. **Next.js 16 caveat.** Per `AGENTS.md`, read `node_modules/next/dist/docs` before using layouts, `template.tsx`, `cookies()`, or `next/dynamic`.

---

## §2 Repo facts found (read through the GitHub API) and conflicts

| Area | Fact | Consequence |
|---|---|---|
| Shell | `components/shell/console-shell.tsx` (`'use client'`, 13 KB). Props: `{ variant: 'admin'\|'client'; email: string; businessName: string\|null; children }`. 240 px sidebar in `#1C1B19`, hard-coded hexes. `ADMIN_NAV`/`CLIENT_NAV` arrays of `NavItem {href,label,icon?,badge?,match,section?: 'primary'\|'secondary'}`. Icons are imported but **not rendered**, and one of them is `Sparkles`. The admin header reads **"DIRECTION 2 · WARM COMMAND" / "AGENCY · LIVE"**. The client header shows `businessName` / "CLIENT WORKSPACE". Language toggle: `useState('en')`, **does nothing**. `INTEL_TABS` rail (Engine/Reports/Analytics/Queue) shows on intel routes and on all admin routes. `NotificationBell isAdmin clientId={null}`. `signOut` form. Mobile: top bar plus an inline dropdown. | Rebuild the internals on the shadcn Sidebar and keep the **same props**. Add `labelAr`, render icons, add groups. Remove "DIRECTION 2 · WARM COMMAND". |
| Page pattern | Every dashboard/admin page does `createSupabaseServerClient()` → `getVerifiedSession(supabase)` → redirect `/login` → resolves `businessName` from `clients` → `isAdmin = session.claims.role === 'agency_admin'` → `<ConsoleShell variant email businessName>`. | **No `app/dashboard/layout.tsx` or `app/admin/layout.tsx` exists**, so the shell re-mounts on every navigation. §6.1 adds layouts and a pass-through context so pages don't need editing all at once. |
| Admin nav | Admin nav items point into `/dashboard/*` (Lead Generation, Intelligence `/dashboard/engine`, Reports), and Settings → `/settings`. | Those routes render inside the `/dashboard` layout with `variant='admin'`, so the dashboard layout must also derive the variant from the role. |
| Routes (client) | `/dashboard` (overview `page.tsx`), `billing`, `contacts`, `crm`, `engine`, `facts`, `integrations`, `lead-generation` (+`[jobId]`), `queue`, `reports`, `studio` (+`guides/[id]`), `support`, `loading.tsx` (animate-pulse). **No `/dashboard/search` yet** (V2 W2 creates it). | Nav shows Search only when the route exists. |
| Routes (admin) | `/admin` (clients), `analytics` (server, `force-dynamic`: period Last 7/30/90/Custom, KPIs, lead funnel bars, bookings-by-day CSS bars, attention, attribution table, workspace table), `clients/[id]`, `crm`, `faq`, `leadgen` (engine architecture card, Cloudflare Browser Run seconds/cap, Bright Data Unlocker requests/cap, usage ledger of the last 100 `leadgen_engine_usage` rows, cyan `#0e8da6`), `playbooks`, `pricing`, `queue`, `studio`, `support`, `updates`, `users`, `webhooks`, `loading.tsx`. `components/admin/admin-tabs.tsx`: Clients Roster, Lead Gen Usage, Webhooks & n8n, Team & Roles, Pricing Manager, Release Updates, FAQ & Docs, plus a **"Live Agency Roster"** chip. | D5 restyles charts with shadcn Chart and replaces the cyan. The "Live" chip is only honest when realtime is actually connected. |
| Overview data (`app/dashboard/page.tsx`) | Tenant-scoped reads: `clients.business_name`; `client_systems` (visible_to_client + active); `client_integrations` status; `contact_facts` pending count; contacts this month; bookings this month (non-cancelled); overdue invoices; `deals` open-stage `value_cents` total; `activities` count this month (`occurred_at`) shown as "Conversations handled"; per-system weekly activity counts via an `ACTIVITY_SOURCE` table map. Evidence-review copy is kept verbatim (DESIGN-SPEC §14): "{n} pending suggestion(s)." / "Nothing to review right now." / "Review now →". | These are the real sources for KPIs, the chart, and the systems list (§6.3). **No first-reply-latency source** and **no channel column** is confirmed. Verify the `activities` columns in `supabase/migrations/*` and in the page's select before binding. |
| Realtime | `components/realtime/realtime-provider.tsx` subscribes to postgres_changes on `client_integrations`, `contact_facts`, and `attention_queue`, and exposes `useRealtime(): {connected, lastEventAt, eventCount}`. The `attention_queue` table's existence is unverified. | "Live" chip, "last event" text, and a throttled `router.refresh()` for the feed. It doesn't expose event payloads, so the feed is server-fetched and refreshed. |
| Lead Gen | `app/dashboard/lead-generation/page.tsx` → `ConsoleShell` → `features/leadgen/LeadGenPage.tsx`: hard-coded cyan hexes, local `isArabic`, demo prefill (V2 removes it), RecipeLibrary/BriefForm/SeedInput/EnginePicker, `JobProgress` (9 `STAGES` with AR labels; `role="log" aria-live="polite"`; tab-pause notice), `ExportBar`, `CrmUpsertButton`, `LeadsTable`, `LeadDetail`, `EmptyState`, `SettingsStrip` (health.worker/mode/quotas/engines_available/robots_default). `useLeadGenJob(initialJobId)` returns `state, health, recipes, jobs, activeJob, leads, selectedLead, error, crmStatus, isTabPaused, createJob, pause, resume, refresh, selectJob, selectLead, crmUpsert, exportCsv, exportJsonl, reset`. `lib/schema.ts` `LeadGenLead` has `company_name, website, domain, emails[], phones[], socials, address, extract_status, fetch_status, email_source, phone_source, lead_score, priority, sources, crm ids`. | D3 restyles these files plus V2's new `ModeTabs`, `EnrichForm`, `FindForm`, `AdvancedPanel`, `copy.ts`. Never change the hook. |
| V2 plan (not yet in the repo) | W1: `features/leadgen/{ModeTabs,EnrichForm,FindForm,AdvancedPanel,copy.ts}`, ExportBar = primary "Export .xlsx" + menu CSV / Full CSV / JSONL, JobProgress hides per-page logs behind "Show log", `job_kind` enrich\|find. W2: `app/dashboard/search/page.tsx`, `features/search/{SearchPage,SearchBox,ModeTabs,ProviderStatus,ResultCard,ResultList,SaveBar,RecentSearches,copy.ts,hooks/useSearch.ts}`, adds `labelAr` + a Search item above Lead Generation in ConsoleShell, recommends `components/shell/language-context.tsx`. W3: `WatchesRail`, `WatchDialog`, admin search usage, admin-tabs label "Lead Gen & Search". Honesty rules: an unavailable provider is shown disabled with a reason (never hidden); never say "real-time"; "Only {n} found. We do not add placeholder rows."; field.empty "Not found on the site". | Reuse V2 file names and copy keys. Keep its honesty rules. |
| UI kit | `components/ui/`: `badge`, `button` (custom cva: default/primary/secondary/outline/accent/ghost/destructive/link; sizes incl. icon), `card`, `input`, `label`, `table`, `kpi-card`, `helix/index.tsx` (`PageHeader`, `EmptyState`, `HelixKpi`, `Pill`, `JobSubnav`). `components.json`: base-nova, no `rtl`. | **Never let shadcn overwrite button/input/card/badge/table/label.** Restyle `helix/index.tsx` primitives to WC2.0, since they're used everywhere. |
| Tokens | `app/globals.css` `:root` = WC v1: `--helix-sidebar #1C1B19`, `--helix-sidebar-surface #262522`, `--helix-sidebar-active #2B2A27`, `--helix-sidebar-border #33312D`, `--helix-sidebar-muted #9E9B95`, `--helix-canvas #F3F1EC`, `--helix-surface #FFFEFA`, `--helix-surface-hover #F8F6F0`, `--helix-border #D9D4CB`, `--helix-border-subtle #E6E2D9`, `--helix-ink #141414`, `--helix-muted #6E6A63`, `--helix-accent #0B6E4F`, `--helix-accent-soft #E6F3EE`, `--helix-warn #B45309`, `--helix-ok #0B6E4F`, `--helix-danger #B42318`, `--helix-shadow …`, shadcn vars (`--primary #141414`, `--muted #EBE7DF`, `--ring` ink, `--chart-1..5`, `--sidebar*`), `@theme inline` bridges (`--color-helix-*`, `--color-sidebar-*`, radii sm 8 / md 10 / lg 12 / xl 16 / 3xl 20 / 4xl 24), `--font-sans: var(--font-inter)`. `.dark` is forced to light values. Many pages also hard-code hexes (`#F3F1EC`, `#FFFEFA`, `#D9D4CB`, `#1C1B19`, `#2B2A27`, `#9E9B95`, cyan `#0e8da6`). | §3 updates the values in place (names unchanged) and adds new tokens. D5 sweeps the hard-coded hexes. |
| Motion | `framer-motion ^13.2.0` in two confirmed studio files (others unverified). No `motion`, NumberFlow, Sonner, cmdk, recharts, or TanStack Table installed. | §4 installs. |
| Other | An unmerged diff seen in the repo history references `components/shell/console-language.tsx` (`ConsoleLanguageProvider`, `LanguageToggle`). **It isn't on `main`.** | If it appears, fold it into `language-context.tsx` and keep the old exports as re-exports. |

**Conflicts, and how this prompt resolves them:**
1. **Accent and type.** DESIGN-SPEC v3 says cyan + Space Grotesk/Inter. Resolution: emerald + Geist (§10 text).
2. **Sidebar label "Direction 2 · Warm Command".** It's an internal name. Remove it and use the workspace card.
3. **Radii.** Spec says 6/8/12/16; WC2.0 uses 8 chips / 10 controls / 14 cards / 16 dialogs. WC2.0 wins (§10).
4. **Mockup gradients** (progress fill, sparkline area, activity-row highlight). Flattened.
5. **Sparklines.** Allowed only inside KPI tiles, still banned in tables (spec §5.1), with a flat fill.
6. **Icon tiles** in list rows (Systems list, activity icons). A documented exception: neutral 32 px tile `#F4F2ED` with a 1 px line and an ink icon, **never coloured boxes in a grid**.
7. **Minimum text size.** Spec says 13 px; the mockup uses 11.5 px labels/chips/kbd. Exception limited to those elements.
8. **Median first reply / channel breakdown.** No data. Replaced (§6.3).
9. **"Attention queue [3]" badge.** Only a real count. `attention_queue` is unverified, so fall back to the `contact_facts` pending count; if neither exists, show no badge.
10. **Mockup nav vs repo nav.** The mockup has Overview, Search, Lead Generation, Contacts, CRM, Attention queue / SYSTEMS: Studio, Integrations, Reports / ACCOUNT: Billing, Support, Settings. The repo also has `AI Engine` (`/dashboard/engine`) and merges Contacts into "Pipeline". Resolution: follow the mockup groups, keep every existing route, and put AI Engine under SYSTEMS (§6.1).

---

## §3 Design tokens (Warm Command 2.0) and typography

### §3.1 Update `app/globals.css` `:root` — change values in place, keep every existing name

```css
:root {
  color-scheme: light;
  /* sidebar (ink) */
  --helix-sidebar: #161513;          /* was #1C1B19 */
  --helix-sidebar-surface: #1F1E1B;  /* was #262522 : workspace card */
  --helix-sidebar-active: #2A2926;   /* was #2B2A27 */
  --helix-sidebar-border: #2A2926;   /* was #33312D */
  --helix-sidebar-ink: #FFFFFF;
  --helix-sidebar-muted: #A39F97;    /* was #9E9B95 */
  --helix-sidebar-label: #6D6A64;    /* NEW group labels */
  --helix-sidebar-sub: #8A867F;      /* NEW workspace sub-line */
  --helix-sidebar-mark: #0E0E0D;     /* NEW mark tile */
  --helix-sidebar-rail: #34E0A1;     /* NEW 3px active rail */
  /* canvas & surfaces */
  --helix-canvas: #F4F2ED;           /* was #F3F1EC */
  --helix-surface: #FFFFFF;          /* was #FFFEFA */
  --helix-surface-2: #FAF8F4;        /* NEW table headers, insets */
  --helix-surface-hover: #FAF8F4;
  --helix-border: #E7E2D9;           /* was #D9D4CB : line */
  --helix-border-strong: #D9D3C7;    /* NEW line-2, input borders */
  --helix-border-subtle: #EEEAE2;
  --helix-ink: #141414;
  --helix-muted: #6E6A63;
  --helix-subtle: #9A958C;           /* NEW */
  --helix-accent: #0B6E4F;
  --helix-accent-2: #12A579;         /* NEW live dots, checks */
  --helix-accent-soft: #E6F3EE;
  --helix-selected: #F3FAF6;         /* NEW selected row / selected mode card */
  --helix-cmd-highlight: #F1F8F4;    /* NEW palette highlighted row */
  --helix-info: #0E7490;  --helix-info-soft: #E3F2F6;   /* NEW running/in progress */
  --helix-warn: #B45309;  --helix-warn-soft: #FDF1E1;
  --helix-warn-dot: #D97706;                            /* NEW bell dot, score 50–69 */
  --helix-ok: #0B6E4F;
  --helix-danger: #B42318; --helix-danger-soft: #FCE8E6;
  --helix-seg: #EAE6DE;              /* NEW segmented control track */
  --helix-track: #EEEAE2;            /* NEW progress track */
  --helix-skel-a: #EFEBE3; --helix-skel-b: #F8F5F0;     /* NEW skeleton */
  --helix-log-bg: #141414; --helix-log-text: #C9C3B7; --helix-log-ts: #6D6A64; --helix-log-live: #34E0A1;
  --helix-score-low: #C9C3B7;
  --helix-shadow: 0 1px 2px rgba(20,20,20,.03);          /* cards: borders first */
  --helix-shadow-pop: 0 12px 32px -12px rgba(20,20,20,.18);
  --helix-shadow-toast: 0 20px 50px -12px rgba(0,0,0,.45);
  --helix-shadow-dialog: 0 30px 80px -20px rgba(0,0,0,.35);
  --helix-scrim: rgba(20,20,20,.28);
  --helix-radius-chip: 8px; --helix-radius-control: 10px; --helix-radius-card: 14px; --helix-radius-dialog: 16px;
  /* shadcn semantic vars */
  --background: var(--helix-canvas); --foreground: var(--helix-ink);
  --card: var(--helix-surface); --card-foreground: var(--helix-ink);
  --popover: var(--helix-surface); --popover-foreground: var(--helix-ink);
  --primary: #141414; --primary-foreground: #FFFFFF;
  --secondary: #EFEBE3; --secondary-foreground: var(--helix-ink);
  --muted: #EFEBE3; --muted-foreground: var(--helix-muted);
  --accent: var(--helix-accent); --accent-foreground: #FFFFFF;
  --destructive: var(--helix-danger);
  --border: var(--helix-border); --input: var(--helix-border-strong);
  --ring: var(--helix-accent);       /* was ink. Focus = emerald */
  --chart-1: #0B6E4F; --chart-2: #7CCBB0; --chart-3: #D9D3C7; --chart-4: #0E7490; --chart-5: #B45309;
  --radius: 10px;
  --sidebar: var(--helix-sidebar); --sidebar-foreground: var(--helix-sidebar-muted);
  --sidebar-primary: #FFFFFF; --sidebar-primary-foreground: #161513;
  --sidebar-accent: var(--helix-sidebar-active); --sidebar-accent-foreground: #FFFFFF;
  --sidebar-border: var(--helix-sidebar-border); --sidebar-ring: var(--helix-sidebar-rail);
  --sidebar-width: 15.5rem;          /* 248px */
  --sidebar-width-icon: 3.5rem;      /* 56px collapsed */
}
```

- **Dark variant.** Defined but **not exposed**. There's no toggle; it exists for later.

  ```css
  [data-dash-theme="dark"]{
    --helix-canvas:#0F0F0E; --helix-surface:#171715; --helix-surface-2:#1D1D1A;
    --helix-border:rgba(255,255,255,.08); --helix-border-strong:rgba(255,255,255,.14);
    --helix-ink:#EDEBE6; --helix-muted:#A39F97; --helix-subtle:#76726B;
    --helix-accent:#34D399; --helix-accent-soft:rgba(52,211,153,.12);
    --helix-info:#38C6E0; --helix-warn:#F5B455; --helix-danger:#F87171;
  }
  ```

  Leave `.dark` as it is (forced light), because nothing toggles it.
- **`@theme inline` additions.** Append these and keep all existing keys:

  ```css
  --color-helix-surface-2: var(--helix-surface-2);
  --color-helix-border-strong: var(--helix-border-strong);
  --color-helix-subtle: var(--helix-subtle);
  --color-helix-accent-2: var(--helix-accent-2);
  --color-helix-selected: var(--helix-selected);
  --color-helix-info: var(--helix-info);
  --color-helix-info-soft: var(--helix-info-soft);
  --color-helix-warn-soft: var(--helix-warn-soft);
  --color-helix-danger-soft: var(--helix-danger-soft);
  --color-helix-seg: var(--helix-seg);
  --color-helix-track: var(--helix-track);
  --color-sb: var(--helix-sidebar);
  --color-sb-2: var(--helix-sidebar-surface);
  --color-sb-line: var(--helix-sidebar-border);
  --color-sb-text: var(--helix-sidebar-muted);
  --color-sb-label: var(--helix-sidebar-label);
  --color-sb-rail: var(--helix-sidebar-rail);
  --radius-chip: 8px; --radius-control: 10px; --radius-card: 14px; --radius-dialog: 16px;
  --shadow-pop: var(--helix-shadow-pop);
  --shadow-toast: var(--helix-shadow-toast);
  --shadow-dialog: var(--helix-shadow-dialog);
  --text-13_5: 0.84375rem; --text-13_5--line-height: 1.45;
  --text-14_5: 0.90625rem; --text-14_5--line-height: 1.4;
  --text-11_5: 0.71875rem; --text-11_5--line-height: 1.35;
  --text-kpi: 2rem; --text-kpi--line-height: 1.1; --text-kpi--letter-spacing: -0.03em; --text-kpi--font-weight: 600;
  ```

- **Fix the existing sidebar bridges in `@theme inline`.** They point `--color-sidebar*` at canvas/surface. Change them to `--color-sidebar: var(--sidebar); --color-sidebar-foreground: var(--sidebar-foreground); --color-sidebar-accent: var(--sidebar-accent); …` so the shadcn Sidebar picks up the ink palette.
- **Components layer.** Update `.helix-field`: height 36 (48 for primary inputs), radius 10, border `--helix-border-strong`, focus = border ink + `box-shadow: 0 0 0 3px rgba(11,110,79,.15)`. Add:

```css
.dash{font-size:14px;line-height:1.5}
.dash .num{font-variant-numeric:tabular-nums}
.skel{background:linear-gradient(90deg,var(--helix-skel-a) 25%,var(--helix-skel-b) 37%,var(--helix-skel-a) 63%);background-size:400% 100%;animation:skel 1.5s ease infinite;border-radius:6px}
@keyframes skel{0%{background-position:100% 50%}100%{background-position:0 50%}}
.live-dot{width:7px;height:7px;border-radius:999px;background:var(--helix-accent-2);box-shadow:0 0 0 3px rgba(18,165,121,.18)}
.live-dot[data-pulse]{animation:livepulse 2s ease-out infinite}
@keyframes livepulse{0%{box-shadow:0 0 0 0 rgba(18,165,121,.35)}100%{box-shadow:0 0 0 6px rgba(18,165,121,0)}}
@media (prefers-reduced-motion: reduce){.skel,.live-dot[data-pulse]{animation:none}.dash *{transition-duration:.001ms!important}}
```

### §3.2 Component cheat-sheet (exact values from `html/dash.css`)

| Element | Spec |
|---|---|
| App grid | `248px 1fr`; sidebar padding 14×12 |
| Workspace card | bg `#1F1E1B`, border `#2A2926`, radius 10, padding 10; mark 28 px on `#0E0E0D` radius 8; name 13.5/500 white; sub 11.5 `#8A867F` |
| Group label | 11 px, .08em, uppercase, `#6D6A64`, padding 14 10 6 (AR: 12 px, no tracking) |
| Nav item | padding 8×10, radius 8, 13.5 px, `#A39F97`; hover `rgba(255,255,255,.04)` + white; active bg `#2A2926`, white, 500 weight, 3 px `#34E0A1` rail at inline-start −12 px (height 18, radius 0 3 3 0); icon 16 px stroke 1.75 |
| Nav badge | `#2A2926` bg, 11 px, radius 999, px 7; "New" = `rgba(52,224,161,.14)` / `#34E0A1`, 10.5 px |
| User card | 26 px avatar, accent bg, white initials 11 px/600; name 13 px white; role 11.5 `#8A867F` |
| Topbar | height 60, padding 0 32, `rgba(244,242,237,.85)` + `backdrop-blur-[8px]`, sticky, border-bottom `--helix-border`. Breadcrumb 13.5 (muted / **ink 500**). ⌘K trigger 360×36 radius 10 white border-strong, placeholder "Search or jump to…" `--helix-subtle`, kbd `⌘K` Geist Mono 11 px on `#F4F2ED` radius 6. Segmented EN/عربي: track `#EAE6DE` radius 9 p 3, items 12.5 px radius 7, active white + `0 1px 2px rgba(20,20,20,.08)`. Bell 36 px radius 10 border; unread dot 7 px `#D97706` |
| Page | padding 28 32 48; header title 28/600/−.03em; sub 13.5 muted; actions end, gap 8 |
| Buttons | h 36, radius 10, 13.5/500, px 14. Variants: ink (`#141414`/white), accent (`#0B6E4F`/white + `0 6px 16px -8px rgba(11,110,79,.7)`; **allowed**, it's a drop shadow, not glow), outline (white, border-strong), ghost. lg h 40 |
| Card | white, border `--helix-border`, radius 14, `--helix-shadow`; header padding 14×18, border-bottom, h3 14.5/600; body padding 18 |
| Label | 11.5 px, .07em, uppercase, `--helix-subtle` (AR: 12.5, no tracking) |
| Chip | 11.5/500, padding 2×8, radius 999: ok (accent-soft/accent), info (info-soft/info), warn (warn-soft/warn), dg (danger-soft/danger), neutral (`#F1EEE7`/muted) |
| Table | 13 px; th 11.5 uppercase .06em `--helix-subtle` on surface-2, padding 10×14; td padding 11×14, border-bottom `--helix-border`; row hover `#FBFAF7`; selected `#F3FAF6`; numbers tabular |
| Progress | track 6 px `#EEEAE2` radius 999; fill **flat** `--helix-accent` (running = `--helix-info`) |
| Toast | fixed end 28 / bottom 28, width 380, bg `#141414`, text `#F4F2ED`, radius 14, `--helix-shadow-toast`, padding 14×16, action button ghost-light |
| Dialog / ⌘K | scrim `rgba(20,20,20,.28)` + blur 2; panel 640 px, radius 16, top offset 110 px, `--helix-shadow-dialog` |

### §3.3 Typography (dashboard)

Fonts come from the shared `app/fonts.ts` (§4.6): Geist, Geist Mono, IBM Plex Sans Arabic.

| Role | EN | AR |
|---|---|---|
| Page title | 28/1.15/−0.03em/600 | 26/1.4/0/700 |
| Card title | 14.5/600 | 15/600 |
| Body | 14/1.5 | 15/1.7 |
| Small/meta | 12.5 | 13 |
| Label | 11.5 uppercase +.07em | 12.5, no uppercase/tracking |
| KPI numeral | 32/1.1/−0.03em/600 Geist tabular | same numerals (Latin, `ar-AE`), label 13.5 |
| Mono (logs, domains, IDs, kbd) | Geist Mono 11.5–12.5 | same, always inside `dir="ltr"` |

The body base is applied through the `.dash` class on the shell content wrapper, not the global body, so auth pages don't shift.

---

## §4 Dependencies and installs (D0)

### §4.1 npm
```bash
pnpm add motion @number-flow/react sonner cmdk @tanstack/react-table
# recharts is added by `shadcn add chart` (base-nova pins recharts@3.8.0)
```

### §4.2 shadcn (RTL first; answer **No** to every overwrite prompt for button / input / card / badge / table / label)
```bash
# components.json → "rtl": true   (keep style base-nova + aliases)
pnpm dlx shadcn@latest add direction
pnpm dlx shadcn@latest add sidebar            # registry deps: button, input, separator, sheet, skeleton, tooltip, use-mobile
pnpm dlx shadcn@latest add command dialog     # cmdk + input-group
pnpm dlx shadcn@latest add sonner chart skeleton empty tabs progress toggle-group breadcrumb dropdown-menu avatar tooltip checkbox radio-group kbd separator scroll-area popover drawer item spinner
pnpm dlx shadcn@latest migrate rtl components/ui
```

- **Sidebar and button/input.** `sidebar` lists `button` and `input` as registry deps, so the CLI will offer to overwrite those files. Decline. `sidebar.tsx` uses `Button variant="ghost" size="icon"`, which the custom cva already has. If it references a size the cva lacks (e.g. `icon-sm`), add that size to the existing cva.
- **Sidebar RTL.** The shadcn docs say Sidebar is **not** auto-migrated for RTL. Edit `components/ui/sidebar.tsx` by hand:
  - physical → logical: `left-0`/`right-0` → `start-0`/`end-0`, `border-r`/`border-l` → `border-e`/`border-s`, `-right-4` → `-end-4`
  - `translate-x` offsets get `rtl:` counterparts
  - the rail sits on the inline-end edge
  - pass `side={dir==='rtl' ? 'right' : 'left'}`
  - Docs: https://ui.shadcn.com/docs/components/sidebar, https://ui.shadcn.com/docs/rtl
- **Sonner.** The generated `components/ui/sonner.tsx` imports `next-themes`. Remove `useTheme`, hard-set `theme="light"`, and pass `dir` from `useLanguage()`. Then `pnpm remove next-themes` if nothing else imports it. Docs: https://ui.shadcn.com/docs/components/sonner
- **Drawer.** The base-nova `drawer` uses `@base-ui/react`, not vaul. Confirm `vaul` isn't in package.json afterwards.
- **Portals.** Because of the `tw-animate-css` logical-slide issue, pass `dir={dir}` to every portal content (`DialogContent`, `SheetContent`, `PopoverContent`, `TooltipContent`, `DropdownMenuContent`).
- **Docs:**
  - https://ui.shadcn.com/docs/components/command
  - https://ui.shadcn.com/docs/components/chart
  - https://ui.shadcn.com/docs/components/data-table
  - https://ui.shadcn.com/docs/components/skeleton
  - https://ui.shadcn.com/docs/components/empty
  - https://ui.shadcn.com/docs/components/tabs
  - https://ui.shadcn.com/docs/components/progress
  - https://ui.shadcn.com/docs/components/breadcrumb
  - https://ui.shadcn.com/docs/components/item
  - https://ui.shadcn.com/docs/components/drawer
  - https://ui.shadcn.com/docs/components/radio-group
  - https://ui.shadcn.com/docs/components/toggle-group
  - https://ui.shadcn.com/docs/components/kbd
  - https://ui.shadcn.com/docs/components/checkbox

### §4.3 Optional copy-paste (Magic UI; verified 2026-09-25)
- `pnpm dlx shadcn@latest add @magicui/animated-list` (https://magicui.design/docs/components/animated-list): new activity-feed items slide in. Optional, since Motion `layout` + `AnimatePresence` does the same.
- **Not used in the dashboard:** Border Beam, Shine, Shimmer, any glow component. NumberFlow (https://number-flow.barvian.me) replaces Magic UI Number Ticker.

### §4.4 framer-motion → motion
- Same procedure as the Fronter prompt:
  ```bash
  rg -l "framer-motion" --glob '!node_modules' --glob '!pnpm-lock.yaml'
  ```
  In every hit, replace the import with `from 'motion/react'`, then `pnpm remove framer-motion`.
- If F0 already did this, just verify `rg` is empty.
- Guide: https://motion.dev/docs/react-upgrade-guide

### §4.5 Never install
@tremor/react, vaul, gsap, three, lenis, react-virtualized, any chart library besides recharts (through shadcn Chart), any glow/beam/sparkle component, next-themes (after removal).

### §4.6 Shared foundation (identical spec in both prompts; create it if missing, otherwise verify and keep it)

1. **`app/fonts.ts`**. `next/font/google`:
   - `Geist({subsets:['latin'],variable:'--font-geist'})`
   - `Geist_Mono({subsets:['latin'],variable:'--font-geist-mono'})`
   - `IBM_Plex_Sans_Arabic({subsets:['arabic'],weight:['400','500','600','700'],variable:'--font-plex-ar'})`
   - export `fontVars`
2. **`globals.css` font stack**
   - `:root{--app-font-sans:var(--font-geist),var(--font-plex-ar),ui-sans-serif,system-ui,sans-serif;--app-font-mono:var(--font-geist-mono),ui-monospace,monospace}`
   - `[dir="rtl"]{--app-font-sans:var(--font-plex-ar),var(--font-geist),ui-sans-serif,system-ui,sans-serif}`
   - In `@theme inline`: `--font-sans:var(--app-font-sans); --font-display:var(--app-font-sans); --font-mono:var(--app-font-mono); --font-inter:var(--app-font-sans)` (a legacy alias).
   - Remove Inter and Space_Grotesk from `app/layout.tsx`.
3. **`lib/motion/tokens.ts`**
   ```ts
   export const ease = { out: [0.16,1,0.3,1] as const, std: [0.2,0.8,0.2,1] as const, in: [0.4,0,1,1] as const }
   export const dur = { hover: .14, pop: .2, dialog: .18, page: .18, reveal: .7, counter: .9, ambient: 12 }
   export const spring = { pill: { type:'spring', stiffness:400, damping:30 } as const }
   export const stagger = { dash: .025, dashCap: 12, mk: .07 }
   ```
   **`lib/motion/variants.ts`** exports `fadeUp`, `blurFade`, `staggerContainer`, `scaleIn` (.98 → 1, 160 ms), `pageTransition` (opacity 0 → 1, y 4 → 0, 180 ms), and `slideInline(dirSign, px)`.
   **`lib/motion/features.ts`**: `export { domMax as default } from 'motion/react'`.
4. **`hooks/use-reduced-motion-safe.ts`**: returns `true` until mounted, then `useReducedMotion() ?? false`. Also exports `useAmbientAllowed()`.
5. **`components/providers/motion-provider.tsx`**: `LazyMotion` (lazy `domMax`) + `MotionConfig reducedMotion="user"`.
6. **`components/shell/language-context.tsx`**
   - Exports `LanguageProvider({initialLang})`.
   - `useLanguage(): { language:'en'|'ar'; setLanguage; toggleLanguage; dir; isArabic }` and `useDirSign()`.
   - Persistence: writes `localStorage['helix.lang']` **and** the cookie `helix-lang` (1 year, path `/`, SameSite=Lax), sets `<html lang dir>`, then calls `router.refresh()`.
   - On mount, localStorage wins over the cookie and the cookie is synced to it.
   - If V2 created this file first, keep its names and add these as aliases.
   - If `components/shell/console-language.tsx` exists, re-export its `ConsoleLanguageProvider`/`LanguageToggle` from here.
7. **`lib/i18n/server.ts`** exports `getLang()` (cookie), `dirOf()`, and `formatNumber(n, lang, opts)`. **`lib/i18n/format.ts`** is the client twin; use `ar-AE` for Latin digits.
8. **`components/providers/app-providers.tsx`**: `DirectionProvider` → `LanguageProvider` → `MotionProvider` → `{children}` + `<Toaster/>` (§6.9).
9. **Root `app/layout.tsx`**
   - `<html lang={lang} dir={dirOf(lang)} className={fontVars}>`.
   - Remove the hard-coded `bg-[#F3F1EC]` from `<html>`.
   - body: `bg-background text-foreground`.
   - `viewport.colorScheme: 'light dark'` (marketing is dark).
   - Keep the JSON-LD, AuthHashHandler, and Analytics.

---

## §5 Motion system (dashboard)

| Element | Motion | Timing | Reduced motion |
|---|---|---|---|
| Page change | `app/dashboard/template.tsx` + `app/admin/template.tsx`: `m.div` opacity 0 → 1, y 4 → 0 | 180 ms ease-out, no exit animation | none |
| Sidebar active rail | `m.span layoutId="dash-nav-rail"` | spring 400/30 | instant |
| Sidebar collapse (⌘B) | shadcn built-in width transition | 200 ms | instant |
| KPI numerals | `NumberFlow` animates **value changes** (range switch, realtime refresh). The SSR value renders immediately; there's no count from 0 on first load, which avoids a fake "0" and protects LCP | 900 ms | NumberFlow `respectMotionPreference` (default true) jumps |
| Charts | recharts `isAnimationActive` on mount only, bars grow | 400 ms | `isAnimationActive={false}` |
| Live dot | CSS pulse ring | 2 s | static |
| Activity feed new item | `AnimatePresence` + `layout`; the new row fades in with a `#F3FAF6` background that fades to transparent | 220 ms + 2 s highlight fade | no motion, highlight for 2 s then removed |
| Lead Gen job bar | width tween | 300 ms | instant |
| Mode card selection | `layoutId="lg-mode-ring"` ring moves; form cross-fades `AnimatePresence mode="wait"` | 200 ms | instant swap |
| Stepper active step | ring pulse | 2 s | static ring |
| Log lines | new line: y 6 → 0, opacity | 150 ms | none |
| Table rows | first 12 new rows fade in with a 20 ms stagger; skeleton rows are replaced in place with a 200 ms cross-fade | – | none |
| Search result cards | stagger 30 ms (cap 12); selection bar springs up | spring 400/30 | none |
| Tabs underline | `layoutId="dash-tab-underline"` 2 px ink bar | spring | instant |
| ⌘K | scrim fade 150 ms; panel scale .98 → 1 + fade 160 ms expo-out; highlighted row background `layoutId="cmdk-hl"` | 120 ms | no scale, no slide |
| Toast | Sonner enter | 200 ms, auto-dismiss 5 s | Sonner respects the media query |
| Hover/press | colour 120–150 ms; press scale .98 on buttons only | – | none |

**RTL.**
- All x offsets are multiplied by `useDirSign()`.
- Progress and score bars fill from inline-start.
- Chevrons and arrows flip with `rtl:rotate-180`; play, check, clock, and brand do not.
- Charts are wrapped in `dir="ltr"` so time axes read left → right in both languages. Chart titles and legends outside the SVG follow the page direction.

---

## §6 Surface-by-surface spec

### §6.1 Shell — layouts + `ConsoleShell` rebuild (PNG: every dashboard PNG; D1)

**Architecture (keeps page code working).**
1. New **`lib/shell/get-shell-context.ts`** (server, wrapped in React `cache`). It takes the `businessName`/`isAdmin` logic every page repeats and returns `{ variant, email, businessName, clientId, attentionCount }`.
   - `attentionCount`: try `attention_queue` (open items, tenant-scoped). If the table errors or doesn't exist, fall back to the `contact_facts` pending count. If neither is available, return `null`.
2. New **`app/dashboard/layout.tsx`** and **`app/admin/layout.tsx`** (server):
   - `getVerifiedSession` → redirect `/login` if missing (the same check pages do)
   - `getShellContext()`
   - render `<ShellProvider mounted>` + `<ConsoleShell {...ctx}>{children}</ConsoleShell>`
   - Read the `helix-lang` cookie through `getLang()`.
3. **`ConsoleShell` becomes idempotent.** If `useContext(ShellMountedContext)` is already true (a layout mounted it), it renders `<>{children}</>` only. Existing pages that still wrap themselves keep working without a double shell.
   - In D5, remove the per-page `<ConsoleShell>` wrappers where safe. Keep the page-level session and redirect logic.
4. `/settings` (outside `/dashboard`) keeps rendering `ConsoleShell` itself, which gives the full shell because there's no layout there.
5. **`app/dashboard/template.tsx`** and **`app/admin/template.tsx`** (client): page transition (§5). The shell lives in the layout, so it never animates or re-mounts.

**Sidebar** (`components/shell/app-sidebar.tsx` using shadcn `Sidebar collapsible="icon"`, `variant="sidebar"`, `side` by dir, ink palette via the `--sidebar*` vars; `SidebarProvider` default-open state from the shadcn `sidebar_state` cookie; ⌘B toggles):

- **Header — workspace card.**
  - Mark tile: 28 px `HelixMark` on `#0E0E0D`.
  - Name line 13.5/500: "Helix AI". Sub-line 11.5 `#8A867F`: client `"{businessName} · client"` / AR `"{businessName} · عميل"`; admin `"Agency · admin"` / `"الوكالة · مسؤول"`.
  - It isn't a switcher, so no chevron. There's no multi-tenant switch in the product yet. Remove "DIRECTION 2 · WARM COMMAND" and "AGENCY · LIVE".
- **Client nav (EN / AR / href / icon)** — lucide at 16 px, stroke 1.75:

  | Group | Label EN | Label AR | href | Icon | Badge |
  |---|---|---|---|---|---|
  | — | Overview | نظرة عامة | `/dashboard` | `LayoutDashboard` | – |
  | — | Search | بحث | `/dashboard/search` | `Search` | "New" / "جديد" (only if the route exists) |
  | — | Lead Generation | توليد العملاء | `/dashboard/lead-generation` | `Target` | – |
  | — | Contacts | جهات الاتصال | `/dashboard/contacts` | `Users` | – |
  | — | CRM | إدارة العملاء | `/dashboard/crm` | `KanbanSquare` | – |
  | — | Attention queue | قائمة المتابعة | `/dashboard/queue` (match `/dashboard/facts` too) | `ListTodo` | `attentionCount` if > 0 |
  | SYSTEMS / الأنظمة | Studio | الاستوديو | `/dashboard/studio` | `Boxes` | – |
  | | AI Engine | محرك الذكاء | `/dashboard/engine` | `Cpu` | – |
  | | Integrations | التكاملات | `/dashboard/integrations` | `PlugZap` | – |
  | | Reports | التقارير | `/dashboard/reports` | `BarChart3` | – |
  | ACCOUNT / الحساب | Billing | الفوترة | `/dashboard/billing` | `CreditCard` | – |
  | | Support | الدعم | `/dashboard/support` | `LifeBuoy` | – |
  | | Settings | الإعدادات | `/settings` | `Settings` | – |

- **Admin nav:**

  | Group | Items |
  |---|---|
  | AGENCY / الوكالة | Clients `/admin` (`Building2`), Pipeline `/admin/crm` (`KanbanSquare`), Systems `/admin/studio` (`Boxes`), Search `/dashboard/search` (if it exists), Lead Generation `/dashboard/lead-generation` (`Target`) |
  | INTELLIGENCE / الذكاء | Intelligence `/dashboard/engine` (`Cpu`), Reports `/dashboard/reports`, Analytics `/admin/analytics` (`LineChart`), Agent Queue `/admin/queue` (`ListTodo`) |
  | ACCOUNT / الحساب | Support `/admin/support`, Settings `/settings` (the match list is unchanged: users/pricing/updates/webhooks/faq) |

  Keep every existing `match` function exactly as it is.
- **`NavItem` type:** `{ href; label; labelAr; icon; badge?: string|number; badgeTone?: 'neutral'|'new'; match; group: 'primary'|'systems'|'account'|'agency'|'intel' }`.
  - If V2 W2 already added `labelAr` and a Search item, **keep them** and merge.
  - Search route existence: a constant `HAS_SEARCH_ROUTE`, computed by checking `features/search/SearchPage` at build time. Simplest option: a `lib/shell/features.ts` flag Antigravity flips to `true` once `app/dashboard/search/page.tsx` exists.
- **Item rendering:** `SidebarMenuButton asChild isActive tooltip={label}`. The active item renders `<m.span layoutId="dash-nav-rail" className="absolute start-[-12px] top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-e-[3px] bg-sb-rail"/>`. Collapsed mode shows icons with tooltips (`side` = inline-end).
- **Footer — user card.** A `DropdownMenu` trigger showing:
  - avatar with initials from the email local part (e.g. "ZS" for ziad.sabry@…; two letters from the split on `.`, `_`, `-`)
  - name = email local part
  - role: "Agency admin" / "مسؤول الوكالة" or "Client" / "عميل"

  Menu items: email (disabled), Settings, Sign out (the existing `signOut` server action inside a `<form>`).
- **Mobile (<1024 px).** shadcn Sidebar switches to its built-in `Sheet` (offcanvas). The topbar shows a `SidebarTrigger`. Remove the old inline dropdown.

**Topbar** (`components/shell/topbar.tsx`, sticky, height 60):
- **Start.**
  - `SidebarTrigger` (mobile + collapsed).
  - `Breadcrumb`: first crumb = workspace (`businessName`, or "Helix AI" for admin), then the page label from the active nav item. Nested routes add one crumb (e.g. Lead Generation / Job `#abcd`, with the id `dir=ltr`).
  - Page components may override the last crumb through `useShellHeader({ crumb })`, a small context.
- **Centre-end.** ⌘K trigger button (360×36, hidden below 768 px → 36 px icon button): "Search or jump to…" / "ابحث أو انتقل إلى…" + `Kbd` "⌘K" (shows "Ctrl K" on non-Mac).
- **End.**
  - EN/عربي `ToggleGroup`, wired to `useLanguage().setLanguage`.
  - `NotificationBell` (the existing component, restyled to the 36 px outline button; its unread dot uses `--helix-warn-dot`; pass `clientId` when the client variant is known).
- **INTEL rail.** Keep `INTEL_TABS` as a secondary tab row **below** the topbar on intel routes only (not every admin route). Styling: shadcn `Tabs` look, 2 px ink underline with `layoutId`, 13.5 px.

**Content wrapper.** `<main className="dash mx-auto w-full max-w-[1520px] px-8 pb-12 pt-7">`, with `px-4` on mobile.

**`PageHeader`** (restyle `components/ui/helix/index.tsx`): `title` 28/600, optional `sub` 13.5 muted, optional `meta` (chips), and `actions` at the end.
- **Remove** any "SAMPLE DATA" chip. It exists only in mockups.
- Add a dev-only `sample` prop that renders nothing in production.

### §6.2 ⌘K Command palette — `components/shell/command-palette.tsx` (PNG: `dashboard_cmdk.png`; built in D1, content extended in D4)

**Open and close.** ⌘K / Ctrl+K from anywhere in the console, or the topbar trigger. Built on shadcn `CommandDialog`:
- scrim `rgba(20,20,20,.28)` + `backdrop-blur-[2px]`
- panel 640 px, radius 16, `mt-[110px]`, `--helix-shadow-dialog`
- `dir` passed through

**Input.** 48 px row with a `Search` icon. Placeholder "Type a command or search…" / "اكتب أمراً أو ابحث…". An `esc` kbd sits at the end.

**Groups** (labels 11.5 uppercase, AR without uppercase):
1. **PAGES / الصفحات.** Every nav item visible to the current variant, each with its icon and a two-key hint (`G` then letter):

   | Page | Hint |
   |---|---|
   | Overview | G O |
   | Search | G S |
   | Lead Generation | G L |
   | Contacts | G C |
   | CRM | G R |
   | Attention queue | G Q |
   | Studio | G T |
   | Integrations | G I |
   | Reports | G P |
   | Billing | G B |
   | Settings | G , |

   Implement the chord globally in `hooks/use-go-shortcuts.ts`: after `g`, the next key within 1 s navigates. Ignore it while typing in inputs.
2. **ACTIONS / إجراءات.**
   - New "Find leads" job → `/dashboard/lead-generation?mode=find`.
   - Enrich a website… → `?mode=enrich`. Only if V2's `ModeTabs` reads `mode` from the URL; otherwise just navigate to the page.
   - Export last job (.xlsx). Enabled only when a latest job id is known: call the existing V2 export URL for that job (`/api/leadgen/jobs/{id}/export?format=xlsx` or whatever V2 defines; read the route first). Otherwise show it disabled with the hint "No finished job yet" / "لا توجد مهمة مكتملة بعد".
   - "Search the web for "{query}"" → `/dashboard/search?q=…`. Only when Search exists and the input isn't empty.
3. **RECENT JOBS / المهام الأخيرة.**
   - Lazy-fetch on first open from the existing jobs endpoint `useLeadGenJob` uses (read `features/leadgen/api` / hook for the exact URL; don't create a new API).
   - Show at most 5: job title (query or first URL) plus a status chip (running = info, done = ok, failed = dg, queued = neutral).
   - Selecting one → `/dashboard/lead-generation/{jobId}`.
   - Errors: hide the group silently. The palette must never break.

**Highlight and footer.**
- The highlighted row gets background `#F1F8F4` and a 3 px accent inline-start bar, via Motion `layoutId="cmdk-hl"` (120 ms).
- Footer (surface-2, 11.5 px): "↑↓ navigate · ↵ open · esc close" / "↑↓ للتنقل · ↵ للفتح · esc للإغلاق".

**Empty result.** "No results for "{q}"." / "لا نتائج لـ "{q}"."

**Accessibility.** The cmdk defaults (combobox/listbox) stay. Focus returns to the trigger on close.

### §6.3 Overview — `app/dashboard/page.tsx` (PNG: `dashboard_overview.png`; D2)

**Data rule.** Keep every existing query and its tenant scoping. Only three kinds of change are allowed:

- **(a) A range parameter.** `searchParams.range` ∈ `7d|30d|90d`, default `30d`. It replaces "this month" for activities, bookings, contacts and leads. The previous period of the same length is used for deltas.
- **(b) Read-only aggregate queries,** listed below.
- **(c) Pure presentational components.**

Put all reads in **`lib/dashboard/overview-data.ts`**. It's server-only, returns typed data, and runs its reads with `Promise.all`.

**Header**
- `PageHeader` title "Overview" / "نظرة عامة".
- Sub-line, built from real data: `"{liveSystems} systems live · last event {relative}"` / `"{n} أنظمة تعمل · آخر حدث {relative}"`.
  - `relative` comes from `useRealtime().lastEventAt` when connected, otherwise from the newest `activities.occurred_at`.
  - Use `Intl.RelativeTimeFormat(lang)`.
  - If there are no events at all: "No events yet" / "لا أحداث بعد".
- Actions:
  - Range `ToggleGroup` 7d / 30d / 90d (AR: ٧ أيام / ٣٠ يوماً / ٩٠ يوماً, with digits as written in the labels). Clicking updates `?range=` with `router.replace`.
  - Outline "Report" / "تقرير" → `/dashboard/reports`.
  - Accent "+ New job" / "+ مهمة جديدة" → `/dashboard/lead-generation`.

**KPI row** — `components/dashboard/kpi-tile.tsx`. Grid `repeat(4,1fr)`, gap 16; 2 columns under 1200 px, 1 column under 640 px.

Card layout: padding 16×18. Label 13 px muted, with a 16 px icon at the end. `NumberFlow` numeral in `text-kpi`. A delta chip reading "+12.4% vs prev." (ok = accent-soft; negative = danger-soft only when "bad" is unambiguous, otherwise neutral). A 104×36 sparkline at the end.

| # | Label EN / AR | Value (real source) | Delta | Sparkline |
|---|---|---|---|---|
| 1 | Conversations handled / المحادثات المُدارة | `activities` count in range (existing query, now range-bound) | vs previous range, % | daily counts from `activities.occurred_at` (select only `occurred_at`, limit 5000, bucket in JS) |
| 2 | Bookings created / الحجوزات | `bookings` non-cancelled in range (existing filter) | absolute (+n) | daily buckets |
| 3 | Leads found / العملاء المحتملون | `leadgen_leads` count where `client_id = tenant` and `created_at` in range. Admin variant: no tenant filter, or keep the existing admin behaviour | absolute | daily buckets |
| 4 | Open pipeline / قيمة الفرص المفتوحة | sum of open-stage `deals.value_cents` (existing query), `NumberFlow` currency using the deal/tenant currency if stored, else no currency symbol | none (no history), so hide the delta chip | none |

- **Replacement notice.** Tile 4 replaces the mockup's "Median first reply 4.2s", because there's no first-reply source. Add a code comment: `// TODO(first-reply-metric): add when a reply-latency column exists`.
- **Zero values.** A value of `0` is shown as `0` (real). If a query errors, show "—" with a tooltip "Couldn't load" / "تعذّر التحميل". Never render sample numbers.
- **Sparklines.** shadcn `ChartContainer` wrapping recharts `AreaChart`: stroke `--chart-1` at 1.5 px, `fillOpacity={0.1}` with a **flat fill and no `<linearGradient>`**. No axes, no tooltip. `aria-hidden`, because the numbers carry the meaning.

**Row 2** — grid `1fr 380px`, gap 16; stacked under 1200 px.

*Chart card.* Title: "Activity by system · last 14 days" / "النشاط حسب النظام · آخر ١٤ يوماً".
- Stacked `BarChart`, one bar per day, series = the top 3 systems plus "Other".
- Data comes from the existing `ACTIVITY_SOURCE` per-system tables, bucketed by day.
- Colours: `--chart-1` `#0B6E4F`, `--chart-2` `#7CCBB0`, `--chart-3` `#D9D3C7`, `--chart-4` `#0E7490`.
- Legend sits above the chart, at the start. Wrap the chart in `dir="ltr"`. Height is fixed at 240 px.
- **Replaces** the mockup's "Conversations by channel", because there's no channel data. If Antigravity finds a real `channel` column on `activities`, it may switch to the mockup's WhatsApp/Voice/Email series with the same colours.
- Empty state: "No activity in this period." / "لا نشاط في هذه الفترة." with no action.

*Systems card.* Title: "Systems" / "الأنظمة".
- List of `client_systems` (visible + active per the existing filter) with `Item` rows.
- Each row: a 32 px neutral icon tile (`#F4F2ED`, 1 px line, 16 px ink icon), the system name at 13.5/500, and a 12 px muted line with the weekly count ("{n} events this week" / "{n} حدث هذا الأسبوع").
- Status chip, from real fields only: Live (ok) / Paused (warn) / Error (dg) / Not connected (neutral), derived from `client_systems` status and the related `client_integrations.status`.
- Footer link "Manage →" / "إدارة ←" → `/dashboard/studio`.
- Don't list "Not installed" catalog systems unless they come from a real catalog source (`lib/studio/templates.ts`). If they're shown, keep them in a separate muted sub-list, "Available" / "متاح".

**Row 3** — grid `1fr 440px`, gap 16.

*Activity card.*
- Header: "Activity" / "النشاط", followed by a live chip **only when `useRealtime().connected`**: `.live-dot[data-pulse]` + "Live" / "مباشر". When not connected, show a neutral "Updates paused" / "التحديث متوقف".
- The mockup's "Realtime · Supabase" sub-label is dropped, since it's an internal detail.
- Rows: the latest 6 events from `activities`. Before binding, read the real columns (`type`/`kind`, `title`/`summary`, `occurred_at`, `system_key`) in the migrations or existing selects.
- Row layout: a 30 px neutral chip icon chosen by type (`MessageSquare` message, `CalendarCheck` booking, `UserPlus` contact, `Target` lead, `AlertTriangle` attention), a 13.5 px title with a 12 px muted meta line, and a relative time at the end in 12 px tabular.
- Realtime: when `eventCount` increments, call `router.refresh()`, throttled to at most once per 10 s. New rows animate in per §5.
- Empty state: `Empty` with a 48 px `Activity` icon, "No activity yet", "Events from your systems appear here as they happen." / "لا نشاط بعد" / "ستظهر هنا أحداث أنظمتك فور حدوثها.", and the action "Open Studio" → `/dashboard/studio`.

*Lead Gen jobs card.*
- Header: "Lead Gen jobs" / "مهام توليد العملاء" plus "View all" → `/dashboard/lead-generation`.
- Show the 3 latest `leadgen_jobs` for the tenant (`created_at desc`).
- Each row: the job title (V2's query text or first URL, from `brief`; otherwise `recipe_id`), a status chip, and a 6 px progress bar.
  - Chip mapping: queued = neutral, running = info, paused = warn, succeeded = ok ("done"), failed = dg.
  - Bar: `stage_index / stages_total`. Use info while running, accent when succeeded. Flat fill.
  - Meta: `{leads_count} leads · {relative}`.
- Footer (keep DESIGN-SPEC §14 copy verbatim): `{n} pending suggestion(s).` with "Review now →" → `/dashboard/facts`, or "Nothing to review right now.", using the `contact_facts` pending count.
  - The mockup's "3 facts need review" is replaced by this retained copy. AR: "{n} اقتراحات بانتظار المراجعة." / "لا شيء للمراجعة الآن." / "راجع الآن ←".
- Empty state: "No jobs yet" / "لا مهام بعد", "Find businesses or enrich your own list." / "ابحث عن شركات أو أثرِ قائمتك.", and the action "Start a job" / "ابدأ مهمة".

**Loading** (`app/dashboard/loading.tsx`): the page header plus 4 KPI skeleton tiles, and 2 card skeletons with ≤ 3 rows each. Heights must match the real content exactly.

**Mobile:** the KPI grid goes to 1 column and every other row stacks. The chart stays at 240 px.

### §6.4 Lead Generation — restyle on top of V2 (PNG: `dashboard_leadgen.png`; D3)

**Files to restyle.** `features/leadgen/{LeadGenPage,ModeTabs,EnrichForm,FindForm,AdvancedPanel,SettingsStrip,JobProgress,LeadsTable,LeadDetail,ExportBar,CrmUpsertButton,EmptyState}.tsx`.
- Change JSX and classNames only.
- Hook calls, props, handlers, and the `copy.ts` keys stay as they are.
- Add any missing AR strings to V2's `features/leadgen/copy.ts`, following its structure.
- Replace every hard-coded cyan hex (`#0e8da6`, `#38c6e0`, `sky-*`, `cyan-*`) with tokens: info for "running", accent for primary.
- The local `isArabic` becomes `useLanguage().isArabic`. Keep a fallback to the local state if the context is missing.

**Header**
- "Lead Generation" / "توليد العملاء".
- Sub-line: "Find businesses or enrich your own list. Every field shows where it came from — empty stays empty." / "ابحث عن شركات أو أثرِ قائمتك. كل حقل يوضّح مصدره — والفارغ يبقى فارغاً."
- Action: outline "History · {jobs.length} jobs" / "السجل · {n} مهمة". It opens a `Popover` (desktop) or `Drawer` (mobile) listing `jobs` that calls `selectJob`.

**Status strip.** `SettingsStrip` restyled as a single card row: padding 10×16, 12.5 px, items separated by 1 px vertical lines, and it wraps on mobile. All values come from `health`:
- Worker: `.live-dot` + "Worker online" / "العامل متصل" when `health.worker` is ok; otherwise a warn dot + "Worker offline" / "العامل غير متصل".
- "Engines:" followed by one chip per engine in `health.engines_available` (HTTP / Dynamic / Stealth). Available = filled accent dot; unavailable = hollow dot with a tooltip giving the reason.
- Quotas: "Stealth {used}/{cap} this month" and "Browser {used}/{cap}s". If V2 health exposes `hunter_credits` or search hourly remaining, add "Hunter {n} credits" / "Web search {n}/h left". Otherwise omit them; don't invent them.
- "robots.txt respected" / "يحترم robots.txt" when `robots_default` is true.

**Main grid** — `1fr 420px`, gap 16. Under 1200 px the job panel stacks below the form.

**Left card: create form.**
- **Mode cards.** V2 `ModeTabs`, restyled as a `RadioGroup` of two cards (`1fr 1fr`, gap 12, radius 12, padding 16, border `--helix-border-strong`).
  - Selected card: 1.5 px accent border, `#F3FAF6` background, 4 px ring `rgba(11,110,79,.10)`, via `layoutId="lg-mode-ring"`.
  - Each card has a 20 px icon (`Globe` for enrich, `Search` for find), a 14.5/600 title, and a 12.5 muted line.
  - "Enrich websites" / "إثراء المواقع": "Paste up to 25 URLs you already have" / "الصق حتى ٢٥ رابطاً لديك".
    - `TODO(copy-check)`: use V2's real URL cap if it isn't 25.
    - V2's key `tab.enrich` is "Enrich a URL" / "إثراء رابط". **Keep V2's key**, but set its EN value to match the mockup only if V2's copy file allows it. Otherwise keep V2's wording.
  - "Find leads" / "ابحث عن عملاء": "Describe who you want — we search maps + web" / "صِف من تبحث عنه — نبحث في الخرائط والويب".
  - Keyboard: arrows switch cards (RadioGroup). The form below cross-fades with `AnimatePresence mode="wait"` at 200 ms.
- **FindForm** (restyle):
  - Label "What are you looking for?" / "عمّن تبحث؟".
  - Input: height 48, radius 12, 1.5 px ink border when focused (`--helix-border-strong` otherwise). Placeholder from V2 `find.placeholder` ("e.g. roofing contractors in Jeddah").
  - Trailing chip "AE · auto": the detected country/lang if V2 provides it; otherwise omit.
  - "Try:" example chips, taken from V2 copy if it has them. They're suggestions only and fill the input on click.
  - "SOURCES" / "المصادر" label, then provider chips (Google Maps, Foursquare, OpenStreetMap, Web search). Each chip is `Toggle` style with an 8 px status dot.
    - Available = accent dot.
    - Unavailable = hollow dot, disabled, with a tooltip from V2 `prov.*.off` copy. It names the env var as V2 specifies, but **never shows a value**.
  - "HOW MANY" / "العدد": `ToggleGroup` 10 / 20 / 40 / 60, bound to V2's limit field.
  - "EMAILS" / "البريد": `Checkbox` "Hunter decision-makers" / "صنّاع القرار عبر Hunter", bound to V2's field. Disabled with a reason if Hunter is unavailable.
- **EnrichForm** (restyle):
  - Textarea: min-height 140, radius 12, Geist Mono 12.5, `dir="ltr"`.
  - A live count "{n}/25 URLs" with invalid lines highlighted (if V2 validates) and a helper line.
- **AdvancedPanel.** A `Collapsible`: "› Advanced" / "‹ خيارات متقدمة". The chevron rotates 90° and flips in RTL.
- **Footer row**, top border, padding-top 14:
  - Start: "≈ {credits} credits" / "≈ {n} رصيد", only if V2 computes an estimate.
  - End: accent button, height 40. "Find leads" / "ابحث عن عملاء" in find mode, "Enrich websites" / "أثرِ المواقع" in enrich mode. Calls V2's submit (`createJob`).
  - While submitting: `Spinner` and disabled.
  - On success the job panel takes focus. On error, show an inline `Alert` with V2's error copy plus a Sonner error toast.

**Right card: Job progress** (`JobProgress` restyle).
- **Header:** "Job progress" / "تقدّم المهمة" with a status chip (running = info, paused = warn, succeeded = ok, failed = dg, queued = neutral) and the job id in `Kbd` style mono (`#a41f`, the first 4 chars, `dir=ltr`).
- **Big numeral:** `NumberFlow` percentage at 34/600 tabular.
  - Percent = target-based if V2 exposes a target count (`leads_count / target`); otherwise `stage_index / stages_total`.
  - Line below: "{leads_count} of {target} websites enriched · ~{eta} left", **only** with the fields available. If there's no target: "{leads_count} leads so far" / "{n} عميل حتى الآن". ETA only if V2 computes it.
  - "Pause" / "إيقاف مؤقت" (or "Resume" / "استئناف") outline button → `pause()` / `resume()`.
  - 8 px progress bar, flat: info while running, accent when succeeded.
- **Stepper.** Five display steps mapped from the real 9 `stage` values (`brief, seed, discover, fetch, extract, enrich, score, outreach, export`). Create **`features/leadgen/stage-groups.ts`**, which is presentational only:

  | Display step EN / AR | Stages | Meta (real fields only) |
  |---|---|---|
  | Search sources / البحث في المصادر | brief, seed, discover | find mode: "{n} found" if available. Enrich jobs (`job_kind='enrich'` from V2): show "Using your list" / "من قائمتك" as done |
  | Collect websites / جمع المواقع | fetch | "{pages_fetched} sites · {pages_blocked} blocked" |
  | Enrich contacts / إثراء جهات الاتصال | extract, enrich | "{leads_count} / {target}" or "{leads_count}" |
  | Score & dedupe / التقييم وإزالة التكرار | score, outreach | – |
  | Ready to export / جاهز للتصدير | export (+ status succeeded) | – |

  Step visuals: a 22 px circle. Done = accent-soft background with a `Check` in accent. Active = info border with a 3 px ring `rgba(14,116,144,.15)` pulsing every 2 s. Waiting = `--helix-border-strong` outline. Failed = danger. Title 13.5, meta 12 mono muted. A 1 px vertical line connects the circles and is filled up to the active step.
- **Log.**
  - V2 hides per-page logs behind "Show log" / "عرض السجل". Keep that toggle.
  - When open, the log renders as a terminal block: `#141414` background, radius 10, padding 12×14, Geist Mono 11.5/1.8, text `#C9C3B7`, timestamps `#6D6A64`, and the last line in `#34E0A1` with a blinking caret (static under reduced motion).
  - Always `dir="ltr"`, max-height 180, auto-scroll to the bottom unless the user has scrolled up.
  - Keep `role="log"`, but use `aria-live="off"` while streaming and announce only stage changes in a separate `aria-live="polite"` sr-only span. That way the existing `polite` log isn't read line by line.
- **Tab-pause notice** (`isTabPaused`): a neutral `Alert`, "Updates paused while this tab is hidden." / "التحديث متوقف أثناء إخفاء التبويب." Keep V2 copy if it exists.

**Results** (`LeadsTable` restyle → **`components/ui/data-table.tsx`**, a generic TanStack v8 table built on the existing `components/ui/table.tsx`).
- **Header row:**
  - Start: "{leads.length} leads · {enriched} enriched · {selected} selected" / "{n} عميل · {m} مُثرى · {k} محدد".
  - End: `ExportBar` restyled — outline "Export .xlsx" as the primary V2 action, then outline "CSV" (V2's menu: CSV / Full CSV / JSONL in a `DropdownMenu` under a chevron), then ink "Send to CRM" / "إرسال إلى إدارة العملاء" (`CrmUpsertButton`, disabled with a tooltip when nothing is selected).
- **Columns**, bound to `LeadGenLead`:

  | Column | Content |
  |---|---|
  | ☐ | row select (checkbox) |
  | Company / الشركة | `company_name` at 13.5/500, plus `domain` in Geist Mono 11.5 muted (`<bdi dir=ltr>`) |
  | Description / الوصف | V2's description field if it exists; else `markdown_excerpt`, truncated to 2 lines; else italic muted V2 `field.empty` ("Not found on the site") |
  | Email / البريد | `emails[0]` (`dir=ltr`) plus a "+{n}" chip, and a tiny source tag from `email_source` (website / hunter / bio) |
  | Phone / الهاتف | `phones[0]` (`dir=ltr`) plus "+{n}", with a `phone_source` tag |
  | Socials | icon links built from the `socials` keys (`Linkedin`, `Instagram`, `Facebook`, `X`), each with an `aria-label` |
  | Location / الموقع | the city if V2 adds a field; otherwise `address`, truncated. Header reads "Location", since the mockup's "City" isn't a column |
  | Score / التقييم | a 44 px bar plus the number. ≥ 70 accent, ≥ 50 `#D97706`, otherwise `#C9C3B7`. Flat |
  | Source / المصدر | chips from the `sources` keys (maps / web / osm / list) |

- **Empty cells** show "—" in `--helix-subtle`. Never fake a value.
- **Enriching rows:** leads whose extract is still running (per V2 status fields) render skeleton cells with an info chip "enriching" / "جارٍ الإثراء", replaced in place when data arrives. Show at most 3 skeleton rows; if more are pending, show a single "{n} more enriching…" row.
- **Behaviour:** sortable Score and Company columns, 25 rows per page, row click → `selectLead` (opens `LeadDetail` in a `Sheet`, `side` = inline-end, 480 px wide). The selected row gets `#F3FAF6`.
- **Fewer results than requested:** V2's "Only {n} found. We do not add placeholder rows." banner, neutral.
- **Empty state (no job yet):** `Empty` with a 48 px `Target` icon, "No leads yet" / "لا عملاء بعد", "Start with Find leads or paste websites to enrich." / "ابدأ بالبحث عن عملاء أو الصق مواقع لإثرائها.", action "Find leads".
- **Toasts** (Sonner, §6.9): export started/finished ("Exported 20 leads (.xlsx)" / "تم تصدير ٢٠ عميلاً (.xlsx)" — use V2's real count), CRM result from `crmStatus` ("Sent 1 lead to CRM" / "أُرسل عميل واحد إلى إدارة العملاء"; failures listed), job finished (when `activeJob.status` transitions to `succeeded` while on the page: "Job finished — {leads_count} leads" with a "View" action that scrolls to results).
- **Mobile:** the table scrolls horizontally with a sticky first column. The job panel sits above the table.

**`[jobId]` page:** same components, with the breadcrumb "Lead Generation / Job {id4}".

### §6.5 Search — restyle V2's `features/search/*` (PNG: `dashboard_search.png`; D4, needs V2 W2)

Restyle only these files: `SearchPage`, `SearchBox`, `ModeTabs`, `ProviderStatus`, `ResultCard`, `ResultList`, `SaveBar`, `RecentSearches`. Leave `hooks/useSearch.ts` and `/api/search/*` untouched.

**Header**
- Title: "Search" / "بحث".
- Subtitle: "Search the web and maps for companies. Nothing is saved until you choose Save." / "ابحث في الويب والخرائط عن شركات. لا يُحفظ شيء حتى تختار حفظ."

**Search box**
- Container: height 52, radius 14, white, 1.5 px border (`--helix-border-strong`, ink on focus), 3 px focus ring `rgba(11,110,79,.12)`.
- Left side: `Search` icon (18 px).
- Input: 15 px.
- Right side, in order:
  - chip "SA · ar + en", only when `useSearch` exposes a detected region and languages
  - `Kbd` "↵"
  - separate accent "Search" / "بحث" button (height 52, radius 14, px 20)
- `/` focuses the box when you're not typing anywhere else.

**Tabs** (V2 `ModeTabs`)
- Labels: Everything / Businesses / Web / Social profiles / News (AR: الكل / الشركات / الويب / الحسابات الاجتماعية / الأخبار).
- Each tab shows a count from real results. A tab with 0 results stays visible but muted.
- Underline: 2 px ink bar with `layoutId="dash-tab-underline"`. Tabs are 13.5/500 with a 10 px bottom padding and a bottom border on the row.

**Provider status** (V2 `ProviderStatus`)
- One inline row of 12.5 px items, each an 8 px dot plus a name. Items: Web search, Google Maps, Foursquare, OSM, Page fetch, Hunter {credits}, Agent.
- Available: accent dot. Off: hollow dot, muted text, and a tooltip with V2's reason copy.
- Per V2's honesty rule, an off provider is still shown, never hidden.

**Layout:** grid `1fr 320px`, gap 16. The rail moves below the results under 1200 px.

**Results card**
- Header on surface-2: "{total} results · Google Maps {n} · Web {n} · OSM {n} · {latency}s", built from real `useSearch` fields only. End of the header: outline "Save all as leads" / "حفظ الكل كعملاء".
- `ResultCard`: padding 16×18, border-bottom.
  - Checkbox, title 15/600, mono domain `<bdi dir=ltr>`, kind chip (Business / Web / Social / News).
  - Snippet: 13.5 muted, 2 lines.
  - Meta row: address, phone, rating — only the fields that exist.
- Actions depend on the card's state:

| Card state | Actions |
|---|---|
| Business | outline "Enrich" / "إثراء", outline "Save" / "حفظ", ghost "Watch" / "مراقبة" (**render only after V2 W3**) |
| Already in leads | ok chip "Already in your leads" / "موجود في عملائك" + ghost "Open lead" |
| Enriching | skeleton lines + info chip "Enriching · checking contact page" / "جارٍ الإثراء · فحص صفحة التواصل" (V2 copy if it exists), 200 ms cross-fade when data lands |
| Web | "Extract companies" / "استخراج الشركات" + "Open" / "فتح" ↗ (the arrow flips in RTL) |
| Social | "Enrich bio website" / "إثراء موقع النبذة" |

- "Load more" / "تحميل المزيد": full-width ghost button. It appends results with a stagger and is hidden when there are no more pages.

**Right rail**
- "Recent searches" / "عمليات البحث الأخيرة" card: V2 `RecentSearches` rows (query text, count, relative time); clicking one re-runs it.
- "Watches" / "المراقبات" card: **only after V2 W3**, with a "Create watch" button. Before W3, omit the card entirely. Never show a dead button.
- Selection card (V2 `SaveBar`):
  - Appears only when ≥ 1 result is selected, with a spring motion.
  - Dark card: `#141414`, radius 14, padding 16, white text. Shows "{n} selected" and `Kbd` "⌘S".
  - Buttons: mint "Save as leads" / "حفظ كعملاء" (bg `#34E0A1`, text `#04130D` — this is the one mint-on-ink usage in the app; it's a flat colour, not glow) and ghost-light "Enrich".
  - ⌘S / Ctrl+S triggers save while results are selected. Call `preventDefault` so the browser's save dialog doesn't open.

**States**
- Initial: `Empty` with a 48 px `Search` icon, "Search companies, people, or topics" / "ابحث عن شركات أو أشخاص أو مواضيع", and V2's example queries as chips.
- Loading: 3 result skeletons.
- Zero results: "No results. Try a broader query or another region." / "لا نتائج. جرّب بحثاً أوسع أو منطقة أخرى."
- Provider errors: V2's safe copy inline. Never show raw error bodies.
- Toasts: "Saved {n} leads" / "تم حفظ {n} عملاء" with a "View" action → Lead Generation.

### §6.6 Admin (D5)

**`components/admin/admin-tabs.tsx`**
- Restyle as the underline tab row (same style as the §6.5 tabs), with a `layoutId` underline and horizontal scroll on mobile.
- Keep all hrefs and labels. If V2 W3 renamed "Lead Gen Usage" to "Lead Gen & Search", keep that rename.
- The "Live Agency Roster" chip is honest only when `useRealtime().connected`. Otherwise remove it (or show neutral "Roster").

**`/admin` (Clients)**
- `PageHeader` "Clients" / "العملاء".
- Clients table restyled with `DataTable` styles: name, systems count, status chip, created.
- Keep the existing data and links.

**`/admin/analytics`** (server, `force-dynamic` stays)
- Period control: `ToggleGroup` Last 7 / 30 / 90 / Custom, keeping the existing param names.
- KPI tiles: `KpiTile` with NumberFlow.
- Lead funnel: horizontal `BarChart` (shadcn Chart, `layout="vertical"`), one bar per funnel stage, `--chart-1`, with values labelled at the end. It replaces the CSS bars.
- Bookings by day: vertical `BarChart`, `--chart-1`, 240 px tall. It replaces the CSS bars.
- Attention list and attribution table: `DataTable` styles.
- Workspace table: same.
- Charts load via `next/dynamic` client islands, which receive the already-fetched server data as props. No new queries.

**`/admin/leadgen`**
- Replace cyan `#0e8da6` with tokens.
- Engine architecture card: keep the content, restyled as a card with a neutral 3-column item list.
- Usage vs cap:
  - two cards with a `Progress` bar each: "Cloudflare Browser Run — {used}s of {cap}s" and "Bright Data Unlocker — {used} of {cap} requests"
  - bar colour: accent under 80%, warn at 80–99%, danger at ≥ 100%
  - `NumberFlow` numbers
- Usage by day: a stacked `BarChart` built from the ledger rows already fetched (the last 100 `leadgen_engine_usage` rows, grouped by day and engine).
  - The chart subtitle must say "Last 100 ledger entries" / "آخر ١٠٠ قيد", since that's the real sample window.
- Ledger table: `DataTable` with sortable time and engine columns and mono IDs.
- After V2 W3, V2's "Search usage per provider" and "API keys" sections follow the same card and table styles.
- API keys must render only as masked prefixes, never full values; V2 handles the data.

**Other admin pages** (`clients/[id]`, `crm`, `faq`, `playbooks`, `pricing`, `queue`, `studio`, `support`, `updates`, `users`, `webhooks`)
- Token sweep only (§6.7): `PageHeader`, cards, tables, chips, buttons.
- No logic changes.
- `admin/pricing` edits prices through `pricing-store`. Don't touch that logic.

### §6.7 Token sweep for every remaining dashboard page (D5)

Run this to find hard-coded values:

```bash
rg -n "#F3F1EC|#FFFEFA|#D9D4CB|#1C1B19|#2B2A27|#33312D|#9E9B95|#E6E2D9|#EBE7DF|#0e8da6|#38c6e0|sky-|cyan-|indigo-|violet-|purple-|Sparkles" app/dashboard app/admin app/settings components features
```

Replace with:

| Old | New |
|---|---|
| `#F3F1EC` | `bg-helix-canvas` |
| `#FFFEFA` | `bg-helix-surface` |
| `#D9D4CB` | `border-helix-border` (or `-strong` for inputs) |
| `#1C1B19` | `bg-sb` |
| `#2B2A27` | `bg-sb-line` |
| `#9E9B95` | `text-sb-text` |
| cyan (`#0e8da6`, `#38c6e0`, `sky-`, `cyan-`) | `text-helix-info` / `bg-helix-info-soft` for "running", `helix-accent` for primary |
| purple / indigo / violet | removed |
| `Sparkles` | `Boxes` / `ScanSearch` |

Apply these components everywhere:
- `PageHeader`
- Card header pattern (14×18, border-bottom, 14.5/600)
- Chips (5 tones)
- Buttons (existing cva variants, restyled: `primary` = ink, `accent` = emerald with drop shadow, `outline`, `ghost`)
- Inputs (`.helix-field`)
- `DataTable` look for every `<table>`

Page-specific notes:

| Page | Notes |
|---|---|
| `/dashboard/contacts` | table + search input + `Empty` ("No contacts yet" / "لا جهات اتصال بعد") |
| `/dashboard/crm` | pipeline columns → cards radius 14, column header label style, stage totals `NumberFlow`; keep drag/drop logic |
| `/dashboard/queue` + `/dashboard/facts` | list items with chips; keep the evidence copy verbatim |
| `/dashboard/studio` | catalog cards → WC2.0 cards; neutral 32 px icon tile; USD prices from `templates.ts` unchanged |
| `/dashboard/integrations` | integration rows: name, status chip from the real `client_integrations.status`, connect button (existing) |
| `/dashboard/reports`, `/dashboard/engine` | charts → shadcn Chart if they're CSS bars now; otherwise token sweep only |
| `/dashboard/billing` | invoices table; overdue count chip (dg) from the existing overdue query |
| `/dashboard/support` | tickets list + form in cards |
| `/settings` | forms in cards; language preference row uses the same EN/عربي toggle |

### §6.8 Empty states — shadcn `Empty`, following the DESIGN-SPEC §1.11 formula

Every empty state has the same parts:
- a 48 px accent icon (plain; no coloured box)
- an H3 headline (15/600)
- one small line (13.5 muted)
- at most one action
- max width 360, padding 48, centred inside its card

Restyle `components/ui/helix/index.tsx` `EmptyState` to wrap `Empty`, keeping its props.

| Surface | Icon | Headline EN / AR | Line EN / AR | Action |
|---|---|---|---|---|
| Overview activity | Activity | No activity yet / لا نشاط بعد | Events from your systems appear here as they happen. / ستظهر هنا أحداث أنظمتك فور حدوثها. | Open Studio |
| Overview chart | BarChart3 | No activity in this period / لا نشاط في هذه الفترة | Try a longer range. / جرّب فترة أطول. | – |
| Lead Gen jobs (overview) | Target | No jobs yet / لا مهام بعد | Find businesses or enrich your own list. / ابحث عن شركات أو أثرِ قائمتك. | Start a job |
| Lead Gen results | Target | No leads yet / لا عملاء بعد | Start with Find leads or paste websites to enrich. / ابدأ بالبحث عن عملاء أو الصق مواقع لإثرائها. | Find leads |
| Search initial | Search | Search companies, people, or topics / ابحث عن شركات أو أشخاص أو مواضيع | Results from maps and the web, with sources. / نتائج من الخرائط والويب مع مصادرها. | – |
| Contacts | Users | No contacts yet / لا جهات اتصال بعد | Contacts appear when your systems capture them or you save leads. / تظهر جهات الاتصال عندما تلتقطها أنظمتك أو تحفظ عملاء. | Find leads |
| Queue | ListTodo | Nothing needs attention / لا شيء يحتاج متابعة | We'll list conversations that need a human here. / سنعرض هنا المحادثات التي تحتاج تدخلاً بشرياً. | – |
| Admin ledger | Gauge | No engine usage yet / لا استخدام للمحرك بعد | Usage appears after the first browser or unlocker run. / يظهر الاستخدام بعد أول تشغيل. | – |

Don't write "coming soon" (DESIGN-SPEC §1.13).

### §6.9 Toasts — Sonner

- Mount `<Toaster position={dir==='rtl' ? 'bottom-left' : 'bottom-right'} dir={dir} duration={5000} visibleToasts={3} />` once in `app-providers.tsx`.
- `toastOptions.classNames`:
  - toast: `bg-[#141414] text-[#F4F2ED] rounded-[14px] shadow-toast w-[380px] p-[14px_16px] border-0`
  - description: `text-[#C9C3B7] text-12.5`
  - actionButton: `bg-white/10 text-white rounded-[8px] h-7 px-2.5`
  - success icon: `#34E0A1`; error icon: `#F87171`
- Create a `lib/toast.ts` helper, `notify.success(titleKey, opts)`, that reads the current language. Copy lives in `features/*/copy.ts` or `components/shell/copy.ts`.
- Use toasts only for results of user actions and job completion. Never use them for marketing or tips.
- Replace existing `alert()` calls in dashboard code with toasts (`rg -n "alert\(" app/dashboard features components`).

### §6.10 Skeletons, loading, errors

- **`Skeleton`:** shadcn `Skeleton` restyled to the `.skel` class (1.5 s shimmer, static under reduced motion). At most 3 rows per block (DESIGN-SPEC §1.12).
- **`app/dashboard/loading.tsx` and `app/admin/loading.tsx`:** rebuilt with the header skeleton plus block skeletons. They render inside the persistent shell because the shell now lives in the layout.
- **Error boundary:** add `app/dashboard/error.tsx` and `app/admin/error.tsx` (client). A card with an `AlertTriangle` 48 px icon, "Something went wrong loading this page." / "حدث خطأ أثناء تحميل الصفحة.", and a "Try again" button that calls `reset()`. Show error digests only in dev.
- **No CLS:** every skeleton matches the final height (KPI tile 124 px, chart card 300 px, table row 44 px).

---

## §7 RTL / Arabic rules (dashboard)

1. **Direction** comes from `<html dir>`, set server-side from the `helix-lang` cookie. The topbar toggle changes it for the whole console (`setLanguage` → cookie + `router.refresh()`). Pages must not hold their own `dir` state; remove the local `dir` in LeadGenPage, keeping a fallback only.
2. **Sidebar:** `side="right"` in RTL. The rail sits at inline-start of the item, which puts it on the right edge in RTL. Tooltips open toward inline-end. Mobile sheets come from the right.
3. **Logical classes only.** After `shadcn migrate rtl`, run `rg -n "\b(ml|mr|pl|pr|left|right|border-l|border-r|rounded-l|rounded-r|text-left|text-right)-?" components/shell components/dashboard features app/dashboard app/admin` and fix every hit that isn't intentional.
4. **Numbers:** `formatNumber(n, lang)` uses `ar-AE`, which keeps Latin digits. NumberFlow uses `locales={lang==='ar'?'ar-AE':'en-US'}`. Dates use `Intl.DateTimeFormat(lang==='ar'?'ar-AE':'en-US', …)`, and relative times use `Intl.RelativeTimeFormat`.
5. **LTR islands** (`<bdi dir="ltr">` or `dir="ltr"` blocks): emails, phones, domains, URLs, job IDs, kbd, logs, code, the URL textarea, and charts.
6. **Arabic type:** letter-spacing 0, no uppercase labels (the label style drops `uppercase tracking-[.07em]` under `[dir=rtl]`), and body text 1 px larger (§3.3).
7. **Icons:** flip ChevronRight, ArrowRight, and ExternalLink-style arrows. Don't flip Play, Pause, Check, Clock, Search, or the brand mark.
8. **Tables** in RTL: column order mirrors naturally. Numeric columns align to inline-end. The score bar fills from inline-start.
9. **Copy:** every new string goes into a copy module with `en` and `ar` keys (`components/shell/copy.ts`, `components/dashboard/copy.ts`, or V2's `features/*/copy.ts`). Don't hard-code English in JSX.

## §8 Accessibility

- **Sidebar:** `nav aria-label="Console"`, `aria-current="page"` on the active item, a tooltip label for every item in collapsed mode, and ⌘B announced in the trigger's tooltip.
- **Skip link:** "Skip to content" / "تخطَّ إلى المحتوى" → `#main`.
- **Focus:** a 2 px `--ring` (emerald) outline plus a 2 px offset on all controls, and a 3 px ring on inputs. Never remove it.
- **Command palette:** focus is trapped and restored. `DialogTitle` "Command palette" is sr-only.
- **Mode cards** are a `RadioGroup` with arrow-key navigation.
- **Tables:** `<caption>` sr-only, sortable headers use `aria-sort`, row checkboxes carry labels ("Select {company}"), and the row click target is also reachable by keyboard (Enter opens detail).
- **Live regions:** there's one polite region per page for job stage changes and export results, since toasts are already announced by Sonner. The streaming log itself uses `aria-live="off"`.
- **Contrast:**
  - `--helix-muted #6E6A63` on `#F4F2ED` is about 4.8:1, which passes.
  - `--helix-subtle #9A958C` is about 2.7:1, so use it only for decorative/meta text ≥ 12 px paired with other cues, or switch those to muted. Labels (11.5 uppercase) use muted when they carry meaning.
  - Sidebar text `#A39F97` on `#161513` is about 7:1, which passes.
- **Charts:** `accessibilityLayer` on recharts, plus an sr-only table or summary sentence per chart ("Bookings by day, last 14 days: …").
- **Touch targets:** ≥ 36 px on desktop and ≥ 40 px on mobile (topbar buttons 36, mobile 40).

---

## §9 File-by-file change list

**New files**
- Shared foundation (skip if F0 already created it): `app/fonts.ts`, `lib/motion/{tokens,variants,features}.ts`, `hooks/use-reduced-motion-safe.ts`, `components/providers/{motion-provider,app-providers}.tsx`, `components/shell/language-context.tsx`, `lib/i18n/{server,format}.ts`
- Layouts and route files: `app/dashboard/{layout,template,error}.tsx`, `app/admin/{layout,template,error}.tsx`
- Shell: `lib/shell/{get-shell-context,features}.ts`, `components/shell/{app-sidebar,topbar,command-palette,shell-context,nav-config,copy}.tsx|ts`, `hooks/use-go-shortcuts.ts`
- Dashboard components: `components/dashboard/{kpi-tile,sparkline,activity-feed,systems-list,leadgen-jobs-card,range-toggle,chart-card,copy}.tsx|ts`
- Data and helpers: `lib/dashboard/overview-data.ts`, `components/ui/data-table.tsx`, `features/leadgen/stage-groups.ts`, `lib/toast.ts`
- shadcn: `components/ui/{direction,sidebar,command,dialog,sheet,sonner,chart,skeleton,empty,tabs,progress,toggle-group,breadcrumb,dropdown-menu,avatar,tooltip,checkbox,radio-group,kbd,separator,scroll-area,popover,drawer,item,spinner,input-group}.tsx`, `hooks/use-mobile.ts`

**Changed files**
- Config and globals: `app/layout.tsx`, `app/globals.css` (§3.1), `components.json`, `package.json`
- `components/shell/console-shell.tsx`: rebuilt, same props, idempotent
- `components/ui/helix/index.tsx`: `PageHeader`, `EmptyState`, `HelixKpi`, `Pill` restyle
- `components/ui/kpi-card.tsx`: delegate to `KpiTile`
- `app/dashboard/page.tsx`: layout + range param + new reads via `overview-data.ts`
- Loading states: `app/dashboard/loading.tsx`, `app/admin/loading.tsx`
- Lead Gen (restyle only, including the new V2 files): `features/leadgen/*.tsx`
- Search (restyle only, after V2 W2): `features/search/*.tsx`
- Admin: `components/admin/admin-tabs.tsx`, `app/admin/analytics/page.tsx` (charts islands), `app/admin/leadgen/page.tsx` (restyle + charts)
- Token sweep: every page listed in §6.6–§6.7
- `components/support/notification-bell.tsx`: button restyle only
- `components/realtime/realtime-provider.tsx`: **no change**; only consumed
- `docs/DESIGN-SPEC.md` (§10)

**Must not change**
- `features/leadgen/hooks/useLeadGenJob.ts`, `hooks/useLeadGenJob.ts`, `features/search/hooks/useSearch.ts`
- `app/api/**`, `lib/leadgen/**`, `lib/search/**`, `lib/schema.ts` types
- `supabase/migrations/**`, `proxy.ts`
- `lib/pricing/**` values, `data/pricing.json`, `lib/studio/templates.ts` values
- Marketing routes (owned by the Fronter prompt)

---

## §10 DESIGN-SPEC.md update text (paste into `docs/DESIGN-SPEC.md`)

> Bump the header to **v4 — 2026-09-25**. If the Fronter prompt already added §16–§18 and the §1.2/§1.3/§1.12 amendments, don't duplicate them. Add §19 plus the dashboard amendments below.

**Amend §1.2 Colour.** Accent family is emerald. Dashboard values:

| Token | Value |
|---|---|
| accent | `#0B6E4F` |
| accent-2 | `#12A579` |
| soft | `#E6F3EE` |
| info (running / in progress) | `#0E7490` / `#E3F2F6` |
| warn | `#B45309` / `#FDF1E1` |
| danger | `#B42318` / `#FCE8E6` |

Cyan `#0e8da6` is retired. No purple, violet or indigo.

**Amend §1.3 Type.**
- Families: Geist, Geist Mono, IBM Plex Sans Arabic.
- Minimum 13 px. The exception is 11.5–12.5 px, used for chips, uppercase labels, kbd and mono timestamps only.

**Amend §1.5 Radii.** chips 8 · controls 10 · cards 14 · dialogs/toasts/palette 16 · pills 999.

**Amend §1.8 Shells.**
- The console shell is the shadcn Sidebar: 248 px, collapsible to a 56 px icon rail (⌘B).
- Colours: ink `#161513`, text `#A39F97`, active `#2A2926`, with a 3 px `#34E0A1` rail at inline-start.
- Groups: primary / SYSTEMS / ACCOUNT for clients; AGENCY / INTELLIGENCE / ACCOUNT for admin.
- Topbar: 60 px, sticky, with breadcrumb, ⌘K trigger, EN/عربي segmented control and notifications.
- The shell lives in `app/dashboard/layout.tsx` and `app/admin/layout.tsx` and doesn't remount on navigation.
- Mobile uses the Sidebar's sheet. The earlier bottom tab bar idea is retired.

**Amend §1.9 Components.**
- Toasts (Sonner): bottom-right (bottom-left in RTL), ink `#141414`, 380 px wide, radius 14, 5 s, at most 3 visible.
- Command palette: shadcn Command in a Dialog, 640 px wide, 110 px from the top, scrim `rgba(20,20,20,.28)` + 2 px blur.
- Tables: shadcn Data Table pattern (TanStack), 13 px, 11.5 px uppercase header on `#FAF8F4`, selected row `#F3FAF6`, 25 rows per page.

**Amend §1.11 Empty states.** The formula is unchanged. They're implemented with shadcn `Empty`, and the icon is plain (no box).

**Amend §1.12 Bans (dashboard).**
- Still banned: gradients (except the skeleton shimmer and the modal scrim), glow, glass, coloured icon boxes in grids, and pie/donut charts.
- **Allowed exception:** a neutral 32 px icon tile (`#F4F2ED`, 1 px line, ink icon) at the start of list rows.

**Amend §5.1 Charts.**
- Sanctioned: bar, stacked bar, and line/area with a **flat** 10% fill.
- Sparklines are allowed only inside KPI tiles (104×36, no axes). They're still banned in tables.
- Time axes read LTR in both languages.
- Chart palette: `#0B6E4F`, `#7CCBB0`, `#D9D3C7`, `#0E7490`, `#B45309`.

**§19 Warm Command 2.0 — dashboard tokens**

| Token | Light | Dark (defined, not exposed) |
|---|---|---|
| canvas | `#F4F2ED` | `#0F0F0E` |
| surface | `#FFFFFF` | `#171715` |
| surface-2 | `#FAF8F4` | `#1D1D1A` |
| line / line-2 | `#E7E2D9` / `#D9D3C7` | `rgba(255,255,255,.08)` / `.14` |
| ink | `#141414` | `#EDEBE6` |
| muted / subtle | `#6E6A63` / `#9A958C` | `#A39F97` / `#76726B` |
| accent / soft | `#0B6E4F` / `#E6F3EE` | `#34D399` / `rgba(52,211,153,.12)` |
| info | `#0E7490` | `#38C6E0` |
| warn / danger | `#B45309` / `#B42318` | `#F5B455` / `#F87171` |
| sidebar | `#161513` · text `#A39F97` · active `#2A2926` · rail `#34E0A1` | same |

**Type:** page title 28/1.15/−0.03em/600 · card title 14.5/600 · body 14/1.5 · small 12.5 · label 11.5 uppercase +0.07em (EN only) · KPI 32/600 tabular · mono 11.5–12.5.

**Elevation:** borders first. Shadows only on popovers, toasts, dialogs and the palette.

**Motion:** §18. Page transitions are opacity + 4 px over 180 ms. Counters animate only on data changes.

**Honesty:**
- Every dashboard number is a real query result, "—" when it errors, or an empty state. Sample values never ship.
- "Live" appears only while realtime is connected.
- Unavailable providers are shown disabled with a reason.

---

## §11 Phased waves (one Antigravity run each) and acceptance checks

**Global checks, every wave:**
- `pnpm lint && pnpm exec tsc --noEmit && pnpm build` pass.
- `git diff --stat` shows **no changes** to:
  - `features/leadgen/hooks/*`, `features/search/hooks/*`
  - `app/api/**`, `lib/leadgen/**`, `lib/search/**`, `supabase/**`
  - `proxy.ts`
- There are no `SAMPLE DATA` chips or mockup numbers in `app/` or `components/`. Check with `rg -n "SAMPLE DATA|1,284|412 |Demo Dental|Pearl Smile" app components features`; it should return nothing outside `design-research`.
- Visual compare with the attached PNGs at 1440×900. RTL check with عربي selected. DevTools reduced-motion check.
- No keys, no new env vars.

### D0 · Foundations
**Scope:**
- §4 installs.
- §4.6 shared files (skip whatever F0 already made).
- §3.1 token values in place, plus the new tokens and the sidebar bridge fix.
- Root layout fonts, lang and dir.
- framer-motion → motion.

**Acceptance:**
- The whole console looks the same structurally but uses the new palette and Geist.
- The `helix-lang=ar` cookie produces `<html dir="rtl">` in the server HTML.
- `rg "framer-motion"` is empty.
- `package.json` has no vaul, @tremor/react or next-themes.
- The Lighthouse a11y score on `/dashboard` doesn't regress.

### D1 · Shell
**Scope:**
- §6.1: layouts + `get-shell-context`, idempotent ConsoleShell, `app-sidebar` (collapsible icon, groups, badges, `layoutId` rail, user menu), topbar (breadcrumb, ⌘K trigger, EN/عربي, bell), INTEL rail, mobile sheet.
- `template.tsx` transitions.
- Sonner Toaster.
- §6.2 palette with the PAGES group and the G-chords.

**Acceptance:**
- Matches the sidebar and topbar in `dashboard_overview.png`.
- Navigating between `/dashboard/*` pages doesn't remount the sidebar: the rail slides and scroll position is kept.
- ⌘B collapses the sidebar to icons with tooltips.
- The language toggle switches every page to RTL, with the sidebar on the right, and survives a reload.
- ⌘K opens the palette; `G L` goes to Lead Generation.
- There's no double shell on pages that still self-wrap.
- Admin shows no "DIRECTION 2 · WARM COMMAND".
- At 390 px the sidebar opens as a sheet.

### D2 · Overview
**Scope:** §6.3, i.e. `overview-data.ts`, KPI tiles with NumberFlow and flat sparklines, the activity-by-system chart, the systems list, the activity feed with realtime refresh, the Lead Gen jobs card with the evidence copy verbatim, the range toggle, and loading/empty states.

**Acceptance:**
- Every number matches a manual Supabase count for a test tenant (spot-check 2).
- Changing the range updates the numbers and they roll.
- With a brand-new tenant, empty states show and there are no fake numbers.
- "Live" shows only while connected.
- No `linearGradient` in chart code (`rg -n "linearGradient" components/dashboard`).
- CLS < 0.05 going from skeleton to content.
- Visual match with `dashboard_overview.png`, allowing for the documented replacements.

### D3 · Lead Generation (after V2 W1)
**Scope:** §6.4 restyle: status strip, mode cards, forms, advanced panel, job progress with the stage-group stepper and log, DataTable results with skeleton rows, export/CRM toasts, the history popover and the `[jobId]` page.

**Acceptance:**
- `git diff` of `useLeadGenJob.ts` is empty.
- An enrich job and a find job both run end to end exactly as before the restyle: same network calls in DevTools, same exports (.xlsx and CSV open correctly).
- An unavailable provider shows disabled with its reason.
- Empty cells show "—".
- At most 3 skeleton rows.
- In AR, domains, phones and logs stay LTR.
- Visual match with `dashboard_leadgen.png`.

### D4 · Search (after V2 W2) + palette content
**Scope:**
- §6.5 restyle.
- Nav Search item enabled (`lib/shell/features.ts`).
- Palette ACTIONS, RECENT JOBS and "Search the web for…".

**Acceptance:**
- `useSearch.ts` diff is empty.
- The query "dental clinics Dubai" renders tabs with counts, the provider row and result cards. Save ×3 shows a toast, and the leads appear in Lead Gen.
- ⌘S saves the selection without opening the browser's save dialog.
- The Watches card is absent before V2 W3.
- The palette's "Export last job" is disabled when there's no finished job.
- Visual match with `dashboard_search.png` and `dashboard_cmdk.png`.

### D5 · Admin, sweep and QA
**Scope:**
- §6.6 admin (tabs, analytics charts, leadgen usage charts).
- §6.7 sweep across all remaining pages.
- Remove per-page ConsoleShell wrappers where safe.
- Error boundaries.
- §10 DESIGN-SPEC text.

**Acceptance:**
- The §6.7 `rg` returns only intentional hits, listed in the summary.
- Admin charts render from the existing server data with no new queries.
- Keyboard-only walkthrough of the sidebar, palette, mode cards, table and export works.
- axe/Lighthouse a11y ≥ 95 on `/dashboard`, `/dashboard/lead-generation`, `/admin/analytics`.
- RTL pass on every page.
- Reduced motion: nothing moves, and skeletons are static.
- The DESIGN-SPEC diff shows v4 with §19.

---

## §12 Things NOT to do

**Data**
- No fake or sample numbers, logos, names or "SAMPLE DATA" chips in the product.
- Don't keep the mockup's "Median first reply", "channel" split or "Demo Dental" unless there's a real source.

**Logic and structure**
- Don't change V2 logic: hooks, API routes, exports, CRM upsert, job creation, provider selection, copy keys. Restyle only.
- Don't create `/dashboard/search`, `features/search/*`, `ModeTabs`/`EnrichForm`/`FindForm`, or Watches. V2 owns them.
- Don't change `proxy.ts`, migrations, RLS, `lib/schema.ts` or pricing values.
- Don't let shadcn overwrite `components/ui/button|input|card|badge|table|label`.

**Visual**
- No gradients, glow, glass, beams or shimmer buttons in the dashboard.
- No purple and no Sparkles icon.
- No pie or donut charts, and no sparklines inside tables.

**Libraries**
- Don't add @tremor/react, vaul, gsap, three, lenis, next-themes or a second chart library.

**Wording**
- Don't say "real-time" or "coming soon".
- "Live" is only allowed while realtime is connected.

**Security**
- Don't print, log or render secrets.
- Provider-off tooltips may name the env var (V2 rule) but never show its value.

---

## PASTE: Antigravity

```text
You are working in the Next.js 16 repo CultLeaderZiad/Helix-Ai: App Router, React 19, Tailwind v4 (@tailwindcss/postcss, no tailwind.config), shadcn style base-nova, Supabase, pnpm, build = "next build --webpack". Read AGENTS.md first. This Next.js differs from what you know, so check node_modules/next/dist/docs before touching layouts, template.tsx, cookies() or next/dynamic.

TASK
Redesign the client dashboard (/dashboard/*, /settings) and admin (/admin/*) to "Warm Command 2.0". Match these attached PNGs:
1) dashboard_overview.png: shell + Overview
2) dashboard_leadgen.png: Lead Generation
3) dashboard_search.png: Search
4) dashboard_cmdk.png: the ⌘K palette
Do ONLY the wave named on the last line, then stop, run the checks and report.

NON-NEGOTIABLES

1. Honesty
- The PNGs contain "SAMPLE DATA" chips and sample numbers. None of that ships.
- Every number comes from a real query. On error show "—". With no data show an empty state.
- There is no data source for "Median first reply" or "Conversations by channel". Replace them:
  - KPI 4 becomes "Open pipeline": the sum of open-stage deals.value_cents.
  - The chart becomes "Activity by system · last 14 days": stacked bars from the existing ACTIVITY_SOURCE per-system tables.
- Show "Live" only when useRealtime().connected is true.

2. Don't rewrite business logic
The Lead Gen v2 + Search logic belongs to a separate prompt, "V2". Do not change:
- features/leadgen/hooks/useLeadGenJob.ts
- features/search/hooks/useSearch.ts
- app/api/**, lib/leadgen/**, lib/search/**, supabase/**, lib/schema.ts, proxy.ts
- exports, CRM upsert, job creation, provider logic, V2 copy keys
Only change JSX, classNames, presentational components and motion.
Do not create /dashboard/search, features/search/*, ModeTabs/EnrichForm/FindForm or Watches yourself.
- Before V2 W1 exists: restyle whatever LeadGen components exist, keeping hooks and props.
- Before V2 W2 exists: skip Search.

3. No glow or gradients in the dashboard
- Flatten the mockup's gradient progress bars, sparkline areas (10% flat fill) and activity-row highlight.
- The only allowed animated gradient is the skeleton shimmer.
- No purple.
- Replace the Sparkles icon currently used in components/shell/console-shell.tsx.

4. Language
- EN + AR with one shared language state: the topbar EN/عربي toggle drives components/shell/language-context.tsx, which persists to cookie "helix-lang" + localStorage "helix.lang".
- <html lang dir> is set on the server from the cookie.
- Full RTL: sidebar on the right, logical CSS only.
- Latin digits via ar-AE. Emails, phones, domains, IDs and logs go in <bdi dir="ltr">.

5. Reduced motion everywhere
- <MotionConfig reducedMotion="user"> + hooks/use-reduced-motion-safe.ts + a CSS media query.
- Skeletons static, counters jump, no page transitions.

6. shadcn overwrites
When shadcn asks to overwrite components/ui/button|input|card|badge|table|label, answer No. Add any missing cva variants/sizes to the existing button instead.

7. No secrets, no new env vars.

TOKENS
Update app/globals.css :root values IN PLACE. Keep the existing --helix-* names and add the new ones.
- Sidebar:
  - --helix-sidebar #161513, sidebar-surface #1F1E1B, sidebar-active #2A2926, sidebar-border #2A2926, sidebar-muted #A39F97
  - new: sidebar-label #6D6A64, sidebar-sub #8A867F, sidebar-rail #34E0A1
- Surfaces and text:
  - canvas #F4F2ED, surface #FFFFFF, surface-2 #FAF8F4
  - border #E7E2D9, border-strong #D9D3C7
  - ink #141414, muted #6E6A63, subtle #9A958C
- Accent and status:
  - accent #0B6E4F, accent-2 #12A579, accent-soft #E6F3EE, selected #F3FAF6, cmd-highlight #F1F8F4
  - info #0E7490 / #E3F2F6, warn #B45309 / #FDF1E1, warn-dot #D97706, danger #B42318 / #FCE8E6
- Controls:
  - seg #EAE6DE, track #EEEAE2, skeleton #EFEBE3 → #F8F5F0
  - log #141414 / text #C9C3B7 / ts #6D6A64 / live #34E0A1
- Shadows:
  - card 0 1px 2px rgba(20,20,20,.03)
  - toast 0 20px 50px -12px rgba(0,0,0,.45)
  - dialog 0 30px 80px -20px rgba(0,0,0,.35)
  - scrim rgba(20,20,20,.28)
- Radii: chip 8, control 10, card 14, dialog 16.
- shadcn vars:
  - --ring = accent
  - --chart-1..5 = #0B6E4F #7CCBB0 #D9D3C7 #0E7490 #B45309
  - --sidebar-width 15.5rem, --sidebar-width-icon 3.5rem
  - --sidebar* use the ink palette; fix the @theme bridges so --color-sidebar* point to the --sidebar* vars
- Dark tokens: define them under [data-dash-theme="dark"] but don't expose them.
- Type (Geist, Geist Mono, IBM Plex Sans Arabic via the shared app/fonts.ts):
  - page title 28/600/-0.03em
  - card title 14.5/600
  - body 14/1.5 (via a .dash wrapper)
  - label 11.5 uppercase .07em (AR: 12.5, no uppercase)
  - KPI 32/600 tabular
  - mono 11.5–12.5

SHARED FOUNDATION
Create these if missing. If the marketing prompt already created them, reuse them.
- app/fonts.ts
- lib/motion/{tokens,variants,features}.ts: ease.out [0.16,1,0.3,1], spring 400/30, dashboard stagger .025 capped at 12
- hooks/use-reduced-motion-safe.ts
- components/providers/{motion-provider,app-providers}.tsx: DirectionProvider → LanguageProvider → LazyMotion + MotionConfig, plus the Sonner Toaster
- components/shell/language-context.tsx, API: useLanguage() → {language, setLanguage, toggleLanguage, dir, isArabic}
  - If V2 already created it, keep its names and add aliases.
- lib/i18n/{server,format}.ts

INSTALLS
- pnpm add motion @number-flow/react sonner cmdk @tanstack/react-table
- components.json: "rtl": true
- pnpm dlx shadcn@latest add direction sidebar command dialog sonner chart skeleton empty tabs progress toggle-group breadcrumb dropdown-menu avatar tooltip checkbox radio-group kbd separator scroll-area popover drawer item spinner
- pnpm dlx shadcn@latest migrate rtl components/ui
- Sidebar needs manual RTL: logical classes, side={dir==='rtl'?'right':'left'}.
- Remove next-themes from components/ui/sonner.tsx (use theme="light"), then remove the package.
- Verify there is no vaul.
- Migrate framer-motion → motion/react, then remove framer-motion.

SHELL (wave D1)
Layouts:
- Add app/dashboard/layout.tsx and app/admin/layout.tsx. Each does getVerifiedSession → redirect /login, then lib/shell/get-shell-context.ts (React cache) → {variant from role==='agency_admin', email, businessName from clients, attentionCount from attention_queue, falling back to the contact_facts pending count, else null} → <ConsoleShell/>.
- Make ConsoleShell idempotent: if a layout already mounted it (context), it renders only children. Keep its props {variant,email,businessName,children}.
- Add app/dashboard/template.tsx and app/admin/template.tsx: opacity 0→1 and y 4→0 over 180ms.

Sidebar: shadcn Sidebar collapsible="icon", 248px, ⌘B.
- Workspace card: "Helix AI" / "{businessName} · client", or "Agency · admin" for admin.
- Remove "DIRECTION 2 · WARM COMMAND".
- Client nav (EN/AR, lucide 16px stroke 1.75):
  - Overview · Search [New, only if /dashboard/search exists] · Lead Generation · Contacts · CRM · Attention queue [real count]
  - SYSTEMS: Studio · AI Engine · Integrations · Reports
  - ACCOUNT: Billing · Support · Settings
- Admin nav:
  - AGENCY: Clients · Pipeline · Systems · Search · Lead Generation
  - INTELLIGENCE: Intelligence · Reports · Analytics · Agent Queue
  - ACCOUNT: Support · Settings
  - Keep all existing href and match functions.
- Item style: 13.5px, #A39F97. Active: bg #2A2926, white text, with a 3px #34E0A1 rail at inline-start -12px via m.span layoutId.
- User card: initials avatar, dropdown with Settings and Sign out (the existing signOut form).

Topbar: 60px, sticky, rgba(244,242,237,.85) + blur 8.
- Breadcrumb: workspace / page.
- ⌘K trigger: 360×36, "Search or jump to…", with a ⌘K kbd.
- EN/عربي segmented control on track #EAE6DE.
- NotificationBell restyled to a 36px button.
- The INTEL tabs row appears only on intel routes, with a 2px ink underline driven by layoutId.

Palette: shadcn CommandDialog, 640px, radius 16, top 110px, scrim rgba(20,20,20,.28) + blur 2.
- Groups: PAGES (with G-chord shortcuts, e.g. G L = Lead Generation), ACTIONS, RECENT JOBS.
- Highlighted row: #F1F8F4.
- Footer: "↑↓ navigate · ↵ open".

Mobile: the Sidebar sheet.

OVERVIEW (wave D2)
Data and header:
- Put all reads in lib/dashboard/overview-data.ts. Keep the existing tenant-scoped queries and add ?range=7d|30d|90d with deltas against the previous period.
- Header sub-line: "{n} systems live · last event {relative}".
- Actions: 7d/30d/90d toggle, "Report", "+ New job".

KPI tiles:
- Grid of 4, gap 16, padding 16×18. Tiles:
  - Conversations handled: activities
  - Bookings created: bookings, non-cancelled
  - Leads found: leadgen_leads by client_id + created_at
  - Open pipeline
- NumberFlow animates value changes only; the SSR value renders immediately.
- 104×36 flat sparkline built from real daily buckets.

Cards:
- Chart card: 240px, wrapped in dir=ltr.
- Systems list: neutral 32px icon tiles, status chips from real fields, "Manage →".
- Activity feed: 6 latest activities. Throttled router.refresh() on realtime events. "Live" chip only while connected.
- Lead Gen jobs card: leadgen_jobs status/stage_index/stages_total/leads_count. Footer keeps the retained copy "{n} pending suggestion(s)." / "Nothing to review right now." / "Review now →".
- Empty states and skeletons: at most 3 rows, heights identical to the real content.

LEAD GEN (wave D3, after V2 W1; restyle features/leadgen/* only)
Header and status:
- Header sub-line: "Find businesses or enrich your own list. Every field shows where it came from — empty stays empty."
- "History · {n} jobs" popover.
- Status strip, from real health fields only: worker, engines chips, quotas, robots.txt.

Main grid (1fr 420px), left side:
- Two mode cards, "Enrich websites" / "Find leads", as a RadioGroup. Selected card: 1.5px accent border, #F3FAF6, 4px ring.
- Find input: 48px, radius 12.
- Source chips: an unavailable provider is disabled with V2's reason.
- HOW MANY: 10/20/40/60.
- Hunter checkbox.
- "› Advanced" collapsible.
- Accent "Find leads" button, 40px.

Main grid, right side: job progress.
- Status chip, NumberFlow %, 8px flat bar, Pause/Resume.
- 5-step stepper mapped from stages brief,seed,discover | fetch | extract,enrich | score,outreach | export (features/leadgen/stage-groups.ts).
- Log behind V2's "Show log": #141414, Geist Mono 11.5/1.8, #C9C3B7, last line #34E0A1, dir=ltr.

Results:
- components/ui/data-table.tsx (TanStack).
- Columns: Company+domain · Description (V2 field, else markdown_excerpt, else "Not found on the site") · Email · Phone · Socials · Location · Score (44px bar: ≥70 accent, ≥50 #D97706, else #C9C3B7) · Source.
- "—" for empty cells. At most 3 skeleton rows marked "enriching".
- Actions: Export .xlsx / CSV menu / ink "Send to CRM".
- Sonner toasts.

SEARCH (wave D4, after V2 W2; restyle features/search/* only)
- Search box: 52px, radius 14, region chip, ↵ kbd, accent Search button.
- Tabs with real counts and a layoutId underline.
- Provider dots: off providers are shown, not hidden.
- Results card header: "{n} results · sources · {s}s".
- Result cards with state-specific actions.
- "Load more".
- Rail:
  - Recent searches.
  - Watches only after V2 W3.
  - Dark selection card: "{n} selected ⌘S", mint "Save as leads" + "Enrich".
- Complete the palette ACTIONS/RECENT JOBS.

ADMIN + SWEEP (wave D5)
Admin pages:
- admin-tabs: underline tabs. The "Live" chip only when realtime is connected.
- /admin/analytics: shadcn Chart replaces the CSS bars, using the existing server data (dynamic chart islands).
- /admin/leadgen: replace cyan #0e8da6 with tokens. Progress vs cap (warn at ≥80%). Usage-by-day chart from the last 100 ledger rows, labelled as such. DataTable ledger.

Hex sweep:
- rg for #F3F1EC #FFFEFA #D9D4CB #1C1B19 #2B2A27 #9E9B95 #0e8da6 sky- cyan- purple- indigo- Sparkles across app/dashboard, app/admin, app/settings, components and features.
- Replace with tokens. Apply PageHeader, cards, chips, DataTable and Empty everywhere.

Also: error.tsx boundaries, and add DESIGN-SPEC v4 §19 Warm Command 2.0 plus the §1.x amendments.

WAVES
- D0 foundations/tokens/fonts/deps
- D1 shell/layouts/palette/toasts/transitions
- D2 Overview
- D3 Lead Generation restyle
- D4 Search restyle + palette content
- D5 admin + sweep + QA + DESIGN-SPEC

ACCEPTANCE (every wave)
- pnpm lint && pnpm exec tsc --noEmit && pnpm build pass.
- git diff shows no changes in: hooks (useLeadGenJob, useSearch), app/api, lib/leadgen, lib/search, supabase, proxy.ts.
- rg "SAMPLE DATA|Demo Dental|1,284" finds nothing in app/components/features.
- Visual match against the attached PNGs at 1440×900, allowing for the documented replacements.
- عربي switches the whole console to RTL and survives a reload.
- DevTools reduced motion: nothing moves.
- Keyboard works: sidebar, ⌘K, mode cards, table.
- The sidebar doesn't remount between /dashboard pages.

End with a summary covering:
- files changed
- every TODO(...) left
- any data slot you replaced or left empty, and why
- anything in V2 you needed but couldn't find

Run wave: D__
```
