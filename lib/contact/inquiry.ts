'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface ContactInquiryState {
  status: 'idle' | 'saved' | 'error'
  message?: string
  messageAr?: string
}

export async function submitContactInquiry(
  _prev: ContactInquiryState,
  formData: FormData,
): Promise<ContactInquiryState> {
  const fullName = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const volume = String(formData.get('volume') ?? '').trim().slice(0, 120)
  const message = String(formData.get('message') ?? '').trim()

  if (!fullName || fullName.length > 200) {
    return { status: 'error', message: 'Enter your name.', messageAr: 'أدخل اسمك.' }
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { status: 'error', message: 'Enter a valid work email.', messageAr: 'أدخل بريداً صالحاً.' }
  }
  if (!message || message.length > 5000) {
    return { status: 'error', message: 'Enter your requirements.', messageAr: 'اكتب متطلباتك.' }
  }

  try {
    const admin = createSupabaseAdminClient()
    const { error } = await admin.from('contact_inquiries').insert({
      full_name: fullName,
      email,
      volume: volume || null,
      message,
    })
    if (error) {
      return {
        status: 'error',
        message: 'The inquiry was not saved. Apply the contact_inquiries migration, then try again.',
        messageAr: 'لم يُحفظ الطلب. طبّق ترحيل contact_inquiries ثم أعد المحاولة.',
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'Inquiries cannot be stored until SUPABASE_SERVICE_ROLE_KEY is set on the server.',
      messageAr: 'لا يمكن حفظ الطلبات قبل ضبط SUPABASE_SERVICE_ROLE_KEY على الخادم.',
    }
  }

  return {
    status: 'saved',
    message: 'Inquiry saved. An operations lead can read it in the contact_inquiries table.',
    messageAr: 'تم حفظ الطلب. يمكن لفريق العمليات قراءته في جدول contact_inquiries.',
  }
}
