import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, PageHead } from '@/components/admin/v5'
import { PricingManagerView } from '@/components/admin/pricing-manager-view'
import { getPricingAction } from '@/lib/pricing/actions'

export const metadata = {
  title: 'Pricing Management: Helix AI Admin',
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
      <AdminFrame>
        <PageHead
          title="Pricing"
          titleAr="الأسعار"
          lede="Retainers, setup fees, and plan copy for each region."
          ledeAr="الرسوم الشهرية ورسوم الإعداد ونص الخطط لكل منطقة."
        />
        <PricingManagerView initialConfigs={configs} />
      </AdminFrame>
    </ConsoleShell>
  )
}
