'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { QaAccordion } from '@/components/marketing/qa-accordion'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import type { FAQItem } from '@/lib/faq/faq-store'
import { MessageCircle } from 'lucide-react'

export function FaqAccordion({ initialFaqs }: { initialFaqs: FAQItem[] }) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const groups = new Map<string, { title: string; items: { q: string; a: string }[] }>()
  for (const faq of initialFaqs) {
    const title = ar ? faq.category_ar || faq.category : faq.category
    const key = faq.category || 'General'
    const group = groups.get(key) ?? { title, items: [] }
    group.title = title
    group.items.push({
      q: ar ? faq.question_ar || faq.question : faq.question,
      a: ar ? faq.answer_ar || faq.answer : faq.answer,
    })
    groups.set(key, group)
  }

  return (
    <>
      <section className="container about-hero">
        <span className="kicker">{ar ? 'أسئلة' : 'Questions'}</span>
        <h1 className="display">{ar ? 'إجابات واضحة.' : 'Straight answers.'}</h1>
        <p className="lead">
          {ar
            ? 'ما يسأله أصحاب الأعمال قبل المكالمة التعريفية.'
            : 'What owners ask before the discovery call.'}
        </p>
      </section>
      <section className="container faq-groups">
        {[...groups.values()].map(group => (
          <div key={group.title} className="faq-group">
            <h2>{group.title}</h2>
            <QaAccordion idPrefix={group.title.replace(/\s+/g, '-')} items={group.items} defaultOpen={-1} />
          </div>
        ))}
      </section>
      <section className="container sys-block">
        <div className="final">
          <h2 className="display">{ar ? 'لم تجد سؤالك؟' : "Didn't see your question?"}</h2>
          <div className="cta-row">
            <Link className="btn btn-primary" href="/contact">
              {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'} <ArrowRight className="arrow" size={16} />
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
