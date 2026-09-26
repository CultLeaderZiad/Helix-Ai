'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import {
  getUpdates,
  saveUpdates,
  type PlatformUpdate,
} from './updates-store'
import { loadSiteDocument, persistSiteDocument } from '@/lib/content/site-documents'

async function loadUpdates(): Promise<PlatformUpdate[]> {
  const remote = await loadSiteDocument<PlatformUpdate[]>('updates')
  if (Array.isArray(remote)) return remote
  return getUpdates(true)
}

async function saveUpdateList(updates: PlatformUpdate[]): Promise<{ ok: boolean; error?: string }> {
  const remote = await persistSiteDocument('updates', updates)
  if (remote.ok) return remote
  const fileOk = saveUpdates(updates)
  if (fileOk && !process.env.VERCEL) return { ok: true }
  return remote
}

export async function getUpdatesAction(includeUnpublished = false) {
  const updates = await loadUpdates()
  return includeUnpublished ? updates : updates.filter(update => update.is_published)
}

export async function createUpdateAction(data: {
  version: string
  date: string
  title: string
  category: string
  is_published: boolean
  highlights: string[]
}) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const updates = await loadUpdates()
  const created: PlatformUpdate = { ...data, id: `rel-${Date.now()}` }
  updates.unshift(created)
  const saved = await saveUpdateList(updates)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to create platform update.' }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true, update: created }
}

export async function updateReleaseAction(id: string, data: Partial<PlatformUpdate>) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const updates = await loadUpdates()
  const index = updates.findIndex(update => update.id === id)
  if (index === -1) return { success: false, error: 'Release not found.' }
  updates[index] = { ...updates[index], ...data }
  const saved = await saveUpdateList(updates)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to update release details.' }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true }
}

export async function deleteUpdateAction(id: string) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const updates = await loadUpdates()
  const filtered = updates.filter(update => update.id !== id)
  if (filtered.length === updates.length) return { success: false, error: 'Release not found.' }
  const saved = await saveUpdateList(filtered)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to delete release.' }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true }
}

export async function togglePublishUpdateAction(id: string) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const updates = await loadUpdates()
  const index = updates.findIndex(update => update.id === id)
  if (index === -1) return { success: false, error: 'Release not found.' }
  updates[index].is_published = !updates[index].is_published
  const saved = await saveUpdateList(updates)
  if (!saved.ok) return { success: false, error: saved.error || 'Failed to toggle publish status.' }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true }
}
