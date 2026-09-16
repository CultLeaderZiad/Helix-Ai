'use client'

import { useState } from 'react'
import {
  X,
  FileCheck2,
  DollarSign,
  ShieldCheck,
  CreditCard,
  Lock,
  Printer,
  CheckCircle2,
  Languages,
  ExternalLink,
  Building2,
  Sparkles,
} from 'lucide-react'
import type { ProposalDocument } from '@/lib/proposals/generator'
import { cn } from '@/lib/utils'

interface ProposalModalProps {
  proposal: ProposalDocument
  onClose: () => void
}

export function ProposalModal({ proposal, onClose }: ProposalModalProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const formatPrice = (cents: number) => {
    return `${proposal.currency} ${(cents / 100).toLocaleString()}`
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative my-8 w-full max-w-3xl rounded-2xl border border-cyan-500/40 bg-[#0b1220] p-6 lg:p-8 shadow-2xl text-slate-200"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400">
                {proposal.id}
              </span>
              <h2 className="font-display text-lg font-bold text-white">
                {isAr ? 'عرض التنفيذ الفني والمواصفات المعمارية' : 'Executive Systems Proposal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(l => (l === 'en' ? 'ar' : 'en'))}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121c2e] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Languages className="size-3.5" />
              {isAr ? 'English' : 'العربية'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#121c2e] px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
            >
              <Printer className="size-3.5" />
              {isAr ? 'طباعة' : 'Print'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Client & Metadata Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-slate-800/80 bg-[#0f172a]/80 p-4 text-xs">
          <div>
            <span className="text-slate-400">{isAr ? 'العميل المستفيد:' : 'Client Workspace:'}</span>
            <p className="font-bold text-white text-sm mt-0.5">{proposal.clientBusinessName}</p>
          </div>
          <div>
            <span className="text-slate-400">{isAr ? 'الشريحة الإقليمية:' : 'Regional Classification:'}</span>
            <p className="font-bold text-cyan-300 text-sm mt-0.5 font-mono">
              {proposal.regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}
            </p>
          </div>
          <div>
            <span className="text-slate-400">{isAr ? 'تاريخ الانتهاء:' : 'Validity Period:'}</span>
            <p className="font-bold text-white text-sm mt-0.5 font-mono">
              {new Date(proposal.expiresAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            {isAr ? 'بنود النظام والتجهيز المعماري' : 'Architecture & Deliverables Breakdown'}
          </h3>
          <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-[#0e1628]">
            {proposal.items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
                <div className="max-w-md">
                  <p className="font-semibold text-white text-sm">{isAr ? item.nameAr : item.name}</p>
                  <p className="mt-1 text-slate-400 leading-relaxed">
                    {isAr ? item.descriptionAr : item.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] text-cyan-300 font-mono">
                    {item.type === 'setup'
                      ? isAr
                        ? 'إعداد وتأسيس'
                        : 'One-Time Setup'
                      : isAr
                        ? 'اشتراك شهري'
                        : 'Monthly Retainer'}
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-white">
                    {formatPrice(item.amountCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Summary */}
        <div className="mt-6 rounded-xl border border-cyan-500/30 bg-[#0e1b2f] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-slate-400">
                {isAr ? 'إجمالي الدفعة الأولى (التجهيز + الشهر الأول):' : 'Total First-Month Investment:'}
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-cyan-300">
                {formatPrice(proposal.totalFirstMonthCents)}
              </p>
              <p className="mt-1 text-[11px] text-slate-400">
                {isAr
                  ? `الاشتراك المستمر اللاحق: ${formatPrice(proposal.monthlyRetainerCents)} شهرياً`
                  : `Subsequent recurring retainer: ${formatPrice(proposal.monthlyRetainerCents)} / month`}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(
                  isAr
                    ? `جاري التوجيه إلى بوابة الدفع الآمنة (${proposal.currency}) عبر مدى / Apple Pay!`
                    : `Redirecting to secure localized payment link (${proposal.currency})!`
                )
              }}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(0,210,255,0.3)]"
            >
              <Lock className="size-4" />
              {isAr ? 'الموافقة وسداد دفعة البدء' : 'Accept & Settle Deposit'}
            </button>
          </div>
        </div>

        {/* SLA Terms */}
        <div className="mt-6 rounded-xl border border-slate-800 bg-[#0c1424] p-4 text-xs">
          <span className="font-bold text-white flex items-center gap-1.5 mb-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            {isAr ? 'ضمانات مستوى الخدمة والخصوصية (SLA):' : 'Enterprise Service Level Agreement (SLA):'}
          </span>
          <ul className="space-y-1.5 text-slate-400">
            {(isAr ? proposal.slaTermsAr : proposal.slaTerms).map((term, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-cyan-400 shrink-0 mt-0.5" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
