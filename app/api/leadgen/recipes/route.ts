import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { LEADGEN_RECIPES } from '@/lib/leadgen/recipes'

export async function GET(request: NextRequest) {
  const headers = {
    'Cache-Control': 'private, max-age=3600',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  return NextResponse.json({ recipes: LEADGEN_RECIPES }, { headers })
}
