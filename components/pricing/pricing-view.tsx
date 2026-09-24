'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Check,
  Building2,
  Zap,
  Tag,
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
    <div className="mx-auto max-w-6xl space-y-12" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-panel px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-accent font-mono">
          <Tag className="size-3.5" />
          {isAr ? 'خطط وتكاليف شفافة ومدروسة' : 'Transparent Operations Tiers'}
        </div>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          {isAr ? 'ابدأ مع تجربة مجانية غير مقيدة لمدة 7 أيام' : 'Start with a 7-day unrestricted trial.'}
        </h1>
        <p className="mt-4 text-base text-muted-foreground">
          {isAr
            ? 'هندسة تسعير إقليمية مرنة صُممت خصيصاً للشركات في الخليج العربي ومصر وشمال إفريقيا دون أي رسوم خفية.'
            : 'Select the operations tier matching your regional business scale and telephony infrastructure.'}
        </p>
      </header>

      {/* Control Switcher Bar: Region + Currency + Language */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-panel p-3">
        {/* Region Toggle Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleRegionChange('gcc_enterprise')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
              regionTier === 'gcc_enterprise'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-raised'
            )}
          >
            <Building2 className="size-4" />
            <span>{isAr ? 'الخليج العربي (الإمارات، السعودية، قطر)' : 'GCC Enterprise (UAE, KSA, Qatar)'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegionChange('mena_sme')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all',
              regionTier === 'mena_sme'
                ? 'bg-accent text-accent-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-raised'
            )}
          >
            <Zap className="size-4" />
            <span>{isAr ? 'الشركات المتوسطة (مصر، الأردن، وشمال إفريقيا)' : 'MENA SME (Egypt, Jordan, Regional)'}</span>
          </button>
        </div>

        {/* Currency & Language Selectors */}
        <div className="flex items-center gap-3">
          {/* Currency Pill Selector */}
          <div className="flex items-center rounded-lg border border-border bg-raised p-1">
            {currentConfig.availableCurrencies.map(curr => (
              <button
                key={curr}
                type="button"
                onClick={() => setCurrency(curr)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-bold font-mono transition-colors',
                  currency === curr
                    ? 'bg-panel text-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {curr}
              </button>
            ))}
          </div>

          {/* Language Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-raised p-1">
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                language === 'en' ? 'bg-panel text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage('ar')}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-colors',
                language === 'ar' ? 'bg-panel text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              عربي
            </button>
          </div>
        </div>
      </div>

      {/* Region Context Subheader */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
        <span>{isAr ? currentConfig.descriptionAr : currentConfig.description}</span>
        <span className="shrink-0 rounded-md bg-raised border border-border px-2.5 py-0.5 text-foreground font-mono">
          {isAr ? currentConfig.badgeAr : currentConfig.badge}
        </span>
      </div>

      {/* 3 Tier Cards Grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {currentConfig.plans.map(plan => {
          const monthlyPrice = plan.prices[currency] ?? plan.prices.USD
          const setupPrice = plan.setupFee[currency] ?? plan.setupFee.USD

          return (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col justify-between rounded-xl p-8 transition-colors',
                plan.featured
                  ? 'border-2 border-accent bg-panel'
                  : 'border border-border bg-panel'
              )}
            >
              {plan.featured && (
                <div
                  className={cn(
                    'absolute -top-3 rounded-full bg-accent px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-accent-foreground',
                    isAr ? 'left-6' : 'right-6'
                  )}
                >
                  {isAr ? 'الأكثر طلباً' : 'Most Popular'}
                </div>
              )}

              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">
                  {isAr ? plan.nameAr : plan.name}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {isAr ? plan.taglineAr : plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-bold tabular-nums text-foreground">
                    {currency} {monthlyPrice.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">/{isAr ? 'شهر' : 'month'}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-accent">
                    {isAr ? 'تشمل 7 أيام تجربة غير مقيدة' : 'Includes 7-day unrestricted trial'}
                  </span>
                  <span className="text-muted-foreground">
                    {isAr ? 'إعداد لمرة واحدة:' : 'Setup:'} {currency} {setupPrice.toLocaleString()}
                  </span>
                </div>

                {/* Plain Features List */}
                <ul className="mt-8 space-y-3.5 text-sm text-foreground">
                  {(isAr ? plan.featuresAr : plan.features).map(feat => (
                    <li key={feat} className="flex items-start gap-3">
                      <Check className="size-4 shrink-0 text-accent mt-0.5 stroke-[2]" />
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Call to Action Button */}
              <div className="mt-8 pt-4 border-t border-border">
                <Link
                  href={`/signup?plan=${plan.id}&region=${regionTier}&currency=${currency}`}
                  prefetch={false}
                  className={cn(
                    'flex h-10 w-full items-center justify-center rounded-md text-sm font-semibold transition-opacity',
                    plan.featured
                      ? 'bg-accent text-accent-foreground hover:opacity-90'
                      : 'border border-border bg-raised text-foreground hover:bg-raised/70'
                  )}
                >
                  {isAr ? 'بدء التجربة المجانية (7 أيام)' : 'Start 7-Day Trial'}
                </Link>
              </div>
            </div>
          )
        })}
      </div>

      {/* Commercial FAQ Section — Unified on Tokens */}
      <section
        aria-label="Frequently Asked Questions"
        className="mx-auto max-w-4xl border-t border-border pt-16"
      >
        <h2 className="font-display text-2xl font-bold text-foreground text-center">
          {isAr ? 'الأسئلة الشائعة حول خطط التشغيل والفوترة' : 'Frequently Asked Questions'}
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {isAr ? 'كيف تعمل التجربة المجانية لمدة 7 أيام؟' : 'How does the 7-day trial operate?'}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? 'تحصل على وصول كامل وغير مقيد لجميع أدوات النظام، ووكلاء الصوت وربط الواتساب. لا يتم خصم أي مبالغ من بطاقتك أثناء فترة التجربة.'
                : 'You receive unrestricted access to all features within your selected tier. No credit card is charged during trial onboarding.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {isAr ? 'هل يدعم النظام الدفع المحلي والتقسيط؟' : 'Do you support local payment methods?'}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? 'نعم، ندعم الدفع عبر مدى، Apple Pay، والبطاقات الائتمانية في الخليج، وخدمات فوري وإنستاباي في مصر، مع إمكانية تجزئة الفواتير عبر تابي وتمارا.'
                : 'Yes. We support Mada, Apple Pay, and credit cards across GCC, Fawry and InstaPay in Egypt, plus Tabby & Tamara installment plans.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {isAr ? 'كيف يتم عزل وحماية بيانات العملاء؟' : 'How is data isolated between client tenants?'}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isAr
                ? 'نستخدم نظام أمان PostgreSQL Row-Level Security الصارم على مستوى قاعدة البيانات، مع تشفير كامل لكل استفسار ومحادثة عبر المفاتيح الموثقة.'
                : 'Postgres Row-Level Security isolates every table query with signed JWT claims. Tenants cannot cross-read adjacent records.'}
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {isAr ? 'هل يمكن ترقية أو تعديل الباقة لاحقاً؟' : 'Can I switch tiers or add numbers later?'}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
