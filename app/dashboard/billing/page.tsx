import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { CreditCard, ShieldCheck, Download, CheckCircle2, ArrowUpRight, Clock, Sparkles, FileText } from 'lucide-react'

export const metadata = {
  title: 'Helix AI — Billing & Retainers',
  robots: { index: false, follow: false },
}

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const clientId = session.claims.client_id!
  const clientRes = await supabase
    .from('clients')
    .select('business_name, monthly_fee, created_at')
    .eq('id', clientId)
    .maybeSingle()

  const client = clientRes.data
  const monthlyFee = client?.monthly_fee ?? 2450

  const invoices = [
    {
      id: 'INV-2026-003',
      date: 'Sep 1, 2026',
      amount: `$${monthlyFee.toLocaleString()}`,
      status: 'Paid',
      plan: 'Growth AI Enterprise Retainer',
    },
    {
      id: 'INV-2026-002',
      date: 'Aug 1, 2026',
      amount: `$${monthlyFee.toLocaleString()}`,
      status: 'Paid',
      plan: 'Growth AI Enterprise Retainer',
    },
    {
      id: 'INV-2026-001',
      date: 'Jul 1, 2026',
      amount: '$1,500',
      status: 'Paid',
      plan: 'System Onboarding & Setup Fee',
    },
  ]

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-helix-border bg-helix-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-helix-accent">
              <CreditCard className="size-3.5" /> Retainer Management
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-helix-ink sm:text-4xl">
              Billing & Retainers
            </h1>
            <p className="mt-1 text-sm text-helix-muted">
              Active plan, automated SLA guarantees, and monthly invoice audit trail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="flex items-center gap-1.5 rounded-xl border border-helix-border bg-helix-accent-soft px-4 py-2 text-xs font-semibold text-helix-accent hover:bg-helix-accent-soft transition-colors"
            >
              <FileText className="size-3.5" /> View Performance Report →
            </Link>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2 text-xs font-bold text-white  hover:opacity-95 transition-opacity"
            >
              <Sparkles className="size-3.5" /> Upgrade Plan
            </button>
          </div>
        </div>

        {/* Retainer Summary Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">Active Retainer</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">${monthlyFee.toLocaleString()}</span>
              <span className="text-xs text-helix-muted">/ month</span>
            </div>
            <p className="mt-2 text-xs text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Auto-renews on Oct 1, 2026
            </p>
          </div>

          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">AI Compute Capacity</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">98.4%</span>
              <span className="text-xs text-helix-muted">available</span>
            </div>
            <p className="mt-2 text-xs text-helix-muted">Unlimited Voice & WhatsApp throughput</p>
          </div>

          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">SLA & Response Time</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">&lt; 15 mins</span>
            </div>
            <p className="mt-2 text-xs text-helix-accent flex items-center gap-1">
              <ShieldCheck className="size-3.5" /> Priority 24/7 Agent Oversight
            </p>
          </div>
        </div>

        {/* Invoices Ledger */}
        <div className="mt-8 rounded-2xl border border-helix-border bg-helix-surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-helix-border px-6 py-4">
            <h2 className="text-sm font-semibold text-helix-ink">Invoice History</h2>
            <span className="text-xs text-helix-muted">All prices in USD</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-helix-border bg-slate-900/50 text-helix-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-3">Invoice</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Plan / Description</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-helix-ink/80">
                {invoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-helix-ink font-medium">{inv.id}</td>
                    <td className="px-6 py-3.5 text-helix-muted">{inv.date}</td>
                    <td className="px-6 py-3.5 text-helix-ink">{inv.plan}</td>
                    <td className="px-6 py-3.5 font-bold text-helix-ink">{inv.amount}</td>
                    <td className="px-6 py-3.5">
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-300">
                        <CheckCircle2 className="size-3" /> {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-helix-accent hover:text-helix-accent font-medium"
                      >
                        <Download className="size-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ConsoleShell>
  )
}
