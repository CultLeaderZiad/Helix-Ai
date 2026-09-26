import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { PricingManagerView } from '@/components/admin/pricing-manager-view'
import { getPricingAction } from '@/lib/pricing/actions'

export const metadata = {
  title: 'Pricing Management — Helix AI Admin',
  robots: { index: false, follow: false },
}

export default async function AdminPricingPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const configs = await getPricingAction()

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="w-full">
        <AdminTabs />
        <PricingManagerView initialConfigs={configs} />
      </div>
    </ConsoleShell>
  )
}
