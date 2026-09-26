'use client'

import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { QaAccordion } from '@/components/marketing/qa-accordion'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import { planDisplay, type PricingPlan } from '@/lib/pricing/tiers'

function money(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

export function PricingView({ plans }: { plans: PricingPlan[] }) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
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
          <Link className="link" href="/studio">{ar ? 'تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو' : 'Buying a single system? See per-system prices in Studio'}</Link>
        </div>
        <div className="plans">
          {plans.map(plan => {
            const copy = planDisplay(plan, ar ? 'ar' : 'en')
            const monthly = plan.prices.AED
            const setup = plan.setupFee.AED
            return (
              <div key={plan.id} className={`plan${plan.featured ? ' f' : ''}`}>
                <div className="pn">
                  {ar ? plan.nameAr : plan.name}
                  {plan.featured ? <span className="rec">{ar ? 'موصى بها' : 'Recommended'}</span> : null}
                </div>
                <p className="tg">{copy.tagline}</p>
                {typeof monthly === 'number' ? (
                  ar ? (
                    <div className="price"><b className="num"><bdi>{money(monthly)}</bdi></b><span className="cur">درهم</span><span className="per">/ شهرياً</span></div>
                  ) : (
                    <div className="price"><span className="cur">AED</span><b className="num"><bdi>{money(monthly)}</bdi></b><span className="per">/ month</span></div>
                  )
                ) : null}
                {typeof setup === 'number' ? (
                  <div className="setup">{ar ? <>+ <bdi>{money(setup)}</bdi> درهم إعداد لمرة واحدة</> : <>+ AED <bdi>{money(setup)}</bdi> one-time setup</>}</div>
                ) : null}
                <ul>
                  {copy.features.map(feature => <li key={feature}>{feature}</li>)}
                </ul>
                <Link className="btn btn-primary" href={`/contact?plan=${plan.id}`} style={{ marginTop: 'auto' }}>
                  {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}
                </Link>
              </div>
            )
          })}
        </div>
        <div className="below">
          <span>{ar ? 'تحتاج شيئاً مخصّصاً، أو أكثر من علامة تجارية بقواعد مختلفة؟' : 'Need something bespoke, or more than one brand with different rules?'}</span>
          <Link className="link" href="/contact?scope=custom">{ar ? 'بناء مخصّص، لنحدد النطاق' : "Custom build, let's scope it"}</Link>
        </div>
      </section>
      <section className="container inc">
        <div className="sec-head">
          <span className="kicker">{ar ? 'في كل باقة' : 'Every plan includes'}</span>
          <h2 className="display h2">{ar ? 'ما تحصل عليه، أيّاً كانت الباقة.' : 'What you get, whichever plan you choose.'}</h2>
        </div>
        <div className="inc-grid">
          <div><div><b>{ar ? 'إعداد كامل ننفّذه عنك' : 'Done-for-you setup'}</b><span>{ar ? 'نبني ونربط ونختبر. فريقك لا يضبط شيئاً.' : "We build, connect and test it. Your team doesn't configure anything."}</span></div></div>
          <div><div><b>{ar ? 'العربية والإنجليزية' : 'Arabic and English'}</b><span>{ar ? 'ردود تراعي اللهجة، بما فيها الرسائل المختلطة.' : 'Dialect-aware replies, including mixed-language messages.'}</span></div></div>
          <div><div><b>{ar ? 'تحويل لموظف بشري' : 'Human hand-off'}</b><span>{ar ? 'يمكن لفريقك تولي أي محادثة مع السياق كاملاً.' : 'Your team can take over any conversation, with full context.'}</span></div></div>
          <div><div><b>{ar ? 'رقم واتساب الخاص بك' : 'Your own WhatsApp number'}</b><span>{ar ? 'العملاء يتحدثون مع نشاطك، لا معنا.' : 'Customers talk to your business, not to us.'}</span></div></div>
          <div><div><b>{ar ? 'لوحة متابعة للعميل' : 'Client dashboard'}</b><span>{ar ? 'كل رد وحجز وتحويل بلغة واضحة.' : 'Every reply, booking and hand-off, in plain language.'}</span></div></div>
          <div><div><b>{ar ? 'الملكية لك' : 'You keep ownership'}</b><span>{ar ? 'بعد الإطلاق، الإعداد والتكاملات وأدلة التشغيل ملكك.' : 'After go-live, the setup, integrations and runbooks are yours.'}</span></div></div>
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
        <QaAccordion idPrefix="pricing-faq" items={faqs.map(([q, a]) => ({ q, a }))} />
      </section>
      <section className="container">
        <div className="cta">
          <div>
            <h2 className="display">{ar ? 'لست متأكداً أي باقة تناسبك؟' : 'Not sure which plan fits?'}</h2>
            <p>{ar ? 'أخبرنا كيف تصلك الاستفسارات اليوم. سنقترح أصغر إعداد ينفع.' : "Tell us how enquiries reach you today. We'll recommend the smallest setup that works."}</p>
          </div>
          <div className="row gap-12">
            <Link className="btn btn-primary" href="/contact">{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}</Link>
            <WhatsAppCta ar={ar} className="btn btn-ghost" labelEn="WhatsApp" labelAr="واتساب">
              <MessageCircle size={16} />
            </WhatsAppCta>
          </div>
        </div>
        <p className="faint small price-note">{ar ? 'الأسعار بالدرهم، من دليل أسعار Helix الحالي.' : 'Prices in AED, from the current Helix pricing catalogue.'}</p>
      </section>
    </>
  )
}
