import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { Settings, Shield, Bell, Key, Building, User, Check } from 'lucide-react'

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
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
              <Settings className="size-3.5" /> Workspace Configuration
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {isAdmin ? 'Agency Settings' : 'Workspace Settings'}
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage organization preferences, notifications, and security credentials.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-6">
          {/* Identity Section */}
          <section className="rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Building className="size-4 text-cyan-400" /> Identity & Profile
            </h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAdmin ? 'Agency Console Name' : 'Business / Workspace Name'}
                </label>
                <input
                  type="text"
                  disabled
                  value={clientData?.business_name ?? (isAdmin ? 'Helix AI Agency Console' : 'My Workspace')}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131b2e] px-3.5 text-sm text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Authenticated User Email
                </label>
                <input
                  type="text"
                  disabled
                  value={session.user.email ?? ''}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131b2e] px-3.5 text-sm text-slate-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role Authority</label>
                <div className="mt-1.5 flex h-10 items-center rounded-lg border border-slate-800 bg-[#131b2e] px-3.5 text-sm font-medium text-cyan-400">
                  {session.claims.role === 'agency_admin' ? 'Agency Administrator (Full Access)' : 'Client Workspace Operator'}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Operational Status</label>
                <div className="mt-1.5 flex h-10 items-center gap-2 rounded-lg border border-slate-800 bg-[#131b2e] px-3.5 text-sm">
                  <span className="size-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-300 font-medium">Production Active</span>
                </div>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Bell className="size-4 text-purple-400" /> Alerts & Notifications
            </h2>
            <div className="mt-4 divide-y divide-slate-800/80">
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Pending Evidence Alerts</p>
                  <p className="text-xs text-slate-400">Notify when an autonomous agent extracts a high-confidence fact.</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-cyan-500 rounded" />
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-white">Integration Health Failures</p>
                  <p className="text-xs text-slate-400">Immediate alert if WhatsApp token expires or webhook drops.</p>
                </div>
                <input type="checkbox" defaultChecked className="size-4 accent-cyan-500 rounded" />
              </div>
            </div>
          </section>

          {/* Team & Roles Management for Agency Admins */}
          {isAdmin && (
            <section className="rounded-2xl border border-purple-500/30 bg-[#0e1422] p-6 shadow-xl shadow-purple-500/5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
                    <Shield className="size-4 text-purple-400" /> Team & Roles Authority
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Invite new users, assign client workspaces, and grant or revoke Agency Administrator privileges.
                  </p>
                </div>
                <a
                  href="/admin/users"
                  className="inline-flex items-center gap-2 rounded-xl bg-purple-500/20 border border-purple-500/40 px-4 py-2 text-xs font-semibold text-purple-200 hover:bg-purple-500/30 transition-colors"
                >
                  Manage Users & Roles →
                </a>
              </div>
            </section>
          )}

          {/* Security & RLS Isolation */}
          <section className="rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-xl">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <Shield className="size-4 text-emerald-400" /> Multi-Tenant Cryptographic Isolation
            </h2>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Every request is signed with your authoritative JWT and validated by PostgreSQL Row-Level Security. Adjacent
              workspace records are cryptographically inaccessible.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <Check className="size-4 shrink-0" />
              <span>RLS POLICY: is_agency_admin() OR requester_client_id() = client_id</span>
            </div>
          </section>
        </div>
      </div>
    </ConsoleShell>
  )
}
