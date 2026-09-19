import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { getSystemTemplate } from '@/lib/studio/templates'
import { getSystemGuide } from '@/lib/studio/guides'
import { PageHeader } from '@/components/ui/helix'
import { buttonVariants } from '@/components/ui/button'
import { RequestBuildButton } from '@/components/studio/request-build-button'
import { Pill } from '@/components/ui/helix'

export const metadata = {
  title: 'Helix AI — System guide',
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

  const guide = getSystemGuide(id, template)
  const isAdmin = session.claims.role === 'agency_admin'

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={null}
    >
      <div className="w-full max-w-3xl">
        <PageHeader
          title={template.en.name}
          subtitle={template.en.tagline}
          actions={
            <div className="flex flex-wrap gap-2">
              <Pill tone={template.lane === 'core' ? 'core' : 'preview'}>
                {template.lane === 'core' ? 'Core' : 'Preview'}
              </Pill>
            </div>
          }
        />

        <div className="mt-8 space-y-6 text-15 leading-relaxed">
          <section>
            <h2 className="text-13 font-medium uppercase tracking-[0.06em] text-helix-muted">Who</h2>
            <p className="mt-2 text-helix-ink">{guide.who}</p>
            <p className="mt-1 text-13 text-helix-muted" dir="rtl">
              {guide.whoAr}
            </p>
          </section>
          <section>
            <h2 className="text-13 font-medium uppercase tracking-[0.06em] text-helix-muted">What</h2>
            <p className="mt-2 text-helix-ink">{guide.what}</p>
            <p className="mt-1 text-13 text-helix-muted" dir="rtl">
              {guide.whatAr}
            </p>
          </section>
          <section>
            <h2 className="text-13 font-medium uppercase tracking-[0.06em] text-helix-muted">Steps</h2>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-helix-ink">
              {guide.steps.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </section>
        </div>

        <div className="mt-8 flex flex-wrap gap-2">
          <Link href={`/dashboard/studio?system=${id}`} className={buttonVariants()}>
            Try demo
          </Link>
          <RequestBuildButton templateId={id} />
          <Link href="/admin/studio" className={buttonVariants({ variant: 'secondary' })}>
            Back to catalog
          </Link>
        </div>
      </div>
    </ConsoleShell>
  )
}
