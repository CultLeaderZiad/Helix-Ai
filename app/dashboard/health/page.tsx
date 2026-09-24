import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { ClientHealthView } from '@/components/health/client-health-view'
import { Building2, ArrowRight, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type {
  Client,
  ClientHealthScore,
  ClientChurnSignal,
  ClientSuccessEvent,
  ClientSystem,
  ClientIntegration,
} from '@/lib/schema'

export const metadata = {
  title: 'Helix AI — Account & System Health',
  robots: { index: false, follow: false },
}

interface HealthPageProps {
  searchParams: Promise<{ clientId?: string }>
}

export default async function HealthPage({ searchParams }: HealthPageProps) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const { clientId: paramClientId } = await searchParams
  const isAdmin = session.claims.role === 'agency_admin'
  const userClientId = session.claims.client_id

  let targetClientId: string | null = null

  if (isAdmin) {
    if (paramClientId) {
      targetClientId = paramClientId
    } else {
      // Agency admin workspace selector: Pick which tenant health to inspect
      const { data: clients } = await supabase
        .from('clients')
        .select('id, business_name, current_health_score, current_risk_level, status')
        .order('business_name')

      return (
        <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
              <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
                Agency Administration
              </Badge>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Client Account Health &amp; Retention Monitor
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a client workspace to inspect their real-time composite score, churn signals, and system reliability.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Client Workspaces</h2>
              {(!clients || clients.length === 0) ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <Building2 className="size-10 text-accent mx-auto mb-2 stroke-[1.5]" />
                  <p>No active clients provisioned in this agency instance.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {clients.map(c => {
                    const score = c.current_health_score ?? 70
                    const risk = c.current_risk_level ?? 'healthy'
                    return (
                      <div key={c.id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{c.business_name}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
                            <span>Score: <strong className="text-foreground">{score}</strong>/100</span>
                            <span className="capitalize">Risk: {risk}</span>
                            <span className="capitalize">Status: {c.status}</span>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/health?clientId=${c.id}`}
                          className="inline-flex items-center gap-1.5 text-xs text-accent font-semibold hover:underline"
                        >
                          <span>Inspect Health</span>
                          <ArrowRight className="size-3.5" />
                        </Link>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </ConsoleShell>
      )
    }
  } else {
    targetClientId = userClientId ?? null
  }

  if (!targetClientId) {
    redirect('/dashboard')
  }

  // Fetch client details and churn models in parallel
  const [
    clientRes,
    healthScoreRes,
    churnSignalsRes,
    successEventsRes,
    systemsRes,
    integrationsRes,
    ticketsRes,
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', targetClientId).maybeSingle(),
    supabase
      .from('client_health_scores')
      .select('*')
      .eq('client_id', targetClientId)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('client_churn_signals')
      .select('*')
      .eq('client_id', targetClientId)
      .is('resolved_at', null)
      .order('detected_at', { ascending: false }),
    supabase
      .from('client_success_events')
      .select('*')
      .eq('client_id', targetClientId)
      .order('occurred_at', { ascending: false })
      .limit(5),
    supabase
      .from('client_systems')
      .select('*')
      .eq('client_id', targetClientId)
      .eq('visible_to_client', true),
    supabase.from('client_integrations').select('*').eq('client_id', targetClientId),
    supabase
      .from('support_tickets')
      .select('id')
      .eq('client_id', targetClientId)
      .eq('status', 'open'),
  ])

  const client = clientRes.data as Client | null
  if (!client) {
    redirect('/dashboard')
  }

  const healthScore = (healthScoreRes.data as ClientHealthScore) || null
  const churnSignals = (churnSignalsRes.data as ClientChurnSignal[]) || []
  const successEvents = (successEventsRes.data as ClientSuccessEvent[]) || []
  const systems = (systemsRes.data as ClientSystem[]) || []
  const integrations = (integrationsRes.data as ClientIntegration[]) || []
  const openTicketCount = ticketsRes.data?.length ?? 0

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={client.business_name}
    >
      <ClientHealthView
        client={client}
        healthScore={healthScore}
        churnSignals={churnSignals}
        successEvents={successEvents}
        systems={systems}
        integrations={integrations}
        openTicketCount={openTicketCount}
      />
    </ConsoleShell>
  )
}
