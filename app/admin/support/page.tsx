import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, PageHead } from '@/components/admin/v5'
import { SupportDashboard } from '@/components/support/support-dashboard'

export const metadata = {
  title: 'Support Tickets: Helix AI Admin',
  robots: { index: false, follow: false },
}

export default async function AdminSupportPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/support')

  const [{ data: tickets }, { data: messages }] = await Promise.all([
    supabase
      .from('support_tickets')
      .select('*, clients(business_name)')
      .order('updated_at', { ascending: false }),
    supabase
      .from('support_messages')
      .select('*, profiles(full_name)')
  ])

  const formattedTickets = (tickets ?? []).map(t => ({
    ...t,
    clientName: t.clients?.business_name ?? 'Unknown Client'
  }))

  const formattedMessages = (messages ?? []).map(m => ({
    ...m,
    senderName: m.profiles?.full_name ?? 'Unknown'
  }))

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title="Support"
          titleAr="الدعم"
          lede="Tickets from every workspace."
          ledeAr="تذاكر من كل مساحات العمل."
        />
        <SupportDashboard
          initialTickets={formattedTickets}
          allMessages={formattedMessages}
          currentUserId={session.user.id}
          clientId={null}
          isAdmin={true}
        />
      </AdminFrame>
    </ConsoleShell>
  )
}
