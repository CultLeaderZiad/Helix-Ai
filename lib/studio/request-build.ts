'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { SYSTEM_TEMPLATES } from '@/lib/studio/templates'

import { revalidatePath } from 'next/cache'

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
        custom_fields: {
          system_template_id: template.id,
          brand_name: brandCustomization.brandName,
          accent_color: brandCustomization.accentColor,
          theme_variant: brandCustomization.themeVariant,
          setup_fee_cents: template.setupFeeCents,
          monthly_retainer_cents: template.monthlyRetainerCents,
          source: 'system_preview_studio',
        },
      })
      .select('id')
      .single()

    if (dealError) {
      console.error('Error inserting deal for system build request:', dealError)
    }

    const dealId = deal?.id ?? null

    // 2. Write to CRM Activity Timeline
    await supabase.from('activities').insert({
      client_id: clientId,
      deal_id: dealId,
      type: 'stage_change',
      subject: `Studio Build Request: ${template.name}`,
      body: `High-intent build request submitted from Studio for ${brandCustomization.brandName || 'Custom Client'}. Template: ${template.name} (${formattedTotal}). Stage automatically set to studio_completed.`,
    })

    // 3. Register high-priority follow-up task in agent_tasks queue
    await supabase.from('agent_tasks').insert({
      client_id: clientId,
      deal_id: dealId,
      kind: 'apply_contact_fact',
      subject: `Follow-up: Studio Build Request for ${template.name}`,
      reason: `System Studio configuration completed. Prepare implementation scope and contact client within 15 minutes.`,
      priority: 10,
      payload: {
        action: 'studio_build_requested',
        deal_id: dealId,
        template_id: template.id,
        template_name: template.name,
        brand_name: brandCustomization.brandName,
        accent_color: brandCustomization.accentColor,
        total_cents: totalCents,
      },
    })

    // 4. Provision provisional client_system entry
    await supabase.from('client_systems').insert({
      client_id: clientId,
      system_type: template.id,
      provenance: 'template',
      active: false,
      visible_to_client: true,
      config: {
        brand_name: brandCustomization.brandName,
        accent_color: brandCustomization.accentColor,
        theme_variant: brandCustomization.themeVariant,
        requested_at: new Date().toISOString(),
      },
      setup_fee_cents: template.setupFeeCents,
      monthly_retainer_cents: template.monthlyRetainerCents,
    })

    // 5. Revalidate affected console routes
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/crm')
    revalidatePath('/admin')
    revalidatePath('/admin/crm')
    revalidatePath('/admin/studio')

    // 6. Return confirmation
    return {
      success: true,
      dealId: dealId ?? 'deal-submitted',
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
