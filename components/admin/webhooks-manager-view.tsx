'use client'

import { useState, useTransition } from 'react'
import type { Client, SystemType, SystemWebhook, WebhookStatus } from '@/lib/schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  PlugZap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Shield,
  Save,
  Radio,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  ExternalLink,
  Info,
} from 'lucide-react'

interface SystemDefinition {
  systemType: SystemType
  name: string
  lane: 'core' | 'add_on' | 'preview'
  channel: string
  description: string
  b2bOnly?: boolean
  defaultPath: string
}

const ALL_SYSTEMS: SystemDefinition[] = [
  // Core Systems
  {
    systemType: 'missed_call_response',
    name: '1 · Missed-Call & Instant WhatsApp Responder',
    lane: 'core',
    channel: 'WhatsApp / Telephony',
    description: 'Runtime telephony missed-call listener → WA auto-triage → contact upsert.',
    defaultPath: '/webhook/missed-call',
  },
  {
    systemType: 'booking_receptionist',
    name: '2 · Voice / WA Receptionist + Cal.com',
    lane: 'core',
    channel: 'Vapi Voice + WhatsApp + Cal.com',
    description: 'Vapi tool server + Cal.com booking sync + automated reminder sequences.',
    defaultPath: '/webhook/receptionist',
  },
  {
    systemType: 'lead_reactivation',
    name: '4 · Automated Lead Reactivation',
    lane: 'core',
    channel: 'WhatsApp Marketing (Opt-in)',
    description: 'Cron segmentation + reactivation messaging sequences + reply triage router.',
    defaultPath: '/webhook/lead-reactivation',
  },
  {
    systemType: 'lead_attribution',
    name: '11 · Lead Qualification & Ad Attribution',
    lane: 'core',
    channel: 'Ad Forms / Landing Pages / WA',
    description: 'Multi-touch ad ingest → automated lead scoring → attribution telemetry.',
    defaultPath: '/webhook/attribution',
  },
  {
    systemType: 'ar_collections',
    name: '13 · AR Collections Engine (B2B Only)',
    lane: 'core',
    channel: 'WhatsApp + Voice (B2B Only)',
    description: 'Overdue commercial invoice dunning escalation with accounting ERP audit trail. Consumer debt collection is locked out.',
    b2bOnly: true,
    defaultPath: '/webhook/ar-collections',
  },
  // Add-ons (OSS Outcomes)
  {
    systemType: 'rival_watch',
    name: 'Rival Watch (Competitor Intelligence)',
    lane: 'add_on',
    channel: 'Web Scrapers + WhatsApp Alerts',
    description: 'Weekly competitor price and stock intelligence report on WhatsApp.',
    defaultPath: '/webhook/rival-watch',
  },
  {
    systemType: 'handbook_bot',
    name: 'Handbook Answers (Private Staff RAG)',
    lane: 'add_on',
    channel: 'Internal WhatsApp / Web Widget',
    description: 'Private staff SOP and corporate handbook question-answering assistant.',
    defaultPath: '/webhook/handbook-answers',
  },
  {
    systemType: 'seo_scorecard',
    name: 'Visibility Scorecard (Local SEO Audit)',
    lane: 'add_on',
    channel: 'Automated Monthly Audit',
    description: 'Monthly local search visibility audit and organic ranking signals.',
    defaultPath: '/webhook/seo-scorecard',
  },
  {
    systemType: 'deck_factory',
    name: 'Deck Factory (Automated Proposal PPTX)',
    lane: 'add_on',
    channel: 'CRM Action / Webhook',
    description: '8-field client discovery notes converted to branded editable PPTX proposal deck.',
    defaultPath: '/webhook/deck-factory',
  },
  // Preview
  {
    systemType: 'shorts_factory',
    name: 'Clip Factory (Video to Vertical Shorts)',
    lane: 'preview',
    channel: 'Media Pipeline',
    description: 'Long-form webinar/podcast ingest to captioned social shorts (Preview).',
    defaultPath: '/webhook/clip-factory',
  },
]

export function WebhooksManagerView({
  clients,
  initialWebhooks,
}: {
  clients: Client[]
  initialWebhooks: SystemWebhook[]
}) {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  )
  const [activeLaneTab, setActiveLaneTab] = useState<'all' | 'core' | 'add_on' | 'preview'>('all')
  const [webhooksState, setWebhooksState] = useState<Record<string, Partial<SystemWebhook>>>(() => {
    const map: Record<string, Partial<SystemWebhook>> = {}
    for (const w of initialWebhooks) {
      map[`${w.client_id}:${w.system_type}`] = w
    }
    return map
  })
  const [secretsState, setSecretsState] = useState<Record<string, string>>({})
  const [showSecretState, setShowSecretState] = useState<Record<string, boolean>>({})
  const [pingResults, setPingResults] = useState<Record<string, { status: string; message: string; latency?: number }>>({})
  const [saveStatus, setSaveStatus] = useState<Record<string, string>>({})
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeClient = clients.find(c => c.id === selectedClientId)

  const handleUrlChange = (systemType: SystemType, url: string) => {
    const key = `${selectedClientId}:${systemType}`
    setWebhooksState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        client_id: selectedClientId,
        system_type: systemType,
        webhook_url: url,
      },
    }))
  }

  const handleSecretChange = (systemType: SystemType, secret: string) => {
    const key = `${selectedClientId}:${systemType}`
    setSecretsState(prev => ({ ...prev, [key]: secret }))
  }

  const handleToggleEnabled = (systemType: SystemType, enabled: boolean) => {
    const key = `${selectedClientId}:${systemType}`
    setWebhooksState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        client_id: selectedClientId,
        system_type: systemType,
        enabled,
      },
    }))
  }

  const handleSave = (systemType: SystemType) => {
    const key = `${selectedClientId}:${systemType}`
    const current = webhooksState[key]
    const url = current?.webhook_url || ''
    const enabled = current?.enabled ?? true
    const secret = secretsState[key]

    setSaveStatus(prev => ({ ...prev, [key]: 'Applying...' }))

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/system-webhooks', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: selectedClientId,
            system_type: systemType,
            direction: 'helix_to_n8n',
            webhook_url: url,
            enabled,
            secret: secret && secret.trim().length > 0 ? secret.trim() : undefined,
          }),
        })

        const res = await response.json()

        if (response.ok && res.success && res.webhook) {
          setWebhooksState(prev => ({
            ...prev,
            [key]: { ...prev[key], ...res.webhook },
          }))
          // clear secret input once saved
          setSecretsState(prev => ({ ...prev, [key]: '' }))
          setSaveStatus(prev => ({ ...prev, [key]: 'Saved & Applied ✓' }))
          setTimeout(() => setSaveStatus(prev => ({ ...prev, [key]: '' })), 2500)
        } else {
          setSaveStatus(prev => ({ ...prev, [key]: `Error: ${res.error || 'Failed to save'}` }))
        }
      } catch (err: any) {
        setSaveStatus(prev => ({ ...prev, [key]: `Error: ${err.message}` }))
      }
    })
  }

  const handlePing = (systemType: SystemType) => {
    const key = `${selectedClientId}:${systemType}`
    const current = webhooksState[key]
    if (!current?.webhook_url) {
      setPingResults(prev => ({
        ...prev,
        [key]: { status: 'failed', message: 'Configure & save webhook URL first before pinging' },
      }))
      return
    }

    setPingResults(prev => ({
      ...prev,
      [key]: { status: 'pending', message: 'Sending signed ping probe...' },
    }))

    startTransition(async () => {
      try {
        const response = await fetch('/api/admin/system-webhooks/ping', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: selectedClientId,
            system_type: systemType,
            direction: 'helix_to_n8n',
            webhook_id: current.id,
          }),
        })

        const res = await response.json()
        if (response.ok && res.ok) {
          setPingResults(prev => ({
            ...prev,
            [key]: {
              status: 'ok',
              message: `Delivered (200 OK · ${res.latency_ms || 0}ms)`,
              latency: res.latency_ms,
            },
          }))
          setWebhooksState(prev => ({
            ...prev,
            [key]: { ...prev[key], last_status: 'ok', last_ping_at: new Date().toISOString() },
          }))
        } else {
          setPingResults(prev => ({
            ...prev,
            [key]: {
              status: 'failed',
              message: res.error || 'Endpoint did not return 2xx',
            },
          }))
          setWebhooksState(prev => ({
            ...prev,
            [key]: { ...prev[key], last_status: 'failed', last_ping_at: new Date().toISOString() },
          }))
        }
      } catch (err: any) {
        setPingResults(prev => ({
          ...prev,
          [key]: { status: 'failed', message: err.message || 'Network request failed' },
        }))
      }
    })
  }

  const handleCopyUrl = (key: string, url: string) => {
    if (!url) return
    navigator.clipboard.writeText(url)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const filteredSystems = ALL_SYSTEMS.filter(sys => {
    if (activeLaneTab === 'all') return true
    return sys.lane === activeLaneTab
  })

  return (
    <div className="w-full space-y-6">
      {/* Help Banner: Production vs Test URL */}
      <div className="flex items-start gap-3 rounded-[12px] border border-helix-border bg-helix-surface p-4 shadow-card">
        <Info className="size-5 shrink-0 text-helix-accent mt-0.5" />
        <div className="text-13 text-helix-muted">
          <span className="font-semibold text-ink">Important: </span>
          Paste the n8n <strong className="font-semibold text-ink">Production Webhook URL</strong> (<code className="rounded bg-helix-surface-2 px-1.5 py-0.5 text-12 font-mono text-ink">/webhook/...</code>), not the Test URL (<code className="rounded bg-helix-surface-2 px-1.5 py-0.5 text-12 font-mono text-helix-muted">/webhook-test/...</code>).
          Changes saved here are applied immediately to all live events. Helix automatically signs every request with HMAC-SHA256 headers.
        </div>
      </div>

      {/* Tenant Selector & Filter Bar */}
      <div className="flex flex-col gap-4 rounded-[14px] border border-helix-border bg-helix-surface p-4.5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-[8px] border border-helix-border bg-helix-surface-2 text-helix-accent">
            <PlugZap className="size-4" />
          </div>
          <div>
            <h2 className="text-14 font-semibold text-ink">n8n Production Webhook Registry</h2>
            <p className="text-12 text-helix-muted">
              Configure, rotate secrets, and ping outbound webhook endpoints per tenant
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-12 font-mono text-helix-muted">Workspace:</span>
            <select
              value={selectedClientId}
              onChange={e => setSelectedClientId(e.target.value)}
              className="h-8.5 rounded-[8px] border border-helix-border bg-helix-surface-2 px-3 text-12 font-medium text-ink focus:border-helix-accent focus:outline-none"
            >
              {clients.map(c => (
                <option key={c.id} value={c.id}>
                  {c.business_name} ({c.country || 'GCC'})
                </option>
              ))}
            </select>
          </div>

          {/* Lane Filter Tabs */}
          <div className="flex items-center rounded-[8px] border border-helix-border bg-helix-surface-2 p-0.5 text-12 font-medium">
            <button
              type="button"
              onClick={() => setActiveLaneTab('all')}
              className={cn(
                'rounded-[6px] px-2.5 py-1 transition-all',
                activeLaneTab === 'all' ? 'bg-helix-surface text-ink shadow-2xs font-semibold' : 'text-helix-muted hover:text-ink'
              )}
            >
              All (10)
            </button>
            <button
              type="button"
              onClick={() => setActiveLaneTab('core')}
              className={cn(
                'rounded-[6px] px-2.5 py-1 transition-all',
                activeLaneTab === 'core' ? 'bg-helix-surface text-ink shadow-2xs font-semibold' : 'text-helix-muted hover:text-ink'
              )}
            >
              Core (5)
            </button>
            <button
              type="button"
              onClick={() => setActiveLaneTab('add_on')}
              className={cn(
                'rounded-[6px] px-2.5 py-1 transition-all',
                activeLaneTab === 'add_on' ? 'bg-helix-surface text-ink shadow-2xs font-semibold' : 'text-helix-muted hover:text-ink'
              )}
            >
              Add-ons (4)
            </button>
            <button
              type="button"
              onClick={() => setActiveLaneTab('preview')}
              className={cn(
                'rounded-[6px] px-2.5 py-1 transition-all',
                activeLaneTab === 'preview' ? 'bg-helix-surface text-ink shadow-2xs font-semibold' : 'text-helix-muted hover:text-ink'
              )}
            >
              Preview (1)
            </button>
          </div>
        </div>
      </div>

      {/* Systems Webhooks List */}
      <div className="space-y-4">
        {filteredSystems.map(sys => {
          const key = `${selectedClientId}:${sys.systemType}`
          const webhook = webhooksState[key]
          const isEnabled = webhook?.enabled ?? true
          const pingInfo = pingResults[key]
          const status = webhook?.last_status || 'unknown'
          const saveMsg = saveStatus[key]
          const showSecret = showSecretState[key] ?? false
          const enteredSecret = secretsState[key] || ''

          return (
            <div
              key={sys.systemType}
              className="rounded-[14px] border border-helix-border bg-helix-surface p-4.5 shadow-card transition-colors hover:border-helix-border-strong"
            >
              {/* Header row */}
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-14 font-semibold text-ink">{sys.name}</h3>
                    <span
                      className={cn(
                        'rounded-[6px] px-2 py-0.5 text-[10px] font-mono font-medium uppercase',
                        sys.lane === 'core'
                          ? 'border border-helix-accent/25 bg-helix-accent-soft text-helix-accent font-semibold'
                          : sys.lane === 'add_on'
                          ? 'border border-helix-border bg-helix-surface-2 text-helix-muted'
                          : 'border border-dashed border-helix-border bg-helix-surface-2 text-helix-subtle'
                      )}
                    >
                      {sys.lane === 'core' ? 'Core System' : sys.lane === 'add_on' ? 'Add-On Pack' : 'Preview'}
                    </span>
                    {sys.b2bOnly && (
                      <span className="rounded-[6px] border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-medium uppercase text-amber-800">
                        B2B Only
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-12 text-helix-muted">{sys.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono text-helix-subtle">
                    <span>Channel: {sys.channel}</span>
                    <span>·</span>
                    <span>system_type: <code className="text-ink">{sys.systemType}</code></span>
                    <span>·</span>
                    <span>Direction: <code className="text-ink">helix_to_n8n</code></span>
                  </div>
                </div>

                {/* Status chip & toggle */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1.5">
                    {status === 'ok' || status === 'healthy' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-helix-accent/20 bg-helix-accent-soft px-2.5 py-0.5 text-11 font-mono font-semibold text-helix-accent">
                        <CheckCircle2 className="size-3 text-helix-accent" />
                        ok
                      </span>
                    ) : status === 'failed' ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-300 bg-rose-50 px-2.5 py-0.5 text-11 font-mono font-semibold text-rose-700">
                        <XCircle className="size-3 text-rose-600" />
                        failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-helix-border bg-helix-surface-2 px-2.5 py-0.5 text-11 font-mono text-helix-muted">
                        <span className="size-1.5 rounded-full bg-helix-muted" />
                        unknown
                      </span>
                    )}
                    {webhook?.last_ping_at && (
                      <span className="text-[10px] font-mono text-helix-subtle">
                        {new Date(webhook.last_ping_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer text-12 font-medium text-ink">
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={e => handleToggleEnabled(sys.systemType, e.target.checked)}
                      className="size-4 rounded border-helix-border text-helix-accent focus:ring-helix-accent"
                    />
                    Enabled
                  </label>
                </div>
              </div>

              {/* Form Controls: Production Webhook URL + Secret */}
              <div className="mt-4 space-y-3 pt-3 border-t border-helix-border">
                {/* Webhook URL Input */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Input
                      type="url"
                      placeholder={`https://n8n.your-agency.com${sys.defaultPath}`}
                      value={webhook?.webhook_url || ''}
                      onChange={e => handleUrlChange(sys.systemType, e.target.value)}
                      className="h-8.5 w-full font-mono text-12 text-ink bg-helix-surface-2 border-helix-border focus:border-helix-accent focus:bg-helix-surface"
                    />
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyUrl(key, webhook?.webhook_url || '')}
                      disabled={!webhook?.webhook_url}
                      className="h-8.5 border-helix-border bg-helix-surface text-12 text-ink hover:bg-helix-surface-2 font-medium"
                      title="Copy URL"
                    >
                      {copiedKey === key ? (
                        <>
                          <Check className="size-3.5 mr-1 text-helix-accent" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5 mr-1 text-helix-muted" />
                          Copy URL
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="accent"
                      onClick={() => handleSave(sys.systemType)}
                      disabled={isPending}
                      className="h-8.5 bg-helix-accent text-white hover:bg-helix-accent/90 text-12 font-medium shadow-2xs"
                    >
                      <Save className="size-3.5 mr-1.5" />
                      Save & apply
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => handlePing(sys.systemType)}
                      disabled={isPending}
                      className="h-8.5 border-helix-border bg-helix-surface text-ink hover:bg-helix-surface-2 text-12 font-medium"
                    >
                      <Radio className="size-3.5 mr-1.5 text-helix-accent" />
                      Ping
                    </Button>
                  </div>
                </div>

                {/* Secret Rotation Input */}
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 max-w-md">
                    <Input
                      type={showSecret ? 'text' : 'password'}
                      placeholder={webhook?.secret_hash || (webhook as any)?.has_secret ? '•••••••••••• (Leave blank to keep current secret)' : 'Enter webhook secret (or leave blank for default)'}
                      value={enteredSecret}
                      onChange={e => handleSecretChange(sys.systemType, e.target.value)}
                      className="h-8 pr-8 font-mono text-11 bg-helix-surface-2 border-helix-border text-ink focus:border-helix-accent focus:bg-helix-surface"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecretState(prev => ({ ...prev, [key]: !showSecret }))}
                      className="absolute right-2.5 top-2 text-helix-subtle hover:text-ink"
                      title={showSecret ? 'Hide' : 'Show'}
                    >
                      {showSecret ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                    </button>
                  </div>
                  <span className="text-[11px] font-mono text-helix-subtle">
                    {webhook?.secret_hash || (webhook as any)?.has_secret ? 'Secret configured ✓' : 'Using global secret'}
                  </span>
                </div>
              </div>

              {/* Ping & Save Feedback Line */}
              {(saveMsg || pingInfo) && (
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-helix-border pt-2">
                  {saveMsg && (
                    <span className={cn(saveMsg.startsWith('Error') ? 'text-helix-danger font-semibold' : 'text-helix-accent font-semibold')}>
                      {saveMsg}
                    </span>
                  )}
                  {pingInfo && (
                    <span
                      className={cn(
                        'ml-auto',
                        pingInfo.status === 'ok' || pingInfo.status === 'healthy' ? 'text-helix-accent font-semibold' : 'text-helix-danger font-semibold'
                      )}
                    >
                      {pingInfo.message}
                    </span>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
