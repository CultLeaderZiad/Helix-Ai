import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

// Authenticated route: excluded from sitemap and marked unindexable here in
// addition to the noindex header set by proxy.ts for every matched path.
export const metadata = {
  title: 'HELIX AI — Agency Admin',
  robots: { index: false, follow: false },
}

// Ordered per the delivery plan; each becomes a real panel in later phases.
const PLANNED_PANELS = [
  'Client roster and single-client detail',
  'Integration health (live ping status)',
  'Cross-client realtime activity feed',
]

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  // Real cross-tenant read: clients RLS returns rows to agency admins only.
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, business_name')
    .order('business_name')

  return (
    <main className="min-h-screen p-8 antialiased">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Agency admin · {session.user.email}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Clients</h1>
      {error ? (
        <p className="mt-8 text-sm text-red-600 dark:text-red-400">
          The client roster could not be loaded. Retry shortly.
        </p>
      ) : clients.length === 0 ? (
        <p className="mt-8 text-sm text-neutral-500 dark:text-neutral-400">
          No clients provisioned yet.
        </p>
      ) : (
        <ul className="mt-8 space-y-2">
          {clients.map((client) => (
            <li key={client.id} className="text-base">
              {client.business_name}
            </li>
          ))}
        </ul>
      )}
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
