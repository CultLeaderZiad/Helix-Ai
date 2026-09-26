import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { FactReviewList, type ReviewableFact } from '@/components/crm/fact-review-list'
import { AdminFrame, EmptyState, PageHead, Panel } from '@/components/admin/v5'

export const metadata = {
  title: 'Helix AI — Global Agent Queue',
  robots: { index: false, follow: false },
}

export default async function AdminQueuePage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard/queue')

  // Agency admin reads all pending facts across tenants
  const { data: rawFacts } = await supabase
    .from('contact_facts')
    .select('id, field_name, field_value, evidence_band, source_tool, status, score, method, observed_at, contact_id')
    .eq('status', 'pending')

  const rows = rawFacts ?? []
  const contactIds = [...new Set(rows.map(fact => fact.contact_id).filter(Boolean))]
  const contactsRes = contactIds.length
    ? await supabase.from('contacts').select('id, full_name, company_name').in('id', contactIds)
    : { data: [] as Array<{ id: string; full_name: string | null; company_name: string | null }> }
  const contactById = new Map((contactsRes.data ?? []).map(contact => [contact.id, contact]))

  const facts: ReviewableFact[] = rows.map(f => {
    const contact = contactById.get(f.contact_id)
    return {
      id: f.id,
      field_name: f.field_name,
      field_value: f.field_value,
      evidence_band: f.evidence_band as 'verified' | 'probable' | 'possible',
      source_tool: f.source_tool,
      status: f.status as ReviewableFact['status'],
      score: f.score,
      method: f.method,
      observed_at: f.observed_at,
      contact_id: f.contact_id,
      contact: contact
        ? { full_name: contact.full_name, company_name: contact.company_name }
        : { full_name: null, company_name: null },
    }
  })

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <AdminFrame>
        <PageHead
          title="Agent queue"
          titleAr="طابور الوكلاء"
          lede="Pending suggestions waiting for a person to approve or dismiss."
          ledeAr="اقتراحات معلّقة بانتظار موافقة أو رفض."
        />
        <Panel title="Pending review" titleAr="بانتظار المراجعة">
          {facts.length === 0 ? (
            <EmptyState
              title="Queue is clear"
              titleAr="الطابور فارغ"
              body="Pending suggestions show up here."
              bodyAr="تظهر الاقتراحات المعلّقة هنا."
            />
          ) : (
            <FactReviewList facts={facts} />
          )}
        </Panel>
      </AdminFrame>
    </ConsoleShell>
  )
}
