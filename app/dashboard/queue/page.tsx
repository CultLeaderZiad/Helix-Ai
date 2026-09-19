import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { AlertCircle, ShieldAlert, Sparkles } from 'lucide-react'

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
      .eq('status', 'pending'),
    supabase.from('client_integrations').select('id, system_type, status').eq('client_id', clientId),
  ])

  const client = clientRes.data
  const rawFacts = factsRes.data ?? []
  const degradedIntegrations = (integrationsRes.data ?? []).filter(
    i => i.status === 'degraded' || i.status === 'disconnected'
  )

  const facts: ReviewableFact[] = rawFacts.map(f => ({
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
        contact: { full_name: 'Workspace Lead', company_name: client?.business_name ?? null },
      }))

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-helix-border bg-helix-surface px-3 py-1 text-11 font-medium uppercase tracking-[0.08em] text-helix-muted">
              <ShieldAlert className="size-3.5" /> Human-in-the-loop triage
            </div>
            <h1 className="mt-2 helix-title text-28">
              Attention queue
            </h1>
            <p className="mt-1 text-sm text-helix-muted">
              AI observations, degraded integrations, and items requiring a human supervisory decision.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-helix-border bg-helix-surface px-4 py-2">
            <span className="size-2 rounded-full bg-helix-accent animate-pulse" />
            <span className="text-xs font-medium text-helix-ink/80">
              {facts.length} Pending Observation{facts.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {/* Integration Alert (if any degraded) */}
        {degradedIntegrations.length > 0 && (
          <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold">{degradedIntegrations.length} integration requiring reconnection</p>
                <p className="text-xs text-amber-300/80">Webhook latency or authentication token expired.</p>
              </div>
            </div>
            <a
              href="/dashboard/integrations"
              className="rounded-lg bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-200 hover:bg-amber-500/30"
            >
              Resolve Health →
            </a>
          </div>
        )}

        {/* Pending Fact Suggestions List */}
        <div className="mt-8 rounded-2xl border border-helix-border bg-helix-surface p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-helix-border/80 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-helix-ink flex items-center gap-2">
                <Sparkles className="size-4 text-helix-accent" /> Evidence Review Ledger
              </h2>
              <p className="text-xs text-helix-muted mt-0.5">
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
