'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { buildBespokeProposal, type ProposalDocument } from '@/lib/proposals/generator'
import type { RegionTier } from '@/lib/schema'

export interface GenerateProposalResult {
  success: boolean
  message: string
  proposal?: ProposalDocument
}

export async function generateProposalAction(dealId: string): Promise<GenerateProposalResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return { success: false, message: 'Authentication required to generate proposals.' }
    }

    // 1. Fetch deal record
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .maybeSingle()

    if (dealError || !deal) {
      return { success: false, message: 'Deal not found.' }
    }

    // 2. Fetch client details
    const { data: client } = await supabase
      .from('clients')
      .select('id, business_name, region_tier, country')
      .eq('id', deal.client_id)
      .maybeSingle()

    const regionTier: RegionTier = (client?.region_tier as RegionTier) || 'gcc_enterprise'
    const currency = deal.currency || (regionTier === 'gcc_enterprise' ? 'AED' : 'USD')

    const proposalId = `prop_${deal.id.slice(0, 8)}_${Date.now().toString(36)}`
    const setupFeeCents = (deal.custom_fields?.setup_fee_cents as number) || Math.round(deal.value_cents * 0.7)
    const monthlyRetainerCents =
      (deal.custom_fields?.monthly_retainer_cents as number) || Math.round(deal.value_cents * 0.3)

    // 3. Build bespoke proposal document
    const proposal = buildBespokeProposal({
      proposalId,
      dealId: deal.id,
      clientId: deal.client_id,
      clientBusinessName: client?.business_name || 'Client Workspace',
      brandName: deal.name.replace(/^Build:\s*/, '').replace(/^AI Engine:\s*/, ''),
      regionTier,
      currency,
      setupFeeCents,
      monthlyRetainerCents,
    })

    // 4. Update deal stage to 'proposal_sent' and store proposal document in custom_fields
    const updatedCustomFields = {
      ...(deal.custom_fields || {}),
      proposal_id: proposalId,
      proposal_sent_at: new Date().toISOString(),
      proposal_document: proposal,
    }

    const { error: updateError } = await supabase
      .from('deals')
      .update({
        stage: 'CONTRACT_SENT',
        custom_fields: updatedCustomFields,
      })
      .eq('id', deal.id)

    if (updateError) {
      return { success: false, message: `The proposal was built but the deal was not updated. ${updateError.message}` }
    }

    const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const { error: invoiceError } = await supabase.from('invoices').insert({
      client_id: deal.client_id,
      amount_cents: proposal.totalSetupCents,
      due_date: dueDate,
      status: 'pending',
    })

    // 6. Record activity timeline entry
    await supabase.from('activities').insert({
      client_id: deal.client_id,
      deal_id: deal.id,
      type: 'stage_change',
      body: `Proposal saved on the deal (${proposal.currency} ${(proposal.totalFirstMonthCents / 100).toLocaleString()}). Stage set to CONTRACT_SENT. ${invoiceError ? 'Invoice was not created.' : 'A pending invoice row was created.'}`,
    })

    return {
      success: true,
      message: invoiceError
        ? 'Proposal saved on the deal. The invoice row was not created.'
        : 'Proposal saved on the deal and a pending invoice row was created. Nothing was emailed.',
      proposal,
    }
  } catch (err) {
    console.error('generateProposalAction error:', err)
    return {
      success: false,
      message: 'Failed to generate proposal. Please retry.',
    }
  }
}
