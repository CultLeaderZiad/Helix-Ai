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
  ArrowRight,
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
        className="relative my-8 w-full max-w-3xl rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-6 lg:p-8 shadow-2xl text-[#141414]"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-[#D9D4CB] pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0B6E4F]/10 text-[#0B6E4F]">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B6E4F] font-semibold">
                {proposal.id}
              </span>
              <h2 className="font-display text-lg font-bold text-[#141414]">
                {isAr ? 'عرض التنفيذ الفني والمواصفات المعمارية' : 'Executive Systems Proposal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(l => (l === 'en' ? 'ar' : 'en'))}
              className="flex items-center gap-1.5 rounded-lg border border-[#D9D4CB] bg-[#F7F5F0] px-2.5 py-1 text-xs font-semibold text-[#141414] hover:bg-[#EBE7DF] transition-colors"
            >
              <Languages className="size-3.5" />
              {isAr ? 'English' : 'العربية'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-[#D9D4CB] bg-[#F7F5F0] px-2.5 py-1 text-xs font-semibold text-[#141414] hover:bg-[#EBE7DF] transition-colors"
            >
              <Printer className="size-3.5" />
              {isAr ? 'طباعة' : 'Print'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-[#6E6B65] hover:text-[#141414] hover:bg-[#F3F1EC] transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Client & Metadata Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-4 text-xs">
          <div>
            <span className="text-[#6E6B65]">{isAr ? 'العميل المستفيد:' : 'Client Workspace:'}</span>
            <p className="font-bold text-[#141414] text-sm mt-0.5">{proposal.clientBusinessName}</p>
          </div>
          <div>
            <span className="text-[#6E6B65]">{isAr ? 'الشريحة الإقليمية:' : 'Regional Classification:'}</span>
            <p className="font-bold text-[#0B6E4F] text-sm mt-0.5 font-mono">
              {proposal.regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}
            </p>
          </div>
          <div>
            <span className="text-[#6E6B65]">{isAr ? 'تاريخ الانتهاء:' : 'Validity Period:'}</span>
            <p className="font-bold text-[#141414] text-sm mt-0.5 font-mono">
              {new Date(proposal.expiresAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#141414] mb-3">
            {isAr ? 'بنود النظام والتجهيز المعماري' : 'Architecture & Deliverables Breakdown'}
          </h3>
          <div className="divide-y divide-[#D9D4CB] rounded-xl border border-[#D9D4CB] bg-[#FFFEFA]">
            {proposal.items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
                <div className="max-w-md">
                  <p className="font-semibold text-[#141414] text-sm">{isAr ? item.nameAr : item.name}</p>
                  <p className="mt-1 text-[#6E6B65] leading-relaxed">
                    {isAr ? item.descriptionAr : item.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-[#0B6E4F]/10 border border-[#0B6E4F]/30 px-2 py-0.5 text-[10px] text-[#0B6E4F] font-mono font-semibold">
                    {item.type === 'setup'
                      ? isAr
                        ? 'إعداد وتأسيس'
                        : 'One-Time Setup'
                      : isAr
                        ? 'اشتراك شهري'
                        : 'Monthly Retainer'}
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-[#141414]">
                    {formatPrice(item.amountCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Summary */}
        <div className="mt-6 rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-[#6E6B65]">
                {isAr ? 'إجمالي الدفعة الأولى (التجهيز + الشهر الأول):' : 'Total First-Month Investment:'}
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-[#0B6E4F]">
                {formatPrice(proposal.totalFirstMonthCents)}
              </p>
              <p className="mt-1 text-[11px] text-[#6E6B65]">
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
                    ? 'تم توجيه العرض المالي للاعتماد المباشر وتأكيد العقد.'
                    : 'Proposal initiated for formal client sign-off.'
                )
              }}
              className="flex h-11 items-center gap-2 rounded-xl bg-[#141414] px-6 text-xs font-semibold text-white transition-colors hover:bg-black shadow-xs"
            >
              <span>{isAr ? 'اعتماد العرض وتفعيل العقد' : 'Approve & Execute Contract'}</span>
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>

        {/* SLA Terms */}
        <div className="mt-6 rounded-xl border border-helix-border bg-helix-surface p-4 text-xs">
          <span className="font-bold text-helix-ink flex items-center gap-1.5 mb-2">
            <ShieldCheck className="size-4 text-emerald-400" />
            {isAr ? 'ضمانات مستوى الخدمة والخصوصية (SLA):' : 'Enterprise Service Level Agreement (SLA):'}
          </span>
          <ul className="space-y-1.5 text-helix-muted">
            {(isAr ? proposal.slaTermsAr : proposal.slaTerms).map((term, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-helix-accent shrink-0 mt-0.5" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
