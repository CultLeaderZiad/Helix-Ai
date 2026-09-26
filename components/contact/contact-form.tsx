'use client'

import Link from 'next/link'
import { useActionState, useMemo, useState } from 'react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import { HELIX_ADMIN_EMAIL } from '@/lib/auth/admin-email'
import { submitContactInquiry, type ContactInquiryState } from '@/lib/contact/inquiry'
import { REGIONAL_PRICING_CONFIGS } from '@/lib/pricing/tiers'
import { getSystemTemplate } from '@/lib/studio/templates'

const initialState: ContactInquiryState = { status: 'idle' }

const TYPES = [
  { value: 'Clinic', en: 'Clinic', ar: 'عيادة' },
  { value: 'Real estate', en: 'Real estate', ar: 'عقارات' },
  { value: 'Home services', en: 'Home services', ar: 'خدمات منزلية' },
  { value: 'B2B', en: 'B2B', ar: 'شركات' },
  { value: 'Other', en: 'Other', ar: 'أخرى' },
]

const TOPICS = [
  { id: 'Missed calls', en: 'Missed calls', ar: 'مكالمات فائتة' },
  { id: 'Slow replies to ads', en: 'Slow replies to ads', ar: 'ردود بطيئة على الإعلانات' },
  { id: 'No-shows', en: 'No-shows', ar: 'غياب عن المواعيد' },
  { id: 'Old leads', en: 'Old leads', ar: 'عملاء سابقون' },
  { id: 'Overdue invoices', en: 'Overdue invoices', ar: 'فواتير متأخرة' },
]

function aboutLabel(plan: string | undefined, systems: string | undefined, scope: string | undefined, ar: boolean) {
  if (plan) {
    const match = [...REGIONAL_PRICING_CONFIGS.gcc_enterprise.plans, ...REGIONAL_PRICING_CONFIGS.mena_sme.plans]
      .find(item => item.id === plan)
    const name = match ? (ar ? match.nameAr : match.name) : plan
    return ar ? `عن: باقة ${name}` : `About: ${name} plan`
  }
  if (systems) {
    const names = systems.split(',').map(id => id.trim()).filter(Boolean).map(id => {
      const template = getSystemTemplate(id)
      return template ? (ar ? template.ar.name : template.en.name) : id
    })
    if (names.length === 0) return null
    return ar ? `عن: ${names.join('، ')}` : `About: ${names.join(', ')}`
  }
  if (scope === 'custom') return ar ? 'عن: بناء مخصّص' : 'About: Custom build'
  return null
}

export function ContactForm({
  plan,
  systems,
  scope,
}: {
  plan?: string
  systems?: string
  scope?: string
}) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const [state, formAction, pending] = useActionState(submitContactInquiry, initialState)
  const [topics, setTopics] = useState<string[]>([])
  const about = useMemo(() => aboutLabel(plan, systems, scope, ar), [plan, systems, scope, ar])
  const [showAbout, setShowAbout] = useState(true)
  const aboutText = showAbout ? about : null

  if (state.status === 'saved') {
    const name = state.name ?? ''
    return (
      <section className="container book">
        <div className="book-form">
          <h1 className="display">{ar ? `شكراً ${name}. سنراسلك على واتساب لتحديد موعد.` : `Thanks, ${name}. We'll message you on WhatsApp to pick a time.`}</h1>
        </div>
        <Aside ar={ar} />
      </section>
    )
  }

  return (
    <section className="container book">
      <div className="book-form">
        <h1 className="display">{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}</h1>
        <p className="lead">
          {ar
            ? 'أخبرنا كيف تصلك الاستفسارات اليوم، وسنرد بموعد لمكالمة قصيرة وعرض مباشر.'
            : 'Tell us how enquiries reach you today. We reply with a time for a short call and a live walkthrough.'}
        </p>
        <form action={formAction} aria-busy={pending} className="book-fields">
          {state.status === 'error' && state.message ? (
            <p role="alert" className="form-error">{ar ? state.messageAr ?? state.message : state.message}</p>
          ) : null}
          {aboutText ? (
            <div className="about-chip">
              <span>{aboutText}</span>
              <button type="button" onClick={() => setShowAbout(false)} aria-label={ar ? 'إزالة' : 'Remove'}>×</button>
              <input type="hidden" name="about" value={aboutText} />
            </div>
          ) : null}

          <label htmlFor="contact-name">{ar ? 'الاسم الكامل' : 'Full name'}</label>
          <input id="contact-name" name="name" autoComplete="name" required />

          <label htmlFor="contact-business">{ar ? 'اسم النشاط' : 'Business name'}</label>
          <input id="contact-business" name="business" autoComplete="organization" required />

          <label htmlFor="contact-type">{ar ? 'نوع النشاط' : 'Business type'}</label>
          <select id="contact-type" name="businessType" required defaultValue="">
            <option value="" disabled>{ar ? 'اختر' : 'Choose'}</option>
            {TYPES.map(item => (
              <option key={item.value} value={item.value}>{ar ? item.ar : item.en}</option>
            ))}
          </select>

          <label htmlFor="contact-city">{ar ? 'المدينة والدولة' : 'City and country'}</label>
          <input id="contact-city" name="city" autoComplete="address-level2" required />

          <label htmlFor="contact-wa">{ar ? 'رقم واتساب' : 'WhatsApp number'}</label>
          <input id="contact-wa" name="whatsapp" dir="ltr" inputMode="tel" autoComplete="tel" placeholder="+971…" required />

          <label htmlFor="contact-note">{ar ? 'ما الذي يفوتك؟' : "What's slipping through?"}</label>
          <textarea id="contact-note" name="message" rows={4} />
          <div className="chips" role="group" aria-label={ar ? 'مواضيع' : 'Topics'}>
            {TOPICS.map(topic => {
              const on = topics.includes(topic.id)
              return (
                <button
                  key={topic.id}
                  type="button"
                  aria-pressed={on}
                  className={on ? 'on' : undefined}
                  onClick={() => setTopics(current => (on ? current.filter(item => item !== topic.id) : [...current, topic.id]))}
                >
                  {ar ? topic.ar : topic.en}
                </button>
              )
            })}
          </div>
          {topics.map(topic => <input key={topic} type="hidden" name="topics" value={topic} />)}

          <fieldset>
            <legend>{ar ? 'اللغة المفضلة' : 'Preferred language'}</legend>
            <label className="radio"><input type="radio" name="language" value="ar" defaultChecked={ar} /> {ar ? 'العربية' : 'Arabic'}</label>
            <label className="radio"><input type="radio" name="language" value="en" defaultChecked={!ar} /> {ar ? 'الإنجليزية' : 'English'}</label>
          </fieldset>

          <button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? (ar ? 'جارٍ الإرسال…' : 'Sending…') : ar ? 'اطلب مكالمتي' : 'Request my call'}
          </button>
        </form>
      </div>
      <Aside ar={ar} />
    </section>
  )
}

function Aside({ ar }: { ar: boolean }) {
  const steps = ar
    ? ['نرد على واتساب أو بالبريد', 'مكالمة تعريفية قصيرة', 'عرض مباشر وخطة مكتوبة']
    : ['We reply on WhatsApp or email', 'A short discovery call', 'A live demo and a written plan']
  return (
    <aside className="book-side">
      <h2>{ar ? 'ماذا يحدث بعد ذلك' : 'What happens next'}</h2>
      <ol>
        {steps.map((step, index) => (
          <li key={step}><span>{index + 1}</span>{step}</li>
        ))}
      </ol>
      <WhatsAppCta ar={ar} className="btn btn-ghost" labelEn="Prefer WhatsApp?" labelAr="تفضّل واتساب؟" />
      <p className="muted small">
        {ar ? 'راسل الإدارة' : 'Email the admin'}{' '}
        <a className="link" href={`mailto:${HELIX_ADMIN_EMAIL}`}>{HELIX_ADMIN_EMAIL}</a>
      </p>
      <p className="muted small">
        {ar ? 'جديد على Helix؟' : 'New to Helix?'}{' '}
        <Link className="link" href="/signup">{ar ? 'أنشئ حسابك' : 'Create your account'}</Link>
      </p>
      <p className="muted small">
        {ar ? 'عميل حالياً؟' : 'Already a client?'}{' '}
        <Link className="link" href="/login">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
      </p>
    </aside>
  )
}
