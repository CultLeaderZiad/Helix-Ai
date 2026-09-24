'use client'

import { useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Receipt,
  FileCheck2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemTemplate } from '@/lib/studio/templates'

interface StudioRoiCalculatorProps {
  template: SystemTemplate
  brandName: string
  accentColor: string
  onRequestBuild: () => void
  isPending: boolean
  isAr?: boolean
}

export function StudioRoiCalculator({
  template,
  brandName,
  accentColor,
  onRequestBuild,
  isPending,
  isAr = false,
}: StudioRoiCalculatorProps) {
  const [monthlyInboundCalls, setMonthlyInboundCalls] = useState(800)
  const [avgTicketValue, setAvgTicketValue] = useState(650)

  // Calculations
  const missedRate = 0.22 // 22% average unhandled inbound rate
  const missedCalls = Math.round(monthlyInboundCalls * missedRate)
  const recoveredBookings = Math.round(missedCalls * 0.35) // 35% triage recovery
  const recoveredRevenue = recoveredBookings * avgTicketValue
  const staffHoursSaved = Math.round((monthlyInboundCalls * 4.5) / 60) // 4.5 mins per call

  const totalMonthlyCost = template.monthlyRetainerCents / 100
  const roiMultiplier = totalMonthlyCost > 0 ? (recoveredRevenue / totalMonthlyCost).toFixed(1) : '10.0'

  const formattedSetup = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(template.setupFeeCents / 100)

  const formattedRetainer = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(template.monthlyRetainerCents / 100)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Sliders and Volume Inputs (6 cols) */}
      <div className="lg:col-span-6 rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 sm:p-6 space-y-6 shadow-2xs">
        <div className="border-b border-[#D9D4CB]/80 pb-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#0B6E4F]">
            <TrendingUp className="size-3.5" />
            {isAr ? 'حاسبة العائد الاقتصادي والنمو' : 'Commercial ROI Modeling Engine'}
          </div>
          <h3 className="font-display text-lg font-bold text-[#141414] mt-1">
            {isAr ? 'توقع الأثر المالي لنظام الأتمتة' : 'Estimate Autonomous System Value'}
          </h3>
          <p className="text-xs text-[#6E6B65] mt-0.5">
            {isAr
              ? 'عدل حجم المكالمات ومتوسط قيمة العميل لرؤية العائد المتوقع فوراً.'
              : 'Adjust your expected volume to model recovered pipeline and staffing savings.'}
          </p>
        </div>

        {/* Slider 1: Monthly Call Volume */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#141414]">
              {isAr ? 'المكالمات والاستفسارات الشهرية الواردة' : 'Monthly Inbound Call Volume'}
            </span>
            <span className="font-mono text-[#0B6E4F] text-sm font-bold">
              {monthlyInboundCalls.toLocaleString()} {isAr ? 'مكالمة/شهر' : 'calls/mo'}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={4000}
            step={50}
            value={monthlyInboundCalls}
            onChange={(e) => setMonthlyInboundCalls(Number(e.target.value))}
            className="w-full accent-[#0B6E4F] cursor-pointer h-2 bg-[#EBE7DF] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#6E6B65] font-mono">
            <span>100</span>
            <span>2,000</span>
            <span>4,000+</span>
          </div>
        </div>

        {/* Slider 2: Average Deal Value */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-[#141414]">
              {isAr ? 'متوسط قيمة حجز / صفقة العميل' : 'Average Customer Transaction Value'}
            </span>
            <span className="font-mono text-[#0B6E4F] text-sm font-bold">
              ${avgTicketValue.toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min={100}
            max={3000}
            step={50}
            value={avgTicketValue}
            onChange={(e) => setAvgTicketValue(Number(e.target.value))}
            className="w-full accent-[#0B6E4F] cursor-pointer h-2 bg-[#EBE7DF] rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-[#6E6B65] font-mono">
            <span>$100</span>
            <span>$1,500</span>
            <span>$3,000+</span>
          </div>
        </div>

        {/* Estimated Pricing Card */}
        <div className="rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-mono text-[#6E6B65]">
              {isAr ? 'استثمار النظام المقترح' : 'System Investment Structure'}
            </span>
            <div className="text-xs text-[#141414] mt-1">
              <strong className="text-[#141414]">{formattedSetup}</strong> {isAr ? 'إيداع وبناء' : 'setup'} +{' '}
              <strong className="text-[#0B6E4F]">{formattedRetainer}</strong>/
              {isAr ? 'شهرياً' : 'mo'}
            </div>
          </div>
          <span className="rounded-full bg-[#0B6E4F]/10 border border-[#0B6E4F]/30 px-2.5 py-1 text-[10px] font-mono text-[#0B6E4F] font-semibold">
            {template.badge || 'ENTERPRISE'}
          </span>
        </div>
      </div>

      {/* Projected Metrics & Build Request Action (6 cols) */}
      <div className="lg:col-span-6 rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 sm:p-6 space-y-6 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between border-b border-[#D9D4CB]/80 pb-3 mb-5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#141414] flex items-center gap-2">
              <Sparkles className="size-4 text-[#0B6E4F]" />
              {isAr ? 'الأثر الاقتصادي المتوقع' : 'Estimated Business Value'}
            </span>
            <span className="rounded-full bg-[#0B6E4F]/10 text-[#0B6E4F] border border-[#0B6E4F]/30 px-2.5 py-0.5 text-xs font-mono font-bold">
              {roiMultiplier}x ROI
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#6E6B65]">
                <Clock className="size-3.5 text-[#0B6E4F]" />
                <span>{isAr ? 'ساعات عمل موفرة' : 'Staff Hours Saved'}</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-display text-[#141414]">
                ~{staffHoursSaved} hrs
              </div>
              <p className="text-[10px] text-[#6E6B65] mt-1">
                {isAr ? 'بديل استقبال مكالمات يدوي' : 'Automated call coordination'}
              </p>
            </div>

            <div className="rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-4">
              <div className="flex items-center gap-2 text-[10px] font-mono uppercase text-[#6E6B65]">
                <DollarSign className="size-3.5 text-[#0B6E4F]" />
                <span>{isAr ? 'إيرادات مستعادة' : 'Recovered Revenue'}</span>
              </div>
              <div className="mt-2 text-2xl font-bold font-display text-[#0B6E4F]">
                ${recoveredRevenue.toLocaleString()}
              </div>
              <p className="text-[10px] text-[#6E6B65] mt-1">
                {isAr ? 'من مكالمات فائتة مؤكدة' : `${recoveredBookings} deals triaged & closed`}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-[#0B6E4F]/20 bg-[#0B6E4F]/5 p-3.5 text-xs text-[#141414] flex items-center gap-2.5">
            <ShieldCheck className="size-4 shrink-0 text-[#0B6E4F]" />
            <span>
              {isAr
                ? 'يشمل إشراف بشري مستمر، تراخيص واتساب كلاود الرسمية، وتوافق سيادة البيانات الخليجية.'
                : 'Includes dedicated Retell Voice engine, WhatsApp Cloud API keys, and human supervisor failover.'}
            </span>
          </div>
        </div>

        {/* Direct Action */}
        <div className="pt-4 border-t border-[#D9D4CB]">
          <button
            type="button"
            disabled={isPending}
            onClick={onRequestBuild}
            className="w-full flex h-12 items-center justify-center gap-2 rounded-xl bg-[#141414] font-semibold text-white transition-all hover:bg-black disabled:opacity-50 text-sm active:scale-98 shadow-xs"
          >
            <Send className="size-4" />
            {isPending
              ? (isAr ? 'جاري تسجيل طلب البناء في CRM...' : 'Registering Build in CRM...')
              : (isAr ? `طلب بناء وتفعيل ${template[isAr ? 'ar' : 'en'].name}` : `Request Build for ${brandName}`)}
          </button>
        </div>
      </div>
    </div>
  )
}
