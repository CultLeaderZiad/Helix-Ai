import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { ClientsRosterView } from '@/components/admin/clients-roster-view'
import { loadClientRoster, rosterConfigErrorMessage } from '@/lib/admin/roster'

export const metadata = {
  title: 'HELIX AI — Agency Admin',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  let rows: Awaited<ReturnType<typeof loadClientRoster>>['rows'] = []
  let error: string | null = null
  let degraded = false

  try {
    const roster = await loadClientRoster(supabase)
    rows = roster.rows
    error = roster.error
    degraded = roster.degraded
  } catch (caught) {
    error = rosterConfigErrorMessage(caught)
  }

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <ClientsRosterView clients={rows} error={error} degraded={degraded} />
    </ConsoleShell>
  )
}
