import { readFileSync } from 'node:fs'
import { parseEnv } from 'node:util'
import { randomUUID } from 'node:crypto'
import { setTimeout as sleep } from 'node:timers/promises'
import { createClient } from '@supabase/supabase-js'

/**
 * CRM intelligence layer verification: live assertions for the evidence ledger
 * (contact_facts), the leased work queue (agent_tasks) and the fact-review
 * flow ported from trycompai/crm. Mirrors verify-tenant-isolation.mjs:
 * isolated run-owned records only, same development-host allowlist, child-first
 * cleanup. With --with-cron it additionally spawns `next dev` and exercises
 * the real /api/cron/process-agent-tasks route end to end.
 */

const expectedHost = 'vxiabktipenckdzencpu.supabase.co'
if (!process.argv.includes('--confirm-development')) {
  throw new Error('Requires --confirm-development; creates and removes isolated development test records.')
}
const withCron = process.argv.includes('--with-cron')

const env = parseEnv(readFileSync('.env', 'utf8'))
const url = new URL(env.SUPABASE_URL)
if (url.hostname !== expectedHost || url.protocol !== 'https:') throw new Error('Target mismatch')
if (!env.SUPABASE_ANON_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) throw new Error('Missing keys')

const options = { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
const service = createClient(url.origin, env.SUPABASE_SERVICE_ROLE_KEY, options)

const run = randomUUID()
const results = []
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
let clientsCreated = false
const clientIds = [randomUUID(), randomUUID()]
const emails = [0, 1].map(i => `crmv-${run.slice(0, 8)}-${i}@example.invalid`)
let users = []

function record(name, passed, detail) {
  results.push({ test: name, result: passed ? 'PASS' : 'FAIL', detail })
  console.log(JSON.stringify(results.at(-1)))
}
function must(result, label) {
  if (result.error) throw new Error(`${label}: ${result.error.code ?? result.error.status ?? 'request_failed'}`)
  return result.data
}

function anonClient(token) {
  return {
    async rest(table, query, method = 'GET', body) {
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
    },
  }
}

/** Create a client_user over REST (anon-key + user JWT) to exercise RLS. */
async function makeTenantUser(label, clientId) {
  const email = emails[label === 'a' ? 0 : 1]
  const password = `Hx!${randomUUID()}`
  // createUser resolves to { data: { user }, error } — destructure the nested user.
  const { data: created, error: userError } = await service.auth.admin.createUser({
    email, password, email_confirm: true,
    user_metadata: { crm_run: run },
    app_metadata: { role: 'client_user', client_id: clientId },
  })
  if (userError) throw new Error(`create ${label}: ${userError.message}`)
  const user = created?.user
  if (!user?.id || !UUID.test(user.id)) {
    throw new Error(`create ${label}: Auth user id missing; account left for cleanup`)
  }
  users.push(user.id)

  must(await service.from('profiles').insert({
    id: user.id, client_id: clientId, role: 'client_user',
    full_name: `CRM Verify ${label.toUpperCase()}`, email,
  }), `profile ${label}`)

  const auth = createClient(url.origin, env.SUPABASE_ANON_KEY, options)
  const { data: session, error: signInError } = await auth.auth.signInWithPassword({ email, password })
  if (signInError || !session) throw new Error(`sign in ${label}: ${signInError?.message}`)
  return { id: user.id, token: session.session.access_token, clientId }
}

async function cleanup() {
  // Child-first; only run-owned rows in run-created tenants are touched.
  try {
    if (clientsCreated) {
      for (const table of ['agent_tasks', 'contact_facts', 'activities', 'deal_contacts',
        'deals', 'custom_properties', 'companies', 'contacts', 'profiles']) {
        const removed = await service.from(table).delete().in('client_id', clientIds)
        record(`Cleanup ${table}`, !removed.error, removed.error?.code ?? 'deleted run-owned rows')
      }
      for (const id of users) {
        // Guarded per-user so one bad id can never skip the seed-client removal.
        try {
          const removed = await service.from('profiles').delete().eq('id', id)
          record('Cleanup test profile', !removed.error, removed.error?.code ?? 'removed')
          const deleted = await service.auth.admin.deleteUser(id)
          record('Cleanup test Auth user', !deleted.error, deleted.error?.code ?? 'removed')
        } catch (error) {
          record('Cleanup test user', false, String(error.message ?? error))
        }
      }
      const removed = await service.from('clients').delete().in('id', clientIds)
      record('Cleanup seed clients', !removed.error, removed.error?.code ?? 'removed')
      const check = await service.from('clients').select('id').in('id', clientIds)
      record('Verify seed clients absent', !check.error && check.data.length === 0,
        check.error?.code ?? `remaining=${check.data.length}`)
    }
  } catch (error) {
    record('Cleanup', false, error.message)
  }
}

async function main() {
  // ---- Seed two isolated tenants ----
  must(await service.from('clients').insert(clientIds.map((id, i) => ({
    id, business_name: `CRM Verify ${run.slice(0, 8)} ${i}`,
    status: 'active', vertical: 'verification', timezone: 'UTC',
  }))), 'seed clients')
  clientsCreated = true

  const contacts = []
  for (const id of clientIds) {
    const c = randomUUID()
    must(await service.from('contacts').insert({
      id: c, client_id: id, full_name: 'Seed Contact', source: 'verification',
    }), `seed contact for ${id}`)
    contacts.push(c)
  }

  // ---- RLS: tenant users read only their own tenant ----
  const userA = await makeTenantUser('a', clientIds[0])
  const userB = await makeTenantUser('b', clientIds[1])
  const a = anonClient(userA.token)
  const b = anonClient(userB.token)

  // ---- REST exposure, asserted functionally with the tenant JWT ----
  // The root OpenAPI spec endpoint only accepts the service_role key on this
  // platform and then always serves the full service-role spec, so per-role
  // exposure is proven per table instead: granted tables answer 200, dark
  // tables (agent_tasks, below) answer 403.
  const expectedExposed = ['companies', 'deals', 'activities', 'deal_contacts',
    'custom_properties', 'contact_facts']
  for (const t of expectedExposed) {
    const probe = await a.rest(t, 'limit=1')
    record(`Tenant session can SELECT ${t} over REST`, probe.status === 200,
      `HTTP ${probe.status}`)
  }
  const companyIdProbe = await a.rest('contacts', 'select=company_id&limit=1')
  record('contacts.company_id exposed over REST', companyIdProbe.status === 200,
    `HTTP ${companyIdProbe.status}${companyIdProbe.status !== 200
      ? ` (${JSON.stringify(companyIdProbe.data?.message ?? '')})` : ''}`)

  const readOwn = await a.rest('companies', 'select=id')
  record('Tenant A reads own (empty) companies', readOwn.status === 200 && readOwn.data.length === 0,
    `HTTP ${readOwn.status}`)
  must(await service.from('companies').insert({
    client_id: clientIds[1], name: 'Acme B',
  }), 'seed company in tenant B')
  const readCross = await a.rest('companies', 'select=id')
  record('Tenant A cannot read tenant B company', readCross.status === 200 && readCross.data.length === 0,
    `HTTP ${readCross.status}; rows=${readCross.data.length ?? 'error'}`)

  // ---- Composite tenant FK: cross-tenant link must be rejected ----
  const probeDeal = must(await service.from('deals').insert({
    id: randomUUID(), client_id: clientIds[0], name: 'FK-probe deal',
  }).select('id'), 'insert FK-probe deal')
  const bCompany = must(await service.from('companies').select('id')
    .eq('client_id', clientIds[1]).limit(1), 'fetch B company')
  const wrongLink = await service.from('deals').insert({
    client_id: clientIds[0], company_id: bCompany[0].id, name: 'Cross-tenant link',
  })
  record('Composite FK rejects cross-tenant company link', Boolean(wrongLink.error),
    wrongLink.error?.code ?? 'REJECTED NOT — inserted!')
  const crossActivity = await service.from('activities').insert({
    client_id: clientIds[0], deal_id: probeDeal[0].id, contact_id: contacts[1], type: 'note',
  })
  record('Composite FK rejects cross-tenant activity link', Boolean(crossActivity.error),
    crossActivity.error?.code ?? 'REJECTED NOT — inserted!')

  // ---- Check constraints ----
  const badStage = await service.from('deals').insert({ client_id: clientIds[0], name: 'x', stage: 'NOPE' })
  record('Deal stage check rejects invalid value', Boolean(badStage.error),
    badStage.error?.code ?? 'REJECTED NOT — inserted!')
  const badType = await service.from('activities').insert({ client_id: clientIds[0], type: 'smoke_signal' })
  record('Activity type check rejects invalid value', Boolean(badType.error),
    badType.error?.code ?? 'REJECTED NOT — inserted!')
  const badCurrency = await service.from('deals').insert({ client_id: clientIds[0], name: 'x', currency: 'usd' })
  record('Deal currency check rejects lowercase', Boolean(badCurrency.error),
    badCurrency.error?.code ?? 'REJECTED NOT — inserted!')
  const badPropKey = await service.from('custom_properties').insert({
    client_id: clientIds[0], entity: 'contact', key: 'Bad-Key!', label: 'X', type: 'text',
  })
  record('Custom property key check rejects invalid format', Boolean(badPropKey.error),
    badPropKey.error?.code ?? 'REJECTED NOT — inserted!')

  // ---- Evidence ledger: service-role insert + trigger semantics ----
  const recordFact = async (clientIdx, contactId, fieldName, fieldValue, band, tool) => {
    const inserted = await service.from('contact_facts').insert({
      client_id: clientIds[clientIdx], contact_id: contactId,
      field_name: fieldName, field_value: fieldValue,
      evidence_band: band, source_tool: tool, evidence: [{ note: `run ${run}` }],
    }).select('id, status, evidence_band')
    if (inserted.error) throw new Error(`fact insert: ${inserted.error.message}`)
    return inserted.data[0]
  }

  // Probable pending suggestion — no auto task may exist.
  const probFact = await recordFact(0, contacts[0], 'mobile_number', '555-0100', 'probable', 'missed_call_response.callback')
  const probTasks = must(await service.from('agent_tasks').select('id')
    .eq('subject', `contact_fact:${probFact.id}`), 'list tasks for probable fact')
  record('Probable fact does NOT auto-enqueue an apply task', probTasks.length === 0,
    `tasks=${probTasks.length}`)

  // Verified fact — auto task with the exact fact id must exist.
  const verFact = await recordFact(0, contacts[0], 'phone', '+15550100', 'verified', 'missed_call_response.sms_thread')
  const verTasks = must(await service.from('agent_tasks').select('id, kind, payload, attempts, finished_at')
    .eq('subject', `contact_fact:${verFact.id}`), 'list tasks for verified fact')
  record('Verified fact auto-enqueues an apply task', verTasks.length === 1,
    `tasks=${verTasks.length}; kind=${verTasks[0]?.kind}`)
  record('Auto task payload references the fact',
    (verTasks[0]?.payload ?? {}).fact_id === verFact.id,
    `payload.fact_id=${(verTasks[0]?.payload ?? {}).fact_id}`)

  // ---- REST lockdown: queue and ledger writes are service-role only ----
  const restWriteFact = await a.rest('contact_facts', 'select=id', 'POST', {
    client_id: clientIds[0], contact_id: contacts[0],
    field_name: 'x', field_value: 'y', evidence_band: 'verified', source_tool: 'forged',
  })
  record('Tenant session cannot INSERT contact_facts over REST', restWriteFact.status !== 201,
    `HTTP ${restWriteFact.status}`)
  const restPatchFact = await a.rest('contact_facts', `id=eq.${probFact.id}`, 'PATCH', {
    field_value: 'forged',
  })
  record('Tenant session cannot PATCH contact_facts over REST', restPatchFact.status !== 200,
    `HTTP ${restPatchFact.status}`)
  const restDeleteFact = await a.rest('contact_facts', `id=eq.${probFact.id}`, 'DELETE')
  // A permitted DELETE would settle as 204 No Content (or 200 with Prefer),
  // so both success codes must be absent.
  record('Tenant session cannot DELETE contact_facts over REST',
    ![200, 204].includes(restDeleteFact.status),
    `HTTP ${restDeleteFact.status}`)
  const factAfterRest = must(await service.from('contact_facts').select('field_value, status')
    .eq('id', probFact.id), 'read fact after REST lockdown probes')[0]
  record('REST lockdown leaves the probable fact untouched',
    factAfterRest.field_value === '555-0100' && factAfterRest.status === 'pending',
    `value=${factAfterRest.field_value}; status=${factAfterRest.status}`)
  const restWriteTask = await a.rest('agent_tasks', 'select=id', 'POST', {
    client_id: clientIds[0], kind: 'apply_contact_fact', reason: 'forged',
  })
  record('Tenant session cannot INSERT agent_tasks over REST', restWriteTask.status !== 201,
    `HTTP ${restWriteTask.status}`)
  const restReadTask = await a.rest('agent_tasks', 'select=id')
  record('Tenant session cannot READ agent_tasks over REST', restReadTask.status !== 200,
    `HTTP ${restReadTask.status}`)
  const restRpcClaim = await fetch(`${url.origin}/rest/v1/rpc/claim_agent_tasks`, {
    method: 'POST',
    headers: {
      apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${userA.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ p_limit: 1, p_lease_seconds: 60 }),
    signal: AbortSignal.timeout(30000),
  })
  record('Tenant session cannot call claim_agent_tasks RPC', restRpcClaim.status !== 200,
    `HTTP ${restRpcClaim.status}`)
  const bReadA = await b.rest('contact_facts', `select=id&client_id=eq.${clientIds[0]}`)
  record('Cross-tenant fact read returns zero rows', bReadA.status === 200 && bReadA.data.length === 0,
    `HTTP ${bReadA.status}; rows=${bReadA.data.length ?? 'error'}`)

  // ---- Queue lifecycle: claim → apply → complete ----
  const claimed = await service.rpc('claim_agent_tasks', { p_limit: 50, p_lease_seconds: 300 })
  if (claimed.error) throw new Error(`claim: ${claimed.error.message}`)
  const myClaimed = (claimed.data ?? []).filter(t =>
    t.client_id === clientIds[0] && t.subject === `contact_fact:${verFact.id}`)
  record('claim_agent_tasks leases the verified-fact task', myClaimed.length === 1,
    `matched=${myClaimed.length}`)
  if (myClaimed.length === 1) {
    const task = myClaimed[0]
    record('Claim increments attempts and sets lease',
      task.attempts === 1 && Boolean(task.leased_until),
      `attempts=${task.attempts}; lease set=${Boolean(task.leased_until)}`)

    // SKIP LOCKED: a second claim in the same window must not re-lease it.
    const claimed2 = await service.rpc('claim_agent_tasks', { p_limit: 50, p_lease_seconds: 300 })
    const reLeased = (claimed2.data ?? []).some(t => t.id === task.id)
    record('SKIP LOCKED prevents double leasing', !reLeased, `re_leased=${reLeased}`)

    const applied = await service.rpc('apply_contact_fact', { p_fact_id: verFact.id, p_reviewer_profile_id: null })
    record('Queue applies verified fact to native column', !applied.error,
      applied.error?.message ?? 'applied')
    const phone = must(await service.from('contacts').select('phone')
      .eq('id', contacts[0]), 'read contact after apply')
    record('Contact phone was auto-written', phone[0].phone === '+15550100',
      `phone=${phone[0]?.phone}`)

    const enrichment = must(await service.from('activities').select('id')
      .eq('type', 'enrichment').eq('contact_id', contacts[0]), 'list enrichment activities')
    record('Applying a fact writes an enrichment activity', enrichment.length >= 1,
      `activities=${enrichment.length}`)

    const afterApply = must(await service.from('contact_facts').select('status, reviewed_by')
      .eq('id', verFact.id), 'read fact after apply')
    record('Applied fact flips to applied without reviewer', afterApply[0].status === 'applied'
      && afterApply[0].reviewed_by === null,
      `status=${afterApply[0].status}`)

    const settled = await service.rpc('complete_agent_task', { p_task_id: task.id, p_outcome: 'applied' })
    record('complete_agent_task settles the lease', !settled.error && settled.data === true,
      settled.error?.message ?? 'settled')
    const again = await service.rpc('complete_agent_task', { p_task_id: task.id, p_outcome: 'again' })
    record('Double completion is rejected', Boolean(again.error) || again.data !== true,
      again.error ? 'rejected by SQL' : `returned=${JSON.stringify(again.data)}`)

    // Re-applying a non-pending fact must fail.
    const reApply = await service.rpc('apply_contact_fact', { p_fact_id: verFact.id, p_reviewer_profile_id: null })
    record('Re-applying a non-pending fact is rejected', Boolean(reApply.error),
      reApply.error?.message ?? 'REJECTED NOT — applied twice!')
  }

  // ---- Failure path: retry with budget, then dead-letter ----
  // fail_agent_task clears the lease, so re-claims are immediate; no sleeps.
  // Loop shape is fail-first: the last fail (attempts = budget) dead-letters.
  const failFact = await recordFact(0, contacts[0], 'email', 'fail@example.com', 'verified', 'lead_attribution.form_submission')
  await service.rpc('claim_agent_tasks', { p_limit: 50, p_lease_seconds: 300 })
  let failTask = must(await service.from('agent_tasks').select('id, attempts, budget')
    .eq('subject', `contact_fact:${failFact.id}`), 'list fail-path tasks')[0]
  if (!failTask) throw new Error('fail-path task missing')
  for (;;) {
    const f = await service.rpc('fail_agent_task', { p_task_id: failTask.id, p_outcome: 'simulated error' })
    if (f.error) throw new Error(`fail: ${f.error.message}`)
    failTask = must(await service.from('agent_tasks')
      .select('id, attempts, budget, finished_at, outcome')
      .eq('id', failTask.id), 're-read fail task')[0]
    if (failTask.finished_at !== null) break
    await service.rpc('claim_agent_tasks', { p_limit: 50, p_lease_seconds: 300 })
  }
  record('Budget exhaustion dead-letters the task',
    failTask.finished_at !== null && String(failTask.outcome).startsWith('budget_exhausted'),
    `attempts=${failTask.attempts}; outcome=${failTask.outcome}`)
  const finalClaim = await service.rpc('claim_agent_tasks', { p_limit: 50, p_lease_seconds: 300 })
  const resurrected = (finalClaim.data ?? []).some(t => t.id === failTask.id)
  record('Dead-lettered task is never re-claimed', !resurrected, `re_leased=${resurrected}`)

  // ---- Supersede semantics (tenant B contact) ----
  const supContact = contacts[1]
  const sup1 = await recordFact(1, supContact, 'company_name', 'Acme Inc', 'probable', 'reactivation.reply_sentiment')
  const sup2 = await recordFact(1, supContact, 'company_name', 'Acme Incorporated', 'verified', 'booking_receptionist.booking_confirmation')
  const afterSup = must(await service.from('contact_facts').select('id, status')
    .eq('contact_id', supContact).eq('field_name', 'company_name'), 'read superseded facts')
  const m1 = Object.fromEntries(afterSup.map(f => [f.id, f.status]))
  record('Verified newcomer supersedes pending sibling',
    m1[sup1.id] === 'superseded' && m1[sup2.id] === 'pending',
    `old=${m1[sup1.id]}; new=${m1[sup2.id]}`)

  const supApplied = await service.rpc('apply_contact_fact', { p_fact_id: sup2.id, p_reviewer_profile_id: null })
  record('Queue can apply the surviving verified fact', !supApplied.error,
    supApplied.error?.message ?? 'applied')
  const sup3 = await recordFact(1, supContact, 'company_name', 'Acme Corp', 'possible', 'lead_attribution.ip_geo')
  const sup3Status = must(await service.from('contact_facts').select('status')
    .eq('id', sup3.id), 'read sup3')[0].status
  record('Possible newcomer does not supersede applied fact', sup3Status === 'pending',
    `status=${sup3Status}`)
  const sup4 = await recordFact(1, supContact, 'company_name', 'Acme Global', 'verified', 'lead_attribution.form_submission')
  const afterSup4 = must(await service.from('contact_facts').select('id, status')
    .eq('contact_id', supContact).eq('field_name', 'company_name'), 'read after sup4')
  const m2 = Object.fromEntries(afterSup4.map(f => [f.id, f.status]))
  record('Verified newcomer supersedes the applied fact',
    m2[sup2.id] === 'superseded' && m2[sup4.id] === 'pending',
    `applied_old=${m2[sup2.id]}; verified_new=${m2[sup4.id]}`)

  // ---- Human review through the sanctioned privileged path ----
  const reviewFactRow = await recordFact(0, contacts[0], 'custom_field_a', 'Blue', 'probable', 'reactivation.reply_sentiment')
  const aReadPending = await a.rest('contact_facts', `select=id,status&status=eq.pending&client_id=eq.${clientIds[0]}`)
  record('Tenant user sees own pending facts over REST', aReadPending.status === 200
    && aReadPending.data.some(f => f.id === reviewFactRow.id),
    `HTTP ${aReadPending.status}; rows=${aReadPending.data?.length ?? 'error'}`)
  const approveRpc = await service.rpc('apply_contact_fact', {
    p_fact_id: reviewFactRow.id, p_reviewer_profile_id: userA.id,
  })
  record('Human approval applies the suggestion', !approveRpc.error,
    approveRpc.error?.message ?? 'applied')
  const customAfter = must(await service.from('contacts').select('custom_fields')
    .eq('id', contacts[0]), 'read custom fields after approval')
  record('Approved custom field merges into custom_fields JSONB',
    customAfter[0].custom_fields?.custom_field_a === 'Blue',
    `value=${JSON.stringify(customAfter[0]?.custom_fields)}`)
  const reviewerRow = must(await service.from('contact_facts').select('status, reviewed_by, reviewed_at')
    .eq('id', reviewFactRow.id), 'read reviewer on approved fact')[0]
  record('Review records the reviewer', reviewerRow.status === 'applied'
    && reviewerRow.reviewed_by === userA.id && reviewerRow.reviewed_at !== null,
    `reviewed_by=${reviewerRow.reviewed_by}`)
  const dismissFactRow = await recordFact(0, contacts[0], 'custom_field_b', 'Red', 'probable', 'reactivation.reply_sentiment')
  const dismissRpc = await service.rpc('dismiss_contact_fact', {
    p_fact_id: dismissFactRow.id, p_reviewer_profile_id: userA.id,
  })
  record('Human dismissal marks the fact dismissed', !dismissRpc.error,
    dismissRpc.error?.message ?? 'dismissed')
  const dismissVerify = must(await service.from('contact_facts').select('status')
    .eq('id', dismissFactRow.id), 'read dismissed fact')[0]
  record('Dismissed fact stays out of the contact record', dismissVerify.status === 'dismissed',
    `status=${dismissVerify.status}`)
  const bCustom = must(await service.from('contacts').select('custom_fields')
    .eq('id', contacts[0]), 're-read custom fields')
  record('Dismissed field never reached custom_fields',
    bCustom[0].custom_fields?.custom_field_b === undefined,
    `fields=${Object.keys(bCustom[0]?.custom_fields ?? {})}`)

  // ---- Tool→band lookup parity between code and schema ----
  const TOOL_BANDS = {
    'missed_call_response.sms_thread': 'verified',
    'booking_receptionist.booking_confirmation': 'verified',
    'booking_receptionist.reschedule_confirmation': 'verified',
    'lead_attribution.form_submission': 'verified',
    'ar_collections.payment_receipt': 'verified',
    'reactivation.opt_in_reply': 'verified',
    'missed_call_response.callback': 'probable',
    'lead_attribution.utm_match': 'probable',
    'reactivation.reply_sentiment': 'probable',
    'ar_collections.promise_to_pay': 'probable',
    'missed_call_response.voicemail_detection': 'possible',
    'reactivation.number_ported': 'possible',
    'lead_attribution.ip_geo': 'possible',
  }
  let parityOk = true
  for (const [tool, band] of Object.entries(TOOL_BANDS)) {
    const probe = await service.from('contact_facts').insert({
      client_id: clientIds[1], contact_id: supContact,
      field_name: 'parity_probe', field_value: tool, evidence_band: band, source_tool: tool,
      evidence: [],
    }).select('id')
    if (probe.error) { parityOk = false; break }
    await service.from('contact_facts').delete().eq('id', probe.data[0].id)
  }
  record('Schema accepts every registered tool→band pair', parityOk, 'all 13 pairs insertable')

  // ---- Cron route e2e (optional, --with-cron) ----
  if (withCron) {
    const e2eFact = await recordFact(0, contacts[0], 'email', 'e2e@example.com', 'verified', 'lead_attribution.form_submission')
    const { spawn } = await import('node:child_process')
    const cronSecret = env.CRON_SECRET || randomUUID()
    const child = spawn('pnpm', ['exec', 'next', 'dev'], {
      cwd: process.cwd(), shell: true,
      env: { ...process.env, CRON_SECRET: cronSecret, PORT: '3199' },
    })
    try {
      let ready = false
      for (let i = 0; i < 90; i++) {
        await sleep(1000)
        const probe = await fetch('http://127.0.0.1:3199/login', { signal: AbortSignal.timeout(2000) }).catch(() => null)
        if (probe && probe.ok) { ready = true; break }
      }
      record('Cron e2e: dev server becomes ready', ready, ready ? 'listening on 3199' : 'never ready')
      if (ready) {
        const denied = await fetch('http://127.0.0.1:3199/api/cron/process-agent-tasks', {
          headers: { Authorization: `Bearer ${randomUUID()}` },
          signal: AbortSignal.timeout(60000),
        })
        record('Cron e2e: wrong secret is rejected', denied.status === 401, `HTTP ${denied.status}`)
        const okRes = await fetch('http://127.0.0.1:3199/api/cron/process-agent-tasks', {
          headers: { Authorization: `Bearer ${cronSecret}` },
          signal: AbortSignal.timeout(60000),
        })
        const body = await okRes.json().catch(() => null)
        record('Cron e2e: correct secret drains the queue', okRes.status === 200 && body?.ok === true,
          `HTTP ${okRes.status}; body=${JSON.stringify(body)}`)
        const appliedFact = must(await service.from('contact_facts').select('status')
          .eq('id', e2eFact.id), 'read e2e fact')[0]
        record('Cron e2e: verified fact applied through the real route',
          appliedFact.status === 'applied', `status=${appliedFact.status}`)
      }
    } finally {
      // Windows: kill the whole process tree; the route's own fetches have
      // already settled by now.
      if (process.platform === 'win32' && child.pid) {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { shell: true })
      } else {
        child.kill('SIGTERM')
      }
    }
  }
}

try {
  await main()
} catch (error) {
  record('Verification setup/execution', false, error.message)
} finally {
  await cleanup()
}

console.log(JSON.stringify({
  run, target: url.hostname, with_cron: withCron,
  passed: results.filter(r => r.result === 'PASS').length,
  failed: results.filter(r => r.result === 'FAIL').length,
  productionEligible: false,
  note: 'No SQL executed by this script. Applies only after the CRM migration is run in the SQL Editor.',
}))
if (results.some(r => r.result === 'FAIL')) process.exitCode = 1


