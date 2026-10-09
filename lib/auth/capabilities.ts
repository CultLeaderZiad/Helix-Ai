import { getClientEntitlements } from '@/lib/billing/entitlements'

export async function checkCapability(clientId: string, requiredFeature: string): Promise<boolean> {
  const entitlements = await getClientEntitlements(clientId)
  return entitlements.status === 'active' && entitlements.features.includes(requiredFeature)
}

export async function getCapabilities(clientId: string): Promise<string[]> {
  const entitlements = await getClientEntitlements(clientId)
  if (entitlements.status !== 'active') {
    return []
  }
  return entitlements.features
}
