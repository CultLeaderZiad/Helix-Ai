'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface ContactInquiryInput {
  name: string
  email: string
  organization?: string
  monthlyVolume?: string
  message: string
}

export async function submitContactInquiryAction(input: ContactInquiryInput) {
  try {
    const name = input.name?.trim()
    const email = input.email?.trim()
    const message = input.message?.trim()

    if (!name) {
      return { success: false, error: 'Full name is required.' }
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'A valid work email is required.' }
    }
    if (!message) {
      return { success: false, error: 'Project description is required.' }
    }

    const admin = createSupabaseAdminClient()
    const { error } = await admin.from('contact_inquiries').insert({
      full_name: name,
      work_email: email,
      company_name: input.organization?.trim() || null,
      monthly_volume: input.monthlyVolume?.trim() || null,
      message: message,
    })

    if (error) {
      console.error('Contact inquiry insert error:', error.message)
      return { success: false, error: `Inquiry could not be recorded: ${error.message}` }
    }

    return { success: true }
  } catch (err: any) {
    console.error('submitContactInquiryAction exception:', err)
    return { success: false, error: err?.message || 'Failed to submit inquiry.' }
  }
}
