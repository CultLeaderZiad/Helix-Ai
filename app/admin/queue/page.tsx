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
    .select('id, fact_key, fact_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
    .eq('status', 'pending')

  const facts: ReviewableFact[] = (rawFacts ?? []).map(f => ({
        id: f.id,
        field_name: f.fact_key,
        field_value: f.fact_value,
        evidence_band: f.evidence_band as 'verified' | 'probable' | 'possible',
        source_tool: f.source_tool,
        status: f.status as any,
        score: f.score,
        method: f.method,
        observed_at: f.observed_at,
        contact_id: f.contact_id,
        contact: { full_name: 'Cross-Tenant Record', company_name: 'Agency Fleet' },
      }))

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-helix-border bg-helix-surface px-3 py-1 text-11 font-medium uppercase tracking-[0.08em] text-helix-muted">
              <ShieldAlert className="size-3.5" /> Agency supervisor queue
            </div>
            <h1 className="mt-2 helix-title text-28">
              Cross-client attention queue
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
