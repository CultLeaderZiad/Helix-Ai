import assert from 'node:assert/strict'
import { createRequire, register } from 'node:module'
import { after, before, describe, it } from 'node:test'
import { readFileSync } from 'node:fs'
import { createHmac } from 'node:crypto'
import type { NextRequest } from 'next/server'

const require = createRequire(import.meta.url)
const { getMiddlewareMatchers } = require('next/dist/build/analysis/get-page-static-info.js')
const { getMiddlewareRouteMatcher } = require(
  'next/dist/shared/lib/router/utils/middleware-route-matcher.js',
)

type RouteMatch = (pathname: string) => boolean
type WebhookPost = (
  req: NextRequest,
  context: { params: Promise<{ event: string }> },
) => Promise<Response>

const SESSION_ERROR = 'Authentication required.'
const ROUTE_AUTH_ERROR = 'Unauthorized: Invalid Bearer token or HMAC signature'

function proxyMatcherSources(): string[] {
  const src = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8')
  const block = src.match(/export const config = \{[\s\S]*?matcher:\s*\[([\s\S]*?)\]/)
  assert.ok(block, 'proxy.ts must export a static config.matcher array')
  const sources = [...block[1].matchAll(/'([^'\\]+)'/g)].map((match) => match[1])
  assert.ok(sources.some((source) => source.startsWith('/api/')))
  return sources
}

function sessionProxyMatches(): RouteMatch {
  // Same compiler Next uses for proxy.ts `config.matcher`.
  const compiled = getMiddlewareMatchers(proxyMatcherSources(), {})
  return getMiddlewareRouteMatcher(compiled)
}

function sign(secret: string, rawBody: string, timestamp: number): string {
  return createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex')
}

describe('n8n ingress is outside the session proxy', () => {
  const matches = sessionProxyMatches()

  it('does not require a browser session for /api/webhooks/n8n/:event', () => {
    for (const event of [
      'contact',
      'contact.upsert',
      'booking',
      'attribution',
      'fact',
      'attention',
      'invoice',
      'system.health',
    ]) {
      assert.equal(matches(`/api/webhooks/n8n/${event}`), false, event)
    }
  })

  it('still requires a session for every other protected /api route', () => {
    for (const path of [
      '/api/generate',
      '/api/search',
      '/api/search/history',
      '/api/search/enrich',
      '/api/admin/system-webhooks',
      '/api/admin/system-webhooks/ping',
      '/api/admin/leadgen/usage',
      '/api/leadgen/jobs',
      '/api/leadgen/jobs/abc/tick',
      '/api/demo/agent-stream',
      '/api/mcp/extra',
      '/api/webhooks/n8n',
      '/dashboard',
      '/dashboard/integrations',
      '/admin',
      '/admin/webhooks',
      '/login',
      '/client/abc',
    ]) {
      assert.equal(matches(path), true, path)
    }
  })

  it('keeps the existing cron and mcp exclusions', () => {
    assert.equal(matches('/api/cron/process-agent-tasks'), false)
    assert.equal(matches('/api/cron/search-watches'), false)
    assert.equal(matches('/api/mcp'), false)
  })
})

describe('n8n ingress route is the only auth gate', () => {
  const secret = 'test-webhook-secret'
  const rawBody = JSON.stringify({ data: { name: 'Ada' } })
  let post: WebhookPost
  let NextRequest: typeof import('next/server').NextRequest
  const previous = {
    HELIX_WEBHOOK_SECRET: process.env.HELIX_WEBHOOK_SECRET,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }

  before(async () => {
    process.env.HELIX_WEBHOOK_SECRET = secret
    process.env.SUPABASE_URL = 'http://127.0.0.1:9'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
    const registered = register(new URL('./n8n-webhook-loader.mjs', import.meta.url), {
      parentURL: import.meta.url,
    })
    if (registered && typeof (registered as Promise<unknown>).then === 'function') {
      await registered
    }
    const [{ POST }, nextServer] = await Promise.all([
      import('../app/api/webhooks/n8n/[event]/route.ts'),
      import('next/server.js'),
    ])
    post = POST
    NextRequest = nextServer.NextRequest
  })

  async function call(headers: Record<string, string>) {
    const matches = sessionProxyMatches()
    const pathname = '/api/webhooks/n8n/booking'
    assert.equal(matches(pathname), false, 'session proxy must not run before the route')
    const request = new NextRequest(`http://127.0.0.1${pathname}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...headers },
      body: rawBody,
    })
    const response = await post(request, { params: Promise.resolve({ event: 'booking' }) })
    const body = (await response.json()) as { error?: string; received?: boolean }
    return { status: response.status, body }
  }

  it('accepts an unauthenticated request with a valid HMAC signature', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const result = await call({
      'x-helix-signature': sign(secret, rawBody, timestamp),
      'x-helix-timestamp': String(timestamp),
    })
    assert.equal(result.status, 200)
    assert.equal(result.body.received, true)
    assert.equal(result.body.error, undefined)
  })

  it('rejects an unsigned request inside the route', async () => {
    const result = await call({})
    assert.equal(result.status, 401)
    assert.equal(result.body.error, ROUTE_AUTH_ERROR)
    assert.notEqual(result.body.error, SESSION_ERROR)
  })

  it('rejects a badly signed request inside the route', async () => {
    const timestamp = Math.floor(Date.now() / 1000)
    const forged = sign('wrong-secret', rawBody, timestamp)
    const result = await call({
      'x-helix-signature': forged,
      'x-helix-timestamp': String(timestamp),
    })
    assert.equal(result.status, 401)
    assert.equal(result.body.error, ROUTE_AUTH_ERROR)
    assert.notEqual(result.body.error, SESSION_ERROR)
  })

  it('would still stop an unauthenticated call to another /api route at the session proxy', () => {
    const matches = sessionProxyMatches()
    assert.equal(matches('/api/generate'), true)
    assert.equal(matches('/api/admin/system-webhooks'), true)
    assert.equal(matches('/api/webhooks/n8n/booking'), false)
  })

  after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
  })
})
