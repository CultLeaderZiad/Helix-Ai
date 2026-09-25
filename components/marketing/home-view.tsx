'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CalendarCheck,
  Check,
  ChevronRight,
  Database,
  Layers,
  Loader,
  MessageCircle,
  PhoneCall,
  PhoneMissed,
  Play,
  Quote,
  Radar,
  Receipt,
  RefreshCw,
  Target,
} from 'lucide-react'
import { INTEGRATIONS, marketingCopy } from '@/components/marketing/copy'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { SYSTEM_TEMPLATES, type SystemTemplate } from '@/lib/studio/templates'
import { REGIONAL_PRICING_CONFIGS } from '@/lib/pricing/tiers'

const WAVE = [18, 38, 62, 44, 80, 56, 30, 70, 92, 60, 36, 22, 48, 74, 52, 28, 40, 66, 34, 18, 44, 58, 26, 14, 30, 20, 12]

const DARK_BLURBS: Record<string, { en: string; ar: string }> = {
  'booking-receptionist': {
    en: 'Answers calls in Gulf Arabic & English, books Cal.com, sends a WhatsApp confirmation.',
    ar: 'يرد على المكالمات بالخليجية والإنجليزية، يحجز عبر Cal.com، ويرسل تأكيد واتساب.',
  },
  'lead-generation': {
    en: 'Find businesses by search or enrich your own list. Every email and phone carries its source — empty stays empty.',
    ar: 'ابحث عن أنشطة أو أثرِ قائمتك. كل بريد وهاتف يحمل مصدره — والفارغ يبقى فارغاً.',
  },
  'ar-invoicing': {
    en: 'Polite WhatsApp payment follow-ups for commercial invoices. Tap, Paymob or Moyasar links.',
    ar: 'متابعات واتساب مهذبة لفواتير الشركات. روابط Tap أو Paymob أو Moyasar.',
  },
}

const LIGHT_BLURBS: Record<string, { en: string; ar: string }> = {
  'booking-receptionist': {
    en: 'Answers calls in Gulf Arabic & English, books Cal.com, confirms on WhatsApp.',
    ar: 'يرد بالخليجية والإنجليزية، يحجز عبر Cal.com، ويؤكد على واتساب.',
  },
  'lead-generation': {
    en: 'Find businesses by search or enrich your own list. Every field shows its source — empty stays empty.',
    ar: 'ابحث عن أنشطة أو أثرِ قائمتك. كل حقل يُظهر مصدره — والفارغ يبقى فارغاً.',
  },
  'missed-call-responder': {
    en: 'WhatsApp seconds after a missed call. Qualify, route.',
    ar: 'واتساب بعد ثوانٍ من مكالمة فائتة. تأهيل وتوجيه.',
  },
  'lead-reactivation': {
    en: 'Wake dormant CRM contacts with WhatsApp sequences.',
    ar: 'إيقاظ جهات CRM الخاملة بتسلسلات واتساب.',
  },
  'lead-attribution': {
    en: 'Ad source → qualified lead → booking.',
    ar: 'مصدر الإعلان → عميل مؤهل → حجز.',
  },
}

const DEMO_LINES = [
  { t: '00:00.012', k: 'k-in', tag: 'INBOUND', text: 'Telephony webhook received: event="call.missed"' },
  { t: '00:00.028', k: 'k-au', tag: 'AUDIT', text: 'HMAC-SHA256 signature valid · tenant_id="cl_demo"' },
  { t: '00:00.045', k: 'k-rs', tag: 'REASON', text: 'Caller parsed: +971 50 *** 4182 · country="AE"' },
  { t: '00:00.061', k: 'k-eg', tag: 'EGRESS', text: 'POST n8n /webhook/system-1-missed-call' },
  { t: '00:00.099', k: 'k-ds', tag: 'DISPATCH', text: 'WhatsApp Cloud API · template rescue_inbound_ar_en' },
  { t: '00:00.118', k: 'k-ds', tag: 'DISPATCH', text: 'lang="ar_AE" · recipient="+971 50 *** 4182"' },
  { t: '00:00.155', k: 'k-in', tag: 'INBOUND', text: 'Delivery receipt: status="DELIVERED"' },
  { t: '00:03.410', k: 'k-in', tag: 'INBOUND', text: 'Reply received (ar) · 46 chars' },
  { t: '00:03.602', k: 'k-rs', tag: 'REASON', text: 'intent="BOOKING" urgency="HIGH" · band=probable' },
]

function money(cents: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(cents / 100)
}

function template(id: string): SystemTemplate {
  const found = SYSTEM_TEMPLATES.find(item => item.id === id)
  if (!found) throw new Error(`Missing system template ${id}`)
  return found
}

function IconBox({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <span
      className="icn"
      style={
        muted
          ? { color: '#C9D1DC', background: 'rgba(255,255,255,.04)', borderColor: 'var(--line2)' }
          : undefined
      }
    >
      {children}
    </span>
  )
}

export function SystemsCatalog() {
  const { theme, lang } = useMarketingPrefs()
  const copy = marketingCopy[lang]
  const day = theme === 'day'
  const [filter, setFilter] = useState<'core' | 'preview' | 'all'>('core')
  const booking = template('booking-receptionist')
  const missed = template('missed-call-responder')
  const reactivate = template('lead-reactivation')
  const qualify = template('lead-attribution')
  const collections = template('ar-invoicing')
  const leads = template('lead-generation')
  const previewFrom = Math.min(
    ...SYSTEM_TEMPLATES.filter(item => item.lane !== 'core' && item.id !== 'lead-generation').map(item => item.setupFeeCents),
  )
  const showCore = filter !== 'preview'
  const showPreview = filter !== 'core' || !day
  const ar = lang === 'ar'

  const name = (item: SystemTemplate) => {
    if (item.id === 'ar-invoicing') return ar ? 'تحصيل المستحقات' : 'AR collections'
    if (day && item.id === 'lead-attribution') return ar ? 'التأهيل والإسناد' : 'Qualification & attribution'
    return ar ? item.ar.name : item.en.name
  }
  const desc = (item: SystemTemplate) => {
    const short = day ? LIGHT_BLURBS : DARK_BLURBS
    const row = short[item.id]
    if (row) return ar ? row.ar : row.en
    return ar ? item.ar.description : item.en.description
  }

  return (
    <section className="sec" id="catalog" style={{ borderTop: day ? undefined : '1px solid var(--line)', paddingTop: day ? 64 : undefined }}>
      <div className="wrap">
        <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div className="kicker">{copy.catalogKicker}</div>
            <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 640 }}>{copy.catalogTitle}</h2>
            <p className="sec-p" style={{ marginTop: 16 }}>{day ? copy.catalogBodyLight : copy.catalogBody}</p>
            <p className="mono" style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 10 }}>{copy.perSystem}</p>
          </div>
          <div className="seg" role="tablist" aria-label={copy.catalogKicker}>
            <button type="button" className={filter === 'core' ? 'on' : undefined} onClick={() => setFilter('core')}>{copy.core}</button>
            <button type="button" className={filter === 'preview' ? 'on' : undefined} onClick={() => setFilter('preview')}>{copy.preview}</button>
            <button type="button" className={filter === 'all' ? 'on' : undefined} onClick={() => setFilter('all')}>{copy.all}</button>
          </div>
        </div>
        <div className="bento">
          {showCore && !day ? (
            <div className="card book-split" style={{ gridColumn: 'span 4', minHeight: 300 }}>
              <div className="spot" style={{ left: -120, top: -160 }} />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><PhoneCall size={20} /></IconBox>
                <div className="row" style={{ gap: 8 }}>
                  <span className="chip acc">{copy.core}</span>
                  <span className="chip">{ar ? 'الأكثر حجزاً' : 'Most booked'}</span>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'end' }} className="book-split">
                <div>
                  <div className="ctitle" style={{ fontSize: 26 }}>{name(booking)}</div>
                  <div className="cdesc">{desc(booking)}</div>
                  <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(booking) }} />
                </div>
                <div className="panel" style={{ padding: 14 }}>
                  <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--subtle)' }}>
                    <span>{ar ? 'صوت · مكالمة تجريبية' : 'Voice · live call'}</span>
                    <span className="mono">00:42</span>
                  </div>
                  <div className="wave" style={{ marginTop: 6 }} aria-hidden>
                    {WAVE.map((height, index) => (
                      <i key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {showCore && day ? (
            <div className="card" style={{ gridColumn: 'span 3', background: 'linear-gradient(160deg,#FFFFFF 40%,#EAF6F0)' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><PhoneCall size={20} /></IconBox>
                <div className="row" style={{ gap: 6 }}>
                  <span className="chip dk">{copy.core}</span>
                  <span className="chip">{ar ? 'الأكثر حجزاً' : 'Most booked'}</span>
                </div>
              </div>
              <div className="ctitle" style={{ fontSize: 26 }}>{name(booking)}</div>
              <div className="cdesc">{desc(booking)}</div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(booking) }} />
            </div>
          ) : null}
          {showCore && day ? (
            <div className="card" id="lead-generation" style={{ gridColumn: 'span 3' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><Radar size={20} /></IconBox>
                <span className="chip acc">{ar ? 'جديد · v2' : 'New · v2'}</span>
              </div>
              <div className="ctitle" style={{ fontSize: 26 }}>{name(leads)}</div>
              <div className="cdesc">{desc(leads)}</div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(leads) }} />
            </div>
          ) : null}
          {showCore ? (
            <article className="card" style={{ gridColumn: 'span 2' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><PhoneMissed size={20} /></IconBox>
                <span className={day ? 'chip dk' : 'chip acc'}>{copy.core}</span>
              </div>
              <div className="ctitle">{name(missed)}</div>
              <div className="cdesc">{desc(missed)}</div>
              {!day ? (
                <div className="panel mono" style={{ marginTop: 16, padding: '10px 12px', fontSize: 11.5, color: 'var(--muted)' }}>
                  <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                    <span><PhoneMissed size={12} style={{ color: 'var(--danger)', verticalAlign: -2 }} /> 14:02:00 {ar ? 'فائتة' : 'missed'}</span>
                    <span style={{ color: 'var(--accent)' }}>→ WhatsApp 14:02:05</span>
                  </div>
                </div>
              ) : null}
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(missed, day) }} />
            </article>
          ) : null}
          {showCore ? (
            <article className="card" style={{ gridColumn: 'span 2' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><RefreshCw size={20} /></IconBox>
                <div className="row" style={{ gap: 6 }}>
                  <span className={day ? 'chip dk' : 'chip acc'}>{copy.core}</span>
                  {!day ? <span className="chip">{ar ? 'أعلى عائد' : 'Highest ROI'}</span> : null}
                </div>
              </div>
              <div className="ctitle">{name(reactivate)}</div>
              <div className="cdesc">{desc(reactivate)}</div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(reactivate, day) }} />
            </article>
          ) : null}
          {showCore ? (
            <article className="card" style={{ gridColumn: 'span 2' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><Target size={20} /></IconBox>
                <span className={day ? 'chip dk' : 'chip acc'}>{copy.core}</span>
              </div>
              <div className="ctitle">{name(qualify)}</div>
              <div className="cdesc">{desc(qualify)}</div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(qualify, day) }} />
            </article>
          ) : null}
          {showCore && !day ? (
            <article className="card" style={{ gridColumn: 'span 2' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><Receipt size={20} /></IconBox>
                <div className="row" style={{ gap: 6 }}>
                  <span className="chip acc">{copy.core}</span>
                  <span className="chip">{ar ? 'للشركات فقط' : 'B2B only'}</span>
                </div>
              </div>
              <div className="ctitle">{name(collections)}</div>
              <div className="cdesc">{desc(collections)}</div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(collections) }} />
            </article>
          ) : null}
          {showCore && !day ? (
            <article className="card" id="lead-generation" style={{ gridColumn: 'span 3' }}>
              <div className="spot" style={{ right: -160, bottom: -200, left: 'auto' }} />
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox><Radar size={20} /></IconBox>
                <span className="chip cy">{ar ? 'جديد · v2' : 'New · v2'}</span>
              </div>
              <div className="ctitle">{name(leads)}</div>
              <div className="cdesc">{desc(leads)}</div>
              <div className="panel mono" style={{ marginTop: 16, padding: '10px 12px', fontSize: 11.5, color: 'var(--muted)' }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <span>{ar ? 'عيادات أسنان دبي · مثال' : 'dental clinics Dubai'}</span>
                  <span style={{ color: 'var(--accent)' }}>{ar ? '١٤ / ٢٠ مُثرى · مثال' : '14 / 20 enriched'}</span>
                </div>
                <div style={{ height: 4, borderRadius: 4, background: '#1F2630', marginTop: 8, overflow: 'hidden' }}>
                  <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg,#34E0A1,#38C6E0)' }} />
                </div>
              </div>
              <div className="price" dangerouslySetInnerHTML={{ __html: priceHtml(leads) }} />
            </article>
          ) : null}
          {showPreview ? (
            <article className="card" style={{ gridColumn: day ? 'span 6' : 'span 3' }}>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <IconBox muted><Layers size={20} /></IconBox>
                <span className="chip">{copy.preview}</span>
              </div>
              <div className="ctitle">
                {ar
                  ? 'مراقبة المنافس · إجابات الدليل · بطاقة الظهور · مصنع العروض · مصنع المقاطع'
                  : 'Rival Watch · Handbook Answers · Visibility Scorecard · Deck Factory · Clip Factory'}
              </div>
              <div className="cdesc">
                {ar
                  ? `أنظمة للمعاينة — العروض سيناريوهات وليست بثاً حياً. من ${money(previewFrom)} إعداد.`
                  : `Preview systems — demos are scripted, not live. From ${money(previewFrom)} setup.`}
              </div>
              <div className="row" style={{ gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
                {(ar
                  ? ['تنبيهات أسعار المنافسين', 'مساعد إجراءات', 'تدقيق ظهور محلي', 'عروض تقديمية', 'مقاطع عمودية']
                  : ['Competitor pricing alerts', 'SOP assistant', 'Local SEO audit', 'Proposal decks', 'Vertical clips']
                ).map(label => (
                  <span key={label} className="chip">{label}</span>
                ))}
              </div>
            </article>
          ) : null}
        </div>
        <p style={{ marginTop: 18 }}>
          <Link href="/pricing" style={{ color: 'var(--accent)', fontSize: 14 }}>{copy.plansLink}</Link>
        </p>
      </div>
    </section>
  )
}

function priceHtml(item: SystemTemplate, compact = false) {
  const setup = item.pricePrefix === 'from' ? `From ${money(item.setupFeeCents)}` : money(item.setupFeeCents)
  const monthly = money(item.monthlyRetainerCents)
  if (compact) return `<b>${setup}</b> · <b>${monthly}</b>/mo`
  return `<b>${setup}</b> setup · <b>${monthly}</b>/mo`
}

const HOME_BULLETS = {
  en: {
    starter: ['Phone + WhatsApp, single location', 'Bilingual voice agent (Gulf Arabic + English)', 'Human-in-the-loop evidence queue'],
    growth: ['Voice, WhatsApp & email automation', 'Missed-call WhatsApp text-back & triage', 'Payment reminders with Mada & Apple Pay links'],
    custom: ['Any system from the catalog', 'Lead Gen + CRM pipelines', 'Arabic-first copy & templates'],
  },
  ar: {
    starter: ['هاتف + واتساب، موقع واحد', 'وكيل صوتي ثنائي اللغة (خليجي + إنجليزي)', 'طابور أدلة بمراجعة بشرية'],
    growth: ['أتمتة الصوت والواتساب والبريد', 'رد واتساب على المكالمات الفائتة وفرزها', 'تذكيرات دفع بروابط مدى وApple Pay'],
    custom: ['أي نظام من الكتالوج', 'مسارات توليد العملاء وإدارة العملاء', 'نصوص وقوالب عربية أولاً'],
  },
}

export function PricingBand({ heading = true, full = false }: { heading?: boolean; full?: boolean }) {
  const { theme, lang } = useMarketingPrefs()
  const copy = marketingCopy[lang]
  const day = theme === 'day'
  const gcc = REGIONAL_PRICING_CONFIGS.gcc_enterprise
  const starter = gcc.plans[0]
  const growth = gcc.plans[1]
  const bullets = HOME_BULLETS[lang]
  const customName = lang === 'ar' ? 'بناء مخصص' : 'Custom build'
  const customSetup = lang === 'ar' ? 'مواقع متعددة · أنظمة مخصصة' : 'Multi-location · custom systems'

  return (
    <section className="sec" id="pricing" style={{ paddingTop: 40 }}>
      <div className="wrap">
        {heading ? (
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div className="kicker">{copy.offerKicker}</div>
              <h2 className="sec-h" style={{ marginTop: 14 }}>{copy.offerTitle}</h2>
              <p className="mono" style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 8 }}>{copy.monthlyCaption}</p>
            </div>
            <div className="seg" aria-label={copy.monthlyCaption}>
              <span className="on">GCC · AED</span>
            </div>
          </div>
        ) : null}
        <div className="plans">
          <Plan
            day={day}
            name={lang === 'ar' ? starter.nameAr : starter.name}
            price={`AED ${starter.prices.AED?.toLocaleString('en-US')}`}
            period={lang === 'ar' ? '/ شهر' : '/ month'}
            setup={`${lang === 'ar' ? 'إعداد' : 'Setup'} AED ${starter.setupFee.AED?.toLocaleString('en-US')}`}
            items={bullets.starter}
            href="/signup"
            cta={copy.trialCta}
          />
          <Plan
            day={day}
            popular
            name={lang === 'ar' ? growth.nameAr.replace(' (الأكثر طلباً)', '') : growth.name}
            price={`AED ${growth.prices.AED?.toLocaleString('en-US')}`}
            period={lang === 'ar' ? '/ شهر' : '/ month'}
            setup={`${lang === 'ar' ? 'إعداد' : 'Setup'} AED ${growth.setupFee.AED?.toLocaleString('en-US')}`}
            items={bullets.growth}
            href="/signup"
            cta={copy.trialCta}
            badge={lang === 'ar' ? 'الأكثر طلباً' : 'Most popular'}
          />
          <Plan
            day={day}
            name={customName}
            price={copy.scope}
            setup={customSetup}
            items={bullets.custom}
            href="/signup"
            cta={copy.build}
            ink
          />
        </div>
        <p className="mono" style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 18 }}>
          {copy.priceNote}{' '}
          <Link href="/studio" style={{ color: 'var(--accent)' }}>{copy.studioLink}</Link>
        </p>
        {full ? <details style={{ marginTop: 18, color: 'var(--muted)', fontSize: 14 }}>
          <summary>{lang === 'ar' ? 'قائمة المزايا الكاملة من صفحة الأسعار' : 'Full feature list from the pricing catalog'}</summary>
          <div className="prose">
            {gcc.plans.map(plan => (
              <div key={plan.id}>
                <h3>{lang === 'ar' ? plan.nameAr : plan.name}</h3>
                <ul>
                  {(lang === 'ar' ? plan.featuresAr : plan.features).map(feature => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </details> : null}
      </div>
    </section>
  )
}

function Plan({
  day,
  popular,
  name,
  price,
  period,
  setup,
  items,
  href,
  cta,
  badge,
  ink,
}: {
  day: boolean
  popular?: boolean
  name: string
  price: string
  period?: string
  setup: string
  items: readonly string[]
  href: string
  cta: string
  badge?: string
  ink?: boolean
}) {
  const buttonClass = popular
    ? day
      ? 'btn'
      : 'btn btn-primary'
    : ink
      ? day
        ? 'btn btn-ink'
        : 'btn btn-ghost'
      : day
        ? 'btn btn-out'
        : 'btn btn-ghost'
  return (
    <div className={`plan${popular ? ' pop' : ''}`}>
      <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
        <div style={{ fontSize: 15, color: popular ? 'var(--text)' : 'var(--muted)' }}>{name}</div>
        {badge ? (
          <span className="chip acc" style={day ? { background: '#34E0A1', color: '#04130D', borderColor: '#34E0A1' } : undefined}>
            {badge}
          </span>
        ) : null}
      </div>
      <div className="pp">
        {price} {period ? <small>{period}</small> : null}
      </div>
      <div className={`mono${popular && day ? ' muted' : ''}`} style={{ fontSize: 12, color: popular && day ? undefined : 'var(--subtle)', marginTop: 6 }}>
        {setup}
      </div>
      <div style={{ marginTop: 18 }}>
        {items.map(item => (
          <div className="li" key={item}>
            <Check size={14} style={popular && day ? { color: '#34E0A1' } : undefined} />
            {item}
          </div>
        ))}
      </div>
      <Link
        href={href}
        className={buttonClass}
        style={{
          marginTop: 24,
          width: '100%',
          justifyContent: 'center',
          ...(popular && day ? { background: '#34E0A1', color: '#04130D' } : {}),
        }}
      >
        {cta} {ink ? <ArrowUpRight size={14} /> : null}
      </Link>
    </div>
  )
}

export function HomeView() {
  const { theme, lang } = useMarketingPrefs()
  const copy = marketingCopy[lang]
  const day = theme === 'day'
  const ar = lang === 'ar'
  const [script, setScript] = useState<'triage' | 'voice' | 'qualify'>('triage')

  return (
    <>
      <section className="hero" id="hero">
        {day ? (
          <>
            <div className="dots" />
            <div className="mint" />
          </>
        ) : (
          <div className="hero-bg">
            <div className="glow" />
            <div className="grid" />
            <div className="ray" style={{ left: '44%', transform: 'rotate(18deg)' }} />
            <div className="ray" style={{ left: '48%', transform: 'rotate(8deg)', opacity: 0.35 }} />
            <div className="ray" style={{ left: '51%', transform: 'rotate(-4deg)', opacity: 0.45 }} />
            <div className="ray" style={{ left: '55%', transform: 'rotate(-14deg)', opacity: 0.3 }} />
            <div className="ray hide-sm" style={{ left: '58%', transform: 'rotate(-24deg)', opacity: 0.22 }} />
          </div>
        )}
        <div className="wrap" style={{ position: 'relative' }}>
          {day ? <LightHero copy={copy} ar={ar} /> : <DarkHero copy={copy} ar={ar} />}
        </div>
      </section>

      <section id="marquee" style={{ padding: day ? '0 0 40px' : '8px 0 24px' }}>
        {day ? (
          <div className="wrap">
            <div className="row" style={{ gap: 28, alignItems: 'center' }}>
              <div className="label" style={{ flex: 'none' }}>
                {copy.integrates}
                <br />
                <span style={{ textTransform: 'none', letterSpacing: 0, color: '#B3ADA2' }}>{copy.notEndorsements}</span>
              </div>
              <div className="marquee" style={{ flex: 1 }} dir="ltr">
                {INTEGRATIONS.slice(0, 10).map(name => (
                  <span className="wm" key={name}>{name}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="wrap" style={{ textAlign: 'center' }}>
              <div className="label" style={{ letterSpacing: ar ? 0 : '0.14em' }}>
                {copy.plugs} <span style={{ color: '#4d5563', textTransform: 'none', letterSpacing: 0 }}>{copy.plugsNote}</span>
              </div>
            </div>
            <div className="marquee" style={{ marginTop: 26 }} dir="ltr">
              {INTEGRATIONS.map(name => (
                <span className="wm" key={name}>{name}</span>
              ))}
            </div>
          </>
        )}
      </section>

      <section className={day ? undefined : 'sec'} id="demo" style={day ? { padding: '40px 0 96px' } : { paddingTop: 96 }}>
        <div className="wrap">
          {day ? (
            <div style={{ background: '#111214', borderRadius: 28, padding: 56, display: 'grid', gridTemplateColumns: '380px 1fr', gap: 48, alignItems: 'center', color: '#F2F4F7', position: 'relative', overflow: 'hidden' }} className="demo-grid">
              <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 80% 0%,rgba(52,224,161,.14),transparent 70%)' }} />
              <div style={{ position: 'relative' }}>
                <div className="kicker" style={{ color: '#34E0A1' }}>{copy.demoKicker}</div>
                <h2 className="sec-h" style={{ marginTop: 14, fontSize: 44, color: '#fff' }}>{copy.demoTitle}</h2>
                <p className="sec-p" style={{ marginTop: 16, color: '#9AA3B2' }}>{copy.demoBodyLight}</p>
                <ScriptPills script={script} setScript={setScript} ar={ar} light />
              </div>
              <DemoTerminal compact />
            </div>
          ) : (
            <div className="demo-grid" style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: 56, alignItems: 'center' }}>
              <div>
                <div className="kicker">{copy.demoKicker}</div>
                <h2 className="sec-h" style={{ marginTop: 14 }}>{copy.demoTitle}</h2>
                <p className="sec-p" style={{ marginTop: 18 }}>{copy.demoBody}</p>
                <div className="col" style={{ gap: 8, marginTop: 28 }}>
                  <ScriptRow on={script === 'triage'} onClick={() => setScript('triage')} index="01" label={ar ? 'فرز المكالمات الفائتة' : 'Missed-call triage'} />
                  <ScriptRow on={script === 'voice'} onClick={() => setScript('voice')} index="02" label={ar ? 'موظف الاستقبال الصوتي' : 'Voice receptionist'} />
                  <ScriptRow on={script === 'qualify'} onClick={() => setScript('qualify')} index="11" label={ar ? 'تأهيل العملاء' : 'Lead qualification'} />
                </div>
              </div>
              <div className="window" style={{ borderRadius: 16 }}>
                <div className="wbar">
                  <span className="wdots"><i /><i /><i /></span>
                  <span className="mono" style={{ marginInlineStart: 8 }}>~/helix/live-pipeline/system_1</span>
                  <span className="grow" />
                  <span className="sample">{ar ? 'سيناريو تجريبي' : 'Demo script'}</span>
                  <span className="chip">1×</span>
                </div>
                <div className="term" style={{ padding: '16px 18px', minHeight: 360 }}>
                  <DemoLines />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SystemsCatalog />

      <section className="sec" id="how" style={{ paddingTop: day ? 24 : 40 }}>
        <div className="wrap">
          {day ? (
            <>
              <div className="kicker">{copy.howKicker}</div>
              <h2 className="sec-h" style={{ marginTop: 14, maxWidth: 720 }}>{copy.howTitle}</h2>
              <div className="steps">
                <LightStep n="01" on title={ar ? 'صف مسار العمل' : 'Describe the workflow'} body={ar ? 'موجز قصير على helixx.xo.je/build.' : 'Short brief at helixx.xo.je/build.'} width="100%" />
                <LightStep n="02" on title={ar ? 'نبنيه على n8n' : 'We build it on n8n'} body={ar ? 'موصول بواتسابك وأدواتك.' : 'Wired to your WhatsApp and tools.'} width="100%" />
                <LightStep n="03" title={ar ? 'اختبره على هاتفك' : 'Test on your phone'} body={ar ? 'بالعربي والإنجليزي قبل الإطلاق.' : 'Arabic and English, before go-live.'} width="45%" />
                <LightStep n="04" title={ar ? 'شغّله من اللوحة' : 'Run it in the console'} body={ar ? 'نطاقات الأدلة، طابور المراجعة، تقرير أسبوعي.' : 'Evidence bands, review queue, weekly report.'} width="0%" />
              </div>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center' }}>
                <div className="kicker">{copy.howKicker}</div>
                <h2 className="sec-h" style={{ margin: '14px auto 0', maxWidth: 760 }}>{copy.howTitle}</h2>
              </div>
              <div className="steps4">
                <div>
                  <div className="num on">01</div>
                  <div className="ctitle">{ar ? 'صف مسار العمل' : 'Describe the workflow'}</div>
                  <div className="cdesc">{ar ? 'أجب عن موجز قصير في helixx.xo.je/build: القنوات، اللغات، التقويم، وإدارة العملاء.' : 'Answer a short brief at helixx.xo.je/build: channels, languages, calendar, CRM.'}</div>
                </div>
                <div>
                  <div className="num on">02</div>
                  <div className="ctitle">{ar ? 'نبنيه على n8n' : 'We build it on n8n'}</div>
                  <div className="cdesc">{ar ? 'مسارات ونصوص وقوالب موصولة برقم واتسابك وأدواتك.' : 'Workflows, prompts and templates wired to your WhatsApp number and tools.'}</div>
                </div>
                <div>
                  <div className="num cur">03</div>
                  <div className="ctitle">{ar ? 'اختبره على هاتفك' : 'Test on your phone'}</div>
                  <div className="cdesc">{ar ? 'اتصل وراسل وحاول كسره — بالعربي والإنجليزي — قبل الإطلاق.' : 'Call, message and try to break it — in Arabic and English — before go-live.'}</div>
                </div>
                <div>
                  <div className="num">04</div>
                  <div className="ctitle">{ar ? 'شغّله من اللوحة' : 'Run it in the console'}</div>
                  <div className="cdesc">{ar ? 'كل إجراء مسجّل مع نطاقات الأدلة. تقرير أسبوعي وطابور مراجعة بشرية.' : 'Every action logged with evidence bands. Weekly report, human review queue.'}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <PricingBand />

      <section className="sec" id="cta" style={{ paddingTop: day ? 0 : 24, paddingBottom: 80 }}>
        <div className="wrap">
          {!day ? (
            <div className="card" style={{ padding: '28px 32px', borderStyle: 'dashed', borderColor: 'var(--line2)', background: 'transparent', display: 'flex', gap: 20, alignItems: 'center' }}>
              <Quote size={22} style={{ color: 'var(--subtle)', flex: 'none' }} />
              <div style={{ fontSize: 15, color: 'var(--muted)' }}>{copy.testimonial}</div>
            </div>
          ) : null}
          <div
            className="card"
            style={{
              marginTop: day ? 0 : 24,
              padding: 64,
              textAlign: 'center',
              background: day
                ? 'radial-gradient(ellipse 60% 90% at 50% 0%,rgba(18,165,121,.16),transparent 70%),#fff'
                : 'radial-gradient(ellipse 60% 80% at 50% 0%,rgba(52,224,161,.18),transparent 70%),linear-gradient(180deg,#10161A,#0B0E13)',
              borderColor: day ? undefined : 'rgba(52,224,161,.25)',
            }}
          >
            <h2 className="sec-h" style={{ fontSize: 44 }}>{copy.ctaTitle}</h2>
            <p className="sec-p" style={{ margin: '16px auto 0' }}>{day ? copy.ctaBodyLight : copy.ctaBody}</p>
            <div className="row" style={{ justifyContent: 'center', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <a className={day ? 'btn btn-acc btn-lg' : 'btn btn-primary btn-lg'} href="https://helixx.xo.je/build">
                {copy.ctaStart} <ArrowUpRight size={18} />
              </a>
              <Link className={day ? 'btn btn-out btn-lg' : 'btn btn-ghost btn-lg'} href="/contact">
                {day ? copy.ctaWa : copy.ctaTalk}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

function DarkHero({ copy, ar }: { copy: (typeof marketingCopy)[keyof typeof marketingCopy]; ar: boolean }) {
  return (
    <>
      <div style={{ textAlign: 'center', paddingTop: 72 }} className="hero-copy">
        <span className="eyebrow" style={ar ? { padding: '5px 6px 5px 14px' } : undefined}>
          <span className="tag">{copy.new}</span>
          <span className="shiny desk-only">{copy.eyebrow}</span>
          <span className="shiny mob-only" style={{ display: 'none' }}>{copy.eyebrowShort}</span>
          <ChevronRight size={14} className={ar ? 'flip' : undefined} style={{ color: 'var(--subtle)' }} />
        </span>
        <h1 className="hero-h" style={{ margin: '28px auto 0', maxWidth: ar ? 1000 : 1040 }}>
          {copy.heroBefore}
          <em>{copy.heroEm}</em>
        </h1>
        <p className="lead desk-only" style={{ margin: '26px auto 0', maxWidth: ar ? 760 : 720 }}>{copy.lead}</p>
        <p className="lead mob-only" style={{ display: 'none' }}>{copy.leadMobile}</p>
        <div className="row hero-ctas" style={{ justifyContent: 'center', gap: 12, marginTop: 36, flexWrap: 'wrap' }}>
          <Link className="btn btn-primary btn-lg stack" href="/signup">
            {copy.build} <ArrowRight size={18} className={ar ? 'flip' : undefined} />
          </Link>
          <a className="btn btn-ghost btn-lg stack" href="#demo">
            <Play size={14} /> {copy.watch}
          </a>
        </div>
        <div className="micro" style={{ marginTop: 20 }}>
          <span><span className="dot" />{copy.trial}</span>
          <span>·</span>
          <span>{copy.noCard}</span>
          <span>·</span>
          <span className="desk-only">{copy.langs}</span>
          <span className="mob-only" style={{ display: 'none' }}>{copy.langsShort}</span>
        </div>
      </div>
      <div className="window fade-b desk-prod" style={{ marginTop: 64, height: 540 }}>
        <ProductWindow ar={ar} />
      </div>
      <MobileProduct ar={ar} />
    </>
  )
}

function LightHero({ copy, ar }: { copy: (typeof marketingCopy)[keyof typeof marketingCopy]; ar: boolean }) {
  return (
    <div className="light-hero" style={{ display: 'grid', gridTemplateColumns: '600px 1fr', gap: 40, alignItems: 'center', padding: '72px 0 96px' }}>
      <div>
        <span className="eyebrow">
          <span className="tag">{copy.new}</span>
          {copy.eyebrowLight}
          <ChevronRight size={14} style={{ color: 'var(--subtle)' }} />
        </span>
        <h1 className="hero-h" style={{ marginTop: 28 }}>
          {copy.lightBefore}
          <em>{copy.lightEm}</em>
          {copy.lightAfter}
        </h1>
        <p className="lead" style={{ marginTop: 24, maxWidth: 540 }}>{copy.leadLight}</p>
        <div className="row" style={{ gap: 12, marginTop: 34, flexWrap: 'wrap' }}>
          <Link className="btn btn-acc btn-lg" href="/signup">
            {copy.build} <ArrowRight size={18} className={ar ? 'flip' : undefined} />
          </Link>
          <a className="btn btn-out btn-lg" href="#demo">
            <Play size={14} /> {copy.watch}
          </a>
        </div>
        <div className="micro" style={{ marginTop: 22 }}>
          <span className="row" style={{ gap: 6 }}><span className="dot" />{copy.trial}</span>
          <span>·</span>
          <span>{copy.noCardShort}</span>
          <span>·</span>
          <span>{copy.langs}</span>
        </div>
      </div>
      <div className="light-stage" style={{ position: 'relative', height: 540 }}>
        <div className="card" style={{ position: 'absolute', right: 0, top: 10, width: 520, padding: 0 }}>
          <div className="row" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', gap: 10 }}>
            <Radar size={18} style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: 14, fontWeight: 500 }}>{ar ? 'ابحث عن عملاء' : 'Find leads'}</span>
            <span className="mono" style={{ fontSize: 12, color: 'var(--subtle)' }}>{ar ? 'عيادات أسنان في دبي · مثال' : 'dental clinics in Dubai'}</span>
            <span style={{ flex: 1 }} />
            <span className="sample">{ar ? 'مثال' : 'Sample'}</span>
          </div>
          <div style={{ padding: '16px 18px' }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: 'var(--muted)' }}>{ar ? 'إثراء المواقع' : 'Enriching websites'}</span>
              <span className="mono">14 / 20</span>
            </div>
            <div className="bar"><i style={{ width: '70%' }} /></div>
            <table className="tbl" style={{ marginTop: 14 }}>
              <tbody>
                <tr>
                  <td style={{ fontWeight: 500 }}>Pearl Smile Dental <span style={{ color: 'var(--subtle)', fontWeight: 400 }}>· example</span></td>
                  <td className="mono" style={{ color: 'var(--muted)' }}>info@…</td>
                  <td style={{ textAlign: 'end' }}><span className="chip acc">86</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>Marina Dental Care <span style={{ color: 'var(--subtle)', fontWeight: 400 }}>· example</span></td>
                  <td className="mono" style={{ color: 'var(--muted)' }}>+971 4 …</td>
                  <td style={{ textAlign: 'end' }}><span className="chip acc">78</span></td>
                </tr>
                <tr>
                  <td style={{ fontWeight: 500 }}>Jumeirah Family Clinic <span style={{ color: 'var(--subtle)', fontWeight: 400 }}>· example</span></td>
                  <td className="mono" style={{ color: 'var(--subtle)' }}>— no email</td>
                  <td style={{ textAlign: 'end' }}><span className="chip">61</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card" style={{ position: 'absolute', left: 0, top: 250, width: 330, padding: 16, borderRadius: 18 }}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-soft)', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
              <MessageCircle size={14} />
            </span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{ar ? 'واتساب · مكالمة فائتة' : 'WhatsApp · missed call'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--subtle)' }}>{ar ? 'رد خلال 4.2 ث · مثال' : 'replied in 4.2s · sample'}</div>
            </div>
          </div>
          <div dir="rtl" className="col" style={{ gap: 8, marginTop: 12, fontFamily: '"IBM Plex Sans Arabic", sans-serif', fontSize: 13.5, lineHeight: 1.6 }}>
            <div style={{ alignSelf: 'flex-start', background: '#E3F3EC', borderRadius: 12, padding: '8px 11px' }}>مرحباً! لاحظنا اتصالك. كيف نقدر نساعدك؟</div>
            <div style={{ alignSelf: 'flex-end', background: '#F1EEE7', borderRadius: 12, padding: '8px 11px' }}>أبغى موعد بكرة العصر</div>
          </div>
        </div>
        <div className="card" style={{ position: 'absolute', right: 40, top: 420, width: 300, padding: '14px 16px', borderRadius: 16, background: '#141414', color: '#fff', borderColor: '#141414' }}>
          <div className="row" style={{ gap: 10 }}>
            <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(52,224,161,.15)', display: 'grid', placeItems: 'center', color: '#34E0A1' }}>
              <CalendarCheck size={14} />
            </span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{ar ? 'محجوز 17:15 على Cal.com' : 'Held 17:15 on Cal.com'}</div>
              <div style={{ fontSize: 11.5, color: '#A8A39A' }}>{ar ? 'بانتظار تأكيد المتصل · مثال' : 'Awaiting caller confirmation'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProductWindow({ ar }: { ar: boolean }) {
  return (
    <>
      <div className="wbar">
        <span className="wdots"><i /><i /><i /></span>
        <span style={{ marginInlineStart: 8, fontFamily: 'var(--font-geist), sans-serif' }}>helix · console</span>
        <span style={{ color: '#3a414c' }}>/</span>
        <span style={{ color: 'var(--text)' }}>{ar ? 'تشغيل مباشر — فرز المكالمات الفائتة' : 'Live run — Missed-call triage'}</span>
        <span className="grow" />
        <span className="sample">{ar ? 'تشغيل تجريبي' : 'Sample run'}</span>
        <span className="chip acc"><span className="dot" style={{ width: 5, height: 5, boxShadow: 'none' }} />{ar ? 'مباشر' : 'Streaming'}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr 300px', height: 496 }}>
        <div style={{ borderInlineEnd: '1px solid var(--line)', padding: '18px 20px' }}>
          <div className="label">{ar ? 'مسار التنفيذ' : 'Pipeline'}</div>
          <div style={{ position: 'relative', marginTop: 10 }}>
            <div style={{ position: 'absolute', insetInlineStart: 11.5, top: 22, bottom: 30, width: 1, background: 'linear-gradient(180deg,#34E0A1 0%,#34E0A1 55%,#38C6E0 62%,rgba(255,255,255,.1) 64%)' }} />
            <Step done title={ar ? 'رُصدت مكالمة فائتة' : 'Missed call detected'} meta="00:00.012 · Vapi SIP" icon={<Check size={12} />} />
            <Step done title={ar ? 'تحليل المتصل · الإمارات' : 'Caller parsed · AE'} meta={ar ? 'تم التحقق من التوقيع' : '00:00.045 · HMAC verified'} icon={<Check size={12} />} />
            <Step done title={ar ? 'أُرسلت رسالة واتساب' : 'WhatsApp sent (ar_AE)'} meta={ar ? 'ar_AE · 00:00.134' : '00:00.134 · template'} icon={<Check size={12} />} />
            <Step run title={ar ? 'جارٍ تحديد النية…' : 'Qualifying intent…'} meta={ar ? 'لهجة خليجية' : 'Gulf Arabic dialect'} icon={<Loader size={12} style={{ color: 'var(--accent2)' }} />} />
            <Step title={ar ? 'الحجز على Cal.com' : 'Book on Cal.com'} meta={ar ? 'بانتظار' : 'waiting'} muted icon={<Calendar size={12} style={{ color: 'var(--subtle)' }} />} />
            {!ar ? <Step title="Write to CRM" meta="waiting" muted icon={<Database size={12} style={{ color: 'var(--subtle)' }} />} /> : null}
          </div>
        </div>
        <div style={{ padding: '18px 24px', background: ar ? undefined : 'radial-gradient(ellipse at 50% 0%,rgba(52,224,161,.05),transparent 60%)' }}>
          <div className="row" style={{ justifyContent: 'space-between', gap: 10 }}>
            <div className="row" style={{ gap: 10 }}>
              <span style={{ width: 32, height: 32, borderRadius: '50%', background: '#1d2a25', display: 'grid', placeItems: 'center', color: 'var(--accent)' }}>
                <MessageCircle size={14} />
              </span>
              <div>
                <div style={{ fontSize: 14 }}>{ar ? 'واتساب · ' : 'WhatsApp · '}<span dir="ltr">+971 50 *** 4182</span></div>
                <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{ar ? 'عيادة أسنان · عميل تجريبي' : 'Dental clinic · example tenant'}</div>
              </div>
            </div>
            <span className="chip cy">{ar ? 'عربي · خليجي' : 'Arabic · Gulf'}</span>
          </div>
          <div className="col" dir="rtl" style={{ gap: 10, marginTop: 22, fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
            <div className="bubble out" style={ar ? { alignSelf: 'flex-start' } : undefined}>مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟</div>
            <div className="bubble in" style={ar ? { alignSelf: 'flex-end' } : undefined}>أبغى أحجز موعد تنظيف أسنان بكرة العصر</div>
            <div className="bubble out" style={ar ? { alignSelf: 'flex-start' } : undefined}>تمام! عندنا ٤:٣٠ أو ٥:١٥ مساءً. أي وقت يناسبك؟</div>
            <div className="bubble in" style={ar ? { alignSelf: 'flex-end' } : undefined}>{ar ? '٥:١٥ ممتاز' : '٥:١٥ ممتاز'}</div>
            {!ar ? (
              <div className="bubble out" style={{ opacity: 0.55, display: 'flex', gap: 5, alignItems: 'center', padding: '12px 16px' }}>
                <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'block' }} />
                <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, display: 'block' }} />
                <i style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', opacity: 0.3, display: 'block' }} />
              </div>
            ) : null}
          </div>
        </div>
        <div style={{ borderInlineStart: '1px solid var(--line)', padding: '18px 20px' }}>
          <div className="label">{ar ? 'هذا التشغيل' : 'This run'}</div>
          <div className="panel" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{ar ? 'أول ردّ' : 'First reply'}</div>
            <div className="mono" dir="ltr" style={{ fontSize: 30, fontWeight: 500, marginTop: 4, textAlign: ar ? 'right' : undefined }}>
              4.2<span style={{ fontSize: 15, color: 'var(--muted)' }}>s</span>
            </div>
            <div className="mono" style={{ fontSize: ar ? 12 : 11, color: 'var(--warn)', marginTop: 2 }}>{ar ? 'قيمة تجريبية' : 'SAMPLE VALUE'}</div>
          </div>
          <div className="panel" style={{ padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{ar ? 'النية' : 'Intent'}</div>
            <div className="row" style={{ justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 14 }}>{ar ? 'حجز · تنظيف' : 'Booking · cleaning'}</span>
              <span className="chip warn">{ar ? 'مرجّح' : 'Probable'}</span>
            </div>
            <div style={{ height: 4, borderRadius: 4, background: '#1F2630', marginTop: 12, overflow: 'hidden' }}>
              <div style={{ width: '72%', height: '100%', background: ar ? 'linear-gradient(270deg,#34E0A1,#38C6E0)' : 'linear-gradient(90deg,#34E0A1,#38C6E0)' }} />
            </div>
          </div>
          <div className="panel" style={{ padding: 14, marginTop: 10 }}>
            <div style={{ fontSize: 12, color: 'var(--subtle)' }}>{ar ? 'الإجراء التالي' : 'Next action'}</div>
            <div className="row" style={{ gap: 8, marginTop: 6, fontSize: 14 }}>
              <CalendarCheck size={14} style={{ color: 'var(--accent2)' }} />
              {ar ? 'حجز مبدئي ٥:١٥ على Cal.com' : 'Hold 17:15 on Cal.com'}
            </div>
            {!ar ? <div style={{ fontSize: 12, color: 'var(--subtle)', marginTop: 6 }}>Needs confirmation from caller</div> : null}
          </div>
        </div>
      </div>
    </>
  )
}

function MobileProduct({ ar }: { ar: boolean }) {
  return (
    <div className="window prod-mobile" style={{ marginTop: 36 }}>
      <div className="wbar" style={{ height: 40 }}>
        <span className="wdots"><i /><i /><i /></span>
        <span style={{ color: 'var(--text)', fontSize: 12 }}>{ar ? 'فرز المكالمات الفائتة' : 'Missed-call triage'}</span>
        <span className="grow" />
        <span className="sample">{ar ? 'مثال' : 'Sample'}</span>
      </div>
      <div style={{ padding: 14 }}>
        <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
          <span className="chip acc"><Check size={12} />{ar ? 'مكالمة فائتة' : 'Call missed'}</span>
          <span className="chip acc"><Check size={12} />{ar ? 'واتساب أُرسل' : 'WhatsApp sent'}</span>
          <span className="chip cy"><Loader size={12} />{ar ? 'تحديد النية' : 'Qualifying'}</span>
        </div>
        <div className="col" dir="rtl" style={{ gap: 8, marginTop: 14, fontFamily: '"IBM Plex Sans Arabic", sans-serif' }}>
          <div className="bubble out" style={{ fontSize: 13.5 }}>مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟</div>
          <div className="bubble in" style={{ fontSize: 13.5 }}>أبغى أحجز موعد بكرة العصر</div>
          <div className="bubble out" style={{ fontSize: 13.5 }}>عندنا ٤:٣٠ أو ٥:١٥ مساءً</div>
        </div>
        <div className="panel row" style={{ marginTop: 12, padding: '10px 12px', gap: 8, fontSize: 13 }}>
          <CalendarCheck size={14} style={{ color: 'var(--accent2)' }} />
          {ar ? 'حجز ٥:١٥ على Cal.com' : 'Hold 17:15 on Cal.com'}
          <span className="grow" />
          <span className="mono" style={{ fontSize: 11, color: 'var(--subtle)' }}>4.2s</span>
        </div>
      </div>
    </div>
  )
}

function Step({ done, run, title, meta, icon, muted }: { done?: boolean; run?: boolean; title: string; meta: string; icon: React.ReactNode; muted?: boolean }) {
  return (
    <div className={`step${done ? ' done' : ''}${run ? ' run' : ''}`}>
      <span className="ic">{icon}</span>
      <div>
        <div className="t" style={muted ? { color: 'var(--muted)' } : undefined}>{title}</div>
        <div className={`s${meta.includes('00:') ? ' mono' : ''}`} dir={meta.includes('00:') ? 'ltr' : undefined}>{meta}</div>
      </div>
    </div>
  )
}

function ScriptRow({ on, onClick, index, label }: { on: boolean; onClick: () => void; index: string; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="panel row"
      style={{
        padding: '14px 16px',
        gap: 12,
        width: '100%',
        textAlign: 'start',
        borderColor: on ? 'rgba(52,224,161,.4)' : undefined,
        background: on ? 'linear-gradient(90deg,rgba(52,224,161,.08),transparent)' : undefined,
      }}
    >
      <span className="mono" style={{ color: on ? 'var(--accent)' : 'var(--subtle)', fontSize: 12 }}>{index}</span>
      <span style={{ fontSize: 15, color: on ? 'var(--text)' : 'var(--muted)' }}>{label}</span>
      <span className="grow" />
      {on ? <Play size={14} style={{ color: 'var(--accent)' }} /> : null}
    </button>
  )
}

function ScriptPills({ script, setScript, ar, light }: { script: string; setScript: (value: 'triage' | 'voice' | 'qualify') => void; ar: boolean; light?: boolean }) {
  const items = [
    { id: 'triage' as const, label: ar ? '01 فرز المكالمات' : '01 Missed-call triage' },
    { id: 'voice' as const, label: ar ? '02 الاستقبال الصوتي' : '02 Voice receptionist' },
    { id: 'qualify' as const, label: ar ? '11 تأهيل العملاء' : '11 Lead qualification' },
  ]
  return (
    <div className="row" style={{ gap: 8, marginTop: 26, flexWrap: 'wrap' }}>
      {items.map(item => {
        const on = script === item.id
        return (
          <button
            key={item.id}
            type="button"
            className="chip"
            onClick={() => setScript(item.id)}
            style={
              light
                ? on
                  ? { background: '#34E0A1', color: '#04130D', borderColor: '#34E0A1' }
                  : { background: 'transparent', color: '#9AA3B2', borderColor: '#2c3038' }
                : undefined
            }
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

function DemoLines() {
  return (
    <>
      {DEMO_LINES.map(line => (
        <div key={line.t + line.tag}>
          <span className="ts">[{line.t}]</span>
          <span className={`k ${line.k}`}>{line.tag}</span>
          {line.text}
        </div>
      ))}
      <div style={{ color: 'var(--accent)' }}>
        <span className="ts">[00:03.790]</span>
        <span className="k k-ds">DISPATCH</span>
        Offer slots 16:30 / 17:15 → Cal.com hold
        <span style={{ display: 'inline-block', width: 8, height: 15, background: 'var(--accent)', verticalAlign: 'middle', marginInlineStart: 4 }} />
      </div>
      <div style={{ color: 'var(--subtle)', marginTop: 10 }}>▸ Streaming next frame…</div>
    </>
  )
}

function DemoTerminal({ compact }: { compact?: boolean }) {
  const lines = compact
    ? [
        DEMO_LINES[0],
        DEMO_LINES[1],
        { ...DEMO_LINES[2], text: 'Caller parsed · country="AE"' },
        DEMO_LINES[3],
        { ...DEMO_LINES[4], text: 'WhatsApp template rescue_inbound_ar_en' },
        { ...DEMO_LINES[8], t: '00:03.602' },
      ]
    : DEMO_LINES
  return (
    <div className="term-win" style={{ position: 'relative' }}>
      <div className="term-bar">
        <i /><i /><i />
        <span className="mono">~/helix/live-pipeline/system_1</span>
        <span style={{ flex: 1 }} />
        <span className="sample" style={{ background: 'transparent' }}>Demo script</span>
      </div>
      <div className="term" style={{ padding: '16px 18px' }}>
        {lines.map(line => (
          <div key={line.t + line.tag + line.text}>
            <span className="ts">[{line.t}]</span>
            <span className={`k ${line.k}`}>{line.tag}</span>
            {line.text}
          </div>
        ))}
        <div style={{ color: '#34E0A1' }}>
          <span className="ts">[00:03.790]</span>
          <span className="k k-ds">DISPATCH</span>
          Offer 16:30 / 17:15 → Cal.com hold ▍
        </div>
      </div>
    </div>
  )
}

function LightStep({ n, on, title, body, width }: { n: string; on?: boolean; title: string; body: string; width: string }) {
  return (
    <div className={`stepc${on ? ' on' : ''}`}>
      <div className="n">{n}</div>
      <div className="ctitle">{title}</div>
      <div className="cdesc">{body}</div>
      <div className="bar"><i style={{ width }} /></div>
    </div>
  )
}
