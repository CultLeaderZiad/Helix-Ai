import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { UpdatesManagerView } from '@/components/admin/updates-manager-view'
import { getUpdates } from '@/lib/updates/updates-store'

export const metadata = {
  title: 'Updates & Changelog Management — Helix AI Admin',
  robots: { index: false, follow: false },
}

export default async function AdminUpdatesPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const updates = getUpdates(true)

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <UpdatesManagerView initialUpdates={updates} />
      </div>
    </ConsoleShell>
  )
}
