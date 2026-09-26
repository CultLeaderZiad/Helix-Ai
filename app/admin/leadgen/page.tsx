import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, DataTable, EmptyState, PageHead, Panel, Stat } from '@/components/admin/v5'
import { getCurrentUsage, getEngineCaps, getUTCUsagePeriods } from '@/lib/leadgen/engines/usage'

export const metadata = {
  title: 'HELIX AI: Lead Gen Engine Usage & Soft Caps',
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
      <AdminFrame>
        <PageHead
          title="Lead generation usage"
          titleAr="استخدام توليد العملاء"
          lede={`Soft caps for browser time and unlocker requests. UTC ${periods.todayDate}.`}
          ledeAr="حدود زمن المتصفح وطلبات الفتح."
          actions={
            <Link className="hx-admin-btn" href="/dashboard/lead-generation">
              Open lead generation
            </Link>
          }
        />

        <div className="hx-admin-stats">
          <Stat
            label="Engine"
            labelAr="المحرك"
            value={isBuiltinActive ? 'Built-in' : 'External worker'}
            hint={isBuiltinActive ? 'Runs inside the app process.' : 'A separate worker claims jobs.'}
          />
          <Stat
            label="Browser time today"
            labelAr="زمن المتصفح اليوم"
            value={`${usageStats.browserSecondsUsed}s`}
            hint={`${browserSecondsRemaining}s left of ${caps.browserDailySecondsCap}s`}
            hintAr={`${browserSecondsRemaining} ثانية متبقية`}
          />
          <Stat
            label={`Unlocker · ${periods.currentMonth}`}
            labelAr="طلبات الفتح هذا الشهر"
            value={usageStats.stealthMonthUsed}
            hint={`${stealthRemaining} left of ${caps.stealthMonthlyCap}`}
            hintAr={`${stealthRemaining} متبقية`}
          />
        </div>

        <Panel title="Usage rows" titleAr="صفوف الاستخدام">
          {rows.length === 0 ? (
            <EmptyState
              title="No engine usage recorded yet"
              titleAr="لا استخدام مسجّل بعد"
              body="Lead generation jobs write a row here when they run."
              bodyAr="تُكتب الصفوف عند تشغيل مهام توليد العملاء."
            />
          ) : (
            <DataTable
              columns={[
                { key: 'date', label: 'Date (UTC)' },
                { key: 'month', label: 'Month' },
                { key: 'engine', label: 'Engine' },
                { key: 'requests', label: 'Requests' },
                { key: 'browser', label: 'Browser time' },
                { key: 'client', label: 'Workspace' },
                { key: 'updated', label: 'Updated' },
              ]}
            >
              {rows.map(row => {
                const clientName =
                  // @ts-expect-error join type
                  row.clients?.business_name || (row.client_id ? row.client_id.slice(0, 8) : 'System')
                return (
                  <tr key={row.id}>
                    <td>{row.usage_date}</td>
                    <td>{row.usage_month}</td>
                    <td>{row.engine}</td>
                    <td>{row.requests}</td>
                    <td>{row.browser_ms ? `${(Number(row.browser_ms) / 1000).toFixed(1)}s` : '-'}</td>
                    <td>{clientName}</td>
                    <td>{new Date(row.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                )
              })}
            </DataTable>
          )}
        </Panel>
      </AdminFrame>
    </ConsoleShell>
  )
}
