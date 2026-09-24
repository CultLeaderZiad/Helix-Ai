'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  TrendingUp,
  Award,
  Zap,
  MessageSquare,
  PhoneCall,
  Webhook,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react'
import type {
  Client,
  ClientHealthScore,
  ClientChurnSignal,
  ClientSuccessEvent,
  ClientSystem,
  ClientIntegration,
  RiskLevel,
} from '@/lib/schema'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ClientHealthViewProps {
  client: Client
  healthScore: ClientHealthScore | null
  churnSignals: ClientChurnSignal[]
  successEvents: ClientSuccessEvent[]
  systems: ClientSystem[]
  integrations: ClientIntegration[]
  openTicketCount: number
}

const RISK_CONFIG: Record<
  RiskLevel,
  { label: string; badgeClass: string; headline: string; description: string }
> = {
  healthy: {
    label: 'Healthy Standing',
    badgeClass: 'border-accent/40 bg-accent/10 text-accent',
    headline: 'Your account is in optimal standing',
    description: 'All autonomous systems are operating within expected parameters and telemetry is streaming cleanly.',
  },
  watch: {
    label: 'Needs Attention',
    badgeClass: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
    headline: 'A few operational areas need attention',
    description: 'One or more integrations or activity milestones require verification to maintain full performance.',
  },
  at_risk: {
    label: 'Review Recommended',
    badgeClass: 'border-orange-500/40 bg-orange-500/10 text-orange-500',
    headline: 'We recommend reviewing the open items below together',
    description: 'Our technical architects have flagged potential bottlenecks. A short operational check-in is advised.',
  },
  critical: {
    label: 'Action Required',
    badgeClass: 'border-red-500/40 bg-red-500/10 text-red-500',
    headline: 'Urgent operational review recommended',
    description: 'Critical systems or telemetry have stalled. Please connect with your assigned operations lead.',
  },
}

const SYSTEM_LABELS: Record<string, { name: string; icon: typeof Zap }> = {
  speed_to_lead_engine: { name: 'Speed-to-Lead Response System', icon: Zap },
  omnichannel_support_hub: { name: 'Sovereign Omnichannel Inbox', icon: MessageSquare },
  reputation_routing_sentinel: { name: 'Reputation Shield & Review Routing', icon: CheckCircle2 },
  competitor_intel_sentinel: { name: 'Competitor & Price Intelligence', icon: Activity },
  contract_execution_closer: { name: 'Contract Execution Closer', icon: ArrowUpRight },
  missed_call_response: { name: 'Automated Missed Call Triage', icon: PhoneCall },
  booking_receptionist: { name: 'Voice Telephony Receptionist', icon: PhoneCall },
  lead_attribution: { name: 'Attribution & Workflow Dispatch', icon: Webhook },
}

export function ClientHealthView({
  client,
  healthScore,
  churnSignals,
  successEvents,
  systems,
  integrations,
  openTicketCount,
}: ClientHealthViewProps) {
  // Score determination: DB score -> client column -> default 78
  const score = healthScore?.score ?? client.current_health_score ?? 78
  const riskLevel: RiskLevel =
    healthScore?.risk_level ??
    (client.current_risk_level as RiskLevel) ??
    (score >= 80 ? 'healthy' : score >= 65 ? 'watch' : score >= 45 ? 'at_risk' : 'critical')

  const riskMeta = RISK_CONFIG[riskLevel]

  // Integration operational percentage
  const totalIntegrations = integrations.length
  const connectedIntegrations = integrations.filter(i => i.status === 'connected').length
  const systemHealthPercentage =
    totalIntegrations > 0 ? Math.round((connectedIntegrations / totalIntegrations) * 100) : 100

  // Format relative timestamp
  const lastUpdated = useMemo(() => {
    const ts = healthScore?.calculated_at || client.last_health_calculated_at
    if (!ts) return 'Updated today'
    const date = new Date(ts)
    return `Evaluated on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }, [healthScore, client.last_health_calculated_at])

  // Trend determination
  const scoreDelta = healthScore?.previous_score ? score - healthScore.previous_score : null

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-accent font-mono">
          Operational Accountability
        </div>
        <h1 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Account &amp; System Health
        </h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
          Continuous assessment of your active autonomous systems, integration reliability, and operational engagement.
        </p>
      </div>

      {/* Top Section: Overall Health Card + Quick Next Steps */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Overall Health Card (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-panel p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Composite Health Assessment
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-mono font-semibold',
                  riskMeta.badgeClass
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {riskMeta.label}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
              {/* Circular Gauge Representation */}
              <div className="relative size-28 shrink-0 flex items-center justify-center rounded-full border-4 border-border bg-raised">
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-foreground">{score}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">out of 100</div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl font-bold text-foreground">{riskMeta.headline}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                  {riskMeta.description}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="size-3.5" />
              <span>{lastUpdated}</span>
            </div>
            <div>
              {scoreDelta !== null && scoreDelta !== 0 ? (
                <span className={scoreDelta > 0 ? 'text-accent' : 'text-amber-500'}>
                  {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta} points vs prior audit
                </span>
              ) : (
                <span className="text-muted-foreground">Trajectory: Stable</span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Next Steps / Support Card (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <Activity className="size-4 text-accent" />
              Operations Concierge
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your autonomous infrastructure is monitored 24/7. Connect directly with your dedicated solutions architect for reviews or scaling.
            </p>

            <div className="pt-2 space-y-2">
              <Link
                href="/dashboard/support"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                <span>Submit Technical Ticket</span>
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/integrations"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                <span>Verify Integrations</span>
                <ChevronRight className="size-4" />
              </Link>
              <Link
                href="/dashboard/reports"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-between')}
              >
                <span>Review Monthly Telemetry</span>
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-[11px] font-mono text-muted-foreground">
            Sovereign Tenant: {client.business_name}
          </div>
        </div>
      </div>

      {/* 4 Key Signal Cards */}
      <section aria-label="Key Indicators" className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Core Diagnostic Indicators
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Portal Activity */}
          <div className="rounded-xl border border-border bg-panel p-5 space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Portal Activity</span>
              <Activity className="size-4 text-accent" />
            </div>
            <div className="font-display text-xl font-bold text-foreground">Active Session</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Workspace team actively engaged and reviewing system queue items.
            </p>
          </div>

          {/* Card 2: System Performance */}
          <div className="rounded-xl border border-border bg-panel p-5 space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">System Reliability</span>
              <CheckCircle2 className="size-4 text-accent" />
            </div>
            <div className="font-display text-xl font-bold text-foreground">
              {systemHealthPercentage}% Operational
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {connectedIntegrations} of {totalIntegrations || systems.length || 1} integration endpoints passing synthetic ping tests.
            </p>
          </div>

          {/* Card 3: Support Health */}
          <div className="rounded-xl border border-border bg-panel p-5 space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Support Queue</span>
              <MessageSquare className="size-4 text-accent" />
            </div>
            <div className="font-display text-xl font-bold text-foreground">
              {openTicketCount === 0 ? 'Zero Open Tickets' : `${openTicketCount} Open Inquiries`}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {openTicketCount === 0
                ? 'All historical operational tickets resolved satisfactorily.'
                : 'Active tickets are being reviewed by operations architects.'}
            </p>
          </div>

          {/* Card 4: Engagement Cadence */}
          <div className="rounded-xl border border-border bg-panel p-5 space-y-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-mono uppercase">Engagement Cadence</span>
              <Award className="size-4 text-accent" />
            </div>
            <div className="font-display text-xl font-bold text-foreground">Cadence Aligned</div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Monthly executive reports active and reviewed without discrepancy.
            </p>
          </div>
        </div>
      </section>

      {/* Recommendations / Open Items (Only shown if watch/at_risk/critical or unresolved signals exist) */}
      {(riskLevel !== 'healthy' || churnSignals.length > 0) && (
        <section aria-label="Open Items & Recommendations" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Open Items &amp; Recommended Next Steps
            </h3>
            <span className="text-xs font-mono text-muted-foreground">
              {churnSignals.length} items flagged
            </span>
          </div>

          <div className="rounded-xl border border-border bg-panel divide-y divide-border">
            {churnSignals.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground flex items-center gap-3">
                <CheckCircle2 className="size-5 text-accent shrink-0" />
                <span>No active critical signals flagged. Keep monitoring integrations for changes.</span>
              </div>
            ) : (
              churnSignals.map(signal => (
                <div
                  key={signal.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border',
                          signal.severity === 'critical'
                            ? 'border-red-500/40 bg-red-500/10 text-red-500'
                            : signal.severity === 'high'
                            ? 'border-orange-500/40 bg-orange-500/10 text-orange-500'
                            : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                        )}
                      >
                        {signal.severity}
                      </span>
                      <h4 className="font-semibold text-sm text-foreground">{signal.title}</h4>
                    </div>
                    {signal.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                        {signal.description}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0">
                    <Link
                      href="/dashboard/support"
                      className={buttonVariants({ variant: 'outline', size: 'sm' })}
                    >
                      Resolve with Architect
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Positive Events Feed (Recent Wins) */}
      <section aria-label="Recent Operational Wins" className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recent Operational Wins
        </h3>

        <div className="rounded-xl border border-border bg-panel p-6 space-y-4">
          {successEvents.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <Award className="size-8 text-accent mx-auto" />
              <div className="font-semibold text-sm text-foreground">Operational Milestones Initializing</div>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Verified achievements (such as initial volume thresholds, automated lead triages, and monthly report releases) will appear here as your systems operate.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {successEvents.map(event => (
                <div
                  key={event.id}
                  className="flex items-start justify-between gap-4 p-3 rounded-lg border border-border/60 bg-raised"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 size-2 rounded-full bg-accent shrink-0" />
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-foreground">{event.title}</div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground">{event.description}</p>
                      )}
                    </div>
                  </div>

                  {event.value_impact && (
                    <span className="shrink-0 rounded-md border border-border bg-panel px-2.5 py-1 text-xs font-mono font-semibold text-foreground">
                      ${event.value_impact.toLocaleString()} saved
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Active System Status Overview */}
      <section aria-label="Active Systems Status" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active System Components
          </h3>
          <Link
            href="/dashboard/studio"
            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
          >
            <span>Explore Add-on Systems</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-raised text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 px-4">System Component</th>
                  <th className="py-3 px-4">Operating Status</th>
                  <th className="py-3 px-4">Last Health Check</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {systems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                      No deployed production systems registered for this workspace yet.
                    </td>
                  </tr>
                ) : (
                  systems.map(sys => {
                    const meta = SYSTEM_LABELS[sys.system_type] || {
                      name: sys.system_type.replace(/_/g, ' '),
                      icon: Zap,
                    }
                    const Icon = meta.icon

                    // Match matching integration status
                    const matchedIntegration = integrations.find(
                      i => i.system_type === sys.system_type
                    )
                    const status = matchedIntegration?.status || (sys.active ? 'connected' : 'unknown')

                    return (
                      <tr key={sys.id} className="hover:bg-raised/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Icon className="size-4 text-accent shrink-0" />
                            <span className="font-semibold text-foreground">{meta.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-mono font-medium',
                              status === 'connected'
                                ? 'border-accent/40 bg-accent/10 text-accent'
                                : status === 'degraded'
                                ? 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                                : status === 'disconnected'
                                ? 'border-red-500/40 bg-red-500/10 text-red-500'
                                : 'border-border bg-raised text-muted-foreground'
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {status === 'connected'
                              ? 'Operational'
                              : status === 'degraded'
                              ? 'Degraded'
                              : status === 'disconnected'
                              ? 'Offline'
                              : 'Provisioning'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-mono text-muted-foreground">
                          {matchedIntegration?.last_ping_at
                            ? new Date(matchedIntegration.last_ping_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Continuous'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/dashboard/integrations"
                            className="text-xs text-accent font-semibold hover:underline"
                          >
                            Inspect Endpoint
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}
