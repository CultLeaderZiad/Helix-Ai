import fs from 'fs'
import path from 'path'
import { REGIONAL_PRICING_CONFIGS, type PricingPlan, type RegionPricingConfig } from './tiers'
import type { RegionTier } from '@/lib/schema'

const PRICING_FILE_PATH = path.join(process.cwd(), 'data', 'pricing.json')

export function getPricingConfigs(): Record<RegionTier, RegionPricingConfig> {
  try {
    if (!fs.existsSync(PRICING_FILE_PATH)) {
      savePricingConfigs(REGIONAL_PRICING_CONFIGS)
      return REGIONAL_PRICING_CONFIGS
    }
    const raw = fs.readFileSync(PRICING_FILE_PATH, 'utf-8')
    const parsed = JSON.parse(raw)
    return {
      gcc_enterprise: parsed.gcc_enterprise || REGIONAL_PRICING_CONFIGS.gcc_enterprise,
      mena_sme: parsed.mena_sme || REGIONAL_PRICING_CONFIGS.mena_sme,
    }
  } catch (error) {
    console.error('Failed to read pricing.json:', error)
    return REGIONAL_PRICING_CONFIGS
  }
}

export function savePricingConfigs(configs: Record<RegionTier, RegionPricingConfig>): boolean {
  try {
    const dir = path.dirname(PRICING_FILE_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(PRICING_FILE_PATH, JSON.stringify(configs, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('Failed to write pricing.json:', error)
    return false
  }
}

export function updatePlan(tier: RegionTier, updatedPlan: PricingPlan): boolean {
  const configs = getPricingConfigs()
  const currentPlans = configs[tier]?.plans || []
  const index = currentPlans.findIndex((p) => p.id === updatedPlan.id)

  if (index >= 0) {
    currentPlans[index] = updatedPlan
  } else {
    currentPlans.push(updatedPlan)
  }

  configs[tier].plans = currentPlans
  return savePricingConfigs(configs)
}

export function deletePlan(tier: RegionTier, planId: string): boolean {
  const configs = getPricingConfigs()
  const currentPlans = configs[tier]?.plans || []
  configs[tier].plans = currentPlans.filter((p) => p.id !== planId)
  return savePricingConfigs(configs)
}

export function updateTierHeader(
  tier: RegionTier,
  headerData: {
    badge: string
    badgeAr: string
    description: string
    descriptionAr: string
    defaultCurrency?: 'AED' | 'USD' | 'EGP' | 'SAR' | 'JOD'
  }
): boolean {
  const configs = getPricingConfigs()
  if (!configs[tier]) return false

  configs[tier].badge = headerData.badge
  configs[tier].badgeAr = headerData.badgeAr
  configs[tier].description = headerData.description
  configs[tier].descriptionAr = headerData.descriptionAr
  if (headerData.defaultCurrency) {
    configs[tier].defaultCurrency = headerData.defaultCurrency
  }

  return savePricingConfigs(configs)
}

export function resetPricingToDefaults(): boolean {
  return savePricingConfigs(REGIONAL_PRICING_CONFIGS)
}
