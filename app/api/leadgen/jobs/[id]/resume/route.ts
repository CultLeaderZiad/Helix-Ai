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
    return NextResponse.json({ error: 'Unauthorized to resume this job' }, { status: 403, headers })
  }

  if (job.status !== 'paused') {
    return NextResponse.json({ error: `Cannot resume job with status ${job.status}` }, { status: 409, headers })
  }

  const updatedLogs = [
    ...(job.logs || []),
    `> resume · from_checkpoint · path=${job.checkpoint_path ?? 'default'} · timestamp=${new Date().toISOString()}`,
  ]

  const { error: updateError } = await adminDb
    .from('leadgen_jobs')
    .update({
      status: 'queued',
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
      fetch(`${workerUrl.replace(/\/$/, '')}/jobs/${id}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: id }),
      }).catch(() => {})
    } catch {}
  }

  return NextResponse.json({ success: true, status: 'queued' }, { headers })
}
