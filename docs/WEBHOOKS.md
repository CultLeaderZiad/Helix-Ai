# HELIX AI — Control Plane & n8n Webhook Architecture

**Audience:** Agency Engineers, n8n Workflow Authors, Vapi Integration Leads  
**Repository:** `CultLeaderZiad/Helix-Ai`  
**Date:** 2026-10-01  

---

## 1. System Architecture Lock

```
Channels (WhatsApp / Vapi Voice / Ads / Cal.com / Forms)
       │
       ▼
Helix Control Plane (Next.js & Supabase)
  • Webhook Registry (/admin/webhooks)
  • Single Source of Truth (SOR)
  • HMAC Egress Dispatcher
       │
       ▼  [Signed HTTPS Egress]
n8n Orchestration Brain (Workflows, LLM Tools, Retries)
       │
       ▼  [Authenticated Ingress Callbacks]
Helix Ingress API (/api/webhooks/n8n/{event})
       │
       ▼
Agent Queue / Human Handoff / CRM Activity Ledger
```

---

## 2. Webhook Registry

Agency Admins can configure, toggle, and test n8n production webhooks for each client workspace and system type via the Admin Console at:
`/admin/webhooks`

### Data Model (`public.system_webhooks`)

| Field | Type | Description |
|---|---|---|
| `id` | `uuid` | Primary Key |
| `client_id` | `uuid` | Target client workspace |
| `system_type` | `text` | Core system or Add-on identifier |
| `direction` | `text` | `helix_to_n8n` (outbound) or `n8n_to_helix` (inbound) |
| `webhook_url` | `text` | Production n8n HTTPS webhook URL |
| `secret_ciphertext` | `text` | Tenant signing secret. Used only as an HMAC key. Never sent on the wire. |
| `secret_hash` | `text` | Same signing secret when the admin API stored a copy in this column. Not a hash. |
| `enabled` | `boolean` | Master active switch |
| `last_ping_at`| `timestamptz` | Timestamp of last ping or event dispatch |
| `last_status` | `text` | `healthy` \| `degraded` \| `failed` \| `pending` |
| `last_error`  | `text` | Detailed HTTP status or timeout reason |

---

## 3. Outbound Egress (Helix → n8n)

When events occur in Helix (e.g. incoming call, ad click, payment trigger), Helix dispatches an HTTPS POST request to the configured `webhook_url`.

### Canonical Event Envelope

```json
{
  "id": "evt_7f8a9b1c2d3e4f5061728394",
  "type": "call.missed",
  "tenant_id": "00000000-0000-0000-0000-000000000000",
  "system_type": "missed_call_response",
  "occurred_at": "2026-09-19T11:00:00.000Z",
  "idempotency_key": "idemp_a1b2c3d4-e5f6-7890-1234-56789abcdef0",
  "data": {
    "phone": "+971501234567",
    "caller_name": "Fatima Al-Mansoor",
    "duration_seconds": 0,
    "source_campaign": "Google Ads UAE - Dental"
  }
}
```

### Signing secret

Helix picks the first non-empty value:

1. `secret_ciphertext` on the `helix_to_n8n` row
2. `secret_hash` on that same row
3. The `HELIX_WEBHOOK_SECRET` environment variable

If none of those is set, Helix does not send the request. There is no built-in default secret.

### Request headers

Helix sends these headers and no `Authorization` header. The signing secret is not a Bearer token.

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `User-Agent` | `Helix-AI-ControlPlane/1.0` |
| `X-Helix-Timestamp` | Unix time in seconds. Decimal integer, no leading zeros. |
| `X-Helix-Signature` | Lowercase hex HMAC-SHA256 of the exact string below. |
| `X-Helix-Event-Id` | Envelope `id` (`evt_` + 24 hex characters). |
| `X-Helix-Event-Type` | Envelope `type`, for example `call.missed`. |

### Signature string

```
{X-Helix-Timestamp}.{rawBody}
```

`rawBody` is the exact UTF-8 body of the HTTP request, including key order and whitespace. It is not a re-serialized object.

Example. Timestamp `1758300000` and body `{"id":"evt_1"}` produce this HMAC input:

```
1758300000.{"id":"evt_1"}
```

The digest is HMAC-SHA256, encoded as lowercase hex (64 characters).

### Freshness window

Reject the request when `abs(now - X-Helix-Timestamp) > 300` seconds. Five minutes is the maximum clock skew Helix uses on ingress, and n8n must use the same window when verifying egress. A valid signature over an old timestamp is a replay and must be rejected.

### Verify in n8n (Code node)

Put this node directly after the Webhook trigger. The Webhook node has to expose the raw body (`rawBody`, or the binary body). `JSON.stringify($json)` is not the signed body: key order and whitespace will not match.

```javascript
const crypto = require('crypto');

const MAX_AGE_SECONDS = 300;
const secret = $env.HELIX_WEBHOOK_SECRET;
if (!secret) {
  throw new Error('Webhook signing secret is not configured');
}

const timestamp = String($json.headers['x-helix-timestamp'] || '');
const signature = String($json.headers['x-helix-signature'] || '');
const rawBody = String($json.rawBody || '');

if (!/^[0-9]{1,12}$/.test(timestamp) || !/^[0-9a-f]{64}$/.test(signature) || !rawBody) {
  throw new Error('401 Unauthorized');
}

const now = Math.floor(Date.now() / 1000);
if (Math.abs(now - Number(timestamp)) > MAX_AGE_SECONDS) {
  throw new Error('401 Unauthorized: timestamp is outside the 5 minute window');
}

const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
const left = Buffer.from(signature);
const right = Buffer.from(expected);
if (left.length !== right.length || !crypto.timingSafeEqual(left, right)) {
  throw new Error('401 Unauthorized: invalid signature');
}

return $input.item;
```

Use the tenant row's secret here when that row has one. Use `HELIX_WEBHOOK_SECRET` only when the row has no secret. Do not read or expect an `Authorization` header.

---

## 4. Inbound Ingress (n8n → Helix)

n8n posts callbacks to:

`POST https://<helix-domain>/api/webhooks/n8n/{event}`

The signature format is the same string as egress: `{X-Helix-Timestamp}.{rawBody}`, HMAC-SHA256, lowercase hex. The timestamp must be within 300 seconds of Helix's clock. Helix does not accept `Authorization: Bearer <secret>`.

### Ingress headers

| Header | Required | Value |
|---|---|---|
| `Content-Type` | yes | `application/json` |
| `X-Helix-Timestamp` | yes | Unix time in seconds, decimal, no leading zeros. |
| `X-Helix-Signature` | yes | Lowercase hex HMAC-SHA256 of `{timestamp}.{rawBody}`. |
| `X-Helix-Tenant` | yes, unless the JSON body includes `tenant_id` or `client_id` | Client workspace UUID. |
| `X-Helix-System` | when the tenant has more than one inbound system | `system_type` of the `n8n_to_helix` row whose secret signed the body. `system_type` in the JSON body is equivalent. |

### Which secret Helix checks

Helix loads every `n8n_to_helix` row for the tenant. That lookup is a list, not a single-row query, so a second inbound system does not fail the query.

- If `X-Helix-System` or body `system_type` is set, only that system's secret is accepted. A signature from a sibling system is rejected.
- If the system is omitted, a signature that matches any enabled inbound secret for the tenant is accepted.
- If the tenant has inbound rows, Helix does not fall back to `HELIX_WEBHOOK_SECRET` when those rows have no secret, when the named system is missing, or when the query errors.
- `HELIX_WEBHOOK_SECRET` is used only when the request has no tenant id, or the tenant has no inbound rows.
- If no secret is configured, Helix rejects the request.

Comparisons use a constant-time equality check on the signature. A Bearer token is ignored.

### Sign in n8n before the HTTP Request node

The HTTP Request node must send `rawBody` as the body, unchanged.

```javascript
const crypto = require('crypto');

const secret = $env.HELIX_WEBHOOK_SECRET;
if (!secret) {
  throw new Error('Webhook signing secret is not configured');
}

const rawBody = JSON.stringify($json.payload);
const timestamp = Math.floor(Date.now() / 1000).toString();
const signature = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');

return [{
  json: {
    rawBody,
    headers: {
      'Content-Type': 'application/json',
      'X-Helix-Timestamp': timestamp,
      'X-Helix-Signature': signature,
      'X-Helix-Tenant': $json.tenant_id,
      'X-Helix-System': $json.system_type,
    },
  },
}];
```

Supported events:

| Ingress Route | Purpose | Expected Payload Keys |
|---|---|---|
| `/api/webhooks/n8n/contact` | Upsert contact or lead | `phone`, `name`, `status`, `tenant_id` |
| `/api/webhooks/n8n/booking` | Record Cal.com / Vapi appointment | `name`, `scheduled_at`, `cal_booking_id`, `tenant_id` |
| `/api/webhooks/n8n/attribution` | Multi-touch ad attribution | `campaign`, `channel`, `source`, `tenant_id` |
| `/api/webhooks/n8n/fact` | Insert extracted CRM intelligence fact | `fact_key`, `fact_text`, `confidence`, `tenant_id` |
| `/api/webhooks/n8n/attention` | Request human handoff / alert | `reason`, `summary`, `priority`, `tenant_id` |
| `/api/webhooks/n8n/invoice` | Payment settlement receipt | `invoice_id`, `status`, `amount_cents`, `tenant_id` |
| `/api/webhooks/n8n/system.health` | Diagnostic heartbeat / health ping | `status`, `system_type`, `error`, `tenant_id` |

---

## 5. Platform Workflows (P0–P7)

| Code | Name | Role in Architecture |
|---|---|---|
| **P0** | Ingest Normalize | Validates signature, normalizes phone numbers (E.164), injects tenant context |
| **P1** | Compliance Gate | Enforces Gulf quiet hours, DNC lists, and opt-in consent before messaging |
| **P2** | Event Router | Directs normalized envelope to target system flow (1, 2, 4, 11, 13) |
| **P3** | Human Handoff | Pauses AI when negative sentiment or escalation triggers occur |
| **P4** | Vapi Tool Server | Serves sub-500ms dynamic tool calls for the Vapi voice assistant |
| **P5** | Vapi End-of-Call | Ingests call recordings, parses transcripts, and triggers follow-up WhatsApp |
| **P6** | Weekly Executive Digest | Aggregates client stats and sends weekly WhatsApp summary report |
| **P7** | Dead Letter Queue (DLQ) | Catches retry exhausted failures and notifies agency ops |

---

## 6. Official Core Systems (1, 2, 4, 11, 13)

| System ID | Product Name | Channels | Voice (Vapi) Role |
|---|---|---|---|
| `missed_call_response` (1) | Missed-call triage | WhatsApp | Optional consent-gated callback |
| `booking_receptionist` (2) | Booking receptionist | Vapi Voice + WA + Cal.com | Primary bilingual receptionist |
| `lead_reactivation` (4) | Lead reactivation | WhatsApp Marketing | Optional win-back voice agent |
| `lead_attribution` (11) | Lead qualification & attribution | Forms / Ads / WA | Hot-lead outbound qualifier |
| `ar_collections` (13) | AR collections (**B2B Only**) | WhatsApp + Voice | B2B accounts receivable escalation |

> **B2B Safeguard:** System 13 strictly enforces commercial B2B invoicing only. Consumer debt collection is rejected at the schema level.

---

## 7. Open-Source (OSS) Outcome Add-ons

Sell the **business outcome**, never raw GitHub repository names in buyer-facing portals:

| System ID | Product Name | Underlying OSS | Business Outcome | Lane |
|---|---|---|---|---|
| `rival_watch` | **Rival Watch** | [Scrapling](https://github.com/D4Vinci/Scrapling) | Weekly competitor price and inventory shift alerts on WhatsApp | **Add-on** |
| `handbook_bot` | **Handbook Answers** | [Dify](https://github.com/langgenius/dify) | Private staff assistant trained on company SOPs with monthly refresh | **Add-on** |
| `seo_scorecard` | **Visibility Scorecard** | [OpenSEO](https://github.com/every-app/open-seo) | Monthly local visibility audit & top 3 ranking fixes (door-opener) | **Add-on** |
| `deck_factory` | **Deck Factory** | [Presenton](https://github.com/presenton/presenton) | 8-field discovery notes → branded PPTX client proposal deck | **Add-on** |
| `shorts_factory` | **Clip Factory** | [OpenShorts](https://github.com/mutonby/openshorts) | Long-form video to 8-10 captioned vertical short clips | **Preview** |

---

## 8. Vapi Voice Assistant Tool Server (`P4`)

When Vapi runs a voice call, it invokes the tool server URL configured per tenant:
`https://<n8n-domain>/webhook/vapi/:tenantId/:assistantKey`

### Standard Tool Roster:
1. `check_availability(date, time_range)` → Queries Cal.com API via n8n.
2. `create_booking(customer_name, phone, slot)` → Creates Cal.com appointment + dispatches WhatsApp confirmation.
3. `lookup_crm(phone)` → Returns client history, previous visits, and pending balances.
4. `transfer_to_human(reason)` → Triggers live call SIP transfer to agency or on-call staff.
