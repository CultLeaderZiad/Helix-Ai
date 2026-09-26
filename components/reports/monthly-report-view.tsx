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
    <div className="w-full space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Executive Report Document Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#D9D4CB]/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-[6px] bg-[#141414] px-2.5 py-1 font-mono text-[11px] font-semibold text-white">
              {report.reportId}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 px-2.5 py-0.5 text-11 font-mono font-semibold text-[#0B6E4F]">
              <span className="size-1.5 rounded-full bg-[#0B6E4F]" />
              {report.systemUptimePercentage}
            </span>
          </div>

          <h1 className="mt-3 text-24 sm:text-28 font-bold tracking-tight text-[#141414]">
            {isAr ? 'تقرير الأداء والتحصيل الشهري' : 'Monthly Performance & ROI Report'}
          </h1>
          <p className="mt-1 text-xs text-[#6E6B65] font-mono">
            {report.clientBusinessName} • {report.cyclePeriod} • {report.regionTier === 'mena_sme' ? 'MENA SME' : 'GCC'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLanguage((l) => (l === 'en' ? 'ar' : 'en'))}
            className="gap-1.5 border-[#D9D4CB] bg-[#FFFEFA] text-[#141414] hover:bg-[#F3F1EC]"
          >
            <Languages className="size-3.5" />
            <span>{isAr ? 'English' : 'العربية'}</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-[#141414] text-white hover:bg-black"
          >
            <Printer className="size-3.5" />
            <span>{isAr ? 'طباعة' : 'Print'}</span>
          </Button>
        </div>
      </div>

      {/* Boardroom KPI Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title={isAr ? 'مكالمات صوتية' : 'Voice Calls Handled'}
          value={report.totalCallsHandled}
          hint={isAr ? 'من سجل النشاط فقط' : 'Counted from the activity log only'}
          icon={<PhoneCall className="size-4 text-[#0B6E4F]" />}
        />

        <KpiCard
          title={isAr ? 'تفاعلات الواتساب' : 'WhatsApp Messages'}
          value={report.totalWhatsAppMessages}
          hint={isAr ? 'من سجل النشاط فقط' : 'Counted from the activity log only'}
          icon={<MessageSquare className="size-4 text-[#0B6E4F]" />}
        />

        <KpiCard
          title={isAr ? 'دقة الحقائق' : 'Fact Verification Rate'}
          value={report.factAccuracyRate == null ? '—' : `${report.factAccuracyRate}%`}
          hint={
            report.factAccuracyRate == null
              ? isAr
                ? 'لا توجد حقائق مسجّلة'
                : 'No facts recorded'
              : isAr
                ? 'الحقائق المؤكدة من أصل المسجّل'
                : 'Verified facts divided by facts on file'
          }
          icon={<ShieldCheck className="size-4 text-[#0B6E4F]" />}
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
          icon={<TrendingUp className="size-4 text-[#0B6E4F]" />}
        />
      </div>

      {/* Executive Narrative Briefing */}
      <div className="rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] border-l-4 border-l-[#0B6E4F] p-6 shadow-2xs">
        <div className="flex items-center justify-between gap-4 border-b border-[#D9D4CB]/60 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[#0B6E4F]" />
            <h2 className="text-14 font-semibold tracking-tight text-[#141414] uppercase">
              {isAr ? 'الملخص التنفيذي للأداء الشهري' : 'Executive Retainer Narrative & Briefing'}
            </h2>
          </div>
          <span className="rounded-[6px] bg-[#141414] px-2 py-0.5 font-mono text-[10px] font-semibold text-white">
            {isAr ? 'من قاعدة البيانات' : 'FROM DATABASE'}
          </span>
        </div>
        <p className="text-14 text-[#141414]/90 leading-relaxed">
          {isAr ? report.executiveSummaryAr : report.executiveSummary}
        </p>
      </div>

      {/* System Architecture Operational Breakdown */}
      <div className="rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#D9D4CB]/60 pb-3">
          <div>
            <h2 className="text-14 font-semibold tracking-tight text-[#141414] uppercase">
              {isAr ? 'تفاصيل أداء الأنظمة التشغيلية' : 'System Architecture Telemetry & Throughput'}
            </h2>
            <p className="text-12 text-[#6E6B65] mt-0.5">
              What ran this period — bookings, conversations, and facts reviewed.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 px-2.5 py-0.5 text-11 font-mono font-semibold text-[#0B6E4F]">
            <span className="size-1.5 rounded-full bg-[#0B6E4F]" />
            {isAr ? 'أرقام مسجّلة' : 'RECORDED COUNTS'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {report.operationalBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-[10px] border border-[#D9D4CB]/70 bg-[#F7F5F0] p-4 text-xs hover:border-[#141414]/30 transition-colors"
            >
              <div>
                <p className="font-semibold text-[#141414] text-14">
                  {isAr ? item.systemAr : item.system}
                </p>
                <p className="mt-0.5 text-[#6E6B65] font-mono text-[11px]">
                  {isAr ? item.metricAr : item.metric}
                </p>
              </div>
              <div className="text-right">
                <span className="font-display text-24 font-bold text-[#141414] tabular-nums">
                  {item.count}
                </span>
                <span className="block text-[10px] text-[#0B6E4F] font-mono uppercase font-semibold">
                  {isAr ? item.unitAr : item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retainer Billing & Invoicing Ledger */}
      <div className="rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D9D4CB]/60 pb-4">
          <div>
            <h2 className="text-14 font-semibold tracking-tight text-[#141414] uppercase">
              {isAr ? 'سجل الفواتير والدفعات الشهرية' : 'Retainer Invoicing & Financial Ledger'}
            </h2>
            <p className="text-12 text-[#6E6B65] mt-0.5">
              {isAr ? 'فواتير مسجّلة في قاعدة البيانات فقط.' : 'Invoices stored in the database only.'}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-[8px] border border-[#D9D4CB] bg-[#F7F5F0] px-3 py-1.5 text-12 font-mono">
            <span className="text-[#6E6B65]">{isAr ? 'المقابل الشهري:' : 'Monthly retainer:'}</span>
            <strong className="text-[#141414] font-semibold">
              {report.retainerKnown ? formatMoney(report.monthlyRetainerCents) : isAr ? 'غير مسجّل' : 'Not on file'}
            </strong>
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
                    <TableCell className="font-mono font-medium text-[#141414]">{inv.id}</TableCell>
                    <TableCell className="text-[#6E6B65] font-mono">{inv.date}</TableCell>
                    <TableCell className="font-semibold text-[#141414]">
                      {formatMoney(inv.amountCents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 px-2.5 py-0.5 text-11 font-mono font-semibold text-[#0B6E4F]">
                        <span className="size-1.5 rounded-full bg-[#0B6E4F]" />
                        {inv.status.toUpperCase()}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-8 text-center text-[#6E6B65] font-mono text-xs">
                    {isAr ? 'لا توجد فواتير سابقة مسجلة' : 'No previous invoices logged for this billing cycle.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
