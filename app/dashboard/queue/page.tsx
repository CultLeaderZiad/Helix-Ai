import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { InlineError, PageHead, Panel } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix — Review queue',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AttentionQueuePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/queue')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!

  const [clientRes, factsRes, integrationsRes] = await Promise.all([
    supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle(),
    supabase
      .from('contact_facts')
      .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
      .eq('client_id', clientId)
      .eq('status', 'pending'),
    supabase.from('client_integrations').select('id, system_type, status').eq('client_id', clientId),
  ])

  const client = clientRes.data
  const rawFacts = factsRes.data ?? []
  const contactIds = [...new Set(rawFacts.map(fact => fact.contact_id).filter(Boolean))]
  const contactsRes = contactIds.length
    ? await supabase.from('contacts').select('id, full_name, company_name').in('id', contactIds)
    : { data: [] as Array<{ id: string; full_name: string | null; company_name: string | null }> }
  const contactById = new Map((contactsRes.data ?? []).map(contact => [contact.id, contact]))
  const needsReconnect = (integrationsRes.data ?? []).filter(
    item => item.status === 'degraded' || item.status === 'disconnected',
  ).length

  const facts: ReviewableFact[] = rawFacts.map(fact => {
    const contact = contactById.get(fact.contact_id)
    return {
      id: fact.id,
      field_name: fact.field_name,
      field_value: fact.field_value,
      evidence_band: fact.evidence_band as ReviewableFact['evidence_band'],
      source_tool: fact.source_tool,
      status: fact.status as ReviewableFact['status'],
      score: fact.score,
      method: fact.method,
      observed_at: fact.observed_at,
      contact_id: fact.contact_id,
      contact: contact
        ? { full_name: contact.full_name, company_name: contact.company_name }
        : { full_name: null, company_name: client?.business_name ?? null },
    }
  })

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Review queue', 'قائمة المراجعة')}
        lede={tx(
          lang,
          'Details the workspace was unsure about. Nothing here is saved until you approve it.',
          'تفاصيل لم تتأكد منها مساحة العمل. لا يُحفظ شيء هنا قبل موافقتك.',
        )}
      />
      <div className="stack">
        {needsReconnect > 0 ? (
          <Panel title={tx(lang, 'A connection needs attention', 'اتصال يحتاج متابعة')}>
            <p className="muted">
              {tx(lang, `${needsReconnect} connection${needsReconnect === 1 ? '' : 's'} not connected.`, `${needsReconnect} غير موصول.`)}{' '}
              <Link className="link" href="/dashboard/integrations">{tx(lang, 'Reconnect', 'إعادة الربط')}</Link>
            </p>
          </Panel>
        ) : null}
        <Panel title={tx(lang, 'Waiting for you', 'بانتظارك')}>
          {factsRes.error ? (
            <InlineError>{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</InlineError>
          ) : (
            <FactReviewList facts={facts} lang={lang} />
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
