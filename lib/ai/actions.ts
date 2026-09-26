'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import {
  generateEngineRecommendation,
  type AssessmentInput,
  type RecommendationResult,
} from '@/lib/ai/engine'

export interface EngineActionResult {
  success: boolean
  message: string
  recommendation?: RecommendationResult
  dealId?: string
}

export async function evaluateProspectAndSaveDeal(
  input: AssessmentInput
): Promise<EngineActionResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)

    if (!session) {
      return { success: false, message: 'Authentication required to evaluate architecture.' }
    }

    let clientId = session.claims.client_id

    // If session is agency_admin (which has client_id: null) or client_id is unassigned,
    // resolve to the active client workspace or auto-provision one.
    if (!clientId) {
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .order('created_at', { ascending: true })
        .limit(1)
        .maybeSingle()

      if (existingClient?.id) {
        clientId = existingClient.id
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({
            business_name: input.businessName || 'Default Workspace',
            status: 'active',
          })
          .select('id')
          .maybeSingle()
        clientId = newClient?.id ?? null
      }
    }

    // 1. Generate recommendation (Groq or deterministic matrix)
    const recommendation = await generateEngineRecommendation(input)

    if (!clientId) {
      // If database workspace could still not be provisioned, return the recommendation successfully
      return {
        success: true,
        message: 'Architecture evaluated successfully (evaluation preview mode).',
        recommendation,
      }
    }

    // 2. Insert or update contact in CRM
    const { data: contact } = await supabase
      .from('contacts')
      .insert({
        client_id: clientId,
        full_name: input.contactName,
        email: input.email,
        phone: input.phone,
        company_name: input.businessName,
        lead_status: 'warm',
        custom_fields: {
          vertical: input.vertical,
          monthly_call_volume: input.monthlyCallVolume,
          primary_pain_point: input.primaryPainPoint,
          recommended_system: recommendation.systemId,
          match_score: recommendation.matchScore,
        },
      })
      .select('id')
      .maybeSingle()

    // 3. Insert Deal with stage 'studio_completed'
    const totalCents = recommendation.setupFeeCents + recommendation.monthlyRetainerCents
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .insert({
        client_id: clientId,
        name: `AI Engine: ${recommendation.systemName} (${input.businessName})`,
        value_cents: totalCents,
        currency: recommendation.currency,
        stage: 'QUALIFIED_TO_BUY',
        source: 'ai_engine_assessment',
        custom_fields: {
          system_id: recommendation.systemId,
          match_score: recommendation.matchScore,
          monthly_roi: recommendation.estimatedMonthlyRoi,
          setup_fee_cents: recommendation.setupFeeCents,
          monthly_retainer_cents: recommendation.monthlyRetainerCents,
          contact_id: contact?.id ?? null,
        },
      })
      .select('id')
      .single()

    if (dealError || !deal) {
      return {
        success: false,
        message: `The recommendation was calculated, but the deal was not saved. ${dealError?.message || 'No deal id was returned.'}`,
        recommendation,
      }
    }

    // 4. Log activity record
    await supabase.from('activities').insert({
      client_id: clientId,
      contact_id: contact?.id ?? null,
      deal_id: deal?.id ?? null,
      type: 'enrichment',
      body: `Engine recommendation: ${recommendation.systemName}. Match: ${recommendation.matchScore}%.`,
    })

    return {
      success: true,
      message: contact
        ? 'Assessment saved as a contact and a deal. The match score is not a measured probability.'
        : 'Deal saved. The contact row was not created. The match score is not a measured probability.',
      recommendation,
      dealId: deal?.id,
    }
  } catch (err) {
    console.error('evaluateProspectAndSaveDeal error:', err)
    return {
      success: false,
      message: 'Failed to process AI engine assessment. Please try again.',
    }
  }
}
