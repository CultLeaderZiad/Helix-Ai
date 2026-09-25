import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface TenantLeadMatch {
  id: string
  company_name: string | null
  website: string | null
  domain: string | null
  lead_score: number
  origin?: string
}

/**
 * Searches the tenant's existing saved leadgen_leads to highlight existing relationships.
 */
export async function searchHelixLeadsDb(
  clientId: string,
  query: string,
  limit = 5
): Promise<TenantLeadMatch[]> {
  if (!clientId || !query.trim()) return []

  const supabase = createSupabaseAdminClient()
  const cleanQ = query.trim()

  try {
    const { data: matches, error } = await (supabase as any)
      .from('leadgen_leads')
      .select('id, company_name, website, domain, lead_score, origin')
      .eq('client_id', clientId)
      .or(`company_name.ilike.%${cleanQ}%,domain.ilike.%${cleanQ}%,description.ilike.%${cleanQ}%`)
      .order('lead_score', { ascending: false })
      .limit(limit)

    if (error || !matches) return []
    return matches
  } catch {
    return []
  }
}
