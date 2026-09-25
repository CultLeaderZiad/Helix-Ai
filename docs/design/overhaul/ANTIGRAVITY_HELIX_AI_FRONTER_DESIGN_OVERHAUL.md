# ANTIGRAVITY — Helix AI "Fronter" (marketing site) Design Overhaul · Night Signal (dark default) + Daylight Paper (optional light)

> Repo: `CultLeaderZiad/Helix-Ai` (branch `main`) · Next.js 16.3 App Router · React 19 · Tailwind v4 (`@tailwindcss/postcss`, no tailwind.config) · Supabase · Vercel Hobby · live https://helix-ai-two.vercel.app/
> Prepared for Ziad Sabry, 2026-09-25. Grounded in `design-research/HELIX_DESIGN_RESEARCH.md` and the mockups in `design-research/*.png` + `design-research/html/*.css`.
> Sister prompt: `ANTIGRAVITY_HELIX_AI_DASHBOARD_DESIGN_OVERHAUL.md` (dashboards). Both prompts specify the shared foundation files **identically**. Whichever runs first creates them, and the other reuses them (§4.6).
> This prompt contains no API keys and must not add any.

---

## §0 How to use this prompt (read before pasting)

1. **One wave per Antigravity run** (§11). Run waves F0 → F5 in order. Don't paste the whole document and ask for everything at once.
2. **Attach these PNGs** from `design-research/` at the start of every marketing run, in this order. They're the visual target for Antigravity:
   1. `marketing_dark_hero.png`: hero, product window, integrations strip, live demo (primary target)
   2. `marketing_dark_sections.png`: catalog bento, how it works, pricing, testimonial slot, CTA, footer
   3. `marketing_ar_rtl_hero.png`: Arabic/RTL mirror of the hero
   4. `mobile_hero.png`: 390 px mobile hero
   5. For wave F4 (light theme) and F5 `/lead-gen` only: `marketing_light_hero.png`, then `marketing_light_sections.png`
3. **What to paste:** copy the block under **`## PASTE: Antigravity`** at the very bottom, then add one line: `Run wave F<n> only.` The paste block works on its own. The sections above it hold the full spec. If Antigravity needs more detail, paste the relevant section too (e.g. §6.2 for the hero wave).
4. **Coordination with the dashboard prompt:** F0 creates the shared foundations (fonts, motion, reduced-motion hook, language context, shadcn RTL). If the dashboard prompt's D0 already ran, F0 only **verifies** them and adds the marketing tokens.
5. **Coordination with `ANTIGRAVITY_HELIX_AI_SEARCH_PAGE_TINYFISH_LEADGEN_V2.md`:** the V2 prompt doesn't touch marketing routes. The only shared file is `components/shell/language-context.tsx`, which V2 W2 recommends. Keep its API exactly as §4.6 defines it. If V2 created the file first, extend it without renaming anything.
6. After each wave, run that wave's acceptance checks (§11), compare with the PNG side by side, then commit.

---

## §1 Goal and non-negotiables

**Goal.** Replace today's marketing look with **Night Signal**:

| Today | Night Signal |
|---|---|
| Sky-blue Lightfall on `#0B0F19` | Near-black canvas with an emerald/mint accent and a cyan glow partner |
| Inter / Space Grotesk | Geist type system |
| Three icon-box cards | Live product-window hero that shows exactly what an agent did, an honest integrations strip, a live-demo terminal, a systems bento, a 4-step "how it works", pricing from the real data, and a CTA to https://helixx.xo.je/build |
| Pill nav with Updates / Pricing / About | New site nav (§6.1) |

English and Arabic are both first-class, with full RTL. **Daylight Paper** (warm light) is an optional theme on the same component tree, switched through tokens.

**Non-negotiables (apply to every wave):**

1. **Honesty.**
   - No fake metrics, client logos, testimonials, uptime badges, or "trusted by".
   - Every demo number sits inside a demo surface with a visible label: a `SAMPLE RUN` / `DEMO SCRIPT` / `SAMPLE VALUE` / `example` chip.
   - The integrations strip is text wordmarks labelled **"integrations, not endorsements"**.
   - The testimonial area is a dashed placeholder, or hidden.
   - Remove the footer's pulsing "ALL SYSTEMS OPERATIONAL" badge and the "CRM, ERP" tagline.
2. **Never invent pricing.**
   - Plan prices come from `lib/pricing/tiers.ts` / `getPricingConfigs()` (`data/pricing.json`).
   - Per-system prices come from `lib/studio/templates.ts`.
   - Don't hard-code the mockup numbers or rename plans. The repo's third GCC plan is **Sovereign Scale**, not "Custom build".
   - **Pricing decision (owner, 2026-09-25): keep BOTH systems, clearly separated.** `/pricing` (and the home pricing teaser) = AED monthly plan tiers only. `/studio` (and the home systems catalog) = USD per-system setup + monthly only. Never mix currencies on one surface.
   - Label each so visitors understand the difference: on `/pricing` a caption "Monthly plans · AED" + a text link "Buying a single system? See per-system prices in Studio →" (`/studio`); on `/studio` a caption "Per-system pricing · USD · one-time setup + monthly" + a link "Prefer a bundled monthly plan? See plans in AED →" (`/pricing`). Provide AR copy for both (e.g. "الباقات الشهرية · درهم" / "تسعير لكل نظام · دولار · إعداد لمرة واحدة + شهري").
   - Remove every `TODO(pricing-reconcile)` marker; there is nothing left to reconcile.
3. **EN + AR.**
   - Every string exists in both languages in a typed copy file.
   - `<html lang dir>` is correct on first paint: a cookie drives it, and the wrong direction never flashes.
   - Arabic uses IBM Plex Sans Arabic, `letter-spacing: 0`, and taller line-heights.
4. **Reduced motion.** Every animated component honours `prefers-reduced-motion` through `useReducedMotionSafe()`, `<MotionConfig reducedMotion="user">`, and a CSS media query. Under reduced motion:
   - backgrounds are static gradients
   - the marquee is a static row
   - counters jump to their final value
   - streaming terminals render all lines at once
   - chat bubbles appear already complete
5. **Performance budget** (mobile Lighthouse on the live preview URL):
   - LCP < 2.5 s on simulated 4G, CLS < 0.05, TBT < 200 ms, Performance ≥ 90, Accessibility ≥ 95.
   - The LCP element is the H1 text. It's server-rendered, visible without JS, and the blur-in starts from `opacity:1` if JS is late (§5).
   - At most **one** WebGL canvas per page. It mounts only after `load` + idle, only at ≥1024 px, and never under reduced motion or `saveData`.
   - First-load motion JS ≤ 40 kB gzip: use `LazyMotion` + `m` in our components and lazy-load `domMax`.
   - Reserve space for everything below the fold (fixed heights or aspect ratios) so nothing shifts.
6. **Glow only on marketing.**
   - Gradients and glow are allowed on marketing routes only, in mint `#34E0A1` / cyan `#38C6E0` only.
   - No purple, violet, or indigo anywhere.
   - At most 2 glowing elements per viewport.
7. **Don't touch dashboard or admin code, or business logic, in this prompt:** `app/dashboard/**`, `app/admin/**`, `features/**`, `app/api/**`, `lib/leadgen/**`, `lib/search/**`.
8. **Next.js 16 caveat** (`AGENTS.md`): "This is NOT the Next.js you know". Read `node_modules/next/dist/docs` before using any Next API. `proxy.ts` replaces middleware. Check the semantics of `cookies()`, `next/font`, and `template.tsx` there.

---

## §2 Repo facts found (read via the GitHub API, 2026-09-25) and conflicts

| Area | Fact | Consequence |
|---|---|---|
| `package.json` | next 16.3.3, react ^19, tailwindcss ^4.3.3, **framer-motion ^13.2.0**, **ogl ^1.0.11**, lucide-react, cva, clsx, tailwind-merge, @supabase/ssr, @vercel/analytics. Script `build: next build --webpack`. pnpm. No test runner. | Add `motion`, `@number-flow/react`, `sonner`, `tw-animate-css`, plus whatever shadcn pulls in. Migrate framer-motion → `motion/react`, then remove framer-motion. |
| `components.json` | style **base-nova**, rsc, `css: app/globals.css`, baseColor neutral, aliases `@/components`, `@/components/ui`, `@/lib/utils`, `@/hooks`, lucide. **No `rtl` flag.** | Add `"rtl": true`, then run `pnpm dlx shadcn@latest add direction` and `pnpm dlx shadcn@latest migrate rtl`. base-nova is Base UI-based, so expect `@base-ui/react`. |
| `components/ui/` | Only `badge, button (custom cva), card, input, label, table, kpi-card, helix/index.tsx`. | `shadcn add` will ask to overwrite `button`/`input`/`card`/`badge`/`table`. **Answer No.** Keep the existing API (variants default/primary/secondary/outline/accent/ghost/destructive/link). Marketing buttons live in `components/marketing/mk-button.tsx`. |
| `app/globals.css` | `@import 'tailwindcss'`; `@custom-variant dark (&:is(.dark *))`; `@theme inline` with `--font-inter`, a text scale, `helix-*` colours (Warm Command v1: canvas `#F3F1EC`, accent `#0B6E4F`…), shadcn vars, radii 8/10/12/16/20/24. `.dark` maps back to light. | Add a **scoped** `.mk` token block (§3). Leave the `:root` dashboard values alone; the dashboard prompt changes them. |
| `app/layout.tsx` | Inter (`--font-inter`) + Space_Grotesk 700. `<html lang="en">` with a hard-coded `bg-[#F3F1EC]`. `viewport.colorScheme: 'light'`. JSON-LD, AuthHashHandler, Vercel Analytics. **No `dir`, no locale.** | F0: swap fonts, set `lang`/`dir` from a cookie, drop the hard-coded bg (move it to body via tokens), set `colorScheme: 'light dark'`. |
| Routing / i18n | **No `[locale]` segment, no i18n library, no route groups.** Each marketing page renders `PillNav` + `HelixFooter` itself. `PricingView` and `StudioWorkspace` keep local `en/ar` state and `dir`. | F0 creates an `app/(marketing)/` route group (URLs unchanged) with one shared layout + `MarketingShell`, and one cookie-driven language context. |
| `app/page.tsx` | bg `#0B0F19`; `LightfallCanvas` (sky); sky gradient CTA "Start free trial" → `/signup`; `LiveAgentTerminal`; 3 icon-box features; how-it-works; `FaqAccordion` (`getPublicFaqs`); `getNavAuth()`. | Rebuilt in F1–F3. Keep `getNavAuth()`, `getPublicFaqs()` + `FaqAccordion` (restyled, placed above the CTA), and the JSON-LD. |
| Nav | `components/navigation/pill-nav.tsx` (React Bits Pill Nav): "HLX AI", items Updates/Pricing/About, Console/"Get Started" → `/signup`, props `isAuthenticated`, `consoleHref`. | Replace with `components/marketing/site-nav.tsx`, keeping the same auth props. Delete `pill-nav.tsx` in F5 once nothing imports it. |
| Footer | `components/footer/helix-footer.tsx`: giant "HELIX AI" watermark, "The all-in-one business platform. CRM, ERP, and automation", a **fake "ALL SYSTEMS OPERATIONAL"** badge, links to dashboard routes and to `/about#careers`, `#terms`, `#privacy`. `/terms` and `/privacy` pages exist. | Rewrite (§6.8). |
| Background | `components/lightfall.tsx` (ogl): IO + visibility pause, DPR ≤ .85, **no reduced-motion check**. `lightfall-canvas.tsx` uses `dynamic(ssr:false)`. `components/Lightfall.css`. | Home stops using Lightfall. The hero becomes CSS glow/grid/rays at all sizes, plus an optional React Bits **Light Rays** (desktop, after idle). If Lightfall stays on any page, add the reduced-motion check. |
| Terminal | `components/terminal/live-agent-terminal.tsx`: no framer; **has** reduced-motion + IO pause; scripts system_1/2/11; "DEMO SCRIPT" badge. The content uses **real brand names** (`cl_aramco_012`, "Al-Futtaim Tech"), "Neogen Dynamics", "Dr. Tariq", deal values, purple/indigo tag colours, a `Sparkles` icon, and "Live Side Telemetry Mock". | Restyle and clean up (§6.3). Neutral example tenants only (`cl_demo`, "Example Dental Clinic"). No purple, no Sparkles. |
| framer-motion importers (confirmed) | `components/studio/studio-motion-demo.tsx` (motion, AnimatePresence, useInView, useReducedMotion; purple gradients, synthetic cursor, Sparkles) and `components/studio/studio-agent-ide.tsx` (motion, AnimatePresence). Others are unverified. | Run `rg -l "framer-motion" --glob '!node_modules'` and migrate **every** hit. |
| Studio | `app/studio/page.tsx` → `StudioWorkspace initialClientName="Al Noor Specialty Clinic"`. `components/studio/studio-workspace.tsx` shows USD setup/month from `lib/studio/templates.ts` (`setupFeeCents`, `monthlyRetainerCents`, `pricePrefix`, `lane: core|preview`, `highlight`, EN/AR content). `landing-demo.tsx` lazy-loads StudioMotionDemo (sky button). | F5 token + language-context pass. The home catalog bento reads `templates.ts`. |
| Pricing | See the pricing notes below this table. | Restyle only. Flag the questionable feature claims (listed below) and **don't** edit them. List them in the wave summary for Ziad. |
| Pages | about, updates, faq, contact, privacy, terms, team, signup, login, forgot/reset-password. **No public lead-gen page, no /how-it-works, no /systems.** `app/sitemap.ts` lists `/, /pricing, /updates, /about, /contact, /terms, /privacy`. | "How it works" → `/#how`. "Systems" → `/#systems`. New `/lead-gen` page in F5. It is deliberately not `/lead-generation`, to avoid confusion with `/dashboard/lead-generation`. Add `/studio`, `/lead-gen`, `/faq` to the sitemap. |
| `next.config.mjs` | images unoptimized; `experimental.optimizePackageImports: ['lucide-react']`; rewrites `/receptionist`, `/missed-call`, `/lead-reactivation`, `/ar-collections`, `/omni-care` → `/?system=…`. | Keep the rewrites. Home may read `searchParams.system` to preselect the live-demo system. Add `'motion'` and `'@number-flow/react'` to `optimizePackageImports` if the docs allow it. |
| `proxy.ts` | Matcher: `/login`, `/admin/*`, `/dashboard/*`, `/client/*`, `/api/((?!cron/).*)`. **Marketing routes aren't matched.** | Read the locale and theme cookies in **layouts** with `cookies()`, not in the proxy. Don't widen the matcher. |
| `docs/DESIGN-SPEC.md` v3 | §1.2 cyan accent `#0e8da6`; §1.3 Space Grotesk + Inter, 13 px minimum; §1.5 radii 6/8/12/16; §1.10 very limited motion; §1.12 bans gradients, glow, icon-in-box, glassmorphism, and sparkles; **no RTL section**; the last section is §15. | §10 adds §16 (marketing surfaces), §17 (typography + Arabic), and §18 (motion), and amends §1.2/§1.3/§1.10/§1.12. |

**Pricing notes (repo).**
- `app/pricing/page.tsx` renders `PricingView`, which gets `getPricingConfigs` → `data/pricing.json` via `lib/pricing/pricing-store.ts`. The store writes with fs, and Vercel's filesystem is read-only (side note).
- `lib/pricing/tiers.ts` values:

| Region | Plan | Monthly | Setup |
|---|---|---|---|
| GCC | Enterprise Starter | AED 1800 / SAR 1850 / USD 490 | AED 4500 / SAR 4600 / USD 1200 |
| GCC | **Growth Enterprise** (featured) | AED 4600 / SAR 4700 / USD 1250 | AED 7500 / SAR 7650 / USD 2000 |
| GCC | Sovereign Scale | AED 10200 / SAR 10500 / USD 2800 | AED 15000 / SAR 15500 / USD 4000 |
| MENA | SME Starter | EGP 9500 / JOD 175 / USD 250 | – |
| MENA | Business Accelerator (featured) | EGP 19500 / JOD 350 / USD 500 | – |
| MENA | Omni Operations | EGP 38000 / JOD 690 / USD 980 | – |

- Feature claims to flag, not edit: "Cryptographic Ground-Truth Evidence Ledger", "Dedicated Technical Account Manager in Dubai/Riyadh", "zero hallucinations", "99.9% uptime".

**Conflicts between the research/mockups and the repo, and how this prompt resolves them:**
1. **Accent.** DESIGN-SPEC says cyan, the shipped globals are emerald, and the research picks emerald. **Emerald wins.** Cyan is only the marketing glow partner.
2. **Fonts.** DESIGN-SPEC says Space Grotesk + Inter; the research says Geist + Geist Mono + IBM Plex Sans Arabic. **Geist wins.**
3. **Minimum text size.** DESIGN-SPEC sets 13 px, but the mockup uses 11.5–12.5 px for chips, kickers, kbd, and mono meta. **Exception:** 11.5–12.5 px only for chips, uppercase kickers/labels, kbd, and mono timestamps. Body stays ≥ 13 px. Arabic labels ≥ 12.5 px.
4. **Icon tiles and gradients.** §1.12 bans them, but the mockup's bento uses icon tiles and glow. Relaxed **for marketing only** (§16).
5. **Violet EGRESS tag.** The mockup terminal uses `#C4B5FD`. Recoloured to a neutral outline (§3.1).
6. **Third GCC plan.** The mockup shows "Custom build"; the repo has "Sovereign Scale". **Use the repo.** Add a "Custom build — Let's scope it" link row under the grid pointing to /build, with no price.
7. **Mockup prices** were copied from the live site as placeholders. **Always render from data.**
8. **No i18n infrastructure.** Introduce a minimal cookie + context system (no library, no URL prefix). A `/ar` URL prefix for Arabic SEO is out of scope; note it as future work.

---

## §3 Design tokens & typography

### §3.1 Marketing tokens: add to `app/globals.css` (scoped, so the dashboard stays untouched)

```css
/* ============ HELIX MARKETING TOKENS (M1 Night Signal / M2 Daylight Paper) ============ */
/* Scope: <div class="mk" data-theme="dark|light"> rendered by app/(marketing)/layout.tsx */
.mk, .mk[data-theme="dark"] {
  color-scheme: dark;
  --mk-bg: #07090C;         --mk-bg-2: #0B0E13;
  --mk-surface: #10141A;    --mk-surface-2: #161B23;
  --mk-line: rgba(255,255,255,.08);  --mk-line-2: rgba(255,255,255,.14);
  --mk-text: #F2F4F7;       --mk-muted: #9AA3B2;  --mk-subtle: #6B7482;
  --mk-accent: #34E0A1;     --mk-accent-ink: #04130D;
  --mk-accent-2: #38C6E0;   /* glow partner only — never a button */
  --mk-accent-soft: rgba(52,224,161,.08); --mk-accent-line: rgba(52,224,161,.35);
  --mk-warn: #F5B455;       --mk-danger: #F87171;
  --mk-band: #0B0E13;
  --mk-term-bg: #0B0D10;    --mk-term-text: #D5DBE3; --mk-term-ts: #56606F;
  --mk-bubble-in: #1B222C;  --mk-bubble-out: rgba(52,224,161,.12); --mk-bubble-out-line: rgba(52,224,161,.25);
  --mk-wordmark: #6F7887;   --mk-list-text: #C9D1DC;
  --mk-card-grad: linear-gradient(180deg, rgba(22,27,35,.9), rgba(14,17,22,.9));
  --mk-window-grad: linear-gradient(180deg, rgba(22,27,35,.95), rgba(12,15,20,.98));
  --mk-h1-grad: linear-gradient(180deg, #FFFFFF 30%, #A9B2C0);
  --mk-em-grad: linear-gradient(90deg, #34E0A1, #38C6E0);
  --mk-shadow-cta: 0 0 0 1px rgba(52,224,161,.5), 0 8px 30px -8px rgba(52,224,161,.55), inset 0 1px 0 rgba(255,255,255,.35);
  --mk-shadow-window: 0 40px 120px -30px rgba(0,0,0,.9), 0 -20px 80px -40px rgba(52,224,161,.35);
  --mk-shadow-card: none;
  --mk-btn-radius: 10px;    --mk-btn-radius-lg: 12px;
  --mk-r-sm: 8px; --mk-r-md: 12px; --mk-r-lg: 16px; --mk-r-xl: 24px;
  --mk-r-panel: 14px; --mk-r-window: 18px; --mk-r-card: 20px;
  --mk-nav-bg: rgba(16,20,26,.6);
  --mk-popular-bg: linear-gradient(180deg, #121A1A, #0E1216);
  --mk-popular-line: rgba(52,224,161,.45);
  --mk-cta-bg: radial-gradient(60% 80% at 50% 0%, rgba(52,224,161,.18), transparent 70%), linear-gradient(180deg, #10161A, #0B0E13);
  --mk-display-size: clamp(44px, calc(6vw + 8px), 76px);
  --mk-h2-size: clamp(32px, calc(3vw + 8px), 48px); --mk-h2-lh: 1.08; --mk-h2-ls: -0.035em;
  background: var(--mk-bg); color: var(--mk-text);
}
.mk[data-theme="light"] {
  color-scheme: light;
  --mk-bg: #F7F5F0;         --mk-bg-2: #F1EEE7;
  --mk-surface: #FFFFFF;    --mk-surface-2: #F1EEE7;
  --mk-line: #E6E1D7;       --mk-line-2: #D9D3C7;
  --mk-text: #121212;       --mk-muted: #5F5A52;  --mk-subtle: #8C867C;
  --mk-accent: #0B6E4F;     --mk-accent-ink: #FFFFFF;
  --mk-accent-2: #12A579;   /* accent-bright: checks, bars */
  --mk-accent-soft: #E3F3EC; --mk-accent-line: rgba(11,110,79,.30);
  --mk-warn: #A15C07;       --mk-danger: #B42318;
  --mk-band: #111214;       /* one dark demo band per page */
  --mk-bubble-in: #F1EEE7;  --mk-bubble-out: #E3F3EC; --mk-bubble-out-line: rgba(11,110,79,.25);
  --mk-wordmark: #A39C90;   --mk-list-text: #5F5A52;
  --mk-card-grad: #FFFFFF;  --mk-window-grad: #FFFFFF;
  --mk-h1-grad: none;       --mk-em-grad: none;   /* solid #111; em = accent + highlighter */
  --mk-shadow-cta: 0 10px 30px -10px rgba(11,110,79,.7);
  --mk-shadow-window: 0 1px 2px rgba(20,20,20,.04), 0 12px 32px -12px rgba(20,20,20,.10);
  --mk-shadow-card: 0 1px 2px rgba(20,20,20,.04), 0 12px 32px -12px rgba(20,20,20,.10);
  --mk-btn-radius: 999px;   --mk-btn-radius-lg: 999px;
  --mk-r-panel: 12px; --mk-r-window: 20px; --mk-r-card: 20px;
  --mk-nav-bg: rgba(247,245,240,.8);
  --mk-popular-bg: #141414; --mk-popular-line: #141414;
  --mk-cta-bg: #FFFFFF;
  --mk-display-size: clamp(44px, calc(6vw + 6px), 72px);
  --mk-h2-size: clamp(32px, calc(3vw + 10px), 50px); --mk-h2-lh: 1.06; --mk-h2-ls: -0.04em;
}
.mk .mk-display{font-size:var(--mk-display-size);line-height:1.02;letter-spacing:-0.045em;font-weight:600;text-wrap:balance}
.mk .mk-h2{font-size:var(--mk-h2-size);line-height:var(--mk-h2-lh);letter-spacing:var(--mk-h2-ls);font-weight:600;text-wrap:balance}
.mk .mk-lead{font-size:clamp(16.5px, calc(.6vw + 10px), 19px);line-height:1.55;color:var(--mk-muted)}
.mk .mk-kicker{font-family:var(--app-font-mono);font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:var(--mk-accent)}
.mk .mk-sample{font-family:var(--app-font-mono);font-size:10.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--mk-warn);border:1px dashed currentColor;border-radius:6px;padding:1px 6px}
.mk[data-theme="light"] .mk-sample{background:#FFF8EC}
/* Terminal tag chips (M1 mk-dark-term.css). EGRESS recoloured: no violet */
.mk .tag-in{background:rgba(56,198,224,.12);color:#7FDDF0}
.mk .tag-au{background:rgba(255,255,255,.07);color:#B6BFCC}
.mk .tag-rs{background:rgba(245,180,85,.12);color:#F5C27A}
.mk .tag-eg{background:rgba(255,255,255,.03);color:#E2E8F0;box-shadow:inset 0 0 0 1px rgba(255,255,255,.14)}
.mk .tag-ds{background:rgba(52,224,161,.12);color:#6EF0BD}
/* Arabic overrides */
[dir="rtl"] .mk .mk-display{font-size:clamp(38px, calc(5.4vw + 6px), 68px);line-height:1.3;letter-spacing:0;font-weight:700}
[dir="rtl"] .mk .mk-h2{font-size:clamp(28px, calc(2.6vw + 8px), 42px);line-height:1.3;letter-spacing:0;font-weight:700}
[dir="rtl"] .mk .mk-lead{font-size:clamp(17px, calc(.6vw + 10.5px), 20px);line-height:1.8}
[dir="rtl"] .mk .mk-kicker{font-family:var(--app-font-sans);font-size:12.5px;font-weight:600;letter-spacing:0;text-transform:none}
[dir="rtl"] .mk .mk-sample{font-family:var(--app-font-sans);font-size:11.5px;letter-spacing:0;text-transform:none}
[dir="rtl"] .mk :where(h1,h2,h3,p,span,a,li,button,label):not(.ltr):not([dir="ltr"] *){letter-spacing:0}
@media (prefers-reduced-motion: reduce){
  .mk *, .mk *::before, .mk *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
}
```

Append a Tailwind v4 bridge inside the existing `@theme inline { … }`. Don't delete any existing keys:

```css
@theme inline {
  --color-mk-bg: var(--mk-bg); --color-mk-bg-2: var(--mk-bg-2);
  --color-mk-surface: var(--mk-surface); --color-mk-surface-2: var(--mk-surface-2);
  --color-mk-line: var(--mk-line); --color-mk-line-2: var(--mk-line-2);
  --color-mk-text: var(--mk-text); --color-mk-muted: var(--mk-muted); --color-mk-subtle: var(--mk-subtle);
  --color-mk-accent: var(--mk-accent); --color-mk-accent-ink: var(--mk-accent-ink); --color-mk-accent-2: var(--mk-accent-2);
  --color-mk-accent-soft: var(--mk-accent-soft); --color-mk-warn: var(--mk-warn); --color-mk-danger: var(--mk-danger);
  --radius-mk-btn: var(--mk-btn-radius); --radius-mk-btn-lg: var(--mk-btn-radius-lg);
  --radius-mk-panel: var(--mk-r-panel); --radius-mk-window: var(--mk-r-window); --radius-mk-card: var(--mk-r-card);
  --shadow-mk-cta: var(--mk-shadow-cta); --shadow-mk-window: var(--mk-shadow-window); --shadow-mk-card: var(--mk-shadow-card);
  --text-mk-h3: 20px; --text-mk-h3--line-height: 1.3; --text-mk-h3--letter-spacing: -0.02em; --text-mk-h3--font-weight: 600;
  --text-mk-body: 15px; --text-mk-body--line-height: 1.6;
  --text-mk-small: 13px; --text-mk-small--line-height: 1.5;
  --text-mk-chip: 11.5px; --text-mk-mono: 12.5px;
}
```

**Components cheat-sheet** (from `html/mk-dark.css`, exact values):

| Component | Spec |
|---|---|
| Nav | Height 72. Brand 17px/600/−.01em. Mark tile 30px, radius 9, `linear-gradient(180deg,#1b2530,#0d1117)`. |
| Nav pill group | padding 4, radius 999, `--mk-nav-bg` + blur 8. Links 13.5px, padding 7×14; active `rgba(255,255,255,.06)`. |
| Lang pill | 12.5px |
| Buttons | h40, px16, radius 10, 14px/500. **lg:** h48, px22, 15px, radius 12. Ghost: border `--mk-line-2`, bg `rgba(255,255,255,.03)`. Light theme: pill radius, lg h50 px24. |
| Chip | 11.5px, padding 3×9, radius 999. `acc` = mint .08 bg / .35 border / accent text. `warn` = amber .08 / .35. `cy` = cyan .08 / .35 (label chips only, never CTA). Light `dk` = `#141414` bg / white text. |
| Panel | `--mk-surface`, radius 14, border `--mk-line`, padding 16. Label 11px/.1em uppercase `--mk-subtle`. |
| Step icons | 24px circles. Done: mint .12 bg. Running: cyan border + 3px ring. |
| Bubbles | 14px/1.6, radius 14. In `#1B222C`; out mint .12 / .25 border. |
| Card | radius 20, `--mk-card-grad`, padding 26. Spotlight radial 420px mint .14. |
| Icon tile | 40px, radius 11, mint gradient. |
| Waveform bars | 4px wide |
| Plans | grid `1fr 1.08fr 1fr`, gap 16, padding 28, radius 20. Price 40px/600. List 14px `--mk-list-text`. |
| CTA card | padding 64, H2 44px |
| Section | padding 112px 0. H2 48px. Section p 17px/1.6, max 620. |

### §3.2 Fonts (shared foundation, identical in the dashboard prompt)

Create **`app/fonts.ts`**:
```ts
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google'
export const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' })
export const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' })
export const plexArabic = IBM_Plex_Sans_Arabic({ subsets: ['arabic'], weight: ['400','500','600','700'], variable: '--font-plex-ar', display: 'swap' })
export const fontVars = `${geist.variable} ${geistMono.variable} ${plexArabic.variable}`
```
In `app/layout.tsx`, remove `Inter` and `Space_Grotesk` and put `fontVars` on `<html>`. In `globals.css`:
```css
:root { --app-font-sans: var(--font-geist), var(--font-plex-ar), ui-sans-serif, system-ui, sans-serif;
        --app-font-mono: var(--font-geist-mono), ui-monospace, SFMono-Regular, monospace; }
[dir="rtl"] { --app-font-sans: var(--font-plex-ar), var(--font-geist), ui-sans-serif, system-ui, sans-serif; }
@theme inline { --font-sans: var(--app-font-sans); --font-mono: var(--app-font-mono);
                --font-inter: var(--app-font-sans); --font-space-grotesk: var(--app-font-sans); /* legacy aliases: remove once rg finds no users */ }
body { font-family: var(--app-font-sans); }
.tabular, [data-numeric] { font-variant-numeric: tabular-nums; }
```
Check how `@theme inline` currently declares `--font-sans`. If it's `--font-sans: var(--font-inter)`, replace it with the line above.

### §3.3 Arabic typography (marketing)

| Role | EN | AR (`[dir=rtl] .mk …`) |
|---|---|---|
| Display H1 | 76/1.02/−0.045em/600 (mobile 44/1.04/−0.04em) | **68/1.3/0/700** (mobile 38/1.3/0/700) |
| H2 | 48/1.08/−0.035em/600 | 42/1.3/0/700 |
| H3 / card title | 20/1.3/−0.02em/600 | 20/1.5/0/700 |
| Lead | 19/1.55 (mobile 16.5) | **20/1.8** (mobile 17/1.8) |
| Body | 15/1.6 | 16/1.8 |
| Nav link | 13.5 | **14.5** |
| Kicker | 12px Geist Mono, uppercase, .14em | **12.5px Plex Arabic 600, no uppercase, no tracking**, accent colour |
| Chat bubble | 14/1.6 | **15/1.7** |
| Step titles | 14 | 14.5 |

Latin islands (domains, phones, code, logs) keep Latin tracking inside `bdi[dir=ltr]` / `.ltr`.

---

## §4 Dependencies & installs

Run these in F0 and skip anything that's already present.

### §4.1 npm
```bash
pnpm add motion @number-flow/react sonner
pnpm add -D tw-animate-css   # only if shadcn didn't add it
# framer-motion is removed at the end of F0, after all imports are migrated (§4.4)
```

### §4.2 shadcn (RTL first)
```bash
# 1) components.json → add  "rtl": true   (keep style base-nova, aliases unchanged)
pnpm dlx shadcn@latest add direction          # components/ui/direction.tsx (DirectionProvider)
pnpm dlx shadcn@latest add toggle-group tabs sheet dialog tooltip accordion navigation-menu kbd separator
pnpm dlx shadcn@latest migrate rtl components/ui   # physical → logical classes (ms-/me-/start-/end-)
```
- **Don't overwrite existing files.** When the CLI asks to overwrite `button.tsx`, `input.tsx`, `card.tsx`, `badge.tsx`, `table.tsx`, or `label.tsx`, answer **No**. If a new component imports `@/components/ui/button` with a variant the custom cva lacks, add that variant to the existing cva instead of replacing the file.
- **Known RTL issue** (shadcn RTL docs, https://ui.shadcn.com/docs/rtl): the `tw-animate-css` logical slide utilities misbehave. Pass `dir={dir}` to portal content (`SheetContent`, `TooltipContent`, `DialogContent`, `PopoverContent`).
- Docs: https://ui.shadcn.com/docs/rtl/next, https://ui.shadcn.com/docs/components/toggle-group, https://ui.shadcn.com/docs/components/sheet, https://ui.shadcn.com/docs/components/accordion, https://ui.shadcn.com/docs/components/tabs

### §4.3 Copy-paste components (shadcn registry namespaces, all verified 2026-09-25)

Install into `components/magicui/`, `components/reactbits/`, `components/aceternity/`, either with `--path` or by moving the files after install. Then **edit each file**:
- add the reduced-motion guard
- swap `motion.` for `m.` where possible
- remove physical `left/right` positioning

| Use | Install | Docs URL | Deps (per registry JSON) |
|---|---|---|---|
| "New" pill shine | `pnpm dlx shadcn@latest add @magicui/animated-shiny-text` | https://magicui.design/docs/components/animated-shiny-text | none |
| Product-window beam, popular plan | `pnpm dlx shadcn@latest add @magicui/border-beam` | https://magicui.design/docs/components/border-beam | motion |
| Pipeline connector in the window | `pnpm dlx shadcn@latest add @magicui/animated-beam` | https://magicui.design/docs/components/animated-beam | motion |
| WhatsApp bubbles | `pnpm dlx shadcn@latest add @magicui/animated-list` | https://magicui.design/docs/components/animated-list | motion |
| Section reveal | `pnpm dlx shadcn@latest add @magicui/blur-fade` | https://magicui.design/docs/components/blur-fade | motion |
| Popular plan border | `pnpm dlx shadcn@latest add @magicui/shine-border` | https://magicui.design/docs/components/shine-border | none |
| Final CTA (one per page) | `pnpm dlx shadcn@latest add @magicui/shimmer-button` | https://magicui.design/docs/components/shimmer-button | none |
| Light-theme hero dots | `pnpm dlx shadcn@latest add @magicui/dot-pattern` | https://magicui.design/docs/components/dot-pattern | none |
| Marquee (fallback to Logo Loop) | `pnpm dlx shadcn@latest add @magicui/marquee` | https://magicui.design/docs/components/marquee | none |
| Headline word blur | `pnpm dlx shadcn@latest add @react-bits/BlurText-TS-TW` | https://reactbits.dev/text-animations/blur-text | motion |
| Integrations strip | `pnpm dlx shadcn@latest add @react-bits/LogoLoop-TS-TW` | https://reactbits.dev/animations/logo-loop | none |
| Bento card spotlight | `pnpm dlx shadcn@latest add @react-bits/SpotlightCard-TS-TW` | https://reactbits.dev/components/spotlight-card | none |
| Desktop hero rays (optional WebGL) | `pnpm dlx shadcn@latest add @react-bits/LightRays-TS-TW` | https://reactbits.dev/backgrounds/light-rays | ogl (present) |
| How-it-works line | `pnpm dlx shadcn@latest add @aceternity/timeline` | https://ui.aceternity.com/components/timeline | motion |
| "Watch a live run" video (only once a real recording exists) | `pnpm dlx shadcn@latest add @magicui/hero-video-dialog` | https://magicui.design/docs/components/hero-video-dialog | – |

**Deliberately not installed:**
- Magic UI **Bento Grid** (https://magicui.design/docs/components/bento-grid). It pulls in `@radix-ui/react-icons`, so build the 6-column grid by hand. It's only CSS grid.
- Aceternity **Animated Testimonials** (https://ui.aceternity.com/components/animated-testimonials). Add it only after real, named quotes exist.
- React Bits **Soft Aurora** (https://reactbits.dev/backgrounds/soft-aurora). It's an alternative to Light Rays; don't ship both.

**If a namespace install fails** (the registry health check reported Aceternity as "degraded" on 2026-09-25), use the direct URL instead:
- `pnpm dlx shadcn@latest add https://ui.aceternity.com/registry/timeline.json`
- `https://magicui.design/r/<name>.json`
- `https://reactbits.dev/r/<Name>-TS-TW.json`

**Licences:** Magic UI is MIT. React Bits is MIT + Commons Clause, which is fine for use inside Helix. Aceternity's free tier is "free", but I found no explicit licence text, so use it inside Helix and don't redistribute it.

### §4.4 framer-motion → Motion migration
```bash
rg -l "framer-motion" --glob '!node_modules' --glob '!pnpm-lock.yaml'
# for each hit: from 'framer-motion'  →  from 'motion/react'  (same APIs: motion, AnimatePresence, useInView, useReducedMotion, useScroll, useTransform, LayoutGroup)
pnpm remove framer-motion && pnpm build
```
- Confirmed hits: `components/studio/studio-motion-demo.tsx`, `components/studio/studio-agent-ide.tsx`. Guide: https://motion.dev/docs/react-upgrade-guide
- Every client component that renders `motion.*` needs `'use client'`.
- In new components, prefer `m.*` under `LazyMotion` (https://motion.dev/docs/react-lazy-motion, https://motion.dev/docs/react-reduce-bundle-size).

### §4.5 Never install
- **Animation engines and scrolling:** gsap, three / @react-three/*, lenis.
- **Packages:** vaul, @tremor/react.
- **Effects:** any cursor effect; React Bits Split/Decrypted/Scrambled/Shuffle/Glitch/Fuzzy/ASCII text; React Bits Magic Bento (it needs gsap); Magic UI Hyper Text / Sparkles Text / Morphing Text / Meteors / Confetti / Globe; Aceternity 3D/GitHub Globe, Wavy Background, Vortex, Sparkles.

### §4.6 Shared foundation files

Both prompts specify these identically. Create them if they're missing; if they exist, verify and keep them.

1. **`lib/motion/tokens.ts`**
```ts
export const ease = { out: [0.16, 1, 0.3, 1] as const, std: [0.2, 0.8, 0.2, 1] as const, in: [0.4, 0, 1, 1] as const }
export const dur = { hover: 0.14, pop: 0.2, dialog: 0.18, page: 0.18, reveal: 0.7, counter: 0.9, ambient: 12 }
export const spring = { pill: { type: 'spring', stiffness: 400, damping: 30 } as const }
export const stagger = { dash: 0.025, dashCap: 12, mk: 0.07 }
```
2. **`lib/motion/variants.ts`** exports:
   - `fadeUp(dirSign)`
   - `blurFade`: `{hidden:{opacity:0,y:16,filter:'blur(6px)'}, show:{opacity:1,y:0,filter:'blur(0px)',transition:{duration:dur.reveal,ease:ease.out}}}`
   - `staggerContainer(step, delay)`
   - `scaleIn`: .98 → 1, 160 ms
   - `pageTransition`: opacity 0 → 1, y 4 → 0, 180 ms
   - `slideInline(dirSign, px = 12)`
3. **`lib/motion/features.ts`**: `export { domMax as default } from 'motion/react'` (lazy-loaded).
4. **`hooks/use-reduced-motion-safe.ts`**:
   - Returns `true` during SSR and until mounted, so the first paint is static. After mount it returns `useReducedMotion() ?? false`.
   - Also exports `useAmbientAllowed()`. It's true only when all of these hold: viewport ≥ 1024, reduced motion is off, `navigator.connection?.saveData !== true`, and the document is visible.
5. **`components/providers/motion-provider.tsx`** (`'use client'`):
   ```tsx
   <LazyMotion features={() => import('@/lib/motion/features').then(m => m.default)}>
     <MotionConfig reducedMotion="user" transition={{ ease: ease.out }}>{children}</MotionConfig>
   </LazyMotion>
   ```
   Docs: https://motion.dev/docs/react-motion-config
6. **`components/shell/language-context.tsx`** (`'use client'`; the V2 prompt recommends the same file).
   - **API:**
     - `type Lang = 'en' | 'ar'`
     - `LanguageProvider({ initialLang, children })`
     - `useLanguage(): { language: Lang; setLanguage(l: Lang): void; toggleLanguage(): void; dir: 'ltr'|'rtl'; isArabic: boolean }`
     - `useDirSign(): 1 | -1`
   - **`setLanguage`:**
     1. writes `localStorage['helix.lang']` **and** the cookie `helix-lang` (path `/`, 1 year, SameSite=Lax)
     2. sets `document.documentElement.lang` and `dir`
     3. calls `router.refresh()` so server components re-render in the new language
   - **On mount:** if localStorage disagrees with the cookie, localStorage wins (that's how V2 pages stored the choice) and the cookie is synced.
   - **If V2 already created this file** with different member names, add these as aliases. Never rename or remove what's there.
7. **`lib/i18n/server.ts`** exports:
   - `getLang(): Promise<Lang>`, which returns `(await cookies()).get('helix-lang')?.value === 'ar' ? 'ar' : 'en'`
   - `dirOf = (l) => l === 'ar' ? 'rtl' : 'ltr'`
   - `formatNumber(n, lang, opts)`, using `ar-AE` for AR (Latin digits) and `en-US` for EN

   `lib/i18n/format.ts` holds the same `formatNumber` for client use.
8. **`components/providers/app-providers.tsx`** (`'use client'`) nests `DirectionProvider` (from `@/components/ui/direction`, `direction={dir}`) → `LanguageProvider` → `MotionProvider`.
9. **Root `app/layout.tsx`**:
   - `const lang = await getLang()`, then `<html lang={lang} dir={dirOf(lang)} className={fontVars} suppressHydrationWarning>`.
   - Remove `bg-[#F3F1EC]` from `<html>`. The body gets `bg-helix-canvas` for the dashboard; the marketing `.mk` wrapper paints its own background.
   - `viewport`: `colorScheme: 'light dark'`, `themeColor: [{ media:'(prefers-color-scheme: dark)', color:'#07090C' }, { color:'#F4F2ED' }]`.
   - Keep the JSON-LD, AuthHashHandler, and Analytics.
   - **Caching:** calling `cookies()` in the root layout makes routes dynamic. Home already calls `getNavAuth()`, which is cookie-bound, so this is acceptable. Check the route table from `next build` and report any page that flipped from ○ static to ƒ dynamic.

---

## §5 Motion system (marketing)

| Element | Duration | Easing | Rule |
|---|---|---|---|
| Hover/press/colour | 120–150 ms | `ease.std` | Press `scale: .98`. On hover the CTA glow grows to `0 0 0 1px rgba(52,224,161,.6), 0 12px 40px -8px rgba(52,224,161,.7)`. |
| Section reveal (`BlurFade`) | 700 ms | `ease.out` | y 16 → 0, blur 6 → 0, `once`, viewport margin `-10%`. |
| Hero headline (`BlurText`) | ~700 ms total | `ease.out` | Always `animateBy="words"` (EN and AR), 60 ms per word. The SSR H1 is visible; animate only after hydration. |
| Sub / CTAs / micro | 500 ms | `ease.out` | Delays 0.3 / 0.4 / 0.5 s. |
| Product window | 800 ms | `ease.out` | Rises 24 px, delay 0.45 s. `BorderBeam` loops every 8 s (duration 8, size 120, colorFrom `#34E0A1`, colorTo `#38C6E0`). |
| Pipeline steps | 400 ms per step | `ease.out` | `AnimatedBeam` between step icons. The running node has a 2 s pulse ring. |
| Chat bubbles | 1.2 s apart | – | `AnimatedList`, then typing dots, then **freeze** (no infinite loop). Restart only if the window re-enters the viewport after more than 30 s. |
| "4.2s" value | 1 s | – | `NumberFlow` from 0 with `format={{ minimumFractionDigits:1, maximumFractionDigits:1 }}` and suffix `s`. |
| Intent bar | 600 ms | `ease.out` | Width 0 → 72%. |
| Integrations | 40 s/loop (desktop), 30 s (mobile) | linear | `LogoLoop` with `pauseOnHover`. The track is `dir="ltr"`; in AR set `direction="right"`. |
| Terminal stream | 90–140 ms/line | – | Pause off-screen or when the tab is hidden. Replay button. With reduced motion, show all lines at once. |
| Tabs/segmented pills | spring 400/30 | – | Motion `layoutId`. |
| Bento cards | 80 ms stagger | `ease.out` | Plus `SpotlightCard` (`spotlightColor="rgba(52,224,161,.14)"`, 420 px radial). **Disabled on `(hover:none)`**. |
| Waveform bars | 1.2 s | ease-in-out | CSS keyframes, only while in view (`animation-play-state`). |
| How-it-works | scroll-linked | – | The `Timeline` line draws; on mobile it's a static vertical list. |
| Price change | 600 ms | – | `NumberFlow` with `locales` (en-US / ar-AE) and `format={{ style:'currency', currency, maximumFractionDigits:0 }}`. |
| Popular plan | 6 s loop | linear | `ShineBorder` with `shineColor={['#34E0A1','#38C6E0']}`. |
| Final CTA | 2.5 s | linear | `ShimmerButton`, one per page. |
| Ambient WebGL | ≥ 12 s | linear | `LightRays` with `raysColor="#8CFFD6"`, `raysOrigin="top-center"`, low `raysSpeed`, `followMouse={false}`. Pause off-screen or when hidden. |

**Reduced motion.** Every animated component reads `useReducedMotionSafe()` and renders its **end state**, on top of `MotionConfig reducedMotion="user"`. End state means:
- full text, full bars, and all bubbles
- the marquee as a static row with `flex-wrap`
- no WebGL, no beam, no shine

Test it in Chrome DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce".

**RTL mirroring.**
- Multiply every x offset by `useDirSign()`.
- `AnimatedBeam` is ref-based, so its geometry mirrors on its own. Add `reverse` in RTL so the pulse travels toward the reading end.
- `BorderBeam`: add `reverse` in RTL.
- `AnimatedShinyText`: reverse the animation under `[dir=rtl]`.
- Progress bars grow from inline-start (`transform-origin: right` under rtl, or width on a flex child).
- Flip arrows and chevrons with `rtl:rotate-180`. **Never flip** play, check, clock, the Helix mark, or phone numbers.

---

## §6 Page-by-page spec (keyed to the PNGs)

All marketing pages live in `app/(marketing)/`. `app/(marketing)/layout.tsx` renders:

```tsx
<div className="mk min-h-dvh" data-theme={theme}>
  <SiteNav/>
  <main id="main">{children}</main>
  <SiteFooter/>
</div>
```

- `theme` comes from the cookie `helix-mk-theme` (`'dark'|'light'`, default `'dark'`), plus the inline no-flash script from §6.9.
- Container: `mx-auto max-w-[1200px] px-8` (mobile `px-5`).
- Section: `py-28` (112 px), mobile `py-20`.

**Copy.** Strings live in **`content/marketing/copy.ts`**:
- `export const copy = { en: {...}, ar: {...} } as const` with `type Copy = typeof copy.en`.
- Use `satisfies` so `ar` has every key.
- Server components read `copy[await getLang()]`.

### §6.1 Site nav — `components/marketing/site-nav.tsx`
Reference PNGs: the top of `marketing_dark_hero.png`, `marketing_ar_rtl_hero.png`, `mobile_hero.png`.

- **Layout.** Sticky top, height 72. Once scrolled past 8 px, add `backdrop-blur-[8px]` + `bg-[color-mix(in_srgb,var(--mk-bg)_70%,transparent)]` and a bottom border in `--mk-line`. Three zones: brand (start) · centred pill group · actions (end).
- **Brand.**
  - `HelixMark` (`components/brand/helix-mark.tsx`) in a 30 px tile: radius 9, `linear-gradient(180deg,#1b2530,#0d1117)`, 1 px `--mk-line-2`.
  - Wordmark "Helix", 17 px/600/−.01em.
  - Light theme: tile is `#141414`.
- **Pill group (dark).**
  - Container: `p-1 rounded-full border border-mk-line bg-[var(--mk-nav-bg)] backdrop-blur-[8px]`.
  - Links: 13.5 px, padding 7×14, radius 999, `--mk-muted`; hover `--mk-text`.
  - Active link: `--mk-text` on a Motion `layoutId="mk-nav-pill"` background of `bg-white/6`.
  - Light theme: plain text links, gap 28, 14 px, no pill container.

**Items (EN / AR / target):**

| EN | AR | Target |
|---|---|---|
| Systems | الأنظمة | `/#systems` |
| Lead Gen | توليد العملاء | `/lead-gen` (until F5 lands: `/#systems`) |
| How it works | كيف نعمل | `/#how` |
| Pricing | الأسعار | `/pricing` |
| Studio | الاستوديو | `/studio` |

The active state comes from `usePathname()` plus an IntersectionObserver on `#systems` / `#how` when on `/`.

**Actions (end zone):**
1. **Language pill.** 12.5 px segmented `EN | عربي`, active side `bg-white/8`, `aria-label="Language"`. Calls `setLanguage`.
2. **Theme toggle (F4).** 36 px ghost icon button, lucide `Sun`/`Moon` at 16 px. `aria-label` is "Switch to light theme" / "التبديل إلى الوضع الفاتح".
3. **Sign in.** Ghost link "Sign in" / "تسجيل الدخول" → `/login`. When `isAuthenticated`, show "Console" / "لوحة التحكم" → `consoleHref` instead.
4. **Primary CTA.** "Build my system →" / "ابنِ نظامك ←" → `https://helixx.xo.je/build`, as an `<a>` with `rel="noopener"`. The arrow is `ArrowRight` with `rtl:rotate-180`.

**Mobile (<900 px).**
- Bar: brand + language pill (`عربي`/`EN`) + 36 px menu button.
- The menu button opens a shadcn `Sheet`: `side="right"` in LTR, `"left"` in RTL, with `dir` passed.
- Sheet contents: links stacked at 17 px, the primary CTA full-width, then Sign in.

**Props.** `{ isAuthenticated: boolean; consoleHref: string }`, the same as `PillNav`. The layout gets them from `getNavAuth()`.

### §6.2 Home hero — `components/marketing/home/hero.tsx`
Reference PNGs: `marketing_dark_hero.png` (top half), `marketing_ar_rtl_hero.png` (AR), `mobile_hero.png` (mobile).

#### Background — `components/marketing/hero-backdrop.tsx`
Server CSS. `aria-hidden`, `pointer-events-none`, absolutely positioned, height 1100 px, `overflow-hidden`.

- **Radials:**
  - `radial-gradient(ellipse 55% 42% at 50% -4%, rgba(52,224,161,.26), transparent 70%)`
  - `radial-gradient(30% 28% at 78% 6%, rgba(56,198,224,.16), transparent 70%)`
  - `radial-gradient(22% 22% at 22% 8%, rgba(56,198,224,.08), transparent 70%)`
- **Grid:** 64 px cells, lines `rgba(255,255,255,.045)`, masked with `radial-gradient(ellipse 60% 55% at 50% 20%, #000 30%, transparent 75%)`.
- **Rays:**
  - Desktop: 5 rays, each 2×760 px, `linear-gradient(180deg, rgba(140,255,214,.55), transparent)`, `filter: blur(1.5px)`, rotated 18°/8°/−4°/−14°/−24° around top-centre.
  - Mobile: 3 rays (8°/−4°/−14°).
- **Desktop enhancement (`<HeroRays/>`):**
  - `next/dynamic(() => import('@/components/reactbits/LightRays'), { ssr:false })`.
  - Mount only when `useAmbientAllowed()` is true, after `window.load` + `requestIdleCallback` (fallback timeout 1200 ms).
  - Fade in over 600 ms to opacity .55.
  - Unmount after the tab has been hidden for more than 10 s.
- **Light theme:** replace the rays and grid with:
  - `DotPattern`: `#CFC8BA`, 1 px dots, 22 px spacing, mask `ellipse 70% 70% at 70% 30%`, opacity .7.
  - A mint radial `40% 45% at 76% 38%` `rgba(18,165,121,.20)` plus cyan .12, breathing over 10 s (scale 1 → 1.04). Static under reduced motion.

#### Content
Centred column: H1 max-width 980, `pt-[120px]` (mobile `pt-16`).

**1. Eyebrow pill** (`AnimatedShinyText`)
- 13 px rounded-full pill with a `--mk-line-2` border.
- Leading tag "New": 11.5/600, bg accent, text accent-ink, radius 999, px 8.
- Then the text, then `ChevronRight` (`rtl:rotate-180`).
- Links to `/lead-gen` (or `/#systems` until that page exists).
- The shine sweeps `#9AA3B2 → #FFFFFF → #9AA3B2` every 3 s.

| | EN | AR |
|---|---|---|
| Desktop | **New** · "Lead Gen v2 — enrich websites or find leads by search ›" | **جديد** · "توليد العملاء v2 — أثرِ بيانات المواقع أو ابحث عن عملاء جدد" |
| Mobile | "Lead Gen v2 is live" | "توليد العملاء v2 متاح الآن" |

**2. H1** (`.mk-display`)
- Gradient text: `background: var(--mk-h1-grad); background-clip: text; color: transparent`.
- The `<em>` is `font-style: normal` and uses `--mk-em-grad`. In AR, the gradient angle is 270deg.
- Light theme: solid `#111`. The `em` becomes `--mk-accent` with a highlighter `linear-gradient(transparent 62%, rgba(18,165,121,.18) 62%)`.
- EN: "AI systems that answer, qualify and book — *in Arabic and English.*"
- AR: "أنظمة ذكاء اصطناعي تردّ وتؤهّل وتحجز — *بالعربي والإنجليزي.*"
- **Animation:** `BlurText animateBy="words" delay={60}`.
- **LCP guard:** render the plain H1 on the server. After mount, swap in the animated version **only if** reduced motion is off and less than 400 ms have passed since first paint. Otherwise keep it static.

**3. Lead** (`.mk-lead`): max-width 640, margin-top 22.
- EN: "Helix builds and runs WhatsApp & voice receptionists, lead generation and CRM automations on n8n — with a console that shows exactly what every agent did."
- AR: "نبني ونشغّل موظفي استقبال على واتساب والهاتف، وتوليد العملاء، وأتمتة إدارة العملاء على n8n — مع لوحة تحكم تُظهر بالضبط ما فعله كل وكيل."

**4. CTAs** (gap 12, margin-top 32; mobile: stacked full-width, gap 10)
- **Primary, lg** (h48, px22, 15 px, radius `--mk-btn-radius-lg`, `shadow-mk-cta`): "Build my system →" / "ابنِ نظامك ←" → `https://helixx.xo.je/build`.
- **Ghost, lg** (`--mk-line-2` border, `bg-white/3`): "▷ Watch a live run" / "شاهد تشغيلاً مباشراً".
  - The play icon is never flipped and sits at inline-start.
  - Default action: smooth-scroll to `#demo`.
  - Only when `content/marketing/media.ts` has a real `liveRunVideoUrl` (type `string | null`, default `null`) does it open `HeroVideoDialog` instead.

**5. Micro line**: 13 px, `--mk-subtle`, led by a 6 px mint dot with `box-shadow: 0 0 10px #34E0A1`.
- EN: "7-day unrestricted trial · No credit card required · Gulf Arabic + English"
- AR: "تجربة ٧ أيام بلا قيود · بدون بطاقة ائتمان · عربي خليجي + إنجليزي"
- Mobile EN: "7-day trial · No credit card · AR + EN"
- `TODO(verify-offer)`: confirm the 7-day trial matches how `/signup` actually behaves. If it doesn't, change the copy, not the product.

#### Product window — `components/marketing/home/product-window.tsx` (client)
- **Frame:**
  - margin-top 64, max-width 1200, **fixed height 540 px** (prevents CLS), radius 18
  - `--mk-window-grad` background, `--mk-line-2` border, `shadow-mk-window`
  - `BorderBeam` on the frame
  - 80 px bottom fade via `mask-image: linear-gradient(#000 85%, transparent)`
- **Title bar** (h44, 12.5 px, `--mk-muted`, bottom border):
  - Three 10 px dots in `#2A313C`.
  - Title: "helix · console / **Live run — Missed-call triage**". AR: "helix · لوحة التحكم / **تشغيل مباشر — فرز المكالمات الفائتة**".
  - End-aligned chips: `.mk-sample` "SAMPLE RUN" (AR "تشغيل تجريبي"), then an `acc` chip "Streaming" / "مباشر" with a pulsing dot.
- **Grid:**
  - ≥1100 px: `300px 1fr 300px`.
  - 768–1099 px: `260px 1fr`, right column hidden.
  - <768 px: use the mobile card (below) instead.

**Left panel — "Pipeline" / "مسار التنفيذ"**
- Panel label: 11 px, .1em, uppercase (AR: 12.5 px, no tracking).
- Each step: a 24 px icon, a 13.5 px title, and an 11.5 px Geist Mono meta line.
- Icon states:
  - done: mint .12 fill + `Check`
  - running: cyan border + 3 px ring `rgba(56,198,224,.18)` + spinning `Loader2`
  - waiting: `--mk-line-2` border + `Clock`

| # | EN | AR | Meta | State |
|---|---|---|---|---|
| 1 | Missed call detected | رُصدت مكالمة فائتة | `00:00.012 · Vapi SIP` | done |
| 2 | Caller parsed · AE | تحليل المتصل · الإمارات | `00:00.045 · HMAC verified` | done |
| 3 | WhatsApp sent (ar_AE) | أُرسلت رسالة واتساب | `00:00.134 · template` | done |
| 4 | Qualifying intent… | جارٍ تحديد النية… | Gulf Arabic dialect / لهجة خليجية | running |
| 5 | Book on Cal.com | الحجز على Cal.com | waiting / بانتظار | waiting |
| 6 | Write to CRM | التسجيل في إدارة العملاء | waiting / بانتظار | waiting |

`AnimatedBeam` runs icon 1 → 4: curvature 0, path colour `--mk-line-2`, gradient mint → cyan.

**Middle panel — WhatsApp**
- Header: "WhatsApp · `<bdi dir=ltr>+971 50 *** 4182</bdi>`". Sub-line: "Dental clinic · example tenant" / "عيادة أسنان · عميل تجريبي".
- `cy` chip: "Arabic · Gulf" / "عربي · خليجي".
- The bubble area is **always `dir="rtl"`**: the conversation is Arabic in both UI languages.
- Bubble style: 14/1.6 (15/1.7 in the AR UI), radius 14, max-width 78%.
  - Incoming: `--mk-bubble-in`.
  - Outgoing: `--mk-bubble-out` with a 1 px `--mk-bubble-out-line` border.
- Sequence: `AnimatedList` with a 1200 ms delay, then typing dots, then freeze.
  1. out: مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟
  2. in: أبغى أحجز موعد تنظيف أسنان بكرة العصر
  3. out: تمام! عندنا ٤:٣٠ أو ٥:١٥ مساءً. أي وقت يناسبك؟
  4. in: ٥:١٥ ممتاز
  5. typing indicator

**Right panel — "This run" / "هذا التشغيل"**
- **"First reply" / "أول ردّ":** `NumberFlow` 4.2 + "s" at 28/600, plus a `.mk-sample` chip "SAMPLE VALUE" / "قيمة تجريبية".
- **"Intent" / "النية":** "Booking · cleaning" / "حجز · تنظيف", a `warn` chip "Probable" / "مرجّح", and a 6 px mint bar at 72%.
- **"Next action" / "الإجراء التالي":** "Hold 17:15 on Cal.com" / "حجز مؤقت ١٧:١٥ على Cal.com", with the note "Needs confirmation from caller" / "بانتظار تأكيد المتصل" underneath.

**AR.** The logical grid mirrors automatically: pipeline on the right, stats on the left. Wrap times and codes in `<bdi dir="ltr">`.

**Mobile card** (match `mobile_hero.png`):
- One card, radius 18.
- Header: "Missed-call triage" + `SAMPLE`.
- Chips that tick in at a 300 ms stagger: "Call missed ✓", "WhatsApp sent ✓", "Qualifying" (with a running dot).
- Bubbles 1–3 from the sequence above.
- Footer: "Hold 17:15 on Cal.com" · "4.2s" (with the sample tag).
- No beam and no WebGL.

**Accessibility.**
- The window is `role="img"` with `aria-label="Sample run of the missed-call triage system: call detected, WhatsApp sent in Arabic, intent being qualified, booking pending."` Add the AR equivalent.
- All animated internals are `aria-hidden`.

### §6.3 Integrations strip + live demo — `components/marketing/home/integrations-strip.tsx`, `live-demo.tsx`
Reference PNG: `marketing_dark_hero.png` (lower half).

#### Integrations strip
Margin-top 72, top and bottom borders in `--mk-line`, py 28.

**Label** (12 px Geist Mono, .14em, uppercase, `--mk-subtle`):
- EN: "PLUGS INTO THE TOOLS YOU ALREADY RUN · <span class=text-mk-muted>integrations, not endorsements</span>"
- AR (no uppercase): "يتكامل مع الأدوات التي تستخدمها · تكاملات وليست شراكات"
- Light theme: "INTEGRATES WITH / not endorsements"

**Logo loop.**
- `LogoLoop` with **text wordmarks only**: 19 px/600, `--mk-wordmark`, gap 44, 12% edge fade, ~40 s per loop, `ariaLabel="Integrations"`.
- Wordmarks: n8n · WhatsApp Cloud API · Cal.com · Google Calendar · Supabase · Vapi · HubSpot · Google Sheets · Meta Ads · Tap · Moyasar · Paymob.
- The track wrapper is `dir="ltr"`. In AR, set `direction="right"`.
- Reduced motion: a static centred `flex-wrap` row.
- `TODO(verify-integrations)`: list only integrations Helix really supports. Cross-check `app/dashboard/integrations` and `lib/studio/templates.ts`, and remove any that aren't supported.

#### Live demo
`id="demo"`, grid `420px 1fr`, gap 56. Stacked below 1024 px.

**Left column.**
- Kicker: "Live demo" / "عرض مباشر".
- H2: "Watch a system run, step by step." / "شاهد النظام يعمل خطوة بخطوة."
- Paragraph (17/1.6, `--mk-muted`):
  - EN: "Every webhook, decision and message is logged. Pick a system and replay a scripted run — the same trace your team sees in the console."
  - AR: "كل طلب ويب هوك وكل قرار وكل رسالة مسجّلة. اختر نظاماً وأعد تشغيل سيناريو تجريبي — نفس السجل الذي يراه فريقك في لوحة التحكم."
- **System rows:**
  - Row: 56 px tall, radius 14, `--mk-surface`, `--mk-line` border.
  - Active row: `--mk-surface-2` fill, `--mk-accent-line` border, `layoutId="mk-demo-row"`, and a `Play` icon.
  - The row number is Geist Mono 12.5.
  - A `?system=` query parameter (from the rewrites) preselects a row.

| # | EN | AR |
|---|---|---|
| 01 | Missed-call triage | فرز المكالمات الفائتة |
| 02 | Voice receptionist | موظف استقبال صوتي |
| 11 | Lead qualification | تأهيل العملاء المحتملين |

**Right column.** A restyled `components/terminal/live-agent-terminal.tsx`.
- **Window:** `--mk-term-bg`, radius 16, border `rgba(255,255,255,.1)`, shadow `0 30px 80px -30px rgba(0,0,0,.8)`.
- **Bar:** h42, 12 px, `#8A93A3`, three `#2A313C` dots.
  - Path: `~/helix/live-pipeline/system_1`.
  - Chips: `DEMO SCRIPT` (sample style) and a `1×`/`2×` speed toggle.
- **Body:** Geist Mono 12.5/1.95, `#D5DBE3`, timestamps `#56606F`.
- **Tag chips:** 74 px wide, 10.5 px, .06em, radius 4, classes `tag-*`.
- **Footer:** "▸ Streaming next frame…" / "▸ جارٍ بث الإطار التالي…", then Replay when the script ends.
- The terminal is **always `dir="ltr"`**.

**system_1 script.** Replace the content with exactly this, and keep the streaming engine, IO pause, and reduced-motion handling:

```
INBOUND   Telephony webhook received: event="call.missed"
AUDIT     HMAC-SHA256 signature valid · tenant_id="cl_demo"
REASON    Caller parsed · country="AE" · returning=false
EGRESS    POST n8n /webhook/system-1-missed-call
DISPATCH  WhatsApp Cloud API · template rescue_inbound_ar_en
DISPATCH  lang="ar_AE" · to="+971 50 *** 4182"
INBOUND   Delivery receipt DELIVERED
INBOUND   Reply received (ar) · 46 chars
REASON    intent="BOOKING" urgency="HIGH" · band=probable
DISPATCH  Offer slots 16:30 / 17:15 → Cal.com hold▍
```

Tag classes: INBOUND→`tag-in`, AUDIT→`tag-au`, REASON→`tag-rs`, EGRESS→`tag-eg`, DISPATCH→`tag-ds`.

**Cleanup across all 3 scripts:**
- Use only neutral tenants: `cl_demo`, "Example Dental Clinic", "Example Realty", "Example Roofing Co.".
- Remove `cl_aramco_012`, "Al-Futtaim Tech", "Neogen Dynamics", "Dr. Tariq", and every currency deal value.
- Remove the `Sparkles` icon and the "Live Side Telemetry Mock" text.
- Replace the purple/indigo colours with the tag palette.

### §6.4 Systems catalog bento — `components/marketing/home/systems-bento.tsx` (`id="systems"`)
Reference PNG: `marketing_dark_sections.png` (top).

**Header.**
- Kicker: "Systems catalog" / "كتالوج الأنظمة".
- H2: "Production systems, not chatbots." / "أنظمة تشغيلية، لا روبوتات دردشة."
- Sub:
  - EN: "Each system is an n8n workflow + Helix console module. Start with one; add more when it pays for itself."
  - AR: "كل نظام هو سير عمل على n8n مع وحدة في لوحة تحكم Helix. ابدأ بنظام واحد، وأضف غيره حين يغطي تكلفته."

**Filter.**
- shadcn `ToggleGroup`, single select, pill style. The active item is `rgba(255,255,255,.08)` with `layoutId="mk-cat-pill"`.
- Options: Core / Preview add-ons / All (AR: الأساسية / إضافات تجريبية / الكل).
- Filters by template `lane`. Cards re-layout with Motion `layout` over 250 ms.

**Grid.** `grid-cols-6 gap-4` at ≥1024 px, 2 columns on tablet, 1 on mobile.

**Card style.**
- Radius 20, `--mk-card-grad` background, `--mk-line` border, padding 26.
- Wrapped in `SpotlightCard` (hover-capable desktops only). `shadow-mk-card` in light theme.
- Icon tile: 40 px, radius 11, `linear-gradient(180deg, rgba(52,224,161,.18), rgba(52,224,161,.06))`, `--mk-accent-line` border, 18 px lucide icon in `--mk-accent`.
- Title 20/600/−.02em. Description 14.5/1.6, `--mk-muted`.
- Price row: Geist Mono 12.5, `--mk-list-text`.

**Data.**
- Map cards from `lib/studio/templates.ts`.
- Price text: `formatUsd(setupFeeCents)` + " setup · " + `formatUsd(monthlyRetainerCents)` + "/mo", with `pricePrefix` in front when present. **Never hard-code prices.** Catalog cards show USD per-system prices only (same source as `/studio`), with a small caption "USD · per system" and a link to `/pricing` for AED monthly plans.
- Badges come from `highlight`. If a template has none, show no badge.

**Spans, matching the PNG** (key by template id):

| Card | Span | Extra content |
|---|---|---|
| Booking receptionist | 4 | Waveform panel "Voice · live call 00:42" + `SAMPLE`: 24 CSS bars, 4 px wide, deterministic heights |
| Missed-call triage | 2 | Mono line `14:02:00 missed → WhatsApp 14:02:05` + "example" |
| Lead reactivation | 2 | – |
| Lead qualification & attribution | 2 | – |
| AR collections | 2 | – |
| Lead Generation | 3 | "dental clinics Dubai · 14 / 20 enriched" with a 70% bar that fills over 1 s + "example" |
| Preview add-ons | 3 | Preview template names joined with " · ", "Preview systems — demos are scripted, not live.", "From <lowest preview setup>" (from data), and one chip per preview template |

- If the template count differs from the PNG, keep the 4+2 / 2+2+2 / 3+3 rhythm and let extra cards wrap at span 2.
- Cards link to `/studio?template=<id>`. Check which query param `studio-workspace.tsx` actually reads.
- **AR:** use the templates' AR fields. Numbers use `ar-AE`; prices go in `<bdi dir="ltr">`.

### §6.5 How it works — `components/marketing/home/how-it-works.tsx` (`id="how"`)
Reference PNG: `marketing_dark_sections.png` (middle).

**Heading.** H2: "From brief to live system — you see every step." / "من الفكرة إلى نظام يعمل — وترى كل خطوة."

**Desktop layout.**
- `grid-cols-4 gap-5`, with a 1 px connector behind the tiles: `linear-gradient(90deg, #34E0A1, rgba(56,198,224,.5), transparent)`, reversed in AR.
- Tile: 54 px, radius 16, Geist Mono 15.
- Tile states:
  - done: accent fill + ink text + `0 0 24px -4px rgba(52,224,161,.6)` glow
  - current: cyan ring
  - future: `--mk-line-2` border
- **Scroll-linked:** use the Aceternity `Timeline` technique (`useScroll` + `useTransform` on the connector's `scaleX`, origin at inline-start). Tiles light up in sequence as the section passes the viewport centre.

**Mobile.** A vertical `Timeline`, or a static list under reduced motion.

**Light theme.** Step cards with radius 20, a progress bar in each card, and a ring on the active card.

**Steps (EN / AR):**
1. **"Describe the workflow" / "صِف سير العمل"**
   - EN: "Answer a short brief at helixx.xo.je/build: channels, languages, calendar, CRM."
   - AR: "أجب عن استبيان قصير على helixx.xo.je/build: القنوات، اللغات، التقويم، ونظام إدارة العملاء."
   - The domain is a link wrapped in `<bdi dir=ltr>`.
2. **"We build it on n8n" / "نبنيه على n8n"**
   - EN: "Your system is assembled from tested workflow modules and wired to your WhatsApp, phone and calendar."
   - AR: "نجمّع نظامك من وحدات سير عمل مُختبرة ونربطه بواتساب والهاتف والتقويم لديك."
3. **"Test on your phone" / "جرّبه على هاتفك"**
   - EN: "Call, message and book like a customer before anything goes live."
   - AR: "اتصل وراسل واحجز كأنك عميل قبل الإطلاق."
4. **"Run it in the console" / "شغّله من لوحة التحكم"**
   - EN: "Every run, message and booking is traced in your Helix console."
   - AR: "كل تشغيل ورسالة وحجز مسجّل في لوحة تحكم Helix."

`TODO(copy-confirm)`: only step 1's body appears in the PNG. Steps 2–4 are drafted here and need Ziad's confirmation.

### §6.6 Pricing (home teaser + `/pricing`) — `components/marketing/home/pricing-teaser.tsx`, `components/pricing/pricing-view.tsx`
Reference PNG: the pricing band in `marketing_dark_sections.png`.

**Header.**
- Kicker: "Offer packs" / "الباقات".
- H2: "Start with 7 days, unrestricted." / "ابدأ بتجربة ٧ أيام بلا قيود."

**Controls.**
- Region `ToggleGroup`: "GCC" / "الخليج" · "MENA SME" / "الشركات الصغيرة والمتوسطة".
- Currency `ToggleGroup`: GCC → AED / SAR / USD; MENA → EGP / JOD / USD.
- Both use `layoutId` pills. Keep the existing `PricingView` state semantics (`gcc_enterprise` / `mena_sme`).

**Cards.** Grid `1fr 1.08fr 1fr`, gap 16, padding 28, radius 20.
- **Featured plan** (the one flagged featured / "Most Popular" in the data): `--mk-popular-bg`, `--mk-popular-line` border, `ShineBorder`, badge "Most popular" / "الأكثر طلباً".
- Plan name: 15/600, `--mk-muted`.
- Price: `NumberFlow` at 40/600, then "/month" / "/شهرياً".
- Setup line: "Setup {amount}" / "رسوم الإعداد {amount}", Geist Mono 12.5.
- Features: 14 px, `--mk-list-text`, with 16 px `Check` icons in `--mk-accent`.
  - Home teaser: show at most 4 features per plan, then "All features →" linking to `/pricing`.
- CTAs keep the current `PricingView` targets: primary on the featured plan, ghost on the others.

**Data.**
- Take plans from `getPricingConfigs()`, passed from the server component, and render exactly the plans in the data.
- **Don't** add a priced "Custom build" card. Put a text row under the grid instead: "Need something bespoke? **Custom build — let's scope it →**" linking to https://helixx.xo.je/build.

**Footnote.** No "confirm before launch" footnote. Instead show the caption "Monthly plans · AED" above the grid and the link "Buying a single system? See per-system prices in Studio →" below it (EN + AR).

**`/pricing` page.**
- Same components, but with full feature lists.
- Restyle the FAQ as a shadcn `Accordion` (`--mk-surface`, radius 14).
- Replace `LightfallCanvas` with the hero backdrop at 60% height.
- Replace every `sky-*`, `#0e8da6`, and cyan class with mk tokens.
- Keep `PricingView`'s logic and props. Its local `en/ar` state switches to `useLanguage()`; remove the local toggle, since the nav owns language now.

**Flag, don't edit.** List these feature claims in the wave summary: "Cryptographic Ground-Truth Evidence Ledger", "Dedicated Technical Account Manager in Dubai/Riyadh", "zero hallucinations", "99.9% uptime".

### §6.7 Testimonial slot, FAQ, final CTA — `components/marketing/home/testimonial-slot.tsx`, `final-cta.tsx`

**Testimonial slot.**
- Render it **only** when `content/marketing/testimonials.ts` exports `showPlaceholder = true` (default `false`).
- Style: 1 px dashed `--mk-line-2` border, radius 20, py 40, centred, 14 px `--mk-subtle`.
- EN: "Testimonial slot — publish only real, named client quotes (with permission). Hidden until the first pilot signs off."
- AR: "مساحة للشهادات — تُنشر فقط اقتباسات حقيقية من عملاء بأسمائهم (بإذنهم). مخفية حتى يعتمد أول عميل تجريبي."
- Once real quotes exist, switch to Aceternity Animated Testimonials. No autoplay carousel, no fake avatars.

**FAQ.**
- Keep `getPublicFaqs()` + `FaqAccordion`, restyled as a shadcn `Accordion` (max-width 820, 16 px questions, `--mk-muted` answers).
- Place it between pricing and the CTA.

**Final CTA card.**
- Padding 64 (mobile 32), radius 24, `--mk-cta-bg`, `--mk-line` border, centred.
- H2 (44 px): "Tell us the workflow. We'll build the system." / "أخبرنا بسير العمل، ونحن نبني النظام."
- Paragraph: "Five-minute brief. You get a scoped plan in English or Arabic." / "استبيان من خمس دقائق، وتحصل على خطة واضحة بالعربي أو الإنجليزي."
- **Primary button:** `ShimmerButton` "Start at helixx.xo.je/build ↗" / "ابدأ على helixx.xo.je/build ↗". `shimmerColor="#34E0A1"`, `background="#04130D"`, radius 12, h48.
- **Ghost button:** "Talk to us on WhatsApp" / "تحدّث معنا على واتساب".
  - Link to the existing WhatsApp link (`rg -n "wa.me"`).
  - If there isn't one, link to `/contact` and add `TODO(whatsapp-number)`.
- **Light theme:** a white card with `shadow-mk-card`; the shimmer button becomes a primary pill.

### §6.8 Footer — `components/marketing/site-footer.tsx` (replaces `components/footer/helix-footer.tsx`)

**Layout.** Top border `--mk-line`, py 48.

**Row 1: brand + tagline.**
- EN: "AI systems for WhatsApp, voice, lead generation and CRM — built on n8n."
- AR: "أنظمة ذكاء اصطناعي لواتساب والهاتف وتوليد العملاء وإدارة العملاء — مبنية على n8n."

**Columns.**
- Product: Systems `/#systems`, Lead Gen `/lead-gen`, Pricing, Studio, Updates.
- Company: About, Team, Contact, FAQ.
- Legal: `/privacy`, `/terms`.

**Row 2.** "© {year} Helix" plus the language pill.

**Remove from the old footer:**
- the "ALL SYSTEMS OPERATIONAL" badge
- the "CRM, ERP" tagline
- links to dashboard routes
- the `/about#careers` / `#terms` / `#privacy` anchors
- the giant watermark (or keep it at opacity .04, `aria-hidden`, with no overflow and no CLS)

The footer has no motion.

### §6.9 Theme system (F4) — Daylight Paper

**Cookie.** `helix-mk-theme` = `dark|light`. It's only written when the user clicks the toggle. The layout reads it and renders `data-theme`.

**No-flash script.** An inline script in `(marketing)/layout.tsx`, placed before the content. It sets `data-theme="light"` on `.mk` only when all three hold:
- there's no cookie
- `FOLLOW_SYSTEM_WHEN_UNSET` in `lib/theme.ts` is `true` (the default)
- `matchMedia('(prefers-color-scheme: light)')` matches

Implementation: render the script as the **first child** of the `.mk` div and use `document.currentScript.parentElement.setAttribute('data-theme','light')`, so it runs before any content paints. Otherwise the page stays dark. Ziad can set `FOLLOW_SYSTEM_WHEN_UNSET = false` to force dark until each visitor chooses.

**Toggle.** Writes the cookie (1 year) and `localStorage['helix.mk-theme']`, then flips the attribute. No reload.

**One component tree.** Light only changes tokens and these decorations:
- the dot pattern replaces the rays
- the H1 `em` gets the highlighter
- buttons become pills
- the popular card is dark
- the CTA card is white
- the live-demo section sits on a dark band: `--mk-band`, `rounded-[28px] mx-4`

**Not adopted on home.** The M2 PNG's left-aligned hero with stacked cards would mean two layouts. Its stacked cards are reused as the `/lead-gen` hero visual in F5 instead:
- Find-leads card: Pearl Smile Dental 86 / Marina Dental Care 78 / Jumeirah Family Clinic 61, each "· example"
- WhatsApp card: "replied in 4.2s · sample"
- Dark toast: "Held 17:15 on Cal.com"

**Contrast.**
- `--mk-muted` on the light background is about 6.3:1, which passes.
- `--mk-subtle` is about 3.4:1: use it only for text ≥18 px or non-essential meta.

### §6.10 Other marketing pages (F5)

**`/studio`**
- Keep the `StudioWorkspace` logic, and switch its local EN/AR state to `useLanguage()`.
- Restyle with mk tokens: catalog cards use the bento style; builder panels are `--mk-surface` with radius 14.
- `studio-motion-demo.tsx`: remove the purple gradients, synthetic cursor, and Sparkles.
- `landing-demo.tsx`: the sky button becomes the mk primary.
- Change `initialClientName="Al Noor Specialty Clinic"` to `"Example Clinic"` and add `TODO(copy-confirm)`.

**`/lead-gen`** (new: `app/(marketing)/lead-gen/page.tsx`), in page order:
1. H1: "Find and enrich B2B leads — every field shows its source." / "اعثر على عملاء محتملين وأثرِ بياناتهم — ومصدر كل معلومة ظاهر."
2. Hero visual: the M2 stacked cards, labelled as samples.
3. A two-mode explainer: Enrich websites / Find leads.
4. A sources strip: Google Maps, OpenStreetMap, Foursquare, web search.
5. An honesty block: "Empty stays empty. We never invent emails or phone numbers." / "الحقل الفارغ يبقى فارغاً. لا نختلق بريداً أو رقم هاتف."
6. Pricing from the Lead Generation template.
7. The CTA.

Add metadata and a sitemap entry.

**about, updates, faq, contact, team, privacy, terms**
- Move them into `(marketing)` and drop the per-page nav/footer.
- Apply the typography: prose max-width 720 at 16/1.7, H1 48.
- Don't invent any new content.

**signup / login / forgot / reset-password.** Leave them outside the group. They pick up the new fonts only.

---

## §7 RTL / Arabic rules (marketing)

1. **`dir` lives on `<html>`**, set on the server from the cookie. Never put `dir="rtl"` on page wrappers.
   - The only exceptions are LTR islands, which get `dir="ltr"`: logs/terminal, the logo track, phones, domains, prices, code, and kbd.
   - The chat demo is always `dir="rtl"`.
2. **Logical utilities only.** This check must return nothing, apart from `mx-auto` / `px-` / `inset-x`:
   ```bash
   rg -n "\b(ml|mr|pl|pr|left|right)-" components/marketing "app/(marketing)"
   ```
3. **Type:** follow §3.3. That means letter-spacing 0, line-heights 1.3 / 1.8, weight 700 for display, no uppercase kickers, and body text 1 px larger.
4. **Digits:**
   - Prices, KPIs, and step numbers use `ar-AE`, which gives Latin digits.
   - Arabic-Indic digits appear only in conversational copy, as written here: the chat bubbles and "٧ أيام".
5. **Icons:** flip `ArrowRight`, `ChevronRight`, and `ArrowUpRight` (`rtl:-scale-x-100`). Never flip Play, Check, Clock, Phone, or the brand mark.
6. **Motion direction:**
   - The marquee keeps an LTR track and reverses direction in AR.
   - Beams and shine reverse.
   - Progress fills from inline-start.
7. **Headline animation:** by word only. When `isArabic`, `BlurText` drops `filter` and uses opacity + y only, because blur smears joined glyphs.
8. **Latin names at sentence end:** wrap names like "Cal.com" and "n8n" in `<bdi>` when they end an Arabic sentence, so the punctuation lands correctly.
9. **Metadata:** `generateMetadata` reads `getLang()` for the title and description. Don't add `alternates.languages` until a URL locale exists.

## §8 Accessibility

- **Landmarks and headings:**
  - One `<h1>` per page.
  - Sections use `<section aria-labelledby>`.
  - Add a skip link "Skip to content" / "تخطَّ إلى المحتوى" → `#main`.
- **Focus and keyboard:**
  - Focus ring: `outline: 2px solid var(--mk-accent); outline-offset: 2px`. Never remove it.
  - Toggle groups are keyboard-operable.
- **Contrast (dark theme):**
  - `--mk-muted` on the dark background is about 7.9:1, which passes.
  - `--mk-subtle` is about 4.3:1: use it only for meta text ≥13 px.
- **Decoration:** backdrop, rays, WebGL, beams, and spotlight are all `aria-hidden` and `pointer-events-none`.
- **Screen readers:**
  - The product window and the terminal have text alternatives.
  - The terminal uses `aria-live="off"` while streaming, then announces "Demo finished".
  - Language options carry `lang` attributes.
  - The theme toggle has `aria-pressed`.
- **Motion:** all motion is finite or pausable, and the marquee pauses on hover and focus. No autoplay video.
- **Touch targets:** at least 40 px everywhere; mobile CTAs are 48 px.

---

## §9 File-by-file change list

**New**
- **Foundation:** `app/fonts.ts`, `lib/motion/{tokens,variants,features}.ts`, `hooks/use-reduced-motion-safe.ts`, `components/providers/{motion-provider,app-providers}.tsx`, `components/shell/language-context.tsx` (if missing), `lib/i18n/{server,format}.ts`, `lib/theme.ts`.
- **Marketing layout:** `app/(marketing)/layout.tsx`.
- **Shared marketing components:** `components/marketing/{site-nav,site-footer,mk-button,section,kicker,sample-chip,chip,hero-backdrop,hero-rays,theme-toggle,language-pill}.tsx`.
- **Home sections:** `components/marketing/home/{hero,product-window,product-window-mobile,integrations-strip,live-demo,systems-bento,how-it-works,pricing-teaser,testimonial-slot,final-cta}.tsx`.
- **Content:** `content/marketing/{copy,media,testimonials,integrations}.ts`.
- **Vendored components:** `components/magicui/*`, `components/reactbits/*`, `components/aceternity/*` (§4.3).
- **shadcn:** `components/ui/{direction,toggle-group,tabs,sheet,dialog,tooltip,accordion,navigation-menu,kbd,separator}.tsx`.
- **F5:** `app/(marketing)/lead-gen/page.tsx`.

**Moved (URLs unchanged)**
- `git mv` into `app/(marketing)/`: `page.tsx`, `pricing/`, `studio/`, `about/`, `updates/`, `faq/`, `contact/`, `team/`, `privacy/`, `terms/`.
- Then fix relative imports.

**Changed**
- `app/layout.tsx`, `app/globals.css`, `components.json`, `package.json`.
- `next.config.mjs`: `optimizePackageImports` only.
- `app/sitemap.ts`.
- `components/terminal/live-agent-terminal.tsx`, `components/pricing/pricing-view.tsx`.
- `components/studio/{studio-workspace,studio-motion-demo,studio-agent-ide,landing-demo}.tsx`.
- `components/lightfall.tsx`: add a reduced-motion guard if it's still used anywhere.
- `docs/DESIGN-SPEC.md`.

**Deleted (F5, only when `rg` finds no importers)**
- `components/navigation/pill-nav.tsx`
- `components/footer/helix-footer.tsx`
- `components/lightfall-canvas.tsx`, `components/lightfall.tsx`, `components/Lightfall.css`

**Not touched**
- `app/dashboard/**`, `app/admin/**`, `features/**`, `app/api/**`
- `lib/leadgen/**`, `lib/search/**`
- the values in `lib/pricing/tiers.ts` and `data/pricing.json`
- `proxy.ts`, `supabase/**`

---

## §10 DESIGN-SPEC.md update text (paste into `docs/DESIGN-SPEC.md`)

> Bump the header to **v4 — 2026-09-25**. If the dashboard prompt already added §16–§19, merge the text rather than duplicating it.

**Amend §1.2 Colour**
"The accent family is **emerald**:
- Dashboard: `#0B6E4F` (accent), `#12A579` (accent-2), `#E6F3EE` (soft).
- Marketing dark: `#34E0A1`. Cyan `#38C6E0` is **only** a marketing glow partner, never a button or text link.

Cyan `#0e8da6` is retired. No purple, violet, or indigo anywhere."

**Amend §1.3 Type**
"**Geist** (UI/display), **Geist Mono** (code, logs, kbd, IDs), and **IBM Plex Sans Arabic** (Arabic), loaded via `next/font/google` as `--font-geist` / `--font-geist-mono` / `--font-plex-ar`. The family order swaps under `[dir=rtl]`.
- Minimum size is 13 px for body text and controls.
- **Exception:** chips, uppercase kickers/labels, kbd, and mono timestamps may use 11.5–12.5 px.
- Arabic labels are at least 12.5 px."

**Amend §1.12 Bans**
- Append "— except on marketing routes as permitted by §16" to the gradient, glow, icon-tile, and blur bans.
- The bans on fake metrics, fake logos, sparkles icons, emoji, testimonial carousels, and pie/donut charts stay global.

**§16 Marketing surfaces: Night Signal (default) and Daylight Paper (optional)**
- **Scope:** `app/(marketing)` routes, under a `.mk[data-theme=dark|light]` wrapper. Tokens are exactly those in `app/globals.css` → "HELIX MARKETING TOKENS".
- **Allowed on marketing only:**
  - mint/cyan radial glows (hero top, CTA band)
  - a primary CTA glow of `0 8px 30px -8px rgba(52,224,161,.55)`
  - a border beam on the hero window and the featured plan only
  - gradient text on the hero highlight words only
  - icon tiles in catalog cards
  - nav backdrop blur
  - one ambient WebGL canvas per page (desktop, after idle, never with reduced motion)
- **Limits:** at most 2 glowing elements per viewport, and no glow on body text or icons.
- **Honesty:**
  - Every demo value sits in a surface labelled Sample run / Demo script / Sample value / example.
  - Integrations appear as text wordmarks labelled "integrations, not endorsements".
  - No client logos, testimonials, uptime/status badges, or "trusted by" without real data and written permission.
  - Prices are rendered from `lib/pricing` / `lib/studio/templates.ts`, never typed into components.
- **Theme:**
  - Dark by default. Light is chosen with the nav toggle (cookie `helix-mk-theme`).
  - With no choice made, OS light is honoured only if `FOLLOW_SYSTEM_WHEN_UNSET` is true.
- **Layout:**
  - Container 1200 px with 32 px gutters (20 px on mobile).
  - Sections 112 px (80 px on mobile).
  - Radii: chips 8 · buttons 10–12 (pill in light) · panels 14 · product window 18 · cards 20 · CTA band 24.

**§17 Typography scale and Arabic rules**
- **EN marketing:** Display 76/1.02/−0.045em/600 (mobile 44) · H2 48/1.08/−0.035em · H3 20/1.3/−0.02em · Lead 19/1.55 · Body 15/1.6 · Small 13 · Mono 12.5.
- **Dashboard:** see §19.
- **Arabic:**
  - Letter-spacing is always 0.
  - Display 68/1.3/700 · H2 42/1.3/700 · lead 20/1.8 · body +1 px at 1.7–1.8.
  - No uppercase or tracked eyebrows.
  - Data digits use `ar-AE` (Latin). Arabic-Indic digits appear only in conversational copy.
  - Phones, domains, codes, logs, and prices go in `<bdi dir="ltr">`.
- **Text animation** is by word or line only, never per character.

**§18 Motion**

Timings (`lib/motion/tokens.ts`):

| Kind | Timing |
|---|---|
| Hover | 120–150 ms |
| Popover / toast | 180–220 ms, expo-out `[0.16,1,0.3,1]` |
| Dialog / cmd+K | 160–200 ms, scale .98 → 1 |
| Dashboard page | 180 ms, opacity + 4 px |
| List stagger | 20–30 ms dashboard (cap 12) / 60–80 ms marketing |
| Marketing reveal | 600–800 ms, y 16 + blur 6 |
| Counters | 800–1200 ms, on first view and data change only |
| Layout pills | spring 400/30 |
| Ambient | ≥ 8–12 s, paused off-screen or when hidden |

- **Reduced motion is mandatory:** `MotionConfig reducedMotion="user"` + `useReducedMotionSafe()` + the CSS media query. The end state renders immediately.
- **RTL:**
  - x offsets are multiplied by the direction sign.
  - Marquee tracks stay `dir=ltr` and run in reverse.
  - Beams and shine reverse; progress fills from inline-start.
  - Directional icons flip; play, check, clock, and brand icons don't.
- **Engines:** Motion (`motion/react`) and `ogl` only. No GSAP, three.js, Lenis, or cursor effects.

**§1.10 replacement:** "See §18. The animated-elements list now also includes counters (NumberFlow), list stagger, page transitions, the command palette, marketing reveals, and the ambient hero background."

---

## §11 Phased waves (one Antigravity run each) and acceptance checks

**Global checks after every wave:**
- `pnpm lint && pnpm exec tsc --noEmit && pnpm build` pass.
- From F0 onward, `rg -n "framer-motion" --glob '!node_modules' --glob '!pnpm-lock.yaml'` returns nothing.
- Visual comparison against the attached PNGs at 1440 px and 390 px.
- عربي mode matches `marketing_ar_rtl_hero.png`.
- With DevTools reduced motion on, nothing moves and every end state is complete.
- `git diff --stat` shows nothing under `app/dashboard`, `app/admin`, `features`, `app/api`.
- No new env vars and no keys.

**F0 · Foundations**
- **Scope:**
  - §4 installs; shadcn `rtl:true` + `add direction` + `migrate rtl`.
  - framer-motion → motion.
  - The §4.6 shared files, `app/fonts.ts`, and root layout lang/dir/fonts/providers.
  - mk tokens + the @theme bridge.
  - The `(marketing)` route group, with every listed page moved into it.
  - `site-nav` (no theme toggle yet) and an honest `site-footer`. The old nav and footer are no longer rendered.
- **Acceptance:**
  - Every marketing URL still returns 200 at the same path.
  - With the `helix-lang=ar` cookie set, the **server HTML** (view-source) has `<html lang="ar" dir="rtl">`.
  - Geist renders in EN and Plex Arabic in AR (DevTools → Rendered Fonts).
  - No "ALL SYSTEMS OPERATIONAL" anywhere.
  - `/dashboard` and `/admin` still render.
  - Any static → dynamic route changes are reported.

**F1 · Hero, product window, integrations**
- **Scope:** §6.1 final nav, §6.2 hero (desktop, tablet, mobile), §6.3 integrations strip. Desktop LightRays mounts after idle.
- **Acceptance:**
  - Matches `marketing_dark_hero.png` (down to the strip), `marketing_ar_rtl_hero.png`, and `mobile_hero.png`.
  - Lighthouse mobile (preview): Perf ≥ 90, LCP < 2.5 s with the H1 as the LCP element, CLS < 0.05.
  - No canvas at 390 px or under reduced motion.
  - The chat freezes after its last message.
  - The marquee is static under reduced motion, and its track is LTR in AR.

**F2 · Live demo, catalog, how it works**
- **Scope:** §6.3 demo + terminal cleanup, §6.4 bento from `templates.ts`, §6.5 steps.
- **Acceptance:**
  - `rg -n "aramco|Al-Futtaim|Neogen|Dr. Tariq|Sparkles|Telemetry Mock" components` returns nothing.
  - Bento prices equal the `templates.ts` values (spot-check 2).
  - The filter works from the keyboard.
  - The terminal pauses off-screen, and replay works.
  - In AR the terminal stays LTR and the timeline draws from the right.
  - Matches the corresponding PNG regions.

**F3 · Pricing, FAQ, CTA, footer polish**
- **Scope:** §6.6 teaser + `/pricing` restyle, §6.7, §6.8.
- **Acceptance:**
  - Prices equal the data in all 6 currencies (spot-check Starter: AED 1,800 / USD 490).
  - There is no "Custom build" price.
  - Digits roll on switch, and jump under reduced motion.
  - Only the featured card glows.
  - The footnote is hidden in production.
  - The flagged claims are listed in the summary.

**F4 · Daylight Paper**
- **Scope:** §3.1 light tokens, the §6.9 toggle + cookie + no-flash script, and the light decorations. **Attach `marketing_light_hero.png` + `marketing_light_sections.png`.**
- **Acceptance:**
  - Reload with the light cookie: the first frame is light, with no dark flash (performance trace).
  - No cookie + OS light + flag true gives light; flag false gives dark.
  - Lighthouse a11y ≥ 95 in both themes.
  - AR + light works.

**F5 · Remaining pages and QA**
- **Scope:**
  - §6.10: `/studio`, `/pricing` polish, the new `/lead-gen`, and a token pass on the other pages.
  - Sitemap; delete dead files.
  - DESIGN-SPEC §10 text.
- **Acceptance:**
  - `rg` shows no importers left before any file is deleted.
  - Lighthouse mobile ≥ 90 on `/`, `/pricing`, `/studio`, `/lead-gen`.
  - The §7.2 check is clean.
  - Keyboard-only walkthrough passes.
  - The DESIGN-SPEC diff shows v4 + §16–§18.
  - The final summary lists every `TODO(...)`.

---

## §12 Things NOT to do

- **Data and claims:**
  - Don't invent prices, plans, metrics, logos, testimonials, awards, customer counts, uptime, or "trusted by".
  - Don't rename "Sovereign Scale".
  - Don't edit the values or feature claims in `tiers.ts` / `data/pricing.json`. Flag them instead.
- **Routing and i18n:** no `[locale]` segment or i18n library, and don't touch the `proxy.ts` matcher.
- **Scope:** don't touch dashboard, admin, features, api, or Lead Gen/Search logic. The V2 prompt owns those.
- **Effects:**
  - No per-character text effects, cursor effects, or three.js.
  - No GSAP, Lenis, Vaul, @tremor/react, Magic Bento, Globe, Meteors, Sparkles, or confetti.
- **Colour:** no purple/violet/indigo, and no "AI sparkle" icons. Cyan is never a button or body-link colour.
- **WebGL and loops:**
  - At most one WebGL canvas per page. None on mobile or under reduced motion.
  - The only never-ending animations allowed are the slow marquee and the ambient background, and both must be pausable.
- **Code:**
  - Don't let shadcn overwrite `components/ui/button|input|card|badge|table|label`.
  - No physical `left/right/ml/mr/pl/pr` in new marketing code.
- **LCP:** the H1 must never need JS to become visible, and nothing layout-affecting may animate on it.
- **Secrets:** don't print or commit any. This prompt needs no env vars.
- **Copy:** no "real-time" or "coming soon" in marketing copy (§1.13). "Streaming" appears only inside labelled demo surfaces.

---

## PASTE: Antigravity

```text
You are working in the Next.js 16 repo CultLeaderZiad/Helix-Ai (App Router, React 19, Tailwind v4 via @tailwindcss/postcss with no tailwind.config, shadcn style base-nova, Supabase, pnpm, build = "next build --webpack"). Read AGENTS.md first. This Next.js differs from what you know, so check node_modules/next/dist/docs before using cookies(), next/font, route groups, or proxy.ts.

TASK
Redesign the public marketing site ("fronter") to the "Night Signal" dark design (the default), with an optional "Daylight Paper" light theme. Match the attached PNGs:
  1) marketing_dark_hero.png
  2) marketing_dark_sections.png
  3) marketing_ar_rtl_hero.png
  4) mobile_hero.png
  For wave F4 and the /lead-gen page, also: marketing_light_hero.png, marketing_light_sections.png.
Do ONLY the wave named on the last line. Stop after it, run the checks, and report.

NON-NEGOTIABLES

Honesty
- No fake metrics, logos, testimonials, or uptime/status badges.
- Demo visuals carry visible chips: "SAMPLE RUN" / "DEMO SCRIPT" / "SAMPLE VALUE" / "example".
- Integrations are text wordmarks labelled "integrations, not endorsements".
- Remove the footer's "ALL SYSTEMS OPERATIONAL" badge and its "CRM, ERP" tagline.
- In components/terminal/live-agent-terminal.tsx, replace the real names (cl_aramco_012, Al-Futtaim Tech, Neogen Dynamics, Dr. Tariq), the deal values, the Sparkles icon, the text "Live Side Telemetry Mock", and the purple tags. Use example tenants instead (cl_demo, "Example Dental Clinic").

Prices
- Render prices ONLY from lib/pricing/tiers.ts + getPricingConfigs() (data/pricing.json) and lib/studio/templates.ts. Never hard-code the mockup numbers.
- The third GCC plan is "Sovereign Scale"; keep it. Add a text link "Custom build — let's scope it →" to https://helixx.xo.je/build, with no price.
- Pricing decision (final): keep BOTH, clearly separated. /pricing and the home pricing teaser = AED monthly tiers only, captioned "Monthly plans · AED" with a link to /studio. /studio and the home systems catalog = USD per-system setup + monthly only, captioned "Per-system pricing · USD · one-time setup + monthly" with a link to /pricing. Never mix currencies on one surface. EN + AR captions. No TODO(pricing-reconcile) markers.
- Don't edit plan values or feature strings. List these claims in your summary: "Cryptographic Ground-Truth Evidence Ledger", "Dedicated Technical Account Manager in Dubai/Riyadh", "zero hallucinations", "99.9% uptime".

Language
- Every string exists in EN + AR in content/marketing/copy.ts, typed so AR has all keys.
- Set <html lang dir> on the server from the cookie "helix-lang". No [locale] segment, no i18n library, no proxy.ts changes.
- Arabic:
  * IBM Plex Sans Arabic
  * letter-spacing 0
  * display 68/1.3/700
  * lead 20/1.8
  * no uppercase kickers
  * data digits via ar-AE (Latin)
  * phones/domains/logs/prices in <bdi dir="ltr">
- Logical CSS only (ms/me/ps/pe/start/end).

Reduced motion
- Use <MotionConfig reducedMotion="user"> + hooks/use-reduced-motion-safe.ts + a CSS media query.
- End states render immediately. The marquee becomes a static row. No WebGL.

Performance
- Lighthouse mobile ≥90, CLS <0.05.
- LCP <2.5s. The LCP element is the server-rendered H1, visible without JS.
- At most one WebGL canvas per page: desktop ≥1024px only, mounted after load+idle.
- Motion uses LazyMotion + m.

Glow
- Gradients and glow only on marketing: mint #34E0A1, with cyan #38C6E0 as the glow partner. Never purple.
- ≤2 glowing elements per viewport.

Scope and safety
- Don't modify app/dashboard, app/admin, features, app/api, lib/leadgen, lib/search, supabase, or proxy.ts.
- When shadcn asks to overwrite components/ui/button|input|card|badge|table|label, answer No.
- No secrets, no new env vars.

TOKENS
Put these in app/globals.css, scoped to <div class="mk" data-theme="dark|light">. Bridge them into @theme inline as --color-mk-*, --radius-mk-*, --shadow-mk-*.

dark
- bg #07090C, bg-2 #0B0E13, surface #10141A, surface-2 #161B23
- line rgba(255,255,255,.08), line-2 rgba(255,255,255,.14)
- text #F2F4F7, muted #9AA3B2, subtle #6B7482
- accent #34E0A1, accent-ink #04130D, glow-only #38C6E0
- warn #F5B455, danger #F87171
- CTA shadow: 0 0 0 1px rgba(52,224,161,.5), 0 8px 30px -8px rgba(52,224,161,.55), inset 0 1px 0 rgba(255,255,255,.35)
- window shadow: 0 40px 120px -30px rgba(0,0,0,.9), 0 -20px 80px -40px rgba(52,224,161,.35)
- radii: chip 8, button 10 (lg 12), panel 14, window 18, card 20, CTA 24

light
- bg #F7F5F0, surface #FFF, surface-2 #F1EEE7, line #E6E1D7, line-2 #D9D3C7
- text #121212, muted #5F5A52, subtle #8C867C
- accent #0B6E4F, accent-bright #12A579, accent-soft #E3F3EC, accent-ink #FFF
- warn #A15C07, danger #B42318, dark band #111214
- pill buttons (radius 999); primary shadow 0 10px 30px -10px rgba(11,110,79,.7)
- card shadow: 0 1px 2px rgba(20,20,20,.04), 0 12px 32px -12px rgba(20,20,20,.10)

type (Geist)
- display 76/1.02/-0.045em/600 (mobile 44; light max 72)
- H2 48/1.08/-0.035em (light 50/1.06/-0.04em)
- H3 20/1.3, lead 19/1.55, body 15/1.6
- kicker: Geist Mono 12px, .14em, uppercase, accent
- chips 11.5, mono 12.5
- container 1200px, gutters 32 (mobile 20), sections 112px

terminal tags
- IN rgba(56,198,224,.12) / #7FDDF0
- AU rgba(255,255,255,.07) / #B6BFCC
- RS rgba(245,180,85,.12) / #F5C27A
- EG neutral outline, NOT violet: rgba(255,255,255,.03) / #E2E8F0 + inset 1px rgba(255,255,255,.14)
- DS rgba(52,224,161,.12) / #6EF0BD

SHARED FOUNDATIONS
Create these if missing. If the dashboard prompt already created them, reuse them.
- app/fonts.ts
  * next/font/google: Geist --font-geist, Geist_Mono --font-geist-mono, IBM_Plex_Sans_Arabic (weights 400-700, subsets arabic) --font-plex-ar
  * put --app-font-sans on :root and swap the family order under [dir=rtl]
- lib/motion/{tokens,variants,features}.ts
  * ease.out [0.16,1,0.3,1], hover .14s, reveal .7s, spring 400/30
  * stagger: dashboard .025 (cap 12), marketing .07
- hooks/use-reduced-motion-safe.ts, plus useAmbientAllowed
- components/providers/{motion-provider,app-providers}.tsx
  * DirectionProvider (shadcn "direction") → LanguageProvider → LazyMotion (domMax, lazy) + MotionConfig reducedMotion="user"
- components/shell/language-context.tsx
  * useLanguage(): {language, setLanguage, toggleLanguage, dir, isArabic}
  * setLanguage writes localStorage 'helix.lang' AND cookie 'helix-lang', sets html lang/dir, then router.refresh()
  * if the Lead Gen V2 work already created this file, keep its API and add these as aliases
- lib/i18n/server.ts: getLang() from the cookie, dirOf, formatNumber (ar-AE / en-US)

INSTALLS
- pnpm add motion @number-flow/react sonner
- components.json: add "rtl": true
- pnpm dlx shadcn@latest add direction toggle-group tabs sheet dialog tooltip accordion navigation-menu kbd separator
- pnpm dlx shadcn@latest migrate rtl components/ui
- Registry items (pnpm dlx shadcn@latest add ...):
  @magicui/animated-shiny-text @magicui/border-beam @magicui/animated-beam @magicui/animated-list @magicui/blur-fade @magicui/shine-border @magicui/shimmer-button @magicui/dot-pattern @magicui/marquee @react-bits/BlurText-TS-TW @react-bits/LogoLoop-TS-TW @react-bits/SpotlightCard-TS-TW @react-bits/LightRays-TS-TW @aceternity/timeline
  Fallback direct URLs:
  * https://magicui.design/r/<name>.json
  * https://reactbits.dev/r/<Name>-TS-TW.json
  * https://ui.aceternity.com/registry/<name>.json
- Place them in components/magicui|reactbits|aceternity and add a reduced-motion guard to each.
- Migrate every framer-motion import to motion/react (rg -l "framer-motion"; known files: components/studio/studio-motion-demo.tsx, studio-agent-ide.tsx), then pnpm remove framer-motion.
- Never add gsap, three, lenis, vaul, @tremor/react, cursor effects, or per-letter text effects.

STRUCTURE
- Create app/(marketing)/layout.tsx:
  * mk wrapper with data-theme from the cookie "helix-mk-theme" (default dark) + an inline no-flash script
  * SiteNav with getNavAuth() props
  * <main id="main">
  * SiteFooter
- git mv into app/(marketing)/: page.tsx, pricing, studio, about, updates, faq, contact, team, privacy, terms. URLs stay the same. Remove each page's own PillNav/HelixFooter.
- Home is composed from components/marketing/home/{hero,product-window,integrations-strip,live-demo,systems-bento,how-it-works,pricing-teaser,testimonial-slot,final-cta}.tsx.
- Keep getPublicFaqs() + FaqAccordion (restyled, placed above the CTA) and the JSON-LD.

PAGE CONTENT (match the PNGs)

Nav
- Helix mark + "Helix".
- Pill links: Systems (/#systems) · Lead Gen (/lead-gen, else /#systems) · How it works (/#how) · Pricing (/pricing) · Studio (/studio).
  AR: الأنظمة · توليد العملاء · كيف نعمل · الأسعار · الاستوديو
- EN|عربي pill.
- Sign in (/login), or Console when authenticated.
- Primary "Build my system →" (AR "ابنِ نظامك") → https://helixx.xo.je/build.
- Mobile: brand + عربي + menu button → shadcn Sheet.

Hero
- CSS backdrop: mint radial ellipse 55% 42% at 50% -4% (.26), cyan 30% 28% at 78% 6% (.16), masked 64px grid, 5 blurred rays at 18/8/-4/-14/-24deg. LightRays on desktop only, after idle.
- Eyebrow (AnimatedShinyText): "New · Lead Gen v2 — enrich websites or find leads by search ›"
  AR: "جديد · توليد العملاء v2 — أثرِ بيانات المواقع أو ابحث عن عملاء جدد"
- H1: "AI systems that answer, qualify and book — <em>in Arabic and English.</em>"
  AR: "أنظمة ذكاء اصطناعي تردّ وتؤهّل وتحجز — <em>بالعربي والإنجليزي.</em>"
  Gradient text #FFF→#A9B2C0; em mint→cyan; BlurText by WORDS, 60ms.
- Lead:
  EN: "Helix builds and runs WhatsApp & voice receptionists, lead generation and CRM automations on n8n — with a console that shows exactly what every agent did."
  AR: "نبني ونشغّل موظفي استقبال على واتساب والهاتف، وتوليد العملاء، وأتمتة إدارة العملاء على n8n — مع لوحة تحكم تُظهر بالضبط ما فعله كل وكيل."
- CTAs: "Build my system →" and "▷ Watch a live run" (scrolls to #demo).
- Micro: "7-day unrestricted trial · No credit card required · Gulf Arabic + English".

Product window (540px tall, radius 18, BorderBeam 8s, grid 300px 1fr 300px)
- Title bar: "helix · console / Live run — Missed-call triage" + SAMPLE RUN and Streaming chips.
- Left "Pipeline", 6 steps with AnimatedBeam:
  1. Missed call detected — 00:00.012 · Vapi SIP ✓
  2. Caller parsed · AE — 00:00.045 · HMAC verified ✓
  3. WhatsApp sent (ar_AE) — 00:00.134 · template ✓
  4. Qualifying intent… — running
  5. Book on Cal.com — waiting
  6. Write to CRM — waiting
- Middle: WhatsApp "+971 50 *** 4182", "Dental clinic · example tenant". Arabic bubbles via AnimatedList, 1.2s apart, then freeze:
  مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟
  أبغى أحجز موعد تنظيف أسنان بكرة العصر
  تمام! عندنا ٤:٣٠ أو ٥:١٥ مساءً. أي وقت يناسبك؟
  ٥:١٥ ممتاز
- Right "This run":
  * First reply: NumberFlow 4.2s + SAMPLE VALUE
  * Intent: Booking·cleaning, Probable, bar at 72%
  * Next action: Hold 17:15 on Cal.com, "Needs confirmation from caller"
- Mobile: a single card as in mobile_hero.png, no beam/WebGL.

Integrations
- LogoLoop of text wordmarks: n8n, WhatsApp Cloud API, Cal.com, Google Calendar, Supabase, Vapi, HubSpot, Google Sheets, Meta Ads, Tap, Moyasar, Paymob.
- Label: "PLUGS INTO THE TOOLS YOU ALREADY RUN · integrations, not endorsements".
- Track dir=ltr, reversed in AR, 40s loop.

Live demo (#demo, grid 420px 1fr)
- H2: "Watch a system run, step by step."
- Systems: 01 Missed-call triage / 02 Voice receptionist / 11 Lead qualification. layoutId pill; preselect from ?system=.
- Restyled live-agent-terminal: #0B0D10, Geist Mono 12.5/1.95, DEMO SCRIPT chip, dir=ltr, honest example-tenant scripts.

Catalog (#systems)
- H2: "Production systems, not chatbots."
- Core / Preview add-ons / All ToggleGroup.
- Hand-built 6-column bento (spans 4+2, 2+2+2, 3+3) with SpotlightCard.
- Data and prices from lib/studio/templates.ts.

How it works (#how)
- H2: "From brief to live system — you see every step."
- 4 steps: Describe the workflow / We build it on n8n / Test on your phone / Run it in the console.
- Scroll-drawn line (Aceternity Timeline technique).

Pricing
- H2: "Start with 7 days, unrestricted."
- Region + currency ToggleGroups; NumberFlow prices; featured plan with ShineBorder; real data only.

Testimonials, CTA, footer
- Testimonial slot hidden by default. The dashed placeholder shows only when a flag is on.
- CTA card: "Tell us the workflow. We'll build the system." + ShimmerButton "Start at helixx.xo.je/build ↗" + "Talk to us on WhatsApp".
- Honest footer: Product / Company / Legal, /privacy, /terms, © year.

Light theme (wave F4)
- Same layout. Cookie helix-mk-theme; no-flash inline script.
- Follow OS light only when there's no cookie and FOLLOW_SYSTEM_WHEN_UNSET=true in lib/theme.ts.
- DotPattern instead of rays; em = accent with a highlighter bar; pill buttons; dark featured plan card; live-demo section on a dark rounded band.

WAVES
- F0: foundations + route group + nav/footer
- F1: hero + product window + integrations
- F2: live demo + catalog + how it works
- F3: pricing + FAQ + CTA + footer polish
- F4: Daylight Paper theme + toggle
- F5: /studio and /pricing polish, new /lead-gen page, other pages, sitemap, delete dead files (pill-nav, helix-footer, lightfall* only if unused), DESIGN-SPEC v4 §16-§18

ACCEPTANCE (every wave)
- pnpm lint && pnpm exec tsc --noEmit && pnpm build pass.
- rg "framer-motion" is empty (from F0 on).
- Visual match against the attached PNGs at 1440px and 390px.
- عربي mode matches marketing_ar_rtl_hero.png, with <html dir="rtl"> in the server HTML.
- With DevTools reduced motion, nothing moves and end states are complete.
- No changes under app/dashboard, app/admin, features, app/api.
- From F1 on: Lighthouse mobile ≥90, CLS <0.05.

End with a summary covering:
- files changed
- build route-table changes (static→dynamic)
- every TODO(...) left
- the flagged pricing claims
- this question: "Which price system should the site show — /studio USD per-system or /pricing AED tiers?"

Run wave: F__
```
