import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { COMMERCIAL_CATALOG } from './catalog'

export interface ClientEntitlements {
  clientId: string
  planTier: string
  status: string
  features: string[]
  apiRequestsPerMinute: number
  maxConcurrentTasks: number
}

export async function getClientEntitlements(clientId: string): Promise<ClientEntitlements> {
  const supabase = createSupabaseAdminClient()
  
  const { data: entitlement, error } = await supabase
    .from('ai_entitlements')
    .select('plan_tier, status, features')
    .eq('client_id', clientId)
    .maybeSingle()
    
  if (error || !entitlement || entitlement.status !== 'active') {
    // Return free tier if inactive or not found
    return {
      clientId,
      planTier: 'free',
      status: 'inactive',
      features: [],
      apiRequestsPerMinute: 0,
      maxConcurrentTasks: 0,
    }
  }

  const catalogEntry = COMMERCIAL_CATALOG[entitlement.plan_tier] || COMMERCIAL_CATALOG['free']

  return {
    clientId,
    planTier: entitlement.plan_tier,
    status: entitlement.status,
    features: entitlement.features || [],
    apiRequestsPerMinute: catalogEntry.apiRequestsPerMinute,
    maxConcurrentTasks: catalogEntry.maxConcurrentTasks,
  }
}

export async function hasFeatureEntitlement(clientId: string, feature: string): Promise<boolean> {
  const entitlements = await getClientEntitlements(clientId)
  return entitlements.status === 'active' && entitlements.features.includes(feature)
}
