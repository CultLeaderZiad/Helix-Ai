'use client'

import { useEffect, useState, createContext, useContext } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface RealtimeContextValue {
  connected: boolean
  lastEventAt: Date | null
  eventCount: number
}

const RealtimeContext = createContext<RealtimeContextValue>({
  connected: false,
  lastEventAt: null,
  eventCount: 0,
})

export function useRealtime() {
  return useContext(RealtimeContext)
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false)
  const [lastEventAt, setLastEventAt] = useState<Date | null>(null)
  const [eventCount, setEventCount] = useState(0)

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null
    const supabase = createSupabaseBrowserClient()

    try {
      // Connect to authoritative Supabase Realtime channel for live telemetry
      channel = supabase
        .channel('helix-realtime-telemetry')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'client_integrations' },
          () => {
            setLastEventAt(new Date())
            setEventCount(prev => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'contact_facts' },
          () => {
            setLastEventAt(new Date())
            setEventCount(prev => prev + 1)
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'attention_queue' },
          () => {
            setLastEventAt(new Date())
            setEventCount(prev => prev + 1)
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true)
          } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            setConnected(false)
          }
        })
    } catch {
      // Graceful fallback if Realtime is unavailable
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  return (
    <RealtimeContext.Provider value={{ connected, lastEventAt, eventCount }}>
      {children}
    </RealtimeContext.Provider>
  )
}
