import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react'

export const metadata = {
  title: 'Helix AI — Global Agent Queue',
  robots: { index: false, follow: false },
}

export default async function AdminQueuePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/queue')

  // Agency admin reads all pending facts across tenants
  const { data: rawFacts } = await supabase
    .from('contact_facts')
    .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
    .eq('status', 'pending')

  const rows = rawFacts ?? []
  const contactIds = [...new Set(rows.map(fact => fact.contact_id).filter(Boolean))]
  const contactsRes = contactIds.length
    ? await supabase.from('contacts').select('id, full_name, company_name').in('id', contactIds)
    : { data: [] as Array<{ id: string; full_name: string | null; company_name: string | null }> }
  const contactById = new Map((contactsRes.data ?? []).map(contact => [contact.id, contact]))

  const facts: ReviewableFact[] = rows.map(f => {
    const contact = contactById.get(f.contact_id)
    return {
      id: f.id,
      field_name: f.field_name,
      field_value: f.field_value,
      evidence_band: f.evidence_band as 'verified' | 'probable' | 'possible',
      source_tool: f.source_tool,
      status: f.status as ReviewableFact['status'],
      score: f.score,
      method: f.method,
      observed_at: f.observed_at,
      contact_id: f.contact_id,
      contact: contact
        ? { full_name: contact.full_name, company_name: contact.company_name }
        : { full_name: null, company_name: null },
    }
  })

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <ShieldAlert className="size-3.5" /> Agency Supervisor Queue
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-helix-ink sm:text-4xl">
              Cross-Client Attention Queue
            </h1>
            <p className="mt-1 text-sm text-helix-muted">
              Fleet-wide observation ledger and escalations requiring human supervisor approval.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-helix-border bg-helix-surface p-6 shadow-xl">
          <FactReviewList facts={facts} />
        </div>
      </div>
    </ConsoleShell>
  )
}
