'use server'

import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface ContactInquiryState {
  status: 'idle' | 'saved' | 'error'
  message?: string
  messageAr?: string
  name?: string
}

function whatsAppOk(value: string) {
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '')
  return trimmed.startsWith('+') && digits.length >= 8 && digits.length <= 15
}

export async function submitContactInquiry(
  _prev: ContactInquiryState,
  formData: FormData,
): Promise<ContactInquiryState> {
  const fullName = String(formData.get('name') ?? '').trim()
  const business = String(formData.get('business') ?? '').trim()
  const businessType = String(formData.get('businessType') ?? '').trim()
  const city = String(formData.get('city') ?? '').trim()
  const whatsapp = String(formData.get('whatsapp') ?? '').trim()
  const note = String(formData.get('message') ?? '').trim()
  const language = String(formData.get('language') ?? '').trim()
  const about = String(formData.get('about') ?? '').trim()
  const topics = formData.getAll('topics').map(value => String(value).trim()).filter(Boolean)

  if (!fullName || fullName.length > 200) {
    return { status: 'error', message: 'Enter your full name.', messageAr: 'أدخل اسمك الكامل.' }
  }
  if (!business || business.length > 200) {
    return { status: 'error', message: 'Enter your business name.', messageAr: 'أدخل اسم النشاط.' }
  }
  if (!businessType) {
    return { status: 'error', message: 'Choose a business type.', messageAr: 'اختر نوع النشاط.' }
  }
  if (!city || city.length > 200) {
    return { status: 'error', message: 'Enter your city and country.', messageAr: 'أدخل المدينة والدولة.' }
  }
  if (!whatsAppOk(whatsapp)) {
    return {
      status: 'error',
      message: 'Enter a WhatsApp number with country code.',
      messageAr: 'أدخل رقم واتساب مع رمز الدولة.',
    }
  }

  // contact_inquiries columns: full_name, email, volume, message.
  // This form does not collect an email, so email is stored as an empty string, not a stand-in address.
  // Answers that have no column are written into message. volume keeps the business type.
  const message = [
    `Business: ${business}`,
    `Type: ${businessType}`,
    `City: ${city}`,
    `WhatsApp: ${whatsapp}`,
    `Language: ${language === 'ar' ? 'Arabic' : 'English'}`,
    about ? `About: ${about}` : '',
    topics.length ? `Slipping through: ${topics.join(', ')}` : '',
    '',
    note || '(No extra note)',
  ]
    .filter(line => line !== '')
    .join('\n')
    .slice(0, 5000)

  try {
    const admin = createSupabaseAdminClient()
    const { error } = await admin.from('contact_inquiries').insert({
      full_name: fullName,
      email: '',
      volume: businessType.slice(0, 120),
      message,
    })
    if (error) {
      console.error('contact inquiry insert failed', error.message)
      return {
        status: 'error',
        message: "We couldn't send your request. Please try again, or message us on WhatsApp.",
        messageAr: 'تعذّر إرسال طلبك. حاول مرة أخرى، أو راسلنا على واتساب.',
      }
    }
  } catch (error) {
    console.error('contact inquiry unavailable', error)
    return {
      status: 'error',
      message: "We couldn't send your request. Please try again, or message us on WhatsApp.",
      messageAr: 'تعذّر إرسال طلبك. حاول مرة أخرى، أو راسلنا على واتساب.',
    }
  }

  return { status: 'saved', name: fullName }
}
