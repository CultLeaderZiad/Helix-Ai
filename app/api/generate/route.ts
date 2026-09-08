import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

export async function POST() {
  const headers = {
    'Cache-Control': 'private, no-store',
    'X-Robots-Tag': 'noindex, nofollow',
  }
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers })
    }
    if (session.claims.role !== 'agency_admin') {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403, headers })
    }
    return NextResponse.json(
      { error: 'Not yet implemented: tenant-scoped generation and evidence review.' },
      { status: 501, headers },
    )
  } catch {
    return NextResponse.json({ error: 'Authentication unavailable.' }, { status: 503, headers })
  }
}