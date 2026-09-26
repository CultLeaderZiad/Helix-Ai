'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { HelixMark } from '@/components/brand/helix-mark'
import { useMarketingPrefs } from '@/components/marketing/marketing-prefs'

const COPY = {
  en: {
    blurb: 'The all-in-one business platform. CRM, ERP, and automation, built for serious teams.',
    region: 'Regional GCC Enterprise & MENA Operations Infrastructure.',
    product: 'Product',
    company: 'Company',
    legal: 'Legal',
    rights: '© 2026 HELIX. ALL RIGHTS RESERVED.',
    status: 'All systems operational',
    links: {
      product: [
        ['CRM', '/dashboard/crm'],
        ['Studio Sandbox', '/studio'],
        ['AI Engine', '/dashboard/engine'],
        ['Integrations', '/dashboard/integrations'],
        ['Pricing', '/pricing'],
        ['FAQ', '/faq'],
        ['Changelog', '/updates'],
      ],
      company: [
        ['About', '/about'],
        ['Contact', '/contact'],
        ['FAQ', '/faq'],
        ['Updates & Releases', '/updates'],
        ['Careers', '/contact'],
        ['Agency Console', '/login?portal=agency'],
      ],
      legal: [
        ['Terms of Service', '/terms'],
        ['Privacy Policy', '/privacy'],
        ['Security', '/privacy#security'],
        ['Cookie Policy', '/privacy#cookies'],
      ],
    },
  },
  ar: {
    blurb: 'منصة أعمال واحدة. إدارة العملاء والتشغيل والأتمتة، لفرق تأخذ عملها بجد.',
    region: 'بنية تشغيل إقليمية للخليج والشرق الأوسط.',
    product: 'المنتج',
    company: 'الشركة',
    legal: 'قانوني',
    rights: '© 2026 هيلكس. جميع الحقوق محفوظة.',
    status: 'كل الأنظمة تعمل',
    links: {
      product: [
        ['إدارة العملاء', '/dashboard/crm'],
        ['استوديو التجارب', '/studio'],
        ['محرك الذكاء', '/dashboard/engine'],
        ['الربط', '/dashboard/integrations'],
        ['الأسعار', '/pricing'],
        ['الأسئلة', '/faq'],
        ['سجل التغييرات', '/updates'],
      ],
      company: [
        ['من نحن', '/about'],
        ['تواصل', '/contact'],
        ['الأسئلة', '/faq'],
        ['التحديثات', '/updates'],
        ['الوظائف', '/contact'],
        ['الوكالة', '/login?portal=agency'],
      ],
      legal: [
        ['شروط الخدمة', '/terms'],
        ['سياسة الخصوصية', '/privacy'],
        ['الحماية', '/privacy#security'],
        ['سياسة الكوكيز', '/privacy#cookies'],
      ],
    },
  },
} as const

export function HelixFooter({ agencyHref }: { agencyHref: string }) {
  const { lang, effective, setLang, setTheme } = useMarketingPrefs()
  const ar = lang === 'ar'
  const copy = COPY[lang]
  const company = copy.links.company.map(item =>
    item[1] === '/login?portal=agency' ? [item[0], agencyHref] : item,
  )

  return (
    <footer className="hx-foot">
      <div className="hx-watermark" aria-hidden="true">
        HELIX AI
      </div>
      <div className="hx-foot-inner">
        <m.div
          className="hx-foot-grid"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '0px 0px -40px 0px' }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          <m.div variants={rise} className="hx-foot-brand">
            <Link href="/" className="hx-foot-logo">
              <HelixMark size={32} rounded="rounded-lg" />
              <span>Helix</span>
            </Link>
            <p>{copy.blurb}</p>
            <p className="hx-foot-region">{copy.region}</p>
          </m.div>
          <m.div variants={rise}>
            <p className="hx-foot-label">{copy.product}</p>
            <ul>
              {copy.links.product.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </m.div>
          <m.div variants={rise}>
            <p className="hx-foot-label">{copy.company}</p>
            <ul>
              {company.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </m.div>
          <m.div variants={rise}>
            <p className="hx-foot-label">{copy.legal}</p>
            <ul>
              {copy.links.legal.map(([label, href]) => (
                <li key={label}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </m.div>
        </m.div>

        <div className="hx-foot-bar">
          <p>{copy.rights}</p>
          <div className="hx-foot-prefs">
            <button type="button" onClick={() => setLang(ar ? 'en' : 'ar')}>
              {ar ? 'English' : 'العربية'}
            </button>
            <button type="button" onClick={() => setTheme(effective === 'day' ? 'night' : 'day')}>
              {effective === 'day' ? (ar ? 'داكن' : 'Dark') : ar ? 'فاتح' : 'Light'}
            </button>
          </div>
          <p className="hx-status" role="status">
            <span className="hx-live" aria-hidden="true">
              <span className="hx-live-ping" />
              <span className="hx-live-dot" />
            </span>
            <span>{copy.status}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}

const rise = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
}
