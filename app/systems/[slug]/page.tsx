import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { SitePage } from '@/components/marketing/site-page'
import { SystemDetail, type SystemDetailModel } from '@/components/marketing/system-detail'
import { getSystemTemplate, SYSTEM_TEMPLATES } from '@/lib/studio/templates'

const ALIASES: Record<string, string> = {
  'missed-call-triage': 'missed-call-responder',
  'lead-qualification': 'lead-attribution',
  'b2b-collections': 'ar-invoicing',
}

export function generateStaticParams() {
  const ids = new Set<string>()
  for (const template of SYSTEM_TEMPLATES.filter(item => item.lane === 'core')) ids.add(template.id)
  for (const alias of Object.keys(ALIASES)) ids.add(alias)
  return [...ids].map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const template = getSystemTemplate(ALIASES[slug] ?? slug)
  return { title: template ? `${template.en.name} — Helix` : 'System — Helix' }
}

export default async function SystemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const template = getSystemTemplate(ALIASES[slug] ?? slug)
  if (!template || template.lane !== 'core') notFound()
  const system: SystemDetailModel = {
    id: template.id,
    name: template.en.name,
    nameAr: template.ar.name,
    tagline: template.en.tagline,
    taglineAr: template.ar.tagline,
    vertical: template.en.vertical,
    verticalAr: template.ar.vertical,
    setupFeeCents: template.setupFeeCents,
    monthlyRetainerCents: template.monthlyRetainerCents,
  }
  return (
    <SitePage>
      <SystemDetail system={system} />
    </SitePage>
  )
}
