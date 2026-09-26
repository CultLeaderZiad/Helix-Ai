import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { PageHead, Panel } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix: Settings',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')

  const isAdmin = session.claims.role === 'agency_admin'
  const clientId = session.claims.client_id
  const lang = await readDashLang()
  const theme = await readDashTheme()

  let clientData: { business_name?: string; vertical?: string | null; status?: string } | null = null
  if (clientId) {
    const { data } = await supabase.from('clients').select('business_name, vertical, status').eq('id', clientId).maybeSingle()
    clientData = data
  }

  const workspace = clientData?.business_name || (isAdmin ? 'Helix' : tx(lang, 'This workspace', 'مساحة العمل هذه'))

  return (
    <ConsoleShell
      variant={isAdmin ? 'admin' : 'client'}
      email={session.user.email ?? ''}
      businessName={clientData?.business_name ?? null}
      lang={lang}
      theme={theme}
    >
      <PageHead
        title={isAdmin ? tx(lang, 'Agency settings', 'إعدادات الوكالة') : tx(lang, 'Settings', 'الإعدادات')}
        lede={tx(lang, 'The name, email, and role on this sign-in.', 'الاسم والبريد والدور في تسجيل الدخول هذا.')}
      />
      <div className="stack">
        <Panel title={tx(lang, 'Account', 'الحساب')}>
          <dl className="grid-2">
            <div>
              <dt className="faint">{isAdmin ? tx(lang, 'Agency', 'الوكالة') : tx(lang, 'Workspace', 'مساحة العمل')}</dt>
              <dd>{workspace}</dd>
            </div>
            <div>
              <dt className="faint">{tx(lang, 'Email', 'البريد')}</dt>
              <dd><bdi dir="ltr">{session.user.email ?? '-'}</bdi></dd>
            </div>
            <div>
              <dt className="faint">{tx(lang, 'Role', 'الدور')}</dt>
              <dd>{isAdmin ? tx(lang, 'Agency', 'الوكالة') : tx(lang, 'Client', 'عميل')}</dd>
            </div>
            <div>
              <dt className="faint">{tx(lang, 'Status', 'الحالة')}</dt>
              <dd>{clientData?.status ? clientData.status.replaceAll('_', ' ') : tx(lang, 'Not set', 'غير محدد')}</dd>
            </div>
          </dl>
        </Panel>
        {isAdmin ? (
          <Panel title={tx(lang, 'Agency pages', 'صفحات الوكالة')}>
            <div className="ph-actions">
              <Link className="btn-o" href="/admin/users">{tx(lang, 'Team', 'الفريق')}</Link>
              <Link className="btn-o" href="/admin/pricing">{tx(lang, 'Pricing', 'الأسعار')}</Link>
              <Link className="btn-o" href="/admin/updates">{tx(lang, 'Updates', 'التحديثات')}</Link>
              <Link className="btn-o" href="/admin/faq">{tx(lang, 'Questions', 'الأسئلة')}</Link>
            </div>
          </Panel>
        ) : (
          <Panel title={tx(lang, 'Workspace', 'مساحة العمل')}>
            <p className="muted">{tx(lang, 'Hours, connections, and billing live on their own pages.', 'الساعات والاتصالات والفوترة في صفحاتها.')}</p>
            <div className="ph-actions" style={{ marginTop: 12 }}>
              <Link className="btn-o" href="/dashboard/integrations">{tx(lang, 'Integrations', 'التكاملات')}</Link>
              <Link className="btn-o" href="/dashboard/billing">{tx(lang, 'Billing', 'الفوترة')}</Link>
            </div>
          </Panel>
        )}
      </div>
    </ConsoleShell>
  )
}
