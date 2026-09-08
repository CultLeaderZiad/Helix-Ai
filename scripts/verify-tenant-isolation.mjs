import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { randomUUID } from 'node:crypto'
import { createClient } from '@supabase/supabase-js'

const expectedHost = 'vxiabktipenckdzencpu.supabase.co'
if (!process.argv.includes('--confirm-development')) {
  throw new Error('Requires --confirm-development; creates and removes isolated development test records.')
}
const env = parseEnv(readFileSync('.env', 'utf8'))
const url = new URL(env.SUPABASE_URL)
if (url.hostname !== expectedHost || url.protocol !== 'https:') throw new Error('Target mismatch')
if (!env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing keys')

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
const service = createClient(url.origin, env.SUPABASE_SERVICE_ROLE_KEY, options)
const run = randomUUID()
const testEmails = Object.fromEntries(['a', 'b', 'admin'].map(label => [
  label, (process.env[`SUPABASE_TEST_EMAIL_${label.toUpperCase()}`] ??
    env[`SUPABASE_TEST_EMAIL_${label.toUpperCase()}`])?.trim().toLowerCase(),
]))
if (Object.values(testEmails).some(email => !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
  throw new Error('Configure all three SUPABASE_TEST_EMAIL entries in .env; values are not logged.')
}
if (new Set(Object.values(testEmails)).size !== 3) throw new Error('Test email addresses must be distinct')
const clientIds = [randomUUID(), randomUUID()]
const users = []
const results = []
const contactIds = [randomUUID(), randomUUID()]
let clientsCreated = false

function record(name, passed, detail) {
  results.push({ test: name, result: passed ? 'PASS' : 'FAIL', detail })
  console.log(JSON.stringify(results.at(-1)))
}
function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.code ?? result.error.status ?? 'request_failed'}`)
  return result.data
}
function claims(token) {
  // Decoding is only for test inspection. Password sign-in issues the token;
  // Auth getUser below independently validates it. This is not application auth.
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()).app_metadata
}
async function rest(token, table, query, method = 'GET', body) {
  const response = await fetch(`${url.origin}/rest/v1/${table}?${query}`, {
    method,
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })
  const data = await response.json()
  return { status: response.status, data, ok: response.ok }
}
async function assertTestAccountsUnused() {
  for (let page = 1; ; page++) {
    const data = must(await service.auth.admin.listUsers({ page, perPage: 100 }), 'check existing test accounts')
    if (data.users.some(user => Object.values(testEmails).includes(user.email?.toLowerCase()))) {
      throw new Error('A configured test email already exists in Auth; no test accounts will be modified.')
    }
    if (data.users.length < 100) break
  }
}
async function makeUser(label, role, clientId) {
  const auth = createClient(url.origin, env.SUPABASE_ANON_KEY, options)
  const email = testEmails[label]
  const password = `Hx!${randomUUID()}`
  const signup = await service.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { verification_run: run },
  })
  if (signup.error) {
    const message = signup.error.message.replaceAll(email, '[test email]')
    throw new Error(`createUser ${label}: ${signup.error.code}; ${message}`)
  }
  const created = must(signup, `createUser ${label}`)
  if (!created.user) throw new Error(`createUser ${label}: no Auth user`)
  const owned = must(await service.auth.admin.getUserById(created.user.id), `verify test ownership ${label}`)
  if (owned.user.email?.toLowerCase() !== email || owned.user.user_metadata?.verification_run !== run) {
    throw new Error(`createUser ${label}: account ownership not established; account left untouched`)
  }
  users.push(created.user.id)
  must(await service.auth.admin.updateUserById(created.user.id, {
    email_confirm: true,
    app_metadata: { role, client_id: clientId },
  }), `provision claims ${label}`)
  must(await service.from('profiles').upsert({
    id: created.user.id, role, client_id: clientId, full_name: `RLS verification ${label}`, email,
  }), `profile ${label}`)
  const login = must(await auth.auth.signInWithPassword({ email, password }), `signIn ${label}`)
  const token = login.session.access_token
  const validated = must(await auth.auth.getUser(token), `validate user ${label}`)
  const metadata = claims(token)
  // Auth may store client_id as JSON null or omit the key entirely; both are
  // "no tenant" to parseTenantClaims (== null) and is_agency_admin (->> is null).
  const claimMatches = clientId == null
    ? metadata.client_id == null
    : metadata.client_id === clientId
  record(`Real Auth admin provisioning/password signin and claims ${label}`,
    validated.user.id === created.user.id && metadata.role === role && claimMatches,
    `role=${metadata.role}; tenant claim matches=${claimMatches}; client_id=${metadata.client_id ?? 'absent/null'}`)
  return { auth, token, id: created.user.id }
}

console.log(`Development target: ${url.origin}; verification run: ${run}`)
try {
  await assertTestAccountsUnused()
  record('Test emails unused in Auth', true, 'Checked before creating seed data; addresses not logged')
  must(await service.from('clients').insert(clientIds.map((id, i) => ({
    id, business_name: `RLS verification ${run} ${i === 0 ? 'A' : 'B'}`,
  }))), 'seed clients')
  clientsCreated = true
  for (let i = 0; i < 2; i++) {
    const client_id = clientIds[i]
    must(await service.from('contacts').insert({
      id: contactIds[i], client_id, full_name: `Verification contact ${i}`, custom_fields: {},
    }), 'seed contact')
    must(await service.from('bookings').insert({
      client_id, contact_id: contactIds[i], scheduled_at: '2030-01-01T10:00:00Z',
    }), 'seed booking')
    must(await service.from('invoices').insert({
      client_id, contact_id: contactIds[i], amount_cents: 100, due_date: '2030-01-01',
    }), 'seed invoice')
    must(await service.from('client_systems').insert({
      client_id, system_type: 'missed_call_response', config: {},
    }), 'seed system')
    must(await service.from('client_integrations').insert({
      client_id, system_type: 'missed_call_response', status: 'unknown',
    }), 'seed integration')
    must(await service.from('billing_accounts').insert({ client_id }), 'seed billing')
  }

  const a = await makeUser('a', 'client_user', clientIds[0])
  const b = await makeUser('b', 'client_user', clientIds[1])
  const admin = await makeUser('admin', 'agency_admin', null)

  for (const table of ['contacts', 'invoices', 'bookings']) {
    for (const [label, user, own, other] of [
      ['A', a, clientIds[0], clientIds[1]], ['B', b, clientIds[1], clientIds[0]],
    ]) {
      const ownResult = await rest(user.token, table, `select=id&client_id=eq.${own}`)
      record(`${label} own ${table} positive control`,
        ownResult.status === 200 && ownResult.data.length === 1,
        `HTTP ${ownResult.status}; rows=${ownResult.data.length ?? 'error'}`)
      const otherResult = await rest(user.token, table, `select=id&client_id=eq.${other}`)
      record(`${label} cross-tenant ${table} empty without error`,
        otherResult.status === 200 && Array.isArray(otherResult.data) && otherResult.data.length === 0,
        `HTTP ${otherResult.status}; rows=${otherResult.data.length ?? 'error'}`)
    }
    const read = await rest(admin.token, table, `select=id&client_id=in.(${clientIds.join(',')})`)
    record(`Admin reads both tenants ${table}`, read.status === 200 && read.data.length === 2,
      `HTTP ${read.status}; rows=${read.data.length ?? 'error'}`)
  }

  for (const [table, body, projection] of [
    ['contacts', { lead_status: 'warm' }, 'id,lead_status'],
    ['invoices', { amount_cents: 200 }, 'id,amount_cents'],
    ['bookings', { status: 'confirmed' }, 'id,status'],
    ['client_systems', { visible_to_client: false }, 'id,visible_to_client'],
    ['client_integrations', { status: 'degraded' }, 'id,status'],
    ['billing_accounts', { monthly_retainer_cents: 250 }, 'id,monthly_retainer_cents'],
  ]) {
    for (let i = 0; i < 2; i++) {
      const changed = await rest(admin.token, table,
        `client_id=eq.${clientIds[i]}&select=${projection}`, 'PATCH', body)
      const field = Object.keys(body)[0]
      record(`Admin writes tenant ${i === 0 ? 'A' : 'B'} ${table}`,
        changed.ok && changed.data.length === 1 && changed.data[0][field] === body[field],
        `HTTP ${changed.status}; rows=${changed.data.length ?? 'error'}; code=${changed.data.code ?? 'none'}`)
    }
  }

  // Role writes and secret/config columns are service-role only by design.
  // An agency admin PATCH on profiles must fail the self-only update policy;
  // restricted columns must fail column-level SELECT grants. Both deny.
  const profile = await rest(admin.token, 'profiles', `id=eq.${a.id}&select=id,role`,
    'PATCH', { role: 'client_staff' })
  record('Admin denied profile-role write (service-role reserved)',
    profile.status === 403,
    `HTTP ${profile.status}; code=${profile.data.code ?? 'none'}; role/client_id provisioning requires service role`)
  for (const [table, field] of [['client_integrations', 'n8n_webhook_url'], ['client_systems', 'config']]) {
    const read = await rest(admin.token, table, `select=id,${field}&client_id=eq.${clientIds[0]}`)
    record(`Admin denied restricted-field read ${table}.${field} (service-role reserved)`,
      read.status === 403 && !Array.isArray(read.data),
      `HTTP ${read.status}; code=${read.data.code ?? 'none'}; column excluded from authenticated SELECT grants`)
  }

  for (const [table, body, projection] of [
    ['client_systems', { visible_to_client: true }, 'id,visible_to_client'],
    ['client_integrations', { status: 'connected' }, 'id,status'],
    ['billing_accounts', { monthly_retainer_cents: 0 }, 'id,monthly_retainer_cents'],
  ]) {
    const changed = await rest(a.token, table, `client_id=eq.${clientIds[0]}&select=${projection}`, 'PATCH', body)
    record(`Client cannot change ${table}`, changed.status === 200 && changed.data.length === 0,
      `HTTP ${changed.status}; rows=${changed.data.length ?? 'error'}`)
  }
  const escalate = await rest(a.token, 'profiles', `id=eq.${a.id}&select=id`, 'PATCH', {
    role: 'agency_admin', client_id: null,
  })
  record('Client cannot edit own authorization profile', escalate.status === 403,
    `HTTP ${escalate.status}; code=${escalate.data.code ?? 'none'}`)

  const invalid = await rest(admin.token, 'bookings', 'select=id', 'POST', {
    client_id: clientIds[0], contact_id: contactIds[1], scheduled_at: '2030-01-02T10:00:00Z',
  })
  record('Cross-tenant composite FK rejection',
    invalid.status === 409 && invalid.data.code === '23503' &&
      String(invalid.data.message).includes('bookings_tenant_contact_fk'),
    `HTTP ${invalid.status}; code=${invalid.data.code ?? 'none'}; expected constraint=${String(invalid.data.message).includes('bookings_tenant_contact_fk')}`)

  must(await service.from('profiles').update({ role: 'client_staff', client_id: clientIds[1] })
    .eq('id', a.id), 'change descriptive profile')
  const before = claims(a.token)
  const refreshed = must(await a.auth.auth.refreshSession(), 'refresh after profile change')
  const after = claims(refreshed.session.access_token)
  record('Profile-only edit does not change claims, even on refresh',
    before.role === 'client_user' && after.role === 'client_user' &&
      before.client_id === clientIds[0] && after.client_id === clientIds[0],
    'Profile is descriptive; Auth app_metadata is the authorization source')
  const oldToken = refreshed.session.access_token
  must(await service.auth.admin.updateUserById(a.id, {
    app_metadata: { role: 'client_staff', client_id: clientIds[1] },
  }), 'change authoritative Auth metadata')
  for (const id of clientIds) {
    const stale = await rest(oldToken, 'contacts', `select=id&client_id=eq.${id}`)
    record(`Stale JWT denied for tenant ${id === clientIds[0] ? 'A' : 'B'}`,
      stale.status === 200 && stale.data.length === 0,
      `HTTP ${stale.status}; rows=${stale.data.length ?? 'error'}`)
  }
  const next = must(await a.auth.auth.refreshSession(), 'refresh after Auth change')
  const updated = claims(next.session.access_token)
  record('New token reflects authoritative Auth reassignment',
    updated.role === 'client_staff' && updated.client_id === clientIds[1],
    `role=${updated.role}; tenant B matches=${updated.client_id === clientIds[1]}`)
  for (let i = 0; i < 2; i++) {
    const read = await rest(next.session.access_token, 'contacts', `select=id&client_id=eq.${clientIds[i]}`)
    record(`Refreshed token tenant ${i === 0 ? 'A denied' : 'B allowed'}`,
      read.status === 200 && read.data.length === i,
      `HTTP ${read.status}; rows=${read.data.length ?? 'error'}`)
  }
} catch (error) {
  record('Verification setup/execution', false, error.message)
} finally {
  // Only preallocated tenant IDs and Auth IDs returned by this run are touched.
  // Child-first cleanup avoids assumptions about pre-existing delete actions.
  if (clientsCreated) {
    for (const table of ['bookings', 'invoices', 'client_systems', 'client_integrations', 'billing_accounts', 'contacts']) {
      const removed = await service.from(table).delete().in('client_id', clientIds)
      record(`Cleanup ${table}`, !removed.error, removed.error?.code ?? 'deleted run-owned rows')
    }
  }
  for (const id of users) {
    const removed = await service.from('profiles').delete().eq('id', id)
    record('Cleanup test profile', !removed.error, removed.error?.code ?? 'removed')
    const deleted = await service.auth.admin.deleteUser(id)
    record('Cleanup test Auth user', !deleted.error, deleted.error?.code ?? 'removed')
  }
  if (clientsCreated) {
    const removed = await service.from('clients').delete().in('id', clientIds)
    record('Cleanup seed clients', !removed.error, removed.error?.code ?? 'removed')
    const check = await service.from('clients').select('id').in('id', clientIds)
    record('Verify seed clients absent', !check.error && check.data.length === 0,
      check.error?.code ?? `remaining=${check.data.length}`)
  }
}
console.log(JSON.stringify({
  run, target: url.hostname,
  passed: results.filter(r => r.result === 'PASS').length,
  failed: results.filter(r => r.result === 'FAIL').length,
  productionEligible: false,
  note: 'No SQL executed by this script. Full policy catalog and delete-action review remain separate checks.',
}))
if (results.some(r => r.result === 'FAIL')) process.exitCode = 1