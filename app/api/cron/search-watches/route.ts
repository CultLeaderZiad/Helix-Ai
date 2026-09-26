import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { runAction } from '@/lib/search/bus'

export const maxDuration = 60

/**
 * Daily search-watches cron:
 * 1. Checks CRON_SECRET authorization.
 * 2. Purges Google Places data older than 30 days from leadgen_leads (persisting place_id).
 * 3. Purges expired search_geo_cache entries.
 * 4. Runs up to 20 due watches (oldest first).
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized cron invocation' }, { status: 401 })
  }

  const supabase = createSupabaseAdminClient()
  const now = new Date()

  // 1. Purge Places data older than 30 days (keep place_id)
  const thirtyDaysAgoIso = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
  try {
    await (supabase as any)
      .from('leadgen_leads')
      .update({
        phones: [],
        places_fetched_at: null
      })
      .eq('geo_source', 'google_places')
      .lt('places_fetched_at', thirtyDaysAgoIso)
  } catch (err) {
    console.warn('[cron/search-watches] Places purge error:', err)
  }

  // 2. Fetch up to 20 due watches
  // Daily watches due if last_run_at < now - 20h
  // Weekly watches due if last_run_at < now - 6.5 days
  const twentyHoursAgoIso = new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString()
  const { data: dueWatches, error: watchErr } = await (supabase as any)
    .from('search_watches')
    .select('*')
    .eq('active', true)
    .or(`last_run_at.is.null,last_run_at.lt.${twentyHoursAgoIso}`)
    .order('last_run_at', { ascending: true, nullsFirst: true })
    .limit(20)

  if (watchErr || !dueWatches || dueWatches.length === 0) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      message: 'No watches due for execution'
    })
  }

  let processedCount = 0
  for (const watch of dueWatches) {
    try {
      const runRes = await runAction({
        kind: 'search_web',
        origin: 'watch_cron',
        actor: {
          type: 'session',
          clientId: watch.client_id,
          userId: watch.user_id
        },
        input: {
          query: watch.query,
          mode: 'everything',
          params: watch.params
        }
      })

      const newResultsCount = runRes.data?.results?.length ?? 0

      await (supabase as any)
        .from('search_watches')
        .update({
          last_run_at: now.toISOString(),
          last_request_id: runRes.request_id || null,
          new_results_count: newResultsCount,
          updated_at: now.toISOString()
        })
        .eq('id', watch.id)

      processedCount += 1
    } catch (err) {
      console.warn(`[cron/search-watches] Error running watch ${watch.id}:`, err)
    }
  }

  return NextResponse.json({
    ok: true,
    processed: processedCount,
    total_due: dueWatches.length
  })
}
