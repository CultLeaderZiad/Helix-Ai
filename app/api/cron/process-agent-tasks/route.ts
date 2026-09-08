import { timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { runAgentTaskQueue } from '@/lib/crm/agent-queue'

// Vercel Cron invokes GET on this path with `Authorization: Bearer <CRON_SECRET>`
// every 5 minutes (see vercel.json). proxy.ts deliberately excludes /api/cron/*
// from the session matcher; the shared secret below is the sole gate.
export const dynamic = 'force-dynamic'
export const maxDuration = 30

const headers = {
  'Cache-Control': 'private, no-store',
  'X-Robots-Tag': 'noindex, nofollow',
} as const

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET
  // Fail closed: an unconfigured secret rejects everything rather than nothing.
  if (!secret) return false
  const provided = request.headers.get('authorization') ?? ''
  const expected = `Bearer ${secret}`
  const a = Buffer.from(provided, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401, headers })
  }
  try {
    const summary = await runAgentTaskQueue()
    return NextResponse.json({ ok: true, ...summary }, { headers })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Agent queue processing is unavailable.',
        detail: error instanceof Error ? error.message : 'Unknown failure.',
      },
      { status: 503, headers },
    )
  }
}