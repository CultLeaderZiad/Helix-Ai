import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { parseTenantClaims, type TenantClaims } from '@/lib/auth/claims'

/**
 * Ensure a user has an authoritative tenant workspace, role, and profile.
 * If the user signed up via self-serve auth and lacks tenant claims in app_metadata,
 * this provisions their client workspace, assigns role 'client_user', and creates their profile.
 */
export async function ensureUserProvisioned(userId: string): Promise<TenantClaims | null> {
  const admin = createSupabaseAdminClient()

  const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId)
  if (userError || !userData.user) return null

  const user = userData.user
  const adminEmail = process.env.SUPABASE_TEST_EMAIL_ADMIN?.trim().toLowerCase()
  const userEmail = (user.email || '').trim().toLowerCase()
  const isTargetAdmin =
    (adminEmail && userEmail === adminEmail) ||
    userEmail === 'cultleaderzoz.dev@gmail.com' ||
    user.app_metadata?.role === 'agency_admin'

  if (isTargetAdmin) {
    const claims: TenantClaims = { role: 'agency_admin', client_id: null }
    if (user.app_metadata?.role !== 'agency_admin' || user.app_metadata?.client_id !== null) {
      await admin.auth.admin.updateUserById(user.id, {
        app_metadata: { ...user.app_metadata, role: 'agency_admin', client_id: null },
      })
    }
    await admin.from('profiles').upsert(
      {
        id: user.id,
        role: 'agency_admin',
        client_id: null,
        full_name: (user.user_metadata?.full_name as string) || 'Agency Admin',
        email: user.email || '',
      },
      { onConflict: 'id' }
    )
    return claims
  }

  const existingClaims = parseTenantClaims(user.app_metadata)
  if (existingClaims) {
    // Ensure profile row exists
    await admin.from('profiles').upsert(
      {
        id: user.id,
        role: existingClaims.role,
        client_id: existingClaims.client_id,
        full_name: (user.user_metadata?.full_name as string) || 'User',
        email: user.email || '',
      },
      { onConflict: 'id' }
    )
    return existingClaims
  }

  // Provision new client workspace for self-serve sign-up
  const clientId = crypto.randomUUID()
  const companyName =
    (user.user_metadata?.company_name as string)?.trim() ||
    (user.user_metadata?.full_name as string)?.trim() ||
    'My Workspace'

  // 1. Create client workspace
  const { error: clientInsertError } = await admin.from('clients').insert({
    id: clientId,
    business_name: companyName,
    status: 'onboarding',
  })
  if (clientInsertError) {
    console.error('Failed to create client workspace:', clientInsertError)
    return null
  }

  // 2. Set authoritative app_metadata
  const { error: claimsError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      role: 'client_user',
      client_id: clientId,
    },
  })
  if (claimsError) {
    console.error('Failed to update app_metadata:', claimsError)
    return null
  }

  // 3. Create profile record
  const { error: profileError } = await admin.from('profiles').upsert(
    {
      id: user.id,
      role: 'client_user',
      client_id: clientId,
      full_name: (user.user_metadata?.full_name as string) || 'Client User',
      email: user.email || '',
    },
    { onConflict: 'id' }
  )
  if (profileError) {
    console.error('Failed to create profile:', profileError)
  }

  // 4. Seed initial systems and integrations for client workspace
  await Promise.allSettled([
    admin.from('billing_accounts').insert({ client_id: clientId }),
    admin.from('client_systems').insert([
      { client_id: clientId, system_type: 'missed_call_response', active: true, visible_to_client: true, config: {} },
      { client_id: clientId, system_type: 'booking_receptionist', active: true, visible_to_client: true, config: {} },
      { client_id: clientId, system_type: 'lead_attribution', active: true, visible_to_client: true, config: {} },
    ]),
    admin.from('client_integrations').insert([
      { client_id: clientId, system_type: 'missed_call_response', status: 'connected' },
      { client_id: clientId, system_type: 'booking_receptionist', status: 'connected' },
      { client_id: clientId, system_type: 'lead_attribution', status: 'connected' },
    ]),
  ])

  return {
    role: 'client_user',
    client_id: clientId,
  }
}

