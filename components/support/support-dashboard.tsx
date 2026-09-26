'use client'

import { useState } from 'react'
import { TicketChat } from './ticket-chat'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { SupportTicket, SupportMessage } from '@/lib/schema'
import { tx, type DashLang } from '@/lib/dashboard/lang'
import { useDashLang } from '@/components/dashboard/use-lang'
import { EmptyState, FormField, StatusChip } from '@/components/dashboard/ui'

interface SupportDashboardProps {
  initialTickets: (SupportTicket & { clientName?: string })[]
  allMessages: (SupportMessage & { senderName?: string })[]
  currentUserId: string
  clientId: string | null
  isAdmin: boolean
  lang?: DashLang
  businessName?: string | null
}

export function SupportDashboard({ initialTickets, allMessages, currentUserId, clientId, isAdmin, lang, businessName }: SupportDashboardProps) {
  const active = useDashLang(lang ?? 'en')
  const [tickets, setTickets] = useState(initialTickets)
  const messages = allMessages
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id ?? null)
  const [isCreating, setIsCreating] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const supabase = createSupabaseBrowserClient()

  const selectedTicket = tickets.find(ticket => ticket.id === selectedTicketId)
  const ticketMessages = messages.filter(message => message.ticket_id === selectedTicketId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  async function handleCreateTicket(event: React.FormEvent) {
    event.preventDefault()
    if (!newSubject.trim() || (!clientId && !isAdmin)) return

    const { data, error } = await supabase.from('support_tickets').insert({
      client_id: clientId!,
      subject: newSubject.trim(),
      status: 'open',
      unread_by_admin: true,
      unread_by_client: false,
    }).select().single()

    if (error || !data) return

    setTickets([data as SupportTicket, ...tickets])
    setSelectedTicketId(data.id)
    setIsCreating(false)
    setNewSubject('')
  }

  return (
    <div className="grid-2">
      <section className="pnl">
        <div className="pnl-h">
          <b>{tx(active, 'Requests', 'الطلبات')}</b>
          {!isAdmin ? (
            <button type="button" className="btn-d" onClick={() => setIsCreating(true)}>
              {tx(active, 'New request', 'طلب جديد')}
            </button>
          ) : null}
        </div>
        {businessName ? <p className="faint">{businessName}</p> : null}
        <div>
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              type="button"
              onClick={() => {
                setSelectedTicketId(ticket.id)
                setIsCreating(false)
              }}
              className="it"
              style={{ width: '100%', background: selectedTicketId === ticket.id ? 'var(--surface-3)' : 'transparent', height: 'auto', padding: '10px', textAlign: 'start' }}
            >
              <span style={{ flex: 1 }}>
                {ticket.subject}
                <small className="faint" style={{ display: 'block' }}>
                  {new Date(ticket.created_at).toLocaleDateString(active === 'ar' ? 'ar' : 'en')}
                </small>
              </span>
              <StatusChip tone={ticket.status === 'open' ? 'ok' : 'neutral'}>
                {ticket.status === 'open' ? tx(active, 'Open', 'مفتوح') : tx(active, 'Closed', 'مغلق')}
              </StatusChip>
            </button>
          ))}
          {tickets.length === 0 ? <EmptyState title={tx(active, 'No open requests.', 'لا توجد طلبات مفتوحة.')} /> : null}
        </div>
      </section>
      <section className="pnl">
        {isCreating ? (
          <form onSubmit={handleCreateTicket} className="stack">
            <b>{tx(active, 'New request', 'طلب جديد')}</b>
            <FormField label={tx(active, 'Subject', 'الموضوع')} htmlFor="support-subject">
              <input id="support-subject" className="fld" value={newSubject} onChange={event => setNewSubject(event.target.value)} required />
            </FormField>
            <div className="ph-actions">
              <button type="button" className="btn-o" onClick={() => setIsCreating(false)}>{tx(active, 'Cancel', 'إلغاء')}</button>
              <button type="submit" className="btn-d" disabled={!newSubject.trim()}>{tx(active, 'Send', 'إرسال')}</button>
            </div>
          </form>
        ) : selectedTicket ? (
          <TicketChat
            key={selectedTicket.id}
            ticket={selectedTicket}
            initialMessages={ticketMessages}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ) : (
          <EmptyState title={tx(active, 'Choose a request to read it.', 'اختر طلباً لقراءته.')} />
        )}
      </section>
    </div>
  )
}
