import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { EmptyState, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'
import type { IntegrationStatus, SystemType } from '@/lib/schema'

export const metadata = {
  title: 'Helix — Systems',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

const NAMES: Record<SystemType, { en: string; ar: string }> = {
  missed_call_response: { en: 'Missed-call response', ar: 'الرد على المكالمات الفائتة' },
  booking_receptionist: { en: 'Booking receptionist', ar: 'موظف الاستقبال والحجوزات' },
  lead_attribution: { en: 'Lead attribution', ar: 'تتبع مصدر العملاء' },
  lead_reactivation: { en: 'Lead reactivation', ar: 'إعادة تنشيط العملاء' },
  ar_collections: { en: 'Collections', ar: 'التحصيل' },
  rival_watch: { en: 'Rival Watch', ar: 'متابعة المنافسين' },
  handbook_bot: { en: 'Handbook answers', ar: 'إجابات الدليل' },
  seo_scorecard: { en: 'Visibility scorecard', ar: 'بطاقة الظهور' },
  deck_factory: { en: 'Deck factory', ar: 'عروض تقديمية' },
  shorts_factory: { en: 'Clip factory', ar: 'مقاطع قصيرة' },
  lead_generation: { en: 'Lead generation', ar: 'توليد العملاء' },
}

export default async function SystemsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/studio')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!
  const [clientRes, systemsRes, integrationsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase.from('client_systems').select('id, system_type, active, visible_to_client').eq('client_id', clientId),
    supabase.from('client_integrations').select('system_type, status, last_ping_at').eq('client_id', clientId),
  ])
  const systems = (systemsRes.data ?? []).filter(system => system.visible_to_client)
  const integrations = (integrationsRes.data ?? []) as Array<{ system_type: string; status: IntegrationStatus; last_ping_at: string | null }>

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={clientRes.data?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Systems', 'الأنظمة')}
        lede={tx(lang, 'What is switched on for this workspace.', 'ما هو مفعّل في مساحة العمل هذه.')}
        actions={<Link className="btn-o" href="/dashboard/integrations">{tx(lang, 'Connections', 'الاتصالات')}</Link>}
      />
      <div className="stack">
        <Panel>
          {systemsRes.error ? (
            <p className="muted">{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</p>
          ) : systems.length === 0 ? (
            <EmptyState
              title={tx(lang, 'No systems are visible yet.', 'لا تظهر أنظمة بعد.')}
              body={tx(lang, 'They appear here as onboarding finishes.', 'تظهر هنا عند اكتمال التجهيز.')}
            />
          ) : (
            <ul className="sys">
              {systems.map(system => {
                const name = NAMES[system.system_type as SystemType]
                const link = integrations.find(item => item.system_type === system.system_type)
                const when = link?.last_ping_at
                  ? new Date(link.last_ping_at).toLocaleString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' })
                  : null
                return (
                  <li key={system.id}>
                    <div>
                      <b>{name ? (lang === 'ar' ? name.ar : name.en) : String(system.system_type).replaceAll('_', ' ')}</b>
                      <span>
                        {when
                          ? tx(lang, `Last check ${when}`, `آخر فحص ${when}`)
                          : tx(lang, 'No recent check on file', 'لا يوجد فحص حديث')}
                      </span>
                    </div>
                    <StatusChip tone={system.active ? 'ok' : 'neutral'}>
                      {system.active ? tx(lang, 'Running', 'يعمل') : tx(lang, 'Paused', 'متوقف مؤقتاً')}
                    </StatusChip>
                  </li>
                )
              })}
            </ul>
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
