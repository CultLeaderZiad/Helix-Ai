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
  const [clientRes, invoicesRes, billingRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase
      .from('invoices')
      .select('id, amount_cents, due_date, status, created_at')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false }),
    supabase.from('billing_accounts').select('*').eq('client_id', clientId).maybeSingle(),
  ])

  const client = clientRes.data
  const billing = (billingRes.data ?? null) as Record<string, unknown> | null
  const retainerRaw = billing?.monthly_retainer_cents ?? billing?.retainer_cents
  const retainerCents = typeof retainerRaw === 'number' ? retainerRaw : null
  const invoices = (invoicesRes.data ?? []).map(invoice => ({
    id: invoice.id.slice(0, 8).toUpperCase(),
    date: new Date(invoice.created_at || invoice.due_date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }),
    amount: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((invoice.amount_cents ?? 0) / 100),
    status: invoice.status,
    plan: 'Invoice on file',
  }))

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="w-full">
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
            <p className="max-w-xs text-xs text-helix-muted">
              Payments are not connected. There is no upgrade checkout.
              <span className="mt-1 block" dir="rtl" lang="ar">المدفوعات غير موصولة. لا توجد صفحة ترقية.</span>
            </p>
          </div>
        </div>

        {/* Retainer Summary Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">Active Retainer</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">
                {retainerCents == null
                  ? 'Not on file'
                  : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(retainerCents / 100)}
              </span>
            </div>
            <p className="mt-2 text-xs text-helix-muted">Taken from billing_accounts when a retainer column exists.</p>
          </div>

          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">Invoices on file</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">{invoices.length}</span>
            </div>
            <p className="mt-2 text-xs text-helix-muted">No payment provider is connected.</p>
          </div>

          <div className="rounded-2xl border border-helix-border bg-helix-surface p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-helix-muted">SLA</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-helix-ink">Not measured</span>
            </div>
            <p className="mt-2 text-xs text-helix-muted" dir="rtl" lang="ar">غير مقيس</p>
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
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-helix-muted">
                      No invoices yet.
                      <span className="mt-1 block" dir="rtl" lang="ar">لا توجد فواتير بعد.</span>
                    </td>
                  </tr>
                ) : null}
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
                    <td className="px-6 py-3.5 text-right text-helix-muted">No receipt file</td>
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
