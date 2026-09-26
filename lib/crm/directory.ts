export interface DirectoryContact {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  lead_status: string | null
  created_at: string
  updated_at: string | null
  client_id?: string | null
}

export interface DirectoryDealLink {
  contact_id: string
  stage: string | null
  value_cents: number | null
  updated_at: string | null
}

export interface DirectoryFact {
  contact_id: string
  evidence_band: string | null
  status: string | null
}

export interface DirectoryActivity {
  id?: string
  contact_id: string | null
  occurred_at: string | null
  type?: string | null
  body?: string | null
  subject?: string | null
}

export interface DirectoryContactRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  lead_status: string
  created_at: string
  deal_stage: string | null
  deal_value_cents: number | null
  last_activity: string | null
  last_activity_type: string | null
  fact_status: 'verified' | 'probable' | 'possible' | null
}

function factRank(band: string | null, status: string | null): number {
  if (status === 'pending') return 4
  if (band === 'verified' || status === 'applied') return 3
  if (band === 'probable') return 2
  if (band === 'possible') return 1
  return 0
}

function factStatus(band: string | null, status: string | null): DirectoryContactRow['fact_status'] {
  if (status === 'dismissed' || status === 'superseded') return null
  if (band === 'verified' || band === 'probable' || band === 'possible') return band
  return null
}

/**
 * Join real contacts to real deals, facts, and activities.
 * Missing relations stay null. Nothing is invented.
 */
export function mapDirectoryContacts(input: {
  contacts: DirectoryContact[]
  dealLinks: DirectoryDealLink[]
  facts: DirectoryFact[]
  activities: DirectoryActivity[]
  workspaceNameByClientId?: ReadonlyMap<string, string>
}): DirectoryContactRow[] {
  const dealsByContact = new Map<string, DirectoryDealLink>()
  for (const link of input.dealLinks) {
    const current = dealsByContact.get(link.contact_id)
    if (!current) {
      dealsByContact.set(link.contact_id, link)
      continue
    }
    const currentTs = current.updated_at ? Date.parse(current.updated_at) : 0
    const nextTs = link.updated_at ? Date.parse(link.updated_at) : 0
    if (nextTs >= currentTs) dealsByContact.set(link.contact_id, link)
  }

  const factsByContact = new Map<string, DirectoryFact>()
  for (const fact of input.facts) {
    const current = factsByContact.get(fact.contact_id)
    if (!current || factRank(fact.evidence_band, fact.status) > factRank(current.evidence_band, current.status)) {
      factsByContact.set(fact.contact_id, fact)
    }
  }

  const activityByContact = new Map<string, DirectoryActivity>()
  for (const activity of input.activities) {
    if (!activity.contact_id) continue
    const current = activityByContact.get(activity.contact_id)
    const nextTs = activity.occurred_at ? Date.parse(activity.occurred_at) : 0
    const currentTs = current?.occurred_at ? Date.parse(current.occurred_at) : 0
    if (!current || nextTs >= currentTs) activityByContact.set(activity.contact_id, activity)
  }

  return input.contacts.map(contact => {
    const deal = dealsByContact.get(contact.id)
    const fact = factsByContact.get(contact.id)
    const activity = activityByContact.get(contact.id)
    const workspaceName = contact.client_id
      ? input.workspaceNameByClientId?.get(contact.client_id)
      : undefined
    return {
      id: contact.id,
      full_name: contact.full_name,
      email: contact.email,
      phone: contact.phone,
      company_name: contact.company_name || workspaceName || null,
      lead_status: contact.lead_status || 'cold',
      created_at: contact.created_at,
      deal_stage: deal?.stage ?? null,
      deal_value_cents: deal?.value_cents ?? null,
      last_activity: activity?.occurred_at ?? contact.updated_at,
      last_activity_type: activity?.type ?? null,
      fact_status: fact ? factStatus(fact.evidence_band, fact.status) : null,
    }
  })
}

export function sumDealValueCents(deals: Array<{ value_cents: number | null }>): number {
  return deals.reduce((sum, deal) => sum + (deal.value_cents ?? 0), 0)
}
