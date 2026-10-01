'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import { pingWebhookEndpoint } from '@/lib/webhooks/egress'
import { hashWebhookSecret, SYSTEM_WEBHOOK_SAFE_COLUMNS } from '@/lib/webhooks/secret'
import type { SystemType, WebhookDirection } from '@/lib/schema'

export interface SaveWebhookParams {
  clientId: string
  systemType: SystemType
  direction: WebhookDirection
  webhookUrl: string
  /** Raw signing secret. Stored as ciphertext; secret_hash receives its SHA-256. */
  secret?: string
  enabled: boolean
}

export async function saveSystemWebhook(params: SaveWebhookParams) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized: Agency Admin permissions required' }
  }

  // Basic URL validation
  if (params.webhookUrl) {
    try {
      const url = new URL(params.webhookUrl)
      if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
        return { success: false, error: 'Webhook URL must use secure HTTPS protocol' }
      }
    } catch {
      return { success: false, error: 'Invalid Webhook URL format' }
    }
  }

  const now = new Date().toISOString()
  const upsertData: Record<string, unknown> = {
    client_id: params.clientId,
    system_type: params.systemType,
    direction: params.direction,
    webhook_url: params.webhookUrl,
    enabled: params.enabled,
    updated_at: now,
  }
  const cleanSecret = params.secret?.trim()
  if (cleanSecret) {
    upsertData.secret_ciphertext = cleanSecret
    upsertData.secret_hash = hashWebhookSecret(cleanSecret)
  }

  const admin = createSupabaseAdminClient()
  const { data, error } = await admin
    .from('system_webhooks')
    .upsert(upsertData, { onConflict: 'client_id,system_type,direction' })
    .select(SYSTEM_WEBHOOK_SAFE_COLUMNS)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/webhooks')
  return { success: true, webhook: data }
}

export async function triggerWebhookPing(webhookId: string) {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session || session.claims.role !== 'agency_admin') {
    return { success: false, error: 'Unauthorized' }
  }

  const result = await pingWebhookEndpoint(webhookId)
  revalidatePath('/admin/webhooks')
  return result
}
