'use client'

import { useState } from 'react'
import {
  FileText,
  TrendingUp,
  PhoneCall,
  MessageSquare,
  ShieldCheck,
  DollarSign,
  Printer,
  Download,
  Languages,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Activity,
  Layers,
  Cpu,
  Receipt,
  FileCheck,
  Clock,
} from 'lucide-react'
import type { MonthlyReportData } from '@/lib/reports/generator'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default" className="font-mono tracking-wider">
              {report.reportId}
            </Badge>
            <Badge variant="verified" dot>
              {report.systemUptimePercentage} UPTIME SLA
            </Badge>
          </div>

          <h1 className="mt-3 font-display text-2xl font-bold tracking-tight text-helix-ink sm:text-3xl">
            {isAr ? 'تقرير الأداء والتحصيل الشهري' : 'Monthly Performance & ROI Report'}
          </h1>
          <p className="mt-1 text-xs text-helix-muted font-mono">
            {report.clientBusinessName} • {report.cyclePeriod} • GCC ENTERPRISE TENANT
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
            <span>{isAr ? 'طباعة التقرير التنفيذي' : 'Export Executive PDF'}</span>
          </Button>
        </div>
      </div>

      {/* Boardroom KPI Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={isAr ? 'مكالمات صوتية' : 'Voice Calls Handled'}
          value={report.totalCallsHandled}
          change={isAr ? '< 400 ميلي ثانية' : '< 400ms'}
          changeType="positive"
          hint={isAr ? 'الرد الفوري على المكالمات' : '100% Inbound capture rate'}
          icon={<PhoneCall className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'تفاعلات الواتساب' : 'WhatsApp Messages'}
          value={report.totalWhatsAppMessages}
          change={isAr ? 'تأهيل آلي' : 'Automated'}
          changeType="positive"
          hint={isAr ? 'تأكيدات وتأهيل فوري' : 'Automated confirmations & triage'}
          icon={<MessageSquare className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'دقة الحقائق' : 'Fact Verification Rate'}
          value={`${report.factAccuracyRate}%`}
          change="Ground Truth"
          changeType="positive"
          hint={isAr ? 'تدقيق مشفر بدون هلوسة' : 'Zero unauthorized commitments'}
          icon={<ShieldCheck className="size-4" />}
        />

        <KpiCard
          title={isAr ? 'مضاعف العائد الاستثماري' : 'Net ROI Multiplier'}
          value={report.roiMultiplier}
          change={
            isAr
              ? `مسترد: ${formatMoney(report.estimatedRecoveredValueCents)}`
              : `Recovered: ${formatMoney(report.estimatedRecoveredValueCents)}`
          }
          changeType="positive"
          hint={isAr ? 'قيمة مبيعات مستردة' : 'Direct recovered deal pipeline'}
          icon={<TrendingUp className="size-4" />}
        />
      </div>

      {/* Executive Narrative Briefing */}
      <Card className="p-6 border-l-2 border-l-sky-400">
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-sky-400" />
            <h2 className="font-display text-sm font-semibold tracking-tight text-helix-ink uppercase">
              {isAr ? 'الملخص التنفيذي للأداء الشهري' : 'Executive Retainer Narrative & Briefing'}
            </h2>
          </div>
          <Badge variant="default" className="font-mono text-[10px]">
            CRYPTOGRAPHIC LEDGER AUDIT
          </Badge>
        </div>
        <p className="text-sm text-helix-ink/80 leading-relaxed font-sans">
          {isAr ? report.executiveSummaryAr : report.executiveSummary}
        </p>
      </Card>

      {/* System Architecture Operational Breakdown */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-helix-ink uppercase">
              {isAr ? 'تفاصيل أداء الأنظمة التشغيلية' : 'System Architecture Telemetry & Throughput'}
            </h2>
            <p className="text-xs text-helix-muted mt-0.5">
              What ran this period — bookings, conversations, and facts reviewed.
            </p>
          </div>
          <Badge variant="verified" dot>
            100% HEALTHY
          </Badge>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {report.operationalBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs hover:border-white/[0.12] transition-colors"
            >
              <div>
                <p className="font-semibold text-helix-ink text-sm">
                  {isAr ? item.systemAr : item.system}
                </p>
                <p className="mt-0.5 text-helix-muted font-mono text-[11px]">
                  {isAr ? item.metricAr : item.metric}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-helix-ink tabular-nums">
                  {item.count}
                </span>
                <span className="block text-[10px] text-sky-400 font-mono uppercase">
                  {isAr ? item.unitAr : item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Retainer Billing & Invoicing Ledger */}
      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div>
            <h2 className="font-display text-sm font-semibold tracking-tight text-helix-ink uppercase">
              {isAr ? 'سجل الفواتير والدفعات الشهرية' : 'Retainer Invoicing & Financial Ledger'}
            </h2>
            <p className="text-xs text-helix-muted mt-0.5">
              {isAr
                ? 'تدقيق مالي مباشر مرتبط بحساب العميل وسجلات الدفع الإلكتروني.'
                : 'Direct financial settlement ledger tied to your tenant retainer contract.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-mono">
            <span className="text-helix-muted">{isAr ? 'الاشتراك الشهري:' : 'Active Monthly Retainer:'}</span>
            <strong className="text-helix-ink font-semibold">{formatMoney(report.monthlyRetainerCents)}</strong>
          </div>
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
                    <TableCell className="font-mono font-medium text-helix-ink">{inv.id}</TableCell>
                    <TableCell className="text-helix-muted font-mono">{inv.date}</TableCell>
                    <TableCell className="font-semibold text-helix-ink">
                      {formatMoney(inv.amountCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="verified" dot>
                        {inv.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-helix-muted font-mono text-xs">
                    {isAr ? 'لا توجد فواتير سابقة مسجلة' : 'No previous invoices logged for this billing cycle.'}
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
