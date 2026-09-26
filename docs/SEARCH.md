# Helix AI — Search & Places Architecture (v2)

This document specifies the Search / Places provider chain, caps, authentication contracts, and MCP integration implemented in Helix AI.

## 1. Provider Ecosystem & Caps

| Provider | Endpoint | Free Tier / Cap | Default Env Config | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **TinyFish Search** | `api.search.tinyfish.ai` | Free (30 req/min) | `TINYFISH_API_KEY` | Fast general web & directory search |
| **TinyFish Fetch** | `api.fetch.tinyfish.ai` | Free (1,000 URLs/day) | `TINYFISH_API_KEY` | Markdown/HTML extraction with link crawling |
| **TinyFish Agent** | `agent.tinyfish.ai/v1` | $0.016 / step | `TINYFISH_AGENT_ENABLED=false` | Always runs async via `/v1/automation/run-async` |
| **Google Places (New)** | `places.googleapis.com` | Enterprise 1,000 req/mo, Pro 5,000 req/mo | `GOOGLE_PLACES_API_KEY` | Primary maps provider. Store only `place_id` long-term |
| **Foursquare Places** | `places-api.foursquare.com` | 500 Pro calls / mo | `FOURSQUARE_API_KEY` | Fallback 2. Requires "Powered by Foursquare" attribution |
| **OSM Overpass** | `overpass-api.de` | Fair-use (~10k/day) | `OSM_ENABLED=true` | Fallback 3. ODbL attribution. Weak MENA phone/site |
| **Bright Data SERP** | `api.brightdata.com` | $1.50 / 1K | `BRIGHTDATA_SERP_ZONE` | Opt-in Maps UI scraper fallback |
| **Hunter.io** | `api.hunter.io/v2` | 50 credits / mo | `HUNTER_API_KEY` | Domain search for executive & management contacts |

---

## 2. Google Places API (New) & 30-Day Purge Policy

Under Google Maps Platform terms:
1. Long-term storage of business details (such as phone numbers or addresses) is prohibited without refreshing.
2. `place_id` can be stored indefinitely.
3. Helix AI automatically purges cached phone numbers and Places-derived contact fields older than 30 days via `/api/cron/search-watches`.
4. If your Google Cloud account is in its 90-day Free Trial ($300 credit), set `GOOGLE_BILLING_MODE=trial` and `GOOGLE_TRIAL_ENDS=YYYY-MM-DD`. The operator console will display a proactive notice before trial expiry.

---

## 3. Fallback Order & Deduplication

Places queries execute according to `PLACES_PROVIDER_ORDER` (default `google_places,foursquare,osm_overpass,brightdata_serp`):
1. Unavailable or unconfigured providers are skipped with clear logs in `search_events`.
2. Accumulation stops once `limit` is fulfilled.
3. Hits are deduplicated by registrable domain (`domain`) or normalized `name + city`.
4. TinyFish Search runs in parallel to surface web and social profile results.

---

## 4. MCP Server Route (`/api/mcp`)

The `/api/mcp` endpoint complies with Model Context Protocol standards:
- Transports: Streamable HTTP (2026-07-28) and JSON-RPC 2.0 (2025-06-18).
- Header: `Authorization: Bearer hx_live_<token>`.
- Token Verification: Key peppered sha256 lookup in `helix_api_keys`.

### Available Tools:
1. `search_web`: Ranked search across web and maps.
2. `find_leads`: Natural-language search discovering companies and initiating enrichment.
3. `enrich_url`: Deep contact and description extraction for a domain or URL.
4. `get_watch_results`: Retrieves saved watch results.
