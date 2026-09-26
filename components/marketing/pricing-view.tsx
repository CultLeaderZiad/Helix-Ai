'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowRight, Check, Globe, Headset, KeyRound, MessageCircle, Users } from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { REGIONAL_PRICING_CONFIGS } from '@/lib/pricing/tiers'

function money(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

const DISPLAY: Record<string, { en: string[]; ar: string[] }> = {
  'starter-gcc': {
    en: [
      'Up to 1,500 customer conversations a month',
      'Bilingual voice agent, Gulf Arabic and English',
      'Official WhatsApp Business connection',
      'Cal.com and Google Calendar sync',
      'Human review before anything uncertain is saved',
      'UAE and KSA VAT-compliant invoices',
    ],
    ar: [
      'حتى 1,500 محادثة مع العملاء شهرياً',
      'وكيل صوتي ثنائي اللغة: خليجي وإنجليزي',
      'ربط رسمي مع واتساب للأعمال',
      'مزامنة مع Cal.com وتقويم Google',
      'مراجعة بشرية قبل حفظ أي معلومة غير مؤكدة',
      'فواتير متوافقة مع ضريبة القيمة المضافة في الإمارات والسعودية',
    ],
  },
  'growth-gcc': {
    en: [
      'Up to 10,000 customer conversations a month',
      'Voice, WhatsApp and email automation',
      'Missed-call WhatsApp text-back and triage, in seconds',
      'B2B payment reminders with Mada and Apple Pay links',
    ],
    ar: [
      'حتى 10,000 محادثة مع العملاء شهرياً',
      'أتمتة الصوت وواتساب والبريد الإلكتروني',
      'رد على المكالمات الفائتة عبر واتساب وفرزها، خلال ثوانٍ',
      'تذكيرات دفع للشركات مع روابط مدى وApple Pay',
    ],
  },
  'scale-gcc': {
    en: [
      'Unlimited workspaces across branches and brands',
      'Dialect tuning: Emirati, Najdi, Hijazi, Qatari',
      'B2B collections and dispute handling',
      'Cross-branch CRM governance and exports',
      'Priority escalation support',
    ],
    ar: [
      'مساحات عمل غير محدودة لكل الفروع والعلامات',
      'ضبط اللهجات: الإماراتية والنجدية والحجازية والقطرية',
      'تحصيل مستحقات الشركات ومعالجة الاعتراضات',
      'حوكمة بيانات العملاء وتصديرها عبر الفروع',
      'دعم تصعيد ذو أولوية',
    ],
  },
}

export function PricingView() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const [openFaq, setOpenFaq] = useState(0)
  const faqs = ar
    ? [
        ['ماذا تشمل رسوم الإعداد؟', 'تصميم النظام حول خدماتك وساعاتك، وربط الهاتف وواتساب والتقويم، وكتابة الردود بالعربية والإنجليزية معك، والاختبار قبل الإطلاق.'],
        ['هل أبدأ بنظام واحد فقط؟', 'نعم. الاستوديو يسعّر كل نظام على حدة: إعداد لمرة واحدة ورسوم شهرية، فتبدأ صغيراً وتضيف لاحقاً.'],
        ['ماذا يحدث إذا تجاوزت حد المحادثات؟', 'نؤكد ذلك معك في المكالمة التعريفية. لا تُحتسب رسوم إضافية قبل أن نخبرك.'],
      ]
    : [
        ['What does the setup fee cover?', 'Designing the system around your services and hours, connecting your phone, WhatsApp, calendar and CRM, writing the Arabic and English replies with you, and testing before go-live.'],
        ['Can I start with just one system?', 'Yes. Studio prices each system on its own, as a one-time setup plus a monthly fee, so you can start small and add more later.'],
        ['What happens if I go over my conversation limit?', 'We confirm that with you on the discovery call. Nothing extra is charged before we tell you.'],
      ]
  const plans = REGIONAL_PRICING_CONFIGS.gcc_enterprise.plans
  return (
    <>
      <section className="container hdr">
        <span className="kicker">{ar ? 'الأسعار' : 'Pricing'}</span>
        <h1 className="display">{ar ? 'باقات شهرية بسيطة. نبنيها ونشغّلها لك.' : 'Simple monthly plans. Built and run for you.'}</h1>
        <p className="lead">{ar ? 'رسوم إعداد لمرة واحدة لبناء النظام حول عملك، ثم رسوم شهرية لنشغّله ونراقبه ونحسّنه.' : 'A one-time setup fee to build the system around your business, then a monthly fee for us to run, monitor and improve it.'}</p>
      </section>
      <section className="container">
        <div className="cap">
          <span className="chip">{ar ? 'الباقات الشهرية · درهم' : 'Monthly plans · AED'}</span>
          <Link className="link" href="/studio">{ar ? 'تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو' : 'Buying a single system? See per-system prices in Studio'} <ArrowRight className="arrow" size={14} /></Link>
        </div>
        <div className="plans">
          {plans.map(plan => {
            const features = DISPLAY[plan.id]?.[ar ? 'ar' : 'en'] ?? (ar ? plan.featuresAr : plan.features)
            return (
              <div key={plan.id} className={`plan${plan.featured ? ' f' : ''}`}>
                <div className="pn">
                  {ar ? plan.nameAr : plan.name}
                  {plan.featured ? <span className="rec">{ar ? 'موصى بها' : 'Recommended'}</span> : null}
                </div>
                <p className="tg">{ar ? plan.taglineAr : plan.tagline}</p>
                <div className="price"><span className="cur">AED</span><b className="num"><bdi>{money(plan.prices.AED ?? 0)}</bdi></b><span className="per">{ar ? '/ شهرياً' : '/ month'}</span></div>
                <div className="setup">+ AED <bdi>{money(plan.setupFee.AED ?? 0)}</bdi> {ar ? 'إعداد لمرة واحدة' : 'one-time setup'}</div>
                <ul>
                  {features.map(f => <li key={f}><Check size={16} />{f}</li>)}
                </ul>
                <Link className="btn btn-primary" href={`/contact?plan=${plan.id}`} style={{ marginTop: 'auto' }}>
                  {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'} {plan.featured ? <ArrowRight className="arrow" size={16} /> : null}
                </Link>
              </div>
            )
          })}
        </div>
        <div className="below">
          <span>{ar ? 'تحتاج شيئاً مخصّصاً، أو أكثر من علامة تجارية بقواعد مختلفة؟' : 'Need something bespoke, or more than one brand with different rules?'}</span>
          <Link className="link" href="/build">{ar ? 'بناء مخصّص، لنحدد النطاق' : "Custom build, let's scope it"} <ArrowRight className="arrow" size={14} /></Link>
        </div>
      </section>
      <section className="container inc">
        <div className="sec-head">
          <span className="kicker">{ar ? 'في كل باقة' : 'Every plan includes'}</span>
          <h2 className="display h2">{ar ? 'ما تحصل عليه، أيّاً كانت الباقة.' : 'What you get, whichever plan you choose.'}</h2>
        </div>
        <div className="inc-grid">
          <div><Users size={20} /><div><b>{ar ? 'إعداد كامل ننفّذه عنك' : 'Done-for-you setup'}</b><span>{ar ? 'نبني ونربط ونختبر. فريقك لا يضبط شيئاً.' : "We build, connect and test it. Your team doesn't configure anything."}</span></div></div>
          <div><Globe size={20} /><div><b>{ar ? 'العربية والإنجليزية' : 'Arabic and English'}</b><span>{ar ? 'ردود تراعي اللهجة، بما فيها الرسائل المختلطة.' : 'Dialect-aware replies, including mixed-language messages.'}</span></div></div>
          <div><Headset size={20} /><div><b>{ar ? 'تحويل لموظف بشري' : 'Human hand-off'}</b><span>{ar ? 'يمكن لفريقك تولي أي محادثة مع السياق كاملاً.' : 'Your team can take over any conversation, with full context.'}</span></div></div>
          <div><MessageCircle size={20} /><div><b>{ar ? 'رقم واتساب الخاص بك' : 'Your own WhatsApp number'}</b><span>{ar ? 'العملاء يتحدثون مع نشاطك، لا معنا.' : 'Customers talk to your business, not to us.'}</span></div></div>
          <div><Users size={20} /><div><b>{ar ? 'لوحة متابعة للعميل' : 'Client dashboard'}</b><span>{ar ? 'كل رد وحجز وتحويل بلغة واضحة.' : 'Every reply, booking and hand-off, in plain language.'}</span></div></div>
          <div><KeyRound size={20} /><div><b>{ar ? 'الملكية لك' : 'You keep ownership'}</b><span>{ar ? 'بعد الإطلاق، الإعداد والتكاملات وأدلة التشغيل ملكك.' : 'After go-live, the setup, integrations and runbooks are yours.'}</span></div></div>
        </div>
      </section>
      <section className="container inc">
        <div className="sec-head">
          <span className="kicker">{ar ? 'بعد الحجز' : 'What happens after you book'}</span>
          <h2 className="display h2">{ar ? 'من أول مكالمة إلى نظام يعمل.' : 'From first call to live system.'}</h2>
        </div>
        <div className="steps">
          {[
            [ar ? 'مكالمة تعريفية' : 'Discovery call', ar ? 'نرسم أين تضيع الاستفسارات ونتفق على المقياس الذي يهم.' : 'We map where enquiries slip through and agree the one metric that matters.'],
            [ar ? 'مخطط وعرض سعر' : 'Blueprint and quote', ar ? 'خطة مكتوبة بمراحل، بالعربي أو الإنجليزي، قبل أي بناء.' : 'A written plan with milestones, in Arabic or English, before any build starts.'],
            [ar ? 'البناء والاختبار' : 'Build and test', ar ? 'نربط هاتفك وواتساب وتقويمك، ثم نختبر مع فريقك.' : 'We connect your phone, WhatsApp, calendar and CRM, then test with your team.'],
            [ar ? 'الإطلاق والتشغيل' : 'Go live and operate', ar ? 'نراقب ونضبط ونبلّغ. أنت تتابع من لوحتك.' : 'We monitor, tune and report. You watch it work from your dashboard.'],
          ].map(([t, d], i) => (
            <div className="st" key={t}><span className="n">{i + 1}</span><b>{t}</b><span>{d}</span></div>
          ))}
        </div>
      </section>
      <section className="container inc faq">
        <div>
          <span className="kicker">{ar ? 'أسئلة الأسعار' : 'Pricing questions'}</span>
          <h2 className="display h2" style={{ marginTop: 18 }}>{ar ? 'إجابات مباشرة.' : 'Straight answers.'}</h2>
        </div>
        <div>
          {faqs.map(([q, a], i) => (
            <div className="qa" key={q}>
              <button type="button" className="q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', background: 'none', border: 0, color: 'inherit', cursor: 'pointer', textAlign: 'start' }}>
                {q}
              </button>
              {openFaq === i ? <div className="a">{a}</div> : null}
            </div>
          ))}
        </div>
      </section>
      <section className="container">
        <div className="cta">
          <div>
            <h2 className="display">{ar ? 'لست متأكداً أي باقة تناسبك؟' : 'Not sure which plan fits?'}</h2>
            <p>{ar ? 'أخبرنا كيف تصلك الاستفسارات اليوم. سنقترح أصغر إعداد ينفع.' : "Tell us how enquiries reach you today. We'll recommend the smallest setup that works."}</p>
          </div>
          <div className="row gap-12">
            <Link className="btn btn-primary" href="/contact">{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'} <ArrowRight className="arrow" size={16} /></Link>
            <Link className="btn btn-ghost" href="/contact"><MessageCircle size={16} /> WhatsApp</Link>
          </div>
        </div>
      </section>
    </>
  )
}
