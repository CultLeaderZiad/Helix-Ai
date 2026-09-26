import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { runAction } from '@/lib/search/bus'

/**
 * Page-open refresh: runs <= 3 due watches for the current tenant.
 * (due = last_run_at < now - 20h)
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const clientId = session.claims.client_id
  if (!clientId) return NextResponse.json({ error: 'Client workspace required' }, { status: 400 })

  const adminDb = createSupabaseAdminClient()
  const now = new Date()
  const twentyHoursAgoIso = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString()

  const { data: dueWatches } = await (adminDb as any)
    .from('search_watches')
    .select('*')
    .eq('client_id', clientId)
    .eq('active', true)
    .or(`last_run_at.is.null,last_run_at.lt.${twentyHoursAgoIso}`)
    .order('last_run_at', { ascending: true, nullsFirst: true })
    .limit(3)

  let refreshedCount = 0
  for (const watch of dueWatches || []) {
    try {
      const runRes = await runAction({
        kind: 'search_web',
        origin: 'watch_open',
        actor: {
          type: 'session',
          clientId: watch.client_id,
          userId: session.user.id
        },
        input: {
          query: watch.query,
          mode: 'everything',
          params: watch.params
        }
      })

      const newResults = runRes.data?.results?.length ?? 0
      await (adminDb as any)
        .from('search_watches')
        .update({
          last_run_at: now.toISOString(),
          last_request_id: runRes.request_id || null,
          new_results_count: newResults,
          last_seen_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', watch.id)

      refreshedCount += 1
    } catch (err) {
      console.warn(`[watches/refresh] Error refreshing watch ${watch.id}:`, err)
    }
  }

  return NextResponse.json({ ok: true, refreshed: refreshedCount })
}
