'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import {
  getUpdates,
  createUpdate,
  updateRelease,
  deleteUpdate,
  togglePublishUpdate,
  type PlatformUpdate,
} from './updates-store'

export async function getUpdatesAction(includeUnpublished = false) {
  return getUpdates(includeUnpublished)
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

  const res = createUpdate(data)
  if (!res) {
    return { success: false, error: 'Failed to create platform update.' }
  }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true, update: res }
}

export async function updateReleaseAction(id: string, data: Partial<PlatformUpdate>) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const ok = updateRelease(id, data)
  if (!ok) {
    return { success: false, error: 'Failed to update release details.' }
  }

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

  const ok = deleteUpdate(id)
  if (!ok) {
    return { success: false, error: 'Failed to delete release.' }
  }

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

  const ok = togglePublishUpdate(id)
  if (!ok) {
    return { success: false, error: 'Failed to toggle publish status.' }
  }

  revalidatePath('/updates')
  revalidatePath('/admin/updates')
  return { success: true }
}
