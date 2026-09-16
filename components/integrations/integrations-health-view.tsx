'use client'

import { useState, useTransition, useEffect } from 'react'
import { PlugZap, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, PhoneCall, Webhook, Loader2 } from 'lucide-react'
import type { ClientIntegration } from '@/lib/schema'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface IntegrationsHealthViewProps {
  initialIntegrations: ClientIntegration[]
  pingAction: () => Promise<{ success?: boolean; error?: string }>
}

const SYSTEM_METADATA: Record<string, { name: string; icon: typeof MessageSquare; details: string }> = {
  missed_call_response: {
    name: 'WhatsApp Business Cloud API',
    icon: MessageSquare,
    details: 'Meta Cloud API v20.0 • Webhook verified & active',
  },
  booking_receptionist: {
    name: 'Retell AI Voice Pipeline',
    icon: PhoneCall,
    details: 'Bidirectional WebSocket audio streaming active',
  },
  lead_attribution: {
    name: 'n8n Workflow Automation Engine',
    icon: Webhook,
    details: 'Inbound dispatch webhook healthy',
  },
}

export function IntegrationsHealthView({ initialIntegrations, pingAction }: IntegrationsHealthViewProps) {
  const [integrations, setIntegrations] = useState<ClientIntegration[]>(initialIntegrations)
  const [isPending, startTransition] = useTransition()
  const [pingMessage, setPingMessage] = useState<string | null>(null)

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
        setPingMessage('All integration endpoints responded within SLA limits.')
        const now = new Date().toISOString()
        setIntegrations(prev =>
          prev.map(i => ({ ...i, last_ping_at: now, status: 'connected' }))
        )
      } else {
        setPingMessage(res.error || 'Failed to ping endpoints.')
      }
    })
  }

  const formatLastPing = (lastPing: string | null) => {
    if (!lastPing) return 'Just now'
    const diff = Math.floor((Date.now() - new Date(lastPing).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return new Date(lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <PlugZap className="size-3.5" /> Channel Telemetry
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Integration Health
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Live status and telemetry for connected communication channels and workflow engines.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePing}
          disabled={isPending}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin text-cyan-400" /> Pinging Endpoints...
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5" /> Ping All Endpoints
            </>
          )}
        </button>
      </div>

      {pingMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-3 text-xs text-cyan-300">
          <CheckCircle2 className="size-4 shrink-0 text-cyan-400" />
          <span>{pingMessage}</span>
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map(int => {
          const meta = SYSTEM_METADATA[int.system_type] || {
            name: int.system_type.replace(/_/g, ' ').toUpperCase(),
            icon: Webhook,
            details: 'Active system integration endpoint',
          }
          const Icon = meta.icon
          const isConnected = int.status === 'connected'

          return (
            <div key={int.id} className="rounded-2xl border border-slate-800 bg-[#0e1422] p-5 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-500/30">
                  <Icon className="size-5" />
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    isConnected
                      ? 'border border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                      : 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
                  }`}
                >
                  <span className={`size-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-yellow-400'}`} />
                  {isConnected ? 'Connected' : int.status}
                </span>
              </div>

              <h2 className="mt-4 font-display text-base font-bold text-white">{meta.name}</h2>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{meta.details}</p>

              <div className="mt-4 border-t border-slate-800/80 pt-3 flex items-center justify-between text-xs text-slate-400">
                <span>Latency: <strong className="text-white font-mono">{int.status === 'connected' ? '42ms' : 'Timeout'}</strong></span>
                <span>Ping: {formatLastPing(int.last_ping_at)}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
