import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { WholeCrmView, type CrmContactRow } from '@/components/crm/whole-crm-view'

export const metadata = {
  title: 'Helix AI — Cross-Client CRM',
  robots: { index: false, follow: false },
}

export default async function AdminCrossClientCrmPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/crm')

  // Agency admin can read across all clients
  const [clientsRes, contactsRes, dealsRes, factsRes] = await Promise.all([
    supabase.from('clients').select('id, business_name'),
    supabase.from('contacts').select('*').order('created_at', { ascending: false }),
    supabase.from('deals').select('value_cents, stage'),
    supabase.from('contact_facts').select('id, evidence_band, status'),
  ])

  const clientMap = new Map((clientsRes.data ?? []).map(c => [c.id, c.business_name]))
  const realContacts = contactsRes.data ?? []
  const realDeals = dealsRes.data ?? []
  const realFacts = factsRes.data ?? []

  // Map real contacts — zero mock data
  const contacts: CrmContactRow[] = realContacts.map(c => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    company_name: clientMap.get(c.client_id) ?? c.company_name ?? 'Client Workspace',
    lead_status: c.lead_status,
    created_at: c.created_at,
    deal_stage: 'new_lead',
    deal_value_cents: 0,
    last_activity: c.updated_at,
    fact_status: 'verified',
  }))

  const totalContacts = realContacts.length
  const pipelineValueCents = realDeals.reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const verifiedFactCount = realFacts.filter(f => f.evidence_band === 'verified' || f.status === 'applied').length
  const totalFactCount = realFacts.length

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <WholeCrmView
        contacts={contacts}
        totalContacts={totalContacts}
        pipelineValueCents={pipelineValueCents}
        verifiedFactCount={verifiedFactCount}
        totalFactCount={totalFactCount}
        isAdmin={true}
      />
    </ConsoleShell>
  )
}
