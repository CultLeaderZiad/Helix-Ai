'use server'

import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { SAMPLE_VERTICAL, SAMPLE_WORKSPACE_NAME } from '@/lib/admin/sample'

export interface SeedDemoResult {
  success: boolean
  message: string
}

export async function seedDemoWorkspace(): Promise<SeedDemoResult> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return { success: false, message: 'Sign in as an agency admin to seed a sample workspace.' }
    }
    if (session.claims.role !== 'agency_admin') {
      return { success: false, message: 'Only agency admins can seed a sample workspace.' }
    }

    const existing = await supabase
      .from('clients')
      .select('id, vertical')
      .eq('business_name', SAMPLE_WORKSPACE_NAME)
      .limit(1)
      .maybeSingle()

    if (existing.data?.id) {
      return {
        success: true,
        message: 'A sample workspace is already on the roster. It is labeled Sample, not live.',
      }
    }

    const fullInsert = await supabase
      .from('clients')
      .insert({
        business_name: SAMPLE_WORKSPACE_NAME,
        vertical: SAMPLE_VERTICAL,
        status: 'onboarding',
        country: 'AE',
        region_tier: 'gcc_enterprise',
      })
      .select('id')
      .maybeSingle()

    let clientId = fullInsert.data?.id ?? null

    if (!clientId && fullInsert.error) {
      const coreInsert = await supabase
        .from('clients')
        .insert({
          business_name: SAMPLE_WORKSPACE_NAME,
          vertical: SAMPLE_VERTICAL,
          status: 'onboarding',
        })
        .select('id')
        .maybeSingle()
      clientId = coreInsert.data?.id ?? null
      if (!clientId) {
        return {
          success: false,
          message: coreInsert.error?.message || fullInsert.error.message || 'Could not create the sample workspace.',
        }
      }
    }

    if (!clientId) {
      return { success: false, message: 'Could not create the sample workspace.' }
    }

    await Promise.allSettled([
      supabase.from('client_systems').insert([
        {
          client_id: clientId,
          system_type: 'booking_receptionist',
          active: false,
          visible_to_client: false,
          provenance: 'template',
          config: { sample: true },
        },
      ]),
      supabase.from('deals').insert({
        client_id: clientId,
        name: 'Sample · Booking receptionist evaluation',
        value_cents: 195000,
        stage: 'engaged',
        source: 'sample_seed',
      }),
    ])

    return {
      success: true,
      message: 'Sample workspace added. It is labeled Sample until you run a live assessment.',
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not seed a sample workspace.'
    return { success: false, message }
  }
}
