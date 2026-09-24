import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient()

    // Query recent automation events
    const { data: events } = await supabase
      .from('automation_events')
      .select('id, system_type, event_type, status, created_at, metadata')
      .order('created_at', { ascending: false })
      .limit(15)

    return NextResponse.json({
      success: true,
      mode: 'live',
      events: events ?? [],
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Failed to fetch stream telemetry',
      },
      { status: 500 }
    )
  }
}
