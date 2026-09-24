import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

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
    .order('observed_at', { ascending: false })

  const facts: ReviewableFact[] = (rawFacts ?? []).map(f => ({
    id: f.id,
    field_name: f.fact_key,
    field_value: f.fact_value,
    evidence_band: (f.evidence_band ?? 'verified') as 'verified' | 'probable' | 'possible',
    source_tool: f.source_tool ?? 'Fleet Supervisor Agent',
    status: f.status as any,
    score: f.score,
    method: f.method,
    observed_at: f.observed_at,
    contact_id: f.contact_id,
    contact: { full_name: 'Cross-Tenant Record', company_name: 'Agency Fleet' },
  }))

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
              Agency Supervisor Queue
            </Badge>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Cross-Client Attention Queue
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Fleet-wide observation ledger and escalations requiring human supervisor approval.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 text-xs">
            <span className="size-2 rounded-full bg-accent" />
            <span className="font-medium text-foreground tabular-nums">
              {facts.length} Pending Item{facts.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-panel p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <ListChecks className="size-4 text-accent" /> Cross-Tenant Fact Review Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Review and approve AI extractions prior to canonical profile commit across all workspaces.
              </p>
            </div>
          </div>

          <FactReviewList facts={facts} />
        </div>
      </div>
    </ConsoleShell>
  )
}
