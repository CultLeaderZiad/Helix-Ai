'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { evaluateProspectAndSaveDeal } from '@/lib/ai/actions'
import { requestSystemBuild } from '@/lib/studio/request-build'
import type { AssessmentInput, RecommendationResult } from '@/lib/ai/engine'
import type { RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { PageHeader, Pill } from '@/components/ui/helix'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatUsdFromCents, getSystemTemplate } from '@/lib/studio/templates'
import { useConsoleLanguage } from '@/components/shell/console-language'

interface AiEngineViewProps {
  initialClientName?: string
  initialRegionTier?: RegionTier
  userEmail?: string
  initialIsSample?: boolean
}

const VERTICALS = [
  { value: 'Healthcare & clinics', ar: 'الرعاية الصحية والعيادات' },
  { value: 'Home services & contracting', ar: 'المقاولات وخدمات المنازل' },
  { value: 'Real estate', ar: 'العقارات' },
  { value: 'B2B wholesale & logistics', ar: 'التجارة والتوزيع' },
  { value: 'Legal & advisory', ar: 'الاستشارات القانونية' },
]

const PAIN = [
  { id: 'booking_overhead', en: 'Appointment booking & calendar overhead', ar: 'ضغط حجوزات المواعيد' },
  { id: 'missed_calls', en: 'Missed calls & dropped leads', ar: 'مكالمات فائتة وضياع العملاء' },
  { id: 'dormant_leads', en: 'Dormant CRM contacts', ar: 'عملاء خاملون في CRM' },
  { id: 'unpaid_invoices', en: 'Slow B2B collections', ar: 'تأخر تحصيل فواتير الشركات' },
  { id: 'hallucination_compliance', en: 'Facts need review before CRM writes', ar: 'حقائق تحتاج مراجعة قبل الكتابة' },
] as const

const VOLUMES = [
  { id: 'under_100', label: 'Under 100 / month' },
  { id: '100_500', label: '100–500 / month' },
  { id: '500_2000', label: '500–2,000 / month' },
  { id: '2000_plus', label: '2,000+ / month' },
] as const

export function AiEngineView({
  initialClientName,
  initialRegionTier = 'gcc_enterprise',
  userEmail,
  initialIsSample = false,
}: AiEngineViewProps) {
  const { language } = useConsoleLanguage()
  const isAr = language === 'ar'
  const [step, setStep] = useState<1 | 2 | 3>(1)

  const [businessName, setBusinessName] = useState(initialClientName ?? '')
  const [vertical, setVertical] = useState('Healthcare & clinics')
  const [regionTier] = useState<RegionTier>(initialRegionTier)
  const [monthlyCallVolume, setMonthlyCallVolume] =
    useState<AssessmentInput['monthlyCallVolume']>('500_2000')
  const [primaryPainPoint, setPrimaryPainPoint] =
    useState<AssessmentInput['primaryPainPoint']>('booking_overhead')

  const [isPending, startTransition] = useTransition()
  const [requestPending, startRequest] = useTransition()
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [requestMsg, setRequestMsg] = useState<string | null>(null)
  const [sampleRun, setSampleRun] = useState(false)

  const runAssessment = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    startTransition(async () => {
      const res = await evaluateProspectAndSaveDeal({
        businessName: businessName.trim(),
        contactName: businessName.trim(),
        email: userEmail || 'hello@helix.ai',
        phone: '',
        vertical,
        regionTier,
        monthlyCallVolume,
        primaryPainPoint,
        language,
      })
      if (res.success && res.recommendation) {
        setRecommendation(res.recommendation)
        setSampleRun(initialIsSample)
        setStep(3)
      } else {
        setErrorMsg(res.message)
      }
    })
  }

  const requestBuild = () => {
    if (!recommendation) return
    startRequest(async () => {
      const res = await requestSystemBuild(recommendation.systemId, {
        brandName: businessName.trim() || 'Workspace',
        accentColor: '#0B6E4F',
        themeVariant: 'warm-command',
      })
      setRequestMsg(res.message)
    })
  }

  const template = recommendation ? getSystemTemplate(recommendation.systemId) : undefined
  const painLabel = PAIN.find(opt => opt.id === primaryPainPoint)

  return (
    <div className="w-full">
      <PageHeader
        title={isAr ? 'اعثر على النظام المناسب' : 'Find the right system'}
        subtitle={isAr ? 'تقييم ٦٠ ثانية · English / العربية' : '60-second assessment · English / العربية'}
      />

      <ol className="mt-6 flex flex-wrap items-center gap-3 text-13 text-helix-muted">
        {[
          { n: 1, label: isAr ? 'الأعمال' : 'Business' },
          { n: 2, label: isAr ? 'عنق الزجاجة' : 'Bottleneck' },
          { n: 3, label: isAr ? 'التوصية' : 'Recommendation' },
        ].map(item => (
          <li key={item.n} className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-6 items-center justify-center rounded-full text-11 font-medium',
                step === item.n
                  ? 'bg-helix-ink text-helix-surface'
                  : step > item.n
                    ? 'bg-helix-accent-soft text-helix-accent'
                    : 'bg-helix-surface text-helix-muted'
              )}
            >
              {item.n}
            </span>
            {item.label}
          </li>
        ))}
      </ol>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-12" dir={isAr ? 'rtl' : 'ltr'}>
        <form
          onSubmit={step === 2 ? runAssessment : (e) => { e.preventDefault(); setStep(2) }}
          className="space-y-4 rounded-[16px] border border-helix-border bg-helix-surface p-5 lg:col-span-6"
        >
          <p className="text-11 font-medium uppercase tracking-[0.08em] text-helix-muted">
            {step === 1
              ? isAr ? 'الخطوة 1 · الأعمال' : 'Step 1 · Business'
              : step === 2
                ? isAr ? 'الخطوة 2 · عنق الزجاجة' : 'Step 2 · Bottleneck'
                : isAr ? 'الخطوة 3 · محفوظ' : 'Step 3 · Saved'}
          </p>

          {step === 1 && (
            <>
              <div>
                <label className="helix-field-label">{isAr ? 'الأعمال' : 'Business'}</label>
                <Input
                  required
                  value={businessName}
                  placeholder={isAr ? 'اسم المنشأة' : 'Business name'}
                  onChange={e => setBusinessName(e.target.value)}
                />
                {initialIsSample ? (
                  <p className="mt-2">
                    <Pill tone="sample">Sample</Pill>
                    <span className="ml-2 text-12 text-helix-muted">
                      Prefill is a sample workspace, not a live tenant default.
                    </span>
                  </p>
                ) : null}
              </div>
              <div>
                <label className="helix-field-label">{isAr ? 'القطاع' : 'Vertical'}</label>
                <select
                  value={vertical}
                  onChange={e => setVertical(e.target.value)}
                  className="helix-field"
                >
                  {VERTICALS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {isAr ? opt.ar : opt.value}
                    </option>
                  ))}
                </select>
              </div>
              <Button type="submit" className="w-full sm:w-auto">
                {isAr ? 'التالي' : 'Continue'}
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div>
                <h2 className="helix-title text-15">
                  {businessName.trim() || (isAr ? 'منشأة بدون اسم' : 'Unnamed business')}
                  <span className="mt-1 block text-13 font-normal text-helix-muted">
                    {isAr ? vertical : `${vertical} · ${regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}`}
                  </span>
                </h2>
              </div>
              <div>
                <label className="helix-field-label">{isAr ? 'عنق الزجاجة الرئيسي' : 'Main bottleneck'}</label>
                <select
                  value={primaryPainPoint}
                  onChange={e => setPrimaryPainPoint(e.target.value as AssessmentInput['primaryPainPoint'])}
                  className="helix-field"
                >
                  {PAIN.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {isAr ? opt.ar : opt.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="helix-field-label">{isAr ? 'حجم المكالمات' : 'Call volume'}</label>
                <select
                  value={monthlyCallVolume}
                  onChange={e => setMonthlyCallVolume(e.target.value as AssessmentInput['monthlyCallVolume'])}
                  className="helix-field"
                >
                  {VOLUMES.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              {errorMsg ? (
                <p className="rounded-[12px] border border-helix-danger/20 bg-helix-danger/8 p-3 text-13 text-helix-danger">
                  {errorMsg}
                </p>
              ) : null}
              <div className="sticky bottom-3 flex gap-2 sm:static">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep(1)}>
                  {isAr ? 'رجوع' : 'Back'}
                </Button>
                <Button type="submit" className="flex-1" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {isAr ? 'جاري التقييم...' : 'Running assessment'}
                    </>
                  ) : (
                    isAr ? 'متابعة إلى التوصية' : 'Continue to recommendation'
                  )}
                </Button>
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <p className="text-13 text-helix-muted">
                {isAr ? 'تم حفظ التقييم في خط الأنابيب عند توفر مساحة عمل.' : 'Assessment saved to the pipeline when a workspace is available.'}
              </p>
              <Button type="button" variant="secondary" onClick={() => { setStep(1); setRecommendation(null) }}>
                {isAr ? 'تقييم جديد' : 'New assessment'}
              </Button>
            </div>
          )}
        </form>

        <div className="lg:col-span-6">
          {recommendation ? (
            <div className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="helix-title text-22">
                    {isAr ? recommendation.systemNameAr : recommendation.systemName}
                  </h3>
                  {sampleRun ? <div className="mt-2"><Pill tone="sample">Sample</Pill></div> : null}
                </div>
                <p className="text-13 font-medium text-helix-ok">
                  {isAr ? `تطابق ${recommendation.matchScore}%` : `Match ${recommendation.matchScore}%`}
                </p>
              </div>
              <p className="mt-2 text-13 leading-relaxed text-helix-ink">
                {isAr ? recommendation.headlineAr : recommendation.headline}
              </p>
              <p className="mt-4 text-13 font-medium text-helix-ink">
                {template
                  ? `${formatUsdFromCents(recommendation.setupFeeCents)} setup · ${formatUsdFromCents(recommendation.monthlyRetainerCents)}/mo · ${regionTier === 'gcc_enterprise' ? 'GCC Enterprise' : 'MENA SME'}`
                  : `${formatUsdFromCents(recommendation.setupFeeCents)} setup · ${formatUsdFromCents(recommendation.monthlyRetainerCents)}/mo`}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/studio?system=${recommendation.systemId}`}
                  className={buttonVariants({ size: 'sm' })}
                >
                  {isAr ? 'افتح العرض' : 'Open demo'}
                </Link>
                <Button size="sm" variant="secondary" onClick={requestBuild} disabled={requestPending}>
                  {requestPending ? (isAr ? 'جارٍ الإرسال' : 'Sending') : isAr ? 'اطلب البناء' : 'Request build'}
                </Button>
                <Link
                  href={`/dashboard/studio/guides/${recommendation.systemId}`}
                  className={buttonVariants({ variant: 'secondary', size: 'sm' })}
                >
                  {isAr ? 'الدليل' : 'Guide'}
                </Link>
              </div>
              {requestMsg ? <p className="mt-3 text-13 text-helix-muted">{requestMsg}</p> : null}
            </div>
          ) : (
            <div className="flex min-h-[280px] flex-col justify-center rounded-[16px] border border-dashed border-helix-border bg-helix-surface/60 p-6">
              <h3 className="helix-title text-15">{isAr ? 'التوصية تظهر هنا' : 'Recommendation appears here'}</h3>
              <p className="mt-1 text-13 text-helix-muted">
                {isAr
                  ? 'أدخل العمل ثم عنق الزجاجة. لا نعرض توصية قبل التشغيل.'
                  : 'Enter the business, then the bottleneck. No fixture is shown as live until you run the assessment.'}
              </p>
              {step === 2 && painLabel ? (
                <p className="mt-4 text-13 text-helix-ink">{isAr ? painLabel.ar : painLabel.en}</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
