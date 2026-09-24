import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminRiskDashboard } from '@/components/admin/admin-risk-dashboard'
import type {
  Client,
  ClientHealthScore,
  ClientChurnSignal,
  ClientSuccessEvent,
  ClientSystem,
  ClientIntegration,
} from '@/lib/schema'

export const metadata = {
  title: 'Helix AI — Agency Retention Operations & Risk Triage',
  robots: { index: false, follow: false },
}

interface AdminRiskPageProps {
  searchParams: Promise<{ clientId?: string }>
}

export default async function AdminRiskPage({ searchParams }: AdminRiskPageProps) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const { clientId: paramClientId } = await searchParams

  // 1. Fetch all clients for the agency
  const { data: clientsData } = await supabase
    .from('clients')
    .select('*')
    .order('current_health_score', { ascending: true }) // lowest health score first for instant risk triage!

  const clients = (clientsData as Client[]) || []
  if (clients.length === 0) {
    return (
      <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
        <div className="mx-auto max-w-4xl py-12 text-center text-xs text-muted-foreground">
          No clients provisioned in this agency instance yet.
        </div>
      </ConsoleShell>
    )
  }

  // 2. Determine target client
  const selectedClient = paramClientId
    ? clients.find(c => c.id === paramClientId) || clients[0]
    : clients[0]

  // 3. Parallel fetch of diagnostic data for target client
  const [
    healthScoreRes,
    churnSignalsRes,
    successEventsRes,
    systemsRes,
    integrationsRes,
    ticketsRes,
  ] = await Promise.all([
    supabase
      .from('client_health_scores')
      .select('*')
      .eq('client_id', selectedClient.id)
      .order('calculated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('client_churn_signals')
      .select('*')
      .eq('client_id', selectedClient.id)
      .is('resolved_at', null)
      .order('detected_at', { ascending: false }),
    supabase
      .from('client_success_events')
      .select('*')
      .eq('client_id', selectedClient.id)
      .order('occurred_at', { ascending: false })
      .limit(5),
    supabase.from('client_systems').select('*').eq('client_id', selectedClient.id),
    supabase.from('client_integrations').select('*').eq('client_id', selectedClient.id),
    supabase
      .from('support_tickets')
      .select('id')
      .eq('client_id', selectedClient.id)
      .eq('status', 'open'),
  ])

  const healthScore = (healthScoreRes.data as ClientHealthScore) || null
  const churnSignals = (churnSignalsRes.data as ClientChurnSignal[]) || []
  const successEvents = (successEventsRes.data as ClientSuccessEvent[]) || []
  const systems = (systemsRes.data as ClientSystem[]) || []
  const integrations = (integrationsRes.data as ClientIntegration[]) || []
  const openTicketsCount = ticketsRes.data?.length ?? 0

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminRiskDashboard
        clients={clients}
        selectedClient={selectedClient}
        healthScore={healthScore}
        churnSignals={churnSignals}
        successEvents={successEvents}
        systems={systems}
        integrations={integrations}
        openTicketsCount={openTicketsCount}
      />
    </ConsoleShell>
  )
}
