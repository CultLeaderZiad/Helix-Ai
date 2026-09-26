import type { SupabaseClient } from '@supabase/supabase-js'
import type { RegionTier } from '@/lib/schema'
import { summarizeMonthlyReport } from '@/lib/reports/metrics'

export interface OperationalMetric {
  system: string
  systemAr: string
  metric: string
  metricAr: string
  count: number
  unit: string
  unitAr: string
}

export interface MonthlyReportData {
  reportId: string
  cyclePeriod: string
  generatedAt: string
  clientBusinessName: string
  regionTier: RegionTier
  currency: string
  monthlyRetainerCents: number
  retainerKnown: boolean
  totalInvoicedCents: number
  estimatedRecoveredValueCents: number
  roiMultiplier: string
  totalCallsHandled: number
  totalWhatsAppMessages: number
  verifiedFactsCount: number
  factAccuracyRate: number | null
  systemUptimePercentage: string
  executiveSummary: string
  executiveSummaryAr: string
  operationalBreakdown: OperationalMetric[]
  recentInvoices: {
    id: string
    date: string
    amountCents: number
    status: string
  }[]
}

function countEvents(rows: Array<{ event_type?: string | null }> | null, needle: string): number {
  return (rows ?? []).filter(row => (row.event_type || '').toLowerCase().includes(needle)).length
}

export async function generateClientMonthlyReport(
  supabase: SupabaseClient,
  clientId: string
): Promise<MonthlyReportData> {
  const [clientRes, billingRes, invoicesRes, activityRes, factsRes, dealsRes, bookingsRes, touchesRes] =
    await Promise.all([
      supabase
        .from('clients')
        .select('id, business_name, region_tier')
        .eq('id', clientId)
        .maybeSingle(),
      supabase.from('billing_accounts').select('*').eq('client_id', clientId).maybeSingle(),
      supabase
        .from('invoices')
        .select('id, amount_cents, due_date, status, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(12),
      supabase.from('activity_log').select('id, event_type, created_at').eq('client_id', clientId),
      supabase.from('contact_facts').select('id, status, evidence_band').eq('client_id', clientId),
      supabase.from('deals').select('id, value_cents, stage').eq('client_id', clientId),
      supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('client_id', clientId),
      supabase
        .from('reactivation_touches')
        .select('id', { count: 'exact', head: true })
        .eq('client_id', clientId),
    ])

  const client = clientRes.data
  const businessName = client?.business_name || 'Workspace'
  const regionTier: RegionTier = client?.region_tier === 'mena_sme' ? 'mena_sme' : 'gcc_enterprise'
  const billing = (billingRes.data ?? null) as Record<string, unknown> | null
  const retainerRaw = billing?.monthly_retainer_cents ?? billing?.retainer_cents
  const retainerCents = typeof retainerRaw === 'number' ? retainerRaw : null

  const activities = activityRes.error ? [] : (activityRes.data ?? [])
  const facts = factsRes.error ? [] : (factsRes.data ?? [])
  const deals = dealsRes.error ? [] : (dealsRes.data ?? [])
  const verifiedCount = facts.filter(f => f.status === 'applied' || f.evidence_band === 'verified').length
  const wonValueCents = deals
    .filter(d => d.stage === 'closed_won' || d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const invoicedCents = (invoicesRes.data ?? []).reduce((sum, inv) => sum + (inv.amount_cents ?? 0), 0)

  const callsFromLog = countEvents(activities, 'call')
  const whatsappFromLog = countEvents(activities, 'whatsapp')
  const generatedAt = new Date()
  const summary = summarizeMonthlyReport({
    businessName,
    regionTier,
    callsHandled: callsFromLog,
    whatsAppMessages: whatsappFromLog,
    bookings: bookingsRes.count ?? 0,
    missedCallEvents: callsFromLog,
    reactivationTouches: touchesRes.count ?? 0,
    verifiedFacts: verifiedCount,
    totalFacts: facts.length,
    wonValueCents,
    invoicedCents,
    retainerCents,
    generatedAt,
    clientId,
  })

  return {
    reportId: summary.reportId,
    cyclePeriod: summary.cyclePeriod,
    generatedAt: generatedAt.toISOString(),
    clientBusinessName: businessName,
    regionTier,
    currency: summary.currency,
    monthlyRetainerCents: summary.monthlyRetainerCents,
    retainerKnown: summary.retainerKnown,
    totalInvoicedCents: summary.totalInvoicedCents,
    estimatedRecoveredValueCents: summary.estimatedRecoveredValueCents,
    roiMultiplier: summary.roiMultiplier,
    totalCallsHandled: summary.totalCallsHandled,
    totalWhatsAppMessages: summary.totalWhatsAppMessages,
    verifiedFactsCount: summary.verifiedFactsCount,
    factAccuracyRate: summary.factAccuracyRate,
    systemUptimePercentage: summary.systemUptimePercentage,
    executiveSummary: summary.executiveSummary,
    executiveSummaryAr: summary.executiveSummaryAr,
    operationalBreakdown: summary.operationalBreakdown,
    recentInvoices: (invoicesRes.data ?? []).map(inv => ({
      id: inv.id.slice(0, 8).toUpperCase(),
      date: new Date(inv.created_at || generatedAt.toISOString()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amountCents: inv.amount_cents,
      status: inv.status,
    })),
  }
}
