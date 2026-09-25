import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { SearchWorkspace } from '@/components/dashboard/sample-views'

export const metadata = {
  title: 'Helix AI — Search',
  robots: { index: false, follow: false },
}

export default async function SearchPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  const isAdmin = session.claims.role === 'agency_admin'
  let businessName: string | null = null
  const clientId = session.claims.client_id
  if (clientId) {
    const { data } = await supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle()
    businessName = data?.business_name ?? null
  }
  return (
    <ConsoleShell variant={isAdmin ? 'admin' : 'client'} email={session.user.email ?? ''} businessName={businessName}>
      <SearchWorkspace />
    </ConsoleShell>
  )
}
