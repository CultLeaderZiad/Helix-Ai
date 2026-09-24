import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

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
    .select('id, client_id, status, logs, checkpoint_path')
    .eq('id', id)
    .maybeSingle()

  if (fetchError || !job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404, headers })
  }

  if (session.claims.role !== 'agency_admin' && session.claims.client_id !== job.client_id) {
    return NextResponse.json({ error: 'Unauthorized to pause this job' }, { status: 403, headers })
  }

  if (job.status === 'paused') {
    return NextResponse.json({ success: true, status: 'paused', message: 'Job is already paused' }, { headers })
  }

  if (job.status === 'succeeded' || job.status === 'failed') {
    return NextResponse.json({ error: `Cannot pause terminal job with status ${job.status}` }, { status: 409, headers })
  }

  const checkpointPath = job.checkpoint_path || `/tmp/helix-leadgen-checkpoints/${job.id}.json`
  const updatedLogs = [
    ...(job.logs || []),
    `> pause · checkpoint_saved · path=${checkpointPath} · timestamp=${new Date().toISOString()}`,
  ]

  const { error: updateError } = await adminDb
    .from('leadgen_jobs')
    .update({
      status: 'paused',
      checkpoint_path: checkpointPath,
      logs: updatedLogs,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500, headers })
  }

  // Notify worker if enabled
  const workerUrl = process.env.SCRAPLING_WORKER_URL
  if (process.env.SCRAPLING_WORKER_ENABLED === 'true' && workerUrl) {
    try {
      fetch(`${workerUrl.replace(/\/$/, '')}/jobs/${id}/pause`, { method: 'POST' }).catch(() => {})
    } catch {}
  }

  return NextResponse.json({ success: true, status: 'paused' }, { headers })
}
