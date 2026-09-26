import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { CORE_SYSTEM_COUNT, PREVIEW_SYSTEM_COUNT } from '@/lib/studio/templates'
import { StudioRequestsView } from '@/components/admin/studio-requests-view'
import { AdminFrame, PageHead, Panel } from '@/components/admin/v5'
import { SystemCatalogGrid } from '@/components/studio/system-card'

export const metadata = {
  title: 'Helix AI: System catalog',
  robots: { index: false, follow: false },
}

export default async function AdminStudioPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/studio')

  const [clientsRes, dealsRes] = await Promise.all([
    supabase.from('clients').select('id, business_name'),
    supabase.from('deals').select('*').order('created_at', { ascending: false }),
  ])

  const clientMap: Record<string, string> = {}
  for (const c of clientsRes.data ?? []) {
    clientMap[c.id] = c.business_name
  }
  const deals = dealsRes.data ?? []

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title="Systems"
          titleAr="الأنظمة"
          lede={`Catalog of production packs and preview add-ons. The demo is not live. ${CORE_SYSTEM_COUNT} core · ${PREVIEW_SYSTEM_COUNT} preview.`}
          ledeAr="فهرس حزم الإنتاج والإضافات. العرض ليس مباشراً."
          actions={
            <Link className="hx-admin-btn" href="/dashboard/studio">
              Open studio
            </Link>
          }
        />
        <Panel
          title="Build requests"
          titleAr="طلبات البناء"
          actions={
            <Link className="hx-admin-btn" href="/dashboard/studio">
              Share studio link
            </Link>
          }
        >
          <p className="hx-admin-lede">When a client requests a build, it lands here.</p>
          <p className="hx-admin-ar" lang="ar" dir="rtl">عندما يطلب عميل بناء نظام، يظهر الطلب هنا.</p>
          <StudioRequestsView deals={deals} clientMap={clientMap} />
        </Panel>
        <SystemCatalogGrid />
      </AdminFrame>
    </ConsoleShell>
  )
}
