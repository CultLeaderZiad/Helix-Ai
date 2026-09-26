import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, PageHead } from '@/components/admin/v5'
import { UpdatesManagerView } from '@/components/admin/updates-manager-view'
import { getUpdatesAction } from '@/lib/updates/actions'

export const metadata = {
  title: 'Updates & Changelog Management: Helix AI Admin',
  robots: { index: false, follow: false },
}

export default async function AdminUpdatesPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const updates = await getUpdatesAction(true)

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title="Updates"
          titleAr="التحديثات"
          lede="Releases shown on the public updates page."
          ledeAr="الإصدارات المعروضة في صفحة التحديثات."
        />
        <UpdatesManagerView initialUpdates={updates} />
      </AdminFrame>
    </ConsoleShell>
  )
}
