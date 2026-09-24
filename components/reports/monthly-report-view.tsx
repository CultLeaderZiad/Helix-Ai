'use client'

import { useState } from 'react'
import {
  FileText,
  TrendingUp,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  Printer,
  Languages,
} from 'lucide-react'
import type { MonthlyReportData } from '@/lib/reports/generator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface MonthlyReportViewProps {
  report: MonthlyReportData
}

export function MonthlyReportView({ report }: MonthlyReportViewProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const formatMoney = (cents: number) => {
    return `${report.currency} ${(cents / 100).toLocaleString()}`
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Executive Report Document Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono tracking-wider text-[11px]">
              {report.reportId}
            </Badge>
            <Badge variant="verified" dot>
              {isAr ? 'تقرير مدقق' : 'Verified Retainer Audit'}
            </Badge>
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isAr ? 'تقرير الأداء والتحصيل الشهري' : 'Monthly Performance & Operations Report'}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            {report.clientBusinessName} • {report.cyclePeriod}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLanguage((l) => (l === 'en' ? 'ar' : 'en'))}
            className="gap-1.5"
          >
            <Languages className="size-3.5" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5"
          >
            <Printer className="size-3.5" />
            <span>{isAr ? 'طباعة التقرير التنفيذي' : 'Print Executive Report'}</span>
          </Button>
        </div>
      </div>

      {/* Boardroom KPI Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={isAr ? 'مكالمات صوتية' : 'Voice Calls Logged'}
          value={report.totalCallsHandled}
          hint={isAr ? 'جلسات المكالمات المسجلة' : 'Recorded voice interaction sessions'}
          icon={<PhoneCall className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'تفاعلات الواتساب' : 'WhatsApp Conversations'}
          value={report.totalWhatsAppMessages}
          hint={isAr ? 'محادثات تفاعلية عبر الواتساب' : 'Recorded WhatsApp threads'}
          icon={<MessageSquare className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'دقة الحقائق المستخرجة' : 'Fact Verification Rate'}
          value={report.factAccuracyRate !== null ? `${report.factAccuracyRate}%` : '—'}
          hint={
            report.totalFactsCount > 0
              ? `${report.verifiedFactsCount} of ${report.totalFactsCount} facts verified`
              : (isAr ? 'لا توجد ملاحظات مسجلة' : 'No observations logged')
          }
          icon={<ShieldCheck className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'مضاعف العائد الاستثماري' : 'Net ROI Multiplier'}
          value={report.roiMultiplier}
          hint={
            report.recoveredRevenueCents > 0
              ? `${isAr ? 'مبيعات منجزة:' : 'Closed revenue:'} ${formatMoney(report.recoveredRevenueCents)}`
              : (isAr ? 'لا توجد صفقات مغلقة بعد' : 'No closed deals recorded yet')
          }
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* Executive Narrative Briefing */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-accent" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground uppercase">
              {isAr ? 'الملخص التنفيذي للأداء الشهري' : 'Executive Retainer Narrative & Briefing'}
            </h2>
          </div>
          <Badge variant="default" className="font-mono text-[10px]">
            POSTGRESQL AUDIT TRAIL
          </Badge>
        </div>
        <p className="text-sm text-foreground/90 leading-relaxed font-sans">
          {isAr ? report.executiveSummaryAr : report.executiveSummary}
        </p>
      </Card>

      {/* System Architecture Operational Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground uppercase">
              {isAr ? 'تفاصيل أداء الأنظمة التشغيلية' : 'System Architecture Telemetry & Throughput'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified operational events recorded during this retainer period.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {report.operationalBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-border bg-raised/40 p-4 text-xs hover:bg-raised/70 transition-colors"
            >
              <div>
                <p className="font-semibold text-foreground text-sm">
                  {isAr ? item.systemAr : item.system}
                </p>
                <p className="mt-0.5 text-muted-foreground font-mono text-[11px]">
                  {isAr ? item.metricAr : item.metric}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-foreground tabular-nums">
                  {item.count}
                </span>
                <span className="block text-[10px] text-muted-foreground font-mono uppercase">
                  {isAr ? item.unitAr : item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Retainer Billing & Invoicing Ledger */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-foreground uppercase">
              {isAr ? 'سجل الفواتير والدفعات' : 'Retainer Invoicing & Financial Ledger'}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAr
                ? 'تدقيق مالي مباشر مرتبط بحساب العميل وسجلات الفواتير.'
                : 'Direct financial ledger linked to workspace retainer contract records.'}
            </p>
          </div>
          {report.monthlyRetainerCents > 0 && (
            <div className="inline-flex items-center gap-2 rounded-md border border-border bg-raised px-3 py-1.5 text-xs font-mono">
              <span className="text-muted-foreground">{isAr ? 'الاشتراك الشهري:' : 'Active Monthly Retainer:'}</span>
              <strong className="text-foreground font-semibold">{formatMoney(report.monthlyRetainerCents)}</strong>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{isAr ? 'رقم الفاتورة' : 'Invoice ID'}</TableHead>
                <TableHead>{isAr ? 'تاريخ الاستحقاق' : 'Date'}</TableHead>
                <TableHead>{isAr ? 'المبلغ' : 'Amount'}</TableHead>
                <TableHead className="text-right">{isAr ? 'الحالة' : 'Status'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.recentInvoices.length > 0 ? (
                report.recentInvoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium text-foreground">{inv.id}</TableCell>
                    <TableCell className="text-muted-foreground font-mono">{inv.date}</TableCell>
                    <TableCell className="font-semibold text-foreground tabular-nums">
                      {formatMoney(inv.amountCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={inv.status === 'paid' ? 'verified' : 'default'} dot>
                        {inv.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-muted-foreground font-mono text-xs">
                    {isAr ? 'لا توجد فواتير سابقة مسجلة' : 'No previous invoices logged for this workspace.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
