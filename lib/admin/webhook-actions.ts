'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { pingWebhookEndpoint, sendHelixWebhookEvent } from '@/lib/webhooks/egress'
import type { SystemType, WebhookDirection, WebhookStatus } from '@/lib/schema'

export interface SaveWebhookParams {
  clientId: string
  systemType: SystemType
  direction: WebhookDirection
  webhookUrl: string
  secretHash?: string
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
  const { data, error } = await supabase
    .from('system_webhooks')
    .upsert(
      {
        client_id: params.clientId,
        system_type: params.systemType,
        direction: params.direction,
        webhook_url: params.webhookUrl,
        secret_hash: params.secretHash || null,
        enabled: params.enabled,
        updated_at: now,
      },
      { onConflict: 'client_id,system_type,direction' }
    )
    .select('id, webhook_url, enabled, last_status')
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

  const result = await pingWebhookEndpoint(webhookId, supabase)
  revalidatePath('/admin/webhooks')
  return result
}
