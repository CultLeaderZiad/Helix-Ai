import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { SupportDashboard } from '@/components/support/support-dashboard'

export const metadata = {
  title: 'Support — Helix AI Dashboard',
  robots: { index: false, follow: false },
}

export default async function ClientSupportPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const clientId = session.claims.client_id
  if (!clientId) {
    if (session.claims.role === 'agency_admin') redirect('/admin/support')
    redirect('/login')
  }

  const [{ data: tickets }, { data: messages }] = await Promise.all([
    supabase
      .from('support_tickets')
      .select('*')
      .eq('client_id', clientId)
      .order('updated_at', { ascending: false }),
    supabase
      .from('support_messages')
      .select('*, profiles(full_name)')
      .eq('client_id', clientId)
  ])

  const formattedMessages = (messages ?? []).map(m => ({
    ...m,
    senderName: m.profiles?.full_name ?? 'Unknown'
  }))

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName="Your Workspace">
      <div className="w-full">
        <header className="mb-8">
          <h1 className="font-display text-h2">Support</h1>
          <p className="mt-1 text-small text-muted-foreground">
            Get help from the Helix AI team.
          </p>
        </header>
        <SupportDashboard
          initialTickets={tickets ?? []}
          allMessages={formattedMessages}
          currentUserId={session.user.id}
          clientId={clientId}
          isAdmin={false}
        />
      </div>
    </ConsoleShell>
  )
}
