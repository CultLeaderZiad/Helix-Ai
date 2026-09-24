import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { getCurrentUsage, getEngineCaps, getUTCUsagePeriods } from '@/lib/leadgen/engines/usage'

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  if (session.claims.role !== 'agency_admin') {
    return NextResponse.json({ error: 'Agency admin role required' }, { status: 403, headers })
  }

  const adminDb = createSupabaseAdminClient()
  const caps = getEngineCaps()
  const periods = getUTCUsagePeriods()
  const currentUsage = await getCurrentUsage()

  // Fetch recent usage rows
  const { data: rows, error: rowsError } = await adminDb
    .from('leadgen_engine_usage')
    .select(`
      id,
      usage_date,
      usage_month,
      engine,
      client_id,
      requests,
      browser_ms,
      created_at,
      updated_at,
      clients (
        name,
        company_name
      )
    `)
    .order('usage_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100)

  if (rowsError) {
    return NextResponse.json({ error: rowsError.message }, { status: 500, headers })
  }

  return NextResponse.json(
    {
      periods,
      caps,
      currentUsage,
      rows: rows || [],
    },
    { headers }
  )
}
