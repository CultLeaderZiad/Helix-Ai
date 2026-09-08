import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

// Authenticated route: excluded from sitemap and marked unindexable here in
// addition to the noindex header set by proxy.ts for every matched path.
export const metadata = {
  title: 'HELIX AI — Client Dashboard',
  robots: { index: false, follow: false },
}

// Ordered per the delivery plan; each becomes a real, visibility-gated card.
const PLANNED_PANELS = [
  'Per-system summary cards (gated by system_visibility)',
  'Contact and conversation timeline',
  'Integration health',
  'Billing and plan',
  'Onboarding checklist, notes, attention queue',
]

export default async function ClientDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  // Real tenant read: RLS limits this to the requester's own client row.
  const { data: client, error } = await supabase
    .from('clients')
    .select('business_name')
    .eq('id', session.claims.client_id!)
    .limit(1)
    .maybeSingle()

  // Live pending-evidence count for the review panel. Error/absence degrades
  // gracefully: the panel simply reports nothing to review yet.
  const { count: pendingFacts } = await supabase
    .from('contact_facts')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <main className="min-h-screen p-8 antialiased">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        {session.user.email}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {error || !client ? 'Your workspace' : client.business_name}
      </h1>

      <section className="mt-8 border bg-panel p-5">
        <h2 className="text-sm font-medium text-foreground">Evidence review</h2>
        <p className="mt-1 text-small text-muted-foreground">
          AI observations waiting for a human decision. Only tool-verified facts are
          auto-written to contact records; everything else lands here.
        </p>
        <p className="mt-4 text-body">
          {pendingFacts != null && pendingFacts > 0 ? (
            <span>
              <span className="font-medium text-foreground">{pendingFacts}</span>{' '}
              <span className="text-muted-foreground">pending suggestion{pendingFacts === 1 ? '' : 's'}.</span>{' '}
              <a href="/dashboard/facts" className="text-accent underline-offset-4 hover:underline">
                Review now →
              </a>
            </span>
          ) : (
            <span className="text-muted-foreground">
              Nothing to review right now.
            </span>
          )}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Not yet implemented
        </h2>
        <ul className="mt-3 space-y-1">
          {PLANNED_PANELS.map((panel) => (
            <li key={panel} className="text-sm text-neutral-400 dark:text-neutral-500">
              {panel}
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
