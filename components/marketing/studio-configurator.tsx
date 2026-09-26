'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import {
  formatUsdFromCents,
  SYSTEM_TEMPLATES,
  type SystemTemplate,
} from '@/lib/studio/templates'

const TYPES = [
  { id: 'clinic', en: 'Clinic', ar: 'عيادة' },
  { id: 'realestate', en: 'Real estate', ar: 'عقارات' },
  { id: 'home', en: 'Home services', ar: 'خدمات منزلية' },
  { id: 'b2b', en: 'B2B', ar: 'شركات' },
] as const

const HINTS: Record<(typeof TYPES)[number]['id'], string[]> = {
  clinic: ['missed-call-responder', 'booking-receptionist', 'lead-attribution', 'lead-reactivation'],
  realestate: ['booking-receptionist', 'lead-attribution', 'lead-reactivation'],
  home: ['missed-call-responder', 'booking-receptionist'],
  b2b: ['lead-attribution', 'lead-reactivation', 'ar-invoicing', 'lead-generation'],
}

const CORE_ORDER = ['missed-call-responder', 'booking-receptionist', 'lead-reactivation', 'lead-attribution', 'ar-invoicing']
const ADDON_ORDER = ['lead-generation', 'rival-watch', 'handbook-answers', 'seo-scorecard', 'proposal-deck-factory']
const PREVIEW_ORDER = ['clip-factory']

const PLAIN: Record<string, { en: string; ar: string }> = {
  'lead-attribution': {
    en: 'Scores every new lead and shows which ad produced the booking.',
    ar: 'يقيّم كل عميل جديد ويُظهر أي إعلان جلب الحجز.',
  },
  'lead-generation': {
    en: 'Finds businesses to contact and shows where each detail came from.',
    ar: 'يبحث عن أنشطة للتواصل معها ويُظهر مصدر كل معلومة.',
  },
  'handbook-answers': {
    en: 'Answers staff questions from your own documents.',
    ar: 'يجيب موظفيك من مستنداتك أنت.',
  },
}

function ordered(ids: string[]) {
  return ids
    .map(id => SYSTEM_TEMPLATES.find(template => template.id === id))
    .filter((template): template is SystemTemplate => Boolean(template))
}

function line(template: SystemTemplate, ar: boolean) {
  const plain = PLAIN[template.id]
  if (plain) return ar ? plain.ar : plain.en
  return ar ? template.ar.tagline : template.en.tagline
}

function priceLine(template: SystemTemplate, ar: boolean) {
  const setup = formatUsdFromCents(template.setupFeeCents)
  const monthly = formatUsdFromCents(template.monthlyRetainerCents)
  const from = template.pricePrefix === 'from'
  if (ar) return `${from ? 'من ' : ''}${setup} إعداد · ${monthly}/شهرياً`
  return `${from ? 'from ' : ''}${setup} setup · ${monthly}/mo`
}

export function StudioConfigurator() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const [type, setType] = useState<(typeof TYPES)[number]['id']>('clinic')
  const [picked, setPicked] = useState<string[]>([])
  const hints = HINTS[type]
  const cores = useMemo(() => ordered(CORE_ORDER), [])
  const addons = useMemo(() => ordered(ADDON_ORDER), [])
  const preview = useMemo(() => ordered(PREVIEW_ORDER), [])
  const selected = useMemo(
    () => SYSTEM_TEMPLATES.filter(template => picked.includes(template.id)),
    [picked],
  )
  const setupCents = selected.reduce((sum, template) => sum + template.setupFeeCents, 0)
  const monthlyCents = selected.reduce((sum, template) => sum + template.monthlyRetainerCents, 0)
  const fromTotal = selected.some(template => template.pricePrefix === 'from')
  const query = selected.map(template => template.id).join(',')

  function toggle(id: string) {
    setPicked(current => (current.includes(id) ? current.filter(item => item !== id) : [...current, id]))
  }

  function card(template: SystemTemplate, lane: 'core' | 'add_on' | 'preview') {
    const on = picked.includes(template.id)
    const name = ar ? template.ar.name : template.en.name
    const vertical = ar ? template.ar.vertical : template.en.vertical
    return (
      <label key={template.id} className={`pick${on ? ' is-on' : ''}${hints.includes(template.id) ? ' is-hint' : ''}`}>
        <input
          type="checkbox"
          checked={on}
          onChange={() => toggle(template.id)}
          aria-label={name}
        />
        <span className="pick-body">
          <span className="pick-name">
            {name}
            {template.id === 'ar-invoicing' ? <span className="chip">{ar ? 'شركات فقط' : 'Business clients only'}</span> : null}
            {lane === 'preview' ? <span className="chip">{ar ? 'عند الطلب' : 'On request'}</span> : null}
          </span>
          <span className="pick-line">{line(template, ar)}</span>
          <span className="faint small">{ar ? `الأنسب: ${vertical}` : `Best for ${vertical}`}</span>
          <span className="pick-price"><bdi dir="ltr">{priceLine(template, ar)}</bdi></span>
        </span>
      </label>
    )
  }

  const summary = (
    <aside className="sel" aria-label={ar ? 'اختيارك' : 'Your selection'}>
      <h2>{ar ? 'اختيارك' : 'Your selection'}</h2>
      {selected.length === 0 ? (
        <p className="muted">{ar ? 'اختر نظاماً لترى سعره.' : 'Pick a system to see its price.'}</p>
      ) : (
        <>
          <ul>
            {selected.map(template => (
              <li key={template.id}>
                <span>{ar ? template.ar.name : template.en.name}</span>
                <bdi dir="ltr">{priceLine(template, ar)}</bdi>
              </li>
            ))}
          </ul>
          <p className="sel-total">
            <span>{ar ? 'إعداد لمرة واحدة' : 'One-time setup'}</span>
            <b><bdi dir="ltr">{`${fromTotal ? (ar ? 'من ' : 'From ') : ''}${formatUsdFromCents(setupCents)}`}</bdi></b>
          </p>
          <p className="sel-total">
            <span>{ar ? 'شهرياً' : 'Monthly'}</span>
            <b><bdi dir="ltr">{`${fromTotal ? (ar ? 'من ' : 'From ') : ''}${formatUsdFromCents(monthlyCents)}`}</bdi></b>
          </p>
          <p className="faint small">{ar ? 'السعر النهائي يُؤكَّد في المكالمة التعريفية.' : 'Final price confirmed on your discovery call.'}</p>
          <Link className="btn btn-primary" href={`/contact?systems=${query}`}>
            {ar ? 'احجز مكالمة تعريفية بهذا الاختيار' : 'Book a discovery call with this selection'}
            <ArrowRight className="arrow" size={16} />
          </Link>
        </>
      )}
      <Link className="link" href="/pricing">
        {ar ? 'تفضل باقة شهرية مجمّعة؟ شاهد الباقات بالدرهم' : 'Prefer a bundled plan? See AED plans'}
        <ArrowRight className="arrow" size={14} />
      </Link>
    </aside>
  )

  return (
    <div className="container studio-wrap">
      <div className="studio">
        <div>
          <div className="seg" role="radiogroup" aria-label={ar ? 'نوع النشاط' : 'Business type'}>
            {TYPES.map(item => (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={type === item.id}
                onClick={() => setType(item.id)}
              >
                {ar ? item.ar : item.en}
              </button>
            ))}
          </div>
          <h2 className="lane">{ar ? 'الأنظمة الأساسية' : 'Core systems'}</h2>
          <div className="picks">{cores.map(template => card(template, 'core'))}</div>
          <h2 className="lane">{ar ? 'إضافات' : 'Add-ons'}</h2>
          <div className="picks">{addons.map(template => card(template, 'add_on'))}</div>
          <h2 className="lane">{ar ? 'معاينة' : 'Preview'}</h2>
          <div className="picks">{preview.map(template => card(template, 'preview'))}</div>
        </div>
        {summary}
      </div>
      <div className="studio-bar">
        <div>
          {selected.length === 0 ? (
            <span>{ar ? 'اختر نظاماً لترى سعره.' : 'Pick a system to see its price.'}</span>
          ) : (
            <span>
              <bdi>{selected.length}</bdi>
              {' · '}
              <bdi dir="ltr">{formatUsdFromCents(setupCents)}</bdi>
              {ar ? ' إعداد' : ' setup'}
            </span>
          )}
        </div>
        {selected.length > 0 ? (
          <Link className="btn btn-primary btn-sm" href={`/contact?systems=${query}`}>
            {ar ? 'احجز مكالمة' : 'Book a call'}
          </Link>
        ) : (
          <Link className="btn btn-ghost btn-sm" href="/pricing">{ar ? 'الباقات' : 'Plans'}</Link>
        )}
      </div>
    </div>
  )
}
