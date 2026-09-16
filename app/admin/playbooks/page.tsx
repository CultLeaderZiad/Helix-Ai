import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { PlaybooksView } from '@/components/admin/playbooks-view'

export const metadata = {
  title: 'Helix AI — Sales Playbooks & Outreach',
  robots: { index: false, follow: false },
}

export default async function AdminPlaybooksPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <PlaybooksView />
    </ConsoleShell>
  )
}
