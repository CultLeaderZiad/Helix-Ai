import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { DataTable, EmptyState, KpiCard, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix — Billing',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!
  const [clientRes, invoicesRes, billingRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('invoices').select('id, amount_cents, due_date, status, created_at').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('billing_accounts').select('*').eq('client_id', clientId).maybeSingle(),
  ])

  const billing = (billingRes.data ?? null) as Record<string, unknown> | null
  const retainerRaw = billing?.monthly_retainer_cents ?? billing?.retainer_cents
  const retainerCents = typeof retainerRaw === 'number' ? retainerRaw : null
  const currency = typeof billing?.currency === 'string' ? billing.currency : 'USD'
  const money = (cents: number) => new Intl.NumberFormat(lang === 'ar' ? 'ar' : 'en', { style: 'currency', currency }).format(cents / 100)
  const invoices = invoicesRes.data ?? []
  const statusLabel = (status: string) => {
    const key = status.toLowerCase()
    if (key === 'paid') return tx(lang, 'Paid', 'مدفوعة')
    if (key === 'overdue') return tx(lang, 'Overdue', 'متأخرة')
    if (key === 'pending') return tx(lang, 'Due', 'مستحقة')
    if (key === 'disputed') return tx(lang, 'In review', 'قيد المراجعة')
    return status
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={clientRes.data?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Billing', 'الفوترة')}
        lede={tx(lang, 'Your plan and the invoices on file. Payments are not taken on this page.', 'خطتك والفواتير المسجّلة. لا يتم تحصيل الدفع من هذه الصفحة.')}
        actions={<Link className="btn-o" href="/dashboard/reports">{tx(lang, 'Report', 'تقرير')}</Link>}
      />
      <div className="kpis">
        <KpiCard
          label={tx(lang, 'Monthly plan', 'الخطة الشهرية')}
          value={retainerCents == null ? '—' : money(retainerCents)}
          hint={retainerCents == null ? tx(lang, 'Not on file', 'غير مسجّل') : currency}
        />
        <KpiCard label={tx(lang, 'Invoices on file', 'فواتير مسجّلة')} value={String(invoices.length)} hint={tx(lang, 'No payment page is connected', 'لا توجد صفحة دفع موصولة')} />
      </div>
      <div className="stack">
        <Panel title={tx(lang, 'Invoices', 'الفواتير')}>
          {invoicesRes.error ? (
            <p className="muted">{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</p>
          ) : (
            <DataTable
              rows={invoices}
              rowKey={row => row.id}
              empty={<EmptyState title={tx(lang, 'No invoices yet.', 'لا توجد فواتير بعد.')} />}
              columns={[
                { key: 'date', header: tx(lang, 'Date', 'التاريخ'), render: row => new Date(row.created_at || row.due_date).toLocaleDateString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium' }) },
                { key: 'amount', header: tx(lang, 'Amount', 'المبلغ'), render: row => <bdi dir="ltr">{money(row.amount_cents ?? 0)}</bdi> },
                { key: 'status', header: tx(lang, 'Status', 'الحالة'), render: row => <StatusChip tone={row.status === 'paid' ? 'ok' : row.status === 'overdue' ? 'warn' : 'neutral'}>{statusLabel(row.status)}</StatusChip> },
              ]}
            />
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
