import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { getCurrentUsage, getEngineCaps, getUTCUsagePeriods } from '@/lib/leadgen/engines/usage'

export const metadata = {
  title: 'HELIX AI — Lead Gen Engine Usage & Soft Caps',
  robots: { index: false, follow: false },
}

export default async function AdminLeadGenUsagePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const adminDb = createSupabaseAdminClient()
  const caps = getEngineCaps()
  const periods = getUTCUsagePeriods()
  const usageStats = await getCurrentUsage()

  // Load recent usage rows
  const { data: usageRows } = await adminDb
    .from('leadgen_engine_usage')
    .select(`
      id,
      usage_date,
      usage_month,
      engine,
      client_id,
      requests,
      browser_ms,
      updated_at,
      clients (
        business_name
      )
    `)
    .order('usage_date', { ascending: false })
    .order('updated_at', { ascending: false })
    .limit(100)

  const rows = usageRows || []

  const stealthRemaining = Math.max(0, caps.stealthMonthlyCap - usageStats.stealthMonthUsed)
  const browserSecondsRemaining = Math.max(0, caps.browserDailySecondsCap - usageStats.browserSecondsUsed)

  const isBuiltinActive =
    process.env.LEADGEN_BUILTIN_ENGINE === 'true' ||
    process.env.LEADGEN_BUILTIN_ENGINE === undefined ||
    process.env.LEADGEN_PREFER_EXTERNAL_WORKER !== 'true'

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full space-y-6">
        <AdminTabs />

        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D4CB] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#0e8da6]">
                Engine Observability
              </span>
              <span className="font-mono text-[11px] text-[#6E6A63]">· UTC {periods.todayDate}</span>
            </div>
            <h1 className="font-display text-xl font-bold tracking-tight text-[#141414]">
              Lead Gen Engine Usage & Caps
            </h1>
            <p className="mt-0.5 text-xs text-[#6E6A63]">
              Server-side soft-cap accounting for Cloudflare Browser Run and Bright Data Web Unlocker.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/lead-generation"
              className="rounded-md border border-[#D9D4CB] bg-[#FFFEFA] px-3.5 py-1.5 text-xs font-semibold text-[#141414] hover:bg-[#E6E2D9] transition-colors"
            >
              Open Lead Gen Console →
            </Link>
          </div>
        </div>

        {/* Quota KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Engine Status */}
          <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-4">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#6E6A63]">
              Active Engine Architecture
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  isBuiltinActive ? 'bg-[#0B6E4F]' : 'bg-[#D97706]'
                }`}
              />
              <span className="font-display text-base font-semibold text-[#141414]">
                {isBuiltinActive ? 'Built-in TS Engine' : 'External Docker Worker'}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#6E6A63]">
              {isBuiltinActive
                ? 'Execution driven via tab polling ticks + next/server after().'
                : 'Scrapling standalone container claiming via polling loop.'}
            </p>
          </div>

          {/* Card 2: Cloudflare Dynamic Browser Seconds */}
          <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-4">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#6E6A63]">
              <span>Cloudflare Browser Run</span>
              <span>UTC Today</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-[#141414] tabular-nums font-display">
              {usageStats.browserSecondsUsed}s{' '}
              <span className="text-xs font-normal text-[#6E6A63]">/ {caps.browserDailySecondsCap}s cap</span>
            </div>
            <div className="mt-1 text-xs font-mono text-[#0B6E4F]">
              {browserSecondsRemaining}s remaining today ({Math.round(browserSecondsRemaining / 60)} min)
            </div>
          </div>

          {/* Card 3: Bright Data Stealth Requests */}
          <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-4">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-[#6E6A63]">
              <span>Bright Data Unlocker</span>
              <span>UTC {periods.currentMonth}</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-[#141414] tabular-nums font-display">
              {usageStats.stealthMonthUsed}{' '}
              <span className="text-xs font-normal text-[#6E6A63]">/ {caps.stealthMonthlyCap} cap</span>
            </div>
            <div className="mt-1 text-xs font-mono text-[#0B6E4F]">
              {stealthRemaining} requests remaining this month
            </div>
          </div>
        </div>

        {/* Usage Records Table */}
        <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] overflow-hidden">
          <div className="border-b border-[#D9D4CB] px-4 py-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-[#141414]">
              Aggregated Usage Ledger (Daily & Monthly)
            </h3>
            <span className="font-mono text-xs text-[#6E6A63]">{rows.length} records</span>
          </div>

          {rows.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#6E6A63]">
              No engine usage recorded yet. Invocations from leadgen jobs will populate here automatically.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="border-b border-[#D9D4CB] bg-[#F7F5F0] text-[11px] uppercase tracking-wider text-[#6E6A63]">
                  <tr>
                    <th className="px-4 py-2.5">Date (UTC)</th>
                    <th className="px-4 py-2.5">Month</th>
                    <th className="px-4 py-2.5">Engine</th>
                    <th className="px-4 py-2.5">Requests</th>
                    <th className="px-4 py-2.5">Browser Time</th>
                    <th className="px-4 py-2.5">Client Workspace</th>
                    <th className="px-4 py-2.5">Last Updated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9D4CB]">
                  {rows.map(row => {
                    const clientName =
                      // @ts-expect-error join type
                      row.clients?.business_name || (row.client_id ? row.client_id.slice(0, 8) : 'System/Admin')

                    return (
                      <tr key={row.id} className="hover:bg-[#F7F5F0]/60 transition-colors">
                        <td className="px-4 py-2 text-[#141414] font-medium">{row.usage_date}</td>
                        <td className="px-4 py-2 text-[#6E6A63]">{row.usage_month}</td>
                        <td className="px-4 py-2">
                          <span
                            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                              row.engine === 'stealth'
                                ? 'bg-[#D97706]/15 text-[#B45309]'
                                : row.engine === 'dynamic'
                                ? 'bg-[#0e8da6]/15 text-[#0e8da6]'
                                : 'bg-[#6E6A63]/15 text-[#141414]'
                            }`}
                          >
                            {row.engine}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-[#141414] tabular-nums">{row.requests}</td>
                        <td className="px-4 py-2 text-[#141414] tabular-nums">
                          {row.browser_ms ? `${(Number(row.browser_ms) / 1000).toFixed(1)}s` : '—'}
                        </td>
                        <td className="px-4 py-2 text-[#6E6A63]">{clientName}</td>
                        <td className="px-4 py-2 text-[#6E6A63]">
                          {new Date(row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ConsoleShell>
  )
}
