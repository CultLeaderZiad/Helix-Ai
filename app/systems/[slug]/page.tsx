import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SitePage } from '@/components/marketing/site-page'
import { formatUsdFromCents, getSystemTemplate, SYSTEM_TEMPLATES } from '@/lib/studio/templates'

const ALIASES: Record<string, string> = {
  'missed-call-triage': 'missed-call-responder',
  'lead-qualification': 'lead-attribution',
  'b2b-collections': 'ar-invoicing',
}

export function generateStaticParams() {
  const ids = new Set<string>()
  for (const t of SYSTEM_TEMPLATES.filter(s => s.lane === 'core')) ids.add(t.id)
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
  return (
    <SitePage>
      <article className="container" style={{ padding: '72px 32px 96px', maxWidth: 860 }}>
        <p className="kicker">Systems</p>
        <h1 className="display h2" style={{ marginTop: 16 }}>{template.en.name}</h1>
        <p className="lead" style={{ marginTop: 16 }}>{template.en.tagline}</p>
        <p className="muted" style={{ marginTop: 16 }}>{template.en.description}</p>
        <p className="small" style={{ marginTop: 28 }}>
          Per-system pricing · USD · {formatUsdFromCents(template.setupFeeCents)} setup · {formatUsdFromCents(template.monthlyRetainerCents)} / month
        </p>
        <p className="faint small">Final price is confirmed on your discovery call. <Link className="link" href="/pricing">Prefer a bundled monthly plan? See plans in AED</Link></p>
        <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
          <Link className="btn btn-primary" href={`/contact?systems=${template.id}`}>Book a discovery call</Link>
          <Link className="btn btn-ghost" href="/studio">Open in Studio</Link>
        </div>
        <p className="faint small" style={{ marginTop: 40 }}>Illustrative positioning. The live system follows your hours, your calendar, and a human hand-off when the answer is unclear.</p>
      </article>
    </SitePage>
  )
}
