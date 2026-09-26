# Helix AI — Website Blueprint v5 "Quiet Authority"

**Status:** proposal for Ziad Sabry's approval. No code has been changed. The repo was not cloned or edited; the only repo reads were public files fetched read-only.
**Date:** 2026-09-26 (Africa/Cairo) · **Author:** executor agent for Ziad Sabry · **Supersedes (once approved):** marketing "Night Signal" (M1) and dashboard "Warm Command 2.0" from `01-helix-ai-platform/design-research/` and the branch `cursor/design-overhaul-night-signal-5b67` (PR #4).
**Mockups:** `mockups/*.png` (rendered from `mockups/*.html`; sources and build script in `mockups/_src/`). Reference captures: `research/reference-sheet-1.png`, `research/reference-sheet-2.png`.

---

## 0. What went wrong in v4, in one paragraph

The v4 build (PR #4) was designed for someone who *builds* automation, not someone who *buys* it. The home hero is a developer terminal (`EGRESS`, `idempotency_key`, `Llama-3.3-70b`, `UPSERT INTO public.contacts`, "E2E latency 142ms", a "DEMO SCRIPT" badge). It breaks Arabic by setting it in a monospace font inside an LTR log. The login page repeats the mistake the other way round. A 50%-wide dark slab holds one sentence and a placeholder box ("Platform status will appear here shortly"), and a small card floats in a beige void. Neon mint, glow, chips and badges everywhere add up to "side project", not "a firm I trust with my front desk". A clinic owner in Dubai or Riyadh has no reason to care about webhooks. They care that the phone gets answered, bookings land in the calendar, and nobody embarrasses the business. v5 designs for that person.

---

## 1. Buyer and positioning

### 1.1 Who buys
| | Primary buyer | Secondary buyer |
|---|---|---|
| Who | Owner or general manager of a single-site or small multi-site business: dental and medical clinics, aesthetics, real-estate brokerages, home and maintenance services, legal and auto services (verticals from `lib/studio/templates.ts`). GCC first (UAE, KSA, Qatar, Kuwait, Bahrain, Oman), then Jordan and Egypt (system bible §1). | Clinic or office manager, head of sales, marketing lead who runs the ads. |
| Buys on | WhatsApp, a referral, or a discovery call. Reads the site on a phone, often in Arabic. Checks price before calling. | Desktop, compares plans, forwards to the owner. |
| Language | Arabic first for many, English for others. Mixed messages are normal. | Often English. |

### 1.2 What they fear
1. **Losing customers they already paid to attract.** Missed calls after hours, slow replies to ad leads.
2. **Embarrassment.** A robot that sounds foreign, gets the dialect wrong, invents a slot, or messages a patient at midnight.
3. **Being locked in, or paying for something they can't see.** Retainers with no visible output.
4. **Tech they have to manage.** Another app, another login, another thing staff must learn.
5. **Agencies that over-promise.** Inflated case studies and fake logos are common in this market, and buyers know it.

### 1.3 What makes them pay
- Seeing *their* scenario working. A missed call becomes a WhatsApp reply in their dialect, which becomes a booking in their calendar.
- A clear price in their currency (AED) with a one-time setup and a monthly fee.
- Proof of control: "a person takes over when needed", "stop is honoured", "you keep ownership after go-live".
- A founder who answers. For a young firm, a named person and a live demo count for more than a logo wall.

### 1.4 Positioning line
**EN:** Helix builds and runs AI systems that answer, qualify and book, in Arabic and English, for clinics, real-estate and service businesses across the GCC and MENA.
**AR:** تبني Helix وتشغّل أنظمة ذكاء اصطناعي ترد على عملائك وتؤهّلهم وتحجز مواعيدهم، بالعربي والإنجليزي، للعيادات وشركات العقار وأعمال الخدمات في الخليج والشرق الأوسط.

### 1.5 The one feeling per page
| Page | Feeling | Evidence on the page |
|---|---|---|
| Home | "This is exactly my problem, and these people have it handled." | Outcome hero (phone + booking), plain-language how-it-works, founder note |
| Pricing | "I know what I'll pay and what I get. No tricks." | Three AED plans, setup fee shown, "every plan includes", no fine-print games |
| Studio | "I can start small and see the cost of each piece." | Per-system USD prices, running total, "book a call to confirm" |
| System detail | "I can picture this running in my business tomorrow." | Scenario visual, steps, what we need from you, rules it follows |
| About | "Real people, honest, local." | Founder, principles, how we work, where we work |
| Contact / Book a call | "Talking to them is easy and low-risk." | Short form, WhatsApp option, what happens next |
| Login / Signup / Forgot | "A calm, serious product." | Centred form on a full canvas, a brand panel showing real value, no placeholders |
| Dashboard | "My front desk is working, and I'm in control." | Plain-language summary, needs-your-decision queue, activity feed |

---

## 2. Research: premium references and what to borrow

All sites were visited 2026-09-26 with WebFetch. Each row names one concrete pattern to borrow.

Playwright captures at 1440 px are in the contact sheets in `research/`:
- `reference-sheet-1.png`: Attio pricing, Clerk, Foodics AR, Fractional, Intercom Fin, and Linear login. The Linear login capture came out blank (spinner only).
- `reference-sheet-2.png`: Maqsam EN/AR, Retool, Stripe login, Stripe pricing, Tabby AR, and Vercel login.

The Linear, Attio and Stripe home pages were read as text only. Existing captures of Linear and Attio are in `design-research/references/reference_sites_sheet.png`.

| # | Site | URL | Pattern worth borrowing | Where it lands in Helix |
|---|---|---|---|---|
| 1 | **Intercom Fin** | https://www.intercom.com/fin | An editorial serif headline on a warm off-white page, with one large sculptural object as the only ornament. It sells AI to business buyers with numbered, plain-English reasons ("01 … 22 reasons to hire Fin") and a named deployment team. | Serif display type (Instrument Serif), warm ivory light theme, numbered "why it matters" rows, founder/team as trust instead of logos |
| 2 | **Stripe** | https://stripe.com · https://stripe.com/pricing · https://dashboard.stripe.com/login | The pricing page splits into two clear offers ("Standard" and "Custom") with one sentence of explanation each. The login is a centred form on a full, quiet canvas, with no side slab. "Professional services" is presented as a calm block. | AED plans plus a separate "Custom build, let's scope it" row; login/forgot pattern; restraint |
| 3 | **Linear** | https://linear.app | The real product UI is the hero object, built with hairline borders, low-contrast surfaces and one accent. Principles are numbered and captioned ("Fig 0.1"). Motion is subtle. | Dashboard preview section on the home page, hairline system, surface ladder |
| 4 | **Attio** | https://attio.com · https://attio.com/pricing | Product *artifacts* (a meeting transcript, a pipeline card, an agent answer) show the outcome instead of abstract illustration. Clean 4-column pricing with a monthly/annual toggle and a dark "Continue with Pro" CTA on the featured plan. | Hero phone + calendar card + missed-call card; systems cards with mini UI vignettes; featured plan inverted |
| 5 | **Clerk** | https://clerk.com | Auth-component craft: generous field heights, clear labels, one primary action, a centred headline on a subtle grid. | Login/Signup field anatomy (52 px inputs, label-above, link-in-label for "Forgot password?") |
| 6 | **Vercel login** | https://vercel.com/login | Absolute minimalism: one column, one decision, and nothing else on screen. | Mobile login (390) and the forgot/reset flows |
| 7 | **Retool** | https://retool.com | The CTA pair "Book a demo" / "Start for free", and outcome stories framed as business results ("saved $8M and 20,000+ hours"). Borrow the structure only; Helix has no results to quote yet. | CTA pair "Book a discovery call" + "Chat on WhatsApp"; structure for future case studies |
| 8 | **Maqsam** (Jordan/KSA, Arabic AI agent) | https://maqsam.com · https://maqsam.com/ar | The closest regional analogue: an Arabic-first AI agent that sells "understands different Arabic dialects", "handles mixed-language queries", "smart escalation to human agents". It has a true mirrored Arabic site and lists local phone numbers per country as trust. | Region section ("Speaks like your front desk. Follows your rules."), human hand-off, dialect chips; mirrored AR layout |
| 9 | **Foodics** (KSA) | https://www.foodics.com/ar/ | An Arabic RTL hero with confident, large Arabic type. Real photography of regional businesses and people. A "request a demo" primary CTA. Per-country phone numbers in the header. | AR typography scale (Plex Arabic 600, 60–64 px), future photography policy (real clients only), "Book a call" as the primary CTA |
| 10 | **Tabby** (UAE) | https://tabby.ai/ar-AE | Big, friendly Arabic display type and very short headlines. Trust is stated as a fact ("Regulated by the UAE Central Bank") rather than a badge wall. | Short AR headlines; trust stated as plain sentences |
| — | *Anti-pattern:* **Fractional AI** | https://www.fractional.ai | An AI services agency with a dark-blue particle wave, a gradient "AI Transformation" headline and a logo wall. This is the generic "AI agency" look that v4 drifted towards. | Avoid: gradient text, particle backgrounds, vague "transformation" copy |

Also used from the existing library: `design-research/references/measured_hero_type.txt` (hero type measured on Linear, Vercel, Resend, Raycast, Attio, Clay, n8n, Relevance). It confirms that premium heroes sit at 56–88 px with tight tracking and one accent.

---

## 3. Visual system

### 3.1 Principles
1. **Outcome over mechanism.** Show the reply, the booking and the calendar, never the pipeline.
2. **One idea per viewport.** Each section has one headline, one visual, and at most one primary action.
3. **Quiet surfaces, loud type.** Big serif headlines, calm neutral surfaces, one accent used sparingly.
4. **Honest by construction.** Every illustrative number sits inside a visibly labelled "Example" surface. There are no logos, testimonials, uptime claims or counters without a source.
5. **Arabic is a first language, not a translation.** The layout mirrors, Arabic has its own type scale, and Arabic never appears in a monospace font.

### 3.2 Typography
| Role | English | Arabic | Notes |
|---|---|---|---|
| Display (H1, H2, big quotes, plan CTA headlines) | **Instrument Serif** 400, italic for one emphasised phrase | **IBM Plex Sans Arabic** 600 | Serif display in EN signals "premium service, not dev tool". In AR, Plex 600 gives the same authority; Arabic display is never italic. The emphasis phrase uses colour instead. |
| UI and body | **Geist** 400/500/600 | **IBM Plex Sans Arabic** 400/500 | Geist is already in the stack. Plex Arabic is required by the brief. |
| Numbers | Geist, `font-variant-numeric: tabular-nums` | Same (Latin digits via `ar-AE` for prices, KPIs and times in data). Arabic-Indic digits only inside conversational chat mock-ups. | Prices are wrapped in `<bdi>`. |
| Mono | Geist Mono, **only** for timestamps in the scenario strip (EN) and kbd hints in the dashboard | **Never** for Arabic | The v4 terminal font is removed from marketing. |

Scale (desktop 1440 / mobile 390):
| Token | EN desktop | EN mobile | AR desktop | AR mobile | Line-height EN / AR | Tracking EN |
|---|---|---|---|---|---|---|
| display-xl (home H1) | 76 | 46 | 64 | 40 | 1.00 / 1.30 | -0.015em |
| display-l (page H1: Pricing, About) | 72 | 44 | 58 | 38 | 1.02 / 1.30 | -0.015em |
| display-m (H2) | 54 | 36 | 42 | 30 | 1.04 / 1.35 | -0.015em |
| display-s (CTA band, quotes) | 46 / 34 | 34 / 26 | 40 / 28 | 30 / 24 | 1.1 / 1.4 | -0.01em |
| h3 (card title) | 22 / 500 | 20 | 21 / 600 | 19 | 1.3 / 1.5 | -0.01em |
| lead | 19 | 17 | 19 | 17 | 1.6 / 1.85 | 0 |
| body | 16 | 16 | 16 | 16 | 1.6 / 1.8 | 0 |
| small | 14 | 14 | 14.5 | 14.5 | 1.5 / 1.7 | 0 |
| kicker (uppercase EN) | 12.5 / 500 / +0.08em | 12.5 | 14 / 500, no uppercase, no tracking | 14 | — | +0.08em |
| dashboard page title | Geist 28 / 600 | 24 | Plex 26 / 600 | 22 | 1.2 | -0.02em |

Rules: sentence case everywhere. Arabic always uses `letter-spacing: 0`. Body text is at least 14 px (at least 14.5 px in Arabic). Chips and kbd may go to 11.5 px in EN only. Load fonts with `next/font/google` (`Instrument_Serif`, `Geist`, `Geist_Mono`, `IBM_Plex_Sans_Arabic`) using `display: swap`, and subset Arabic.

### 3.3 Colour
The brand mark stays exactly as-is: the three-segment geometric H (`03-brand-and-agency/logo/helix-h-mark*.svg`), white on dark and #111 on light, with the spaced wordmark **HELIX** (Geist 600, 14 px, tracking 0.3em). The chrome/silver `helix-logo-full.png` is reserved for print, OG images and the About hero; it is never used as a small UI icon. Emerald stays the accent (repo and research agree), but it is deepened and used only for **outcomes** (booked, confirmed, running) and links. **Primary buttons are neutral** (ivory on dark, ink on light), the way Linear, Vercel and Stripe do it. That one decision removes most of the "neon" feel.

| Token | Dark (marketing default) | Light (pricing, auth form side, dashboard) | Use |
|---|---|---|---|
| `--bg` | `#0A0B0D` | `#F7F5F0` (warm ivory) | Page |
| `--bg-2` | `#0E1012` | `#F1EEE7` | Alternate band, sidebar |
| `--surface` | `#131518` | `#FFFFFF` | Cards |
| `--surface-2` | `#191C20` | `#FAF9F6` | Nested, inputs on dark |
| `--surface-3` | `#20242A` | `#F1EEE7` | Selected segment, avatars |
| `--line` | `rgba(255,255,255,.075)` | `rgba(22,24,20,.08)` | Hairlines |
| `--line-2` | `rgba(255,255,255,.13)` | `rgba(22,24,20,.14)` | Inputs, ghost buttons |
| `--text` | `#F2F0EB` | `#15171A` | Primary text |
| `--text-2` | `#B4B1A9` | `#51545A` | Secondary (AA on bg) |
| `--text-3` | `#7F7C75` | `#8A8C90` | Meta, captions (large or non-essential text only) |
| `--accent` | `#5FD4A4` | `#0E6E4F` | Outcome states, links, check icons |
| `--accent-text` | `#8EDFBF` | `#0E6E4F` | Emphasised headline phrase (EN italic), links on dark |
| `--accent-soft` | `rgba(95,212,164,.10)` | `#E4F1EA` | Chip and icon wells |
| `--btn-bg / --btn-text` | `#F2F0EB / #0A0B0D` | `#15171A / #FFFFFF` | Primary button |
| `--warn` | `#E8A33D` | `#B7791F` on `#FBEFD9` | "Missed call", "needs your decision" only |
| `--danger` | `#E5484D` | `#C62A2F` | Errors only |

Rules: one accent hue, no purple, violet, indigo or cyan glow. Gradients are allowed only as (a) one radial glow behind the hero visual (at most 16% alpha) and (b) a very faint radial on the final CTA band. At most one glow per viewport. Dark is the marketing default; light is a full theme (Pricing and the dashboard are shown in light in the mockups). The theme switcher lives in the footer and follows the OS on first visit. Contrast: `--text-2` on `--bg` is AA in both themes; `--text-3` is never used for body copy.

### 3.4 Spacing, grid, breakpoints
- 4 px base, 8 px rhythm. Section padding 128 px desktop / 80 px mobile, and 48–80 px between related sections.
- Container 1200 px content (32 px side padding at 1440, 20 px at 390). 12-column grid, 24 px gutters.
- Breakpoints: 390 (base) · 640 · 1024 · 1280 · 1440. Everything must work from 360 px up.
- Section head: kicker → 18 px → H2 → 20 px → lead (max 720 px) → 56 px → content.

### 3.5 Radius, borders, shadows
- Radius: 8 (chips, kbd) · 10–12 (inputs, dashboard buttons) · 16 (dashboard panels, float cards) · 24 (marketing cards) · 28–32 (feature panels, CTA band) · 999 (marketing buttons, pills) · 48 (phone frame).
- Borders: 1 px hairline on every surface. Selection uses an ink border plus a 4 px soft ring, never a coloured shadow.
- Shadows: dark theme uses an inset top highlight plus a long, soft drop (`0 24px 48px -24px rgba(0,0,0,.6)`) only on floating objects. Light theme: `0 1px 2px rgba(20,22,18,.04), 0 12px 32px -16px rgba(20,22,18,.14)`.

### 3.6 Imagery and illustration
- **Product vignettes, drawn in HTML/CSS/SVG:** a phone with a WhatsApp-style thread (neutral chat UI, no WhatsApp logo), calendar tiles, missed-call cards, mini dashboard panels. They are built as components so they stay crisp, localised and themeable.
- Every vignette carries fictional, clearly labelled content ("Example Dental Clinic", "Illustrative example · fictional clinic, names and times").
- **Photography:** none at launch. Later, only real Helix clients or team photos taken with permission. No stock photos of "Arab businessmen shaking hands", no AI-generated people.
- No 3D blobs, particles, orbs, globes, circuit boards, robots or sparkles.

### 3.7 Iconography
Lucide, stroke 1.5, 16/20/24 px, `currentColor`. Icons sit bare or in a 28–36 px soft well only inside product vignettes. There are no icon-tile grids for feature lists. Directional icons (arrows, chevrons) flip in RTL (`[dir=rtl] .arrow{transform:scaleX(-1)}`).

### 3.8 Motion
- Purpose-only, 150–250 ms UI and 400–600 ms reveals, `cubic-bezier(.2,.7,.2,1)`.
- Hero: chat bubbles appear one by one (400 ms stagger) once on first view, then the booked card rises 8 px and fades in. No loop. Under `prefers-reduced-motion` the final state renders immediately.
- Sections: 12 px rise and fade on first entry, once.
- How-it-works tabs: crossfade the 4 step cards; the dashed connector draws in 600 ms.
- Prices: plain text changes (no rolling counters needed with a single currency).
- Banned: marquee logo tracks, typewriter terminals, parallax, cursor followers, continuous glows or beams, WebGL backgrounds.

### 3.9 Banned on marketing and auth (hard)
Terminal or CLI logs; any of these words in visible copy: webhook, egress, idempotency, UPSERT, tenant, LLM model names, latency ms, n8n, Supabase, HMAC (they may appear only in docs or a technical FAQ). Also banned: "DEMO SCRIPT"/"SAMPLE RUN" badge clutter (use one dashed **Example** chip per surface), neon glow text, gradient text, more than one glow per viewport, placeholder panels ("…will appear here shortly"), empty dark slabs, logo walls, testimonials, counters or uptime without a source, fake "trusted by", emoji in UI, "coming soon", countdowns, purple.

### 3.10 Copy voice and honesty
- Plain, calm, specific, second person ("your front desk"). Numbers only when real or labelled **Example**.
- These claims must **not** appear anywhere: "99.9% uptime", "zero hallucinations", "Cryptographic Ground-Truth Evidence Ledger", "Dedicated Technical Account Manager in Dubai/Riyadh". They are currently in `lib/pricing/tiers.ts` (see §8.3).
- Words to use: *reply, book, confirm, hand over, your team, your calendar, your WhatsApp number, you keep ownership*.
- Arabic copy is written for Gulf readers in clear MSA with light Gulf flavour in chat examples (أبغى، هالأسبوع). Keep it respectful and warm, never slangy in headlines.

### 3.11 Token block (drop-in for `app/globals.css`, scoped)
```css
.hx{ --f-display:var(--font-instrument-serif); --f-sans:var(--font-geist); --f-ar:var(--font-plex-arabic); }
.hx[data-theme="dark"]{ color-scheme:dark; --bg:#0A0B0D; --bg-2:#0E1012; --surface:#131518; --surface-2:#191C20; --surface-3:#20242A;
  --line:rgba(255,255,255,.075); --line-2:rgba(255,255,255,.13); --text:#F2F0EB; --text-2:#B4B1A9; --text-3:#7F7C75;
  --accent:#5FD4A4; --accent-text:#8EDFBF; --accent-soft:rgba(95,212,164,.10); --btn-bg:#F2F0EB; --btn-text:#0A0B0D; --warn:#E8A33D; }
.hx[data-theme="light"]{ color-scheme:light; --bg:#F7F5F0; --bg-2:#F1EEE7; --surface:#FFFFFF; --surface-2:#FAF9F6; --surface-3:#F1EEE7;
  --line:rgba(22,24,20,.08); --line-2:rgba(22,24,20,.14); --text:#15171A; --text-2:#51545A; --text-3:#8A8C90;
  --accent:#0E6E4F; --accent-text:#0E6E4F; --accent-soft:#E4F1EA; --btn-bg:#15171A; --btn-text:#FFFFFF; --warn:#B7791F; }
[dir="rtl"] .hx{ font-family:var(--f-ar); letter-spacing:0 }
```
The full reference implementation of these tokens and components is `mockups/_src/v5.css`.

---

## 4. Global components

### 4.1 Site nav (marketing)
76 px tall, transparent over the page, and it gains `--bg` at 85% with a hairline once you scroll (no blur). Left: H mark 24 px + HELIX wordmark. Centre: Systems · How it works · Pricing · Studio · About. Right: language toggle (EN | ع) · Sign in · **Book a call** (primary, small).
AR: الأنظمة · كيف نعمل · الأسعار · الاستوديو · من نحن | تسجيل الدخول | **احجز مكالمة**. The whole bar mirrors; the logo lockup stays LTR.
Mobile: logo + menu icon. The sheet menu is full-screen `--bg` with 28 px links, Book a call as a full-width primary and Sign in as ghost.

### 4.2 Footer
Brand block ("AI systems that answer, qualify and book, in Arabic and English. For businesses across the GCC and MENA." / "أنظمة ذكاء اصطناعي ترد وتؤهّل وتحجز، بالعربي والإنجليزي. للأعمال في الخليج والشرق الأوسط."), columns Product (Systems, Studio, Pricing, Client sign in) · Company (About, Contact, Updates) · Legal (Privacy, Terms), bottom row © 2026 Helix · language · theme. No status badge. No "CRM, ERP" tagline.

### 4.3 CTA rules
The primary CTA site-wide is **Book a discovery call / احجز مكالمة تعريفية**, which opens `/contact` (the booking form). Its fallback is https://helixx.xo.je/build until `/contact` is live. The secondary CTA is **Chat on WhatsApp / راسلنا على واتساب** (a `wa.me` link to Helix's business number, which **Ziad must provide**). "Start free trial" is removed from marketing until Ziad confirms the trial offer (open question Q3).

### 4.4 Currency rule (fixed decision)
- **/pricing and the home pricing teaser:** AED monthly plans only, captioned "Monthly plans · AED / الباقات الشهرية · درهم", with a link "Buying a single system? See per-system prices in Studio → / تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو ←".
- **/studio and /systems/[slug]:** USD per-system (setup + monthly) only, captioned "Per-system pricing · USD · one-time setup + monthly / تسعير لكل نظام · دولار · إعداد لمرة واحدة + شهري", with a link "Prefer a bundled monthly plan? See plans in AED → / تفضل باقة شهرية مجمّعة؟ شاهد الباقات بالدرهم ←".
- **Structural change from v4:** the home systems catalogue shows **no prices**. It links to Studio instead, so the home page carries only one currency (AED, in the teaser). v4 had USD in the catalogue and AED in the teaser on the same page.
- Values are always rendered from data (`lib/pricing/tiers.ts` / `getPricingConfigs()`, `lib/studio/templates.ts`), never hard-coded.

---

## 5. The new hero (replaces the CLI terminal)

Mockups: `mockups/home-dark-1440.png` (top), `mockups/home-mobile-390.png` (top), `mockups/home-ar-rtl-1440.png` (top).

### 5.1 Layout (1440)
- Grid `1fr 500px`, gap 40, min-height 700, vertically centred under the 76 px nav. The text column is about 596 px wide.
- **Text column:** eyebrow pill (32 px tall, hairline, 6 px accent dot) → 34 px → H1 display-xl → 28 px → lead (max 520 px) → 40 px → CTA pair → 40 px → trust row (three check items, 14 px, `--text-2`, check icon in `--accent`).
- **Visual column (500 × 680, `position:relative`):**
  1. One radial glow, 560 px, `rgba(95,212,164,.16)` → transparent, behind the phone.
  2. **Phone** 300 × 620, radius 48, 10 px bezel `#0c0d0f` + 7 px outer ring `#1b1d21`, island 92 × 26. Placed at x = 196 (flush right), y = 24. Screen: status bar (9:44), chat header (green avatar "ع", name "عيادة المثال لطب الأسنان", sub "حساب أعمال · نشط الآن"), a light chat body `#EFEAE2` with a 14 px dot texture, and an input bar. **The whole screen is `dir="rtl"` and uses IBM Plex Sans Arabic 13/1.65**, even on the English page. It is the customer's view.
  3. **Missed-call card** (float card, 236 px) at x = −8, y = 92: amber icon well + "Missed call · 9:41 PM" / "+971 50 ••• 4182" (in `<bdi dir=ltr>`, masked) / "After hours. Nobody at the desk."
  4. **Booked card** (248 px) at x = −36, y = 486: green icon well + "Appointment booked" / "Added to your calendar", divider, then a calendar tile (THU / 6:15) + "Teeth cleaning · PM" / "New patient · via WhatsApp" / "Reminder set for Wednesday".
  5. Caption under the phone, 12 px `--text-3`: "Illustrative example · fictional clinic, names and times" / "مثال توضيحي · العيادة والأسماء والأوقات غير حقيقية".
- **Scenario strip** (full container width, 24 px below the grid, radius 20, hairline, 5 columns `190px 1fr 1fr 1fr 1.25fr`): dashed chip **EXAMPLE SCENARIO** + "One missed call, start to finish" | 9:41 PM · Call missed after hours | 9:41 PM · WhatsApp reply sent | 9:44 PM · Booked for Thursday | serif 22 px "Nobody on your team had to pick up the phone." Timestamps are Geist Mono in EN and Plex Arabic in AR.

### 5.2 Chat script (exact, customer view)
| Side | Text | Time |
|---|---|---|
| Business (white, right in RTL) | مساء الخير، معك عيادة المثال لطب الأسنان. لاحظنا اتصالك قبل قليل ولم نتمكن من الرد. كيف نقدر نخدمك؟ | 9:41 PM |
| Customer (green, left) | أبغى أحجز تنظيف أسنان هالأسبوع | 9:42 PM |
| Business | أكيد. هل هذه أول زيارة لك عندنا؟ | 9:42 PM |
| Customer | إيه، أول مرة | 9:42 PM |
| Business | حيّاك الله. المتاح: الأربعاء ٤:٣٠ م أو الخميس ٦:١٥ م. أي وقت يناسبك؟ | 9:43 PM |
| Customer | الخميس ٦:١٥ | 9:43 PM |
| Business | تم تأكيد موعدك الخميس ٦:١٥ م. بنرسل لك تذكير قبلها بيوم. | 9:44 PM |

It demonstrates all three promises: an instant reply after a missed call, qualification (service, timing, new or returning), and a booking from real slots with a reminder (system bible §5.1–5.2: "never invent slots", T-24h reminders). The EN page keeps the chat in Arabic on purpose, because it proves the dialect claim. The EN locale may offer an "English" toggle under the phone that swaps to an English script with the same structure (optional, P2).

### 5.3 Copy
| | EN | AR |
|---|---|---|
| Eyebrow | Done-for-you AI systems for GCC & MENA businesses (mobile: "Done-for-you AI systems · GCC & MENA") | أنظمة ذكاء اصطناعي نبنيها ونشغّلها عنك · الخليج والشرق الأوسط |
| H1 | Missed calls answered. *Appointments booked.* | مكالمة فائتة؟ **نرد عليها ونحجز الموعد.** |
| Lead | Helix builds and runs AI systems for clinics, real-estate and service businesses. Every missed call gets a WhatsApp reply within seconds, a real conversation in Arabic or English, and a confirmed booking in your calendar. Set up and monitored by our team. | تبني Helix وتشغّل أنظمة ذكاء اصطناعي للعيادات وشركات العقار وأعمال الخدمات. كل مكالمة فائتة يصلها رد على واتساب خلال ثوانٍ، ثم محادثة حقيقية بالعربي أو الإنجليزي، ثم موعد مؤكد في تقويمك. فريقنا يجهّز كل شيء ويتابعه. |
| CTA 1 / 2 | Book a discovery call → / See how it works | احجز مكالمة تعريفية ← / كيف يعمل؟ |
| Trust row | Arabic & English · Your own WhatsApp number · You keep ownership after go-live | عربي وإنجليزي · على رقم واتساب الخاص بك · النظام ملكك بعد الإطلاق |

Every claim traces to the library. "WhatsApp in seconds after a missed call" comes from `templates.ts`. "Your own WhatsApp number" follows from the Meta Cloud API setup in the bible. "You keep ownership after go-live" is from business profile v9.

### 5.4 Mobile (390)
Stacked: eyebrow → H1 46 px → lead 17 px → full-width CTAs (52 px) → trust row as a vertical list → phone scaled to 0.8 and centred, with the missed-call card **hidden** and the booked card centred, overlapping the phone's bottom 50 px → scenario strip as a vertical list (the duplicate "missed" row is hidden).

### 5.5 RTL (1440)
The grid mirrors: text on the right, phone on the left (x = 4), float cards on the inner (right) side at `right:-8 / -36`, glow shifted left. H1 uses Plex Arabic 600 at 64/1.3 and the emphasis line is coloured `--accent-text`, not italic. Arrows flip.

---

## 6. Page-by-page blueprint

Legend: each section lists **Purpose · EN copy · AR copy · Components · Visual**. The mockup that covers it is given in brackets.

### 6.1 Home `/` [home-dark-1440, home-mobile-390, home-ar-rtl-1440]
1. **Nav** (§4.1).
2. **Hero** (§5).
3. **Why it matters.** *Purpose:* name the pain in the owner's words.
   - EN: kicker "Why it matters" · H2 "The enquiries you miss are revenue that goes to someone else." · 01 After hours: "Calls after closing go unanswered, and the caller moves on to the next clinic on the list." · 02 A busy front desk: "Your team is with the customer in front of them. The phone rings out, and nobody calls back." · 03 Slow follow-up: "Leads from ads and Instagram wait hours for a reply, long after their interest has cooled."
   - AR: «لماذا يهمّك هذا» · «كل استفسار يفوتك هو دخل يذهب إلى غيرك.» · 01 بعد الدوام: «المكالمات بعد الإغلاق تبقى بلا رد، فينتقل المتصل إلى العيادة التالية في القائمة.» · 02 استقبال مشغول: «فريقك مشغول مع العميل الذي أمامه. يرنّ الهاتف، ولا أحد يعاود الاتصال.» · 03 متابعة بطيئة: «عملاء الإعلانات وإنستغرام ينتظرون الرد لساعات، بعد أن يكون اهتمامهم قد فتر.»
   - Components: `SectionHead`, `NumberedColumns` (3 columns divided by hairlines, mono index). No icons, no numbers.
4. **How it works (the replacement for the live CLI demo).** *Purpose:* show the system in business language.
   - EN: kicker "How it works" · H2 "From missed call to booked appointment, in four quiet steps." · lead "No new app for your team. The system works inside the tools you already use and only asks for a person when it should." · Tabs: Missed-call triage | Booking receptionist | Lead qualification · dashed chip "Example scenario". Steps: (1) "A call is missed" / "Your phone system tells Helix the moment a call goes unanswered, day or night." (2) "WhatsApp reply, in their language" + a mini Arabic bubble (3) "It asks the right questions" / "Which service, how soon, new or returning." + pills Teeth cleaning · This week · New patient (4) "Booked and confirmed" / "Slot taken from your real calendar. Reminder the day before." + pill ✓ Thu · 6:15 PM. Footer: headset icon "If the customer asks for a person, or the answer is unclear, your team takes over with the full conversation." + link "Explore missed-call triage →".
   - AR: «كيف يعمل» · «من مكالمة فائتة إلى موعد محجوز، في أربع خطوات هادئة.» · «لا تطبيق جديد لفريقك. يعمل النظام داخل الأدوات التي تستخدمها أصلاً، ولا يطلب تدخّل أحد إلا عند الحاجة.» · tabs: فرز المكالمات الفائتة | موظف الاستقبال والحجوزات | تأهيل العملاء · steps: تفوتك مكالمة / رد على واتساب بلغة العميل / يسأل الأسئلة الصحيحة / حجز وتأكيد (full strings in `mockups/_src/make_ar.py`).
   - Tab 2 script (Booking receptionist): inbound call in Arabic → checks your real availability → books consultation Sun 11:00 AM → WhatsApp confirmation with location pin. Tab 3 script (Lead qualification): Instagram ad lead → 3 qualifying questions → scored "Hot" and routed → booking or nurture. All labelled Example.
   - Components: `ScenarioTabs`, `FlowStep` ×4, `MiniBubble`, `Pill`. Visual: a `--bg-2` panel with radius 28, step dots 94 px connected by a dashed hairline.
5. **Systems.** *Purpose:* make the offer concrete without a price wall.
   - EN: kicker "Systems" · H2 "Five systems. Each one does a single job, properly." · lead "Start with the one that fixes your biggest leak. Add the next when the first has earned its place." Cards (2 large + 3 small, each with a mini UI vignette): Missed-call triage, Booking receptionist, Lead qualification & attribution, Lead reactivation, B2B collections (names and one-liners from `templates.ts`). Meta line "Best for …" (verticals from `templates.ts`). Footer: "Buying a single system? Configure it and see its price in Studio." → Open Studio.
   - AR: «الأنظمة» · «خمسة أنظمة. كل نظام يؤدي مهمة واحدة، بإتقان.» · «ابدأ بالنظام الذي يسدّ أكبر ثغرة لديك، وأضف التالي عندما يثبت الأول قيمته.» Names from the `templates.ts` AR fields: فرز المكالمات الفائتة · موظف الاستقبال والحجوزات · تأهيل وإسناد العملاء · إعادة تنشيط العملاء · تحصيل المستحقات (شركات فقط).
   - No prices here (§4.4). Add-ons (Lead Generation, Rival Watch, Handbook Answers, Visibility Scorecard, Deck Factory) and the preview lane (Clip Factory) live in Studio only.
6. **Your dashboard.** *Purpose:* transparency as the trust mechanism.
   - EN: kicker "Your dashboard" · H2 "See exactly what your systems did." · "Every reply, booking and hand-off in plain language. No guesswork, no jargon. Open it on your phone or your desk, in Arabic or English." · 3 bullets: A daily activity feed / A review queue for anything uncertain ("Nothing unclear is saved as fact until someone checks it.") / Week and month views.
   - AR: «لوحتك» · «اعرف بالضبط ماذا فعلت أنظمتك.» · «كل رد وحجز وتحويل، بلغة واضحة. بلا تخمين ولا مصطلحات تقنية. افتحها من هاتفك أو مكتبك، بالعربي أو الإنجليزي.» · «سجل نشاط يومي» / «قائمة مراجعة لأي شيء غير مؤكد: لا يُحفظ شيء غير واضح حتى يراجعه أحد.» / «عرض أسبوعي وشهري».
   - Visual: a full-width light browser frame showing the Overview (§6.10) with a dashed **Example data** chip.
7. **Built for the region.** EN H2 "Speaks like your front desk. Follows your rules." · AR «يتحدث مثل موظف استقبالك، ويلتزم بقواعدك.» Four feature cards: Arabic dialects and English (pills أبغى موعد بكرة · عايز أحجز · Can I book for Sunday?) / A person, whenever it matters (pills بشري · agent) / Respectful by default: quiet hours, opt-in, "stop" honoured (pills إيقاف · stop) / You own what we build. AR titles: «لهجات عربية والإنجليزية» · «شخص حقيقي عند الحاجة» · «محترم افتراضياً: ساعات هدوء، وموافقة مسبقة، واحترام طلب الإيقاف» · «ما نبنيه ملكك». (All behaviours come from system bible §5.1, §5.5 and §1.)
8. **Founder note (honest replacement for testimonials).** Left: kicker "A note from the founder" + serif quote: "We won't show you inflated numbers or borrowed logos. Before you commit, we'll walk you through a live demo built around a scenario from your own business, and every system we run reports exactly what it did." + monogram ZS, "Ziad Sabry, Founder, Helix". Right: "Our commitments": Live demo before scope · Honest reporting · Bilingual milestones · Clear ownership (all from business profile v9).
   AR quote: «لن نعرض عليك أرقاماً مبالغاً فيها أو شعارات عملاء ليسوا عملاءنا. قبل أن تلتزم، نعرض لك النظام يعمل على سيناريو من عملك أنت، وكل نظام نشغّله يوضح لك بالضبط ماذا فعل.» — زياد صبري، المؤسس. Commitments: «عرض حي قبل تحديد النطاق» · «تقارير صادقة» · «مراحل واضحة بالعربي أو الإنجليزي» · «ملكية واضحة».
   **Ziad must approve or edit this quote (Q6).** When real, named, permissioned client quotes exist, a `Testimonial` block may replace it. Until then, no testimonial component renders.
9. **Pricing teaser (AED only).** Kicker "Monthly plans · AED" · H2 "Clear monthly plans. One-time setup." / «باقات شهرية واضحة، ورسوم إعداد لمرة واحدة.» · 3 compact plans (name, one-line tagline, price, setup, 3 features, CTA). The featured plan is an inverted ivory card with "Recommended / موصى بها". Footer links: Studio (single systems) and "Custom build, let's scope it →" (→ /build).
10. **FAQ.** EN H2 "What owners ask us first." / AR «أول ما يسألنا عنه أصحاب الأعمال.» Q&A (EN / AR):
    - Do I need to change my phone number? / هل أحتاج لتغيير رقم هاتفي؟ → "In most setups, no. We connect to your existing phone system and reply from your WhatsApp Business number. We confirm what's possible with your setup on the discovery call." / «في معظم الحالات لا. نربط النظام بهاتفك الحالي ونرد من رقم واتساب للأعمال الخاص بك، ونؤكد ما يناسب إعدادك في المكالمة التعريفية.»
    - What happens when the AI can't answer? / ماذا يحدث إذا لم يعرف النظام الإجابة؟ → "It hands the conversation to your team with the full history. Anything uncertain goes to a review queue instead of being saved as fact." / «يحوّل المحادثة لفريقك مع كامل سجلها، وأي معلومة غير مؤكدة تذهب إلى قائمة المراجعة بدلاً من حفظها كحقيقة.»
    - Which languages and dialects? / ما اللغات واللهجات المدعومة؟ → "Arabic (Gulf, Egyptian and Levantine) and English, including messages that mix both." / «العربية (الخليجية والمصرية والشامية) والإنجليزية، بما في ذلك الرسائل التي تمزج بينهما.»
    - How long does setup take? / كم يستغرق الإعداد؟ → "It depends on the system and your tools. After the discovery call you get a written plan with milestones." / «يعتمد على النظام وأدواتك. بعد المكالمة التعريفية تحصل على خطة مكتوبة بمراحل واضحة.» (Replace with a real range once Ziad confirms, Q7.)
    - Who owns the system and the data? / من يملك النظام والبيانات؟ → "You do. After go-live you keep the setup, the integrations and the runbooks." / «أنت. بعد الإطلاق يبقى الإعداد والتكاملات وأدلة التشغيل ملكك.»
    Keep `getPublicFaqs()` as the data source. These are the recommended seed entries.
11. **Final CTA.** EN "Tell us where enquiries slip through. We'll show you the system that catches them." · "A short discovery call. We map the smallest system that fixes it, then demo it live, in Arabic or English." / AR «أخبرنا أين تضيع الاستفسارات، وسنريك النظام الذي يلتقطها.» · «مكالمة تعريفية قصيرة: نحدد أصغر نظام يحل المشكلة، ثم نعرضه أمامك مباشرة، بالعربي أو الإنجليزي.» Buttons: Book a discovery call · Chat on WhatsApp. Visual: `--bg-2` band, radius 32, one faint radial, and an oversized H-mark watermark at 2.5% alpha.
12. **Footer** (§4.2). Keep the JSON-LD.

### 6.2 Pricing `/pricing` [pricing-1440]
*Feeling:* "I know what I'll pay." Light theme by default (the site theme toggle still applies).
1. **Header.** kicker Pricing / الأسعار · H1 "Simple monthly plans. Built and run for you." / «باقات شهرية بسيطة. نبنيها ونشغّلها لك.» · lead "A one-time setup fee to build the system around your business, then a monthly fee for us to run, monitor and improve it." / «رسوم إعداد لمرة واحدة لبناء النظام حول عملك، ثم رسوم شهرية لنشغّله ونراقبه ونحسّنه.»
2. **Caption row:** chip "Monthly plans · AED" / «الباقات الشهرية · درهم» + right link to Studio (§4.4).
3. **Plan grid** (3 equal columns, gap 16, radius 24, padding 36/32). The featured plan (Growth Enterprise, `featured: true`) is inverted ink `#15171A` with the chip "Recommended / موصى بها". Anatomy: name → tagline (2 lines max) → price (52 px, "AED" prefix / «درهم» suffix in AR, "/ month" / «/ شهرياً») → "+ AED X one-time setup" → hairline → features (check list, **filtered and rewritten per §8.3**) → CTA (all three say "Book a discovery call" and carry the plan id as `?plan=` on /contact).
4. **Bespoke row** (dashed): "Need something bespoke, or more than one brand with different rules?" → "Custom build, let's scope it →" (/build). AR: «تحتاج شيئاً مخصّصاً، أو أكثر من علامة تجارية بقواعد مختلفة؟» → «بناء مخصّص، لنحدد النطاق ←».
5. **Every plan includes** (6 cells, 3×2 hairline grid): Done-for-you setup · Arabic and English · Human hand-off · Your own WhatsApp number · Client dashboard · You keep ownership. AR: «إعداد كامل ننفّذه عنك» · «العربية والإنجليزية» · «تحويل لموظف بشري» · «رقم واتساب الخاص بك» · «لوحة متابعة للعميل» · «الملكية لك».
6. **What happens after you book** (4 step cards, serif numerals): Discovery call → Blueprint and quote → Build and test → Go live and operate (from business profile v9: Audit → Architecture → Build → Launch → Optimize). AR: «مكالمة تعريفية» → «مخطط وعرض سعر» → «البناء والاختبار» → «الإطلاق والتشغيل».
7. **Pricing FAQ:** What does the setup fee cover? · Can I start with just one system? (→ Studio) · What happens if I go over my conversation limit? (**answer needed from Ziad, Q8**). AR: «ماذا تشمل رسوم الإعداد؟» · «هل أبدأ بنظام واحد فقط؟» · «ماذا يحدث إذا تجاوزت حد المحادثات؟»
8. **CTA band** (ink): "Not sure which plan fits?" / «لست متأكداً أي باقة تناسبك؟» + Book a discovery call · WhatsApp.
9. **Region:** show GCC plans in AED only (default). The repo also has `mena_sme` plans in EGP/JOD/USD. Showing them would put a second currency on this surface, so they are **hidden pending Q2**.

### 6.3 Studio `/studio` (no mockup; spec)
*Feeling:* "I can start small." Dark or light follows the site theme.
1. Header: kicker "Studio" · H1 "Build your system, one piece at a time." / «ابنِ نظامك، قطعة بقطعة.» · lead "Pick the systems you need and see each one's setup and monthly price. We confirm everything on a discovery call before anything is built." / «اختر الأنظمة التي تحتاجها وشاهد رسوم الإعداد والرسوم الشهرية لكل منها. نؤكد كل شيء في مكالمة تعريفية قبل بدء البناء.»
2. Caption: "Per-system pricing · USD · one-time setup + monthly" + link to /pricing (AED plans).
3. Left 8 columns: **Business type** segmented control (Clinic · Real estate · Home services · B2B / عيادة · عقارات · خدمات منزلية · شركات), which pre-highlights the relevant systems. Then **Core systems** (5 selectable cards: name, one-liner, "Best for", price line "$1,200 setup · $350/mo", a mini vignette, and a checkbox as a 44 px target). Then **Add-ons** ("from" prices) and **Preview** (Clip Factory, "On request").
4. Right 4 columns (sticky): **Your selection** summary. Selected systems list, "One-time setup $X" and "Monthly $Y" (from cents in `templates.ts`), note "Final price confirmed on your discovery call" / «السعر النهائي يُؤكَّد في المكالمة التعريفية», primary "Book a discovery call with this selection" (passes `?systems=`), and secondary "Prefer a bundled plan? See AED plans →".
5. Empty summary state: "Pick a system to see its price." / «اختر نظاماً لترى سعره.»
6. Real values from `lib/studio/templates.ts` (read 2026-09-26, `main`):

| System (EN / AR) | Lane | Setup (USD) | Monthly (USD) |
|---|---|---|---|
| Missed-call triage / فرز المكالمات الفائتة | core | 1,200 | 350 |
| Booking receptionist / موظف الاستقبال والحجوزات | core | 1,500 | 450 |
| Lead reactivation / إعادة تنشيط العملاء | core | 2,000 | 600 |
| Lead qualification & attribution / تأهيل وإسناد العملاء | core | 2,200 | 550 |
| AR collections (B2B only) / تحصيل المستحقات (شركات فقط) | core | 1,800 | 500 |
| Lead Generation / توليد العملاء | add-on | from 1,800 | 450 |
| Rival Watch / رصد المنافسين | add-on | from 1,600 | 350 |
| Handbook Answers / إجابات دليل التشغيل | add-on | from 1,500 | 250 |
| Visibility Scorecard / بطاقة الظهور المحلي | add-on | from 1,400 | 300 |
| Deck Factory / مصنع العروض | add-on | from 2,500 | 200 |
| Clip Factory / مصنع المقاطع | preview | from 3,000 | 500 |

7. Remove the old synthetic-cursor `StudioMotionDemo`, the purple gradients and the Sparkles icon. The `highlight` badges "Most booked" and "Highest ROI" are **unverified claims**. Hide them until Ziad confirms them (Q9), or rename to non-claims ("Good first system").

### 6.4 System detail template `/systems/[slug]` (new route; spec)
Slugs: `missed-call-triage`, `booking-receptionist`, `lead-qualification`, `lead-reactivation`, `b2b-collections`. Keep the existing rewrites (`/missed-call`, `/receptionist`, `/lead-reactivation`, `/ar-collections`) as 301s to the new slugs.
1. **Hero:** breadcrumb Systems / name · H1 = the outcome ("Every missed call gets a reply within seconds." / «كل مكالمة فائتة يصلها رد خلال ثوانٍ.») · lead = the `templates.ts` tagline · CTAs · an outcome vignette specific to the system (phone thread, calendar, lead scoring list, reactivation thread, invoice timeline) with an Example label.
2. **Who it's for:** 3 verticals from `templates.ts` as short cards ("Best for clinics / contractors / home services").
3. **How it works:** 4 steps, same `FlowStep` component as the home page, system-specific (from bible §5).
4. **The rules it follows** (trust): quiet hours, opt-in, stop words إيقاف/stop, human hand-off keywords بشري/agent, "never invents slots", B2B-only for collections. AR headings mirrored.
5. **What we need from you:** e.g. WhatsApp Business number, calendar access (Cal.com or Google), phone-system missed-call alerts, your services and hours. AR: «ما نحتاجه منك».
6. **What you'll see in your dashboard:** a cropped light panel (activity rows for this system), labelled Example data.
7. **Price:** USD setup + monthly from `templates.ts`, with the §4.4 caption and link to /pricing. One card, no comparison table.
8. **FAQ** (2–4, system-specific) → **CTA band**.

### 6.5 About `/about` (spec)
1. Hero: kicker About / من نحن · H1 "We build the systems that answer when you can't." / «نبني الأنظمة التي ترد عندما لا تستطيع.» · lead "Helix is a founder-led AI operations studio for businesses in the GCC and MENA. We design, build and run production systems (WhatsApp, voice, CRM and attribution), then hand you the keys." / «Helix استوديو عمليات ذكاء اصطناعي يقوده مؤسسه، للأعمال في الخليج والشرق الأوسط. نصمم أنظمة إنتاج حقيقية ونبنيها ونشغّلها (واتساب، الصوت، إدارة العملاء، وقياس مصادر العملاء)، ثم نسلّمك المفاتيح.»
2. Founder block: monogram or a real photo (only if Ziad supplies one), name, role, a 120–180-word story **written by Ziad** (draft slot marked `[Ziad to write]`, never lorem).
3. How we work: Discover → Build → Operate (business profile v9) / «نكتشف ← نبني ← نشغّل».
4. Principles: Honest status, no fake metrics · You own it after go-live · Bilingual by default · Smallest system that moves the metric. AR: «حالة صادقة بلا أرقام وهمية» · «ملكك بعد الإطلاق» · «ثنائي اللغة افتراضياً» · «أصغر نظام يحقق النتيجة».
5. Where we work: UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan, Egypt (bible §1), as text chips with no map graphic.
6. Honest status line (from the profile): "Helix AI is in final hardening; ask for a private preview on your discovery call." Include only if still true (Q10).
7. CTA band. Remove the `#careers` anchor unless there is a real careers page.

### 6.6 Contact / Book a call `/contact` (spec)
Two columns. Left (7 columns): H1 "Book a discovery call" / «احجز مكالمة تعريفية» · lead "Tell us how enquiries reach you today. We reply with a time for a short call and a live walkthrough." / «أخبرنا كيف تصلك الاستفسارات اليوم، وسنرد بموعد لمكالمة قصيرة وعرض مباشر.» Form (labels above, 52 px inputs): Full name / الاسم الكامل · Business name / اسم النشاط · Business type (select) / نوع النشاط · City and country / المدينة والدولة · WhatsApp number (with country code, `dir=ltr` input) / رقم واتساب · What's slipping through? (textarea, optional chips: Missed calls · Slow replies to ads · No-shows · Old leads · Overdue invoices) / ما الذي يفوتك؟ · Preferred language (Arabic / English) / اللغة المفضلة · Submit "Request my call" / «اطلب مكالمتي». Pre-fills `plan` or `systems` from the query string and shows "About: Growth Enterprise plan" as a removable chip.
Right (5 columns): "What happens next" / «ماذا يحدث بعد ذلك» 1 We reply on WhatsApp or email · 2 A short discovery call · 3 A live demo and a written plan (profile: Request → Discovery → Demo + scope). Below: "Prefer WhatsApp?" button · "Already a client? Sign in". **No phone numbers, office addresses or response-time promises until Ziad provides them (Q4).**
States: inline validation ("Enter a WhatsApp number with country code." / «أدخل رقم واتساب مع رمز الدولة.»). Success replaces the form: "Thanks, {name}. We'll message you on WhatsApp to pick a time." / «شكراً {name}. سنراسلك على واتساب لتحديد موعد.» Error: "We couldn't send your request. Please try again, or message us on WhatsApp." Submission target: the existing /build pipeline or a new `/api/contact` (engineering decision; not in scope here).

### 6.7 Login `/login` [login-1440, login-390]
*Fixes both v4 complaints: no empty slab and no placeholder box; the form is no longer a small card lost in beige.*
- **Desktop:** grid `1.12fr 1fr`, full height.
  - **Brand panel** (always dark `#0A0B0D`): logo top-left. Centre stage 500 × 430: a "While you were closed" summary card (Example: 6 missed calls answered on WhatsApp · 3 appointments booked · 1 conversation waiting for your team, with a dashed EXAMPLE chip), a tilted Arabic chat bubble behind it, and a "Booked · Thu 6:15 PM" chip in front. One radial glow and a 2.8% H-mark watermark. Bottom: serif 44 px "Your front desk keeps working after you close." / «موظف الاستقبال لديك يواصل العمل بعد الإغلاق.» + caption "Illustrative example. Your dashboard shows your real activity after sign-in." / «مثال توضيحي. تعرض لوحتك نشاطك الفعلي بعد تسجيل الدخول.»
  - **Form side** (ivory `--bg`, **no card**): top row "← Back to site" · "New to Helix? **Book a call**". The centred block is max 400 px: H1 serif 52 "Welcome back" / «أهلاً بعودتك» · sub "Sign in to your Helix workspace." / «سجّل الدخول إلى مساحة عمل Helix.» · Work email / البريد الإلكتروني للعمل · Password with "Forgot password?" in the label row / كلمة المرور + «نسيت كلمة المرور؟» · the eye toggle (44 px target) · **Sign in →** (54 px, ink, full width) / «تسجيل الدخول». Hairline, then "Trouble signing in? Message Helix support on WhatsApp" / «تواجه مشكلة؟ راسل دعم Helix على واتساب» and "Helix team member? Agency sign-in" / «من فريق Helix؟ دخول الوكالة». Bottom: language toggle · Privacy · Terms.
- **Workspace selector removed from the UI.** Route by role after authentication: `agency_admin` → /admin, client roles → /dashboard. The "Agency sign-in" link sets `?portal=agency` for the rare case where one email holds both roles. This replaces the v4 two-segment "Agency console / Client portal" control. **Engineering must confirm that the role-mismatch logic in the login action can become a redirect (Q11).**
- **Platform status readout: removed from login.** DESIGN-SPEC v3 §2.5 asked for it, but with no public status feed it rendered the placeholder that Ziad flagged. Re-add it only when a real public status source exists, and then as a single quiet line, never a box.
- **Mobile 390:** brand panel hidden. Logo + "New to Helix? Book a call" on top, then the form with the same anatomy and 52–54 px targets, and the footer pinned to the bottom.
- **States:** field errors below inputs (`aria-invalid`, danger colour): "Enter your work email." / «أدخل بريدك الإلكتروني للعمل.», "Enter your password." / «أدخل كلمة المرور.». Auth error banner above the button: "That email and password didn't match. Try again or reset your password." / «البريد أو كلمة المرور غير صحيحة. حاول مرة أخرى أو أعد تعيين كلمة المرور.». Pending: the button shows a spinner and "Signing in…" / «جارٍ تسجيل الدخول…», and the form sets `aria-busy`.
- **RTL:** the grid mirrors (brand panel on the right), and the email and password inputs keep `dir="ltr"` for their values.

### 6.8 Signup `/signup` (spec; same shell as login)
- Brand panel: a "What you get" stage (Example dashboard summary + three plain bullets: Done-for-you setup · Your own WhatsApp number · A dashboard that shows every reply and booking).
- Form: H1 "Create your workspace" / «أنشئ مساحة عملك» · sub "For Helix clients and businesses starting with us." / «لعملاء Helix والأعمال التي تبدأ معنا.» Fields: Full name · Business name · Work email · WhatsApp number (optional) · Password (with a strength hint "At least 8 characters" / «8 أحرف على الأقل») · Business type (select) · a terms checkbox with links. Submit "Create workspace" / «إنشاء مساحة العمل». Below: "Already have an account? Sign in".
- The trial line appears **only if Ziad confirms the offer (Q3)**: "7-day trial. No card required." / «تجربة لمدة 7 أيام. بدون بطاقة.» Otherwise it is removed.
- After submit: an in-page "Check your email to confirm your address." / «تحقق من بريدك لتأكيد العنوان.» state with a resend link (Supabase email confirmation).

### 6.9 Forgot / reset password `/forgot-password`, `/reset-password` (spec)
- Single-column, form-only (the Vercel pattern), same ivory canvas, logo top-left, max 400 px.
- Forgot: H1 "Reset your password" / «إعادة تعيين كلمة المرور» · "Enter your work email and we'll send you a reset link." / «أدخل بريدك الإلكتروني للعمل وسنرسل لك رابط إعادة التعيين.» · email · "Send reset link" / «إرسال الرابط» · "Back to sign in". Sent state: check icon + "If that address has an account, a reset link is on its way." / «إذا كان هذا البريد مسجلاً لدينا، فالرابط في طريقه إليك.» (It never reveals whether the account exists.)
- Reset: New password · Confirm password · "Update password" / «تحديث كلمة المرور» → success "Password updated. You can sign in now." / «تم تحديث كلمة المرور. يمكنك تسجيل الدخول الآن.» Expired-link state: "This link has expired. Request a new one." / «انتهت صلاحية الرابط. اطلب رابطاً جديداً.»

### 6.10 Dashboard shell (client workspace) [dashboard-overview-1440]
*Feeling:* "Everything is handled." Light by default (dark follows the theme). Density is comfortable, with a 14 px base.
- **Sidebar** 256 px, `--bg-2`:
  - Workspace switcher: logo tile + the business name + "Client workspace" / «مساحة العميل».
  - Groups:
    - Unlabelled: Overview / نظرة عامة · Review queue / قائمة المراجعة (count badge) · Conversations / المحادثات · Contacts / جهات الاتصال · Bookings / الحجوزات
    - **Growth / النمو:** Lead generation / توليد العملاء · Search / البحث ("New" / «جديد») · Reports / التقارير
    - **Workspace / مساحة العمل:** Systems / الأنظمة · Integrations / التكاملات · Billing / الفوترة · Support / الدعم
  - User block at the bottom (avatar initials, name, role).
  - Active item: a white surface with a hairline ring, never a coloured fill.
- **Top bar** 64 px: search "Search contacts, bookings, conversations" / «ابحث في جهات الاتصال والحجوزات والمحادثات» with ⌘K · EN | ع toggle · notifications · help.
- **Example-data banner** (for demo or new workspaces only): dashed, "You're viewing **example data**. Numbers, names and times on this screen are illustrative." / «أنت تشاهد **بيانات توضيحية**. الأرقام والأسماء والأوقات في هذه الشاشة للتوضيح فقط.» Real workspaces never show sample numbers. A new real workspace shows the empty states below.
- **Mobile:** the sidebar becomes a bottom tab bar (Overview · Review · Conversations · Bookings · More), and the top bar shrinks to the logo, a search icon and the avatar.
- **Language and admin pages:** the admin/agency console (`/admin`) reuses the shell with its own nav. It is out of scope for these mockups beyond the tokens. Remove all `CLIENT_EXEC` / mono uppercase labels from the client UI.

### 6.11 Dashboard Overview `/dashboard` [dashboard-overview-1440]
1. **Page head:** "Good morning, {first name}" / «صباح الخير يا {الاسم}» + a one-sentence summary generated from real counts: "This week your systems replied to {n} enquiries and booked {m} appointments. {k} things need your decision." / «هذا الأسبوع ردّت أنظمتك على {n} استفساراً وحجزت {m} موعداً. {k} أمور تحتاج قرارك.» Right side: range segmented control 7 / 30 / 90 days (٧ / ٣٠ / ٩٠ يوماً) · "Report" (download).
2. **KPI row** (4 cards; each shows a label, a 36 px value, and either a delta or a plain qualifier):
   - Appointments booked / المواعيد المحجوزة
   - Missed calls answered "17 of 18", with the reason for the gap / المكالمات الفائتة التي تم الرد عليها
   - Conversations handled / المحادثات المُدارة
   - Median first reply "18 sec" / متوسط زمن أول رد
   Deltas appear only when a previous period exists, and use neutral colour for decreases (no red for a normal dip).
3. **Bookings chart** (8 columns): stacked bars per day, split into Via WhatsApp and Via phone. The legend shows the series totals. Hover or focus reveals a tooltip with the day and counts. Values must sum to the KPI (the mockup: 11).
4. **Needs your decision** (4 columns): up to 3 items with action buttons (Review / Reply), plus the calm closing line "Everything else this week was handled automatically." / «كل ما عدا ذلك هذا الأسبوع تمّت معالجته تلقائياً.» When there are zero items, show a check icon and "Nothing needs you right now." / «لا شيء يحتاجك الآن.»
5. **Recent activity:** a plain-language row per event: verb in bold, object, meta line (who, channel, system), time. Masked phone numbers go in `<bdi dir=ltr>`. Verbs: Booked / تم الحجز · Replied / تم الرد · Handed to your team / تم التحويل لفريقك · Reminder sent / تم إرسال التذكير.
6. **Your systems:** status list (Running / يعمل · Paused / متوقف مؤقتاً · Setting up / قيد الإعداد) with the last activity and "Manage". Upsell link "Add lead qualification, collections and more → Browse systems".
7. **Lead generation mini-panel:** the latest 3 jobs with progress and status (Running / Done · CSV ready / Queued) and "New search".
- **Empty state (new workspace):**
  - Head "Welcome to Helix, {first name}" / «مرحباً بك في Helix يا {الاسم}».
  - Setup checklist card: Connect WhatsApp · Connect your calendar · Confirm business hours · Test a missed call, each with a status and a CTA. AR: «ربط واتساب» · «ربط التقويم» · «تأكيد ساعات العمل» · «اختبار مكالمة فائتة».
  - KPI cards show "—" with the caption "Appears after your first conversation" / «تظهر بعد أول محادثة».
  - The activity list shows an illustration-free line: "No activity yet. Once your systems go live, every reply and booking shows up here." / «لا يوجد نشاط بعد. عند تشغيل أنظمتك سيظهر هنا كل رد وكل حجز.»
- **Loading:** skeleton blocks matching the final layout (no layout shift). **Error:** an inline card "We couldn't load this section. Retry" / «تعذّر تحميل هذا القسم. إعادة المحاولة», scoped to one widget and never the whole page.

### 6.12 Lead generation `/dashboard/lead-gen` (spec; matches Lead Gen v2 in the library)
*Purpose:* find or enrich prospects, with a visible source for every field.
1. **Head:** "Lead generation" / «توليد العملاء» · "Find new businesses to contact, or enrich a list you already have. Every field shows where it came from." / «ابحث عن أنشطة تجارية جديدة للتواصل معها، أو أثرِ قائمة لديك. كل حقل يوضح مصدره.» · primary "New job" / «مهمة جديدة».
2. **Mode picker** (two large radio cards, 44 px+):
   - **Find leads / البحث عن عملاء**: "Search by business type and city." / «ابحث حسب نوع النشاط والمدينة.»
   - **Enrich websites / إثراء المواقع**: "Paste website URLs or upload a CSV." / «الصق روابط المواقع أو ارفع ملف CSV.»
3. **Find-leads form:**
   - Business type (free text + suggestions) / نوع النشاط · City / المدينة · Country / الدولة · How many (10/20/50) / العدد
   - Enrichment toggles: Website · Phone · Email (uses Hunter credits) · Social links / الموقع · الهاتف · البريد (يستهلك رصيد Hunter) · روابط التواصل الاجتماعي
   - Estimate line: "Uses about 20 of your 900 monthly place lookups." / «يستهلك نحو 20 من 900 عملية بحث شهرية.»
   - Run "Start job" / «ابدأ المهمة».
4. **Enrich form:** a textarea (one URL per line) or CSV drop zone ("Drop a CSV with a `website` column" / «أفلت ملف CSV يحتوي عمود website»), a preview of the first 5 rows, and "Start enrichment".
5. **Usage meter** (right rail): "Place lookups: 212 of 900 this month" and "Email finds: 12 of 45 this month" (caps from Lead Gen v2), plus "Resets on the 1st" / «يتجدد في أول الشهر». At 80% the bar turns to warning with "Running low" / «الرصيد يقترب من النفاد». At 100%: "Monthly limit reached. Jobs will use fallback sources or wait until the 1st." / «تم الوصول للحد الشهري. ستستخدم المهام مصادر بديلة أو تنتظر بداية الشهر.»
6. **Jobs table:** Name · Mode · Started · Progress (bar + "14 of 20 enriched") · Status chip (Queued / قيد الانتظار · Running / قيد التنفيذ · Done / مكتملة · Partly done / مكتملة جزئياً · Failed / فشلت) · actions (Open, Download CSV, Download XLSX, Duplicate). Live progress via polling. Failed rows show the reason in plain language ("The website didn't respond." / «الموقع لم يستجب.»).
7. **Results view** (job detail): a table with Business · Category · City · Phone · Email · Website · Rating · Source. Every non-empty cell has a small **source dot**. Hover or focus shows a popover like "From Google Places · fetched 26 Sep, 10:14" / «من Google Places · جُلب في 26 سبتمبر، 10:14». The provider chain is Google → Foursquare → OpenStreetMap → Bright Data, and the label shows the actual provider used. Filters: Has email · Has phone · Source. Bulk actions: Export CSV (UTF-8 with BOM, so Arabic opens correctly in Excel) · Export XLSX · Add to contacts.
   - **Missing data is shown as "Not found" / «غير متوفر» in `--text-3`, never guessed.**
8. **Empty states:**
   - No jobs yet: "No jobs yet. Start by finding businesses in a city, or enrich a list you already have." / «لا توجد مهام بعد. ابدأ بالبحث عن أنشطة في مدينة ما، أو أثرِ قائمة لديك.» + two buttons.
   - Job with zero results: "No businesses matched. Try a broader type or a nearby city." / «لا توجد نتائج مطابقة. جرّب نوع نشاط أعم أو مدينة قريبة.»
   - All providers failed: "Sources are unavailable right now. Your job is saved and will retry automatically." / «المصادر غير متاحة حالياً. تم حفظ المهمة وستُعاد المحاولة تلقائياً.»

### 6.13 Search `/dashboard/search` (spec)
*Purpose:* quick web research on a competitor, prospect or topic, with sources.
1. Head: "Search" / «البحث» · "Research a business or topic across the web. Results show their source and date." / «ابحث عن نشاط تجاري أو موضوع عبر الإنترنت. تظهر النتائج مع مصدرها وتاريخها.»
2. Large search field (56 px) with a placeholder "e.g. dental clinics in Jumeirah with online booking" / «مثال: عيادات أسنان في جميرا تتيح الحجز الإلكتروني», plus a language filter (Any / Arabic / English) and a region filter (UAE, KSA, …).
3. **Results list:** title, domain (with favicon), snippet, date, and actions: Open · Read page (fetches a clean reader view in a side panel via the fetch provider) · Save · Send to Lead generation (creates an Enrich job from the domain). Provider badge per result, e.g. "via TinyFish Search", in `--text-3`.
4. **Side panel (Read page):** extracted title, text, the "Fetched {time}" line and "Open original". Fetch failure: "This page couldn't be read. Open it in a new tab instead." / «تعذّرت قراءة هذه الصفحة. افتحها في تبويب جديد.»
5. **Saved searches** (left rail or tab): name, query, last run, a re-run button, and "Notify me of new results" (P2, only if supported).
6. **Empty and edge states:**
   - First visit: 3 example queries as chips + "Searches you save appear here." / «عمليات البحث التي تحفظها ستظهر هنا.»
   - No results: "Nothing found. Try fewer words or a different language." / «لا توجد نتائج. جرّب كلمات أقل أو لغة مختلفة.»
   - Provider down: "Search is temporarily unavailable. Try again in a few minutes." / «البحث غير متاح مؤقتاً. حاول بعد دقائق.»
   - Rate limited: "You've reached today's search limit. It resets at midnight (Dubai time)." / «وصلت إلى حد البحث اليومي، ويتجدد عند منتصف الليل بتوقيت دبي.» (Only if limits exist; confirm with engineering.)

### 6.14 Other dashboard pages (brief spec; the same shell, tokens and state patterns)
| Page | EN / AR title | Core content | Empty state (EN / AR) |
|---|---|---|---|
| Review queue | Review queue / قائمة المراجعة | Items the system was unsure about (unclear name, low-confidence extraction, hand-off requests); per item: context snippet, suggested value, Approve / Edit / Dismiss | "All clear. Nothing needs checking." / «كل شيء واضح. لا شيء يحتاج مراجعة.» |
| Conversations | Conversations / المحادثات | Thread list (channel, contact, last message, status: Handled by Helix / With your team / Closed) + thread view with a "Take over" button; AR text in Plex Arabic | "No conversations yet." / «لا توجد محادثات بعد.» |
| Contacts | Contacts / جهات الاتصال | Table: name, phone (bdi), source, last contact, opt-in state, tags; import CSV | "No contacts yet. They'll appear as customers reach out." / «لا توجد جهات اتصال بعد. ستظهر عند تواصل العملاء.» |
| Bookings | Bookings / الحجوزات | Week calendar + list; each booking shows service, source system, reminder status | "No bookings yet." / «لا توجد حجوزات بعد.» |
| Reports | Reports / التقارير | Week and month summaries, downloadable PDF/CSV; plain-language headline per period | "Your first weekly report appears after 7 days of activity." / «يظهر أول تقرير أسبوعي بعد 7 أيام من النشاط.» |
| Systems | Systems / الأنظمة | Per system: status, last activity, settings (hours, hand-off keywords, reminder timing), pause/resume | — |
| Integrations | Integrations / التكاملات | WhatsApp, calendar, phone system, CRM; connection state with plain errors ("Calendar disconnected. Reconnect.") | — |
| Billing | Billing / الفوترة | Current plan, next invoice, invoices list; currency matches the plan | — |
| Support | Support / الدعم | Contact options (WhatsApp, email), open requests | — |

---

## 7. Component inventory

| Component | Where | Variants and states | Notes |
|---|---|---|---|
| `SiteNav` | all marketing | transparent → solid on scroll; mobile sheet; EN/AR | 76 px; no pill nav |
| `SiteFooter` | all marketing | EN/AR | no "system status" badge unless real |
| `Button` | global | primary (neutral) · secondary (outline) · ghost · link; sizes 40/48/54; loading, disabled | primary is ivory on dark / ink on light; accent is never a button fill |
| `WhatsAppButton` | CTAs, contact | outline with WA glyph | hidden until the number exists (Q4) |
| `Eyebrow` / `Kicker` | sections | dot or plain | sentence case, no mono uppercase in AR |
| `SectionHead` | sections | left or centred | H2 + lead |
| `HeroPhone` | home, systems | chat script prop, `dir` prop, scale | CSS only; no image |
| `FloatCard` | hero, login | missed / booked / summary | 236–248 px |
| `ScenarioStrip` | home | desktop row / mobile list | carries the "Example scenario" chip |
| `ExampleChip` | anywhere illustrative | dashed | required on every illustrative number |
| `NumberedColumns` | why it matters | 3 columns | |
| `ScenarioTabs` + `FlowStep` + `MiniBubble` + `Pill` | how it works, systems | 3 scenarios | keyboard arrows between tabs; `role=tablist` |
| `SystemCard` | home, studio | large / small / selectable | vignette slot; price only in Studio |
| `BrowserFrame` | home dashboard preview | light / dark | |
| `FeatureCard` | built for the region | with pills | |
| `FounderNote` + `CommitmentsList` | home, about | — | copy needs Ziad's sign-off |
| `PlanCard` | pricing, teaser | default / featured (inverted) / compact | features from the display map (§8.3), never raw repo strings |
| `PriceText` | all prices | AED, USD; EN/AR | wraps the value in `<bdi>`; AR uses «درهم» after the value |
| `IncludesGrid` | pricing | 6 cells | |
| `StepCards` | pricing, contact | 3–4 | |
| `FAQ` (accordion) | home, pricing, systems | — | `button[aria-expanded]` |
| `CTABand` | pages | dark / ink | |
| `StudioConfigurator` + `SelectionSummary` | studio | empty / selected; sticky | totals from cents |
| `ContactForm` | contact | idle / validating / pending / success / error | prefill chips |
| `AuthShell` | login, signup | brand panel on / off (mobile) | |
| `AuthField` | auth | default / focus / error / disabled; password toggle | 52 px; LTR values |
| `AppSidebar`, `AppTopbar`, `ExampleDataBanner` | dashboard | collapsed (mobile tabs) | |
| `KpiCard` | overview | value / empty "—" / loading | |
| `BarChart` | overview, reports | stacked; tooltip | accessible table fallback |
| `DecisionList`, `ActivityList`, `SystemStatusList` | overview | empty / loading / error | |
| `ModePicker`, `UsageMeter`, `JobsTable`, `ResultsTable`, `SourceDot` | lead gen | per state in §6.12 | provenance popover |
| `SearchBox`, `ResultItem`, `ReaderPanel`, `SavedSearches` | search | per state in §6.13 | |
| `EmptyState`, `Skeleton`, `InlineError` | dashboard | — | text-first, no cartoons |

---

## 8. Data and honesty map

### 8.1 Where each number comes from
| Surface | Source | Read on |
|---|---|---|
| AED plans (home teaser, /pricing) | `lib/pricing/tiers.ts` (`main`), region `gcc_enterprise` | 2026-09-26 |
| MENA plans (hidden pending Q2) | `lib/pricing/tiers.ts`, region `mena_sme` | 2026-09-26 |
| USD per-system (Studio, /systems/[slug]) | `lib/studio/templates.ts` (`main`) | 2026-09-26 |
| Dashboard numbers | the client's real data; the demo workspace uses clearly labelled example data | — |
| Lead Gen caps (900 place lookups, 45 email finds per month) | Lead Gen v2 notes in the library | library date |
| Hero scenario, login summary | fictional, labelled "Illustrative example" | — |

Not checked: whether the PR #4 branch `cursor/design-overhaul-night-signal-5b67` changes these price files relative to `main`. Engineering should diff before implementation.

### 8.2 AED plans (verified values)
| Plan (EN / AR) | Monthly | Setup |
|---|---|---|
| Enterprise Starter / انطلاقة المؤسسات | AED 1,800 | AED 4,500 |
| Growth Enterprise / نمو المؤسسات (featured) | AED 4,600 | AED 7,500 |
| Sovereign Scale / المؤسسات الكبرى متعددة الفروع | AED 10,200 | AED 15,000 |

MENA (not displayed): SME Starter EGP 9,500 / 15,000 setup · Business Accelerator EGP 19,500 / 25,000 (featured) · Omni Operations EGP 38,000 / 45,000.

### 8.3 Feature display map (repo string → what the site shows)
Rule: the site renders `displayFeatures` from a new map (or edited `tiers.ts`), never the raw repo strings. Rewrite for an owner, not an engineer.

| Repo feature or copy (abridged) | Action | Display EN | Display AR |
|---|---|---|---|
| GCC region description "…99.9% uptime…" | **Remove claim** | "Built and run for multi-location businesses in the GCC." | «نبنيها ونشغّلها للأعمال متعددة الفروع في الخليج.» |
| "Cryptographic Ground-Truth Evidence Ledger" | **Remove** | — (optionally "A full history of every conversation and booking" if true) | «سجل كامل لكل محادثة وحجز» (only if true) |
| "Dedicated Technical Account Manager in Dubai/Riyadh" | **Remove** | — (optionally "A named Helix contact for your account", if true) | «مسؤول متابعة محدد لحسابك» (only if true) |
| Omni Operations "…zero hallucinations…" | **Remove** | "Anything uncertain goes to your review queue, never saved as fact." | «أي معلومة غير مؤكدة تذهب لقائمة المراجعة ولا تُحفظ كحقيقة.» |
| "Sub-5-second" missed-call text-back | **Soften** (unverified SLA) | "WhatsApp reply within seconds of a missed call" | «رد على واتساب خلال ثوانٍ من المكالمة الفائتة» |
| "Dedicated Retell SIP trunking & localized GPU compute" | **Rewrite** (jargon) | "Dedicated voice line capacity for high call volumes" (confirm) | «سعة مخصصة للمكالمات الصوتية عالية الحجم» (للتأكيد) |
| "24/7 VIP escalation phone support" | **Hold** (unverified) | only if staffed: "Priority support, any time" | «دعم ذو أولوية على مدار الساعة» (عند التأكيد فقط) |
| Studio badge "Most booked" | **Hide** (unverified) | — or "Good first system" | «نظام مناسب للبداية» |
| Studio badge "Highest ROI" | **Hide** (unverified) | — | — |
| "7-day unrestricted trial / No credit card required" (PR #4 copy) | **Hold** (Q3) | removed from marketing | — |
| Features using "agentic", "orchestration", "RAG", "LLM", "pipeline", "SIP" | **Rewrite** in plain language | e.g. "Answers questions from your own documents" | «يجيب من مستنداتك أنت» |

**Also flagged while re-reading `tiers.ts` (2026-09-26):**
- Growth `nameAr` is «نمو المؤسسات (الأكثر طلباً)», which means "most requested". That is an unverified popularity claim, so display «نمو المؤسسات» plus the neutral «موصى بها» chip.
- Growth AR ledger line «سجل تدقيق مشفر بالكامل للحماية من هلوسة الذكاء الاصطناعي» is an AR form of the banned ledger claim. Remove it.
- Sovereign tagline "…bespoke LLM tuning & zero shared data" uses jargon and an absolute claim. Display: "For groups running multiple branches and brands." / «للمجموعات التي تدير عدة فروع وعلامات تجارية.»
- Sovereign AR SIP line «خوادم صوتية مخصصة للاتصال فائق السرعة عبر SIP» is jargon. Hold it (same as the EN line).

**Plan features as displayed in `pricing-1440.png`** (plain-language rewrites of the repo lines; the home teaser shows the first three of each):

| Plan | Display EN | Display AR | Repo line it came from |
|---|---|---|---|
| Enterprise Starter | Up to 1,500 customer conversations a month | حتى 1,500 محادثة مع العملاء شهرياً | "Up to 1,500 active customer conversations / mo" |
| | Bilingual voice agent, Gulf Arabic and English | وكيل صوتي ثنائي اللغة: خليجي وإنجليزي | "Bilingual Voice Agent…" |
| | Official WhatsApp Business connection | ربط رسمي مع واتساب للأعمال | "Meta Verified WhatsApp Cloud API WABA Integration" |
| | Cal.com and Google Calendar sync | مزامنة مع Cal.com وتقويم Google | "Cal.com & Google Calendar autonomous synchronization" |
| | Human review before anything uncertain is saved | مراجعة بشرية قبل حفظ أي معلومة غير مؤكدة | "Supervisory Evidence Queue with human-in-the-loop review" |
| | UAE and KSA VAT-compliant invoices | فواتير متوافقة مع ضريبة القيمة المضافة في الإمارات والسعودية | "UAE & KSA Tax/VAT compliant invoice outputs" |
| Growth Enterprise | Up to 10,000 customer conversations a month | حتى 10,000 محادثة مع العملاء شهرياً | "Up to 10,000…" |
| | Voice, WhatsApp and email automation | أتمتة الصوت وواتساب والبريد الإلكتروني | "Multi-channel voice, WhatsApp, & email automation" |
| | Missed-call WhatsApp text-back and triage, in seconds | رد على المكالمات الفائتة عبر واتساب وفرزها، خلال ثوانٍ | "Sub-5-second…" (softened) |
| | B2B payment reminders with Mada and Apple Pay links | تذكيرات دفع للشركات مع روابط مدى وApple Pay | "Automated A/R payment reminders…" |
| | *(ledger removed)* · *(TAM removed)* | — | banned |
| Sovereign Scale | Unlimited workspaces across branches and brands | مساحات عمل غير محدودة لكل الفروع والعلامات | "Unlimited workspaces across subsidiaries & brands" |
| | Dialect tuning: Emirati, Najdi, Hijazi, Qatari | ضبط اللهجات: الإماراتية والنجدية والحجازية والقطرية | "Custom dialect fine-tuning…" |
| | B2B collections and dispute handling | تحصيل مستحقات الشركات ومعالجة الاعتراضات | "Autonomous A/R collections & dispute resolution engine" |
| | Cross-branch CRM governance and exports | حوكمة بيانات العملاء وتصديرها عبر الفروع | "Cross-client CRM data governance & export compliance" |
| | Priority escalation support **(pending Q16)** | دعم تصعيد ذو أولوية (بانتظار التأكيد) | "24/7 VIP escalation phone support…" (softened, 24/7 dropped) |
| | *(SIP/GPU line held)* | — | jargon, unverified |

### 8.4 Banned strings (CI grep; build fails if any appear in rendered marketing output)
`99.9%` · `uptime` (in claims) · `zero hallucination` · `Ground-Truth Evidence Ledger` · `Technical Account Manager in Dubai` · `Riyadh` in the TAM context · `Most booked` · `Highest ROI` · `unrestricted trial` (until Q3) · `الأكثر طلباً` (until Q9) · `CLIENT_EXEC` · `lorem`. AR equivalents: «صفر هلوسة» · «99.9٪».

---

## 9. Acceptance checklist (for the implementation PR)

- [ ] Every marketing page is built at **1440 and 390**, in **dark and light**, and in **EN and AR (RTL)**. Screenshots are attached to the PR.
- [ ] `dir="rtl"` and `lang="ar"` are on `<html>` for AR. Layout uses logical properties (`margin-inline-start`, `inset-inline-end`) and directional icons flip.
- [ ] **No Arabic text is ever set in a monospace font.** Arabic uses IBM Plex Sans Arabic only.
- [ ] Prices, phone numbers and emails are wrapped in `<bdi>` or given `dir="ltr"`, and Latin digits are used in prices in both locales (decision noted; switch to Arabic-Indic only if Ziad prefers, Q13).
- [ ] **One currency per surface:** AED on home and /pricing, USD on Studio and /systems. Cross-links carry the caption.
- [ ] No banned strings (§8.4); the CI grep passes.
- [ ] Every illustrative number, name or time has an "Example" or "Illustrative" label.
- [ ] No testimonials, client logos, uptime, "trusted by" or counters unless they are real and approved.
- [ ] Lighthouse (mobile) on /, /pricing and /login: **Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95**.
- [ ] CLS < 0.05, LCP < 2.5 s on 4G. The hero is CSS and text (no hero image), and fonts use `next/font` with `display: swap` and subset `latin`/`arabic`.
- [ ] `prefers-reduced-motion` disables the chat typing sequence and float, showing the final state.
- [ ] Contrast is WCAG AA (4.5:1 body, 3:1 large text and UI); accent-on-surface is checked in both themes.
- [ ] Touch targets are ≥ 44 × 44 px; focus rings are visible (2 px, offset 2), and every control is reachable by keyboard.
- [ ] Forms have labels (not placeholders), inline errors tied with `aria-describedby`, and `autocomplete` attributes.
- [ ] Dashboard: every widget has loading, empty and error states. Charts have a table fallback for screen readers.
- [ ] No API keys, tokens or internal URLs in client bundles or copy.

---

## 10. Implementation notes (for the engineer; no code written in this task)

1. **Remove from marketing:** `components/marketing/live-agent-terminal*` (the CLI hero), the pill nav, the footer "system status" badge, the synthetic-cursor Studio demo, purple gradients, glass cards, and the mono uppercase labels (`CLIENT_EXEC`, etc.).
2. **Structure:** keep route groups `(marketing)`, `(auth)` and `(app)`. The locale comes from a cookie (`helix_lang`) + `<html dir>`, following the existing i18n approach from the prior prompt. Copy lives in `components/marketing/copy.ts` (EN/AR keys), and prices are read from `tiers.ts` / `templates.ts`, never hard-coded.
3. **Fonts:** load `Instrument_Serif` (400, italic), `Geist` / `Geist_Mono` and `IBM_Plex_Sans_Arabic` (400/500/600) through `next/font/google`, exposed as CSS variables `--f-display`, `--f-sans`, `--f-mono`, `--f-ar`. `:lang(ar)` switches all families to `--f-ar`.
4. **Tokens:** port `mockups/_src/v5.css` `:root` and `[data-theme=light]` blocks into `app/globals.css` / the Tailwind theme as-is.
5. **New routes:** `/contact` (form + success state, server action → existing lead pipeline or `/api/contact`) and `/systems/[slug]` (static params for the 5 slugs). Existing rewrites (`/missed-call`, `/receptionist`, `/lead-reactivation`, `/ar-collections`) become 301 redirects to `/systems/*`. `/build` stays as the custom-scope route.
6. **Pricing display:** add `displayFeatures: { en: string[]; ar: string[] }` per tier (from §8.3), and stop rendering raw `features`. Fix the GCC description. Add the §8.4 banned-string check to CI.
7. **Login:** remove the workspace selector. After `signInWithPassword`, read the role and redirect (`agency_admin` → `/admin`, otherwise `/dashboard`); `?portal=agency` forces the agency console when a user holds both roles. Remove the platform status placeholder.
8. **Hero:** build `HeroPhone` as a server component with the static script, plus a small client island for the optional typing sequence (starts after LCP, respects reduced motion).
9. **Dashboard:** the example-data banner renders only for the demo workspace (flag on the workspace), never for real clients.
10. **Do not** ship the mockup HTML files. They are references only, and their inline CSS is not production code.

---

## 11. Open questions for Ziad

1. **Approve the direction?** "Quiet Authority": an editorial serif, ivory and ink, the WhatsApp phone hero replacing the CLI, and no fake proof.
2. **MENA plans:** show the EGP plans on /pricing (a second tab, which means a second currency on the page), keep them on a separate `/pricing/egypt` page, or hide them for now?
3. **7-day trial:** is the "7-day unrestricted trial, no credit card" in PR #4 a real offer? If not, remove it everywhere (the v5 default).
4. **WhatsApp number and contact details** for the CTA buttons and /contact. Which number, and what response time can we honestly promise, if any?
5. **Is the discovery call free?** If yes, we can say "Free discovery call" / «مكالمة تعريفية مجانية».
6. **Founder note:** approve or edit the quote in §6.1-8, and write the About story (120–180 words). Is a real photo available?
7. **Setup timeline:** is there a typical range to state (e.g. "most systems go live in 2–4 weeks")? Currently we say "a written plan with milestones".
8. **Overage policy:** what happens when a plan's conversation or usage limit is exceeded?
9. **Badges:** can "Most booked" and "Highest ROI" be backed by data? If not, hide them.
10. **Honest status line:** is "final hardening, private preview" still accurate for the About page?
11. **Login:** OK to replace the Agency / Client selector with role-based routing plus an "Agency sign-in" link?
12. **Plan names:** "Enterprise Starter / Growth Enterprise / Sovereign Scale" read as big-company names for clinic and SME buyers. Keep them, or rename (e.g. Starter / Growth / Multi-branch)?
13. **Digits in Arabic:** Latin digits (1,800), as proposed, or Arabic-Indic (١٬٨٠٠)?
14. **Clean up the repo claims:** approve editing `tiers.ts` to remove "99.9% uptime", "zero hallucinations", "Cryptographic Ground-Truth Evidence Ledger" and "Dedicated TAM in Dubai/Riyadh", and to rewrite the jargon items (§8.3)?
15. **Phone systems:** which phone systems or carriers can actually send missed-call events today? This decides how firmly the FAQ answers "Do I need to change my number?"
16. **24/7 VIP support and the dedicated voice capacity** in Sovereign Scale: are they real and staffed? Otherwise remove them.

---

## 12. Files in this folder

All paths are under `/workspace/helix-ai-docs-files/01-helix-ai-platform/design-v5-premium/`.

| File | What it is |
|---|---|
| `BLUEPRINT.md` | this document |
| `mockups/home-en.html` | Home, EN, dark, self-contained |
| `mockups/home-ar.html` | Home, AR, RTL, dark |
| `mockups/pricing.html` | Pricing, EN, light |
| `mockups/login.html` | Login, EN (desktop and mobile via viewport) |
| `mockups/dashboard-overview.html` | Client dashboard Overview, EN, light, example data |
| `mockups/home-dark-1440.png` | Home full page, 1440 |
| `mockups/home-mobile-390.png` | Home full page, 390 (@2x) |
| `mockups/home-ar-rtl-1440.png` | Home AR RTL, 1440 |
| `mockups/pricing-1440.png` | Pricing, 1440 |
| `mockups/login-1440.png` | Login, 1440 |
| `mockups/login-390.png` | Login, 390 |
| `mockups/dashboard-overview-1440.png` | Dashboard Overview, 1440 |
| `mockups/_src/v5.css` | design tokens and components |
| `mockups/_src/*.html` | page sources (templated) |
| `mockups/_src/build.py` | inlines assets and renders PNGs (`python3 build.py render [filter]`) |
| `mockups/_src/make_ar.py` | generates `home-ar.html` from `home-en.html` |
| `research/reference-sheet-1.png`, `research/reference-sheet-2.png` | reference captures (Intercom, Stripe, Linear, Attio, Clerk, Vercel, Retool, Maqsam, Foodics, Tabby, Fractional) |

*Specified here without mockups:* Studio, /systems/[slug], About, Contact, Signup, Forgot/Reset, Lead generation, Search, other dashboard pages.
