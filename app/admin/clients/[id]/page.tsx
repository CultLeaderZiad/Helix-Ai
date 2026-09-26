import Link from 'next/link'
import { redirect } from 'next/navigation'
import { notFound } from 'next/navigation'
import {
  BarChart3,
  Calendar,
  CheckCircle2,
  FileSearch,
  Mail,
  Phone,
  StickyNote,
} from 'lucide-react'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminFrame, DataTable, EmptyState, PageHead, Panel, Stat } from '@/components/admin/v5'
import {
  FactReviewList,
  type ReviewableFact,
} from '@/components/crm/fact-review-list'
import type { CrmActivityType, DealStage, IntegrationStatus, SystemType } from '@/lib/schema'

export default async function AdminClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab: tabParam } = await searchParams
  const tab: Tab = TABS.find(item => item.toLowerCase() === (tabParam ?? '').toLowerCase()) ?? 'Overview'

  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')
  if (!UUID.test(id)) notFound()

  // Tenant-scoped reads. RLS still protects every child table; the client_id
  // filters make cross-tenant UUID collisions resolve to nothing.
  const [clientRes, systemsRes, integrationsRes, invoicesRes, contactsRes, dealsRes, activitiesRes, factsRes] =
    await Promise.all([
      supabase.from('clients').select('business_name, vertical, status, timezone').eq('id', id).maybeSingle(),
      supabase
        .from('client_systems')
        .select('id, system_type, provenance, visible_to_client, active, setup_fee_cents, monthly_retainer_cents')
        .eq('client_id', id),
      supabase
        .from('client_integrations')
        .select('id, system_type, status, last_ping_at')
        .eq('client_id', id)
        .order('system_type'),
      supabase
        .from('invoices')
        .select('id, amount_cents, due_date, status, created_at')
        .eq('client_id', id)
        .order('due_date', { ascending: false })
        .limit(25),
      supabase.from('contacts').select('id, full_name, company_name, lead_status').eq('client_id', id),
      supabase.from('deals').select('stage, value_cents').eq('client_id', id),
      supabase
        .from('activities')
        .select('id, type, subject, occurred_at, contact_id, deal_id')
        .eq('client_id', id)
        .order('occurred_at', { ascending: false })
        .limit(20),
      supabase
        .from('contact_facts')
        .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
        .eq('client_id', id)
        .eq('status', 'pending')
        .order('observed_at', { ascending: false })
        .limit(100),
    ])

  const client = clientRes.data
  if (!client) notFound()

  const systems = systemsRes.data ?? []
  const integrations = integrationsRes.data ?? []
  const invoices = invoicesRes.data ?? []
  const contacts = contactsRes.data ?? []
  const deals = dealsRes.data ?? []
  const activities = activitiesRes.data ?? []
  const pendingFactsBase = (factsRes.data ?? []) as ReviewableFact[]

  const contactById = new Map(contacts.map(c => [c.id, c]))
  const contactNameById = new Map(contacts.map(c => [c.id, c.full_name ?? c.company_name ?? 'Unknown contact']))
  const contactCount = contacts.length
  const pendingFacts = pendingFactsBase.map(f => {
    const contact = contactById.get(f.contact_id)
    return { ...f, contact: contact ? { full_name: contact.full_name, company_name: contact.company_name } : null }
  })
  const openPipelineCents = deals
    .filter(d => OPEN_STAGES.includes(d.stage))
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const wonValueCents = deals
    .filter(d => d.stage === 'CLOSED_WON')
    .reduce((sum, d) => sum + (d.value_cents ?? 0), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue').length

  const tabLabel: Record<Tab, { en: string; ar: string }> = {
    Overview: { en: 'Overview', ar: 'نظرة عامة' },
    Systems: { en: 'Systems', ar: 'الأنظمة' },
    Billing: { en: 'Billing', ar: 'الفوترة' },
    Facts: { en: 'Review', ar: 'المراجعة' },
    Queue: { en: 'Queue', ar: 'الطابور' },
  }

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title={client.business_name}
          titleAr={client.vertical ?? 'مساحة عمل'}
          lede={client.vertical ?? undefined}
          actions={
            <Link className="hx-admin-btn" href="/admin">
              All clients
            </Link>
          }
        />

        <nav className="hx-admin-switch" aria-label="Client sections">
          {TABS.map(item => (
            <Link
              key={item}
              href={`/admin/clients/${id}?tab=${item.toLowerCase()}`}
              aria-current={tab === item ? 'page' : undefined}
              className={tab === item ? 'on' : undefined}
            >
              {tabLabel[item].en}
              <span className="hx-admin-ar" lang="ar" dir="rtl" style={{ display: 'block', margin: 0 }}>
                {tabLabel[item].ar}
              </span>
            </Link>
          ))}
        </nav>

        {tab === 'Overview' ? (
          <>
            <section className="hx-admin-stats">
              <Stat label="Contacts" labelAr="جهات الاتصال" value={contactCount} />
              <Stat label="Open pipeline" labelAr="المسار المفتوح" value={formatCurrency(openPipelineCents)} />
              <Stat label="Closed won value" labelAr="قيمة الصفقات المغلقة" value={formatCurrency(wonValueCents)} />
              <Stat label="Overdue invoices" labelAr="فواتير متأخرة" value={overdueCount} />
              <Stat label="Integrations" labelAr="التكاملات" value={integrations.length} />
            </section>
            <Panel title="Recent activity" titleAr="النشاط الأخير">
              {activities.length === 0 ? (
                <EmptyState
                  title="No activity recorded yet"
                  titleAr="لا نشاط مسجّل بعد"
                  body="Activity for this workspace will show up here."
                  bodyAr="يظهر نشاط هذه المساحة هنا."
                />
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {activities.map(activity => {
                    const Icon = ACTIVITY_ICON[activity.type as CrmActivityType] ?? StickyNote
                    const subject = activity.subject ?? 'Untitled activity'
                    const who = activity.contact_id ? (contactNameById.get(activity.contact_id) ?? null) : null
                    return (
                      <li key={activity.id} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(21,23,26,0.08)' }}>
                        <Icon aria-hidden="true" size={16} />
                        <div>
                          <p style={{ margin: 0 }}>{subject}</p>
                          <p className="hx-admin-lede">
                            {who ? `${who} · ` : ''}
                            {formatDateTime(activity.occurred_at)}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </>
        ) : null}

        {tab === 'Systems' ? (
          <Panel title="Installed systems" titleAr="الأنظمة المثبتة">
            {systems.length === 0 ? (
              <EmptyState title="No systems installed yet" titleAr="لا أنظمة مثبتة بعد" />
            ) : (
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {systems.map(system => (
                  <li key={system.id} className="hx-admin-panel" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                      <strong>{SYSTEM_GLOSS[system.system_type as SystemType] ?? system.system_type}</strong>
                      <span>{system.visible_to_client ? 'Visible to client' : 'Internal only'}</span>
                    </div>
                    <p className="hx-admin-lede">
                      {system.provenance}
                      {system.active ? '' : ' · Inactive'}
                      {' · '}
                      Setup {system.setup_fee_cents != null ? formatCurrency(system.setup_fee_cents) : '—'}
                      {' · '}
                      Retainer {system.monthly_retainer_cents != null ? `${formatCurrency(system.monthly_retainer_cents)}/mo` : '—'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        ) : null}

        {tab === 'Billing' ? (
          <Panel title="Invoices" titleAr="الفواتير">
            {invoices.length === 0 ? (
              <EmptyState title="No invoices recorded yet" titleAr="لا فواتير مسجّلة بعد" />
            ) : (
              <DataTable
                columns={[
                  { key: 'amount', label: 'Amount' },
                  { key: 'due', label: 'Due' },
                  { key: 'status', label: 'Status' },
                ]}
              >
                {invoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>{formatCurrency(invoice.amount_cents)}</td>
                    <td>{formatDate(invoice.due_date)}</td>
                    <td style={{ textTransform: 'capitalize' }}>{invoice.status}</td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>
        ) : null}

        {tab === 'Facts' ? (
          <Panel title="Review queue" titleAr="طابور المراجعة">
            {pendingFacts.length === 0 ? (
              <EmptyState
                title="No pending suggestions"
                titleAr="لا اقتراحات معلّقة"
                body="The queue is clear."
                bodyAr="الطابور فارغ."
              />
            ) : (
              <>
                <p className="hx-admin-lede">
                  Shown read-only here. Client workspace users approve or dismiss these from their own workspace.
                </p>
                <p className="hx-admin-ar" lang="ar" dir="rtl">
                  للعرض فقط هنا. مستخدمو مساحة العميل يوافقون أو يرفضون من مساحتهم.
                </p>
                <FactReviewList facts={pendingFacts} />
              </>
            )}
          </Panel>
        ) : null}

        {tab === 'Queue' ? (
          <Panel title="Agent queue" titleAr="طابور الوكيل">
            <p className="hx-admin-lede">
              Verified facts apply automatically through a leased work queue drained by the scheduled runner. Run summaries are written to service logs; the console does not expose queue state.
            </p>
            <p className="hx-admin-ar" lang="ar" dir="rtl">
              الحقائق المؤكدة تُطبَّق تلقائياً عبر طابور عمل. ملخصات التشغيل تُكتب في سجلات الخدمة، واللوحة لا تعرض حالة الطابور.
            </p>
          </Panel>
        ) : null}
      </AdminFrame>
    </ConsoleShell>
  )
}


const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const TABS = ['Overview', 'Systems', 'Billing', 'Facts', 'Queue'] as const
type Tab = (typeof TABS)[number]

const OPEN_STAGES: DealStage[] = [
  'new_lead',
  'engaged',
  'studio_completed',
  'call_booked',
  'proposal_sent',
  'DEMO_BOOKED',
  'QUALIFIED_TO_BUY',
  'DECISION_MAKER_BOUGHT_IN',
  'CONTRACT_SENT',
]

const SYSTEM_GLOSS: Record<SystemType, string> = {
  missed_call_response: 'Missed-call response',
  booking_receptionist: 'Booking receptionist',
  lead_attribution: 'Lead attribution',
  lead_reactivation: 'Lead reactivation',
  ar_collections: 'A/R collections (B2B)',
  rival_watch: 'Rival Watch',
  handbook_bot: 'Handbook Answers',
  seo_scorecard: 'Visibility Scorecard',
  deck_factory: 'Deck Factory',
  shorts_factory: 'Clip Factory',
  lead_generation: 'Lead Generation',
}

const ACTIVITY_ICON: Record<CrmActivityType, typeof Phone> = {
  note: StickyNote,
  call: Phone,
  email: Mail,
  meeting: Calendar,
  task: CheckCircle2,
  stage_change: BarChart3,
  enrichment: FileSearch,
}

const INTEGRATION_LABEL: Record<IntegrationStatus, string> = {
  connected: 'Connected',
  degraded: 'Degraded',
  disconnected: 'Disconnected',
  unknown: 'Unknown',
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100)
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString('en-US', { dateStyle: 'medium' })
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}
