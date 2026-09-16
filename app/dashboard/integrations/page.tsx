import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { IntegrationsHealthView } from '@/components/integrations/integrations-health-view'
import type { ClientIntegration } from '@/lib/schema'

export const metadata = {
  title: 'Helix AI — Integrations Health',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function IntegrationsHealthPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const clientId = session.claims.client_id!
  const [clientRes, integrationsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('client_integrations').select('*').eq('client_id', clientId),
  ])

  const client = clientRes.data
  let integrations = (integrationsRes.data ?? []) as ClientIntegration[]

  // Auto-seed baseline integration rows if empty
  if (integrations.length === 0) {
    const baseline = [
      { client_id: clientId, system_type: 'missed_call_response', status: 'connected' as const },
      { client_id: clientId, system_type: 'booking_receptionist', status: 'connected' as const },
      { client_id: clientId, system_type: 'lead_attribution', status: 'connected' as const },
    ]
    const { data: seeded } = await supabase.from('client_integrations').insert(baseline).select('*')
    if (seeded) {
      integrations = seeded as ClientIntegration[]
    }
  }

  async function pingAction() {
    'use server'
    const serverSupabase = await createSupabaseServerClient()
    const currentSession = await getVerifiedSession(serverSupabase)
    if (!currentSession || !currentSession.claims.client_id) {
      return { error: 'Authentication required.' }
    }

    const targetClientId = currentSession.claims.client_id
    const now = new Date().toISOString()
    const { error } = await serverSupabase
      .from('client_integrations')
      .update({ last_ping_at: now, status: 'connected' })
      .eq('client_id', targetClientId)

    if (error) {
      return { error: `Failed to ping endpoints: ${error.message}` }
    }

    revalidatePath('/dashboard/integrations')
    return { success: true }
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl">
        <IntegrationsHealthView
          initialIntegrations={integrations}
          pingAction={pingAction}
        />
      </div>
    </ConsoleShell>
  )
}
