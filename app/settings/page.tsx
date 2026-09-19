import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { PageHeader } from '@/components/ui/helix'
import { buttonVariants } from '@/components/ui/button'

export const metadata = {
  title: 'Helix AI — Settings',
  robots: { index: false, follow: false },
}

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const isAdmin = session.claims.role === 'agency_admin'
  const clientId = session.claims.client_id

  let clientData: { business_name?: string; vertical?: string | null; status?: string } | null = null
  if (clientId) {
    const { data } = await supabase.from('clients').select('business_name, vertical, status').eq('id', clientId).maybeSingle()
    clientData = data
  }

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={clientData?.business_name ?? null}
    >
      <div className="w-full">
        <PageHeader
          title={isAdmin ? 'Agency settings' : 'Workspace settings'}
          subtitle="Organization, team, and security. Tenant isolation stays in Postgres RLS."
        />

        <div className="mt-8 space-y-4">
          <section className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
            <h2 className="text-15 font-semibold tracking-[-0.03em]">Identity</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 text-13">
              <div>
                <dt className="text-helix-muted">{isAdmin ? 'Agency' : 'Workspace'}</dt>
                <dd className="mt-1 text-helix-ink">
                  {clientData?.business_name ?? (isAdmin ? 'Helix AI' : 'My workspace')}
                </dd>
              </div>
              <div>
                <dt className="text-helix-muted">Signed-in email</dt>
                <dd className="mt-1 text-helix-ink">{session.user.email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-helix-muted">Role</dt>
                <dd className="mt-1 text-helix-ink">
                  {isAdmin ? 'Agency admin' : 'Client operator'}
                </dd>
              </div>
              <div>
                <dt className="text-helix-muted">Status</dt>
                <dd className="mt-1 text-helix-ok">{clientData?.status ?? 'Active'}</dd>
              </div>
            </dl>
          </section>

          {isAdmin ? (
            <section className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
              <h2 className="text-15 font-semibold tracking-[-0.03em]">Admin</h2>
              <p className="mt-1 text-13 text-helix-muted">These pages stay reachable from Settings so the 4-job nav can stay quiet.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/admin/users" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  Team & roles
                </Link>
                <Link href="/admin/pricing" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  Pricing
                </Link>
                <Link href="/admin/updates" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  Updates
                </Link>
                <Link href="/admin/faq" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  FAQ
                </Link>
              </div>
            </section>
          ) : (
            <section className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
              <h2 className="text-15 font-semibold tracking-[-0.03em]">Workspace</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/dashboard/integrations" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  Integrations
                </Link>
                <Link href="/dashboard/billing" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
                  Billing
                </Link>
              </div>
            </section>
          )}

          <section className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
            <h2 className="text-15 font-semibold tracking-[-0.03em]">Security</h2>
            <p className="mt-2 text-13 text-helix-muted leading-relaxed">
              Workspace data is isolated with PostgreSQL row-level security. Adjacent tenants cannot read your rows.
            </p>
            <p className="mt-3 font-mono text-12 text-helix-muted">
              is_agency_admin() OR requester_client_id() = client_id
            </p>
          </section>
        </div>
      </div>
    </ConsoleShell>
  )
}
