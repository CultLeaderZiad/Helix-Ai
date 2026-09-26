import { type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { LeadGenPage } from '@/features/leadgen/LeadGenPage'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix — Lead generation',
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
  const lang = await readDashLang()
  const theme = await readDashTheme()

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={isAdmin ? null : businessName}
      lang={lang}
      theme={theme}
    >
      <LeadGenPage businessName={businessName} initialJobId={jobId} lang={lang} />
    </ConsoleShell>
  )
}
