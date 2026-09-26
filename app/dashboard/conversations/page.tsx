import { tx, type DashLang, type DashTheme } from '@/lib/dashboard/lang'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { DataTable, EmptyState, InlineError, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'
import { readDashLang, readDashTheme } from '@/lib/dashboard/lang.server'

export const metadata = {
  title: 'Helix: Conversations',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type Thread = {
  id: string
  contact: string
  channel: string
  preview: string
  when: string
  status: string | null
}

function textOf(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

function plainStatus(value: string, lang: 'en' | 'ar'): string {
  const key = value.toLowerCase()
  if (key.includes('close')) return tx(lang, 'Closed', 'مغلقة')
  if (key.includes('team') || key.includes('handoff') || key.includes('human')) return tx(lang, 'With your team', 'مع فريقك')
  if (key.includes('helix') || key.includes('handled') || key.includes('bot')) return tx(lang, 'Handled by Helix', 'عالجها Helix')
  return value.replaceAll('_', ' ')
}

export default async function ConversationsPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin')

  const lang = await readDashLang()
  const theme = await readDashTheme()
  const clientId = session.claims.client_id!
  const { data: client } = await supabase.from('clients').select('business_name').eq('id', clientId).maybeSingle()

  const conversationsRes = await supabase.from('conversations').select('*').eq('client_id', clientId).limit(80)
  const missingTable = Boolean(conversationsRes.error && /does not exist|schema cache|42P01/i.test(conversationsRes.error.message))
  let threads: Thread[] = []
  let failed = Boolean(conversationsRes.error) && !missingTable

  if (!conversationsRes.error && (conversationsRes.data?.length ?? 0) > 0) {
    const rows = conversationsRes.data as Array<Record<string, unknown>>
    const contactIds = [...new Set(rows.map(row => String(row.contact_id || '')).filter(Boolean))]
    const contactsRes = contactIds.length
      ? await supabase.from('contacts').select('id, full_name, phone').in('id', contactIds)
      : { data: [] as Array<{ id: string; full_name: string | null; phone: string | null }> }
    const contactById = new Map((contactsRes.data ?? []).map(contact => [contact.id, contact]))
    const messagesRes = await supabase.from('messages').select('*').eq('client_id', clientId).limit(200)
    const messages = (messagesRes.error ? [] : (messagesRes.data ?? [])) as Array<Record<string, unknown>>
    threads = rows.map(row => {
      const id = String(row.id)
      const related = messages
        .filter(message => String(message.conversation_id || '') === id)
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
      const latest = related[0]
      const contact = contactById.get(String(row.contact_id || ''))
      const status = textOf(row, ['status', 'state'])
      const whenRaw = textOf(row, ['updated_at', 'last_message_at', 'created_at']) || textOf(latest ?? {}, ['created_at'])
      return {
        id,
        contact: contact?.full_name || (contact?.phone ? contact.phone : tx(lang, 'Unknown contact', 'جهة غير معروفة')),
        channel: textOf(row, ['channel', 'source']) || tx(lang, 'Not on file', 'غير متوفر'),
        preview: textOf(latest ?? {}, ['body', 'text', 'content', 'message']) || textOf(row, ['last_message', 'preview']) || tx(lang, 'No message text on file.', 'لا يوجد نص رسالة.'),
        when: whenRaw ? new Date(whenRaw).toLocaleString(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Dubai' }) : '',
        status: status ? plainStatus(status, lang) : null,
      }
    })
  }

  return (
    <ConsoleShell variant="client" email={session.user.email ?? ''} businessName={client?.business_name ?? null} lang={lang} theme={theme}>
      <PageHead
        title={tx(lang, 'Conversations', 'المحادثات')}
        lede={tx(lang, 'Messages your workspace has on file.', 'الرسائل المسجّلة في مساحة العمل.')}
      />
      <div className="stack">
        <Panel>
          {failed ? (
            <InlineError>{tx(lang, "We couldn't load this section. Retry", 'تعذّر تحميل هذا القسم. إعادة المحاولة')}</InlineError>
          ) : (
            <DataTable
              rows={threads}
              rowKey={row => row.id}
              empty={<EmptyState title={tx(lang, 'No conversations yet.', 'لا توجد محادثات بعد.')} />}
              columns={[
                { key: 'contact', header: tx(lang, 'Contact', 'جهة الاتصال'), render: row => row.contact },
                { key: 'channel', header: tx(lang, 'Channel', 'القناة'), render: row => row.channel },
                { key: 'preview', header: tx(lang, 'Last message', 'آخر رسالة'), render: row => row.preview },
                { key: 'when', header: tx(lang, 'When', 'الوقت'), render: row => row.when || '-' },
                {
                  key: 'status',
                  header: tx(lang, 'Status', 'الحالة'),
                  render: row => row.status ? <StatusChip>{row.status}</StatusChip> : tx(lang, 'Not on file', 'غير متوفر'),
                },
              ]}
            />
          )}
        </Panel>
      </div>
    </ConsoleShell>
  )
}
