'use client'

import Link from 'next/link'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import { MessageCircle } from 'lucide-react'

const REGIONS = [
  { en: 'UAE', ar: 'الإمارات' },
  { en: 'Saudi Arabia', ar: 'السعودية' },
  { en: 'Qatar', ar: 'قطر' },
  { en: 'Kuwait', ar: 'الكويت' },
  { en: 'Bahrain', ar: 'البحرين' },
  { en: 'Oman', ar: 'عُمان' },
  { en: 'Jordan', ar: 'الأردن' },
  { en: 'Egypt', ar: 'مصر' },
]

const PRINCIPLES = [
  { en: 'Honest status, no fake metrics', ar: 'حالة صادقة بلا أرقام وهمية', detailEn: 'We report what the system did. We do not invent results.', detailAr: 'نبلّغ بما فعله النظام. لا نخترع نتائج.' },
  { en: 'You own it after go-live', ar: 'ملكك بعد الإطلاق', detailEn: 'The setup, the connections and the runbooks stay with you.', detailAr: 'الإعداد والربط وأدلة التشغيل تبقى معك.' },
  { en: 'Bilingual by default', ar: 'ثنائي اللغة افتراضياً', detailEn: 'Arabic and English, including messages that mix both.', detailAr: 'العربية والإنجليزية، بما في ذلك الرسائل المختلطة.' },
  { en: 'Smallest system that moves the metric', ar: 'أصغر نظام يحقق النتيجة', detailEn: 'We start with the one leak that matters, then add the next.', detailAr: 'نبدأ بالثغرة التي تهم، ثم نضيف التالية.' },
]

export function AboutView() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  return (
    <>
      <section className="container about-hero">
        <span className="kicker">{ar ? 'من نحن' : 'About'}</span>
        <h1 className="display">{ar ? 'نبني الأنظمة التي ترد عندما لا تستطيع.' : "We build the systems that answer when you can't."}</h1>
        <p className="lead">
          {ar
            ? 'Helix استوديو عمليات ذكاء اصطناعي يقوده مؤسسه، للأعمال في الخليج والشرق الأوسط. نصمم أنظمة إنتاج حقيقية ونبنيها ونشغّلها (واتساب، الصوت، إدارة العملاء، وقياس مصادر العملاء)، ثم نسلّمك المفاتيح.'
            : 'Helix is a founder-led AI operations studio for businesses in the GCC and MENA. We design, build and run production systems (WhatsApp, voice, CRM and attribution), then hand you the keys.'}
        </p>
      </section>

      <section className="container">
        <div className="founder">
          <div className="founder-q">
            <span className="kicker">{ar ? 'المؤسس' : 'Founder'}</span>
            {/* [Ziad to write] 120–180 word founder story. Do not replace this comment with filler copy. */}
            <p className="lead" style={{ marginTop: 16 }}>
              {ar
                ? 'زياد صبري هو مؤسس Helix. يعمل مع العيادات وشركات العقار وأعمال الخدمات في الخليج والشرق الأوسط.'
                : 'Ziad Sabry is the founder of Helix. He works with clinics, real-estate firms and service businesses across the GCC and MENA.'}
            </p>
            <div className="sig">
              <div className="mono">ZS</div>
              <div>
                <b>Ziad Sabry</b>
                <div className="faint small">{ar ? 'المؤسس، Helix' : 'Founder, Helix'}</div>
              </div>
            </div>
          </div>
          <div className="commit">
            <span className="kicker">{ar ? 'كيف نعمل' : 'How we work'}</span>
            <ol className="how-list">
              <li><b>{ar ? 'نكتشف' : 'Discover'}</b><span>{ar ? 'مكالمة تعريفية وخريطة لأين تضيع الاستفسارات.' : 'A discovery call and a map of where enquiries slip through.'}</span></li>
              <li><b>{ar ? 'نبني' : 'Build'}</b><span>{ar ? 'خطة مكتوبة، ثم بناء واختبار مع فريقك.' : 'A written plan, then a build and a test with your team.'}</span></li>
              <li><b>{ar ? 'نشغّل' : 'Operate'}</b><span>{ar ? 'نتابع ونضبط، وأنت ترى كل رد وحجز.' : 'We monitor and tune. You see every reply and booking.'}</span></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'مبادئنا' : 'Principles'}</h2>
        <div className="principles">
          {PRINCIPLES.map(item => (
            <article key={item.en}>
              <h3>{ar ? item.ar : item.en}</h3>
              <p>{ar ? item.detailAr : item.detailEn}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'أين نعمل' : 'Where we work'}</h2>
        <div className="region-chips">
          {REGIONS.map(region => (
            <span key={region.en}>{ar ? region.ar : region.en}</span>
          ))}
        </div>
        <p className="faint small" style={{ marginTop: 18 }}>
          {ar
            ? 'Helix في مرحلة التجهيز الأخيرة. اطلب عرضاً خاصاً في المكالمة التعريفية.'
            : 'Helix is in final hardening. Ask for a private preview on your discovery call.'}
        </p>
      </section>

      <section className="container sys-block">
        <div className="final">
          <h2 className="display">{ar ? 'احجز مكالمة تعريفية.' : 'Book a discovery call.'}</h2>
          <p className="lead">{ar ? 'نحدد أصغر نظام يناسب عملك، ثم نعرضه أمامك.' : 'We map the smallest system for your business, then show it to you live.'}</p>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact">
              {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}
            </Link>
            <WhatsAppCta ar={ar} className="btn btn-ghost" labelEn="Chat on WhatsApp" labelAr="راسلنا على واتساب">
              <MessageCircle size={16} />
            </WhatsAppCta>
          </div>
        </div>
      </section>
    </>
  )
}
