'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import type { PlatformUpdate } from '@/lib/updates/updates-store'

export function UpdatesView({ releases }: { releases: PlatformUpdate[] }) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  return (
    <>
      <section className="container about-hero">
        <span className="kicker">{ar ? 'التحديثات' : 'Updates'}</span>
        <h1 className="display">{ar ? 'ما الذي تغيّر.' : 'What changed.'}</h1>
        <p className="lead">
          {ar
            ? 'ملاحظات قصيرة عما أصبح بإمكانك رؤيته واستخدامه.'
            : 'Short notes on what you can now see and use.'}
        </p>
      </section>
      <section className="container changelog">
        {releases.map(release => {
          const highlights = ar ? release.highlights_ar ?? release.highlights : release.highlights
          return (
            <article key={release.id} className="release">
              <header>
                <span className="chip"><bdi>{release.version}</bdi></span>
                <time>{release.date}</time>
                <span className="faint small">{ar ? release.category_ar ?? release.category : release.category}</span>
              </header>
              <h2>{ar ? release.title_ar ?? release.title : release.title}</h2>
              <ul>
                {highlights.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className="link" href="/contact">
                {ar ? 'احجز مكالمة' : 'Book a call'} <ArrowRight className="arrow" size={14} />
              </Link>
            </article>
          )
        })}
      </section>
    </>
  )
}
