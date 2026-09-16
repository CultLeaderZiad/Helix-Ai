'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import type { UserRole } from '@/lib/schema'

export interface UserActionResult {
  success: boolean
  error?: string
  message?: string
}

async function verifyAdminAuth() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session || session.claims.role !== 'agency_admin') {
    throw new Error('Unauthorized: Agency Administrator privileges required.')
  }
  return session
}

export async function inviteOrRegisterUser(formData: {
  email: string
  fullName: string
  role: UserRole
  clientId?: string | null
  password?: string
}): Promise<UserActionResult> {
  try {
    await verifyAdminAuth()

    const email = formData.email?.trim().toLowerCase()
    const fullName = formData.fullName?.trim() || 'Team Member'
    const role = formData.role
    const clientId = role === 'agency_admin' ? null : formData.clientId || null
    const password = formData.password?.trim() || 'HelixUser2026!'

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, error: 'A valid email address is required.' }
    }

    if (role !== 'agency_admin' && !clientId) {
      return { success: false, error: 'A client workspace must be selected for client users and staff.' }
    }

    const admin = createSupabaseAdminClient()

    // Check if user already exists
    const { data: userList, error: listError } = await admin.auth.admin.listUsers()
    if (listError) {
      return { success: false, error: `Failed to search existing accounts: ${listError.message}` }
    }

    const existingUser = userList.users.find(u => u.email?.toLowerCase() === email)

    if (existingUser) {
      // Update existing user role & workspace
      const { error: updateError } = await admin.auth.admin.updateUserById(existingUser.id, {
        password,
        email_confirm: true,
        app_metadata: {
          ...existingUser.app_metadata,
          role,
          client_id: clientId,
        },
        user_metadata: {
          ...existingUser.user_metadata,
          full_name: fullName,
        },
      })

      if (updateError) {
        return { success: false, error: `Failed to update user auth: ${updateError.message}` }
      }

      const { error: profileError } = await admin.from('profiles').upsert(
        {
          id: existingUser.id,
          email,
          full_name: fullName,
          role,
          client_id: clientId,
        },
        { onConflict: 'id' }
      )

      if (profileError) {
        return { success: false, error: `Failed to update user profile: ${profileError.message}` }
      }

      revalidatePath('/admin/users')
      return {
        success: true,
        message: `Existing account ${email} successfully upgraded to ${role}.`,
      }
    }

    // Create brand new user
    const { data: newUser, error: createError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      app_metadata: {
        role,
        client_id: clientId,
      },
      user_metadata: {
        full_name: fullName,
      },
    })

    if (createError || !newUser.user) {
      return { success: false, error: `Failed to provision user account: ${createError?.message || 'Unknown error'}` }
    }

    const { error: profileError } = await admin.from('profiles').upsert(
      {
        id: newUser.user.id,
        email,
        full_name: fullName,
        role,
        client_id: clientId,
      },
      { onConflict: 'id' }
    )

    if (profileError) {
      return { success: false, error: `User created but failed to save profile: ${profileError.message}` }
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `User ${email} invited and provisioned with role ${role}.`,
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

export async function updateUserRole(
  userId: string,
  newRole: UserRole,
  clientId?: string | null
): Promise<UserActionResult> {
  try {
    const session = await verifyAdminAuth()

    const targetClientId = newRole === 'agency_admin' ? null : clientId || null
    if (newRole !== 'agency_admin' && !targetClientId) {
      return { success: false, error: 'A client workspace is required when assigning a client role.' }
    }

    // Prevent agency admin from demoting themselves and locking themselves out
    if (userId === session.user.id && newRole !== 'agency_admin') {
      return { success: false, error: 'You cannot downgrade your own administrator account.' }
    }

    const admin = createSupabaseAdminClient()

    // 1. Update auth app_metadata
    const { error: authError } = await admin.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: newRole,
        client_id: targetClientId,
      },
    })

    if (authError) {
      return { success: false, error: `Failed to update user authorization: ${authError.message}` }
    }

    // 2. Update profile table
    const { error: profileError } = await admin.from('profiles').update({
      role: newRole,
      client_id: targetClientId,
    }).eq('id', userId)

    if (profileError) {
      return { success: false, error: `Failed to update user profile record: ${profileError.message}` }
    }

    revalidatePath('/admin/users')
    return {
      success: true,
      message: `User role successfully updated to ${newRole}.`,
    }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}

export async function deleteUser(userId: string): Promise<UserActionResult> {
  try {
    const session = await verifyAdminAuth()

    if (userId === session.user.id) {
      return { success: false, error: 'You cannot delete your own active administrator account.' }
    }

    const admin = createSupabaseAdminClient()

    // Delete from profiles first
    await admin.from('profiles').delete().eq('id', userId)

    // Delete auth account
    const { error: authError } = await admin.auth.admin.deleteUser(userId)
    if (authError) {
      return { success: false, error: `Failed to delete authentication record: ${authError.message}` }
    }

    revalidatePath('/admin/users')
    return { success: true, message: 'User account removed.' }
  } catch (err: any) {
    return { success: false, error: err?.message || 'An unexpected error occurred.' }
  }
}
