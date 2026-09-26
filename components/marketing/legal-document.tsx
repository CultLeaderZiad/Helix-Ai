'use client'

import { useMarketingPrefs } from '@/components/marketing/public-frame'

export interface LegalSection {
  id: string
  titleEn: string
  titleAr: string
  paragraphsEn: string[]
  paragraphsAr: string[]
  review?: string
}

export function LegalDocument({
  kickerEn,
  kickerAr,
  titleEn,
  titleAr,
  updatedEn,
  updatedAr,
  sections,
}: {
  kickerEn: string
  kickerAr: string
  titleEn: string
  titleAr: string
  updatedEn: string
  updatedAr: string
  sections: LegalSection[]
}) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  return (
    <div className="container legal">
      <nav className="legal-toc" aria-label={ar ? 'المحتويات' : 'Contents'}>
        {sections.map((section, index) => (
          <a key={section.id} href={`#${section.id}`}>
            {index + 1}. {ar ? section.titleAr : section.titleEn}
          </a>
        ))}
      </nav>
      <article>
        <span className="kicker">{ar ? kickerAr : kickerEn}</span>
        <h1>{ar ? titleAr : titleEn}</h1>
        <p className="faint small">{ar ? updatedAr : updatedEn}</p>
        {sections.map(section => (
          <section id={section.id} key={section.id}>
            {section.review ? (
              <div hidden dangerouslySetInnerHTML={{ __html: `<!-- REVIEW: ${section.review} -->` }} />
            ) : null}
            <h2>{ar ? section.titleAr : section.titleEn}</h2>
            {(ar ? section.paragraphsAr : section.paragraphsEn).map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
      </article>
    </div>
  )
}
