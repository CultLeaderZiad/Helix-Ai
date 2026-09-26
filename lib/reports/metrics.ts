export interface ReportMetricInput {
  businessName: string
  regionTier: 'gcc_enterprise' | 'mena_sme'
  callsHandled: number
  whatsAppMessages: number
  bookings: number
  missedCallEvents: number
  reactivationTouches: number
  verifiedFacts: number
  totalFacts: number
  wonValueCents: number
  invoicedCents: number
  retainerCents: number | null
  generatedAt: Date
  clientId: string
}

export interface ReportMetricResult {
  reportId: string
  cyclePeriod: string
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
  operationalBreakdown: Array<{
    system: string
    systemAr: string
    metric: string
    metricAr: string
    count: number
    unit: string
    unitAr: string
  }>
}

/** Counts and money come only from the caller. Zero stays zero. */
export function summarizeMonthlyReport(input: ReportMetricInput): ReportMetricResult {
  const currency = input.regionTier === 'gcc_enterprise' ? 'AED' : 'USD'
  const retainerKnown = input.retainerCents != null
  const monthlyRetainerCents = input.retainerCents ?? 0
  const totalInvoicedCents = input.invoicedCents
  const recovered = input.wonValueCents
  const roiBase = totalInvoicedCents > 0 ? totalInvoicedCents : monthlyRetainerCents
  const roiMultiplier = roiBase > 0 ? `${(recovered / roiBase).toFixed(1)}x` : '—'
  const factAccuracyRate =
    input.totalFacts > 0 ? Math.round((input.verifiedFacts / input.totalFacts) * 100) : null

  const period = input.generatedAt.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const reportId = `REP-${input.generatedAt.getUTCFullYear()}-${String(input.generatedAt.getUTCMonth() + 1).padStart(2, '0')}-${input.clientId.slice(0, 6).toUpperCase()}`

  const summaryEn =
    input.callsHandled + input.whatsAppMessages + input.totalFacts + recovered + totalInvoicedCents === 0
      ? `No measured calls, messages, invoices, or closed revenue are recorded for ${input.businessName} in this period.`
      : `${input.businessName}: ${input.callsHandled} recorded call events, ${input.whatsAppMessages} recorded WhatsApp messages, ${input.verifiedFacts} verified facts, and ${(recovered / 100).toLocaleString('en-US')} ${currency} in closed-won deal value.`

  const summaryAr =
    input.callsHandled + input.whatsAppMessages + input.totalFacts + recovered + totalInvoicedCents === 0
      ? `لا توجد مكالمات أو رسائل أو فواتير أو إيرادات مغلقة مسجّلة لـ ${input.businessName} في هذه الفترة.`
      : `${input.businessName}: ${input.callsHandled} حدث اتصال مسجّل، ${input.whatsAppMessages} رسالة واتساب مسجّلة، ${input.verifiedFacts} حقيقة مؤكدة، و ${(recovered / 100).toLocaleString('en-US')} ${currency} قيمة صفقات مغلقة.`

  return {
    reportId,
    cyclePeriod: period,
    currency,
    monthlyRetainerCents,
    retainerKnown,
    totalInvoicedCents,
    estimatedRecoveredValueCents: recovered,
    roiMultiplier,
    totalCallsHandled: input.callsHandled,
    totalWhatsAppMessages: input.whatsAppMessages,
    verifiedFactsCount: input.verifiedFacts,
    factAccuracyRate,
    systemUptimePercentage: 'Not measured',
    executiveSummary: summaryEn,
    executiveSummaryAr: summaryAr,
    operationalBreakdown: [
      {
        system: 'Booking receptionist',
        systemAr: 'موظف الاستقبال والحجوزات',
        metric: 'Bookings recorded',
        metricAr: 'حجوزات مسجّلة',
        count: input.bookings,
        unit: 'bookings',
        unitAr: 'حجز',
      },
      {
        system: 'Missed-call response',
        systemAr: 'الرد على المكالمات الفائتة',
        metric: 'Call events recorded',
        metricAr: 'أحداث اتصال مسجّلة',
        count: input.missedCallEvents,
        unit: 'events',
        unitAr: 'حدث',
      },
      {
        system: 'Lead reactivation',
        systemAr: 'إعادة تنشيط العملاء',
        metric: 'Reactivation touches',
        metricAr: 'محاولات إعادة تنشيط',
        count: input.reactivationTouches,
        unit: 'touches',
        unitAr: 'محاولة',
      },
      {
        system: 'Evidence ledger',
        systemAr: 'سجل الأدلة',
        metric: 'Facts on file',
        metricAr: 'حقائق مسجّلة',
        count: input.totalFacts,
        unit: 'facts',
        unitAr: 'حقيقة',
      },
    ],
  }
}
