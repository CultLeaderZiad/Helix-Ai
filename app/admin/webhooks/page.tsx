import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, EmptyState, PageHead } from '@/components/admin/v5'
import { WebhooksManagerView } from '@/components/admin/webhooks-manager-view'
import type { Client, SystemWebhook } from '@/lib/schema'

export const metadata = {
  title: 'HELIX AI: Webhook Registry & n8n Control Plane',
  robots: { index: false, follow: false },
}

export default async function WebhooksPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)

  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  let clients: Client[] = []
  try {
    const { data } = await supabase
      .from('clients')
      .select('id, business_name, vertical, status, country, region_tier, timezone, dialect, whatsapp_number, created_at, updated_at')
      .order('business_name')
    clients = (data ?? []) as Client[]
  } catch {
    clients = []
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
      <AdminFrame>
        <PageHead
          title="Webhooks"
          titleAr="ويب هوك"
          lede="Production endpoints and signing secrets for each workspace."
          ledeAr="نقاط الإنتاج وأسرار التوقيع لكل مساحة عمل."
        />
        {clients.length === 0 ? (
          <EmptyState
            title="No workspaces yet"
            titleAr="لا توجد مساحات عمل بعد"
            body="Webhook endpoints appear after a workspace is provisioned."
            bodyAr="تظهر نقاط الويب هوك بعد تجهيز مساحة العمل."
          />
        ) : (
          <WebhooksManagerView clients={clients} initialWebhooks={webhooks} />
        )}
      </AdminFrame>
    </ConsoleShell>
  )
}
