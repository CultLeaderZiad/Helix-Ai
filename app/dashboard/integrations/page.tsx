import { type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { IntegrationsHealthView } from '@/components/integrations/integrations-health-view'
import type { ClientIntegration } from '@/lib/schema'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

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

  const lang = await readDashLang()
  const theme = await readDashTheme()
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
      return { error: 'We could not check the connection. Try again.' }
    }
    if (!hooks || hooks.length === 0) {
      return { error: 'Not connected.' }
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
      return { error: 'Still not connected.' }
    }
    return { success: true, message: `${reachable} of ${hooks.length} connected.` }
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null} lang={lang} theme={theme}>
      <IntegrationsHealthView
        initialIntegrations={integrations}
        pingAction={pingAction}
        lang={lang}
      />
    </ConsoleShell>
  )
}
