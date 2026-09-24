import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { WholeCrmView, type CrmContactRow } from '@/components/crm/whole-crm-view'

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

  // Fetch real client workspace info and CRM data
  const [clientRes, contactsRes, dealsRes, factsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('contacts').select('*').eq('client_id', clientId).order('created_at', { ascending: false }),
    supabase.from('deals').select('value_cents, stage').eq('client_id', clientId),
    supabase.from('contact_facts').select('id, evidence_band, status').eq('client_id', clientId),
  ])

  const client = clientRes.data
  const realContacts = contactsRes.data ?? []
  const realDeals = dealsRes.data ?? []
  const realFacts = factsRes.data ?? []

  // Map real contacts — empty workspace = empty array (no fake humans)
  const contacts: CrmContactRow[] = realContacts.map(c => ({
    id: c.id,
    full_name: c.full_name,
    email: c.email,
    phone: c.phone,
    company_name: c.company_name,
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
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <WholeCrmView
        clientId={clientId}
        contacts={contacts}
        totalContacts={totalContacts}
        pipelineValueCents={pipelineValueCents}
        verifiedFactCount={verifiedFactCount}
        totalFactCount={totalFactCount}
      />
    </ConsoleShell>
  )
}
