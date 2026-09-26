import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, PageHead } from '@/components/admin/v5'
import { WholeCrmView } from '@/components/crm/whole-crm-view'
import { mapDirectoryContacts, sumDealValueCents, type DirectoryActivity } from '@/lib/crm/directory'

export const metadata = {
  title: 'Helix AI — Cross-Client CRM',
  robots: { index: false, follow: false },
}

export default async function AdminCrossClientCrmPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/crm')

  const [clientsRes, contactsRes, dealsRes, linksRes, factsRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('id, business_name'),
    supabase.from('contacts').select('id, full_name, email, phone, company_name, lead_status, created_at, updated_at, client_id').order('created_at', { ascending: false }),
    supabase.from('deals').select('id, value_cents, stage, updated_at'),
    supabase.from('deal_contacts').select('contact_id, deal_id'),
    supabase.from('contact_facts').select('contact_id, evidence_band, status'),
    supabase.from('activities').select('id, contact_id, type, body, subject, occurred_at').order('occurred_at', { ascending: false }).limit(100),
  ])

  const workspaceNameByClientId = new Map((clientsRes.data ?? []).map(client => [client.id, client.business_name as string]))
  const deals = dealsRes.data ?? []
  const dealById = new Map(deals.map(deal => [deal.id, deal]))
  const dealLinks = (linksRes.data ?? []).flatMap(link => {
    const deal = dealById.get(link.deal_id)
    if (!deal) return []
    return [{ contact_id: link.contact_id, stage: deal.stage, value_cents: deal.value_cents, updated_at: deal.updated_at }]
  })
  const activities = (activitiesRes.data ?? []) as DirectoryActivity[]
  const contacts = mapDirectoryContacts({
    contacts: contactsRes.data ?? [],
    dealLinks,
    facts: factsRes.data ?? [],
    activities,
    workspaceNameByClientId,
  })
  const verifiedFactCount = (factsRes.data ?? []).filter(fact => fact.evidence_band === 'verified' || fact.status === 'applied').length

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
      <PageHead
        title="Pipeline"
        titleAr="المسار"
        lede="Contacts and deals across workspaces."
        ledeAr="جهات الاتصال والصفقات عبر مساحات العمل."
      />
      <WholeCrmView
        contacts={contacts}
        totalContacts={contacts.length}
        pipelineValueCents={sumDealValueCents(deals)}
        verifiedFactCount={verifiedFactCount}
        totalFactCount={(factsRes.data ?? []).length}
        activities={activities}
      />
      </AdminFrame>
    </ConsoleShell>
  )
}
