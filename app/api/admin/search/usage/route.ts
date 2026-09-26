import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'no-store, private' }
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return NextResponse.json({ error: 'Access denied' }, { status: 403, headers })
  }

  const adminDb = createSupabaseAdminClient()

  // 1. Provider usage totals by engine and month
  const { data: providerUsage } = await (adminDb as any)
    .from('leadgen_engine_usage')
    .select('engine, usage_month, requests, cost_micros')
    .order('usage_month', { ascending: false })

  // Aggregate by provider
  const summary: Record<string, { requests: number; cost_usd: number }> = {}
  for (const row of providerUsage || []) {
    if (!summary[row.engine]) {
      summary[row.engine] = { requests: 0, cost_usd: 0 }
    }
    summary[row.engine].requests += Number(row.requests || 0)
    summary[row.engine].cost_usd += Number(row.cost_micros || 0) / 1000000
  }

  // 2. Google trial info
  const googleBillingMode = process.env.GOOGLE_BILLING_MODE || 'trial'
  const googleTrialEnds = process.env.GOOGLE_TRIAL_ENDS || null

  return NextResponse.json({
    summary,
    google_trial: {
      mode: googleBillingMode,
      trial_ends: googleTrialEnds,
      note: googleBillingMode === 'trial'
        ? `Google Maps runs on $300 trial credit until ${googleTrialEnds || '90 days'}. Upgrade billing before then.`
        : 'Google Maps runs on standard billing with monthly free SKU allowances.'
    }
  }, { headers })
}
