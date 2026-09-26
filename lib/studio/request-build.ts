'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { SYSTEM_TEMPLATES } from '@/lib/studio/templates'

export interface RequestBuildResult {
  success: boolean
  message: string
  dealId?: string
  templateName?: string
  investmentTotal?: string
}

export async function requestSystemBuild(
  templateId: string,
  brandCustomization: {
    brandName: string
    accentColor: string
    themeVariant: string
  }
): Promise<RequestBuildResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return { success: false, message: 'Authentication required to submit build request.' }
    }

    const template = SYSTEM_TEMPLATES.find(t => t.id === templateId)
    if (!template) {
      return { success: false, message: 'Invalid system template selected.' }
    }

    let clientId = session.claims.client_id

    if (!clientId) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()
      clientId = existingClient?.id ?? null
    }

    if (!clientId) {
      return { success: false, message: 'Client workspace not identified. Please ensure a client is provisioned.' }
    }

    const totalCents = template.setupFeeCents + template.monthlyRetainerCents
    const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(
      totalCents / 100
    )

    // 1. Insert Deal into Supabase
    const dealRow = {
      client_id: clientId,
      name: `Build: ${template.name} (${brandCustomization.brandName || 'Custom'})`,
      value_cents: totalCents,
      stage: 'QUALIFIED_TO_BUY',
      source: 'studio_request',
    }
    let dealId: string | null = null
    let dealErrorMessage: string | null = null
    const userInsert = await supabase.from('deals').insert(dealRow).select('id').maybeSingle()
    if (userInsert.error || !userInsert.data) {
      try {
        const admin = createSupabaseAdminClient()
        const adminInsert = await admin.from('deals').insert(dealRow).select('id').maybeSingle()
        dealId = adminInsert.data?.id ?? null
        dealErrorMessage = adminInsert.error?.message ?? null
      } catch {
        dealErrorMessage = userInsert.error?.message ?? 'Deal insert failed.'
      }
    } else {
      dealId = userInsert.data.id
    }

    if (!dealId) {
      return {
        success: false,
        message: `The build request was not saved. ${dealErrorMessage || 'The deals table rejected the row.'}`,
      }
    }

    return {
      success: true,
      dealId,
      templateName: template.name,
      investmentTotal: formattedTotal,
      message: `Build request for ${template.name} was saved as a deal. No proposal was emailed.`,
    }
  } catch (err) {
    console.error('Exception in requestSystemBuild:', err)
    return {
      success: false,
      message: 'Failed to submit build request. Please contact your account manager directly.',
    }
  }
}
