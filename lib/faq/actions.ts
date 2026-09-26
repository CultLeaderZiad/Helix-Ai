'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { readAllFaqs, writeAllFaqs, type FAQItem } from './faq-store'
import { loadSiteDocument, persistSiteDocument } from '@/lib/content/site-documents'

async function loadFaqs(): Promise<FAQItem[]> {
  const remote = await loadSiteDocument<FAQItem[]>('faqs')
  if (Array.isArray(remote)) return remote
  return readAllFaqs()
}

async function saveFaqs(faqs: FAQItem[]): Promise<{ ok: boolean; error?: string }> {
  const remote = await persistSiteDocument('faqs', faqs)
  if (!remote.ok) {
    try {
      writeAllFaqs(faqs)
    } catch {
      return remote
    }
    if (process.env.VERCEL) return remote
  }
  return { ok: true }
}

export async function getPublicFaqs(): Promise<FAQItem[]> {
  const faqs = await loadFaqs()
  return faqs.filter((f) => f.is_active)
}

export async function getAllAdminFaqs(): Promise<FAQItem[]> {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    throw new Error('Unauthorized. Agency Admin role required.')
  }
  return loadFaqs()
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

    const currentFaqs = await loadFaqs()
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
    const saved = await saveFaqs(currentFaqs)
    if (!saved.ok) return { success: false, message: saved.error || 'Failed to create FAQ.' }

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

    const currentFaqs = await loadFaqs()
    const index = currentFaqs.findIndex((f) => f.id === id)
    if (index === -1) {
      return { success: false, message: 'FAQ not found.' }
    }

    currentFaqs[index] = {
      ...currentFaqs[index],
      ...data,
      updated_at: new Date().toISOString(),
    }

    const saved = await saveFaqs(currentFaqs)
    if (!saved.ok) return { success: false, message: saved.error || 'Failed to update FAQ.' }

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

    const currentFaqs = await loadFaqs()
    const filtered = currentFaqs.filter((f) => f.id !== id)
    if (filtered.length === currentFaqs.length) {
      return { success: false, message: 'FAQ item not found.' }
    }

    const saved = await saveFaqs(filtered)
    if (!saved.ok) return { success: false, message: saved.error || 'Failed to delete FAQ.' }

    revalidatePath('/faq')
    revalidatePath('/admin/faq')
    return { success: true, message: 'FAQ deleted successfully.' }
  } catch (err: any) {
    return { success: false, message: err.message || 'Failed to delete FAQ.' }
  }
}
