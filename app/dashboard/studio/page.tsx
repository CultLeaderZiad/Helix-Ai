import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { StudioWorkspace } from '@/components/studio/studio-workspace'
import { isSampleWorkspace } from '@/lib/admin/sample'

export const metadata = {
  title: 'Helix AI — System Preview Studio',
  robots: { index: false, follow: false },
}

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ system?: string }>
}) {
  const { system } = await searchParams
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const clientId = session.claims.client_id
  let businessName: string | undefined
  let isSample = false

  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('business_name, vertical')
      .eq('id', clientId)
      .maybeSingle()
    if (client?.business_name) businessName = client.business_name
    isSample = isSampleWorkspace(client?.vertical, client?.business_name)
  }

  const isAdmin = session.claims.role === 'agency_admin'

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={isAdmin ? null : businessName ?? null}
    >
      <StudioWorkspace
        initialClientName={isSample ? undefined : businessName}
        initialSystemId={system}
        isSample={isSample}
      />
    </ConsoleShell>
  )
}
