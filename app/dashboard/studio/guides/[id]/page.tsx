import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { getSystemTemplate } from '@/lib/studio/templates'
import { getSystemGuide } from '@/lib/studio/guides'
import { PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix — System guide',
  robots: { index: false, follow: false },
}

export default async function SystemGuidePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const template = getSystemTemplate(id)
  if (!template) notFound()

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const guide = getSystemGuide(id, template)
  const isAdmin = session.claims.role === 'agency_admin'
  const copy = lang === 'ar' ? template.ar : template.en
  const steps = lang === 'ar' ? guide.stepsAr : guide.steps

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={null}
      lang={lang}
      theme={theme}
    >
      <PageHead
        title={copy.name}
        lede={copy.tagline}
        actions={<StatusChip>{template.lane === 'core' ? tx(lang, 'Included', 'ضمن الباقة') : tx(lang, 'Add-on', 'إضافة')}</StatusChip>}
      />
      <div className="stack">
        <Panel title={tx(lang, 'Who it is for', 'لمن')}>
          <p>{lang === 'ar' ? guide.whoAr : guide.who}</p>
        </Panel>
        <Panel title={tx(lang, 'What it does', 'ماذا يفعل')}>
          <p>{lang === 'ar' ? guide.whatAr : guide.what}</p>
        </Panel>
        <Panel title={tx(lang, 'Steps', 'الخطوات')}>
          <ol className="setup">
            {steps.map(step => (
              <li key={step}><span>{step}</span></li>
            ))}
          </ol>
        </Panel>
        <div className="ph-actions">
          <Link className="btn-d" href={isAdmin ? `/dashboard/studio?system=${id}` : '/dashboard/systems'}>
            {isAdmin ? tx(lang, 'Open studio', 'افتح الاستوديو') : tx(lang, 'Back to systems', 'العودة إلى الأنظمة')}
          </Link>
          {isAdmin ? <Link className="btn-o" href="/admin/studio">{tx(lang, 'Catalog', 'القائمة')}</Link> : null}
        </div>
      </div>
    </ConsoleShell>
  )
}
