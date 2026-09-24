import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { LeadGenPage } from '@/features/leadgen/LeadGenPage'

export const metadata = {
  title: 'Helix AI — Lead Generation Job',
  robots: { index: false, follow: false },
}

export default async function LeadGenerationJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>
}) {
  const { jobId } = await params
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const clientId = session.claims.client_id
  let businessName = 'Helix Operations'

  if (clientId) {
    const { data: client } = await supabase
      .from('clients')
      .select('business_name')
      .eq('id', clientId)
      .maybeSingle()
    if (client?.business_name) businessName = client.business_name
  }

  const isAdmin = session.claims.role === 'agency_admin'

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={isAdmin ? null : businessName}
    >
      <LeadGenPage businessName={businessName} initialJobId={jobId} />
    </ConsoleShell>
  )
}
