import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { WholeCrmView } from '@/components/crm/whole-crm-view'
import { mapDirectoryContacts, sumDealValueCents, type DirectoryActivity } from '@/lib/crm/directory'

export const metadata = {
  title: 'Helix AI — Whole CRM',
  robots: { index: false, follow: false },
}

export default async function WholeCrmPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/crm')

  const clientId = session.claims.client_id!
  const [clientRes, contactsRes, dealsRes, linksRes, factsRes, activitiesRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('contacts').select('id, full_name, email, phone, company_name, lead_status, created_at, updated_at, client_id').eq('client_id', clientId).order('created_at', { ascending: false }),
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
  const contacts = mapDirectoryContacts({
    contacts: contactsRes.data ?? [],
    dealLinks,
    facts: factsRes.data ?? [],
    activities,
  })
  const verifiedFactCount = (factsRes.data ?? []).filter(fact => fact.evidence_band === 'verified' || fact.status === 'applied').length

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={clientRes.data?.business_name ?? null}>
      <WholeCrmView
        contacts={contacts}
        totalContacts={contacts.length}
        pipelineValueCents={sumDealValueCents(deals)}
        verifiedFactCount={verifiedFactCount}
        totalFactCount={(factsRes.data ?? []).length}
        activities={activities}
        allowCreate
      />
    </ConsoleShell>
  )
}
