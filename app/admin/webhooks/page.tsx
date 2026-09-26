import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { WebhooksManagerView } from '@/components/admin/webhooks-manager-view'
import type { Client, SystemWebhook } from '@/lib/schema'

export const metadata = {
  title: 'HELIX AI — Webhook Registry & n8n Control Plane',
  robots: { index: false, follow: false },
}

const FALLBACK_CLIENTS: Client[] = [
  {
    id: 'client-demo',
    business_name: 'Agency Workspace',
    vertical: 'Services',
    timezone: 'Asia/Dubai',
    dialect: 'gulf',
    whatsapp_number: '+971500000000',
    status: 'active',
    country: 'AE',
    region_tier: 'gcc_enterprise',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default async function WebhooksPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  // Load clients with resilient fallback
  let clients: Client[] = []
  try {
    const { data } = await supabase
      .from('clients')
      .select('id, business_name, vertical, status, country, region_tier, timezone, dialect, whatsapp_number, created_at, updated_at')
      .order('business_name')
    if (data && data.length > 0) {
      clients = data as Client[]
    } else {
      clients = FALLBACK_CLIENTS
    }
  } catch {
    clients = FALLBACK_CLIENTS
  }

  // Load existing system webhooks
  let webhooks: SystemWebhook[] = []
  try {
    const { data } = await supabase.from('system_webhooks').select('*')
    if (data) {
      webhooks = data as SystemWebhook[]
    }
  } catch {
    webhooks = []
  }

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full space-y-6">
        <AdminTabs />
        <WebhooksManagerView clients={clients} initialWebhooks={webhooks} />
      </div>
    </ConsoleShell>
  )
}
