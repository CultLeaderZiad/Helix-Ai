/**
 * Inserts one contact and reads it back, then deletes it.
 * Skips cleanly when Supabase env vars are absent.
 *
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/verify-crm-contact-roundtrip.mjs
 *
 * Never prints secrets. Requires a real client id:
 *   CRM_TEST_CLIENT_ID=<uuid of a workspace you can write>
 */
const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
const clientId = (process.env.CRM_TEST_CLIENT_ID || '').trim()

if (!url || !key || !clientId) {
  console.log('SKIP crm contact roundtrip: set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, and CRM_TEST_CLIENT_ID')
  process.exit(0)
}

const marker = `audit-${Date.now()}`
const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  Prefer: 'return=representation',
}

const insert = await fetch(`${url}/rest/v1/contacts`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    client_id: clientId,
    full_name: `Audit ${marker}`,
    email: `${marker}@example.com`,
    lead_status: 'cold',
    source: 'functional_audit',
  }),
})

if (!insert.ok) {
  console.error('FAIL insert', insert.status, await insert.text())
  process.exit(1)
}

const created = await insert.json()
const id = created?.[0]?.id
if (!id) {
  console.error('FAIL insert returned no id')
  process.exit(1)
}

const read = await fetch(`${url}/rest/v1/contacts?id=eq.${id}&select=id,full_name,email,source`, { headers })
const rows = await read.json()
if (!read.ok || rows?.[0]?.email !== `${marker}@example.com`) {
  console.error('FAIL readback', read.status)
  process.exit(1)
}

await fetch(`${url}/rest/v1/contacts?id=eq.${id}`, { method: 'DELETE', headers })
console.log('PASS crm contact roundtrip', id)
