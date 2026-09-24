import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { generateClientMonthlyReport } from '@/lib/reports/generator'
import { MonthlyReportView } from '@/components/reports/monthly-report-view'
import { Building2, ArrowRight, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const metadata = {
  title: 'Helix AI — Monthly Performance Report',
  robots: { index: false, follow: false },
}

interface ReportsPageProps {
  searchParams: Promise<{ clientId?: string }>
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const { clientId: paramClientId } = await searchParams
  const isAdmin = session.claims.role === 'agency_admin'
  const userClientId = session.claims.client_id

  let targetClientId: string | null = null

  if (isAdmin) {
    if (paramClientId) {
      targetClientId = paramClientId
    } else {
      // Agency admin must select a workspace — never silently bind to first client
      const { data: clients } = await supabase
        .from('clients')
        .select('id, business_name, region_tier, status')
        .order('business_name')

      return (
        <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
          <div className="mx-auto w-full max-w-4xl space-y-6">
            <div>
              <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
                Agency Administration
              </Badge>
              <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                Monthly Performance Reports
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Select a client workspace to generate and inspect their verified performance audit.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="text-sm font-semibold text-foreground mb-4">Client Workspaces</h2>
              {(!clients || clients.length === 0) ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  <Building2 className="size-10 text-accent mx-auto mb-2 stroke-[1.5]" />
                  No client workspaces provisioned yet.
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {clients.map(c => (
                    <li key={c.id} className="py-3 flex items-center justify-between hover:bg-raised/40 px-3 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-md border border-border bg-raised text-foreground font-semibold text-xs">
                          {c.business_name?.[0]?.toUpperCase() ?? 'W'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.business_name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{c.region_tier ?? 'Enterprise'}</p>
                        </div>
                      </div>
                      <Link
                        href={`/dashboard/reports?clientId=${c.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:underline"
                      >
                        <span>Generate Report</span>
                        <ArrowRight className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </ConsoleShell>
      )
    }
  } else {
    if (!userClientId) {
      redirect('/dashboard')
    }
    targetClientId = userClientId
  }

  const reportData = await generateClientMonthlyReport(supabase, targetClientId)

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={isAdmin ? null : reportData.clientBusinessName}
    >
      <div className="space-y-4">
        {isAdmin && (
          <div className="mb-2">
            <Link
              href="/dashboard/reports"
              className="text-xs text-accent hover:underline font-medium inline-flex items-center gap-1"
            >
              ← Back to Client Reports Directory
            </Link>
          </div>
        )}
        <MonthlyReportView report={reportData} />
      </div>
    </ConsoleShell>
  )
}
