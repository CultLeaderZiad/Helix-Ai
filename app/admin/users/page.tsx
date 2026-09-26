import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, PageHead } from '@/components/admin/v5'
import { UsersManager } from '@/components/admin/users-manager'
import type { Profile } from '@/lib/schema'

export const metadata = {
  title: 'Helix AI — Team & Roles Management',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const admin = createSupabaseAdminClient()

  // Fetch profiles and clients
  const [profilesRes, clientsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, client_id, role, full_name, email, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, business_name')
      .order('business_name'),
  ])

  const profiles = (profilesRes.data ?? []) as Profile[]
  const clients = clientsRes.data ?? []

  const clientsMap = new Map<string, string>()
  for (const c of clients) {
    clientsMap.set(c.id, c.business_name)
  }

  const usersWithClients = profiles.map(p => ({
    ...p,
    clientName: p.client_id ? clientsMap.get(p.client_id) : 'Global Agency Console',
  }))

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title="Team"
          titleAr="الفريق"
          lede="Accounts, roles, and the workspace each person can open."
          ledeAr="الحسابات والأدوار ومساحة العمل التي يفتحها كل شخص."
        />
        <UsersManager
          initialUsers={usersWithClients}
          clients={clients}
          currentUserId={session.user.id}
        />
      </AdminFrame>
    </ConsoleShell>
  )
}

