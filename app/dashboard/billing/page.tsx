import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { CreditCard, ShieldCheck, Download, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Helix AI — Billing & Retainers',
  robots: { index: false, follow: false },
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100)
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default async function BillingPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const clientId = session.claims.client_id!
  const [clientRes, invoicesRes, billingAccountRes] = await Promise.all([
    supabase
      .from('clients')
      .select('business_name, monthly_fee, created_at, status')
      .eq('id', clientId)
      .maybeSingle(),
    supabase
      .from('invoices')
      .select('id, amount_cents, due_date, status, created_at')
      .eq('client_id', clientId)
      .order('due_date', { ascending: false }),
    supabase
      .from('billing_accounts')
      .select('*')
      .eq('client_id', clientId)
      .maybeSingle(),
  ])

  const client = clientRes.data
  const monthlyFee = client?.monthly_fee ?? null
  const invoices = invoicesRes.data ?? []
  const billingAccount = billingAccountRes.data

  const totalInvoicedCents = invoices.reduce((sum, inv) => sum + (inv.amount_cents ?? 0), 0)
  const outstandingInvoices = invoices.filter(inv => inv.status === 'overdue' || inv.status === 'unpaid')

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null}>
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
              Retainer Management
            </Badge>
            <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Billing & Retainers
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Active workspace retainer contract and monthly invoice audit trail.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/reports"
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-2 text-xs font-medium text-foreground hover:bg-raised transition-colors"
            >
              <FileText className="size-3.5" /> View Performance Report →
            </Link>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
            >
              <span>Manage Payment Method</span>
            </Button>
          </div>
        </div>

        {/* Retainer Summary Cards — Real Schema Data Only */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Retainer</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {monthlyFee !== null ? `$${monthlyFee.toLocaleString()}` : '—'}
              </span>
              {monthlyFee !== null ? <span className="text-xs text-muted-foreground">/ month</span> : null}
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-status-success" />
              <span>{client?.status === 'active' ? 'Active account contract' : 'Pending verification'}</span>
            </p>
          </div>

          <div className="rounded-xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoiced Volume</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {formatMoney(totalInvoicedCents)}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {invoices.length} invoice{invoices.length === 1 ? '' : 's'} recorded to date
            </p>
          </div>

          <div className="rounded-xl border border-border bg-panel p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Status</p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground capitalize">
                {outstandingInvoices.length > 0 ? `${outstandingInvoices.length} Due` : 'In Good Standing'}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <ShieldCheck className="size-3.5 text-accent" />
              <span>Enterprise RLS isolated ledger</span>
            </p>
          </div>
        </div>

        {/* Invoices Ledger */}
        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <h2 className="text-sm font-semibold text-foreground">Invoice History</h2>
            <span className="text-xs text-muted-foreground font-mono">USD</span>
          </div>

          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
                <CreditCard className="size-12 text-accent stroke-[1.5]" />
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                  No invoices generated
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Statements will appear here upon completion of each billing cycle.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-raised/50 text-muted-foreground uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3">Invoice</th>
                    <th className="px-6 py-3">Due Date</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-foreground">
                  {invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-raised/40 transition-colors">
                      <td className="px-6 py-3.5 font-mono text-foreground font-medium">
                        {inv.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-6 py-3.5 text-muted-foreground font-mono">
                        {formatDate(inv.due_date || inv.created_at)}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-foreground tabular-nums">
                        {formatMoney(inv.amount_cents)}
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={inv.status === 'paid' ? 'verified' : inv.status === 'overdue' ? 'possible' : 'default'}
                          dot
                        >
                          {inv.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="inline-flex items-center gap-1 text-accent hover:underline font-medium"
                        >
                          <Download className="size-3.5" /> Print
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </ConsoleShell>
  )
}
