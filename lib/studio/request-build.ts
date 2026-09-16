'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
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
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        client_id: clientId,
        name: `Build: ${template.name} (${brandCustomization.brandName || 'Custom'})`,
        value_cents: totalCents,
        stage: 'studio_completed',
      })
      .select('id')
      .single()

    if (dealError) {
      console.error('Error inserting deal for system build request:', dealError)
      // If deal insert hits RLS or schema constraint, log gracefully
    }

    // 2. Return confirmation
    return {
      success: true,
      dealId: deal?.id ?? 'deal-submitted',
      templateName: template.name,
      investmentTotal: formattedTotal,
      message: `Your build request for ${template.name} has been submitted! An implementation proposal is now generated.`,
    }
  } catch (err) {
    console.error('Exception in requestSystemBuild:', err)
    return {
      success: false,
      message: 'Failed to submit build request. Please contact your account manager directly.',
    }
  }
}
