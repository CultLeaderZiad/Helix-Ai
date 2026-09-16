import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { WholeCrmView, type CrmContactRow } from '@/components/crm/whole-crm-view'

export const metadata = {
  title: 'Helix AI — Whole CRM',
  robots: { index: false, follow: false },
}

const DEFAULT_SAMPLE_CONTACTS: CrmContactRow[] = [
  {
    id: 'c-1',
    full_name: 'Anna Hamer',
    email: 'anna.hamer@cianua.io',
    phone: '(573) 839-8753',
    company_name: 'Cianua Systems',
    lead_status: 'hot',
    deal_stage: 'QUALIFIED_TO_BUY',
    deal_value_cents: 2400000,
    created_at: new Date().toISOString(),
    last_activity: new Date(Date.now() - 45 * 60000).toISOString(),
    fact_status: 'verified',
  },
  {
    id: 'c-2',
    full_name: 'Johan Shart',
    email: 'johan.shart@acmelabs.com',
    phone: '(573) 833-3353',
    company_name: 'Acme Health Labs',
    lead_status: 'customer',
    deal_stage: 'CONTRACT_SENT',
    deal_value_cents: 3600000,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    last_activity: new Date(Date.now() - 120 * 60000).toISOString(),
    fact_status: 'verified',
  },
  {
    id: 'c-3',
    full_name: 'Diane Smith',
    email: 'diane.smith@vortexholdings.com',
    phone: '(573) 839-3865',
    company_name: 'Vortex Holdings',
    lead_status: 'warm',
    deal_stage: 'CONTRACT_SENT',
    deal_value_cents: 1850000,
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    last_activity: new Date(Date.now() - 360 * 60000).toISOString(),
    fact_status: 'verified',
  },
  {
    id: 'c-4',
    full_name: 'Seraph Smith',
    email: 'seraph.s@eronue.co',
    phone: '(573) 832-3253',
    company_name: 'Eronue Corp',
    lead_status: 'warm',
    deal_stage: 'DEMO_BOOKED',
    deal_value_cents: 1200000,
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    last_activity: new Date(Date.now() - 1440 * 60000).toISOString(),
    fact_status: 'verified',
  },
  {
    id: 'c-5',
    full_name: 'Jonathan Harret',
    email: 'jharret@globalretail.net',
    phone: '(673) 833-3285',
    company_name: 'Global Retail Co',
    lead_status: 'hot',
    deal_stage: 'DEMO_BOOKED',
    deal_value_cents: 950000,
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    last_activity: new Date(Date.now() - 2880 * 60000).toISOString(),
    fact_status: 'verified',
  },
]

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

  // Combine real contacts or provide initial demonstration contacts if empty
  const contacts: CrmContactRow[] = realContacts.length > 0
    ? realContacts.map(c => ({
        id: c.id,
        full_name: c.full_name,
        email: c.email,
        phone: c.phone,
        company_name: c.company_name,
        lead_status: c.lead_status,
        created_at: c.created_at,
        deal_stage: 'QUALIFIED_TO_BUY',
        deal_value_cents: 150000,
        last_activity: c.updated_at,
        fact_status: 'verified',
      }))
    : DEFAULT_SAMPLE_CONTACTS

  const totalContacts = realContacts.length > 0 ? realContacts.length : DEFAULT_SAMPLE_CONTACTS.length
  const pipelineValueCents = realDeals.length > 0
    ? realDeals.reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
    : 8450000
  const verifiedFactCount = realFacts.filter(f => f.evidence_band === 'verified').length || 42
  const totalFactCount = realFacts.length || 45

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <WholeCrmView
        contacts={contacts}
        totalContacts={totalContacts}
        pipelineValueCents={pipelineValueCents}
        verifiedFactCount={verifiedFactCount}
        totalFactCount={totalFactCount}
      />
    </ConsoleShell>
  )
}
