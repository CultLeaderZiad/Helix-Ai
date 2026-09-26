'use client'

import { useState, useTransition, useId } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { evaluateProspectAndSaveDeal } from '@/lib/ai/actions'
import { requestSystemBuild } from '@/lib/studio/request-build'
import type { AssessmentInput, RecommendationResult } from '@/lib/ai/engine'
import type { RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'

interface AiEngineViewProps {
  initialClientName?: string
  initialRegionTier?: RegionTier
  userEmail?: string
}

const PAIN = [
  {
    id: 'booking_overhead',
    en: 'Appointment booking & calendar overhead',
    ar: 'حجز المواعيد وضغط الجدول الزمني',
    systemName: 'Booking receptionist',
    systemNameAr: 'موظف الاستقبال والحجوزات',
    systemId: 'booking-receptionist',
    matchScore: 96,
    setupFee: 1500,
    monthlyRetainer: 450,
    headline: 'Rules-based recommendation for the selected pain point. Not a live model score.',
    headlineAr: 'توصية مبنية على نقطة الألم المختارة. ليست درجة من نموذج حي.',
  },
  {
    id: 'missed_calls',
    en: 'Missed calls & dropped inbound leads',
    ar: 'مكالمات فائتة وضياع العملاء الواردين',
    systemName: 'Missed-call triage',
    systemNameAr: 'فرز واستعادة المكالمات الفائتة',
    systemId: 'missed-call-responder',
    matchScore: 94,
    setupFee: 1200,
    monthlyRetainer: 350,
    headline: 'Sub-60s SMS + WhatsApp outreach for missed inbound inquiries with instant calendar booking.',
    headlineAr: 'تواصل فوري في أقل من ٦٠ ثانية عبر الرسائل القصيرة والواتساب للمكالمات الفائتة مع حجز فوري.',
  },
  {
    id: 'dormant_leads',
    en: 'Dormant CRM contacts reactivation',
    ar: 'إعادة تنشيط جهات اتصال CRM الخاملة',
    systemName: 'Lead reactivation',
    systemNameAr: 'إعادة تنشيط العملاء المتوقفين',
    systemId: 'lead-reactivation',
    matchScore: 92,
    setupFee: 2000,
    monthlyRetainer: 600,
    headline: 'Revives cold database contacts via contextual WhatsApp workflows without spamming.',
    headlineAr: 'تنشيط جهات الاتصال الخاملة في قاعدة البيانات عبر محادثات واتساب ذكية وسياقية.',
  },
  {
    id: 'unpaid_invoices',
    en: 'Unpaid invoices & B2B collections (B2B only)',
    ar: 'فواتير غير مدفوعة ومتابعة التحصيل (شركات فقط)',
    systemName: 'AR collections (B2B only)',
    systemNameAr: 'تحصيل المستحقات والمديونيات (B2B فقط)',
    systemId: 'ar-invoicing',
    matchScore: 95,
    setupFee: 1800,
    monthlyRetainer: 500,
    headline: 'Strictly B2B payment reconciliation and polite WhatsApp follow-ups with accounting ERP audit trail.',
    headlineAr: 'تسوية مستحقات الشركات B2B حصراً ومتابعات واتساب احترافية مع سجل تدقيق محاسبي ERP.',
  },
  {
    id: 'hallucination_compliance',
    en: 'Facts review before CRM write & compliance',
    ar: 'مراجعة الحقائق والامتثال قبل التسجيل في CRM',
    systemName: 'Evidence ledger',
    systemNameAr: 'سجل تدقيق الأدلة والامتثال',
    systemId: 'evidence-console',
    matchScore: 98,
    setupFee: 2500,
    monthlyRetainer: 750,
    headline: 'Human-in-the-loop truth engine: AI assertions are verified before permanent CRM commit.',
    headlineAr: 'محرك التحقق البشري: تدقيق استنتاجات الذكاء الاصطناعي قبل اعتمادها رسمياً في نظام CRM.',
  },
] as const

export function AiEngineView({
  initialClientName,
  initialRegionTier = 'gcc_enterprise',
  userEmail,
}: AiEngineViewProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'
  const formId = useId()

  const [businessName, setBusinessName] = useState(
    initialClientName || (isAr ? 'منشأتك للعمليات' : 'Target Operations')
  )
  const [vertical, setVertical] = useState('Healthcare & Clinics')
  const [regionTier, setRegionTier] = useState<RegionTier>(initialRegionTier)
  const [primaryPainPoint, setPrimaryPainPoint] =
    useState<AssessmentInput['primaryPainPoint']>('booking_overhead')

  const [isPending, startTransition] = useTransition()
  const [requestPending, startRequest] = useTransition()
  const [requestMsg, setRequestMsg] = useState<string | null>(null)
  const [serverRec, setServerRec] = useState<RecommendationResult | null>(null)

  // Current selected preset
  const activePainPreset = PAIN.find(p => p.id === primaryPainPoint) || PAIN[0]

  const currentRec = serverRec
    ? {
        systemId: serverRec.systemId,
        systemName: serverRec.systemName,
        systemNameAr: serverRec.systemNameAr,
        matchScore: serverRec.matchScore,
        headline: serverRec.headline,
        headlineAr: serverRec.headlineAr,
        setupFee: Math.round(serverRec.setupFeeCents / 100),
        monthlyRetainer: Math.round(serverRec.monthlyRetainerCents / 100),
      }
    : {
        systemId: activePainPreset.systemId,
        systemName: activePainPreset.systemName,
        systemNameAr: activePainPreset.systemNameAr,
        matchScore: activePainPreset.matchScore,
        headline: activePainPreset.headline,
        headlineAr: activePainPreset.headlineAr,
        setupFee: activePainPreset.setupFee,
        monthlyRetainer: activePainPreset.monthlyRetainer,
      }

  const handleContinueRecommendation = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await evaluateProspectAndSaveDeal({
        businessName,
        contactName: businessName,
        email: userEmail || 'ops@helix.ai',
        phone: '',
        vertical: `${vertical} & clinics`,
        regionTier,
        monthlyCallVolume: '500_2000',
        primaryPainPoint,
        language,
      })
      if (res.success && res.recommendation) {
        setServerRec(res.recommendation)
      }
    })
  }

  const handleRequestBuild = () => {
    startRequest(async () => {
      const res = await requestSystemBuild(currentRec.systemId, {
        brandName: businessName,
        accentColor: '#0B6E4F',
        themeVariant: 'blueprint-light',
      })
      setRequestMsg(res.message)
    })
  }

  return (
    <div className="w-full">
      {/* Title & Subtitle Matching D2 Warm Command Screenshot */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-22 sm:text-26 font-bold tracking-tight text-[#141414]">
            {isAr ? 'اعثر على النظام المناسب' : 'Find the right system'}
          </h1>
          <p className="mt-1 text-13 text-[#6E6B65]">
            {isAr
              ? 'تشخيص اختناقات التشغيل وتوليد توصية معمارية مدققة للأنظمة'
              : 'Diagnose operational bottlenecks and configure an audited autonomous system.'}
          </p>
        </div>

        {/* Local language switch backup if top bar is scrolled */}
        <div className="flex items-center rounded-full border border-[#D9D4CB] bg-[#FFFEFA] p-0.5 shadow-2xs sm:hidden">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-11 font-medium',
              language === 'en' ? 'bg-[#141414] text-white' : 'text-[#6E6A63]'
            )}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={cn(
              'rounded-full px-2.5 py-0.5 text-11 font-medium',
              language === 'ar' ? 'bg-[#141414] text-white' : 'text-[#6E6A63]'
            )}
          >
            عربي
          </button>
        </div>
      </div>

      {/* Two Side-by-Side Cards (Warm Paper Surfaces #FFFEFA on #F3F1EC Canvas) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Left Card: STEP 2 · BOTTLENECK */}
        <div className="rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] p-6 shadow-2xs">
          <div className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6E6B65]">
            {isAr ? 'الخطوة ٢ · عنق الزجاجة' : 'STEP 2 · BOTTLENECK'}
          </div>

          <div className="mt-3 space-y-3">
            <div>
              <label htmlFor="biz-name" className="text-[11px] font-mono uppercase tracking-wider text-[#6E6B65] block mb-1">
                {isAr ? 'اسم المنشأة' : 'Business / Organization Name'}
              </label>
              <input
                id="biz-name"
                type="text"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                placeholder={isAr ? 'أدخل اسم منشأتك' : 'Enter organization name'}
                className="w-full rounded-[8px] border border-[#D9D4CB] bg-[#F7F5F0] px-3.5 py-2 text-13 font-semibold text-[#141414] focus:border-[#141414] focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 text-12 text-[#6E6B65]">
              <span>{isAr ? 'القطاع: الرعاية والخدمات' : 'Vertical: Services & Clinics'}</span>
              <span className="text-[#9E9B95]">·</span>
              <span>{regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}</span>
            </div>
          </div>

          <form id={formId} onSubmit={handleContinueRecommendation} className="mt-4">
            <label htmlFor="pain-select" className="sr-only">
              {isAr ? 'عنق الزجاجة' : 'Bottleneck selection'}
            </label>
            <select
              id="pain-select"
              value={primaryPainPoint}
              onChange={(e) => {
                setPrimaryPainPoint(e.target.value as AssessmentInput['primaryPainPoint'])
                setServerRec(null) // reset to preset
              }}
              className="w-full rounded-[8px] border border-[#D9D4CB] bg-[#F7F5F0] px-4 py-2.5 text-14 font-normal text-[#141414] focus:border-[#141414] focus:outline-none transition-colors"
            >
              {PAIN.map(opt => (
                <option key={opt.id} value={opt.id}>
                  {isAr ? opt.ar : opt.en}
                </option>
              ))}
            </select>

            <div className="mt-5">
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#141414] px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-black disabled:opacity-75"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>{isAr ? 'جاري التقييم...' : 'Evaluating...'}</span>
                  </>
                ) : (
                  <span>{isAr ? 'المتابعة إلى التوصية' : 'Continue to recommendation'}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Card: Recommendation Card */}
        <div className="rounded-[14px] border border-[#D9D4CB] bg-[#FFFEFA] p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-16 font-semibold text-[#141414]">
                {isAr ? currentRec.systemNameAr : currentRec.systemName}
              </h3>
              <span className="text-13 font-semibold text-[#0B6E4F]">
                {isAr ? `تطابق ${currentRec.matchScore}%` : `Match ${currentRec.matchScore}%`}
              </span>
            </div>

            <p className="mt-2 text-13 leading-relaxed text-[#4A4844]">
              {isAr ? currentRec.headlineAr : currentRec.headline}
            </p>

            <div className="mt-4 text-14 font-semibold text-[#141414]">
              ${currentRec.setupFee.toLocaleString()} setup · ${currentRec.monthlyRetainer.toLocaleString()}/mo
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard/studio?system=${currentRec.systemId}`}
                className="inline-flex items-center justify-center rounded-[8px] bg-[#141414] px-4 py-2 text-13 font-medium text-white transition-colors hover:bg-black"
              >
                {isAr ? 'افتح العرض' : 'Open demo'}
              </Link>
              <button
                type="button"
                onClick={handleRequestBuild}
                disabled={requestPending}
                className="inline-flex items-center justify-center rounded-[8px] border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-2 text-13 font-medium text-[#141414] transition-colors hover:bg-[#F3F1EC] disabled:opacity-60"
              >
                {requestPending ? (isAr ? 'جارٍ الإرسال...' : 'Sending...') : (isAr ? 'اطلب البناء' : 'Request build')}
              </button>
              <Link
                href={`/dashboard/studio/guides/${currentRec.systemId}`}
                className="inline-flex items-center justify-center rounded-[8px] border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-2 text-13 font-medium text-[#141414] transition-colors hover:bg-[#F3F1EC]"
              >
                {isAr ? 'الدليل' : 'Guide'}
              </Link>
            </div>
            {requestMsg && (
              <p className="mt-3 text-12 text-[#0B6E4F] font-medium">{requestMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
