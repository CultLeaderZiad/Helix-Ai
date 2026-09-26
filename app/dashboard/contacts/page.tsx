import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { mapDirectoryContacts, type DirectoryActivity } from '@/lib/crm/directory'
import { AddContact } from '@/components/dashboard/add-contact'
import { DataTable, EmptyState, InlineError, PageHead, Panel } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix: Contacts',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function ContactsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/crm')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!
  const [clientRes, contactsRes, dealsRes, linksRes, factsRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('contacts').select('id, full_name, email, phone, company_name, lead_status, source, created_at, updated_at, client_id').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('deals').select('id, value_cents, stage, updated_at').eq('client_id', clientId),
    supabase.from('deal_contacts').select('contact_id, deal_id').eq('client_id', clientId),
    supabase.from('contact_facts').select('contact_id, evidence_band, status').eq('client_id', clientId),
    supabase.from('activities').select('id, contact_id, type, body, subject, occurred_at').eq('client_id', clientId).order('occurred_at', { ascending: false }).limit(50),
  ])

  const deals = dealsRes.data ?? []
  const dealById = new Map(deals.map(deal => [deal.id, deal]))
  const dealLinks = (linksRes.data ?? []).flatMap(link => {
    const deal = dealById.get(link.deal_id)
    if (!deal) return []
    return [{ contact_id: link.contact_id, stage: deal.stage, value_cents: deal.value_cents, updated_at: deal.updated_at }]
  })
  const activities = (activitiesRes.data ?? []) as DirectoryActivity[]
  const rows = mapDirectoryContacts({
    contacts: contactsRes.data ?? [],
    dealLinks,
    facts: factsRes.data ?? [],
    activities,
  })
  const sourceById = new Map((contactsRes.data ?? []).map(contact => [contact.id, (contact as { source?: string | null }).source ?? null]))
  const when = (value: string | null) => value
    ? new Date(value).toLocaleString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' })
    : tx(lang, 'No contact yet', 'لا تواصل بعد')

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={clientRes.data?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Contacts', 'جهات الاتصال')}
        lede={tx(lang, 'People who have reached your workspace.', 'الأشخاص الذين تواصلوا مع مساحة العمل.')}
        actions={<AddContact lang={lang} />}
      />
      <div className="stack">
        <Panel>
          {contactsRes.error ? (
            <InlineError>{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</InlineError>
          ) : (
            <DataTable
              rows={rows}
              rowKey={row => row.id}
              empty={<EmptyState title={tx(lang, 'No contacts yet.', 'لا توجد جهات اتصال بعد.')} body={tx(lang, "They'll appear as customers reach out.", 'ستظهر عند تواصل العملاء.')} />}
              columns={[
                { key: 'name', header: tx(lang, 'Name', 'الاسم'), render: row => row.full_name || row.company_name || tx(lang, 'Unnamed', 'بدون اسم') },
                { key: 'phone', header: tx(lang, 'Phone', 'الهاتف'), render: row => row.phone ? <bdi dir="ltr">{row.phone}</bdi> : tx(lang, 'Not on file', 'غير متوفر') },
                { key: 'source', header: tx(lang, 'Source', 'المصدر'), render: row => sourceById.get(row.id) || tx(lang, 'Not on file', 'غير متوفر') },
                { key: 'last', header: tx(lang, 'Last contact', 'آخر تواصل'), render: row => when(row.last_activity) },
              ]}
            />
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
