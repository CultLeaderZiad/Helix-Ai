'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import {
  getPricingConfigs,
  updatePlan,
  deletePlan,
  updateTierHeader,
  resetPricingToDefaults,
} from './pricing-store'
import type { PricingPlan } from './tiers'
import type { RegionTier } from '@/lib/schema'

export async function getPricingAction() {
  return getPricingConfigs()
}

export async function savePlanAction(tier: RegionTier, plan: PricingPlan) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const ok = updatePlan(tier, plan)
  if (!ok) {
    return { success: false, error: 'Failed to save pricing plan.' }
  }

  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function deletePlanAction(tier: RegionTier, planId: string) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const ok = deletePlan(tier, planId)
  if (!ok) {
    return { success: false, error: 'Failed to delete plan.' }
  }

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
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const ok = updateTierHeader(tier, data)
  if (!ok) {
    return { success: false, error: 'Failed to update tier header details.' }
  }

  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}

export async function resetPricingAction() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const ok = resetPricingToDefaults()
  if (!ok) {
    return { success: false, error: 'Failed to reset pricing.' }
  }

  revalidatePath('/pricing')
  revalidatePath('/admin/pricing')
  return { success: true }
}
