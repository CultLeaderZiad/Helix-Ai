'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export interface CreateContactState {
  status: 'idle' | 'saved' | 'error'
  message?: string
  messageAr?: string
}

async function insertContact(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  row: Record<string, string | null>,
) {
  const userWrite = await supabase.from('contacts').insert(row).select('id').maybeSingle()
  if (!userWrite.error) return { id: userWrite.data?.id ?? null, error: null as string | null }
  try {
    const admin = createSupabaseAdminClient()
    const adminWrite = await admin.from('contacts').insert(row).select('id').maybeSingle()
    if (!adminWrite.error) return { id: adminWrite.data?.id ?? null, error: null }
    return { id: null, error: adminWrite.error.message }
  } catch {
    return { id: null, error: userWrite.error.message }
  }
}

export async function createContact(
  _prev: CreateContactState,
  formData: FormData,
): Promise<CreateContactState> {
  const fullName = String(formData.get('full_name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const phone = String(formData.get('phone') ?? '').trim()
  const companyName = String(formData.get('company_name') ?? '').trim()

  if (!fullName) {
    return { status: 'error', message: 'Enter a name.', messageAr: 'أدخل الاسم.' }
  }
  if (email && !EMAIL_RE.test(email)) {
    return { status: 'error', message: 'Enter a valid email or leave it blank.', messageAr: 'أدخل بريداً صالحاً أو اتركه فارغاً.' }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session?.claims.client_id) {
      return {
        status: 'error',
        message: 'Contacts can be added from a client workspace. Agency admins do not have a single tenant to write into.',
        messageAr: 'يمكن إضافة جهات الاتصال من مساحة عمل العميل. حساب الوكالة ليس مرتبطاً بعميل واحد.',
      }
    }

    const result = await insertContact(supabase, {
      client_id: session.claims.client_id,
      full_name: fullName,
      email: email || null,
      phone: phone || null,
      company_name: companyName || null,
      lead_status: 'cold',
      source: 'manual',
    })
    if (result.error) {
      return {
        status: 'error',
        message: `The contact was not saved. ${result.error}`,
        messageAr: 'لم تُحفظ جهة الاتصال.',
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'The contact was not saved. Check the database connection and the contacts write policy.',
      messageAr: 'لم تُحفظ جهة الاتصال. تحقق من الاتصال بقاعدة البيانات وصلاحية الكتابة.',
    }
  }

  revalidatePath('/dashboard/crm')
  revalidatePath('/dashboard/contacts')
  return {
    status: 'saved',
    message: 'Contact saved.',
    messageAr: 'تم حفظ جهة الاتصال.',
  }
}
