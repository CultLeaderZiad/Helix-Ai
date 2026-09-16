'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Bot,
  CheckCircle2,
  TrendingUp,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  DollarSign,
  Languages,
  Calendar,
  Layers,
  PhoneCall,
  Loader2,
} from 'lucide-react'
import { evaluateProspectAndSaveDeal } from '@/lib/ai/actions'
import type { AssessmentInput, RecommendationResult } from '@/lib/ai/engine'
import type { RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'

interface AiEngineViewProps {
  initialClientName?: string
  initialRegionTier?: RegionTier
  userEmail?: string
}

export function AiEngineView({
  initialClientName,
  initialRegionTier = 'gcc_enterprise',
  userEmail,
}: AiEngineViewProps) {
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const [businessName, setBusinessName] = useState(
    initialClientName || (isAr ? 'مستشفى النور التخصصي' : 'Al Noor Specialty Clinic')
  )
  const [contactName, setContactName] = useState(isAr ? 'د. طارق خالد' : 'Dr. Tariq Khaled')
  const [email, setEmail] = useState(userEmail || 'tariq@alnoorclinic.ae')
  const [phone, setPhone] = useState('+971 50 892 4190')
  const [vertical, setVertical] = useState('Healthcare & Medical Clinics')
  const [regionTier, setRegionTier] = useState<RegionTier>(initialRegionTier)
  const [monthlyCallVolume, setMonthlyCallVolume] =
    useState<AssessmentInput['monthlyCallVolume']>('500_2000')
  const [primaryPainPoint, setPrimaryPainPoint] =
    useState<AssessmentInput['primaryPainPoint']>('booking_overhead')

  const [isPending, startTransition] = useTransition()
  const [recommendation, setRecommendation] = useState<RecommendationResult | null>(null)
  const [dealId, setDealId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    startTransition(async () => {
      const res = await evaluateProspectAndSaveDeal({
        businessName,
        contactName,
        email,
        phone,
        vertical,
        regionTier,
        monthlyCallVolume,
        primaryPainPoint,
        language,
      })

      if (res.success && res.recommendation) {
        setRecommendation(res.recommendation)
        setDealId(res.dealId ?? null)
      } else {
        setErrorMsg(res.message)
      }
    })
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Cpu className="size-3.5" />
            {isAr ? 'محرك الذكاء الاصطناعي التشخيصي' : 'AI Diagnostic Engine'}
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {isAr ? 'تقييم المتطلبات والتوصية بالهندسة المعمارية' : 'Autonomous Architecture Assessment'}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isAr
              ? 'أداة تقييم وتحليل الاحتياجات وتحديد النظام الأنسب لشركتك مع حساب العائد الاستثماري وحفظ الصفقة مباشرة في CRM.'
              : 'Interactive diagnostic engine matching operational bottlenecks with optimal AI voice & WhatsApp architectures.'}
          </p>
        </div>

        {/* Language Switcher */}
        <div className="flex items-center rounded-xl border border-slate-800 bg-[#101726] p-1">
          <button
            type="button"
            onClick={() => setLanguage('en')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              language === 'en'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            )}
          >
            <Languages className="size-3.5" /> English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
              language === 'ar'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-xs'
                : 'text-slate-400 hover:text-white'
            )}
          >
            العربية
          </button>
        </div>
      </div>

      {/* Main Grid: Form + Live Recommendation Display */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12" dir={isAr ? 'rtl' : 'ltr'}>
        {/* Assessment Questionnaire Form */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#0c1322] p-6 shadow-xl">
          <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
            <Zap className="size-5 text-cyan-400" />
            {isAr ? 'بيانات المؤسسة والتشخيص' : 'Operational Parameters'}
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            {isAr
              ? 'أدخل بيانات شركتك وحجم الاتصالات لتوليد خطة هندسية دقيقة.'
              : 'Enter your business volume metrics to run the evaluation model.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isAr ? 'اسم الشركة / المنشأة' : 'Business Name'}
              </label>
              <input
                type="text"
                required
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'اسم المسؤول' : 'Contact Name'}
                </label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'البريد الإلكتروني' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'رقم الهاتف / الواتساب' : 'Phone / WhatsApp'}
                </label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3.5 text-sm text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'الشريحة الإقليمية' : 'Regional Tier'}
                </label>
                <select
                  value={regionTier}
                  onChange={e => setRegionTier(e.target.value as RegionTier)}
                  className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="gcc_enterprise">GCC Enterprise (UAE, KSA, QA)</option>
                  <option value="mena_sme">MENA SME (Egypt, Jordan, Regional)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isAr ? 'القطاع / النشاط التجاري' : 'Industry Vertical'}
              </label>
              <select
                value={vertical}
                onChange={e => setVertical(e.target.value)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Healthcare & Medical Clinics">
                  {isAr ? 'الرعاية الصحية والعيادات الطبية' : 'Healthcare & Medical Clinics'}
                </option>
                <option value="Home Services & Contracting">
                  {isAr ? 'المقاولات والصيانة وخدمات المنازل' : 'Home Services & Contracting'}
                </option>
                <option value="Real Estate & Property Management">
                  {isAr ? 'العقارات وإدارة الأصول' : 'Real Estate & Property Management'}
                </option>
                <option value="B2B Wholesale & Logistics">
                  {isAr ? 'التجارة والتوزيع والخدمات اللوجستية' : 'B2B Wholesale & Logistics'}
                </option>
                <option value="Legal & High-Ticket Advisory">
                  {isAr ? 'الاستشارات القانونية والمؤسسية' : 'Legal & High-Ticket Advisory'}
                </option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isAr ? 'حجم الاتصالات والمحادثات الشهرية' : 'Monthly Call / Inquiry Volume'}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {[
                  { id: 'under_100', label: '< 100 / mo' },
                  { id: '100_500', label: '100 - 500 / mo' },
                  { id: '500_2000', label: '500 - 2,000 / mo' },
                  { id: '2000_plus', label: '2,000+ / mo' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMonthlyCallVolume(opt.id as any)}
                    className={cn(
                      'rounded-lg border px-3 py-2 text-xs font-medium transition-colors text-center',
                      monthlyCallVolume === opt.id
                        ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-300 font-semibold'
                        : 'border-slate-800 bg-[#101728] text-slate-400 hover:text-white'
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {isAr ? 'التحدي التشغيلي الأبرز' : 'Primary Operational Bottleneck'}
              </label>
              <select
                value={primaryPainPoint}
                onChange={e => setPrimaryPainPoint(e.target.value as any)}
                className="mt-1.5 h-10 w-full rounded-lg border border-slate-800 bg-[#131d32] px-3 text-sm text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="booking_overhead">
                  {isAr ? 'ضغط حجوزات المواعيد وتنسيق الجداول' : 'Appointment Booking & Calendar Overhead'}
                </option>
                <option value="missed_calls">
                  {isAr ? 'مكالمات فائتة وضياع العملاء للمنافسين' : 'Missed Inbound Calls & Dropped Leads'}
                </option>
                <option value="dormant_leads">
                  {isAr ? 'عملاء قدامى خاملون في قاعدة البيانات' : 'Stale/Dormant Leads Sitting in CRM'}
                </option>
                <option value="unpaid_invoices">
                  {isAr ? 'تأخر تحصيل الفواتير والديون المستحقة' : 'Slow A/R Collections & Unpaid Invoices'}
                </option>
                <option value="hallucination_compliance">
                  {isAr ? 'الحاجة للرقابة القانونية الصارمة على الذكاء الاصطناعي' : 'Supervisory Compliance & Zero Hallucinations'}
                </option>
              </select>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-status-danger/40 bg-status-danger/10 p-3 text-xs text-status-danger">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 font-bold text-slate-950 transition-all hover:bg-cyan-400 disabled:opacity-50 shadow-[0_0_25px_rgba(0,210,255,0.3)] text-sm"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  {isAr ? 'جاري التحليل وتوليد التوصية...' : 'Executing AI Architecture Engine...'}
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  {isAr ? 'تشغيل التشخيص وتوليد التوصية' : 'Run Architecture Assessment'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Recommendation Card (Output) */}
        <div className="lg:col-span-7 flex flex-col">
          {recommendation ? (
            <div className="rounded-2xl border border-cyan-500/30 bg-[#080f1d] p-6 shadow-2xl space-y-6 animate-in fade-in">
              {/* Header result */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-0.5 text-xs font-semibold">
                      {isAr ? 'تم تقييم البنية وحفظ الصفقة' : 'Deal Created & Studio Completed'}
                    </span>
                    <span className="rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-3 py-0.5 text-xs font-bold font-mono">
                      {recommendation.matchScore}% Match
                    </span>
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold text-white">
                    {isAr ? recommendation.systemNameAr : recommendation.systemName}
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    {isAr ? recommendation.headlineAr : recommendation.headline}
                  </p>
                </div>
              </div>

              {/* Rationale & ROI */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-[#0e1628] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="size-4 text-emerald-400" />
                    {isAr ? 'العائد الاستثماري المتوقع' : 'Estimated Monthly ROI'}
                  </span>
                  <p className="mt-2 font-display text-xl font-bold text-emerald-400">
                    {recommendation.estimatedMonthlyRoi}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {isAr ? 'بناءً على معايير السوق في منطقتك' : 'Calculated against regional GCC benchmark'}
                  </p>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#0e1628] p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="size-4 text-cyan-400" />
                    {isAr ? 'هيكل التسعير المعتمد' : 'Regional Pricing Structure'}
                  </span>
                  <div className="mt-2 flex items-baseline justify-between text-sm">
                    <span className="text-slate-300">{isAr ? 'الإعداد:' : 'Setup:'}</span>
                    <span className="font-bold text-white">
                      ${(recommendation.setupFeeCents / 100).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-sm">
                    <span className="text-slate-300">{isAr ? 'الاشتراك الشهري:' : 'Monthly Retainer:'}</span>
                    <span className="font-bold text-cyan-300">
                      ${(recommendation.monthlyRetainerCents / 100).toLocaleString()}/mo
                    </span>
                  </div>
                </div>
              </div>

              {/* Rationale Detail */}
              <div className="rounded-xl border border-slate-800 bg-[#0d172a] p-4 text-xs text-slate-300 leading-relaxed">
                <span className="font-bold text-white block mb-1">
                  {isAr ? 'التحليل الهندسي لسبب التوصية:' : 'Architectural Rationale:'}
                </span>
                {isAr ? recommendation.rationaleAr : recommendation.rationale}
              </div>

              {/* WhatsApp-First Strategy Card */}
              <div className="rounded-xl border border-emerald-500/30 bg-[#0b1c16] p-4 text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="size-4" />
                  {isAr ? 'استراتيجية الواتساب الإقليمية:' : 'Regional WhatsApp Strategy:'}
                </span>
                <p className="text-slate-200">
                  {isAr ? recommendation.whatsappStrategyAr : recommendation.whatsappStrategy}
                </p>
              </div>

              {/* 3-Step Rollout Blueprint */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {isAr ? 'خارطة طريق التنفيذ (3 خطوات):' : '3-Step Rollout Blueprint:'}
                </span>
                <div className="space-y-2">
                  {(isAr ? recommendation.suggestedStepsAr : recommendation.suggestedSteps).map(
                    (step, i) => (
                      <div
                        key={step}
                        className="flex items-start gap-3 rounded-lg border border-slate-800 bg-[#0e1628] p-3 text-xs text-slate-300"
                      >
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] font-bold text-cyan-300">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/dashboard/studio"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors shadow-md"
                >
                  <Sparkles className="size-4" />
                  {isAr ? 'فتح النظام في استوديو التخصيص' : 'Open in Studio Preview'}
                </Link>
                <Link
                  href="/dashboard/crm"
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-[#121b2e] px-4 py-3 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
                >
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  {isAr ? 'عرض الصفقة في CRM' : 'Inspect Deal in CRM'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-[#0a0f1d] p-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Bot className="size-7" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                {isAr ? 'في انتظار تشغيل التشخيص' : 'Awaiting Operational Diagnostic'}
              </h3>
              <p className="mt-2 max-w-sm text-xs text-slate-400">
                {isAr
                  ? 'أدخل بيانات مؤسستك واضغط على زر التقييم للحصول على تحليل هندسي فوري وحساب العائد الاستثماري.'
                  : 'Submit the assessment parameters on the left to evaluate your workload and receive tailored architecture specifications.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
