# Helix design spec — v5 Quiet Authority

This replaces the Night Signal / Warm Command spec. The full page-by-page blueprint, copy, and acceptance checklist live in [`docs/design/v5/BLUEPRINT.md`](design/v5/BLUEPRINT.md). HTML/CSS mockups and PNG renders are in [`docs/design/v5/mockups/`](design/v5/mockups/).

## Positioning

Helix is a done-for-you service for clinic, real-estate and service businesses in the GCC and MENA. The site shows the reply, the booking and the calendar. It does not show a terminal, a pipeline, or invented proof.

## Type

- English headlines: Instrument Serif
- UI: Geist
- Arabic: IBM Plex Sans Arabic (never monospace)
- Numbers: Geist tabular figures, wrapped in `<bdi>` when mixed with Arabic

## Colour

Ink `#0A0B0D` and ivory `#F7F5F0`. One green accent, only for outcomes and links (`#5FD4A4` on dark, `#0E6E4F` on light). Primary buttons are neutral: ivory on dark, ink on light.

Dark is the marketing default. Pricing, auth forms and the client dashboard are light. The footer theme control stores `helix_theme`.

## Marketing

The home hero is a phone with an Arabic WhatsApp conversation plus two floating cards, labelled as an illustrative example. The primary action is **Book a discovery call**, linking to `/contact`. There is no public WhatsApp number and no response-time promise. There is no free-trial or “no credit card” claim.

Home and `/pricing` show AED monthly plans from `lib/pricing/tiers.ts`. Studio and `/systems/[slug]` show USD per-system prices from `lib/studio/templates.ts`.

## Auth

Sign-in does not ask the visitor to pick Agency or Client. After `signInWithPassword`, the existing action sends `agency_admin` to `/admin` and everyone else to `/dashboard`. “Agency sign-in” links to `/login?portal=agency`.

## Dashboard

Real workspaces render real Supabase counts or an empty state. Example numbers appear only on `/dev/design/overview`, behind an “example data” banner.

## Banned phrases

`node scripts/check-banned-phrases.mjs` fails the build check when marketing and product copy still contain the strings listed in blueprint §8.4. The GitHub workflow is `.github/workflows/banned-phrases.yml`.
