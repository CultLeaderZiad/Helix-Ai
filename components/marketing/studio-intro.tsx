'use client'

import Link from 'next/link'
import { useMarketingPrefs } from '@/components/marketing/public-frame'

export function StudioIntro() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  return (
    <section className="container hdr" style={{ textAlign: 'start' }}>
      <span className="kicker">{ar ? 'الاستوديو' : 'Studio'}</span>
      <h1 className="display" style={{ fontSize: 64, maxWidth: 820 }}>{ar ? 'ابنِ نظامك، قطعة بقطعة.' : 'Build your system, one piece at a time.'}</h1>
      <p className="lead" style={{ margin: '18px 0 0' }}>
        {ar
          ? 'اختر الأنظمة التي تحتاجها وشاهد رسوم الإعداد والرسوم الشهرية لكل منها. نؤكد كل شيء في مكالمة تعريفية قبل بدء البناء.'
          : 'Pick the systems you need and see each one’s setup and monthly price. We confirm everything on a discovery call before anything is built.'}
      </p>
      <p className="muted small" style={{ marginTop: 18 }}>
        {ar ? 'تسعير لكل نظام · دولار · إعداد لمرة واحدة + شهري. ' : 'Per-system pricing · USD · one-time setup + monthly. '}
        <Link className="link" href="/pricing">{ar ? 'تفضل باقة شهرية مجمّعة؟ شاهد الباقات بالدرهم' : 'Prefer a bundled monthly plan? See plans in AED'}</Link>
      </p>
    </section>
  )
}
