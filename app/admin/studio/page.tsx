import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { CORE_SYSTEM_COUNT, PREVIEW_SYSTEM_COUNT } from '@/lib/studio/templates'
import { StudioRequestsView } from '@/components/admin/studio-requests-view'
import { SystemCatalogGrid } from '@/components/studio/system-card'
import { PageHeader } from '@/components/ui/helix'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Helix AI — System catalog',
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
      <div className="w-full space-y-8">
        <PageHeader
          title="System catalog"
          subtitle={`Core production packs + preview add-ons. Demo is not live. ${CORE_SYSTEM_COUNT} core · ${PREVIEW_SYSTEM_COUNT} preview.`}
          actions={
            <Link href="/dashboard/studio" className={buttonVariants({ size: 'sm' })}>
              Launch studio demo →
            </Link>
          }
        />

        <section className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-15 font-semibold tracking-[-0.03em] text-helix-ink">Inbound build requests</h2>
              <p className="mt-1 text-13 text-helix-muted">When a client hits Request build, it lands here.</p>
            </div>
            <ShareStudioFallback />
          </div>
          <StudioRequestsView deals={deals} clientMap={clientMap} />
        </section>

        <SystemCatalogGrid />
      </div>
    </ConsoleShell>
  )
}

function ShareStudioFallback() {
  return (
    <Link
      href="/dashboard/studio"
      className={buttonVariants({ variant: 'secondary', size: 'sm' })}
    >
      Share studio link
    </Link>
  )
}
