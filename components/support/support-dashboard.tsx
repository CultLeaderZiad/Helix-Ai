'use client'

import { useState } from 'react'
import { TicketChat } from './ticket-chat'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, MessageSquare } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import type { SupportTicket, SupportMessage } from '@/lib/schema'

interface SupportDashboardProps {
  initialTickets: (SupportTicket & { clientName?: string })[]
  allMessages: (SupportMessage & { senderName?: string })[]
  currentUserId: string
  clientId: string | null
  isAdmin: boolean
}

export function SupportDashboard({ initialTickets, allMessages, currentUserId, clientId, isAdmin }: SupportDashboardProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [messages, setMessages] = useState(allMessages)
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(initialTickets[0]?.id ?? null)
  const [isCreating, setIsCreating] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const supabase = createSupabaseBrowserClient()

  const selectedTicket = tickets.find(t => t.id === selectedTicketId)
  const ticketMessages = messages.filter(m => m.ticket_id === selectedTicketId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault()
    if (!newSubject.trim() || (!clientId && !isAdmin)) return // Admins shouldn't normally create tickets, but just in case.

    const { data, error } = await supabase.from('support_tickets').insert({
      client_id: clientId!,
      subject: newSubject.trim(),
      status: 'open',
      unread_by_admin: true,
      unread_by_client: false
    }).select().single()

    if (error) {
      console.error(error)
      return
    }

    setTickets([data as SupportTicket, ...tickets])
    setSelectedTicketId(data.id)
    setIsCreating(false)
    setNewSubject('')
  }

  return (
    <div className="grid h-[calc(100vh-12rem)] grid-cols-1 overflow-hidden rounded-xl border border-border bg-panel md:grid-cols-3">
      {/* Sidebar */}
      <div className="flex flex-col border-r border-border bg-background/50">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="font-display text-h4">Tickets</h2>
          {!isAdmin && (
            <Button size="sm" onClick={() => setIsCreating(true)}>
              <Plus className="mr-2 size-4" />
              New
            </Button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.map(ticket => (
            <button
              key={ticket.id}
              onClick={() => {
                setSelectedTicketId(ticket.id)
                setIsCreating(false)
              }}
              className={`w-full border-b p-4 text-left transition-colors hover:bg-raised ${
                selectedTicketId === ticket.id ? 'bg-raised' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-medium line-clamp-1">{ticket.subject}</span>
                {((isAdmin && ticket.unread_by_admin) || (!isAdmin && ticket.unread_by_client)) && (
                  <span className="size-2 rounded-full bg-accent mt-1 shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                <span className={ticket.status === 'open' ? 'text-status-success' : ''}>{ticket.status}</span>
              </div>
            </button>
          ))}
          {tickets.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No tickets found.
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-2 flex flex-col bg-panel">
        {isCreating ? (
          <div className="flex h-full items-center justify-center p-8">
            <form onSubmit={handleCreateTicket} className="w-full max-w-md space-y-4 rounded-xl border bg-background p-6">
              <h3 className="font-display text-h3">New Support Ticket</h3>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                <Input
                  autoFocus
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  placeholder="E.g., Issue with billing"
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!newSubject.trim()}>
                  Create Ticket
                </Button>
              </div>
            </form>
          </div>
        ) : selectedTicket ? (
          <TicketChat
            key={selectedTicket.id}
            ticket={selectedTicket}
            initialMessages={ticketMessages}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="mb-4 size-12 opacity-20" />
            <p>Select a ticket to view messages</p>
          </div>
        )}
      </div>
    </div>
  )
}
