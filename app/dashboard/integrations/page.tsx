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
  const integrations = (integrationsRes.data ?? []) as ClientIntegration[]

  async function pingAction() {
    'use server'
    const serverSupabase = await createSupabaseServerClient()
    const currentSession = await getVerifiedSession(serverSupabase)
    if (!currentSession || !currentSession.claims.client_id) {
      return { error: 'Authentication required.' }
    }

    const targetClientId = currentSession.claims.client_id
    const { data: hooks, error: hookError } = await serverSupabase
      .from('system_webhooks')
      .select('id, webhook_url, enabled, system_type')
      .eq('client_id', targetClientId)
      .eq('enabled', true)

    if (hookError) {
      return { error: `Webhook lookup failed: ${hookError.message}` }
    }
    if (!hooks || hooks.length === 0) {
      return { error: 'Not connected. No enabled webhook URL is saved for this workspace.' }
    }

    const now = new Date().toISOString()
    let reachable = 0
    for (const hook of hooks) {
      let status: 'connected' | 'degraded' = 'degraded'
      try {
        const response = await fetch(hook.webhook_url, { method: 'GET', signal: AbortSignal.timeout(5000) })
        if (response.ok) {
          status = 'connected'
          reachable += 1
        }
      } catch {
        status = 'degraded'
      }
      await serverSupabase
        .from('client_integrations')
        .update({ last_ping_at: now, status })
        .eq('client_id', targetClientId)
        .eq('system_type', hook.system_type)
    }

    revalidatePath('/dashboard/integrations')
    if (reachable === 0) {
      return { error: 'No webhook URL responded. Status left as degraded.' }
    }
    return { success: true, message: `${reachable} of ${hooks.length} webhook URLs responded.` }
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="w-full">
        <IntegrationsHealthView
          initialIntegrations={integrations}
          pingAction={pingAction}
        />
      </div>
    </ConsoleShell>
  )
}
