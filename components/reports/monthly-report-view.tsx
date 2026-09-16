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
} from 'lucide-react'
import type { MonthlyReportData } from '@/lib/reports/generator'
import { cn } from '@/lib/utils'

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
    <div className="mx-auto w-full max-w-6xl" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Report Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-1 text-xs font-semibold font-mono uppercase">
              {report.reportId}
            </span>
            <span className="rounded-md bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-xs text-emerald-400">
              {report.systemUptimePercentage} Uptime SLA
            </span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isAr ? 'تقرير الأداء والتحصيل الشهري' : 'Monthly Performance & ROI Report'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {report.clientBusinessName} • {report.cyclePeriod}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLanguage(l => (l === 'en' ? 'ar' : 'en'))}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-[#121c2e] px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Languages className="size-3.5" />
            {isAr ? 'English' : 'العربية'}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
          >
            <Printer className="size-3.5" />
            {isAr ? 'طباعة التقرير التنفيذي' : 'Print Executive PDF'}
          </button>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-[#0e1628] p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PhoneCall className="size-3.5 text-cyan-400" />
            {isAr ? 'مكالمات تمت معالجتها' : 'Voice Calls Handled'}
          </span>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
            {report.totalCallsHandled}
          </p>
          <p className="mt-1 text-xs text-emerald-400 font-medium">
            {isAr ? '100% الرد الفوري < 400 ميلي ثانية' : '100% Inbound Capture (< 400ms)'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0e1628] p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="size-3.5 text-emerald-400" />
            {isAr ? 'تفاعلات الواتساب الذكية' : 'WhatsApp Interactions'}
          </span>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
            {report.totalWhatsAppMessages}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {isAr ? 'تأكيدات المواعيد والتأهيل الفوري' : 'Automated confirmations & triage'}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-[#0e1628] p-5 shadow-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="size-3.5 text-purple-400" />
            {isAr ? 'دقة تدقيق الحقائق' : 'Fact Verification Rate'}
          </span>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-white">
            {report.factAccuracyRate}%
          </p>
          <p className="mt-1 text-xs text-purple-300">
            {isAr ? 'تدقيق مشفر بدون أي هلوسة' : 'Zero unauthorized commitments'}
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/40 bg-[#0c1830] p-5 shadow-[0_0_25px_rgba(0,210,255,0.15)]">
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <TrendingUp className="size-3.5 text-cyan-400" />
            {isAr ? 'مضاعف العائد الاستثماري' : 'Net ROI Multiplier'}
          </span>
          <p className="mt-2 font-display text-3xl font-bold tabular-nums text-cyan-300">
            {report.roiMultiplier}
          </p>
          <p className="mt-1 text-xs text-slate-300">
            {isAr
              ? `قيمة مبيعات مستردة: ${formatMoney(report.estimatedRecoveredValueCents)}`
              : `Recovered: ${formatMoney(report.estimatedRecoveredValueCents)}`}
          </p>
        </div>
      </div>

      {/* Executive Narrative Summary Box */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0c1424] p-6 shadow-xl">
        <h3 className="font-display text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="size-4 text-cyan-400" />
          {isAr ? 'الملخص التنفيذي للأداء الشهري' : 'Executive Retainer Narrative'}
        </h3>
        <p className="mt-3 text-sm text-slate-300 leading-relaxed">
          {isAr ? report.executiveSummaryAr : report.executiveSummary}
        </p>
      </div>

      {/* Operational Breakdown by System Architecture */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0e1628] p-6 shadow-xl">
        <h3 className="font-display text-base font-bold text-white mb-4">
          {isAr ? 'تفاصيل أداء الأنظمة التشغيلية' : 'System Architecture Operational Breakdown'}
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {report.operationalBreakdown.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-[#121c2e] p-4 text-xs"
            >
              <div>
                <p className="font-semibold text-white text-sm">
                  {isAr ? item.systemAr : item.system}
                </p>
                <p className="mt-0.5 text-slate-400">{isAr ? item.metricAr : item.metric}</p>
              </div>
              <div className="text-right">
                <span className="font-display text-2xl font-bold text-cyan-300 tabular-nums">
                  {item.count}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {isAr ? item.unitAr : item.unit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial & Invoicing Audit Loop */}
      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#0e1628] p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              {isAr ? 'سجل الفواتير والدفعات الشهرية' : 'Retainer Billing Accounts & Invoice History'}
            </h3>
            <p className="text-xs text-slate-400">
              {isAr
                ? 'تدقيق مالي مباشر مرتبط بحساب العميل وسجلات الدفع الإلكتروني.'
                : 'Direct financial ledger linked to your tenant billing account.'}
            </p>
          </div>
          <span className="font-mono text-xs text-cyan-300">
            {isAr ? 'الاشتراك الشهري الحالي:' : 'Active Monthly Retainer:'}{' '}
            <strong className="text-white">{formatMoney(report.monthlyRetainerCents)}</strong>
          </span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 pr-4 font-semibold">{isAr ? 'رقم الفاتورة' : 'Invoice ID'}</th>
                <th className="py-2.5 pr-4 font-semibold">{isAr ? 'تاريخ الاستحقاق' : 'Date'}</th>
                <th className="py-2.5 pr-4 font-semibold">{isAr ? 'المبلغ' : 'Amount'}</th>
                <th className="py-2.5 font-semibold text-right">{isAr ? 'الحالة' : 'Status'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {report.recentInvoices.length > 0 ? (
                report.recentInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 pr-4 font-mono font-medium text-white">{inv.id}</td>
                    <td className="py-3 pr-4 text-slate-400">{inv.date}</td>
                    <td className="py-3 pr-4 font-bold text-slate-200">
                      {formatMoney(inv.amountCents)}
                    </td>
                    <td className="py-3 text-right">
                      <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold">
                        {inv.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-slate-500">
                    {isAr ? 'لا توجد فواتير سابقة مسجلة' : 'No previous invoices logged.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
