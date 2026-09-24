import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { executeJobTick } from '@/lib/leadgen/pipeline/tick'

export const maxDuration = 60 // Vercel hobby maximum wall duration

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const headers = {
    'Cache-Control': 'no-store, private',
    'X-Robots-Tag': 'noindex, nofollow',
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing job ID' }, { status: 400, headers })
  }

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401, headers })
  }

  const adminDb = createSupabaseAdminClient()
  const { data: job, error: fetchError } = await adminDb
    .from('leadgen_jobs')
    .select('id, client_id, status')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers })
  }

  if (session.claims.role !== 'agency_admin' && session.claims.client_id !== job.client_id) {
    return NextResponse.json({ error: 'Unauthorized to process this job' }, { status: 403, headers })
  }

  if (job.status === 'paused') {
    return NextResponse.json({ ok: false, reason: 'job_paused', status: 'paused' }, { status: 200, headers })
  }

  if (job.status === 'succeeded' || job.status === 'failed') {
    return NextResponse.json({ ok: true, reason: 'job_terminal', status: job.status }, { status: 200, headers })
  }

  const tickResult = await executeJobTick(id)

  if (!tickResult.ok && tickResult.reason === 'lease_held') {
    return NextResponse.json({ ok: false, reason: 'lease_held' }, { status: 409, headers })
  }

  return NextResponse.json(tickResult, { status: 200, headers })
}
