import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { isCloudflareConfigured } from '@/lib/leadgen/engines/cloudflare'
import { isBrightDataConfigured } from '@/lib/leadgen/engines/brightdata'
import { getCurrentUsage } from '@/lib/leadgen/engines/usage'
import type { WorkerHealthResponse } from '@/lib/leadgen/types'

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  // Auth guard: session check
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  const preferExternal = process.env.LEADGEN_PREFER_EXTERNAL_WORKER === 'true'
  const workerUrl = process.env.SCRAPLING_WORKER_URL
  const workerEnabled = process.env.SCRAPLING_WORKER_ENABLED === 'true'

  // 1. If explicit external preference requested and worker enabled, probe Scrapling
  if (preferExternal && workerEnabled && workerUrl) {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(`${workerUrl.replace(/\/$/, '')}/health`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'Helix-Ai-Control-Plane' },
      })
      clearTimeout(timeout)

      if (res.ok) {
        const data = await res.json()
        const payload: WorkerHealthResponse = {
          worker: 'online',
          mode: 'scrapling',
          scrapling_version: data.scrapling_version ?? '0.3.1',
          engines: ['http', 'stealth', 'dynamic', 'auto'],
          browsers_ready: data.browsers_ready ?? true,
          proxy: process.env.SCRAPLING_PROXY_LIST ? 'configured' : 'off',
          robots_default: process.env.SCRAPLING_ROBOTS_OBEY !== 'false',
          queue_depth: data.queue_depth ?? 0,
          control_plane: 'helix-ai',
        }
        return NextResponse.json(payload, { headers })
      }
    } catch {
      // Fall through to builtin if external worker failed
    }
  }

  // 2. Builtin TypeScript Engine (Active by default or when LEADGEN_BUILTIN_ENGINE=true)
  const isBuiltinActive =
    process.env.LEADGEN_BUILTIN_ENGINE === 'true' ||
    process.env.LEADGEN_BUILTIN_ENGINE === undefined ||
    !preferExternal

  if (isBuiltinActive) {
    const hasDynamic = isCloudflareConfigured()
    const hasStealth = isBrightDataConfigured()
    const usage = await getCurrentUsage(session.claims.client_id)

    const payload: WorkerHealthResponse = {
      worker: 'online',
      mode: 'builtin',
      scrapling_version: 'builtin-ts',
      engines: ['http', 'stealth', 'dynamic', 'auto'],
      engines_available: {
        http: true,
        dynamic: hasDynamic,
        stealth: hasStealth,
      },
      browsers_ready: hasDynamic || hasStealth,
      proxy: 'off',
      robots_default: true,
      queue_depth: 0,
      control_plane: 'helix-ai',
      quotas: {
        stealth_month_used: usage.stealthMonthUsed,
        stealth_month_cap: usage.stealthMonthCap,
        browser_seconds_used: usage.browserSecondsUsed,
        browser_seconds_cap: usage.browserSecondsCap,
      },
      pause_semantics: 'tab_driven_ticks',
    }

    return NextResponse.json(payload, { headers })
  }

  // 3. Fallback when explicitly disabled
  const fallback: WorkerHealthResponse = {
    worker: 'offline',
    mode: 'scrapling',
    engines: ['http', 'stealth', 'dynamic', 'auto'],
    browsers_ready: false,
    proxy: 'off',
    robots_default: true,
    queue_depth: 0,
    control_plane: 'helix-ai',
    error: 'Lead generation engine offline. Enable LEADGEN_BUILTIN_ENGINE=true on Vercel.',
  }

  return NextResponse.json(fallback, { headers })
}
