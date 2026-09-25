# Helix AI — Design Research, Component Picks & Mockups

*Research date: 25 Sep 2026 (Cairo). Repo read via GitHub API (`CultLeaderZiad/Helix-Ai@main`), nothing changed or pushed. The mockups are static HTML + CSS, rendered with headless Chrome.*

---

## 0. Summary

**The recommended stack**

| Layer | Pick | Why |
|---|---|---|
| Base components | **shadcn/ui**. The repo's `components.json` already uses `style: "base-nova"` (Base UI) | MIT. You own the code. Official Tailwind v4 + React 19 support. Built-in **RTL mode** since Jan 2026 (`rtl: true` + `shadcn migrate rtl`), and it works with `base-nova`. |
| The one animation engine | **Motion** (`motion/react`, v13.4.4) | MIT. The repo already has `framer-motion@^13.2`, which is the same library under its old name. Using `m` + `LazyMotion` keeps the first load at about 4.6 kb. Every Magic UI and Aceternity component below imports `motion/react`. |
| Standout marketing pieces | **Magic UI** (MIT) first, a few **React Bits** pieces (MIT + Commons Clause), and 2–3 free **Aceternity** components | All three install through the shadcn registry CLI (`@magicui/…`, `@react-bits/…`, `@aceternity/…`), so they land as editable files. |
| Dashboard | shadcn **Sidebar, Command (cmdk), Sonner, Chart (Recharts v3), Data Table, Skeleton, Empty**, plus **NumberFlow** for counters | Fast, calm, accessible, RTL-aware. |

**Marketing: go DARK ("Night Signal", direction M1). Keep LIGHT ("Daylight Paper", M2) as the runner-up.**

Why dark:
1. It's the norm in this category. I measured the hero backgrounds on 25 Sep 2026: Linear `#08090A`, Raycast `#07080A`, Resend `#000`, n8n `#0E0918`. Buyers read "serious AI/automation tool" from it.
2. The motion you want (light rays, border beams, glow CTAs, streaming terminal) only looks premium on dark. On light it looks washed out or cheap.
3. The live home page is already dark (Lightfall streaks + terminal). This is an upgrade, not a rebrand, and it reuses the `ogl` dependency you already have.
4. It separates the two worlds clearly: the marketing site is the stage (dark, bold, glowing) and the app is the workshop (warm, light, calm). That split also lets the no-glow DESIGN-SPEC rules stay in force inside the product.
5. Arabic renders well on dark with IBM Plex Sans Arabic at weight 500 or more (see `marketing_ar_rtl_hero.png`).

When to choose light instead: if most leads are conservative clinics or SMB owners arriving from Meta ads on phones, light feels friendlier and more "trustworthy business". The M2 tokens are complete, so you can A/B test `/` against a light variant later without new components.

**Dashboard: "Warm Command 2.0".** Keep the current D2 palette (warm paper canvas, ink sidebar, emerald accent), made calmer the way Linear's March 2026 refresh did it: a dimmer sidebar, fewer and softer borders, fewer icons. Numbers use Geist with tabular figures. Logs use Geist Mono.

> **Conflict to resolve.** `docs/DESIGN-SPEC.md` (v3) specifies a single **cyan** accent (`#0e8da6` / `#38c6e0`) with Space Grotesk + Inter. But `app/globals.css` ships **Warm Command emerald** (`#0B6E4F`) with Inter only. The live site mixes both. This proposal uses one emerald family everywhere: `#0B6E4F` on light, and the brighter mint `#34E0A1` on dark for contrast. Cyan `#38C6E0` survives only as the glow partner on marketing.

---

## 1. What exists today

- **Stack** (`package.json`): Next 16.3.3, React 19, Tailwind 4.3.3, `framer-motion ^13.2.0`, `ogl ^1.0.11`, `lucide-react`, `class-variance-authority`, `tailwind-merge`. `components.json` = shadcn `base-nova`, RSC, lucide icons.
- **React Bits code is already in the repo**: `components/navigation/pill-nav.tsx` (the name matches React Bits *Pill Nav*) and `components/lightfall*.tsx` + `Lightfall.css`, which match React Bits *Lightfall* (https://reactbits.dev/backgrounds/lightfall), an `ogl` background. I inferred this from the file names.
- **Live site** (screenshots in `current-site/`): `/` is dark with a streak background, a big centred headline, a terminal demo, and generic icon cards. `/studio` is a warm-paper light card grid. `/login` has a dark brand panel. That's three different looks, and the cards read as "admin form". No scroll motion, no product-in-hero, no rhythm between sections.
- **Lead Gen**: `features/leadgen/LeadGenPage.tsx` is a long single form with hard-coded hex colours from DESIGN-SPEC cyan. The planned v2 has two modes, *Enrich a URL* and *Find leads*, plus a Search page (spec in `ANTIGRAVITY_HELIX_AI_SEARCH_PAGE_TINYFISH_LEADGEN_V2.md`). The mockups follow that spec's fields, sources, and "empty stays empty" rule.

## 2. What makes current AI/SaaS sites look premium

**I measured these live hero headlines** (Playwright, 1440×900, 25 Sep 2026). Raw data: `references/measured_hero_type.txt`. Screenshots: `references/reference_sites_sheet.png`.

| Site | Canvas | H1 font / size / weight / tracking |
|---|---|---|
| Linear | `#08090A` dark | Inter Variable 64px / 510 / −1.4px (−2.2%) |
| Vercel | `#FAFAFA` light | Geist 64px / 400 / −3.84px (−6%) |
| Resend | `#000` dark | Domaine (serif) 96px / 400 / −1% |
| Raycast | `#07080A` dark | Inter 64px / 600 |
| Attio | white | Inter Display 64px / 600 / −2% |
| Clay | white | Roobert 88px / 575 / −4% |
| Relevance AI | light | Sora 48px / 400 / −5% |
| Lindy | `#FCF9F8` warm light | Manrope 72px / 700 / −2% |
| Stripe | light | Söhne 48px / 300 |
| Supabase | light | Manrope 46px / 500 |
| n8n | `#0E0918` dark | Geomanist |

**Patterns that make them feel premium:**
1. **Real product UI above the fold** (Linear, Attio, Relevance AI, Lindy) instead of stock 3D. Guides warn that "gradient + floating 3D shape + generic copy" now reads as template-built (aydesign.ai 2026). For Helix that means showing a live WhatsApp run and the console trace, not icons.
2. **One hero object and a lot of dark space** (Raycast's light slats, n8n's bolt, Vercel's prism). Motion lives on one element, not everywhere.
3. **Big, tight, medium-weight type**: 64–96px, tracking −2% to −6%, weight 400–600 (rarely bold), one display family. Body copy is muted grey at 17–19px.
4. **Near-black or warm-white canvases** rather than navy or pure grey. One accent. Gradients only for the glow behind the hero and for highlighted words in headlines.
5. **Calm density in the app**. From Linear's 2026 refresh: the sidebar is "a few notches dimmer", "structure should be felt not seen" (fewer, softer borders), a warmer grey palette, and fewer, smaller icons.
6. **Motion that proves liveness**: small counter animations and explicit timestamps ("updated 14 minutes ago") read as more credible than "real-time" claims (ecrin.digital). Loops should run briefly, then freeze on the final state.
7. **Trust through honesty**: named testimonials instead of logo walls, and product numbers labelled clearly. This matches Helix's honesty rules.

Galleries to browse for more: Godly (https://godly.website), SaaSframe (https://saasframe.io), Land-book (https://land-book.com), Mobbin (https://mobbin.com). I screenshotted Godly and SaaSframe; Land-book and Mobbin are only linked.

## 3. Library check (license, install, compatibility, cost, RTL)

| Library | License | Install | React 19 / Next 16 / TW v4 | Bundle / perf | RTL | Verdict |
|---|---|---|---|---|---|---|
| **shadcn/ui** (https://ui.shadcn.com) | MIT (repo LICENSE.md) | `pnpm dlx shadcn@latest add <x>` (copies source) | Official TW v4 + React 19 page. All components updated, `data-slot` attributes, `tw-animate-css` | Only what you add | **Built in** since Jan 2026: `rtl: true`, `shadcn migrate rtl`, `DirectionProvider`, logical classes, animation classes flip (`slide-in-from-end`). Works with `base-nova` | **Base layer. Yes.** |
| **Motion** (https://motion.dev) | MIT | `pnpm add motion`, import from `motion/react` | v13.4.4, peer React ^18 or ^19 | `motion` component ≈34 kb. `m` + `LazyMotion` ≈4.6 kb first render, `domAnimation` +15 kb, `domMax` +25 kb. `useAnimate` mini 2.3 kb | Direction-neutral. Mirror x values yourself | **Only animation engine. Yes.** Switch repo imports from `framer-motion` to `motion/react`, because registry components depend on `motion` and you'd otherwise ship two copies. Motion+ (paid examples) isn't needed. |
| **Magic UI** (https://magicui.design) | MIT | `npx shadcn@latest add @magicui/<name>` | Registry source uses TW v4 syntax (`gap-(--gap)`) | Marquee, Shine Border, Dot Pattern are pure CSS. Number Ticker, Border Beam, Animated Beam, Blur Fade, Animated List need `motion` | Marquee uses physical `translateX`, so set `dir="ltr"` on the track. **No component checked handles reduced motion** (0 matches) | **Main marketing kit. Yes.** Magic UI Pro is $199 one-time and not needed. |
| **React Bits** (https://reactbits.dev) | **MIT + Commons Clause**: commercial use inside your product is OK; you can't resell or redistribute the components themselves | `npx shadcn@latest add @react-bits/BlurText-TS-TW`, jsrepo, or copy. Comes in JS/TS × CSS/Tailwind variants | TSX + Tailwind variants provided. `bg-gradient-to-*` still compiles in v4 | Depends on the piece: `ogl` (Aurora, Light Rays, Soft Aurora, Threads, Dark Veil, Lightfall; already installed), `motion` (Blur Text, Count Up, Animated List, Shiny Text, Rotating Text), **gsap** (Split Text, Fade Content, Animated Content, Magic Bento, Dot Grid), **three / r3f** (Beams, Floating Lines, Grid Scan, which also pulls **face-api.js**) | Split Text splits into **characters**, which breaks Arabic letter joining. Blur Text `animateBy="words"` is safe. Count Up hard-codes `Intl 'en-US'`. Only Logo Loop, Gradual Blur, Rotating Text, and Split Text handle reduced motion | **Yes for 3–5 hero pieces**, using only `ogl`/`motion`/CSS ones. React Bits Pro is paid and not needed. |
| **Aceternity UI** (https://ui.aceternity.com) | Free components: "free, copy-paste". **I found no explicit open-source license on the site** (one third-party page calls it MIT). Pro uses the Aceternity License (commercial end products OK, no resale) | `npx shadcn@latest add @aceternity/<name>` | Uses `motion`; some v3-era class names | Mostly `motion`. Some use `@tabler/icons-react` or `mini-svg-data-uri` | Default look is heavy blue-violet gradients, so recolor. Only 2 of the components I checked handle reduced motion | **Limited use**: Timeline, Sticky Scroll Reveal, Glowing Effect, Animated Testimonials. |
| **cmdk** (https://cmdk.paco.me) | MIT | via shadcn `command` | v1.1.1, peer React ^19 | small | RTL via shadcn | **Yes** (cmd+K) |
| **Sonner** (https://sonner.emilkowal.ski) | MIT | via shadcn `sonner` | v2.0.8, peer React ^19. shadcn deprecated its old `toast` in favour of Sonner | small | `dir` prop | **Yes** |
| **Vaul** | MIT | – | – | – | – | **Avoid.** The README says it's unmaintained. The shadcn Drawer now uses Base UI. |
| **Tremor** (https://tremor.so) | Apache-2.0; acquired by Vercel (https://vercel.com/blog/vercel-acquires-tremor) | npm `@tremor/react` or "Tremor Raw" copy-paste | `@tremor/react` 3.18.7 peer **React ^18 only** (checked on npm). Tremor Raw: React 18.2+, TW 3.4+ per docs (not checked for v4) | Recharts-based | – | **Skip the npm package.** Use shadcn Chart instead. Borrow Tremor's KPI and chart visual patterns only. |
| **coss.com/ui** (formerly Origin UI) (https://coss.com/ui) | Not verified | copy / registry | – | – | – | Now Cal.com's design system. Good input, select, and table patterns if needed. |
| **NumberFlow** (https://number-flow.barvian.me) | MIT (npm) | `pnpm add @number-flow/react` | peer React ^18 or ^19 | small | Accepts `Intl` format options including locale | **Yes** for KPI counters and price switches. |
| **GSAP** | Free for commercial use since 3.13 (30 Apr 2025), including SplitText, under the Webflow "Standard no-charge" license (excludes tools that compete with Webflow) | – | – | Adds a second engine | – | **Avoid adding it** just for React Bits pieces. Prefer Motion versions. |

## 4. Component picks

All free tier. "Install" = shadcn CLI registry name.

### Marketing site

| # | Surface | Component | Library | URL | License | Notes |
|---|---|---|---|---|---|---|
| 1 | Hero background | **Soft Aurora** (or **Light Rays**) | React Bits | https://reactbits.dev/backgrounds/soft-aurora · https://reactbits.dev/backgrounds/light-rays | MIT+CC | Needs only `ogl` (already a dependency). Recolor to mint `#34E0A1` / cyan `#38C6E0`. Mount after LCP with `next/dynamic` (`ssr:false`). Pause when off-screen or the tab is hidden. Static radial-gradient fallback on mobile and for reduced motion. Alternatively keep and recolor the existing **Lightfall**. |
| 2 | Hero headline reveal | **Blur Text** (`animateBy="words"`) | React Bits | https://reactbits.dev/text-animations/blur-text | MIT+CC | Word-level, so it's safe for Arabic. About 0.7 s total, 60 ms stagger. |
| 3 | "New · Lead Gen v2" pill | **Animated Shiny Text** | Magic UI | https://magicui.design/docs/components/animated-shiny-text | MIT | Sweep every 3 s. Reverse the gradient angle in RTL. |
| 4 | Hero product window edge | **Border Beam** | Magic UI | https://magicui.design/docs/components/border-beam | MIT | One beam, 8 s loop, mint → cyan. |
| 5 | Pipeline line inside the preview | **Animated Beam** | Magic UI | https://magicui.design/docs/components/animated-beam | MIT | Connects the pipeline steps (webhook → WhatsApp → Cal.com). |
| 6 | WhatsApp chat in the preview | **Animated List** | Magic UI | https://magicui.design/docs/components/animated-list | MIT | Bubbles pop in about 1.2 s apart. Stop after the final message (freeze). |
| 7 | Integrations strip | **Logo Loop** (alt: **Marquee**) | React Bits / Magic UI | https://reactbits.dev/animations/logo-loop · https://magicui.design/docs/components/marquee | MIT+CC / MIT | Logo Loop already handles reduced motion and has a `direction` prop. Use text wordmarks plus the label "integrations, not endorsements". |
| 8 | Section reveals | **Blur Fade** | Magic UI | https://magicui.design/docs/components/blur-fade | MIT | `inView`, once, 0.6 s, y 16 → 0, blur 6 px → 0. |
| 9 | Systems catalog | **Bento Grid** + **Spotlight Card** | Magic UI + React Bits | https://magicui.design/docs/components/bento-grid · https://reactbits.dev/components/spotlight-card | MIT / MIT+CC | Spotlight Card has no dependencies (cursor-follow radial). Avoid React Bits *Magic Bento*, which needs gsap. |
| 10 | How it works | **Timeline** (or **Sticky Scroll Reveal**) | Aceternity | https://ui.aceternity.com/components/timeline · https://ui.aceternity.com/components/sticky-scroll-reveal | free | The line draws as you scroll. On mobile it becomes a simple vertical list. |
| 11 | Live demo | **Terminal** + **Typing Animation**, or the existing `components/terminal/live-agent-terminal.tsx` | Magic UI | https://magicui.design/docs/components/terminal · https://magicui.design/docs/components/typing-animation | MIT | Lines stream at 90–140 ms each. Replay button. Label it "Demo script". |
| 12 | "Watch a live run" CTA | **Hero Video Dialog** | Magic UI | https://magicui.design/docs/components/hero-video-dialog | MIT | Only when a real screen recording exists. |
| 13 | Pricing currency switch + price change | shadcn **Toggle Group** + Motion `layoutId` pill + **NumberFlow** | shadcn / Motion / NumberFlow | https://ui.shadcn.com/docs/components/toggle-group · https://number-flow.barvian.me | MIT | AED / SAR / USD values roll. |
| 14 | "Most popular" plan | **Shine Border** | Magic UI | https://magicui.design/docs/components/shine-border | MIT | Only one glowing card. |
| 15 | Testimonials | **Animated Testimonials** | Aceternity | https://ui.aceternity.com/components/animated-testimonials | free | **Hidden until real, named quotes exist.** The mockups show an honest placeholder slot instead. |
| 16 | Final CTA to https://helixx.xo.je/build | **Shimmer Button** (or **Glowing Effect** on the CTA card) | Magic UI / Aceternity | https://magicui.design/docs/components/shimmer-button · https://ui.aceternity.com/components/glowing-effect | MIT / free | One shimmer button per page. |
| 17 | Footer | plain shadcn + existing `helix-footer.tsx` | – | – | – | No motion. Keep it fast. |

### Dashboard / admin

| # | Surface | Component | Library | URL | Notes |
|---|---|---|---|---|---|
| 18 | Shell + sidebar | **Sidebar** (`collapsible="icon"`, `side` flips for RTL) | shadcn | https://ui.shadcn.com/docs/components/sidebar | ⌘B toggles it. Active item gets a 3 px mint rail with a Motion `layoutId` slide. |
| 19 | Page transitions | Motion `AnimatePresence` in `app/dashboard/template.tsx` | Motion | https://motion.dev/docs/react-animate-presence | Fade + 4 px y, 180 ms. No slide-over transitions. |
| 20 | KPI counters | **NumberFlow** (alt: Magic UI **Number Ticker**) + **Chart** area sparkline | NumberFlow / Magic UI / shadcn | https://number-flow.barvian.me · https://magicui.design/docs/components/number-ticker | Count on first view and on realtime change. Use `ar-AE` or `-u-nu-latn` formatting (see §5). |
| 21 | Lead Gen mode switch | shadcn **Tabs** / **Radio Group** cards + `layoutId` highlight | shadcn | https://ui.shadcn.com/docs/components/tabs | *Enrich websites* vs *Find leads*. |
| 22 | Job progress | shadcn **Progress** + custom stepper + live log | shadcn / Motion | https://ui.shadcn.com/docs/components/progress | Progress width tweens 300 ms. The active step pulses at 2 s. Log lines slide in. |
| 23 | Results table | **Data Table** (TanStack Table v9) | shadcn | https://ui.shadcn.com/docs/components/data-table | New rows fade in with a 20 ms stagger (first 12 only). Rows still enriching show skeleton cells. |
| 24 | Search results | shadcn **Card**/**Item**, **Tabs**, **Checkbox** + Motion stagger | shadcn | https://ui.shadcn.com/docs/components/item | "Enriching" cards shimmer. The selection bar springs in. |
| 25 | Admin usage charts | **Chart** (Recharts v3, `accessibilityLayer`) | shadcn | https://ui.shadcn.com/docs/components/chart | Bars grow 400 ms on mount only. Keep charts in LTR order even when the UI is Arabic. |
| 26 | Empty states | **Empty** | shadcn | https://ui.shadcn.com/docs/components/empty | Follow DESIGN-SPEC §1.11. |
| 27 | Loading | **Skeleton** | shadcn | https://ui.shadcn.com/docs/components/skeleton | 1.5 s shimmer, at most 3 rows (spec). Static when reduced motion is on. |
| 28 | Toasts | **Sonner** | shadcn | https://ui.shadcn.com/docs/components/sonner | Bottom-right (bottom-left in RTL), 5 s, dark ink toast. |
| 29 | cmd+K | **Command** (cmdk) in Dialog | shadcn | https://ui.shadcn.com/docs/components/command | Pages, actions, recent jobs. Scale 0.98 → 1, 160 ms. |
| 30 | Mobile nav / filters | **Drawer** (Base UI) | shadcn | https://ui.shadcn.com/docs/components/drawer | Doesn't need vaul any more. |

### Avoid

- **Heavy 3D and WebGL on three.js**: React Bits *Beams, Floating Lines, Grid Scan* (pulls `face-api.js`), *Ballpit, Hyperspeed, Lanyard, Model Viewer*. Aceternity *3D Globe, GitHub Globe*. Magic UI *Globe* unless lazy and below the fold.
- **Cursor gimmicks**: *Splash Cursor, Blob Cursor, Target Cursor, Ghost Cursor, Smooth Cursor, Pointer*. They're useless on touch (most MENA traffic is mobile) and hurt accessibility.
- **Character-splitting text effects on Arabic** (they break letter joining and shaping): React Bits *Split Text, Decrypted Text, Scrambled Text, Shuffle, Glitch Text, Fuzzy Text, ASCII Text, Text Pressure*; Magic UI *Hyper Text, Sparkles Text, Morphing Text*; any typewriter that works per character. Animate by word or line only.
- **Noise and banned patterns**: *Confetti, Cool Mode, Meteors, Sparkles, Vortex, Wavy Background*, and "AI sparkle" icons (DESIGN-SPEC bans these; I swapped a sparkles icon for `scan-search` in the mockups).
- **Scroll-jacking or parallax-heavy sections**: *Container Scroll Animation, Macbook Scroll, Hero Parallax* on mobile. Lenis smooth scroll. Keep native scrolling.
- **Glass panels in the app**: *Fluid Glass, Glass Surface*. They cost performance and reduce contrast.
- **A second animation engine** (gsap, three) just for one effect. The budget is Motion plus `ogl`, both already present.
- **Loops that never stop**: more than one moving background per viewport, or autoplay that never settles.
- `vaul` and the `@tremor/react` npm package.

## 5. Fonts and bilingual rules

**Recommended pair: Geist + Geist Mono (Latin) with IBM Plex Sans Arabic (Arabic).** These are what the mockups use.
- Geist is Vercel's own family (measured on vercel.com), neutral and modern, and on Google Fonts / `next/font`.
- IBM Plex Sans Arabic comes in 7 weights (100–700), has a humanist-grotesk skeleton that sits well next to Geist, reads well at 13–15 px in tables, and still looks solid at 68 px bold. It rendered cleanly in `marketing_ar_rtl_hero.png` and in every chat bubble.

**Alternatives**
- **Readex Pro**: variable, Arabic + Latin, designed for legibility (Material Design blog). Best if you want one family for both scripts.
- **Noto Sans Arabic**: shadcn's RTL guide recommends it and says it pairs with Inter and Geist.
- **Noto Kufi Arabic**: geometric. Good for display only.
- **Cairo / Tajawal**: popular and friendly, but Cairo is wide, which crowds tables, and Tajawal gets thin at small sizes.
- **Rubik**: rounder, more consumer feel.

**Setup**: load both with `next/font/google` (`subsets: ['latin']` and `['arabic']`). Use `--font-sans: var(--font-geist), var(--font-plex-ar), system-ui` for EN, and swap the order under `[dir=rtl]`.

**Arabic typography rules** (applied in the AR mockup)
1. `letter-spacing: 0` on Arabic, always. The negative tracking on Latin headlines breaks Arabic joins.
2. Line-height about 20% taller: display 1.3 (vs 1.02 for EN), body 1.7–1.8.
3. One weight step heavier for display (700 vs 600). Body text 1 px larger.
4. No uppercase or letter-spaced eyebrows (Arabic has no case). Use colour or weight instead.
5. **Numbers**: I tested `Intl.NumberFormat` in Chrome: `ar-AE` → `1,234.5`, while `ar-SA` and `ar-EG` → `١٬٢٣٤٫٥`. For data (tables, prices, KPIs) use Latin digits via `ar-AE` or `ar-SA-u-nu-latn`. Arabic-Indic digits are fine in conversational copy (the chat mock uses `٥:١٥`). React Bits Count Up hard-codes `en-US`, so pass a locale if you use it.
6. Codes, phone numbers, domains, and logs go in `<span dir="ltr">` (`unicode-bidi: isolate`). I checked programmatically that `+971 50 *** 4182` renders in the correct order inside RTL text.

**Motion in RTL**
- Multiply any x offset by a direction sign: `const s = dir === 'rtl' ? -1 : 1; initial={{ x: 12 * s }}`. shadcn RTL already converts `slide-in-from-left` to `slide-in-from-start`.
- **Marquee / Logo Loop**: logos are LTR content, so put `dir="ltr"` on the track and set `reverse` (or `direction="right"`) in Arabic so the drift flows toward the reading start. Without this, Magic UI's physical `translateX` leaves a gap in RTL.
- Flip directional icons (arrow, chevron, send, "next") with `rtl:rotate-180` or `scaleX(-1)`. **Don't** flip play/pause, check, clock, brand marks, or chart time axes.
- Progress bars and beams fill from inline-start (the right side in Arabic). Border-beam and shiny-text gradients reverse their angle.

## 6. Three token systems (drop-in DESIGN-SPEC section)

### M1 · "Night Signal": dark marketing (recommended)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#07090C` | canvas |
| `--bg-2` | `#0B0E13` | alternate bands |
| `--surface` | `#10141A` | cards, panels |
| `--surface-2` | `#161B23` | raised |
| `--line` / `--line-2` | `rgba(255,255,255,.08)` / `.14` | hairlines |
| `--text` | `#F2F4F7` | primary text |
| `--muted` | `#9AA3B2` | body / secondary |
| `--subtle` | `#6B7482` | meta |
| `--accent` | `#34E0A1` (ink `#04130D`) | CTA, links, highlight words |
| `--accent-2` | `#38C6E0` | glow partner only (never a button) |
| `--warn` / `--danger` | `#F5B455` / `#F87171` | status, and the "sample" tag |

**Type (Geist)**: Display 76/1.02/−0.045em/600 (mobile 44) · H2 48/1.08/−0.035em/600 · H3 20/1.3/−0.02em/600 · Lead 19/1.55 · Body 15/1.6 · Small 13 · Mono 12.5 (Geist Mono). Arabic: Display 68/1.3/0/700 in IBM Plex Sans Arabic.
**Radius**: 8 (chips) · 10–12 (buttons) · 14 (panels) · 18 (product window) · 20 (cards) · 24 (CTA band).
**Glow rules** (marketing only): (a) the hero top radial (mint 26% + cyan 16%); (b) the primary CTA's outer glow `0 8px 30px -8px rgba(52,224,161,.55)`; (c) a border beam on the hero window and the popular plan only; (d) the CTA band radial. **At most 2 glowing elements per viewport.** No glow on body text or icons. Gradient text only on the hero highlight words. No purple-blue gradients.
**Shadows**: product window `0 40px 120px -30px rgba(0,0,0,.9)`. Cards rely on borders.

### M2 · "Daylight Paper": light marketing (runner-up)
| Token | Hex | Role |
|---|---|---|
| `--bg` | `#F7F5F0` | warm paper canvas (continues D2) |
| `--surface` | `#FFFFFF` | cards |
| `--surface-2` | `#F1EEE7` | insets |
| `--line` / `--line-2` | `#E6E1D7` / `#D9D3C7` | borders |
| `--text` | `#121212` | ink |
| `--muted` / `--subtle` | `#5F5A52` / `#8C867C` | secondary |
| `--accent` | `#0B6E4F` (on white text) | CTA, links |
| `--accent-bright` | `#12A579` | checks, bars |
| `--accent-soft` | `#E3F3EC` | tints |
| `--ink-band` | `#111214` | one dark demo band per page |

**Type**: Display 72/1.02/−0.045em/600 · H2 50/1.06/−0.04em · the rest as M1. **Radius**: pills (999) for buttons, 20–22 for cards. **Shadows**: `0 1px 2px rgba(20,20,20,.04), 0 12px 32px -12px rgba(20,20,20,.10)`. **Glow**: one soft mint radial (≤ 20%) behind the hero visual plus a masked dot pattern. Nothing else glows.

### D · "Warm Command 2.0": dashboard (light, with a dark variant)
| Token | Light | Dark (derived) | Role |
|---|---|---|---|
| canvas | `#F4F2ED` | `#0F0F0E` | app background |
| surface | `#FFFFFF` | `#171715` | cards, tables |
| surface-2 | `#FAF8F4` | `#1D1D1A` | table headers, insets |
| line / line-2 | `#E7E2D9` / `#D9D3C7` | `rgba(255,255,255,.08)` / `.14` | borders |
| ink | `#141414` | `#EDEBE6` | text |
| muted / subtle | `#6E6A63` / `#9A958C` | `#A39F97` / `#76726B` | secondary |
| accent | `#0B6E4F` | `#34D399` | primary action, active |
| accent-soft | `#E6F3EE` | `rgba(52,211,153,.12)` | selection |
| info | `#0E7490` | `#38C6E0` | running / in progress |
| warn / danger | `#B45309` / `#B42318` | `#F5B455` / `#F87171` | status only |
| sidebar | `#161513` · text `#A39F97` · active `#2A2926` + 3 px `#34E0A1` rail | same | dimmed nav |

**Type**: page title 28/1.15/−0.03em/600 · card title 14.5/600 · body 14/1.5 · small 12.5 · label 11.5 uppercase +0.07em (EN only) · KPI numeral 32/600 Geist tabular · logs Geist Mono 11.5–12.5.
**Radius**: 8 chips · 10 controls · 14 cards · 16 dialogs/toasts. **Elevation**: borders first. Shadows only on popovers, toasts, and dialogs. **No glow** in the app, apart from 3 px focus rings and live-dot pulse rings.

### Motion rules (all three)
| Kind | Duration | Easing | Notes |
|---|---|---|---|
| Hover, press, colour | 120–150 ms | `cubic-bezier(.2,.8,.2,1)` | Press = scale .98 |
| Popover, dropdown, toast enter | 180–220 ms | `[0.16, 1, 0.3, 1]` (expo-out) | Exit 120–150 ms ease-in |
| Dialog / cmd+K | 160–200 ms | expo-out | Scale .98 → 1 + fade; scrim fade 150 ms |
| Dashboard page transition | 180 ms | ease-out | Opacity + 4 px y only |
| List stagger | dashboard 20–30 ms/item (cap 10–12); marketing 60–80 ms | expo-out | – |
| Marketing section reveal | 600–800 ms | expo-out | y 16 → 0, blur 6–8 px → 0, once, viewport margin −10% |
| Counters | 800–1200 ms | ease-out / spring | On first view and data change only |
| Layout pills (tabs, sidebar rail) | spring | stiffness 400, damping 30 | Motion `layoutId` |
| Ambient (hero background, beams) | ≥ 8–12 s cycles | linear | Pause off-screen and in hidden tabs |
| Reduced motion | – | – | `<MotionConfig reducedMotion="user">` + CSS `@media (prefers-reduced-motion: reduce)`: marquee becomes a static row, backgrounds become a static gradient, counters jump to the final value, skeletons stay static |

**Performance budget**: marketing LCP < 2.5 s on 4G, CLS < 0.05, WebGL mounted after LCP only, at most one WebGL canvas per page, JS for motion ≤ 40 kb gzipped on first load.

## 7. The mockups and what animates in each

Files are in this folder; the source HTML is in `html/` (open it in a browser, or re-render with `python3 html/render.py`). Every number is labelled **Sample / Example**. The integrations strip is labelled "integrations, not endorsements". Prices are copied from the live `/pricing` and `/studio` pages with a "confirm before launch" note. The testimonial section is an honest empty slot.

### `marketing_dark_hero.png` (M1, 1440): hero, product window, integrations strip, live demo
| Element | Motion | Component | Timing |
|---|---|---|---|
| Background rays + mint glow | Slow drifting light rays | React Bits Light Rays / Soft Aurora (ogl) | 12 s loop. Static gradient if reduced motion |
| "New" pill | Shine sweep | Magic UI Animated Shiny Text | 3 s |
| Headline | Word blur-in | React Bits Blur Text (words) | 60 ms stagger, 0.7 s |
| Sub, CTAs, micro line | Fade-up | Magic UI Blur Fade | 0.5 s, delays 0.3 / 0.4 / 0.5 s |
| Primary CTA | Hover glow grows, press scale | Motion `whileHover` / `whileTap` | 150 ms |
| Product window | Rises 24 px + border beam orbit | Blur Fade + Magic UI Border Beam | 0.8 s; beam 8 s |
| Pipeline steps | Line draws step to step; active node pulses | Magic UI Animated Beam + Motion | 400 ms per step |
| WhatsApp bubbles | Pop in one at a time, typing dots, then freeze | Magic UI Animated List | 1.2 s apart |
| "This run" 4.2 s | Counts up | NumberFlow | 1 s |
| Intent bar | Width tween | Motion | 600 ms |
| Integrations | Continuous drift, pauses on hover | React Bits Logo Loop | 40 s per loop |
| Live demo terminal | Lines stream, blinking cursor, replay | Magic UI Terminal / existing live terminal | 90–140 ms per line |
| System tabs (01 / 02 / 11) | Active pill slides | Motion `layoutId` | spring 400/30 |

### `marketing_dark_sections.png` (M1): catalog bento, how-it-works, pricing, testimonial slot, CTA
| Element | Motion | Component | Timing |
|---|---|---|---|
| Section headings | Reveal on scroll | Blur Fade | 0.7 s |
| Bento cards | Staggered rise, cursor spotlight | Magic UI Bento Grid + React Bits Spotlight Card | 80 ms stagger; spotlight follows cursor |
| Voice waveform | Bars pulse while in view | CSS keyframes | 1.2 s |
| Lead Gen mini progress | Bar fills 0 → 70% | Motion | 1 s |
| Core / Preview / All tabs | Pill slide, cards re-layout | Motion `layout` | 250 ms |
| How-it-works line | Draws as you scroll, numbers light up | Aceternity Timeline | Scroll-linked |
| Currency switch | Pill slide, prices roll | Toggle Group + NumberFlow | 600 ms |
| Popular plan | Border shine | Magic UI Shine Border | 6 s loop |
| CTA button | Shimmer | Magic UI Shimmer Button | 2.5 s |

### `marketing_light_hero.png` / `marketing_light_sections.png` (M2)
Same components, calmer. No rays: a masked Dot Pattern (https://magicui.design/docs/components/dot-pattern) with a slow mint radial breathing at 10 s. The hero cards stack in (Blur Fade, 120 ms stagger) and float ±4 px (6 s). The Lead Gen card bar fills and rows appear (Animated List). The toast card slides in at 2.4 s. Demo band terminal as M1. How-it-works bars fill as you scroll. Pricing as M1.

### `marketing_ar_rtl_hero.png` (M1 in Arabic)
Mirrored nav and product window (pipeline on the right, stats on the left). Arrows are flipped; the play icon is not. The headline blur-in runs **by word**. The beam and progress fill right-to-left. The logo track stays `dir="ltr"` with `reverse`. Headline in IBM Plex Sans Arabic 700 / 68 px / line-height 1.3 / tracking 0.

### `mobile_hero.png` (390)
No WebGL. A CSS radial glow plus 3 static rays. Headline blur-in (words). Full-width stacked CTAs. The product card shows pipeline chips (they tick in at 300 ms stagger) and 3 chat bubbles (Animated List). Marquee at 30 s per loop, or a static row if reduced motion is on.

### `dashboard_overview.png` (D)
| Element | Motion | Component | Timing |
|---|---|---|---|
| Page | Fade + 4 px on route change | Motion `template.tsx` | 180 ms |
| KPI numerals | Count on first view and on realtime updates | NumberFlow | 900 ms |
| Sparklines / bar chart | Draw or grow on mount only | shadcn Chart (Recharts v3) | 400 ms |
| Live dots | Pulse ring | CSS | 2 s |
| Activity feed | New events slide in at the top, highlighted then fading | Magic UI Animated List / Motion `layout` | 220 ms; highlight fades over 2 s |
| Lead Gen job bars | Width tween on realtime tick | Motion | 300 ms |
| Toast | Slides in bottom-right | Sonner | 200 ms, auto-dismiss 5 s |
| Sidebar active rail | Slides between items | Motion `layoutId` | spring |

### `dashboard_leadgen.png` (D): two modes, job progress, results
| Element | Motion | Component | Timing |
|---|---|---|---|
| Mode cards | Selection ring moves; the form cross-fades between Enrich and Find | Motion `layoutId` + `AnimatePresence mode="wait"` | 200 ms |
| Source chips | Status dot animates when a provider comes online | CSS | 150 ms |
| "Find leads" button | Becomes a spinner, then collapses into the job card | Motion `layout` | 250 ms |
| Job % + bar | NumberFlow percentage, bar tween | NumberFlow + shadcn Progress | 300 ms per tick |
| Stepper | Done steps tick; the active step pulses | Motion | 2 s pulse |
| Live log | New lines slide up; auto-scroll | Motion | 150 ms |
| Table | New rows fade in (20 ms stagger, first 12); enriching rows are skeleton shimmer, replaced in place | shadcn Data Table + Skeleton | 1.5 s shimmer |
| Export / Send to CRM | Sonner toast with result | Sonner | – |

### `dashboard_search.png` (D)
Search box focus ring (150 ms). Tab underline slides (`layoutId`). Provider dots. Result cards stagger in at 30 ms. The *Enriching* card shimmers, then content replaces the skeleton with a 200 ms cross-fade. "Already in your leads" badge. The selection card springs in when the first checkbox is ticked. "Load more" appends with a stagger.

### `dashboard_cmdk.png` (bonus)
shadcn Command palette. Scrim fades in (150 ms), panel scales .98 → 1 (160 ms), the highlighted row slides with arrow keys (Motion `layoutId`, 120 ms).

Reference screenshots: `current-site/` (the live site today) and `references/reference_sites_sheet.png` (12 reference sites).

## 8. Proposed DESIGN-SPEC changes

1. Add **§16 Marketing surfaces (M1 Night Signal / M2 Daylight Paper)**. These *relax* §1.12 **for marketing routes only**: glow, radial and linear gradients (mint/cyan only, never purple-blue), icon tiles in catalog cards, blur behind the sticky nav, and ambient WebGL (one per page).
2. **Rules that stay in force everywhere**: no fake metrics or fake client logos (sample values always labelled), no AI sparkle icons, no carousels for testimonials, no emoji, reduced-motion support, 13 px minimum text.
3. Replace the §1.2 accent (cyan) with the **emerald family**, or formally record cyan as the M1 glow partner only.
4. Replace §1.10 "Interaction & motion" with §6 of this document (the durations and easings above). Expand the "only animated elements" list to cover counters, list stagger, page transitions, and the cmd+K palette.
5. **Fonts**: Geist + Geist Mono + IBM Plex Sans Arabic replace Space Grotesk + Inter. Add the Arabic rules from §5.

## 9. Phased rollout (rough effort for 1 developer using coding agents)

**Option A: marketing first (recommended).** The complaint is about the first impression, and the marketing site drives leads to `/build`.

| Phase | Scope | Effort |
|---|---|---|
| 0 · Foundations | `next/font` (Geist, Geist Mono, IBM Plex Sans Arabic). Tokens for M1 and D in `globals.css` (marketing route group sets `.theme-night`). Switch `framer-motion` to `motion/react`. `MotionConfig` + `LazyMotion`. shadcn `rtl: true` + `migrate rtl` + `DirectionProvider`. Reduced-motion utilities. | 1 day |
| 1 · Marketing home (EN + AR) | Hero (Blur Text, Light Rays or Soft Aurora, Border Beam window, Animated Beam, Animated List), Logo Loop, live demo, bento catalog with Spotlight Card, Timeline, pricing with NumberFlow, CTA. Lighthouse mobile ≥ 90. | 4–6 days |
| 2 · Dashboard shell | shadcn Sidebar, Command palette, Sonner, `template.tsx` transitions, Skeleton/Empty, Overview KPIs + Chart | 3–4 days |
| 3 · Lead Gen v2 + Search | Two-mode card switch, job progress + live log, Data Table with skeleton rows, Search page (tabs, provider status, result cards, selection bar) | 5–7 days |
| 4 · Admin + QA | Usage charts, dark variant of D, RTL QA pass, a11y/keyboard, reduced-motion QA, performance | 2–3 days |
| **Total** | | **≈ 3–4 weeks** |

**Option B: dashboard first.** Choose this if paying clients are already onboarding and the console is what they see daily. Order: 0 → 2 → 3 → 1 → 4, same total effort. The shadcn foundation from Phase 0 serves both.

## 10. Unverified or open items
- **Aceternity free-tier license**: I found no explicit open-source license text on ui.aceternity.com. The site says "free", and a third-party page says MIT. Treat it as free to use inside Helix; don't redistribute.
- **coss.com/ui (Origin UI) license**: not checked.
- **Tremor Raw on Tailwind v4**: not confirmed. The npm package's React peer is ^18 only, which I did confirm.
- **React Bits Commons Clause**: fine for use inside the Helix site and app. It would matter only if Helix ever resold the components as a UI kit or template.
- **Next 16 View Transitions API** as an alternative to Motion page transitions: not evaluated.
- **Existing `pill-nav.tsx` / `lightfall.tsx` come from React Bits**: inferred from names only, not diffed against upstream.
- **Prices in the mockups**: copied from the live site, which currently shows two pricing systems (per-system USD on /studio, AED tiers on /pricing). These need reconciling before launch.

## Sources
- shadcn Tailwind v4 / React 19: https://ui.shadcn.com/docs/tailwind-v4 · RTL: https://ui.shadcn.com/docs/rtl · https://ui.shadcn.com/docs/changelog/2026-01-rtl · https://ui.shadcn.com/docs/rtl/next · Sidebar: https://ui.shadcn.com/docs/components/sidebar · Chart (Recharts v3): https://ui.shadcn.com/docs/components/chart · Command: https://ui.shadcn.com/docs/components/command · Drawer (Base UI): https://ui.shadcn.com/docs/components/drawer · Empty: https://ui.shadcn.com/docs/components/empty · License: https://github.com/shadcn-ui/ui/blob/main/LICENSE.md
- Motion bundle size: https://motion.dev/docs/react-reduce-bundle-size · License: https://github.com/motiondivision/motion/blob/main/LICENSE.md
- Magic UI: https://magicui.design/docs/components · License (MIT): https://github.com/magicuidesign/magicui/blob/main/LICENSE.md · Pro pricing: https://pro.magicui.design · Registry JSON checked, e.g. https://magicui.design/r/marquee.json
- React Bits: https://reactbits.dev · https://github.com/DavidHDev/react-bits · License (MIT + Commons Clause): https://github.com/DavidHDev/react-bits/blob/main/LICENSE.md · Component source checked under `src/ts-tailwind/…`
- Aceternity: https://ui.aceternity.com/components · Pro license: https://ui.aceternity.com/licence · Pricing: https://ui.aceternity.com/pricing · Registry JSON checked, e.g. https://ui.aceternity.com/registry/timeline.json
- cmdk: https://github.com/pacocoursey/cmdk · Sonner: https://github.com/emilkowalski/sonner · Vaul (unmaintained): https://github.com/emilkowalski/vaul · NumberFlow: https://number-flow.barvian.me
- Tremor: https://vercel.com/blog/vercel-acquires-tremor · https://github.com/tremorlabs/tremor · coss.com/ui: https://github.com/origin-space/originui
- GSAP free: https://webflow.com/blog/gsap-becomes-free · https://gsap.com/community/standard-license/
- Linear redesigns: https://linear.app/now/how-we-redesigned-the-linear-ui · https://linear.app/now/behind-the-latest-design-refresh (12 Mar 2026)
- 2026 landing page patterns: https://www.aydesign.ai/blog/modern-saas-landing-page-design-patterns-2026 · https://www.ecrin.digital/newsroom/how-we-design-for-ai-native-b2b-saas-startups · https://vezert.com/blog/creative-web-design-trends-tech-startups
- Fonts: https://fonts.google.com/specimen/IBM+Plex+Sans+Arabic · https://m3.material.io/blog/readex-pro-legibility-arabic-type-design · https://fonts.google.com/specimen/Geist
- Reference sites measured live: linear.app, vercel.com, resend.com, raycast.com, attio.com, clay.com, n8n.io, relevanceai.com, lindy.ai, stripe.com, supabase.com, godly.website, saasframe.io
- Helix repo (read-only): `docs/DESIGN-SPEC.md`, `app/globals.css`, `package.json`, `components.json`, `features/leadgen/LeadGenPage.tsx`. Live site: https://helix-ai-two.vercel.app/
