'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Sparkles,
  Building2,
  Zap,
  Globe2,
  Languages,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react'
import { REGIONAL_PRICING_CONFIGS, type RegionPricingConfig } from '@/lib/pricing/tiers'
import type { RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'

export function PricingView({
  initialConfigs,
}: {
  initialConfigs?: Record<RegionTier, RegionPricingConfig>
} = {}) {
  const configs = initialConfigs || REGIONAL_PRICING_CONFIGS
  const [regionTier, setRegionTier] = useState<RegionTier>('gcc_enterprise')
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const currentConfig = configs[regionTier]
  const [currency, setCurrency] = useState<'AED' | 'SAR' | 'USD' | 'EGP' | 'JOD'>(
    currentConfig.defaultCurrency
  )

  const handleRegionChange = (newTier: RegionTier) => {
    setRegionTier(newTier)
    setCurrency(configs[newTier].defaultCurrency)
  }

  return (
    <div className="mx-auto max-w-6xl" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#38BDF8]">
          <Sparkles className="size-3.5" />
          {isAr ? 'خطط وتكاليف شفافة ومدروسة' : 'Transparent Operations Tiers'}
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {isAr ? 'ابدأ مع تجربة مجانية غير مقيدة لمدة 7 أيام' : 'Start with a monthly plan.'}
        </h1>
        <p className="mt-4 text-base text-slate-300">
          {isAr
            ? 'هندسة تسعير إقليمية مرنة صُممت خصيصاً للشركات في الخليج العربي ومصر وشمال إفريقيا دون أي رسوم خفية.'
            : 'Select the operations tier matching your regional business scale and telephony infrastructure.'}
        </p>
      </header>

      {/* Control Switcher Bar: Region + Currency + Language */}
      <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0e1628]/90 p-3 shadow-xl backdrop-blur-md">
        {/* Region Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleRegionChange('gcc_enterprise')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all',
              regionTier === 'gcc_enterprise'
                ? 'bg-white/15 text-white border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <Building2 className="size-4" />
            <span>{isAr ? 'الخليج العربي (الإمارات، السعودية، قطر)' : 'GCC Enterprise (UAE, KSA, Qatar)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegionChange('mena_sme')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all',
              regionTier === 'mena_sme'
                ? 'bg-white/15 text-white border border-white/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            )}
          >
            <Zap className="size-4" />
            <span>{isAr ? 'الشركات المتوسطة (مصر، الأردن، وشمال إفريقيا)' : 'MENA SME (Egypt, Jordan, Regional)'}</span>
          </button>
        </div>

        {/* Currency & Language Selectors */}
        <div className="flex items-center gap-3">
          {/* Currency Pill Selector */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-[#131d32] p-1">
            {currentConfig.availableCurrencies.map(curr => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={cn(
                  'rounded-lg px-2.5 py-1 text-xs font-bold font-mono transition-colors',
                  currency === curr
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                )}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-[#131d32] p-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                language === 'en' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors',
                language === 'ar' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              عربي
            </button>
          </div>
        </div>
      </div>

      {/* Region Context Subheader */}
      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 px-2">
        <span>{isAr ? currentConfig.descriptionAr : currentConfig.description}</span>
        <span className="shrink-0 rounded-md bg-white/10 border border-white/20 px-2.5 py-0.5 text-white font-mono">
          {isAr ? currentConfig.badgeAr : currentConfig.badge}
        </span>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
        {currentConfig.plans.map(plan => {
          const monthlyPrice = plan.prices[currency] ?? plan.prices.USD
          const setupPrice = plan.setupFee[currency] ?? plan.setupFee.USD

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col justify-between rounded-2xl p-8 backdrop-blur-md transition-all duration-300',
                plan.featured
                  ? 'border-2 border-white bg-[#0c162a]/95'
                  : 'border border-slate-800 bg-[#0a1120]/80 hover:border-slate-700'
              )}
            >
              {plan.featured && (
                <div
                  className={cn(
                    'absolute -top-3.5 rounded-full bg-white px-3.5 py-0.5 text-xs font-bold uppercase tracking-wider text-slate-950 shadow-md',
                    isAr ? 'left-6' : 'right-6'
                  )}
                >
                  {isAr ? 'موصى بها' : 'Most Popular'}
                </div>
              )}

              <div>
                <h3 className="font-display text-2xl font-bold text-white">
                  {isAr ? plan.nameAr : plan.name}
                </h3>
                <p className="mt-2 text-sm text-slate-300">
                  {isAr ? plan.taglineAr : plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tabular-nums text-white">
                    {currency} {monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-slate-400">/{isAr ? 'شهر' : 'month'}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-400">
                    {isAr ? 'تشمل 7 أيام تجربة غير مقيدة' : 'Book a discovery call to confirm scope'}
                  </span>
                  <span className="text-slate-400">
                    {isAr ? 'إعداد لمرة واحدة:' : 'Setup:'} {currency} {setupPrice.toLocaleString()}
                  </span>
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3.5 text-sm text-slate-300">
                  {(isAr ? plan.featuresAr : plan.features).map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="size-4 shrink-0 text-emerald-400 mt-0.5" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8 pt-4 border-t border-slate-800/80">
                <Link
                  href={`/signup?plan=${plan.id}&region=${regionTier}&currency=${currency}`}
                  prefetch={false}
                  className={cn(
                    'flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-all shadow-md',
                    plan.featured
                      ? 'bg-white text-slate-950 hover:bg-white/90'
                      : 'border border-slate-700 bg-slate-800/80 text-white hover:bg-slate-700'
                  )}
                >
                  {isAr ? 'بدء التجربة المجانية (7 أيام)' : 'Start 7-Day Trial'}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Commercial FAQ Section */}
      <section
        aria-label="Frequently Asked Questions"
        className="mx-auto mt-24 max-w-4xl border-t border-slate-800 pt-16"
      >
        <h2 className="font-display text-2xl font-bold text-white text-center">
          {isAr ? 'الأسئلة الشائعة حول خطط التشغيل والفوترة' : 'Frequently Asked Questions'}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h4 className="text-base font-semibold text-slate-200">
              {isAr ? 'كيف تعمل التجربة المجانية لمدة 7 أيام؟' : 'What does the setup fee cover?'}
            </h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'تحصل على وصول كامل وغير مقيد لجميع أدوات النظام، ووكلاء الصوت وربط الواتساب. لا يتم خصم أي مبالغ من بطاقتك أثناء فترة التجربة.'
                : 'You receive unrestricted access to all features within your selected tier. Book a call is charged during trial onboarding.'}
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-200">
              {isAr ? 'هل يدعم النظام الدفع المحلي والتقسيط؟' : 'Do you support local payment methods?'}
            </h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'نعم، ندعم الدفع عبر مدى، Apple Pay، والبطاقات الائتمانية في الخليج، وخدمات فوري وإنستاباي في مصر، مع إمكانية تجزئة الفواتير عبر تابي وتمارا.'
                : 'Yes. We support Mada, Apple Pay, and credit cards across GCC, Fawry and InstaPay in Egypt, plus Tabby & Tamara installment plans.'}
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-200">
              {isAr ? 'كيف يتم عزل وحماية بيانات العملاء؟' : 'How is data isolated between client tenants?'}
            </h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'نستخدم نظام أمان PostgreSQL Row-Level Security الصارم على مستوى قاعدة البيانات، مع تشفير كامل لكل استفسار ومحادثة عبر المفاتيح الموثقة.'
                : 'Postgres Row-Level Security isolates every table query with signed JWT claims. Tenants cannot cross-read adjacent records.'}
            </p>
          </div>

          <div>
            <h4 className="text-base font-semibold text-slate-200">
              {isAr ? 'هل يمكن ترقية أو تعديل الباقة لاحقاً؟' : 'Can I switch tiers or add numbers later?'}
            </h4>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {isAr
                ? 'بالتأكيد، يمكنك ترقية باقتك أو إضافة أرقام هواتف وواتساب جديدة في أي وقت مع تسوية الفاتورة تلقائياً حسب مدة الاستخدام.'
                : 'Yes. Tier changes take effect immediately with prorated billing adjustments applied to your subsequent invoice.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
