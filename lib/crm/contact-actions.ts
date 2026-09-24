'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

export interface CreateContactInput {
  clientId?: string | null
  fullName: string
  email?: string | null
  phone?: string | null
  companyName?: string | null
  leadStatus?: string | null
}

export async function createContactAction(input: CreateContactInput) {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session) {
      return { success: false, error: 'Authentication required.' }
    }

    const { role, client_id: sessionClientId } = session.claims

    let targetClientId: string | null = null
    if (role === 'agency_admin') {
      targetClientId = input.clientId || sessionClientId || null
      // If still null, try finding first client
      if (!targetClientId) {
        const { data: c } = await supabase.from('clients').select('id').limit(1).maybeSingle()
        targetClientId = c?.id ?? null
      }
    } else {
      targetClientId = sessionClientId ?? null
    }

    if (!targetClientId) {
      return { success: false, error: 'Target client workspace is required.' }
    }

    const trimmedName = input.fullName?.trim()
    if (!trimmedName) {
      return { success: false, error: 'Contact full name is required.' }
    }

    const adminClient = createSupabaseAdminClient()
    const { data, error } = await adminClient
      .from('contacts')
      .insert({
        client_id: targetClientId,
        full_name: trimmedName,
        email: input.email?.trim() || null,
        phone: input.phone?.trim() || null,
        company_name: input.companyName?.trim() || null,
        lead_status: input.leadStatus || 'new_lead',
        source: 'manual_console',
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    revalidatePath('/dashboard/crm')
    revalidatePath('/admin/crm')

    return { success: true, contact: data }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create contact.' }
  }
}
