import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { AlertCircle, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react'

export const metadata = {
  title: 'Helix AI — Attention Queue',
  robots: { index: false, follow: false },
}

const SAMPLE_PENDING_FACTS: ReviewableFact[] = [
  {
    id: 'f-1',
    field_name: 'budget_confirmed',
    field_value: '$50,000 annual deployment budget approved by CFO',
    evidence_band: 'verified',
    source_tool: 'Retell Voice Agent (call_id: 8f4b..32a1)',
    status: 'pending',
    score: 0.98,
    method: 'audio_intent_classifier',
    observed_at: new Date(Date.now() - 40 * 60000).toISOString(),
    contact_id: 'c-1',
    contact: { full_name: 'Anna Hamer', company_name: 'Cianua Systems' },
  },
  {
    id: 'f-2',
    field_name: 'decision_maker_bought_in',
    field_value: 'CTO confirmed technical readiness for automated WhatsApp responder',
    evidence_band: 'probable',
    source_tool: 'Inbound WhatsApp Webhook (wamid: 91fa..81bc)',
    status: 'pending',
    score: 0.86,
    method: 'nlp_sentiment_extractor',
    observed_at: new Date(Date.now() - 95 * 60000).toISOString(),
    contact_id: 'c-2',
    contact: { full_name: 'Johan Shart', company_name: 'Acme Health Labs' },
  },
  {
    id: 'f-3',
    field_name: 'competitor_displacement',
    field_value: 'Replacing legacy Zendesk system by end of Q4',
    evidence_band: 'possible',
    source_tool: 'Bland AI Voice Call (call_id: 72ee..44a2)',
    status: 'pending',
    score: 0.72,
    method: 'audio_transcript_ner',
    observed_at: new Date(Date.now() - 180 * 60000).toISOString(),
    contact_id: 'c-3',
    contact: { full_name: 'Diane Smith', company_name: 'Vortex Holdings' },
  },
]

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

  const facts: ReviewableFact[] = rawFacts.length > 0
    ? rawFacts.map(f => ({
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
    : SAMPLE_PENDING_FACTS

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-300">
              <ShieldAlert className="size-3.5" /> Human-in-the-Loop Triage
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Attention Queue
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              AI observations, degraded integrations, and items requiring a human supervisory decision.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#101726] px-4 py-2">
            <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
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
        <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="size-4 text-cyan-400" /> Evidence Review Ledger
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
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
