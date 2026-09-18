'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell } from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

export function NotificationBell({ isAdmin, clientId }: { isAdmin: boolean; clientId?: string | null }) {
  const [hasUnread, setHasUnread] = useState(false)
  const supabase = (() => {
    try {
      return createSupabaseBrowserClient()
    } catch {
      return null
    }
  })()

  useEffect(() => {
    if (!supabase) return
    const client = supabase

    async function checkUnread() {
      let query = client.from('support_tickets').select('id', { count: 'exact', head: true })
      
      if (isAdmin) {
        query = query.eq('unread_by_admin', true)
      } else if (clientId) {
        query = query.eq('client_id', clientId).eq('unread_by_client', true)
      } else {
        return
      }

      const { count } = await query
      if (count && count > 0) {
        setHasUnread(true)
      }
    }

    checkUnread()

    const filter = isAdmin ? `unread_by_admin=eq.true` : `client_id=eq.${clientId}`
    
    const channel = client
      .channel('public:support_tickets')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'support_tickets', filter },
        (payload) => {
          const ticket = payload.new as any
          if (isAdmin) {
            setHasUnread(ticket.unread_by_admin === true)
          } else {
            setHasUnread(ticket.unread_by_client === true)
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'support_tickets' },
        () => {
          if (isAdmin) setHasUnread(true)
        }
      )
      .subscribe()

    return () => {
      client.removeChannel(channel)
    }
  }, [supabase, isAdmin, clientId])

  const href = isAdmin ? '/admin/support' : '/dashboard/support'

  return (
    <Link
      href={href}
      className="relative flex size-8 items-center justify-center rounded-[10px] text-helix-muted hover:bg-helix-canvas hover:text-helix-ink transition-colors"
    >
      <Bell className="size-4" />
      {hasUnread && (
        <span className="absolute right-2 top-2 size-2 rounded-full bg-status-danger ring-2 ring-helix-surface" />
      )}
    </Link>
  )
}
