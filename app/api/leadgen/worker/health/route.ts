import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
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

  const workerUrl = process.env.SCRAPLING_WORKER_URL
  const workerEnabled = process.env.SCRAPLING_WORKER_ENABLED === 'true'
  const proxyList = process.env.SCRAPLING_PROXY_LIST
  const robotsDefault = process.env.SCRAPLING_ROBOTS_OBEY !== 'false'

  // If worker URL is configured and enabled, attempt real health check ping
  if (workerEnabled && workerUrl) {
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
          scrapling_version: data.scrapling_version ?? '0.3.1',
          engines: ['http', 'stealth', 'dynamic'],
          browsers_ready: data.browsers_ready ?? true,
          proxy: proxyList ? 'configured' : 'off',
          robots_default: robotsDefault,
          queue_depth: data.queue_depth ?? 0,
          control_plane: 'helix-ai',
        }
        return NextResponse.json(payload, { headers })
      }
    } catch {
      // Worker unreachable
    }
  }

  // Truthful offline response — never fake online status or fake leads
  const fallback: WorkerHealthResponse = {
    worker: 'offline',
    engines: ['http', 'stealth', 'dynamic'],
    browsers_ready: false,
    proxy: proxyList ? 'configured' : 'off',
    robots_default: robotsDefault,
    queue_depth: 0,
    control_plane: 'helix-ai',
  }

  return NextResponse.json(fallback, { headers })
}
