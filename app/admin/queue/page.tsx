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

  const facts: ReviewableFact[] = (rawFacts ?? []).length > 0
    ? rawFacts!.map(f => ({
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
    : [
        {
          id: 'adm-f1',
          field_name: 'sla_breach_risk',
          field_value: 'Inbound customer inquiry unresponded for > 15 minutes on WhatsApp',
          evidence_band: 'verified',
          source_tool: 'WhatsApp Channel Supervisor (client: Nexus Health)',
          status: 'pending',
          score: 0.99,
          method: 'timer_sla_monitor',
          observed_at: new Date(Date.now() - 15 * 60000).toISOString(),
          contact_id: 'c-sla',
          contact: { full_name: 'Nexus Health Inbound', company_name: 'Nexus Health' },
        },
        {
          id: 'adm-f2',
          field_name: 'high_value_contract',
          field_value: '$120,000 enterprise annual contract negotiation initiated',
          evidence_band: 'verified',
          source_tool: 'Vapi Voice Agent (client: Acme Logistics)',
          status: 'pending',
          score: 0.96,
          method: 'deal_term_classifier',
          observed_at: new Date(Date.now() - 45 * 60000).toISOString(),
          contact_id: 'c-deal',
          contact: { full_name: 'Acme Logistics CFO', company_name: 'Acme Logistics' },
        },
      ]

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-5xl">
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
