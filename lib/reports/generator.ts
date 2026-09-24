import type { SupabaseClient } from '@supabase/supabase-js'
import type { RegionTier } from '@/lib/schema'

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
  totalInvoicedCents: number
  recoveredRevenueCents: number
  roiMultiplier: string
  totalCallsHandled: number
  totalWhatsAppMessages: number
  verifiedFactsCount: number
  totalFactsCount: number
  factAccuracyRate: number | null
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

export async function generateClientMonthlyReport(
  supabase: SupabaseClient,
  clientId: string
): Promise<MonthlyReportData> {
  const [clientRes, invoicesRes, activityRes, factsRes, dealsRes, conversationsRes] =
    await Promise.all([
      supabase
        .from('clients')
        .select('id, business_name, monthly_fee, region_tier, country')
        .eq('id', clientId)
        .maybeSingle(),
      supabase
        .from('invoices')
        .select('id, amount_cents, due_date, status, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase
        .from('activity_log')
        .select('id, event_type, created_at')
        .eq('client_id', clientId),
      supabase
        .from('contact_facts')
        .select('id, status, evidence_band')
        .eq('client_id', clientId),
      supabase
        .from('deals')
        .select('id, value_cents, stage')
        .eq('client_id', clientId),
      supabase
        .from('conversations')
        .select('id, channel')
        .eq('client_id', clientId),
    ])

  const client = clientRes.data
  const businessName = client?.business_name || 'Client Workspace'
  const regionTier: RegionTier = (client?.region_tier as RegionTier) || 'gcc_enterprise'
  const currency = regionTier === 'gcc_enterprise' ? 'AED' : 'USD'
  const monthlyRetainerCents = (client?.monthly_fee ?? 0) * 100

  // Real recorded telemetry
  const realActivities = activityRes.data ?? []
  const realConversations = conversationsRes.data ?? []
  const callsHandled = realConversations.filter(c => c.channel === 'voice' || c.channel === 'call').length
  const whatsAppMessages = realConversations.filter(c => c.channel === 'whatsapp').length

  // Real facts accuracy
  const realFacts = factsRes.data ?? []
  const verifiedCount = realFacts.filter(f => f.status === 'applied' || f.evidence_band === 'verified').length
  const totalFacts = realFacts.length
  const factAccuracyRate = totalFacts > 0 ? Math.round((verifiedCount / totalFacts) * 100) : null

  // Real recovered revenue from closed won deals
  const realDeals = dealsRes.data ?? []
  const wonValueCents = realDeals
    .filter(d => d.stage === 'closed_won')
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)

  const totalInvoicedCents = (invoicesRes.data ?? []).reduce(
    (sum, inv) => sum + (inv.amount_cents ?? 0),
    0
  )

  const roi = monthlyRetainerCents > 0 && wonValueCents > 0
    ? (wonValueCents / monthlyRetainerCents).toFixed(1) + 'x'
    : '—'

  const operationalBreakdown: OperationalMetric[] = [
    {
      system: 'Autonomous Booking Receptionist',
      systemAr: 'موظف الاستقبال وحجز المواعيد الصوتي',
      metric: 'Logged Voice Interactions',
      metricAr: 'مكالمات صوتية مسجلة',
      count: callsHandled,
      unit: 'calls',
      unitAr: 'مكالمة',
    },
    {
      system: 'WhatsApp Channel Ingest',
      systemAr: 'قناة الواتساب التفاعلية',
      metric: 'Logged WhatsApp Conversations',
      metricAr: 'محادثات واتساب مسجلة',
      count: whatsAppMessages,
      unit: 'conversations',
      unitAr: 'محادثة',
    },
    {
      system: 'Operational Activity Log',
      systemAr: 'سجل النشاط التشغيلي',
      metric: 'Recorded Pipeline Events',
      metricAr: 'أحداث تشغيلية مسجلة',
      count: realActivities.length,
      unit: 'events',
      unitAr: 'حدث',
    },
    {
      system: 'Ground-Truth Evidence Ledger',
      systemAr: 'سجل تدقيق الحقائق',
      metric: 'Verified AI Observations',
      metricAr: 'حقائق تم تأكيدها',
      count: verifiedCount,
      unit: 'facts verified',
      unitAr: 'حقيقة مؤكدة',
    },
  ]

  const reportId = `REP-${clientId.slice(0, 8).toUpperCase()}`

  return {
    reportId,
    cyclePeriod: 'Current Monthly Cycle',
    generatedAt: new Date().toISOString(),
    clientBusinessName: businessName,
    regionTier,
    currency,
    monthlyRetainerCents,
    totalInvoicedCents,
    recoveredRevenueCents: wonValueCents,
    roiMultiplier: roi,
    totalCallsHandled: callsHandled,
    totalWhatsAppMessages: whatsAppMessages,
    verifiedFactsCount: verifiedCount,
    totalFactsCount: totalFacts,
    factAccuracyRate,
    executiveSummary: `During this monthly retainer cycle, Helix AI systems recorded ${callsHandled} voice sessions and ${whatsAppMessages} WhatsApp interactions for ${businessName}. Real-time telemetry captured ${realActivities.length} operational events, with ${verifiedCount} human-verified facts committed to tenant profiles.`,
    executiveSummaryAr: `خلال دورة الاشتراك الحالية، سجلت أنظمة Helix AI عدد ${callsHandled} جلسة صوتية و ${whatsAppMessages} تفاعل عبر الواتساب لصالح ${businessName}. وثقت القياسات ${realActivities.length} حدثاً تشغيلياً، مع تأكيد ${verifiedCount} حقيقة موثقة في ملفات العملاء.`,
    operationalBreakdown,
    recentInvoices: (invoicesRes.data ?? []).map(inv => ({
      id: inv.id.slice(0, 8).toUpperCase(),
      date: new Date(inv.created_at || Date.now()).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      amountCents: inv.amount_cents,
      status: inv.status,
    })),
  }
}
