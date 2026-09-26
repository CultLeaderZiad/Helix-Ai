import { type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { generateClientMonthlyReport } from '@/lib/reports/generator'
import { MonthlyReportView } from '@/components/reports/monthly-report-view'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix AI — Monthly Performance Report',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const clientId = session.claims.client_id
  if (!clientId && session.claims.role !== 'agency_admin') {
    redirect('/dashboard')
  }

  let targetClientId: string = clientId ?? ''
  if (!targetClientId) {
    const { data: firstClient } = await supabase.from('clients').select('id').limit(1).maybeSingle()
    targetClientId = firstClient?.id || '00000000-0000-0000-0000-000000000000'
  }

  const [reportData, lang, theme] = await Promise.all([
    generateClientMonthlyReport(supabase, targetClientId),
    readDashLang(),
    readDashTheme(),
  ])

  return (
    <ConsoleShell
      variant={session.claims.role === 'agency_admin' ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={reportData.clientBusinessName}
      lang={lang}
      theme={theme}
    >
      <MonthlyReportView report={reportData} lang={lang} />
    </ConsoleShell>
  )
}
