import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AiEngineView } from '@/components/engine/ai-engine-view'
import type { RegionTier } from '@/lib/schema'

export const metadata = {
  title: 'Helix AI — AI Diagnostic Engine',
  robots: { index: false, follow: false },
}

export default async function EnginePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const clientId = session.claims.client_id
  let clientName: string | null = null
  let regionTier: RegionTier = 'gcc_enterprise'

  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('business_name, region_tier')
      .eq('id', clientId)
      .maybeSingle()

    clientName = client?.business_name ?? null
    if (client?.region_tier) {
      regionTier = client.region_tier as RegionTier
    }
  }

  return (
    <ConsoleShell
      variant={session.claims.role === 'agency_admin' ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={clientName}
    >
      <AiEngineView
        initialClientName={clientName ?? undefined}
        initialRegionTier={regionTier}
        userEmail={session.user.email ?? ''}
      />
    </ConsoleShell>
  )
}
