# HELIX AI — Control Plane & n8n Webhook Architecture

**Audience:** Agency Engineers, n8n Workflow Authors, Vapi Integration Leads  
**Repository:** `CultLeaderZiad/Helix-Ai`  
**Date:** 2026-09-19  

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
| `secret_hash` | `text` | Optional tenant-specific signing secret |
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

### Signature Verification in n8n (Code Node)

Each egress request includes three security headers:
- `X-Helix-Timestamp`: Unix epoch timestamp (seconds)
- `X-Helix-Signature`: HMAC-SHA256 hex digest of `<timestamp>.<raw_json_body>`
- `Authorization`: `Bearer <secret>`

To verify the signature inside an n8n Code Node:

```javascript
const crypto = require('crypto');

const secret = $env.HELIX_WEBHOOK_SECRET;
const timestamp = $headers['x-helix-timestamp'];
const signature = $headers['x-helix-signature'];
const rawBody = $input.item.binary?.data ? $input.item.binary.data : JSON.stringify($json);

const payload = `${timestamp}.${rawBody}`;
const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');

if (signature !== expectedSignature) {
  throw new Error('401 Unauthorized: Invalid Helix signature');
}

return $input.item;
```

---

## 4. Inbound Ingress (n8n → Helix)

n8n nodes post verified callbacks to:  
`POST https://<helix-domain>/api/webhooks/n8n/{event}`

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
