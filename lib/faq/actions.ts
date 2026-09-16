'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { readAllFaqs, writeAllFaqs, type FAQItem } from './faq-store'

export async function getPublicFaqs(): Promise<FAQItem[]> {
  const faqs = readAllFaqs()
  return faqs.filter((f) => f.is_active)
}

export async function getAllAdminFaqs(): Promise<FAQItem[]> {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    throw new Error('Unauthorized. Agency Admin role required.')
  }
  return readAllFaqs()
}

export async function createFaqAction(data: {
  question: string
  answer: string
  category?: string
  is_active?: boolean
  display_order?: number
}): Promise<{ success: boolean; message: string; item?: FAQItem }> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, message: 'Unauthorized. Agency Admin role required.' }
    }

    if (!data.question?.trim() || !data.answer?.trim()) {
      return { success: false, message: 'Question and answer are required.' }
    }

    const currentFaqs = readAllFaqs()
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: data.question.trim(),
      answer: data.answer.trim(),
      category: data.category?.trim() || 'General',
      is_active: data.is_active ?? true,
      display_order: data.display_order ?? (currentFaqs.length + 1),
      updated_at: new Date().toISOString(),
    }

    currentFaqs.push(newItem)
    writeAllFaqs(currentFaqs)

    revalidatePath('/faq')
    revalidatePath('/admin/faq')
    return { success: true, message: 'FAQ question created successfully.', item: newItem }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to create FAQ.' }
  }
}

export async function updateFaqAction(
  id: string,
  data: Partial<Omit<FAQItem, 'id' | 'updated_at'>>
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, message: 'Unauthorized. Agency Admin role required.' }
    }

    const currentFaqs = readAllFaqs()
    const index = currentFaqs.findIndex((f) => f.id === id)
    if (index === -1) {
      return { success: false, message: 'FAQ not found.' }
    }

    currentFaqs[index] = {
      ...currentFaqs[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    writeAllFaqs(currentFaqs)

    revalidatePath('/faq')
    revalidatePath('/admin/faq')
    return { success: true, message: 'FAQ updated successfully.' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to update FAQ.' }
  }
}

export async function deleteFaqAction(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, message: 'Unauthorized. Agency Admin role required.' }
    }

    const currentFaqs = readAllFaqs()
    const filtered = currentFaqs.filter((f) => f.id !== id)
    if (filtered.length === currentFaqs.length) {
      return { success: false, message: 'FAQ item not found.' }
    }

    writeAllFaqs(filtered)

    revalidatePath('/faq')
    revalidatePath('/admin/faq')
    return { success: true, message: 'FAQ deleted successfully.' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to delete FAQ.' }
  }
}
