'use client'

import { useState, useEffect, useRef } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send, CheckCircle } from 'lucide-react'
import type { SupportTicket, SupportMessage } from '@/lib/schema'

interface TicketChatProps {
  ticket: SupportTicket & { clientName?: string }
  initialMessages: (SupportMessage & { senderName?: string })[]
  currentUserId: string
  isAdmin: boolean
}

export function TicketChat({ ticket, initialMessages, currentUserId, isAdmin }: TicketChatProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isResolving, setIsResolving] = useState(false)
  const supabase = createSupabaseBrowserClient()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const channel = supabase
      .channel(`ticket:${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_messages',
          filter: `ticket_id=eq.${ticket.id}`,
        },
        async (payload) => {
          const newMsg = payload.new as SupportMessage
          // fetch sender name if needed, or just append
          if (newMsg.sender_profile_id !== currentUserId) {
            const { data } = await supabase.from('profiles').select('full_name').eq('id', newMsg.sender_profile_id).single()
            setMessages((prev) => [...prev, { ...newMsg, senderName: data?.full_name || 'Unknown' }])
            // Mark as read
            await supabase.from('support_tickets').update({
              [isAdmin ? 'unread_by_admin' : 'unread_by_client']: false
            }).eq('id', ticket.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [ticket.id, supabase, currentUserId, isAdmin])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim()) return

    const body = newMessage.trim()
    setNewMessage('')

    // Optimistic insert
    const tempMsg: SupportMessage & { senderName: string } = {
      id: crypto.randomUUID(),
      ticket_id: ticket.id,
      client_id: ticket.client_id,
      sender_profile_id: currentUserId,
      body,
      created_at: new Date().toISOString(),
      senderName: 'You'
    }
    setMessages((prev) => [...prev, tempMsg])

    await supabase.from('support_messages').insert({
      ticket_id: ticket.id,
      client_id: ticket.client_id,
      body,
      sender_profile_id: currentUserId
    })

    await supabase.from('support_tickets').update({
      [isAdmin ? 'unread_by_client' : 'unread_by_admin']: true
    }).eq('id', ticket.id)
  }

  async function handleResolve() {
    setIsResolving(true)
    await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', ticket.id)
    setIsResolving(false)
    window.location.reload()
  }

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border bg-panel">
      <div className="flex items-center justify-between border-b p-4">
        <div>
          <h3 className="font-display text-h4">{ticket.subject}</h3>
          {isAdmin && ticket.clientName && (
            <p className="text-xs text-muted-foreground">Client: {ticket.clientName}</p>
          )}
          <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
            ticket.status === 'open' ? 'bg-status-success/10 text-status-success' : 'bg-raised text-muted-foreground'
          }`}>
            {ticket.status.toUpperCase()}
          </span>
        </div>
        {isAdmin && ticket.status === 'open' && (
          <Button variant="outline" size="sm" onClick={handleResolve} disabled={isResolving}>
            <CheckCircle className="mr-2 size-4" />
            Mark Resolved
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isMe = msg.sender_profile_id === currentUserId
          return (
            <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div className="mb-1 text-xs text-muted-foreground">
                {isMe ? 'You' : (msg.senderName || 'Unknown')}
              </div>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${
                  isMe ? 'bg-accent text-accent-foreground' : 'bg-raised text-foreground'
                }`}
              >
                {msg.body}
              </div>
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </div>

      {ticket.status === 'open' && (
        <form onSubmit={handleSend} className="border-t p-4 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!newMessage.trim()}>
            <Send className="size-4" />
          </Button>
        </form>
      )}
    </div>
  )
}
