# HELIX AI — Design Specification (v4)

- **Version:** 4.0
- **Date:** 2026-09-26
- **Status:** Implemented visual system. Behavior, auth, and data contracts are unchanged from the shipped app.
- **Source of truth for pixels:** `docs/design/overhaul/html/` and `docs/design/overhaul/screens/`. When this document and those files disagree on a color, size, or layout, the HTML and screenshots win.

## 1. Two surfaces

### Marketing — Night Signal (default) and Daylight Paper

Public routes (`/`, `/pricing`, `/studio`, `/about`, `/updates`, `/faq`, `/contact`, `/team`, `/privacy`, `/terms`) use Night Signal. Daylight Paper is an optional theme stored in the `helix_theme` cookie (`night` | `day`). Language is the `helix_lang` cookie (`en` | `ar`). Both are applied on the server and by a no-flash script so `<html lang dir data-theme>` does not flash.

Night tokens (from `mk-dark.css`):

| Token | Value |
| --- | --- |
| bg | `#07090C` |
| surface | `#10141A` |
| text | `#F2F4F7` |
| muted | `#9AA3B2` |
| subtle | `#6B7482` |
| accent | `#34E0A1` |
| accent ink | `#04130D` |
| accent 2 | `#38C6E0` |
| warn | `#F5B455` |

Daylight tokens (from `mk-light.css`): canvas `#F7F5F0`, ink `#121212`, accent `#0B6E4F`.

Hero type, dark: 76px / 600 / -0.045em, gradient white to `#A9B2C0`, emerald–cyan emphasis. Arabic: 68px / 700 / tracking 0 / line-height 1.3, IBM Plex Sans Arabic. Mobile (≤980px, target 390): 44px hero.

### Dashboard and admin — Warm Command 2.0

Authenticated shell (`ConsoleShell`) and the design previews use `dash.css` tokens:

| Token | Value |
| --- | --- |
| canvas | `#F4F2ED` |
| surface | `#FFFFFF` |
| line | `#E7E2D9` |
| ink | `#141414` |
| muted | `#6E6A63` |
| accent | `#0B6E4F` |
| sidebar | `#161513` |

Sidebar is 248px. Page title is 28px / 600 / -0.03em. Command palette opens with Cmd/Ctrl+K and only navigates to real routes.

## 2. Type

Geist, Geist Mono, and IBM Plex Sans Arabic. Arabic pages set `dir="rtl"` on `<html>` and use logical properties. Latin product names stay in Geist.

## 3. Motion

Rays, marquees, and shimmer respect `prefers-reduced-motion`. No WebGL on marketing pages. Focus rings use the accent color.

## 4. Honesty

Illustrative numbers in the design references are labeled Sample, Demo script, or Example. Production overview, lead generation, and search read real queries or say what is missing. Search providers that are not in this codebase (maps, Hunter, TinyFish) render as not connected; the sample search screen is explicitly an example. The testimonial slot stays empty until a real named quote exists. Do not invent clients, logos, or live metrics.

## 5. Pricing separation

`/pricing` and the home offer band show GCC monthly plans in AED only, with a link to Studio. `/studio` and the home systems catalog show USD setup + monthly from `lib/studio/templates.ts`, with a link back to AED plans. Currencies are not mixed on one surface.

## 6. Where to look

- Marketing chrome and home: `components/marketing/`
- Tokens: `app/overhaul.css`
- Dashboard shell: `components/shell/console-shell.tsx`
- Sample screens used for visual comparison (development only): `/dev/design/overview`, `/dev/design/leadgen`, `/dev/design/search`, `/dev/design/cmdk`
