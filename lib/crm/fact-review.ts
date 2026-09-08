'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { createSupabaseServerClient } from '@/lib/supabase'

export type FactReviewState =
  | { status: 'idle' }
  | { status: 'done'; decision: 'approve' | 'dismiss' }
  | { status: 'error'; message: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Human review of a pending evidence-band suggestion. The RLS client first
 * proves the reviewer can read this fact in their own tenant; only then is the
 * privileged apply/dismiss RPC allowed to run, which records the reviewer.
 */
export async function reviewFact(
  _prev: FactReviewState,
  formData: FormData,
): Promise<FactReviewState> {
  const factId = String(formData.get('fact_id') ?? '')
  const decision = String(formData.get('decision') ?? '')
  if (!UUID.test(factId) || (decision !== 'approve' && decision !== 'dismiss')) {
    return { status: 'error', message: 'That review request is not valid.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || !session.claims.client_id) {
      return { status: 'error', message: 'Authentication is required to review facts.' }
    }

    // Tenant gate through RLS: only the reviewer's own workspace facts resolve.
    const { data: fact, error: factError } = await supabase
      .from('contact_facts')
      .select('id, client_id, status')
      .eq('id', factId)
      .maybeSingle()
    if (factError || !fact) {
      return { status: 'error', message: 'This fact is not available for review.' }
    }
    if (fact.status !== 'pending') {
      return { status: 'error', message: 'This fact has already been resolved.' }
    }

    // The reviewer foreign key needs a profile row in the same tenant.
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', session.user.id)
      .maybeSingle()
    if (!profile) {
      return {
        status: 'error',
        message: 'Your reviewer profile is missing. Contact your account manager.',
      }
    }

    const admin = createSupabaseAdminClient()
    const args = { p_fact_id: factId, p_reviewer_profile_id: session.user.id }
    const { error: rpcError } =
      decision === 'approve'
        ? await admin.rpc('apply_contact_fact', args)
        : await admin.rpc('dismiss_contact_fact', args)
    if (rpcError) {
      return { status: 'error', message: 'The review could not be saved. Try again.' }
    }
  } catch {
    return { status: 'error', message: 'The review could not be saved. Try again.' }
  }

  revalidatePath('/dashboard/facts')
  revalidatePath('/dashboard')
  return { status: 'done', decision }
}