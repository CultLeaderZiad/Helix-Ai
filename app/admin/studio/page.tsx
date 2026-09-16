import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { SYSTEM_TEMPLATES } from '@/lib/studio/templates'
import { Sparkles, ArrowRight, DollarSign, Building2, CheckCircle2, Clock, Cpu } from 'lucide-react'

import { StudioRequestsView } from '@/components/admin/studio-requests-view'

export const metadata = {
  title: 'Helix AI — Studio Build Requests',
  robots: { index: false, follow: false },
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export default async function AdminStudioPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/studio')

  // Fetch client workspaces and build deals
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
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Sparkles className="size-3.5" /> Agency Studio Command
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Studio Build Requests & Templates
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Review inbound system build requests customized by clients and manage production templates.
            </p>
          </div>

          <Link
            href="/dashboard/studio"
            className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:bg-cyan-400 transition-all"
          >
            <Cpu className="size-4" />
            Launch Interactive Studio Machine &rarr;
          </Link>
        </div>

        {/* Inbound Requests Queue */}
        <section className="mt-8 rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                <Clock className="size-4 text-cyan-400" /> Inbound Client Build Requests
              </h2>
              <p className="text-xs text-slate-400">
                Generated directly when clients click "Request Full Build" in their Studio sandbox.
              </p>
            </div>
            <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-xs font-semibold">
              {deals.length} Active Request{deals.length === 1 ? '' : 's'}
            </span>
          </div>

          <StudioRequestsView deals={deals} clientMap={clientMap} />
        </section>

        {/* System Templates Catalog Grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-bold text-white">Production System Templates</h2>
              <p className="text-xs text-slate-400">
                The 6 core architectures available in the Client Studio sandbox.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {SYSTEM_TEMPLATES.map(template => (
              <div
                key={template.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0e1422] p-5 shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-cyan-400">
                      {template.category}
                    </span>
                    {template.badge && (
                      <span className="rounded-full bg-purple-500/20 border border-purple-500/30 px-2 py-0.5 text-[9px] text-purple-300">
                        {template.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-2 font-display text-base font-bold text-white">{template.name}</h3>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">{template.description}</p>
                </div>

                <div className="mt-5 border-t border-slate-800/80 pt-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Setup / Retainer</span>
                    <span className="font-bold text-white">
                      {formatCurrency(template.setupFeeCents)} + {formatCurrency(template.monthlyRetainerCents)}/mo
                    </span>
                  </div>
                  <span className="text-cyan-400 font-semibold">Active in Studio</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </ConsoleShell>
  )
}
