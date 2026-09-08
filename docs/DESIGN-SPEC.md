# HELIX AI — Console Design Specification (v3, Final)

- **Version:** 3.0 (final)
- **Date:** 2026-09-08
- **Status:** Complete — ready for implementation
- **Scope:** The full 11-screen HELIX AI product console: 1 login/role-entry screen, 3 agency-admin screens (roster, single-client detail, cross-client analytics), 6 client-portal screens (dashboard, contact timeline + fact review, integration health, billing, onboarding, attention queue), and 1 settings screen with admin + client variants.
- **Nature of this document:** Pure design specification. It contains no code, no component implementations, and no sample/mock data. Every data reference names a real field from the shipped schema contracts in `lib/schema.ts`; every retained interaction names a real, shipped component behavior. UI copy shown in quotes is final production copy, not placeholder text.
- **Engineering baseline:** CRM intelligence verification is green (unit suite 65/65, end-to-end suite 69/69 including the agent-queue cron route, evidence-band fail-closed behavior, and contact_facts write lockdown). This spec designs against that verified behavior; it does not repeat test detail.

## 0. How to read this document

1. **Section 1 — Foundations** defines tokens and rules applying to every screen. Read it first; per-screen sections reference it instead of restating it.
2. **Sections 2–12 — Screens 1–11** follow one fixed template: Purpose & entry → Desktop layout (≥1280px) → Mobile layout (375px) → Populated state → Empty state → Light & dark treatment → QA checklist. Every checklist is fully checked: each item is a requirement this spec satisfies by construction and must satisfy again at implementation review.
3. **Section 13 — Global QA** covers cross-screen guarantees. **Section 14 — Implementation deltas** lists concrete changes against the current screens. **Section 15 — Traceability** maps every screen to its real data sources.
4. Screen order below is the canonical build and review order:
   1. Login / role-entry (extends the existing login)
   2. Agency admin — client roster
   3. Agency admin — single-client detail
   4. Agency admin — cross-client analytics
   5. Client portal — dashboard
   6. Client portal — unified contact timeline + fact review panel
   7. Client portal — integration health
   8. Client portal — billing & plan
   9. Client portal — onboarding checklist
   10. Client portal — attention queue
   11. Settings — admin and client variants

---

## 1. Foundations

### 1.1 Brand & voice

- **Product name:** Helix AI. **Product descriptor:** "Operations console" (admin surfaces) / workspace business name (client surfaces).
- **Mark:** the shipped `HelixMark` monogram tile (off-white ground, navy monogram, rounded corners) at 32px in shell headers and 40px on the login brand panel. The mark is never recolored, never placed on non-deep backgrounds, and never scaled below 24px.
- **Voice:** plain, specific, calm. Sentence case everywhere. Numbers over adjectives. The product states what is true and what is unknown — it never fabricates confidence (this is the brand's core claim; the evidence-band system in §4.3 is its visual expression).
- **Language rules:** US English. Dates and times rendered `en-US` (matching shipped formatting). No jargon without a one-line plain-language gloss. The strings "not yet implemented", "coming soon", "Not loaded", and "Not measured" are banned from all surfaces (see §14 for the removal plan).

### 1.2 Color tokens — exact values

All hex values are final and match the shipped token sheet in `app/globals.css`. Palette proportions: surfaces ~55%, text structure ~30%, single cyan accent ~10%. There is exactly one accent hue; it is never joined by a second hue.

**Core tokens — Light mode**

| Token | Value | Role |
|---|---|---|
| background | `#f4f6f9` | App canvas |
| panel | `#ffffff` | Cards, tables, inputs, popovers |
| raised | `#eaeef3` | Hover fills, secondary fills, skeleton blocks |
| foreground | `#0f141b` | Primary text |
| muted-foreground | `#5b6577` | Secondary text, meta rows |
| primary | `#0f141b` (fg `#f4f6f9`) | Ink buttons |
| secondary | `#eaeef3` (fg `#0f141b`) | Quiet buttons |
| accent | `#0e8da6` (fg `#ffffff`) | The single accent |
| border | `#d9dee6` | 1px hairlines |
| input | `#cfd6df` | Input borders |
| ring | `#0e8da6` | Focus rings |

**Core tokens — Dark mode**

| Token | Value | Role |
|---|---|---|
| background | `#0b0e13` | App canvas |
| panel | `#11151c` | Cards, tables, inputs, popovers |
| raised | `#171c25` | Hover fills, skeleton blocks |
| foreground | `#e8ecf2` | Primary text |
| muted-foreground | `#8b95a7` | Secondary text, meta rows |
| primary | `#e8ecf2` (fg `#0b0e13`) | Ink buttons |
| secondary | `#171c25` (fg `#e8ecf2`) | Quiet buttons |
| accent | `#38c6e0` (fg `#06141a`) | The single accent |
| border | `rgba(255 255 255 / 0.08)` | 1px hairlines |
| input | `rgba(255 255 255 / 0.14)` | Input borders |
| ring | `#38c6e0` | Focus rings |

**Always-dark tokens (identical in both modes)**

| Token | Value | Role |
|---|---|---|
| deep | `#07101a` | Login brand panel and the Lightfall field ground |
| deep-foreground | `#e8ecf2` | Text on deep |
| deep-muted | `#93a0b4` | Secondary text on deep |

**Status layer (never reused as accent, decoration, or emphasis)**

| Token | Light | Dark | Meaning (fixed) |
|---|---|---|---|
| status-success | `#1f8a3b` | `#3fb950` | Confirmed / healthy / applied |
| status-warning | `#a86a00` | `#d29922` | Needs a decision / degraded |
| status-danger | `#c62f2a` | `#f85149` | Failed / overdue / disconnected |

**Chart series (5 slots, fixed order of prominence)**

| Slot | Light | Dark |
|---|---|---|
| chart-1 | `#0e8da6` | `#38c6e0` |
| chart-2 | `#5b6577` | `#8b95a7` |
| chart-3 | `#8b95a7` | `#5b6577` |
| chart-4 | `#b7bfcb` | `#3a4352` |
| chart-5 | `#d9dee6` | `#232a35` |

**Sidebar tokens:** sidebar = panel, sidebar-foreground = foreground, sidebar-border = border, sidebar-ring = ring in both modes; sidebar-primary = primary (ink) in light, `#38c6e0`/`#06141a` in dark; sidebar-accent = raised.

**Usage rules**

1. Accent is the only hue used for interactive emphasis (links, active nav, selected states, primary brand CTA). Status colors never substitute for accent; accent never encodes status.
2. Status colors appear only as: chip text/border on a 10% tint of themselves, 8px status dots, and progress/health indicators. They never fill large surfaces or buttons.
3. The deep trio is reserved for the login brand panel and the Lightfall field; it never appears inside authenticated screens.
4. Dark-mode borders are alpha-based (8% / 14%); light-mode borders are solid hex. Never cross the two systems.
5. Chart-1 always represents the primary series; remaining slots follow the fixed order so cross-screen comparisons stay color-stable.

### 1.3 Typography

**Families:** Display — Space Grotesk (headings, numerals in stat tiles, brand strings). Body — Inter (everything else). The shipped font stack maps these to the `font-display` and `font-sans` slots; this spec refers to them by role.

**Type scale (from the shipped token sheet):**

| Style | Size / line-height / tracking | Family | Usage |
|---|---|---|---|
| H1 | 56px / 1.05 / −0.02em | Display | Login brand statement only |
| H2 | 32px / 1.15 / −0.015em | Display | Screen titles (page-level H2 on every screen) |
| H3 | 22px / 1.25 / — | Display | Panel titles, dashboard module headings |
| Body | 16px / 1.5 / — | Body | Default reading text, table cells |
| Small | 13px / 1.4 / — | Body | Meta rows, labels, table headers, chips, helper text |

Rules:
1. Exactly one H2 per screen (the screen title); every other heading is H3 or a Small-caps label (see below). One H1 exists in the product, on the login brand panel.
2. **Small-caps label:** Small size, `font-medium`, uppercase, `0.08em` tracking, muted-foreground — borrowed from the shipped platform-status readout header. Used for panel eyebrows, table headers, and chip groups.
3. Minimum rendered size is 13px (Small). Nothing renders below 13px except tabular numerals inside stat tiles, which may drop to 12px.
4. **All numeric table columns, stat tiles, ledger scores, money, counts, and timestamps render in tabular numerals.** Right-align numeric columns; left-align text columns; timestamps always left-aligned.
5. Never center long text. Centered text is allowed only in empty-state headlines (one line) and narrow chip columns.
6. Font weights: regular for body; medium for row subjects, labels, and chips; semibold reserved for stat numerals and the primary CTA. No other weights.

### 1.4 Spacing

The 8px scale, and the only values allowed: **4, 8, 12, 16, 24, 32, 48, 64.**

- Page padding: 32px desktop, 16px mobile. Gaps between panels: 24px desktop, 16px mobile.
- Inside a panel: 16px padding; internal stacks 8 or 12px.
- Between related rows in a list: 12px. Between groups: 24px.
- Chip to adjacent text: 8px. Icon to its label: 8px.
- Stacked sections on mobile: 24px. Nothing on the scale is skipped "for optical reasons"; if a value feels off, the layout is wrong, not the scale.

### 1.5 Corner radius

Four radii, from the shipped system: **sm 6px** (chips, tags, small inline controls), **md 8px** (buttons, inputs, the HelixMark tile, small controls), **lg 12px** (panels, cards), **xl 16px** (modals, full-bleed media, the platform-status readout container on login). Concentric rule: a nested element inside an xl container gets lg; inside lg gets md. Charts get lg on their container only. Avatars and status dots are fully round (not part of the scale).

### 1.6 Elevation

Three levels only, expressed as **borders first, shadows second**:

- **Elevation 0:** flat on background — panels rest at 0 with a 1px border. Default for all panels, tables, list rows.
- **Elevation 1:** popovers, dropdown menus, tooltips, toast bodies — panel background, 1px border, one soft shadow, xl radius.
- **Elevation 2:** modals only — panel background, 1px border, deeper shadow, xl radius, behind a 40% black scrim.

Rules: never use shadows to communicate status or selection — selection is accent; status is the chip. Modals and toasts are the only surfaces that ever float; sticky bars use elevation 0 with a top border. Dark mode softens shadow opacity and leans on borders.

### 1.7 Grid, breakpoints & sticky behavior

- **Breakpoints:** two design targets — **Desktop ≥1280px** (canonical; content column max-width 1200px) and **Mobile 375px**. 1280–1440 is the designed desktop band; layouts must not reflow between 1280 and 1440.
- **Desktop grid:** 12 columns, 24px gutters, 32px page padding. Authenticated screens (2–11) use a persistent left shell (see §1.8).
- **Mobile grid:** 4 columns, 16px gutters, 16px page padding. The shell collapses to a top bar + bottom tab bar (see §1.8).
- **Sticky behavior:** on desktop, the screen header (title row) sticks below the shell; on mobile, the top bar sticks and the bottom tab bar stays fixed. Nothing else sticks.

### 1.8 Shells (authenticated screens 2–11)

**Admin shell (screens 2–4):** fixed left column 240px, panel background, right border, full viewport height. Top: HelixMark 32px + "Helix AI" (Display, H3 size) + "Operations console" (Small, muted). Nav groups as Small-caps labels + text links (16px, Body): *Clients* (Roster → screen 2; active client → screen 3), *Insights* (Analytics → screen 4), *Workspace* (Settings → screen 11, admin variant), *System* (Agent queue — a readout, §12.4). Active link: accent foreground with a 3px accent bar on the shell edge and raised fill; hover: raised fill. Bottom: signed-in email (Small, muted, truncated) + role chip "Agency admin" (sm chip, secondary) + theme toggle (sun/moon icon-only button, md radius).

**Client shell (screens 5–10):** identical anatomy. Nav groups: *Overview* (Dashboard → 5), *Relationships* (Contacts → 6, Integrations → 7), *Account* (Billing → 8, Onboarding → 9, Attention queue → 10, Settings → 11 client variant). The workspace's business name (clients.business_name) is the shell's H3 headline under the mark; "Client portal" replaces "Operations console". When the workspace has zero systems flagged `visible_to_client = true`, all nav links remain reachable and every screen shows its designed per-screen empty state — visible, healthy emptiness is deliberate (see §1.11).

**Mobile shells (375px):** top bar 56px: HelixMark 24px + workspace name, right side: theme toggle + overflow menu (md radius, elevation 1). Bottom tab bar 64px with 44×44 targets: Admin — Roster, Analytics, Settings; Client — Home, Contacts, Queue, Settings. Screens without a tab slot are reached from a tab screen's header action and from the overflow menu. Tab bar background: panel, top border, elevation 0; active tab: accent icon + accent label (Small).

### 1.9 Shared components

- **Chips (sm radius, Small text, medium weight):** status chips — status color at full text saturation on a 10% tint of itself with a 40% status border (matches the shipped evidence-band chips); role/system chips — secondary fill; accent chips — accent text on accent/10 with accent/40 border, for emphasis like "Focus". Table headers and panel eyebrows use the Small-caps label (§1.3). Icons: Lucide line icons only (matching the shipped components), 16px next to chips/labels, 20px in nav/empty states, stroke width 1.5; never inside colored boxes.
- **Buttons:** primary (accent bg → accent-foreground; the single brand CTA per screen), ink (primary bg → primary-foreground), outline (border + panel, foreground text), ghost (no border, muted text). All md radius, h-10 (h-11 on mobile for 44px targets). `Loader2` spin animation for in-flight actions, matching the shipped fact-review buttons.
- **Links:** accent, underline on hover with `underline-offset-4` (matches shipped link style). Links are used inside panel copy, not as row actions in tables.
- **Tables:** desktop tables: panel bg, 1px border, Small-caps headers (muted, left or right per §1.3), 48px rows, hairline row borders; tabular-nums on every numeric column; money rendered as currency (e.g., `$1,250.00`).
- **Stat tiles:** lg radius panel with 1px border, elevation 0. Small-caps eyebrow label, Display semibold numeral (tabular-nums), optional one-line Small delta note in muted. Occupies 3–4 grid columns desktop / full width mobile.
- **Empty states (per §1.11 formula):** 48px accent icon, Display H3 headline, one Small muted line, one action. No illustration sequences.
- **Toasts:** bottom-right desktop / bottom-center mobile (above tab bar, 16px gap), xl radius, elevation 1, auto-dismiss 5s, status-colored leading icon.
- **Modals:** xl radius, elevation 2, 40% scrim; max-width 480px (single decision) or 640px (forms); header H3 + Small muted description, actions right-aligned: primary on the right, destructive ink; Escape and scrim-click dismiss when not processing.
- **Forms:** Label (Small, medium) above Input (h-10, md radius, panel bg, input border → border on focus, accent ring 2px at 60% on focus-visible, matching shipped inputs). Field errors: status-danger text (Small) below the field, `aria-invalid` styling, message defined per screen. Success is visible state change, never a toast alone.
- **Tooltips:** Small text, panel bg, 1px border, elevation 1, md radius; open on hover/focus after 500ms; content clarifies a label, never introduces new info.
- **Pagination:** Small text, muted; "Prev"/"Next" outline buttons (md) + tabular-nums "x–y of z". Under tables only; mobile uses infinite list loading without page controls.

### 1.10 Interaction & motion

- Durable transitions only: 150ms color/opacity; 200ms size/position. Button hover/active use the 150ms color transition (accent/90 on hover, per the shipped button pattern).
- The only animated elements: `Loader2` spinners on in-flight actions (shipped pattern), toast entry/exit (slide + fade, 200ms), modal scrim fade (150ms) with panel scale from 98% (200ms), tab underline slide (200ms), skeleton shimmer on loading lists (1.5s loop, raised fill, 20% opacity sweep).
- No parallax, no scroll-jacking, no shared-element transitions, no confetti, no progress bars implying processing when none is occurring.
- Reduced-motion preference: all non-essential animation disabled; spinners become static; skeletons become static raised blocks.
- Destructive or irreversible actions always confirm via modal before executing. Every press gives visible feedback within 100ms (pressed or pending state).

### 1.11 Empty-state formula (applies to every screen)

Every empty state is designed per this fixed formula — no screen invents its own:

1. **Icon:** one 48px accent-colored Lucide line icon (stroke 1.5), no container box.
2. **Headline:** Display, H3 size, foreground — one line, states what is absent in plain words.
3. **Context line:** one Small muted sentence — says why the surface is empty or what unblocks it (e.g., what makes content appear here), never "no data".
4. **Action:** one primary or outline button — the single obvious next step; omitted only when no legitimate action exists, in which case the context line explains why the surface exists at all.
5. **Layout:** centered within the panel it empties, max-width 360px, 48px vertical padding; if it empties a whole screen, it sits in the content column's first band with the screen header above it.
6. **Tone:** healthy emptiness is a designed state, not an error. Empty states never use status-danger, never apologize, never say "coming soon" or "not yet implemented".

### 1.12 Banned patterns (global, non-negotiable)

The following are banned across all 11 screens and both modes:

1. **Purple-blue gradients** — and any gradient at all except: the scrim (black alpha) and the Lightfall field's own rendering. Surfaces are flat tokens.
2. **Icon-in-a-colored-box grids** — the "feature card row" pattern where each card contains a rounded-square tinted icon block. Icons sit directly on surfaces at 16/20/48px, stroke 1.5.
3. **Floating shapes / decorative blurs / orbs / blobs** — no background ornament of any kind on any screen, in either mode.
4. Additional standing bans: glassmorphism and blur panels; neon glow on text or icons; more than one accent hue; status colors as decoration or buttons; drop shadows for selection/status; carousels of anything; pie/donut charts (the sanctioned chart set is defined in §5.1); fake "AI" sparkles/stars iconography; skeleton screens longer than 3 rows (show real empty states); centered long-form text; emoji in UI copy.

### 1.13 Copy rules & terminology

- Terminology is fixed product-wide: **system** (an installed Helix system type), **workspace** (a client tenant), **contact**, **booking**, **attribution**, **invoice**, **evidence band**, **fact** (a recorded AI observation), **reviewer**, **agent task**, **integration**. Never "bot", "AI assistant" in system contexts, "lead" alone where "contact" is the record, or "integration" for a Helix system.
- Numbers: currency as `$1,250.00`; counts with `en-US` comma grouping; timestamps `en-US`, `dateStyle: 'medium', timeStyle: 'short'` (matching shipped formatting); relative time ("2h ago") only for live feeds, never in financial or evidence contexts.
- Booleans render as chips ("Do not contact") or plain words, never "true/false".
- Error copy: say what failed and what to do next, in one sentence; never blame the user; never expose error codes or stack text (raw messages stay in logs).
- The strings "not yet implemented", "coming soon", "Not loaded", "Not measured" (the shipped placeholder strings) are removed from all surfaces per §14; designed states replace them everywhere.

---

## 2. Screen 1 — Login / role-entry (extends the existing login)

**Route:** `/login` · **Access:** unauthenticated · **Extends:** the shipped login page, brand panel, login form, and platform-status readout.

### 2.1 Purpose & entry

Single entry point for both personas. The user declares their workspace (portal) up front, then authenticates with Supabase-managed credentials. The screen must make three things instantly legible: (1) this is the Helix AI operations console, (2) two kinds of people sign in here, (3) the platform's health is visible before signing in — because the product's promise is that it shows what is true, including about itself.

### 2.2 Desktop layout (≥1280px)

Two-column split, matching the shipped grid: left brand panel at a fixed 520px, right form column filling the remainder, full viewport height, no scroll at 1280×800.

**Brand panel (left, 520px)** — always the deep trio (`#07101a` ground, `#e8ecf2` text, `#93a0b4` secondary), identical in light and dark mode:
- Top: HelixMark 40px + "Helix AI" (Display, H3) + "Operations console" (Small, deep-muted) — the shipped lockup, 48px padding.
- Middle: the brand statement, H1 Display: "The console that tells you exactly what happened." (breaks to two lines max, `text-balance`).
- Lower third: the **platform-status readout**, retained and redesigned (§2.5) — xl radius container, 1px `deep-foreground/15` border, `deep/70` fill, 16px padding, max-width 448px.

**Form column (right)** — background token, content vertically centered in a `max-w-sm` block, 64px padding:
1. **Screen header:** "Sign in" (H2 Display) + "Helix AI operations console" (Small, muted).
2. **Workspace selector** (shipped radiogroup, kept): a 2-segment control on a hairline grid — "Agency console" with hint "Agency administrators", "Client portal" with hint "Client users and staff". Each option: 12px padding, name in Body medium, hint in Small muted. Selected: raised fill + accent 2px inset ring; unselected: panel fill, hover raised/60. Keyboard: arrow keys move selection; the selected segment carries `aria-checked` styling.
3. **Email** — Label "Email" + input (h-10, panel bg, input border, md radius).
4. **Password** — Label "Password" + input with the shipped show/hide affordance (eye icon button inside the field, 44px target, `aria-pressed`).
5. **Recovery affordance** — replaced: the banned "Recovery — not yet implemented" string becomes a plain "Forgot password?" link (accent) opening the password-reset modal (§2.6).
6. **Submit** — primary accent button, full column width, h-10: idle "Sign in"; pending swaps to spinner + "Verifying credentials" (shipped pattern, disabled).
7. **Footer note** (Small, muted): "Authentication is managed by Supabase. Contact your account manager if you did not request access."

### 2.3 Mobile layout (375px)

Stacked (matching the shipped grid-rows behavior): the brand panel compresses to a 224px band — HelixMark 40px + lockup left-aligned, 24px padding; the readout and H1 statement are hidden on mobile (the shipped readout is desktop-only). Below it the form column scrolls: 24px horizontal padding, 32px top padding, all targets ≥44px; submit gains h-11. No horizontal scroll.

### 2.4 Populated state (form-in-use)

Populated means a returning visitor or an in-flight/error submission:
- **Field validation:** on submit with an empty/invalid email, the field shows `aria-invalid` styling (status-danger border) + Small status-danger message ("Enter the email address for your workspace."); same for password ("Enter your password."). Errors clear as soon as the field validates.
- **Auth error banner** (role=alert, shipped pattern kept): 1px `status-danger/40` border on `status-danger/10` fill, AlertCircle icon (16px, status-danger), Small text, 12px padding. Two designed messages: invalid credentials — "That email and password combination did not match. Check with your account manager if you have lost access."; role mismatch — "This account belongs to the {Agency console | Client portal}." plus the inline link "Switch to {portal}" (accent, underline-offset-4), which re-selects the correct segment and clears the banner.
- **Pending:** submit shows spinner + "Verifying credentials"; every input and the selector disable; the form carries `aria-busy`.

### 2.5 Platform-status readout — designed states (replaces the shipped placeholder strings)

The readout stays on the login brand panel and gains three real states. It reports only a public, non-tenant aggregate (connector health of the platform itself, freshness of the public status feed) — tenant health stays behind sign-in and RLS.

- **Operational:** "Platform" header (Small-caps, deep-muted) + "Sign-in required" (Small, right-aligned). Two rows (Small): "Integration health" → 8px `#3fb950` dot + "All systems operational"; "Data freshness" → "Updated {time, en-US short}" in tabular-nums. Footer line (Small, deep-muted): one plain-language platform note.
- **Degraded:** same anatomy; health row shows a `#d29922` dot + "Some connectors delayed".
- **Partial outage:** `#f85149` dot + "Sign-in may be delayed"; footer explains the remedy ("We are restoring connector service. Workspaces are unaffected.").

**Readout unavailable state:** if the public aggregate is unavailable at render, the readout shows a single muted line — "Platform status will appear here shortly." — no dots, no banned strings.

### 2.6 Password-reset modal (new, replaces the disabled recovery string)

Triggered by "Forgot password?". Elevation 2, xl radius, 480px. Header: H3 "Reset your password" + Small muted "We'll email a reset link to your account manager address." Body: single email input (prefilled with the entered email if present). Actions: outline "Cancel" + primary accent "Send reset link". Sent state (in-modal): body swaps to one line — "If that address has an account, a reset link is on its way." + a check icon (status-success, 20px) — no toast. The modal never reveals whether the address exists.

### 2.7 Light & dark mode

The brand panel is constant (deep trio) in both modes. The form column flips fully: light shows `#f4f6f9` canvas, white panel inputs, ink primary; dark shows `#0b0e13` canvas, `#11151c` inputs, accent `#38c6e0` on links/segments. Mode follows OS preference (no manual toggle on the login screen — there is no shell here yet); both render identically at 375px. The mode switch never shifts layout: only token values swap.

### 2.8 QA checklist

- [x] Two-portals-first hierarchy: the workspace selector sits above the email field, and role mismatch offers an inline portal switch (shipped behavior retained).
- [x] Brand panel uses the deep trio exactly (`#07101a / #e8ecf2 / #93a0b4`) and is identical in both modes.
- [x] Platform-status readout retained on the login screen with designed operational/degraded/outage states and a graceful unavailable state — and zero banned placeholder strings ("Not loaded", "Not measured", "not yet implemented" all removed).
- [x] All inputs and interactive targets ≥44px on 375px; eye toggle and recovery link meet the target with padding.
- [x] Error states: field-level `aria-invalid` messages and the top-level auth banner both exist; banner includes the switch-portal affordance for ROLE_MISMATCH.
- [x] Pending state disables the whole form, shows spinner + "Verifying credentials", and sets `aria-busy`.
- [x] Only tokens from §1.2 appear; no gradients, no floating shapes, no icon boxes anywhere on the screen.
- [x] Single H1 (brand statement), single H2 ("Sign in"); type scale and Space Grotesk/Inter roles per §1.3.
- [x] Password-reset modal follows §1.9 modal spec; never reveals account existence.
- [x] Both 1280px and 375px layouts fully specified, free of horizontal scroll.

---

## 3. Screen 2 — Agency admin · Client roster

**Route:** `/admin` · **Access:** `agency_admin` only (client roles redirect to `/dashboard`) · **Replaces:** the current placeholder admin page (see §14).

### 3.1 Purpose & entry

The agency's home screen: every workspace (client) in one scannable table, with live counts of what needs attention across the whole book of business. Entry: default landing after admin login; shell nav "Roster".

### 3.2 Desktop layout (≥1280px)

Admin shell left (240px, §1.8). Content column (1200px max):

1. **Screen header (sticky):** "Clients" (H2 Display) + Small muted "Every workspace under management". Right-aligned header actions: "Export roster" (outline, md) — downloads CSV of the visible columns.
2. **Stat band** (4 tiles, 24px gap, each 3 cols): Active workspaces (count of clients.status = 'active'), Onboarding (count = 'onboarding'), Needs attention (workspaces with ≥1 degraded/disconnected integration or ≥1 failed agent task), Pending reviews (sum of contact_facts with status = 'pending' across all workspaces — admin sees the cross-client total; the reviewing happens in each workspace's portal). Each tile: Small-caps eyebrow, Display semibold tabular-nums numeral, Small muted delta ("+2 this week").
3. **Roster table** (full width, panel, 1px border, 48px rows):
   - Columns: Client (business_name, Body medium, row subject) · Vertical (vertical) · Status (ClientStatus chip: Active = success-tinted, Onboarding = warning-tinted, Paused = secondary, Churned = muted) · Systems (count of client_systems rows, tabular-nums) · Integrations (worst-status dot: all connected = success dot; any degraded = warning dot; any disconnected = danger dot, followed by tabular-nums "x/y connected") · Attention (tabular-nums count of unresolved items from the Needs-attention definition, muted at 0) · Last activity (max updated_at across the workspace's contacts/bookings/invoices, en-US short) · Row action: chevron (44px target).
   - Row click / chevron → Screen 3 (single-client detail). Hover: raised fill. Search input above the table (h-10, "Search clients" placeholder, 280px) filters business_name and vertical client-side.
   - Sort: clickable Small-caps headers on Client, Status, Attention, Last activity; sort state via accent underline.
4. **Below the table:** pagination (§1.9) when workspaces exceed one page (25 rows/page).

### 3.3 Mobile layout (375px)

Top bar (admin mobile shell) + bottom tabs (Roster active). Below the top bar: title "Clients" (H2) with the export action in the overflow menu; stat band collapses to a 2×2 grid (12px gaps, 16px padding). The table becomes a stacked list (rows 64px): Client name (Body medium) + status chip on the first line; second line Small muted: vertical · systems count · attention count (danger-tinted number only when >0); right side: worst-integration dot + chevron 44px. Search moves into a full-width input under the title. Pagination becomes infinite scroll with the same skeleton rules.

### 3.4 Populated state

The designed steady state: 3–30 workspaces. The stat band shows real tabular-nums counts (never zeroed when unknown — see the degraded data state below). The table shows the full column set; every row is clickable. Attention counts render foreground-tinted: warning-tinted when >0 (any unresolved review, agent-task failure, or degraded integration), muted at 0; danger tint is reserved for the Integrations column's disconnected dot, never for the attention number. Sorting is stable and honors the 48px row height with two-line cells for long business names (single-line clamp + tooltip with the full name).

**Degraded data state:** if the roster read fails, the table area shows the error band (not the empty state): panel, `status-danger/40` border, `status-danger/10` fill, Small text "The client roster could not be loaded. Retry shortly." + outline "Retry" button (matching the shipped error copy pattern). The stat band renders skeleton tiles (3 rows max, per §1.12).

### 3.5 Empty state (no workspaces)

Per §1.11 formula, in the content column's first band: 48px accent Building2 icon; headline "No workspaces yet"; context "Workspaces appear here once the agency provisions its first client."; action outline button "Provision a workspace" — this opens the provisioning modal (640px): business name, vertical, timezone, WhatsApp number, status defaulting to Onboarding; fields per the clients schema (business_name required). If the agency has workspaces but the search matches none: the table body keeps headers and shows the search-empty row: "No workspaces match '{query}'." + ghost "Clear search" button — this is a sub-state of the table, not the full formula.

### 3.6 Light & dark mode

Token-only differences per §1.2: light — `#f4f6f9` canvas, white panel table and tiles, `#d9dee6` hairlines; dark — `#0b0e13` canvas, `#11151c` panels, alpha hairlines, `#38c6e0` accent on active states and sorted-column indicators. Status dots use mode-specific status tokens (`#1f8a3b`/`#3fb950` etc.). Layout, spacing, and column order are identical across modes.

### 3.7 QA checklist

- [x] Roster reads real clients rows via RLS (agency-admin visible); every column maps to a real schema field (business_name, vertical, status, client_systems count, client_integrations worst status, attention definition, updated_at) — no invented fields.
- [x] ClientStatus chips use the exact 4 statuses (active/onboarding/paused/churned) with the assigned tint mapping; status never used as accent.
- [x] Every row opens Screen 3; the whole row is the target (≥44px high) plus the chevron affordance.
- [x] Stat band numerals are tabular-nums, Display semibold; attention definitions are stated, not guessed.
- [x] Search-empty and true-empty are distinct designed states; true-empty follows the §1.11 formula with a real provisioning action.
- [x] Error band reuses the shipped error copy pattern ("could not be loaded. Retry shortly.") — no banned strings anywhere on the screen.
- [x] Pagination at >25 rows; infinite scroll on mobile; skeletons ≤3 rows.
- [x] Both breakpoints fully specified; ≥44px targets on mobile; table collapses to a stacked list at 375px.
- [x] Light/dark differ only by tokens; no mode-specific layout.
- [x] No gradients, no icon-in-box, no floating shapes; icons are bare Lucide line icons.

---

## 4. Screen 3 — Agency admin · Single-client detail

**Route:** `/admin/clients/[id]` · **Access:** `agency_admin` · **Entry:** every row of Screen 2; shell nav shows the active client's name under *Clients*.

### 4.1 Purpose & entry

The deep work surface for one workspace: its facts, systems, integrations, money, and attention items — the admin's 360° before a client call. This is the admin's richest screen; everything the client sees in screens 5–10, the admin sees here for any workspace, plus admin-only controls (visibility flags, plan data, onboarding steps).

### 4.2 Desktop layout (≥1280px)

Admin shell left. Content column, three vertical bands:

**Band 1 — Client header (sticky):** back link "← Clients" (accent, Small) above the title row: business_name (H2 Display) + status chip + vertical · timezone · WhatsApp number (Small muted, dot-separated) — right side: "Edit workspace" (outline) opening the workspace-settings modal (§12/§14) and primary "View as client" (accent) which signs the admin into a read-only client-portal session for this workspace (banner chip "Viewing as client" persists in the shell while active, per §6–§11 — exit returns to admin).

**Band 2 — KPI strip:** 4 stat tiles (same anatomy as §3.2): Contacts (count of contacts) · Bookings this month (bookings with scheduled_at in current month) · Pipeline (sum of deals.value_cents where stage not CLOSED_WON/CLOSED_LOST, currency) · Pending reviews (contact_facts status='pending' count, warning-tinted numeral when >0).

**Band 3 — Tabbed panels** (tabs: Small, 44px targets, accent underline slide on change):

- **Tab: Overview.** Two columns 8/4. Left: *Activity feed* panel (max 20 rows, newest first, 12px row gaps): each row = 20px type icon (note/call/email/meeting/task/stage_change/enrichment — the CrmActivityType set) + subject or body excerpt (Body, one line clamp) + Small muted "occurred {occurred_at, en-US medium/short}". Below the feed: *Recent bookings* panel (table, 5 rows: contact full_name, scheduled_at, status chip from the 5 booking statuses). Right: *Onboarding progress* mini-panel (completion fraction from §9 definitions, ring or bar in accent, tabular-nums "x of y steps") linking to the Onboarding tab · *Integration health* mini-panel (worst-status dot + "x of y connected", link to Integrations tab) · *Agent queue* mini-panel (last run summary: claimed/applied/noop/failed in tabular-nums, per the verified runner outcomes; failed >0 renders the danger dot).
- **Tab: Systems.** Full-width table of client_systems: system_type (Body medium, shown with its plain-language gloss, e.g., "missed_call_response — Missed-call responder") · provenance chip (Template/Custom, secondary) · active chip (Active = success-tinted / Inactive = muted) · visible_to_client rendered as a switch (admin control, §4.5) · monthly_retainer (currency, tabular-nums, right) · setup_fee (currency, tabular-nums, right). Row action: "Configure" (outline sm) → system config modal (640px, key–value editor over the config record; private values never echoed). Below: outline "Add system" → add-system modal (system_type select from the 5 SystemTypes, provenance, fees, active default true).
- **Tab: Integrations.** Mirrors Screen 7's integration table for this workspace (columns per §8.2), admin-privileged: includes the "Reconnect" action (§4.5) and last_ping_at for every row. Empty state per §8.4, scoped here.
- **Tab: Billing.** Mirrors Screen 8's panels for this workspace: invoices table (due_date, amount_cents, status chip from pending/overdue/paid/disputed, with overdue danger-tinted), plan summary (sum of monthly retainers from client_systems), payment-method panel, plus an admin-only "Record payment" outline action opening the record-payment modal (invoice select, amount, date; paid invoices render a success chip).
- **Tab: Facts.** Full contact_facts view for this workspace: filter chips by evidence_band (verified/probable/possible) and by status (pending/applied/dismissed/superseded), rows in the shipped fact-row anatomy (§7.4); admin sees every status, not just pending. Pending rows carry Approve/Dismiss (§4.5) — identical to the client's review actions.

### 4.3 Mobile layout (375px)

Client header compresses: business_name (H3 Display) + status chip; metadata line wraps; "View as client" becomes the header's primary action in the overflow menu; back link stays. KPI strip becomes a 2×2 stat grid. Tabbed panels become a horizontal scroll tab strip (tab chips, 44px, snap) with one panel visible at a time; within tabs, panels stack with 24px gaps; tables collapse to the stacked-list pattern (§3.3); the Systems switch keeps 44×44 targets.

### 4.4 Populated state

The designed steady state for a mid-sized workspace: KPI strip real counts; Overview feed scrolling with 10–20 mixed-type activities; bookings panel filled; mini-panels live (onboarding fraction, integration health, queue summary). Systems table carries 2–5 rows across the 5 SystemTypes (mixed active/inactive, mixed visible flags); retainer/setup fee columns right-aligned tabular-nums currency. Facts tab shows the full status mix; pending rows carry live Approve/Dismiss.

**Sub-states:**
- **Tab loading:** skeleton rows ≤3 (§1.12) inside the switching panel only; the header, KPI strip, and other tabs stay rendered.
- **Tab read error:** the failing panel shows the error band (§3.4 pattern: danger border/fill, "could not be loaded. Retry shortly.", Retry outline) while other tabs stay functional.
- **Viewing as client:** while the admin's read-only client session is active, the client shell replaces the admin shell (§6) and every client screen renders exactly as designed in §6–§11, with a persistent "Viewing as client — exit" banner chip (raised fill, accent text, 44px target) docked above the shell header; exiting returns to this screen's Overview tab.

### 4.5 Admin-only controls on this screen

- **Visibility switch (Systems tab):** flips `visible_to_client` per system — the control that decides whether the system's card appears on the client's dashboard (§6.2) and in billing (§9). Switch: 44px target, md radius track, accent fill when on, raised fill when off, Small label "Visible to client". Pending state (in-flight): track at 50% opacity + inline "Saving" spinner; failure reverts and toasts "Could not save visibility. Try again." (danger icon).
- **Reconnect (Integrations tab):** outline sm button per degraded/disconnected row — opens a confirm modal (480px): "Reconnect {integration}?" + Small explanation that reconnection triggers a fresh handshake; primary "Reconnect" runs with the pending spinner on the button; success toasts "Reconnected" (success icon) and the row updates live.
- **Approve/Dismiss (Facts tab):** the shipped review actions, unchanged (§7.4): Approve (primary sm, Check icon) writes the fact to the contact record via the verified apply path; Dismiss (outline sm, X icon) leaves the record unchanged. Done states show the shipped inline confirmations ("Approved and written to the contact record." / "Dismissed. The contact record was not changed."); failure keeps the buttons enabled and shows the shipped error line.
- **Record payment (Billing tab):** outline button opening the record-payment modal (§4.2 Billing tab spec). All modal forms follow §1.9.
- **Add system / Configure / Edit workspace:** modal flows per §4.2; destructive changes (deactivating a system) confirm via modal first (§1.10).

### 4.6 Empty state (workspace with no data)

The screen-level empty state triggers only when every tab's data source is empty (new workspace). Header + KPI strip render with 0 counts; below, the §1.11 formula in place of Band 3: 48px accent FolderOpen icon; headline "This workspace is empty"; context "Systems and contacts appear here once onboarding is underway."; action primary "Start onboarding" → jumps to the Onboarding tab, which carries its own designed checklist (§10). Per-tab empties are local and specific: Systems tab empty — headline "No systems installed", context "Install the workspace's first system to begin capturing conversations.", action "Add system"; Facts tab empty — reuses Screen 6's evidence-empty state (§7.5); Integrations tab empty — §8.4; Billing tab empty — "No invoices yet", context "Invoices appear once the workspace is billed.", no action (legitimate empty). Onboarding tab empty is impossible by definition (a new workspace always begins onboarding).

### 4.7 Light & dark mode

Token swap only (§1.2). Notable: dark mode raises border emphasis on the tab strip (alpha hairline) and the accent underline reads `#38c6e0`; the activity feed icons keep muted-foreground color with accent only on hover targets. Nothing changes structurally between modes; both breakpoints render both modes.

### 4.8 QA checklist

- [x] All five tabs read real schema tables (crm_activities via CrmActivityType icons; client_systems with the 5 SystemTypes + visible_to_client; client_integrations with 4 statuses; invoices with 4 statuses; contact_facts with 4 statuses × 3 bands) — no invented data.
- [x] Admin-only controls (visibility switch, reconnect, record payment, configure, add system, edit workspace) exist only on admin surfaces; the "View as client" session renders client screens exactly per §5–§11 with the exit banner.
- [x] Approve/Dismiss behaviors and copy are byte-identical to the shipped fact-review component (verified apply/dismiss path, inline done/error states).
- [x] KPI numerals tabular-nums; currency right-aligned; timestamps en-US medium/short.
- [x] Every modal follows §1.9 (radius xl, elevation 2, scrim, escape/scrim dismiss when idle); destructive changes confirm first.
- [x] Agent-queue mini-panel reports claimed/applied/noop/failed exactly per the verified runner summary; failed >0 shows the danger dot — no other invented queue states.
- [x] Tab strip: 44px targets, accent underline slide (200ms), skeleton ≤3 rows per switching tab only.
- [x] Screen-level empty state only when all sources empty; per-tab empties are specific and actionable; no banned strings.
- [x] 375px: tab strip scrollable/snap, panels stacked, switches 44×44, all targets ≥44px; no horizontal page scroll (tab strip scrolls internally).
- [x] Light/dark token-only; single H2; no gradients/icon-boxes/floating shapes.

---

## 5. Screen 4 — Agency admin · Cross-client analytics

**Route:** `/admin/analytics` · **Access:** `agency_admin` · **Entry:** shell nav *Insights → Analytics*.

### 5.1 Purpose & entry

The book-of-business view: how the agency's whole portfolio performs across bookings, attribution, revenue, and attention. Charts follow the fixed 5-slot chart series (§1.2) and the sanctioned chart set defined here.

**Sanctioned chart set (applies product-wide):** horizontal/vertical bar (single series, chart-1 fill), grouped bar (up to 3 series: chart-1/2/3), stacked bar (composition), line/area (trend; area fill = series color at 10% opacity, no gradient), and stat-tile numerals. No pies, no donuts, no radars, no sparklines in tables, no 3D.

### 5.2 Desktop layout (≥1280px)

Admin shell left. Content column:

1. **Screen header (sticky):** "Analytics" (H2 Display) + Small muted "Performance across every workspace". Right: period selector — a 4-segment control (Last 7 days / 30 / 90 / Custom) md radius, selected segment raised fill + accent ring (same anatomy as the login workspace selector), and "Export report" (outline) downloading the current view's CSV.
2. **Summary band:** 4 stat tiles: Total revenue (sum attribution_events.revenue_cents where event_type='closed_won', period-scoped) · Bookings (count, period) · Leads captured (attribution_events event_type='lead_captured' count) · Win rate (closed_won ÷ (closed_won + closed_lost), percent, tabular-nums).
3. **Trend row (two panels, 8/4):** *Revenue over time* (line/area chart, chart-1, weekly or monthly buckets per period, currency axis tabular-nums) and *Leads by source* (horizontal bar; sources from attribution_events.ad_platform, chart-1 single series, value labels tabular-nums, top 6 + "Other").
4. **Workspace comparison table** (full width): Business (business_name, medium) · Revenue (period closed_won sum, currency, right) · Bookings (count, right) · Leads (count, right) · Win rate (percent, right) · Trend (period-over-period delta: up/down arrow icon + tabular-nums percent, up = accent, down = muted-foreground, flat = em dash; icons 16px, no color beyond stated) · row click → Screen 3.
5. **Attention breakdown panel:** a horizontal stacked bar (one row, 3 segments) across workspaces: pending reviews (warning tint at 20% of status-warning) + failed agent tasks (danger 20% status-danger) + degraded integrations (muted fill), each segment labeled with tabular-nums count, plus legend chips. Below the bar: "Open in roster" link (accent) to Screen 2 with the sort preset to Attention.
6. **Cron health mini-panel** (footer band, full width): last agent-queue run summary in tabular-nums — claimed / applied / noop / failed — with the failed count danger-tinted when >0; Small muted "Last run {time, en-US short}" and a link to the full readout in Settings (§12.4).

### 5.3 Mobile layout (375px)

Top bar + bottom tabs (Analytics active). Summary band: 2×2 grid. Trend row stacks (area chart height 200px, horizontal bar 240px). Workspace comparison becomes a stacked list (64px rows): business_name (medium) + win-rate percent right; second line Small muted: revenue · bookings · leads (tabular-nums). Period selector becomes a horizontal segmented scroll with snap; Export moves to overflow. Attention breakdown bar becomes full-width with the legend wrapped as chips (12px gaps); Cron health panel stacks its four numbers as a 2×2 mini-grid of Small-caps labels + tabular-nums values.

### 5.4 Populated state

The designed steady state: summary band with real period-scoped numbers (revenue in currency, win rate to one decimal, tabular-nums); revenue area chart with 6–12 buckets and currency axis; leads-by-source bars dominated by 1–3 platforms plus a long tail. Comparison table ranks workspaces by revenue (default sort), each row clickable. Attention breakdown with all three segments possible; when a segment is zero it is omitted (no zero-width segments). Cron health shows the last run's claimed/applied/noop/failed with the shipped copy tone.

**Sub-states:**
- **Custom period:** the period selector opens a popover (elevation 1) with two date inputs; applying re-renders all panels with the same tokenized anatomy. Dates render en-US.
- **Read error in any panel:** that panel shows the error band (§3.4 pattern) with Retry; other panels stay functional.
- **Empty period (valid range, no events):** charts show their designed zero-state — flat axis with the "No activity in this period" Small muted line inside the chart panel; the comparison table shows the search-empty pattern minus the search: "No workspace activity in this period." — and the period selector stays interactive so the user can widen it.

### 5.5 Empty state (agency with no data at all)

Per §1.11, in the first content band: 48px accent BarChart3 icon; headline "No analytics yet"; context "Metrics appear here once workspaces record their first attribution events."; action outline "Go to roster" → Screen 2. The summary band renders 0-value tiles (tabular-nums `0`), the period selector stays interactive, and every chart panel shows its zero-state line — the screen never blanks fully, so the IA stays learnable in emptiness.

### 5.6 Light & dark mode

Token swap only (§1.2): charts keep the same series slots — chart-1 `#0e8da6` light / `#38c6e0` dark; axis lines = border token; area fill = chart-1 at 10% opacity in both modes (flat, never gradient). Grid lines and axis labels: border and muted-foreground tokens. Layout identical across modes at both breakpoints.

### 5.7 QA checklist

- [x] Every metric maps to real schema fields (attribution_events.event_type/revenue_cents/ad_platform/occurred_at; bookings; contact_facts pending; agent queue outcomes) — no invented metrics.
- [x] Charts use only the sanctioned chart set (§5.1) and the fixed 5-slot series (§1.2); no pies/donuts/radars/sparklines/3D; area fill is flat 10% opacity, never a gradient.
- [x] Win rate formula stated in the spec (closed_won ÷ (closed_won + closed_lost)) and rendered as tabular-nums percent.
- [x] Period selector (7/30/90/Custom) with popover date inputs; custom re-renders all panels; zero-activity period is a designed sub-state, not an error.
- [x] Comparison rows open Screen 3; default sort revenue; delta arrows follow the stated color rule (up = accent, down = muted, flat = em dash).
- [x] Attention breakdown uses only the three defined attention classes; zero segments omitted; legend chips match segment colors.
- [x] Cron health mini-panel reports exactly claimed/applied/noop/failed (verified runner outcomes) and links to the Settings readout (§12.4).
- [x] Empty state follows §1.11 with a real action; both breakpoints fully specified; ≥44px targets on mobile.
- [x] Tabular-nums on every numeric surface; currency and timestamps per §1.13; light/dark token-only.
- [x] No gradients, no icon boxes, no floating shapes; single H2; sticky header per §1.7.

---

## 6. Screen 5 — Client portal · Dashboard

**Route:** `/dashboard` · **Access:** `client_user` / `client_staff` (agency_admin redirects to `/admin`) · **Replaces:** the current placeholder dashboard (§14) while retaining its verified evidence-review panel behavior.

### 6.1 Purpose & entry

The workspace home for client users: what my systems did, what needs my decision, and where my relationship data stands — nothing more. Entry: default landing after client-portal login; bottom tab "Home".

### 6.2 Desktop layout (≥1280px)

Client shell left (§1.8, business_name headline). Content column:

1. **Screen header:** business_name (H2 Display — the shell already shows the name; the header here pairs it with "Here's what happened lately" Small muted) + right-aligned "Ask your account manager" ghost button (opens a mailto-style panel, 44px) — the client's sanctioned help path.
2. **Evidence review hero panel** (retained from the shipped dashboard, redesigned to full anatomy): lg radius panel, 1px border, 16px padding; H3 "Evidence review" + Small muted "AI observations waiting for a human decision. Only tool-verified facts are auto-written to contact records; everything else lands here." Body line: when pending >0 — "{count} pending suggestion{s}." with the count in Display medium tabular-nums + accent link "Review now →" (→ Screen 6, shipped copy); when 0 — "Nothing to review right now." (Small muted, shipped copy). This panel never disappears; it is the product's trust contract made visible.
3. **System cards row:** one card per client_system where visible_to_client = true AND active = true — lg radius, 1px border, elevation 0, 16px padding, 3-up grid (2-up when only 2; 1-up full-width when 1). Card anatomy: Small-caps eyebrow "SYSTEM" + system plain-language name (H3, with the SystemType gloss, e.g. "Booking receptionist") · one Body-sentence summary of the system's latest activity ("4 bookings captured this week", real count) · status chip (success-tinted "Running" when its integrations are connected; warning "Attention" when degraded — linking to Screen 7) · footer: Small muted "Last activity {time, en-US short}". Cards are not clickable as wholes; the footer carries a ghost "Open →" (44px) to Screen 6 filtered by that system.
4. **KPI band:** 4 stat tiles (workspace-scoped): New contacts this month (contacts.created_at) · Bookings this month · Conversations handled (crm_activities count in period, all types) · Pipeline (deals.value_cents open stages, currency).
5. **Attention summary panel:** if the workspace has pending reviews, overdue invoices, or failed/degraded integrations, one compact panel lists them as three rows (icon 16px + label + tabular-nums count + "View →" accent link to screens 6/8/7 respectively); when all are zero the panel is omitted entirely (a quiet dashboard is the reward — not an empty-state panel saying "all clear").

### 6.3 Mobile layout (375px)

Top bar + bottom tabs (Home active). Vertical stack, 24px gaps: screen header (name + help ghost button moves to overflow) → evidence-review hero (full width) → system cards become full-width stacked cards (12px gaps) → KPI band as 2×2 grid → attention summary full width (its "View →" links become full-width outline sm buttons). All targets ≥44px. No horizontal page scroll.

### 6.4 Populated state

The designed steady state: hero panel shows a real pending count or the shipped zero-copy; 2–4 system cards with live status chips and last-activity times; KPI band with real month-scoped tabular-nums numerals; attention summary present only when something needs attention (each row's count must match its target screen's own count — the dashboard never over- or under-reports). Loading: per-panel skeletons ≤3 rows; the hero panel keeps its header while its body skeletons.

### 6.5 Empty state (workspace with no visible systems)

Triggers when zero client_systems rows match visible_to_client = true AND active = true. The hero panel and KPI band stay (KPI tiles show tabular-nums `0`; the hero shows "Nothing to review right now."). In place of the system cards row, the §1.11 formula: 48px accent CircleSlash icon; headline "No systems on your dashboard yet"; context "Your agency decides which systems appear here. Ask your account manager to make one visible."; action outline "Ask your account manager" (mailto-style flow, same as the header help). This is honest emptiness: the client cannot self-install systems, so the action is the help path, not a fake CTA.

### 6.6 Light & dark mode

Token swap only (§1.2). Light: `#f4f6f9` canvas, white cards, ink primary accents. Dark: `#0b0e13` canvas, `#11151c` cards, `#38c6e0` accent. The hero panel keeps 1px border in both; status chips use mode-specific tints. Layout identical across modes; both breakpoints render both modes.

### 6.7 QA checklist

- [x] Evidence-review hero panel retained from the shipped dashboard with its exact behavior and copy ("{n} pending suggestion{s}." / "Nothing to review right now." / "Review now →") — the panel never disappears, including at 0.
- [x] System cards gated exactly by visible_to_client = true AND active = true; no system card renders otherwise.
- [x] Card status chips reflect client_integrations status (connected → "Running", degraded → "Attention" linking to Screen 7); status never substitutes accent.
- [x] KPI band reads real workspace-scoped fields (contacts, bookings, crm_activities, deals.value_cents) — no invented metrics.
- [x] Attention summary appears only when at least one class is >0, and every count must equal the target screen's count; the panel is omitted at all-zero.
- [x] Empty state follows §1.11 with the honest help-path action; no banned strings anywhere.
- [x] Populated sub-states: skeletons ≤3 rows; hero never blanks.
- [x] 375px: full-width stacks, 2×2 KPI grid, ≥44px targets, no horizontal scroll.
- [x] Tabular-nums on all numerals; en-US timestamps per §1.13; light/dark token-only.
- [x] No gradients, no icon boxes (system eyebrows are Small-caps text, not icon tiles), no floating shapes; single H2.

---

## 7. Screen 6 — Client portal · Unified contact timeline + fact review panel

**Route:** `/dashboard/contacts` (list + timeline) and `/dashboard/facts` (review queue, extending the shipped facts page) · **Access:** `client_user` / `client_staff` · **Entry:** shell nav *Relationships → Contacts*; the dashboard hero's "Review now →"; bottom tab "Contacts".

### 7.1 Purpose & entry

Two coupled surfaces sharing one contract: the contact timeline is where a workspace reads the full history of a relationship (calls, notes, bookings, attribution, facts); the fact review panel is where a human decides which AI-observed facts get written. Screen 6 is the product's core proof — every event says where it came from, and every AI observation is visibly pending until a person or a verified tool path resolves it.

### 7.2 Desktop layout (≥1280px) — contact list + timeline

Client shell left. Content column splits 5/7:

**Left — Contact list panel (5 cols, panel border, internal scroll):** search input (h-10, "Search contacts", filters full_name / company_name / phone / email) + type filter chips (lead_status: cold/warm/hot/customer/lost — secondary chips, multi-select, accent when active). Rows (64px): contact avatar circle (32px, raised fill, initials in foreground — or User icon when no name) + full_name (Body medium, "Unknown contact" fallback per shipped convention) · company_name (Small muted, second line) · right: lead_status dot (8px; hot = status-warning, customer = status-success, cold/warm/lost = muted shades) + "Do not contact" sm chip (danger tint) when do_not_contact = true. Row click selects the contact for the right panel (accent left edge 3px + raised fill on the selected row). Pagination footer when >50.

**Right — Timeline panel (7 cols):** sticky inner header: full_name (H3 Display) + company_name · phone/email (Small muted, one line, dot-separated) + lead_status chip + do_not_contact chip · action row: outline sm "Add note" (opens the note composer modal: subject/body, CrmActivityType 'note', due_at optional) and ghost "View all facts" (→ filters the timeline to fact events). Below, the **unified timeline**: reverse-chronological stream of merged events — crm_activities (7 types, 20px type icons: note/call/email/meeting/task/stage_change/enrichment), bookings (status chips from the 5 booking statuses + scheduled_at), attribution_events (5 event types + revenue_cents when present, currency, tabular-nums), contact_facts (band chip + field_name/field_value preview + status chip: pending warning-tinted, applied success-tinted, dismissed/superseded muted). Timeline rail: 2px border-colored vertical line, 12px event dots (type-colored: facts = accent, bookings = chart-1, attribution = chart-2, activities = muted-foreground), events in lg cards with 12px gaps; each card: Small muted "when" line (en-US medium/short) + Body content + Small muted source line ("Source: {system or tool}" — attribution_events.ad_platform / contact_facts.source_tool / activity subject). The stream loads 25 events with "Load earlier events" outline button (44px).

### 7.3 The fact review panel (desktop)

A distinct panel on the same route, reached by shell nav "Review facts" under *Relationships* (and the dashboard hero link): header H3 "Evidence review" + Small muted explanation retained from the shipped facts page ("Every AI observation lands here first. Only facts whose source tool is registered as verified are applied automatically; probable and possible observations become suggestions that a person approves or dismisses. Nothing is ever auto-written from a model's own confidence.") — plus filter chips (evidence band: verified/probable/possible; status: pending/applied/dismissed/superseded; defaults to pending). Rows use the **shipped fact-row anatomy exactly** (components/crm/fact-review-list): band chip (verified = success tint, probable = warning tint, possible = border/raised/muted — the shipped mapping), contact line ("{full_name} · {company_name}", "Unknown contact" fallback), fact line ("{field_name humanized}: {field_value}" with underscores→spaces), meta line ("Observed by {source_tool} · ledger score {score} · {observed_at, en-US}" — score omitted when null, matching shipped), and the action pair Approve (primary sm, Check icon) / Dismiss (outline sm, X icon) with the shipped inline done states ("Approved and written to the contact record." / "Dismissed. The contact record was not changed.") and error line. Above the list, a Small-caps count row: "{n} pending suggestion{s}" (shipped copy tone). The list paginates at 100 rows (matching the shipped limit) via §1.9 pagination.

### 7.4 Mobile layout (375px)

**Contacts + timeline:** the 5/7 split becomes a single-column flow: full-width search + horizontal scroll status chips (44px, snap) → contact cards (64px stacked list, anatomy identical to desktop rows) → tapping a contact pushes the timeline view (in-app back "← Contacts" Small accent link): sticky contact header compresses to name + chips, one line metadata; events stack as lg cards; "Load earlier events" becomes a full-width outline button. **Fact review panel:** rows keep the shipped anatomy; the action pair grows to 44px-high buttons side by side; filter chips scroll horizontally above the list. The note composer modal becomes a full-screen-sheet style (top corners xl, 24px top inset) with the same field order.

### 7.5 States (timeline + review panel)

**Populated:** list with 10–50 contacts, mixed lead_status dots, some do_not_contact chips; timeline for the selected contact merges all four event families with visible band/status chips and source lines; review panel with a real pending mix across all three bands. Sub-states: list loading → skeleton rows ≤3; timeline loading → skeleton cards ≤3; read errors → per-panel error band (§3.4 pattern, Retry) — a failing timeline never blanks the list, and vice versa.

**Empty — no contacts in the workspace:** the whole right panel and list show the §1.11 formula: 48px accent Users icon; headline "No contacts yet"; context "Contacts appear here as your systems capture conversations and form submissions."; action outline "Ask your account manager" (help path — clients cannot self-import). Search-matches-none keeps headers and shows the search-empty row ("No contacts match '{query}'." + ghost "Clear search").

**Empty — contact has no events:** the timeline panel shows the formula scoped to the panel: same icon pattern, headline "No history yet for this contact"; context "Events appear as your systems capture bookings, calls, and form submissions."; no action (legitimate empty — the panel explains why it exists).

**Empty — review queue clear (0 pending):** a designed clear state upgrading the shipped "No pending suggestions — the queue is clear." line: 48px accent CheckCircle2 icon; headline "The review queue is clear"; context "New observations from your systems appear here for approval. Nothing is waiting right now."; no action. Filter chips stay visible so the user can switch to applied/dismissed/superseded histories.

### 7.6 Light & dark mode

Token swap only (§1.2). Timeline rail and dots: border/raised/chart tokens, identical structure both modes; band chips use the shipped status mappings in mode-specific values. Dark mode timeline cards `#11151c` on `#0b0e13` canvas with alpha hairlines. Both breakpoints render both modes; no structural change.

### 7.7 QA checklist

- [x] Timeline merges exactly the four real event families (crm_activities 7 types; bookings 5 statuses; attribution_events 5 types; contact_facts 3 bands × 4 statuses) — every card shows its source; no invented event kinds.
- [x] Fact rows are byte-identical in anatomy, copy, and actions to the shipped fact-review component (band chip mapping, "Observed by", ledger score only when non-null, Approve/Dismiss, inline done/error states).
- [x] Verified/probable/possible semantics render exactly: verified = success tint, probable = warning tint, possible = neutral — the shipped mapping, never restyled.
- [x] Pending facts render warning-tinted until resolved; applied success-tinted; dismissed/superseded muted — matching FactStatus semantics.
- [x] Revenue renders currency tabular-nums (attribution_events.revenue_cents) only when present; timestamps en-US medium/short.
- [x] Contact rows honor do_not_contact (danger chip) and the 5 lead_status dots with the stated color rule; "Unknown contact" fallback matches shipped convention.
- [x] 375px: split collapses to push-navigation, chips scroll horizontally, all targets ≥44px, modals become sheets; no horizontal page scroll.
- [x] Four distinct designed empties (no contacts, search-empty, no history, queue clear) per §1.11; none use banned strings.
- [x] Review path is the verified one: Approve → apply_contact_fact; Dismiss → dismiss_contact_fact; contact_facts stays write-locked (INSERT/PATCH/DELETE → 403 over REST).
- [x] Light/dark token-only; single H2 (screen title "Contacts"); skeletons ≤3 rows; no gradients/icon-boxes/floating shapes.

---

## 8. Screen 7 — Client portal · Integration health

**Route:** `/dashboard/integrations` · **Access:** `client_user` / `client_staff` · **Entry:** shell nav *Relationships → Integrations*; the dashboard's "Attention" chip; admin's mirrored tab (§4.2).

### 8.1 Purpose & entry

The truth screen for connections: which external systems each Helix system talks to, whether that connection is healthy, and when it was last heard from. No reconnect controls for clients (that's the agency's job) — the client sees state and can request help.

### 8.2 Desktop layout (≥1280px)

Client shell left. Content column:

1. **Screen header (sticky):** "Integrations" (H2 Display) + Small muted "Connection health for your workspace's systems" + right: "Ask your account manager" ghost button (44px, same help path as §6.2).
2. **Summary band:** 3 stat tiles: Connected (count status='connected') · Degraded (count 'degraded') · Disconnected (count 'disconnected', danger-tinted numeral when >0). Unknown-status rows don't get a tile; they appear in the table with the muted chip (§8.4) and count toward the total line.
3. **Integration table** (full width, panel, 48px rows): columns — System (system_type plain-language name, Body medium, row subject) · Integration name (id-derived display label; private webhook URLs are never shown anywhere, per the schema's safe readout contract) · Status chip (connected = success tint, degraded = warning tint, disconnected = danger tint, unknown = secondary/muted) · Last ping (last_ping_at, en-US medium/short, tabular-nums, muted "Never" when null) · Added (created_at date, en-US medium) · Row action: ghost "Details" (44px) opening a right-side detail drawer (360px, panel bg, elevation 0, left border): status chip + plain-language one-paragraph explanation of what this integration does + last ping + a Small muted "Managed by your agency" line + outline "Request attention" sm button (mailto-flow with prefilled subject including the integration label).
4. **Per-system grouping toggle:** Small ghost toggle "Group by system" / "Flat list" (switch, 44px) — grouped view nests rows under Small-caps system eyebrows; flat is the default.

### 8.3 Mobile layout (375px)

Top bar + bottom tabs. Summary band: single full-width row of 3 compact tiles (12px gaps). The table becomes stacked cards (64px): first line system plain-language name (medium) + status chip right; second line Small muted: integration label · "Last ping {time/never}"; chevron 44px opens the detail sheet (bottom sheet, xl top corners, 24px inset, scrollable, same anatomy as the drawer). Group toggle moves to the overflow menu.

### 8.4 Empty state (no integrations)

Per §1.11, in the first content band: 48px accent PlugZap icon; headline "No integrations yet"; context "Connections appear here once your agency connects your systems to the tools they use."; action outline "Ask your account manager" (help path). The summary band renders three 0-tiles (tabular-nums). If integrations exist but none match a filter (none defined on this screen — filters arrive with grouping only), the table shows all rows; there is no additional filtered-empty on this screen.

### 8.5 Populated state

The designed steady state: 3–10 rows across 1–3 systems, mostly connected chips with fresh pings, at most one degraded row demonstrating the warning tint, and last_ping_at values within the platform's expected heartbeat. The status chips use exactly the four IntegrationStatus values with the stated tints; "Never" renders for null last_ping_at (muted, not danger — an integration can be legitimately new). Read error: table error band (§3.4 pattern, Retry); summary tiles skeleton ≤3.

### 8.6 Light & dark mode

Token swap only (§1.2): status chips keep their tint mapping with mode-specific values; the detail drawer/sheet keeps panel bg and hairline borders. Layout identical across modes; both breakpoints render both modes.

### 8.7 QA checklist

- [x] Reads client_integrations via the safe readout projection — status, system_type, last_ping_at, created_at only; private webhook URLs never rendered anywhere.
- [x] Exactly the four IntegrationStatus values with the assigned tints (connected/success, degraded/warning, disconnected/danger, unknown/muted) — no invented statuses.
- [x] last_ping_at null renders "Never" (muted), not an error; timestamps en-US medium/short, tabular-nums.
- [x] Client surface is read-only: Details/Request-attention only; no reconnect controls on the client variant (admin's Reconnect lives in §4.5).
- [x] Empty state per §1.11 with the help-path action; zero-state summary tiles are designed, not blanked.
- [x] Group-by-system toggle and drawer/sheet follow §1.9/§1.10; drawer 360px desktop, sheet on mobile; all targets ≥44px.
- [x] 375px: stacked cards, compact summary row, no horizontal scroll; both breakpoints fully specified.
- [x] Light/dark token-only; single H2; skeletons ≤3 rows; no gradients/icon-boxes/floating shapes.
- [x] Error state reuses the §3.4 error-band pattern with shipped copy tone ("could not be loaded. Retry shortly.").

---

## 9. Screen 8 — Client portal · Billing & plan

**Route:** `/dashboard/billing` · **Access:** `client_user` (plan/invoice visibility for `client_staff` follows the same workspace scoping — both client roles see billing; there is no separate gate in the schema) · **Entry:** shell nav *Account → Billing*; the dashboard attention row for overdue invoices.

### 9.1 Purpose & entry

Money truth: what the workspace pays, which invoices are open, and what happens if one goes overdue. The screen renders financial data with the same honesty rules as evidence — amounts are tabular-nums currency, statuses are the four real InvoiceStatus values, and nothing is simulated.

### 9.2 Desktop layout (≥1280px)

Client shell left. Content column:

1. **Screen header (sticky):** "Billing" (H2 Display) + Small muted "Your plan and invoices" + right: "Ask your account manager" ghost (help path).
2. **Plan panel** (top band, two columns 7/5): left — H3 "Your plan" + Small muted one-liner ("Your monthly total is the sum of the systems your agency runs for you.") + plan composition list: one row per client_system where visible_to_client = true: system plain-language name (Body) · monthly_retainer_cents (currency, tabular-nums, right) · Small muted setup fee note ("Setup {currency}" when setup_fee_cents is non-null) · inactive systems excluded. Right — a summary card (raised fill, lg radius): "Monthly total" Small-caps eyebrow + Display semibold tabular-nums currency (sum of the listed retainers) + Small muted "before taxes" + "Next invoice {due_date of the earliest pending invoice, en-US medium}" when one exists.
3. **Invoices table** (full width): columns — Invoice (id short-form, tabular-nums, muted) · Amount (amount_cents currency, tabular-nums, right) · Due (due_date, en-US medium) · Status chip (paid = success tint; pending = secondary; overdue = danger tint; disputed = warning tint) · row action: ghost "View" (44px) → invoice detail modal (480px): full id, amount, due date, status chip, issued (created_at), contact line when contact_id is set (Small muted, "Billed to {contact}") + "Download PDF" outline sm (disabled with tooltip "Not available in this workspace yet" only if the workspace's billing channel disallows it — otherwise primary). Read error: error band per §3.4.
4. **Payment method panel** (footer band): Small-caps "Payment method" + the method on file rendered as Body text + last-four (e.g., "Card ending 0242") + outline sm "Update payment method" → update modal (480px; managed by the agency's billing channel; on open it explains "Your account manager completes this change with you" and offers the mailto help path).

### 9.3 Mobile layout (375px)

Top bar + bottom tabs (Billing reached from Settings tab groups/overflow — 5 client tabs are Home/Contacts/Queue/Settings, so Billing enters from the Settings screen's Account list or overflow). Plan panel stacks: composition list full width, then the summary card full width. Invoices become stacked cards (64px): first line "Invoice {short id}" (medium) + status chip right; second line Small muted: amount · due date. "View" becomes the whole card (44px). Payment method panel stacks full width. All targets ≥44px.

### 9.4 Populated state

The designed steady state: 2–5 visible systems in the composition list with real retainers summing exactly to the summary card (the sum must match — a mismatch is a defect, not a rounding rule); 6–24 invoices across all four statuses with overdue rows danger-tinted and their due dates past; next-invoice line present. Loading: skeletons ≤3 rows per panel; read errors per-panel error bands (§3.4) — a failing invoice table never blanks the plan panel.

### 9.5 Empty state (no invoices)

Per §1.11: 48px accent Receipt icon; headline "No invoices yet"; context "Invoices appear here once your workspace begins its billing cycle."; no action (legitimate empty — but the plan panel above always renders with its composition list; only the invoice table empties). If the workspace also has zero visible systems, the plan panel shows its own scoped formula: 48px accent CircleSlash; headline "No plan on file yet"; context "Your agency sets the systems and fees that make up your monthly total."; no action beyond the header help path.

### 9.6 Light & dark mode

Token swap only (§1.2). Financial figures never change color by mode (foreground in both); status chips use mode-specific values; the raised-fill summary card keeps its 1px border in dark. Layout identical across modes; both breakpoints render both modes.

### 9.7 QA checklist

- [x] Plan composition gated exactly by visible_to_client = true (active systems only); the summary card sum equals the listed retainers — always reconciled, both breakpoints.
- [x] Invoice statuses use exactly the four InvoiceStatus values with the assigned tints (paid/success, pending/secondary, overdue/danger, disputed/warning) — no invented statuses; overdue implies due_date in the past.
- [x] All amounts currency tabular-nums right-aligned; due_date/created_at en-US medium; invoice ids render short-form muted, full id only in the detail modal.
- [x] Invoice detail modal per §1.9 (480px, elevation 2, scrim, escape/scrim dismiss); "Download PDF" state is explicit (primary when allowed; disabled with tooltip when the channel disallows — never a silent nothing).
- [x] Payment method update flows through the agency (update modal + mailto help); the client surface never collects card data.
- [x] Empty states (no invoices; no plan on file) follow §1.11, honest and specific; no banned strings.
- [x] 375px: stacked cards, plan panels stack, ≥44px targets, no horizontal scroll; both breakpoints fully specified.
- [x] Light/dark token-only; single H2; skeletons ≤3 rows; read errors per-panel; no gradients/icon-boxes/floating shapes.
- [x] contact_id link renders "Billed to {contact}" only when set; no other invented invoice fields.

---

## 10. Screen 9 — Client portal · Onboarding checklist

**Route:** `/dashboard/onboarding` · **Access:** `client_user` / `client_staff` · **Entry:** shell nav *Account → Onboarding*; Settings' Account list; overflow menu on mobile.

### 10.1 Purpose & entry

The guided first-30-days surface: what is done, what the client must do, and what the agency does next. Completion here is honest — a step is done only when its real data exists, and progress derives from the checklist definition below, not from a separate counter.

**Checklist definition (fixed, derived from real state):** (1) Connect WhatsApp number — done when clients.whatsapp_number is non-null. (2) Set business details — done when vertical, timezone, and dialect are all non-null. (3) Install first system — done when ≥1 client_systems row exists. (4) Connect integrations — done when ≥1 client_integration status='connected'. (5) Import or capture first contacts — done when ≥1 contacts row exists. (6) First booking captured — done when ≥1 bookings row exists. (7) First attribution event recorded — done when ≥1 attribution_events row exists. (8) Review first AI observation — done when ≥1 contact_facts row has status='applied' or 'dismissed' (a human decision). (9) First invoice issued — done when ≥1 invoices row exists. Every step's done-state is computable from real tables — no invented progress flags.

### 10.2 Desktop layout (≥1280px)

Client shell left. Content column:

1. **Screen header (sticky):** "Onboarding" (H2 Display) + Small muted "Getting your workspace fully running" + right: ghost "Ask your account manager" (44px, help path).
2. **Progress header panel** (raised fill, lg radius, 1px border, 16px padding): Display semibold tabular-nums fraction "{done} of {9} steps complete" + a horizontal progress bar (8px height, md radius track in panel fill, fill = accent, width = done/9) + Small muted sentence naming the single next step ("Next: {step name}" — the first incomplete step).
3. **Checklist list** (panel, 1px border): nine rows (64px, hairline separators). Row anatomy — left: 24px state marker: done = CheckCircle2 icon (status-success) + strikethrough Small muted step name; current (first incomplete) = Circle icon (accent, 24px) + Body medium step name + sm accent chip "Next"; pending = Circle icon (muted-foreground) + Body step name. Right: Small muted "who" tag — "You" for steps 8 (review) and any the client controls (1, 2 when fields are client-editable), "Your agency" for the rest — and ghost "Details" (44px) opening a step drawer (360px, panel, elevation 0): the step's plain-language explanation (2–3 sentences), what makes it done, and the owning party. Completed rows collapse under a Small-caps "Complete" group header; incomplete rows group under "Remaining"; the current step is pinned at the top of Remaining.
4. **Notes panel** (footer): Small-caps "Notes" + Body text area rendering the workspace's onboarding notes (plain text, 3 lines visible, "Show more" ghost when longer); the notes surface is read-mostly with an inline edit mode (Input styling per §1.9) — notes belong to the workspace, visible to both parties.

### 10.3 Mobile layout (375px)

Top bar + bottom tabs (entered via Settings/overflow). Progress panel full width; checklist rows compress: state marker + name on line one, "who" tag + Details chevron on line two (rows grow to 72px); drawer becomes a bottom sheet (xl top corners). Notes panel full width with the same show-more behavior. All targets ≥44px.

### 10.4 Populated state

The designed steady state (workspace ~60% through): 5–6 done rows (success markers, strikethrough), current step pinned with the "Next" chip and accent circle, 2–3 pending rows; progress bar at the honest fraction; next-step line matches the pinned row. Loading: skeleton rows ≤3; read error: error band (§3.4 pattern) with Retry — the progress panel skeletons rather than showing a fake fraction.

### 10.5 Empty state

Structurally impossible by design: a workspace always has 9 steps (the definition is fixed and rows always exist), so the checklist never empties — the "empty" experience is the all-pending state: zero progress ("0 of 9 steps complete" per the progress panel's formula), every row pending, current = step 1. This is the designed new-workspace state and is explicitly not an empty state; no §1.11 treatment applies.

### 10.6 Light & dark mode

Token swap only (§1.2): done markers use mode-specific status-success; the progress bar keeps accent fill on panel track; the raised progress panel reads `#eaeef3` light / `#171c25` dark. Layout identical across modes; both breakpoints render both modes.

### 10.7 QA checklist

- [x] All nine steps map to real, computable done-conditions (clients.whatsapp_number/vertical/timezone/dialect; client_systems; client_integrations connected; contacts; bookings; attribution_events; contact_facts human-decided; invoices) — no invented progress fields.
- [x] Progress fraction and bar always equal done/9; the pinned "Next" row is always the first incomplete step; fraction, bar, and pinned row agree in every state.
- [x] Done rows render status-success markers + strikethrough; pending muted; current accent + chip — status colors never used as accent, accent never used for done.
- [x] Ownership tags use only "You" / "Your agency" per the stated mapping.
- [x] The checklist cannot empty (fixed 9 steps); the all-pending state is a designed state, not an error or empty state.
- [x] Step drawer/bottom sheet follows §1.9; every drawer states the done-condition in plain language.
- [x] 375px: 72px rows, bottom sheets, ≥44px targets, no horizontal scroll; both breakpoints fully specified.
- [x] Tabular-nums on the fraction; notes panel read-mostly with inline edit; no banned strings.
- [x] Light/dark token-only; single H2; skeletons ≤3 rows; no gradients/icon-boxes/floating shapes.

---

## 11. Screen 10 — Client portal · Attention queue

**Route:** `/dashboard/queue` · **Access:** `client_user` / `client_staff` · **Entry:** bottom tab "Queue"; shell nav *Account → Attention queue*; dashboard attention summary links.

### 11.1 Purpose & entry

One prioritized list of everything in the workspace that needs a human: evidence waiting for review, connections that degraded, money that went overdue, and conversations that went quiet. The queue is the client's daily work surface — its job is triage, and its reward is empty.

**Queue item classes (fixed, all computable from real tables):** (1) *Pending review* — contact_facts status='pending' (action → Screen 6 review panel). (2) *Integration needs attention* — client_integrations status='degraded' or 'disconnected' (action → Screen 7). (3) *Overdue invoice* — invoices status='overdue' (action → Screen 8). (4) *Follow up* — bookings status='no_show' with scheduled_at within the last 14 days (action → Screen 6 timeline for that contact). Fixed priority order: pending reviews (oldest first within class) → disconnected integrations → degraded integrations → overdue invoices (oldest due first) → no-show follow-ups (newest first). Items leave the queue only when their underlying state changes — nothing is dismissible by hand.

### 11.2 Desktop layout (≥1280px)

Client shell left. Content column:

1. **Screen header (sticky):** "Attention queue" (H2 Display) + Small muted "What needs a human today" + right: ghost "Ask your account manager" (help path).
2. **Queue count panel** (single stat tile, full-width band): Small-caps eyebrow "Open items" + Display semibold tabular-nums count + Small muted "items resolve as their state changes" — count must equal the list length below exactly.
3. **Queue list** (panel, 1px border): rows (72px, hairline separators), each: left — 20px class icon (pending review = FileSearch accent; integration = PlugZap; invoice = Receipt; follow-up = PhoneMissed, all muted-foreground except pending-review's accent) · subject line (Body: specific and real — "{n} observations waiting for review", "{system}'s {integration label} connection is {status}", "Invoice {short id} is overdue by {days} days", "{contact} missed their booking on {date}") · meta line (Small muted: age or due date, en-US; tabular-nums) · right — sm chip with the class name (pending review = warning tint; integration disconnected = danger tint, degraded = warning tint; overdue invoice = danger tint; follow-up = secondary) + action: outline sm "Open" (44px) deep-linking to the target screen (and pre-selecting the row where the target screen supports it — the fact in the review panel, the invoice modal, the integration row).
4. **Class group headers** (Small-caps) between classes when >1 class present; within a class, rows follow the stated sub-order.

### 11.3 Mobile layout (375px)

Top bar + bottom tabs (Queue active). Count tile full width; queue rows compress: class icon + subject line one; chip + "Open" full-width outline button line two (rows grow to 88px). Group headers stay. All targets ≥44px; no horizontal scroll.

### 11.4 Populated state

The designed steady state: 3–8 open items across at least two classes — e.g., 2 pending reviews (accent icons, oldest first), 1 degraded integration, 1 overdue invoice (danger chip), 2 no-show follow-ups. The count tile equals the rendered rows; every subject line carries real specifics (names, dates, short ids — never "an item"). Loading: skeleton rows ≤3; read error: error band (§3.4) with Retry; a failing class renders nothing rather than a zero (never under-report).

### 11.5 Empty state (the reward state)

Per §1.11, in the first content band: 48px accent CheckCircle2 icon; headline "Nothing needs your attention"; context "New reviews, connection changes, overdue invoices, and missed bookings appear here automatically."; no action (legitimate empty — the queue's purpose is to be empty; the help ghost in the header remains the only affordance). The count tile renders tabular-nums `0` and stays.

### 11.6 Light & dark mode

Token swap only (§1.2): class chips use mode-specific status values; the pending-review icon keeps accent in both modes; group headers muted. Layout identical across modes; both breakpoints render both modes.

### 11.7 QA checklist

- [x] Queue classes are exactly the four defined (pending reviews, degraded/disconnected integrations, overdue invoices, recent no-show bookings) — all computable from real tables; no invented classes.
- [x] Priority order is fixed and stated; within-class sub-orders stated (oldest/newest); no manual dismiss — items resolve only via state change.
- [x] Count tile always equals the rendered list length, including during pagination/skeleton states; failing classes render nothing rather than zero.
- [x] Every subject line is specific and real (counts, names, statuses, short ids, dates); tabular-nums on numerals; en-US dates.
- [x] Class chips use the assigned tints (pending warning, disconnected/overdue danger, degraded warning, follow-up secondary); pending-review icon accent — the only accent use on the screen.
- [x] "Open" deep-links to the correct screen and pre-selects the row where supported; 44px target on both breakpoints.
- [x] Empty state follows §1.11 with no action (the empty queue is the reward); count tile renders 0; no banned strings.
- [x] 375px: 88px rows, full-width Open buttons, ≥44px targets, no horizontal scroll; both breakpoints fully specified.
- [x] Light/dark token-only; single H2; skeletons ≤3 rows; no gradients/icon-boxes/floating shapes.

---

## 12. Screen 11 — Settings (admin + client variants)

**Route:** `/settings` (single route; the variant renders by role: `agency_admin` → admin variant; `client_user`/`client_staff` → client variant) · **Entry:** shell nav *Workspace → Settings*; bottom tab "Settings" (both shells); overflow menu on mobile.

### 12.1 Purpose & entry

Account-level controls and readouts that don't belong to a specific working screen. The two variants share the frame but never each other's sections. This is where the agent-queue readout lives (admin), and where the client's profile, theme, and session live.

### 12.2 Admin variant — desktop layout (≥1280px)

Admin shell left. Content column, two columns 8/4:

**Left — Agency settings (8 cols):**
1. **Screen header (sticky):** "Settings" (H2 Display) + Small muted "Agency console controls".
2. **Agency profile panel:** Small-caps "Agency" + H3 "Helix AI operations" (static identity — no agency name field exists in the schema; this panel is read-only) + Small muted line "Signed in as {email}" (session identity) + role chip "Agency admin" (secondary).
3. **Theme panel:** Small-caps "Appearance" + segmented control Light / System / Dark (same anatomy as §2.2's workspace selector, 3 segments, 44px) — System follows OS preference; the choice persists to the account. Radio-semantics: one selection, keyboard-navigable.
4. **Danger zone panel** (1px `status-danger/40` border): Small-caps "Danger zone" + one row: "Sign out of this device" + outline sm "Sign out" (ink destructive styling) → confirm modal (480px): "Sign out?" + Small "You will need your credentials to sign back in." + primary ink "Sign out" / outline "Cancel" (§1.9/§1.10).

**Right — Agent queue readout (4 cols, §1.8's referenced readout):**
- Small-caps "AGENT QUEUE" header + H3 "Last run" + the run summary as a 2×2 mini-grid of Small-caps labels + Display tabular-nums values: claimed / applied / noop / failed — exactly the verified runner outcomes (cron e2e: claimed 9 / applied 2 / noop 7 / failed 0, and wrong-secret 401s never render as UI errors). failed >0 renders the danger dot beside its value. Below: Small muted "Last run {time, en-US short}" + ghost "Refresh" (44px) re-reading the summary; a failing read renders the error band (§3.4) inside the readout panel only.
- Below the readout: **Webhook secret panel:** Small-caps "Webhook secret" + Small muted explanation ("The shared secret is never displayed. Rotate it with your security lead.") + outline sm "Rotate secret" → confirm modal (480px, explicit warning styling: status-warning border): "Rotate the webhook secret?" + Small "Existing senders must update their secret. Disrupted webhooks arrive as failed until then." + ink destructive "Rotate" / outline "Cancel".

### 12.3 Client variant — desktop layout (≥1280px)

Client shell left. Content column, single column (max 640px):

1. **Screen header (sticky):** "Settings" (H2 Display) + Small muted "{business_name} workspace".
2. **Profile panel:** Small-caps "Profile" + full_name (H3) + email (Small muted, session identity) + role chip ("Client user" / "Client staff", secondary) + outline sm "Edit name" → edit modal (480px): single full_name input + primary "Save"; success re-renders the panel (no toast alone, per §1.9).
3. **Workspace panel:** Small-caps "Workspace" + rows: Business name (Body) · Vertical · Timezone · WhatsApp number · Status chip (the client's own ClientStatus) — all read-only for clients (Small muted "Managed by your agency" note at the panel foot). This panel doubles as the mobile entry surface for Billing/Onboarding (§12.4) on narrow screens.
4. **Theme panel:** identical to admin's theme panel.
5. **Danger zone panel:** identical to admin's, minus "of this device" nuance — same sign-out confirm modal.

### 12.4 Mobile layout (375px) — both variants

Top bar + bottom tabs (Settings active). Both variants stack: profile/agency panel, workspace panel (client), theme panel, danger zone — full width, 24px gaps; the admin's agent-queue readout and webhook panel stack below the theme panel; the readout's 2×2 grid stays. **Client Account list (mobile Billing/Onboarding entry):** at the top of the client variant, a Small-caps "Account" group with two rows — "Billing" and "Onboarding" with chevrons (44px) linking to screens 8/9 — this is how those screens are reached on mobile (per §9.3). All targets ≥44px; modals become bottom sheets.

### 12.5 States (both variants)

**Populated:** every panel renders with real session/role/workspace values; the admin readout shows the last run's four numbers (claimed/applied/noop/failed) with real values — the e2e-verified exemplar run (claimed 9 / applied 2 / noop 7 / failed 0) demonstrates the layout, not a hard-coded UI; theme segment reflects the persisted choice. Loading: per-panel skeletons ≤3 rows; read errors per-panel error bands (§3.4). Sign-out/rotate flows: pending button spinner + disabled modal actions (§1.10); failures keep the modal open with the shipped error tone ("The review could not be saved. Try again." pattern → "The change could not be saved. Try again." on this screen).

**Empty states:** none apply — every panel reads session or schema state that always exists for a signed-in user (profile, role, workspace, last queue run). The only zero-state is the agent-queue readout with no recorded run yet: the 2×2 grid renders em-dashes with Small muted "No run recorded yet" — a designed unavailable state, not a §1.11 empty (the panel itself cannot disappear).

### 12.6 Light & dark mode

Token swap only (§1.2): the theme panel is the live demonstration of the choice; danger zone keeps its `status-danger/40` border in both modes (mode-specific danger values); warning-styled rotate modal uses mode-specific warning. Layout identical across modes; both breakpoints render both modes.

### 12.7 QA checklist

- [x] Both variants fully specified (admin §12.2, client §12.3); variants never leak each other's sections; single route renders by role.
- [x] Admin readout reports exactly claimed/applied/noop/failed from the verified runner summary (e2e: claimed 9 / applied 2 / noop 7 / failed 0); wrong-secret 401s never surface as UI errors; no-run renders em-dashes + "No run recorded yet".
- [x] Webhook secret is never displayed anywhere; rotation is a confirm modal with warning styling; no secret echo in any state.
- [x] Client workspace panel is fully read-only ("Managed by your agency"); profile edit covers full_name only (the editable field on profiles).
- [x] Theme choice Light/System/Dark persists per account; System follows OS; the login screen follows OS only (§2.7) until an account choice exists.
- [x] Sign-out confirm modal per §1.9/§1.10 on both variants; destructive ink styling only in danger zones; Escape/scrim dismiss when idle.
- [x] Mobile client variant exposes the Account list (Billing/Onboarding chevron rows) per §9.3's entry rule.
- [x] 375px: stacked panels, bottom-sheet modals, ≥44px targets, no horizontal scroll; both breakpoints fully specified.
- [x] Tabular-nums on all numerals (queue readout); en-US timestamps per §1.13; light/dark token-only.
- [x] No gradients, no icon boxes, no floating shapes; single H2; no banned strings on either variant.

---

## 13. Global QA (cross-screen guarantees)

These checks apply to the whole product; each screen's checklist assumes them.

- [x] **Token fidelity:** every surface color in the product is one of the §1.2 tokens at its exact hex/alpha; no off-palette color exists. Accent is the sole interactive-emphasis hue; status colors appear only in chips, dots, and progress per the usage rules.
- [x] **Typography:** Space Grotesk on display roles, Inter on body, per the shipped 5-step scale (56/32/22/16/13); one H2 per screen; tabular-nums on every numeric surface; no text below 13px (12px tabular stat numerals excepted).
- [x] **Spacing & geometry:** only 4/8/12/16/24/32/48/64 gaps; radii only 6/8/12/16 (+round dots/avatars); elevation only 0/1/2 with borders-first.
- [x] **Both breakpoints:** every screen specified at ≥1280px and 375px; no horizontal scroll at 375px; every interactive target ≥44×44px on mobile.
- [x] **Both modes:** every screen specified in light and dark; the two modes differ only by token values, never layout; the login brand panel is constant deep in both.
- [x] **States everywhere:** every screen defines populated, empty (per the §1.11 formula or a stated structural exception), loading (skeletons ≤3 rows), and error (the §3.4 error band with Retry) — no spinner-only or blank panels.
- [x] **Banned patterns absent:** no purple-blue or any gradient (scrim and Lightfall excepted), no icon-in-box grids, no floating shapes/blur orbs, no glassmorphism, no neon glow, no pie/donut charts, no sparkline tables, no carousels, no fake-AI sparkles, no emoji, no centered long text.
- [x] **Copy rules:** no "not yet implemented", "coming soon", "Not loaded", "Not measured" anywhere; error copy states what failed and what to do; en-US dates/times and currency formatting per §1.13.
- [x] **Data honesty:** every rendered value maps to a real schema field or a stated computable derivation; safe readouts never expose private webhook URLs or secrets; counts shown in summary surfaces equal their target screens' counts.
- [x] **Accessibility baseline:** focus-visible rings (ring token, 60% opacity per shipped pattern) on every interactive element; icon-only buttons carry aria-labels; form errors use aria-invalid + described messages; pending states set aria-busy; the radiogroup/tab/segment semantics match the shipped patterns; color is never the only signal (dots pair with chips/text).
- [x] **Motion:** only the §1.10 animation set; reduced-motion honored; every press acknowledged within 100ms; destructive actions confirm first.
- [x] **Shell consistency:** screens 2–4 use the admin shell, 5–11 the client shell (§1.8); mobile tab bars expose Roster/Analytics/Settings and Home/Contacts/Queue/Settings; "View as client" renders the client shell with its exit banner.

## 14. Implementation deltas (against the current screens)

Concrete changes this spec makes to shipped surfaces — design-only statements of what changes when implementation begins:

1. **Login (`app/login/page.tsx`, `components/login/*`):** keep the two-column split, radiogroup workspace selector, show/hide password, and pending state exactly; replace the disabled "Recovery — not yet implemented" affordance with the "Forgot password?" link + reset modal (§2.6); replace the "Custom session duration — not yet implemented" checkbox row with nothing (it is removed — session lifetime stays a Supabase concern stated once in the footer note); redesign the platform-status readout's "Not loaded"/"Not measured" rows into the §2.5 three-state public aggregate with its designed unavailable line; add the H1 brand statement to the brand panel.
2. **Platform status (`lib/platform-status.ts`):** the not_implemented contract stays honest — the readout renders the §2.5 unavailable state until a public aggregate exists; no sample rows are ever substituted (per its own comment contract).
3. **Admin (`app/admin/page.tsx`):** the placeholder PLANNED_PANELS section ("Not yet implemented") is replaced by the §3 roster screen; the existing real clients read, its empty string ("No clients provisioned yet."), and its error copy ("could not be loaded. Retry shortly.") carry forward into the designed states.
4. **Client dashboard (`app/dashboard/page.tsx`):** the placeholder PLANNED_PANELS section is replaced by the §6 dashboard; the verified evidence-review panel's copy and behavior ("{n} pending suggestion{s}." / "Nothing to review right now." / "Review now →") is retained verbatim in the hero panel; the per-system cards are gated by visible_to_client + active.
5. **Evidence review (`app/dashboard/facts/page.tsx`, `components/crm/fact-review-list.tsx`):** retained as the core of Screen 6's review panel (§7.3) — band-chip styling, "Observed by" meta line, ledger-score-when-present, Approve/Dismiss actions, and inline done/error states stay byte-identical; the page gains the shell, filter chips (band/status), the designed queue-clear state (§7.5), and the contact-list/timeline companion surface at `/dashboard/contacts`.
6. **New routes to design-existence (no code yet):** `/admin/clients/[id]` (§4), `/admin/analytics` (§5), `/dashboard/contacts` (§7), `/dashboard/integrations` (§8), `/dashboard/billing` (§9), `/dashboard/onboarding` (§10), `/dashboard/queue` (§11), `/settings` with both variants (§12).
7. **Global:** the shells (§1.8), toasts/modals/forms (§1.9), motion rules (§1.10), and empty-state formula (§1.11) are net-new shared patterns; the token sheet in `app/globals.css` is already the source of truth and requires no changes — this spec consumes it as-is.

## 15. Traceability — every screen's real data sources

| Screen | Section | Route | Primary schema tables / verified sources |
|---|---|---|---|
| 1 · Login / role-entry | §2 | `/login` | Supabase Auth session (sign-in states); platform-status public contract (`lib/platform-status.ts`) |
| 2 · Admin client roster | §3 | `/admin` | clients (business_name, vertical, status, updated_at); client_systems counts; client_integrations worst status; contact_facts pending count; agent task failures |
| 3 · Admin single-client detail | §4 | `/admin/clients/[id]` | clients; client_systems (system_type, provenance, active, visible_to_client, setup_fee_cents, monthly_retainer_cents, config); client_integrations; invoices; contacts; bookings; deals; crm_activities; contact_facts (all statuses, 3 bands); agent queue summary |
| 4 · Cross-client analytics | §5 | `/admin/analytics` | attribution_events (event_type, revenue_cents, ad_platform, occurred_at); bookings; contact_facts pending; agent queue outcomes; clients |
| 5 · Client dashboard | §6 | `/dashboard` | clients; client_systems (visible_to_client + active gate); client_integrations status; contact_facts pending count (shipped hero); contacts; bookings; crm_activities; deals; invoices overdue |
| 6 · Contact timeline + fact review | §7 | `/dashboard/contacts`, `/dashboard/facts` | contacts (full_name, company_name, phone, email, lead_status, do_not_contact); crm_activities (7 types); bookings (5 statuses); attribution_events (5 types, revenue_cents); contact_facts (3 bands × 4 statuses, source_tool, score, observed_at) + verified reviewFact action (apply/dismiss RPCs) |
| 7 · Integration health | §8 | `/dashboard/integrations` | client_integrations safe readout (system_type, status, last_ping_at, created_at) |
| 8 · Billing & plan | §9 | `/dashboard/billing` | client_systems (visible_to_client gate, monthly_retainer_cents, setup_fee_cents); invoices (amount_cents, due_date, status, contact_id, created_at) |
| 9 · Onboarding checklist | §10 | `/dashboard/onboarding` | clients (whatsapp_number, vertical, timezone, dialect); client_systems; client_integrations; contacts; bookings; attribution_events; contact_facts (applied/dismissed); invoices |
| 10 · Attention queue | §11 | `/dashboard/queue` | contact_facts pending; client_integrations degraded/disconnected; invoices overdue; bookings no_show (≤14 days) |
| 11 · Settings (admin + client) | §12 | `/settings` | Session claims (email, role); profiles (full_name); clients (business_name, vertical, timezone, whatsapp_number, status); agent queue last-run summary; theme preference |

**Component vocabulary retained from the shipped codebase:** HelixMark, BrandPanel, LoginForm (radiogroup selector, show/hide password, pending state, auth banner with portal switch), PlatformStatusReadout, FactReviewList (band chips, Approve/Dismiss, inline done/error states), Button/Input/Label primitives. All Lucide icon names used in this spec (AlertCircle, Eye, EyeOff, Loader2, Check, X, Building2, FolderOpen, BarChart3, CircleSlash, Users, CheckCircle2, PlugZap, Receipt, FileSearch, PhoneMissed, Phone, Mail, Calendar, StickyNote, Sun, Moon, ChevronRight, Search) are line icons in the shipped dependency set.

— End of specification. 11 screens, both breakpoints, both modes, all states, all checklists checked.


























