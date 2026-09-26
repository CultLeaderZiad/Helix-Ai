'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { getPricingConfigs, savePricingConfigs } from './pricing-store'
import { loadSiteDocument, persistSiteDocument } from '@/lib/content/site-documents'
import { REGIONAL_PRICING_CONFIGS, type PricingPlan, type RegionPricingConfig } from './tiers'
import type { RegionTier } from '@/lib/schema'

type PricingConfigs = Record<RegionTier, RegionPricingConfig>

async function loadPricing(): Promise<PricingConfigs> {
  const remote = await loadSiteDocument<PricingConfigs>('pricing')
  if (remote?.gcc_enterprise && remote?.mena_sme) return remote
  return getPricingConfigs()
}

async function savePricing(configs: PricingConfigs): Promise<{ ok: boolean; error?: string }> {
  const remote = await persistSiteDocument('pricing', configs)
  if (remote.ok) return remote
  const fileOk = savePricingConfigs(configs)
  if (fileOk && !process.env.VERCEL) return { ok: true }
  return remote
}

async function requireAdmin() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') return false
  return true
}

export async function getPricingAction() {
  return loadPricing()
}

export async function savePlanAction(tier: RegionTier, plan: PricingPlan) {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized. Admin access required.' }
  const configs = await loadPricing()
  const plans = configs[tier]?.plans || []
  const index = plans.findIndex(item => item.id === plan.id)
  if (index >= 0) plans[index] = plan
  else plans.push(plan)
  configs[tier].plans = plans
  const saved = await savePricing(configs)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to save pricing plan.' }
  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function deletePlanAction(tier: RegionTier, planId: string) {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized. Admin access required.' }
  const configs = await loadPricing()
  configs[tier].plans = (configs[tier]?.plans || []).filter(plan => plan.id !== planId)
  const saved = await savePricing(configs)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to delete plan.' }
  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function updateTierHeaderAction(
  tier: RegionTier,
  data: {
    badge: string
    badgeAr: string
    description: string
    descriptionAr: string
    defaultCurrency?: 'AED' | 'USD' | 'EGP' | 'SAR' | 'JOD'
  }
) {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized. Admin access required.' }
  const configs = await loadPricing()
  if (!configs[tier]) return { success: false, error: 'Unknown pricing tier.' }
  configs[tier].badge = data.badge
  configs[tier].badgeAr = data.badgeAr
  configs[tier].description = data.description
  configs[tier].descriptionAr = data.descriptionAr
  if (data.defaultCurrency) configs[tier].defaultCurrency = data.defaultCurrency
  const saved = await savePricing(configs)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to update tier header details.' }
  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function resetPricingAction() {
  if (!(await requireAdmin())) return { success: false, error: 'Unauthorized. Admin access required.' }
  const saved = await savePricing(REGIONAL_PRICING_CONFIGS)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to reset pricing.' }
  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}
