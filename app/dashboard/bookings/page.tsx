import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { DataTable, EmptyState, InlineError, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix — Bookings',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const STATUS_EN: Record<string, string> = {
  booked: 'Booked',
  confirmed: 'Confirmed',
  completed: 'Completed',
  no_show: 'No show',
  cancelled: 'Cancelled',
}
const STATUS_AR: Record<string, string> = {
  booked: 'محجوز',
  confirmed: 'مؤكد',
  completed: 'مكتمل',
  no_show: 'لم يحضر',
  cancelled: 'ملغى',
}

export default async function BookingsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!
  const [clientRes, bookingsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('bookings').select('id, contact_id, scheduled_at, status, created_at').eq('client_id', clientId).order('scheduled_at', { ascending: false }).limit(100),
  ])
  const rows = bookingsRes.data ?? []
  const contactIds = [...new Set(rows.map(row => row.contact_id).filter(Boolean))]
  const contactsRes = contactIds.length
    ? await supabase.from('contacts').select('id, full_name, phone').in('id', contactIds)
    : { data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }
  const contactById = new Map((contactsRes.data ?? []).map(contact => [contact.id, contact]))
  const labels = lang === 'ar' ? STATUS_AR : STATUS_EN

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={clientRes.data?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Bookings', 'الحجوزات')}
        lede={tx(lang, 'Appointments saved for this workspace.', 'المواعيد المحفوظة لمساحة العمل هذه.')}
      />
      <div className="stack">
        <Panel>
          {bookingsRes.error ? (
            <InlineError>{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</InlineError>
          ) : (
            <DataTable
              rows={rows}
              rowKey={row => row.id}
              empty={<EmptyState title={tx(lang, 'No bookings yet.', 'لا توجد حجوزات بعد.')} />}
              columns={[
                {
                  key: 'when',
                  header: tx(lang, 'When', 'الموعد'),
                  render: row => new Date(row.scheduled_at).toLocaleString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' }),
                },
                {
                  key: 'who',
                  header: tx(lang, 'Contact', 'جهة الاتصال'),
                  render: row => {
                    const contact = contactById.get(row.contact_id)
                    if (contact?.full_name) return contact.full_name
                    if (contact?.phone) return <bdi dir="ltr">{contact.phone}</bdi>
                    return tx(lang, 'Not on file', 'غير متوفر')
                  },
                },
                {
                  key: 'status',
                  header: tx(lang, 'Status', 'الحالة'),
                  render: row => <StatusChip tone={row.status === 'cancelled' || row.status === 'no_show' ? 'warn' : 'ok'}>{labels[row.status] || row.status}</StatusChip>,
                },
              ]}
            />
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
