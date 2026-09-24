'use client'

import { useState, useTransition, useEffect } from 'react'
import { PlugZap, CheckCircle2, AlertCircle, RefreshCw, MessageSquare, PhoneCall, Webhook, Loader2 } from 'lucide-react'
import type { ClientIntegration } from '@/lib/schema'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface IntegrationsHealthViewProps {
  initialIntegrations: ClientIntegration[]
  pingAction: () => Promise<{ success?: boolean; error?: string }>
}

const SYSTEM_METADATA: Record<string, { name: string; icon: typeof MessageSquare; details: string }> = {
  missed_call_response: {
    name: 'WhatsApp Business Cloud API',
    icon: MessageSquare,
    details: 'Meta Cloud API • Inbound and outbound message channel',
  },
  booking_receptionist: {
    name: 'Voice Telephony Engine',
    icon: PhoneCall,
    details: 'Bidirectional audio streaming receptionist pipeline',
  },
  lead_attribution: {
    name: 'Workflow Automation Webhook',
    icon: Webhook,
    details: 'Inbound dispatch and CRM synchronization endpoint',
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
        setPingMessage('All integration endpoints responded successfully.')
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
    if (!lastPing) return 'Never pinged'
    const diff = Math.floor((Date.now() - new Date(lastPing).getTime()) / 1000)
    if (diff < 60) return `${diff}s ago`
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    return new Date(lastPing).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Badge variant="default" className="font-mono text-[11px] uppercase tracking-wider">
            Channel Telemetry
          </Badge>
          <h1 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Integration Health
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Status of configured WhatsApp, voice, and workflow automation channels.
          </p>
        </div>

        <Button
          type="button"
          onClick={handlePing}
          disabled={isPending}
          size="sm"
          className="gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Verifying Endpoints...</span>
            </>
          ) : (
            <>
              <RefreshCw className="size-3.5" />
              <span>Verify Health</span>
            </>
          )}
        </Button>
      </div>

      {pingMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-raised p-3 text-xs text-foreground">
          <CheckCircle2 className="size-4 shrink-0 text-accent" />
          <span>{pingMessage}</span>
        </div>
      )}

      {integrations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
          <PlugZap className="size-12 text-accent stroke-[1.5]" />
          <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
            No integrations provisioned
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Configured channels and telephony connectors will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map(int => {
            const meta = SYSTEM_METADATA[int.system_type] || {
              name: int.system_type.replace(/_/g, ' ').toUpperCase(),
              icon: Webhook,
              details: 'Configured system integration endpoint',
            }
            const Icon = meta.icon
            const isConnected = int.status === 'connected'

            return (
              <div key={int.id} className="rounded-xl border border-border bg-panel p-5">
                <div className="flex items-start justify-between">
                  <Icon className="size-5 text-accent stroke-[1.5]" />
                  <Badge
                    variant={isConnected ? 'verified' : int.status === 'degraded' ? 'probable' : 'default'}
                    dot
                  >
                    {int.status.toUpperCase()}
                  </Badge>
                </div>

                <h2 className="mt-4 font-display text-base font-semibold text-foreground">{meta.name}</h2>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{meta.details}</p>

                <div className="mt-4 border-t border-border pt-3 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last verified:</span>
                  <span className="font-mono text-foreground">{formatLastPing(int.last_ping_at)}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
