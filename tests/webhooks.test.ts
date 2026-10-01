import assert from 'node:assert/strict'
import crypto from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { sendHelixWebhookEvent } from '../lib/webhooks/egress.ts'
import {
  authorizeIngress,
  HELIX_WEBHOOK_MAX_AGE_SECONDS,
  type InboundWebhookRow,
  resolveEgressSecret,
  signHelixPayload,
} from '../lib/webhooks/signature.ts'

const NOW = 1_758_300_000
const TENANT = '00000000-0000-0000-0000-000000000001'
const BODY = JSON.stringify({ tenant_id: TENANT, data: { phone: '+971501234567' } })

function signed(secret: string, timestamp = NOW, rawBody = BODY) {
  return {
    rawBody,
    signature: signHelixPayload(secret, rawBody, timestamp),
    timestamp: String(timestamp),
    nowSeconds: NOW,
  }
}

function ingress(overrides: Parameters<typeof authorizeIngress>[0]) {
  return authorizeIngress({
    rawBody: BODY,
    tenantId: TENANT,
    globalSecret: null,
    lookupError: null,
    rows: [],
    nowSeconds: NOW,
    ...overrides,
  })
}

function mockSupabase(webhook: Record<string, unknown> | null) {
  const updates: Array<Record<string, unknown>> = []
  const client = {
    from(table: string) {
      if (table !== 'system_webhooks') throw new Error(`unexpected table ${table}`)
      return {
        select() {
          const chain = {
            eq() {
              return chain
            },
            maybeSingle: async () => ({ data: webhook, error: null }),
          }
          return chain
        },
        update(payload: Record<string, unknown>) {
          updates.push(payload)
          return {
            eq: async () => ({ error: null }),
          }
        },
      }
    },
  }
  return { client, updates }
}

async function withWebhookSecret(value: string | undefined, run: () => Promise<void>) {
  const previous = process.env.HELIX_WEBHOOK_SECRET
  if (value === undefined) delete process.env.HELIX_WEBHOOK_SECRET
  else process.env.HELIX_WEBHOOK_SECRET = value
  try {
    await run()
  } finally {
    if (previous === undefined) delete process.env.HELIX_WEBHOOK_SECRET
    else process.env.HELIX_WEBHOOK_SECRET = previous
  }
}

describe('valid signature', () => {
  it('accepts an HMAC over the timestamp and the exact raw body', () => {
    const secret = 'tenant-ingress-secret'
    const { signature, timestamp, rawBody } = signed(secret)
    const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
    assert.equal(signature, expected)
    assert.equal(signature, signHelixPayload(secret, rawBody, Number(timestamp)))

    const decision = ingress({
      ...signed(secret),
      rows: [{ system_type: 'missed_call_response', secret_ciphertext: secret, enabled: true }],
      authorization: 'Bearer this-must-not-matter',
    })
    assert.deepEqual(decision, { ok: true })
  })

  it('signs egress with the tenant secret and does not send that secret', async () => {
    const secret = 'tenant-egress-secret'
    const webhook = {
      id: 'wh_1',
      webhook_url: 'https://n8n.example/webhook/helix',
      secret_ciphertext: secret,
      secret_hash: 'different-legacy-copy',
      enabled: true,
    }
    const { client, updates } = mockSupabase(webhook)
    let called = 0
    let captured: { url: string; init: RequestInit } | undefined
    const previousFetch = globalThis.fetch
    globalThis.fetch = async (url, init) => {
      called += 1
      captured = { url: String(url), init: init ?? {} }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    }

    try {
      await withWebhookSecret('env-secret-must-not-be-used', async () => {
        const result = await sendHelixWebhookEvent({
          supabase: client as never,
          clientId: TENANT,
          systemType: 'missed_call_response',
          eventType: 'call.missed',
          data: { call_id: 'call_1' },
        })
        assert.equal(result.delivered, true)
        assert.equal(result.statusCode, 200)
      })
    } finally {
      globalThis.fetch = previousFetch
    }

    assert.equal(called, 1)
    assert.equal(captured?.url, webhook.webhook_url)
    const headers = captured?.init.headers as Record<string, string>
    assert.equal(Object.keys(headers).some((name) => name.toLowerCase() === 'authorization'), false)
    const rawBody = String(captured?.init.body)
    const timestamp = Number(headers['X-Helix-Timestamp'])
    assert.equal(Math.abs(Math.floor(Date.now() / 1000) - timestamp) <= 5, true)
    assert.equal(headers['X-Helix-Signature'], signHelixPayload(secret, rawBody, timestamp))
    assert.equal(headers['X-Helix-Signature'].length, 64)
    assert.equal(headers['X-Helix-Event-Type'], 'call.missed')
    for (const value of Object.values(headers)) {
      assert.equal(String(value).includes(secret), false)
    }
    assert.equal(updates.at(-1)?.last_status, 'ok')
  })
})

describe('bad signature', () => {
  it('rejects a signature that does not match the secret', () => {
    const secret = 'tenant-ingress-secret'
    const good = signed(secret)
    const flipped = `${good.signature.slice(0, -1)}${good.signature.endsWith('a') ? 'b' : 'a'}`
    const decision = ingress({
      ...good,
      signature: flipped,
      rows: [{ system_type: 'missed_call_response', secret_hash: secret, enabled: true }],
      authorization: `Bearer ${secret}`,
    })
    assert.deepEqual(decision, { ok: false, reason: 'bad_signature' })
  })

  it('does not accept a Bearer token in place of a signature', () => {
    const secret = 'tenant-ingress-secret'
    const decision = ingress({
      rawBody: BODY,
      signature: '',
      timestamp: String(NOW),
      authorization: `Bearer ${secret}`,
      rows: [{ system_type: 'missed_call_response', secret_ciphertext: secret, enabled: true }],
    })
    assert.deepEqual(decision, { ok: false, reason: 'missing_signature' })
  })

  it('rejects a wrong-length signature without throwing', () => {
    const decision = ingress({
      ...signed('tenant-ingress-secret'),
      signature: 'abcd',
      rows: [{ secret_ciphertext: 'tenant-ingress-secret', enabled: true }],
    })
    assert.deepEqual(decision, { ok: false, reason: 'bad_signature' })
  })
})

describe('stale timestamp', () => {
  it('rejects a valid signature once the timestamp is outside the five minute window', () => {
    const secret = 'tenant-ingress-secret'
    const staleAt = NOW - HELIX_WEBHOOK_MAX_AGE_SECONDS - 1
    const rows = [{ system_type: 'missed_call_response', secret_ciphertext: secret, enabled: true }]
    const stale = ingress({
      ...signed(secret, staleAt),
      rows,
    })
    assert.deepEqual(stale, { ok: false, reason: 'stale_timestamp' })

    const future = ingress({
      ...signed(secret, NOW + HELIX_WEBHOOK_MAX_AGE_SECONDS + 1),
      rows,
    })
    assert.deepEqual(future, { ok: false, reason: 'stale_timestamp' })

    const edge = ingress({
      ...signed(secret, NOW - HELIX_WEBHOOK_MAX_AGE_SECONDS),
      rows,
    })
    assert.deepEqual(edge, { ok: true })
  })

  it('rejects a missing or non-decimal timestamp', () => {
    const rows = [{ secret_ciphertext: 'tenant-ingress-secret', enabled: true }]
    assert.equal(ingress({ signature: 'a'.repeat(64), timestamp: '', rows }).reason, 'missing_signature')
    assert.equal(
      ingress({ ...signed('tenant-ingress-secret'), timestamp: '1758300000abc', rows }).reason,
      'stale_timestamp',
    )
  })
})

describe('missing secret fails closed', () => {
  it('does not accept the removed built-in secret when nothing is configured', () => {
    const builtin = 'helix_default_secret'
    const decision = ingress({
      ...signed(builtin),
      tenantId: TENANT,
      globalSecret: '   ',
      rows: [],
    })
    assert.deepEqual(decision, { ok: false, reason: 'missing_secret' })
  })

  it('does not fall back to the environment secret when the tenant rows have no secret', () => {
    const globalSecret = 'global-secret'
    const decision = ingress({
      ...signed(globalSecret),
      globalSecret,
      rows: [
        { system_type: 'missed_call_response', secret_ciphertext: '  ', secret_hash: null, enabled: true },
      ],
    })
    assert.deepEqual(decision, { ok: false, reason: 'missing_secret' })
  })

  it('does not fall back to the environment secret when the tenant lookup fails', () => {
    const globalSecret = 'global-secret'
    const decision = ingress({
      ...signed(globalSecret),
      globalSecret,
      lookupError: 'JSON object requested, multiple (or no) rows returned',
      rows: null,
    })
    assert.deepEqual(decision, { ok: false, reason: 'lookup_failed' })
  })

  it('does not dispatch egress when the tenant and the environment have no secret', async () => {
    const { client, updates } = mockSupabase({
      id: 'wh_unconfigured',
      webhook_url: 'https://n8n.example/webhook/helix',
      secret_ciphertext: null,
      secret_hash: '   ',
      enabled: true,
    })
    let called = 0
    const previousFetch = globalThis.fetch
    globalThis.fetch = async () => {
      called += 1
      throw new Error('fetch should not run')
    }

    try {
      await withWebhookSecret(undefined, async () => {
        assert.equal(resolveEgressSecret({ secret_ciphertext: null, secret_hash: '   ' }, undefined), null)
        const result = await sendHelixWebhookEvent({
          supabase: client as never,
          clientId: TENANT,
          systemType: 'booking_receptionist',
          eventType: 'booking.created',
          data: { booking_id: 'bk_1' },
        })
        assert.equal(result.delivered, false)
        assert.equal(result.status, 'failed')
        assert.equal(result.error, 'Webhook signing secret is not configured')
        assert.equal(result.error?.includes('helix_default_secret'), false)
      })
    } finally {
      globalThis.fetch = previousFetch
    }

    assert.equal(called, 0)
    assert.equal(updates[0]?.last_status, 'failed')
    assert.equal(updates[0]?.last_error, 'Webhook signing secret is not configured')
  })

  it('keeps the built-in secret string out of the webhook implementation', () => {
    const egress = readFileSync(new URL('../lib/webhooks/egress.ts', import.meta.url), 'utf8')
    const route = readFileSync(new URL('../app/api/webhooks/n8n/[event]/route.ts', import.meta.url), 'utf8')
    const signature = readFileSync(new URL('../lib/webhooks/signature.ts', import.meta.url), 'utf8')
    for (const source of [egress, route, signature]) {
      assert.equal(source.includes('helix_default_secret'), false)
    }
    assert.equal(egress.includes('Authorization'), false)
    const loader = route.slice(
      route.indexOf('async function loadInboundWebhooks'),
      route.indexOf('export async function POST'),
    )
    assert.equal(loader.includes('maybeSingle'), false)
    assert.equal(route.includes('allowedSecrets'), false)
    assert.equal(route.includes("startsWith('Bearer"), false)
  })
})

describe('multi-system tenant', () => {
  const secretA = 'secret-missed-call'
  const secretB = 'secret-booking'
  const rows: InboundWebhookRow[] = [
    {
      system_type: 'missed_call_response',
      secret_ciphertext: secretA,
      secret_hash: secretA,
      enabled: true,
    },
    {
      system_type: 'booking_receptionist',
      secret_ciphertext: secretB,
      secret_hash: secretB,
      enabled: true,
    },
  ]

  it('accepts each inbound system secret without collapsing the lookup', () => {
    const forA = ingress({
      ...signed(secretA),
      systemType: 'missed_call_response',
      globalSecret: 'global-secret',
      rows,
    })
    assert.deepEqual(forA, { ok: true })

    const forB = ingress({
      ...signed(secretB),
      systemType: 'booking_receptionist',
      globalSecret: 'global-secret',
      rows,
    })
    assert.deepEqual(forB, { ok: true })
  })

  it('does not accept another system secret, or the global secret, for the named system', () => {
    const sibling = ingress({
      ...signed(secretB),
      systemType: 'missed_call_response',
      globalSecret: 'global-secret',
      rows,
    })
    assert.deepEqual(sibling, { ok: false, reason: 'bad_signature' })

    const globalFallback = ingress({
      ...signed('global-secret'),
      systemType: 'missed_call_response',
      globalSecret: 'global-secret',
      rows,
    })
    assert.deepEqual(globalFallback, { ok: false, reason: 'bad_signature' })
  })

  it('accepts either inbound secret when the request does not name a system', () => {
    assert.deepEqual(
      ingress({ ...signed(secretA), systemType: null, globalSecret: 'global-secret', rows }),
      { ok: true },
    )
    assert.deepEqual(
      ingress({ ...signed(secretB), systemType: null, globalSecret: 'global-secret', rows }),
      { ok: true },
    )
    assert.deepEqual(
      ingress({ ...signed('global-secret'), systemType: null, globalSecret: 'global-secret', rows }),
      { ok: false, reason: 'bad_signature' },
    )
  })

  it('rejects a disabled system instead of using another row or the global secret', () => {
    const decision = ingress({
      ...signed(secretB),
      systemType: 'booking_receptionist',
      globalSecret: 'global-secret',
      rows: [
        rows[0],
        { ...rows[1], enabled: false },
      ],
    })
    assert.deepEqual(decision, { ok: false, reason: 'missing_secret' })
  })
})
