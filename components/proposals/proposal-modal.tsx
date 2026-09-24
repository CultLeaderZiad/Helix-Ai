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
} from 'lucide-react'
import type { ProposalDocument } from '@/lib/proposals/generator'
import { cn } from '@/lib/utils'

interface ProposalModalProps {
  proposal: ProposalDocument
  onClose: () => void
}

export function ProposalModal({ proposal, onClose }: ProposalModalProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const [submitted, setSubmitted] = useState(false)
  const isAr = language === 'ar'

  const formatPrice = (cents: number) => {
    return `${proposal.currency} ${(cents / 100).toLocaleString()}`
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto">
      <div
        dir={isAr ? 'rtl' : 'ltr'}
        className="relative my-8 w-full max-w-3xl rounded-xl border border-border bg-panel p-6 lg:p-8 shadow-2xl text-foreground"
      >
        {/* Top Control Bar */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <FileCheck2 className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-accent font-semibold">
                {proposal.id}
              </span>
              <h2 className="font-display text-lg font-bold text-foreground">
                {isAr ? 'عرض التنفيذ الفني والمواصفات المعمارية' : 'Executive Systems Proposal'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(l => (l === 'en' ? 'ar' : 'en'))}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-raised px-2.5 py-1 text-xs font-medium text-foreground hover:bg-panel transition-colors"
            >
              <Languages className="size-3.5" />
              {isAr ? 'English' : 'العربية'}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-raised px-2.5 py-1 text-xs font-medium text-foreground hover:bg-panel transition-colors"
            >
              <Printer className="size-3.5" />
              {isAr ? 'طباعة' : 'Print'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-raised transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Client & Metadata Strip */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 rounded-xl border border-border bg-raised p-4 text-xs">
          <div>
            <span className="text-muted-foreground">{isAr ? 'العميل المستفيد:' : 'Client Workspace:'}</span>
            <p className="font-bold text-foreground text-sm mt-0.5">{proposal.clientBusinessName}</p>
          </div>
          <div>
            <span className="text-muted-foreground">{isAr ? 'الشريحة الإقليمية:' : 'Regional Classification:'}</span>
            <p className="font-bold text-accent text-sm mt-0.5 font-mono">
              {proposal.regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">{isAr ? 'تاريخ الانتهاء:' : 'Validity Period:'}</span>
            <p className="font-bold text-foreground text-sm mt-0.5 font-mono">
              {new Date(proposal.expiresAt).toLocaleDateString(isAr ? 'ar-EG' : 'en-US')}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="mt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {isAr ? 'بنود النظام والتجهيز المعماري' : 'Architecture & Deliverables Breakdown'}
          </h3>
          <div className="divide-y divide-border rounded-xl border border-border bg-panel">
            {proposal.items.map((item, idx) => (
              <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-4 text-xs">
                <div className="max-w-md">
                  <p className="font-semibold text-foreground text-sm">{isAr ? item.nameAr : item.name}</p>
                  <p className="mt-1 text-muted-foreground leading-relaxed">
                    {isAr ? item.descriptionAr : item.description}
                  </p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-accent/10 border border-accent/20 px-2 py-0.5 text-[10px] text-accent font-mono">
                    {item.type === 'setup'
                      ? isAr
                        ? 'إعداد وتأسيس'
                        : 'One-Time Setup'
                      : isAr
                        ? 'اشتراك شهري'
                        : 'Monthly Retainer'}
                  </span>
                  <p className="mt-1 font-display text-base font-bold text-foreground">
                    {formatPrice(item.amountCents)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Investment Summary */}
        <div className="mt-6 rounded-xl border border-border bg-raised p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground">
                {isAr ? 'إجمالي الدفعة الأولى (التجهيز + الشهر الأول):' : 'Total First-Month Investment:'}
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-accent">
                {formatPrice(proposal.totalFirstMonthCents)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {isAr
                  ? `الاشتراك المستمر اللاحق: ${formatPrice(proposal.monthlyRetainerCents)} شهرياً`
                  : `Subsequent recurring retainer: ${formatPrice(proposal.monthlyRetainerCents)} / month`}
              </p>
            </div>

            {submitted ? (
              <div className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-5 py-2.5 text-xs text-foreground font-mono">
                <CheckCircle2 className="size-4 text-accent" />
                <span>{isAr ? 'تم تسجيل قبول العرض' : 'Proposal Accepted'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="flex items-center gap-2 rounded-xl bg-accent text-accent-foreground px-6 py-3 text-sm font-semibold hover:bg-accent/90 transition-all"
              >
                <Lock className="size-4" />
                {isAr ? 'الموافقة وسداد دفعة البدء' : 'Accept & Settle Deposit'}
              </button>
            )}
          </div>
        </div>

        {/* SLA Terms */}
        <div className="mt-6 rounded-xl border border-border bg-panel p-4 text-xs">
          <span className="font-bold text-foreground flex items-center gap-1.5 mb-2">
            <ShieldCheck className="size-4 text-accent" />
            {isAr ? 'ضمانات مستوى الخدمة والخصوصية (SLA):' : 'Enterprise Service Level Agreement (SLA):'}
          </span>
          <ul className="space-y-1.5 text-muted-foreground">
            {(isAr ? proposal.slaTermsAr : proposal.slaTerms).map((term, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="size-3.5 text-accent shrink-0 mt-0.5" />
                <span>{term}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
