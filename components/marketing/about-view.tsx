'use client'

import Link from 'next/link'
import { useMarketingPrefs } from '@/components/marketing/public-frame'

export function AboutView() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  return (
    <section className="container" style={{ padding: '72px 32px 96px' }}>
      <span className="kicker">{ar ? 'من نحن' : 'About'}</span>
      <h1 className="display h2" style={{ marginTop: 18, maxWidth: 860 }}>
        {ar ? 'نبني الأنظمة التي ترد عندما لا تستطيع.' : "We build the systems that answer when you can't."}
      </h1>
      <p className="lead" style={{ marginTop: 20, maxWidth: 720 }}>
        {ar
          ? 'Helix استوديو عمليات ذكاء اصطناعي يقوده مؤسسه، للأعمال في الخليج والشرق الأوسط. نصمم أنظمة إنتاج حقيقية ونبنيها ونشغّلها، ثم نسلّمك المفاتيح.'
          : 'Helix is a founder-led studio for businesses in the GCC and MENA. We design, build and run production systems, then hand you the keys.'}
      </p>
      <div className="founder" style={{ marginTop: 48 }}>
        <div className="founder-q">
          <span className="kicker">{ar ? 'المؤسس' : 'Founder'}</span>
          <p className="lead" style={{ marginTop: 16 }}>
            {ar ? 'زياد صبري سيكتب قصة Helix هنا (١٢٠–١٨٠ كلمة). لا نص بديل.' : '[Ziad to write] A 120–180 word story about Helix belongs here. This slot stays empty of filler until that note is written.'}
          </p>
          <div className="sig"><div className="mono">ZS</div><div><b>Ziad Sabry</b><div className="faint small">{ar ? 'المؤسس' : 'Founder, Helix'}</div></div></div>
        </div>
        <div className="commit">
          <span className="kicker">{ar ? 'كيف نعمل' : 'How we work'}</span>
          <ul>
            <li><div><b>{ar ? 'نكتشف' : 'Discover'}</b><span>{ar ? 'مكالمة تعريفية وخريطة لأين تضيع الاستفسارات.' : 'A discovery call and a map of where enquiries slip through.'}</span></div></li>
            <li><div><b>{ar ? 'نبني' : 'Build'}</b><span>{ar ? 'خطة مكتوبة، ثم بناء واختبار مع فريقك.' : 'A written plan, then a build and a test with your team.'}</span></div></li>
            <li><div><b>{ar ? 'نشغّل' : 'Operate'}</b><span>{ar ? 'نتابع ونضبط، وأنت ترى كل رد وحجز.' : 'We monitor and tune. You see every reply and booking.'}</span></div></li>
          </ul>
        </div>
      </div>
      <p className="muted" style={{ marginTop: 36 }}>{ar ? 'نعمل في الإمارات والسعودية وقطر والكويت والبحرين وعُمان والأردن ومصر.' : 'We work across the UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman, Jordan and Egypt.'}</p>
      <p className="faint small" style={{ marginTop: 12 }}>{ar ? 'Helix في مرحلة التجهيز الأخيرة. اطلب عرضاً خاصاً في المكالمة التعريفية.' : 'Helix is in final hardening. Ask for a private preview on your discovery call.'}</p>
      <Link className="btn btn-primary" href="/contact" style={{ marginTop: 28 }}>{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}</Link>
    </section>
  )
}
