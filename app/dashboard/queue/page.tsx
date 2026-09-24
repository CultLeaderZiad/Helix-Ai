import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { AlertCircle, ShieldAlert, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Helix AI — Attention Queue',
  robots: { index: false, follow: false },
}

export default async function AttentionQueuePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/queue')

  const clientId = session.claims.client_id!

  const [clientRes, factsRes, integrationsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase
      .from('contact_facts')
      .select('id, fact_key, fact_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
      .eq('client_id', clientId)
      .eq('status', 'pending')
      .order('observed_at', { ascending: false }),
    supabase.from('client_integrations').select('id, system_type, status').eq('client_id', clientId),
  ])

  const client = clientRes.data
  const rawFacts = factsRes.data ?? []
  const degradedIntegrations = (integrationsRes.data ?? []).filter(
    i => i.status === 'degraded' || i.status === 'disconnected'
  )

  // Pure data mapping — zero sample human facts
  const facts: ReviewableFact[] = rawFacts.map(f => ({
    id: f.id,
    field_name: f.fact_key,
    field_value: f.fact_value,
    evidence_band: (f.evidence_band ?? 'verified') as 'verified' | 'probable' | 'possible',
    source_tool: f.source_tool ?? 'AI Operations Agent',
    status: f.status as any,
    score: f.score,
    method: f.method,
    observed_at: f.observed_at,
    contact_id: f.contact_id,
    contact: { full_name: 'Workspace Contact', company_name: client?.business_name ?? null },
  }))

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
              Human-in-the-Loop Triage
            </Badge>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Attention Queue
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              AI observations, degraded integrations, and items requiring a human supervisory decision.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-border bg-panel px-3 py-1.5 text-xs">
            <span className="size-2 rounded-full bg-accent" />
            <span className="font-medium text-foreground tabular-nums">
              {facts.length} Pending Observation{facts.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Integration Alert (if any degraded) */}
        {degradedIntegrations.length > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-status-warning/40 bg-status-warning/10 p-4 text-xs text-foreground">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 text-status-warning shrink-0" />
              <div>
                <p className="font-semibold text-foreground">
                  {degradedIntegrations.length} integration requiring reconnection
                </p>
                <p className="text-muted-foreground mt-0.5">Webhook latency or authentication token expired.</p>
              </div>
            </div>
            <Link
              href="/dashboard/integrations"
              className="rounded-md border border-border bg-panel px-3 py-1.5 text-xs font-medium text-foreground hover:bg-raised"
            >
              Resolve Health →
            </Link>
          </div>
        )}

        {/* Pending Fact Suggestions List */}
        <div className="rounded-xl border border-border bg-panel p-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
                <ListChecks className="size-4 text-accent" /> Evidence Review Ledger
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Approve to commit directly to contact profile; Dismiss to reject with cryptographic audit log.
              </p>
            </div>
          </div>

          <FactReviewList facts={facts} />
        </div>
      </div>
    </ConsoleShell>
  )
}
