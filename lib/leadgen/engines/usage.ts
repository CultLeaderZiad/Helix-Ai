import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface EngineCaps {
  browserDailySecondsCap: number
  stealthMonthlyCap: number
}

export interface EngineUsageStats {
  browserSecondsUsed: number
  browserSecondsCap: number
  stealthMonthUsed: number
  stealthMonthCap: number
}

export function getUTCUsagePeriods(): { todayDate: string; currentMonth: string } {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return {
    todayDate: `${year}-${month}-${day}`,
    currentMonth: `${year}-${month}`,
  }
}

export function getEngineCaps(): EngineCaps {
  const browserDailySecondsCap = parseInt(process.env.LEADGEN_BROWSER_DAILY_SECONDS_CAP || '540', 10)
  const stealthMonthlyCap = parseInt(process.env.LEADGEN_STEALTH_MONTHLY_CAP || '4500', 10)
  return {
    browserDailySecondsCap: Number.isNaN(browserDailySecondsCap) ? 540 : browserDailySecondsCap,
    stealthMonthlyCap: Number.isNaN(stealthMonthlyCap) ? 4500 : stealthMonthlyCap,
  }
}

/**
 * Aggregates current usage for UTC day (dynamic browser seconds) and UTC month (stealth requests).
 */
export async function getCurrentUsage(clientId?: string | null): Promise<EngineUsageStats> {
  const caps = getEngineCaps()
  const { todayDate, currentMonth } = getUTCUsagePeriods()
  const adminDb = createSupabaseAdminClient()

  let browserSecondsUsed = 0
  let stealthMonthUsed = 0

  try {
    // 1. Dynamic usage for today
    let dynamicQuery = adminDb
      .from('leadgen_engine_usage')
      .select('browser_ms')
      .eq('usage_date', todayDate)
      .eq('engine', 'dynamic')

    if (clientId) {
      dynamicQuery = dynamicQuery.eq('client_id', clientId)
    }

    const { data: dynamicRows } = await dynamicQuery
    if (dynamicRows) {
      const totalMs = dynamicRows.reduce((acc, row) => acc + (Number(row.browser_ms) || 0), 0)
      browserSecondsUsed = Math.round(totalMs / 1000)
    }

    // 2. Stealth requests for current month
    let stealthQuery = adminDb
      .from('leadgen_engine_usage')
      .select('requests')
      .eq('usage_month', currentMonth)
      .eq('engine', 'stealth')

    if (clientId) {
      stealthQuery = stealthQuery.eq('client_id', clientId)
    }

    const { data: stealthRows } = await stealthQuery
    if (stealthRows) {
      stealthMonthUsed = stealthRows.reduce((acc, row) => acc + (Number(row.requests) || 0), 0)
    }
  } catch (err) {
    console.error('[leadgen/usage] Failed to read engine usage:', err)
  }

  return {
    browserSecondsUsed,
    browserSecondsCap: caps.browserDailySecondsCap,
    stealthMonthUsed,
    stealthMonthCap: caps.stealthMonthlyCap,
  }
}

/**
 * Checks if the specified engine has remaining quota under the soft cap.
 */
export async function checkEngineQuota(
  engine: 'dynamic' | 'stealth',
  clientId?: string | null
): Promise<{ allowed: boolean; remaining: number; reason?: string }> {
  const stats = await getCurrentUsage(clientId)

  if (engine === 'dynamic') {
    const remaining = Math.max(0, stats.browserSecondsCap - stats.browserSecondsUsed)
    if (stats.browserSecondsUsed >= stats.browserSecondsCap) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Daily Cloudflare browser rendering limit reached (${stats.browserSecondsUsed}s / ${stats.browserSecondsCap}s cap)`,
      }
    }
    return { allowed: true, remaining }
  }

  if (engine === 'stealth') {
    const remaining = Math.max(0, stats.stealthMonthCap - stats.stealthMonthUsed)
    if (stats.stealthMonthUsed >= stats.stealthMonthCap) {
      return {
        allowed: false,
        remaining: 0,
        reason: `Monthly Bright Data Web Unlocker limit reached (${stats.stealthMonthUsed} / ${stats.stealthMonthCap} requests cap)`,
      }
    }
    return { allowed: true, remaining }
  }

  return { allowed: true, remaining: 999999 }
}

/**
 * Records an engine invocation and browser milliseconds into leadgen_engine_usage.
 */
export async function recordEngineUsage(
  engine: 'http' | 'dynamic' | 'stealth',
  clientId: string | null,
  browserMs: number = 0,
  requests: number = 1
): Promise<void> {
  const { todayDate, currentMonth } = getUTCUsagePeriods()
  const adminDb = createSupabaseAdminClient()

  try {
    // Check if row already exists for this date, month, engine, client_id
    let query = adminDb
      .from('leadgen_engine_usage')
      .select('id, requests, browser_ms')
      .eq('usage_date', todayDate)
      .eq('usage_month', currentMonth)
      .eq('engine', engine)

    if (clientId) {
      query = query.eq('client_id', clientId)
    } else {
      query = query.is('client_id', null)
    }

    const { data: existing } = await query.maybeSingle()

    if (existing) {
      await adminDb
        .from('leadgen_engine_usage')
        .update({
          requests: (Number(existing.requests) || 0) + requests,
          browser_ms: (Number(existing.browser_ms) || 0) + browserMs,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
    } else {
      await adminDb.from('leadgen_engine_usage').insert({
        usage_date: todayDate,
        usage_month: currentMonth,
        engine,
        client_id: clientId || null,
        requests,
        browser_ms: browserMs,
      })
    }
  } catch (err) {
    console.error('[leadgen/usage] Failed to record usage:', err)
  }
}
