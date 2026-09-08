import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { FactReviewList } from '@/components/crm/fact-review-list'

// Authenticated route: excluded from sitemap and marked unindexable here in
// addition to the noindex header set by proxy.ts for every matched path.
export const metadata = {
  title: 'HELIX AI — Evidence Review',
  robots: { index: false, follow: false },
}

export default async function FactsReviewPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  // RLS scopes every row to the requester's tenant; agency admins never land
  // here (redirected above), so this is the workspace's own evidence.
  const { data: facts, error } = await supabase
    .from('contact_facts')
    .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
    .eq('status', 'pending')
    .order('observed_at', { ascending: false })
    .limit(100)

  // Join contact display data in JS: the composite tenant FK makes the REST
  // embed ambiguous, so a second RLS-scoped read keeps typing unambiguous.
  const contactIds = [...new Set((facts ?? []).map(f => f.contact_id))]
  const { data: contacts } = contactIds.length
    ? await supabase
        .from('contacts')
        .select('id, full_name, company_name')
        .in('id', contactIds)
    : { data: [] }
  const contactById = new Map((contacts ?? []).map(c => [c.id, c]))

  const pending = (facts ?? []).map(f => ({
    ...f,
    contact: contactById.get(f.contact_id) ?? null,
  }))

  return (
    <main className="min-h-screen p-8 antialiased">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">{session.user.email}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Evidence review</h1>
      <p className="mt-3 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
        Every AI observation lands here first. Only facts whose source tool is
        registered as <strong>verified</strong> are applied automatically; probable and
        possible observations become suggestions that a person approves or dismisses.
        Nothing is ever auto-written from a model&apos;s own confidence.
      </p>

      {error ? (
        <p className="mt-8 text-sm text-red-600 dark:text-red-400">
          The evidence queue could not be loaded. Retry shortly.
        </p>
      ) : (
        <section className="mt-8">
          <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {pending.length === 0
              ? 'No pending suggestions — the queue is clear.'
              : `${pending.length} pending suggestion${pending.length === 1 ? '' : 's'}`}
          </h2>
          {pending.length > 0 ? <FactReviewList facts={pending} /> : null}
        </section>
      )}
    </main>
  )
}
