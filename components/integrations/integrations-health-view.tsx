'use client'

import { useState, useTransition, useEffect } from 'react'
import { PlugZap, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, PhoneCall, Webhook, Loader2 } from 'lucide-react'
import type { ClientIntegration } from '@/lib/schema'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface IntegrationsHealthViewProps {
  initialIntegrations: ClientIntegration[]
  pingAction: () => Promise<{ success?: boolean; error?: string; message?: string }>
}

const SYSTEM_METADATA: Record<string, { name: string; icon: typeof MessageSquare; details: string }> = {
  missed_call_response: {
    name: 'Missed-call channel',
    icon: MessageSquare,
    details: 'Not connected until a webhook URL is saved and answers a ping.',
  },
  booking_receptionist: {
    name: 'Booking channel',
    icon: PhoneCall,
    details: 'Voice provider is not connected from this screen.',
  },
  lead_attribution: {
    name: 'Workflow webhook',
    icon: Webhook,
    details: 'Shows connected only after an enabled webhook URL responds.',
  },
}

export function IntegrationsHealthView({ initialIntegrations, pingAction }: IntegrationsHealthViewProps) {
  const [integrations, setIntegrations] = useState<ClientIntegration[]>(initialIntegrations)
  const [isPending, startTransition] = useTransition()
  const [pingMessage, setPingMessage] = useState<string | null>(null)
  const [pingOk, setPingOk] = useState(false)

  // Realtime subscription using .channel() on client_integrations
  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel('realtime:client_integrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_integrations' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ClientIntegration
            setIntegrations(prev => prev.map(item => item.id === updated.id ? updated : item))
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as ClientIntegration
            setIntegrations(prev => [...prev, inserted])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handlePing = () => {
    setPingMessage(null)
    startTransition(async () => {
      const res = await pingAction()
      if (res.success) {
        setPingOk(true)
        setPingMessage(res.message || 'Webhook URLs that responded were marked connected.')
      } else {
        setPingOk(false)
        setPingMessage(res.error || 'Failed to ping endpoints.')
      }
    })
  }

  const formatLastPing = (lastPing: string | null) => {
    if (!lastPing) return 'Never'
    const diff = Math.floor((Date.now() - new Date(lastPing).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return new Date(lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-helix-border bg-helix-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-helix-accent">
            <PlugZap className="size-3.5" /> Channel Telemetry
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-helix-ink sm:text-4xl">
            Integration Health
          </h1>
          <p className="mt-1 text-sm text-helix-muted">
            Status of connected WhatsApp, voice, and workflow channels.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePing}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-helix-border bg-helix-canvas px-4 py-2 text-xs font-semibold text-helix-ink hover:bg-helix-border/40 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-helix-accent" /> Pinging Endpoints...
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5" /> Ping All Endpoints
            </>
          )}
        </button>
      </div>

      {pingMessage && (
        <div
          className={`mt-4 flex items-center gap-2 rounded-xl border p-3 text-xs ${
            pingOk
              ? 'border-helix-border bg-helix-accent-soft text-helix-accent'
              : 'border-status-danger/40 bg-status-danger/10 text-foreground'
          }`}
        >
          {pingOk ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          <span>{pingMessage}</span>
        </div>
      )}

      {integrations.length === 0 ? (
        <p className="mt-8 text-sm text-helix-muted">
          No integration rows yet. Not connected.
          <span className="mt-1 block" dir="rtl" lang="ar">لا توجد قنوات بعد. غير موصول.</span>
        </p>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map(int => {
          const meta = SYSTEM_METADATA[int.system_type] || {
            name: int.system_type.replace(/_/g, ' ').toUpperCase(),
            icon: Webhook,
            details: 'No provider is connected for this row.',
          }
          const Icon = meta.icon
          const isConnected = int.status === 'connected'

          return (
            <div key={int.id} className="rounded-2xl border border-helix-border bg-helix-surface p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-helix-accent-soft text-helix-accent ring-1 ring-helix-accent/20">
                  <Icon className="size-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    isConnected
                      ? 'border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 text-[#0B6E4F]'
                      : 'border border-amber-600/30 bg-amber-500/10 text-amber-700'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isConnected ? 'bg-[#0B6E4F] animate-pulse' : 'bg-amber-600'}`} />
                  {isConnected ? 'Connected' : int.status}
                </span>
              </div>

              <h2 className="mt-4 font-display text-base font-bold text-helix-ink">{meta.name}</h2>
              <p className="mt-1 text-xs text-helix-muted leading-relaxed">{meta.details}</p>

              <div className="mt-4 border-t border-helix-border/80 pt-3 flex items-center justify-between text-xs text-helix-muted">
                <span>Latency: <strong className="text-helix-ink font-mono">Not measured</strong></span>
                <span>Ping: {formatLastPing(int.last_ping_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
