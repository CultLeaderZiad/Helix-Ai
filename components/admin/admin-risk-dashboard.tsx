'use client'

import { useState, useTransition } from 'react'
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
  RotateCcw,
  Plus,
  Check,
  Calendar,
  MessageSquare,
  ShieldAlert,
  Loader2,
  ExternalLink,
  ChevronRight,
  Users,
} from 'lucide-react'
import type {
  Client,
  ClientHealthScore,
  ClientChurnSignal,
  ClientSuccessEvent,
  ClientSystem,
  ClientIntegration,
  RiskLevel,
  SuccessEventType,
} from '@/lib/schema'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  resolveChurnSignalAction,
  createHealthTaskAction,
  logSuccessEventAction,
  recalculateHealthScoreAction,
} from '@/lib/admin/health-actions'

interface AdminRiskDashboardProps {
  clients: Client[]
  selectedClient: Client
  healthScore: ClientHealthScore | null
  churnSignals: ClientChurnSignal[]
  successEvents: ClientSuccessEvent[]
  systems: ClientSystem[]
  integrations: ClientIntegration[]
  openTicketsCount: number
}

const RISK_BADGES: Record<RiskLevel, { label: string; className: string; copy: string }> = {
  healthy: {
    label: 'Healthy',
    className: 'border-accent/40 bg-accent/10 text-accent',
    copy: 'No active risk signals. Consider expansion conversation at next QBR.',
  },
  watch: {
    label: 'Watch',
    className: 'border-amber-500/40 bg-amber-500/10 text-amber-500',
    copy: 'Open signals flagged — recommended operational review this week.',
  },
  at_risk: {
    label: 'At Risk',
    className: 'border-orange-500/40 bg-orange-500/10 text-orange-500',
    copy: 'Intervention recommended within 48 hours. Rising friction detected.',
  },
  critical: {
    label: 'Critical',
    className: 'border-red-500/40 bg-red-500/10 text-red-500',
    copy: 'Immediate attention required. Escalate to delivery lead & schedule recovery call.',
  },
}

export function AdminRiskDashboard({
  clients,
  selectedClient,
  healthScore,
  churnSignals: initialSignals,
  successEvents: initialSuccesses,
  systems,
  integrations,
  openTicketsCount,
}: AdminRiskDashboardProps) {
  const [signals, setSignals] = useState<ClientChurnSignal[]>(initialSignals)
  const [successes, setSuccesses] = useState<ClientSuccessEvent[]>(initialSuccesses)
  const [isPending, startTransition] = useTransition()
  const [statusNotice, setStatusNotice] = useState<string | null>(null)

  // Success Event Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [newWinType, setNewWinType] = useState<SuccessEventType>('positive_feedback')
  const [newWinTitle, setNewWinTitle] = useState('')
  const [newWinDesc, setNewWinDesc] = useState('')
  const [newWinImpact, setNewWinImpact] = useState('')

  // Task creation state
  const [taskSubject, setTaskSubject] = useState('')
  const [showTaskModal, setShowTaskModal] = useState(false)

  const score = healthScore?.score ?? selectedClient.current_health_score ?? 70
  const riskLevel: RiskLevel =
    healthScore?.risk_level ??
    (selectedClient.current_risk_level as RiskLevel) ??
    (score >= 80 ? 'healthy' : score >= 60 ? 'watch' : score >= 40 ? 'at_risk' : 'critical')

  const riskMeta = RISK_BADGES[riskLevel]

  // Handlers
  const handleResolveSignal = (signalId: string) => {
    startTransition(async () => {
      const res = await resolveChurnSignalAction(signalId)
      if (res.success) {
        setSignals(prev => prev.filter(s => s.id !== signalId))
        setStatusNotice('Signal marked resolved and logged to timeline.')
      } else {
        setStatusNotice(res.error || 'Failed to resolve signal.')
      }
    })
  }

  const handleRecalculate = () => {
    startTransition(async () => {
      const res = await recalculateHealthScoreAction(selectedClient.id)
      if (res.success) {
        setStatusNotice(`Health score updated to ${res.score}/100 (${res.riskLevel}).`)
      } else {
        setStatusNotice(res.error || 'Recalculation failed.')
      }
    })
  }

  const handleCreateTask = (customSubject?: string) => {
    const subject = customSubject || taskSubject
    if (!subject.trim()) return

    startTransition(async () => {
      const res = await createHealthTaskAction(selectedClient.id, subject, 9)
      if (res.success) {
        setStatusNotice(`Intervention task queued in agent_tasks (ID: ${res.taskId?.slice(0, 8)}).`)
        setShowTaskModal(false)
        setTaskSubject('')
      } else {
        setStatusNotice(res.error || 'Failed to queue task.')
      }
    })
  }

  const handleLogSuccess = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWinTitle.trim()) return

    startTransition(async () => {
      const res = await logSuccessEventAction(
        selectedClient.id,
        newWinType,
        newWinTitle.trim(),
        newWinDesc.trim(),
        newWinImpact ? Number(newWinImpact) : undefined
      )
      if (res.success) {
        setStatusNotice('Success milestone registered in ledger.')
        setShowSuccessModal(false)
        setNewWinTitle('')
        setNewWinDesc('')
        setNewWinImpact('')
      } else {
        setStatusNotice(res.error || 'Failed to log event.')
      }
    })
  }

  // Auto-generate recommendations from live state
  const recommendations = []
  if (riskLevel === 'critical' || signals.some(s => s.severity === 'critical')) {
    recommendations.push({
      text: 'Critical risk flagged — Escalate to Delivery Lead & schedule recovery session within 24h',
      priority: 10,
    })
  }
  if (openTicketsCount > 0) {
    recommendations.push({
      text: `${openTicketsCount} open support ticket(s) pending — review response status within 24h`,
      priority: 8,
    })
  }
  if (integrations.some(i => i.status === 'disconnected' || i.status === 'degraded')) {
    recommendations.push({
      text: 'Integration endpoint degraded — trigger test ping & verify webhook keys',
      priority: 9,
    })
  }
  if (recommendations.length === 0) {
    recommendations.push({
      text: 'Workspace performing stably — prepare QBR expansion roadmap & new catalog offer',
      priority: 5,
    })
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Notice Banner */}
      {statusNotice && (
        <div className="rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs font-mono text-accent flex items-center justify-between">
          <span>{statusNotice}</span>
          <button type="button" onClick={() => setStatusNotice(null)} className="hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Shell Header + Client Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-accent">
            <Activity className="size-4" />
            Agency Retention Operations
          </div>
          <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Account Health &amp; Churn Prevention
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Fast diagnostic triage, intervention tasks, and risk signal audit for active client workspaces.
          </p>
        </div>

        {/* Client Selector Dropdown */}
        <div className="flex items-center gap-2">
          <Label htmlFor="client-select" className="text-xs font-mono text-muted-foreground shrink-0">
            Tenant:
          </Label>
          <select
            id="client-select"
            value={selectedClient.id}
            onChange={e => {
              window.location.href = `/admin/risk?clientId=${e.target.value}`
            }}
            className="rounded-lg border border-border bg-panel px-3 py-1.5 text-xs font-medium text-foreground focus:outline-hidden focus:ring-1 focus:ring-accent"
          >
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.business_name} ({c.current_health_score ?? 70}/100)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Grid: Health Score Card + Quick Operational Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left: Score & Diagnostic Status (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-border bg-panel p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Account Status · {selectedClient.business_name}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-mono font-semibold',
                  riskMeta.className
                )}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {riskMeta.label.toUpperCase()}
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-8">
              <div className="relative size-28 shrink-0 flex items-center justify-center rounded-full border-4 border-border bg-raised">
                <div className="text-center">
                  <div className="font-display text-4xl font-bold text-foreground">{score}</div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground">score / 100</div>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-xl font-bold text-foreground">{riskMeta.copy}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed max-w-lg">
                  Deterministic audit composite calculated from portal activity, system telemetry, open support tickets, and champion continuity.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
            <div>
              Last calculation:{' '}
              {selectedClient.last_health_calculated_at
                ? new Date(selectedClient.last_health_calculated_at).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'Initial Baseline'}
            </div>
            <button
              type="button"
              disabled={isPending}
              onClick={handleRecalculate}
              className="inline-flex items-center gap-1.5 text-accent hover:underline disabled:opacity-50"
            >
              <RotateCcw className={cn('size-3.5', isPending && 'animate-spin')} />
              <span>Recalculate Score</span>
            </button>
          </div>
        </div>

        {/* Right: Quick Operational Actions (4 cols) */}
        <div className="lg:col-span-4 rounded-xl border border-border bg-panel p-6 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-display text-base font-bold text-foreground">Operational Actions</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dispatch high-priority tasks into the agent queue or log verified milestones.
            </p>

            <div className="pt-2 space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTaskModal(true)}
                className="w-full justify-start gap-2"
              >
                <Plus className="size-4 text-accent" />
                <span>Queue Intervention Task</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSuccessModal(true)}
                className="w-full justify-start gap-2"
              >
                <Award className="size-4 text-accent" />
                <span>Log Success Milestone</span>
              </Button>

              <Link
                href={`/admin/clients/${selectedClient.id}`}
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start gap-2')}
              >
                <Users className="size-4 text-accent" />
                <span>Inspect Client Profile</span>
              </Link>

              <Link
                href={`/dashboard/health?clientId=${selectedClient.id}`}
                target="_blank"
                className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'w-full justify-start gap-2')}
              >
                <ExternalLink className="size-4 text-muted-foreground" />
                <span>Preview Client Portal View</span>
              </Link>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border text-[11px] font-mono text-muted-foreground">
            Client ID: {selectedClient.id.slice(0, 13)}...
          </div>
        </div>
      </div>

      {/* Score Breakdown (6 Signal Bars) */}
      <section aria-label="Component Score Breakdown" className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Score Breakdown by Dimension
        </h3>

        <div className="rounded-xl border border-border bg-panel p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Portal Activity */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Portal Activity</span>
              <span className="font-bold text-foreground">
                {healthScore?.portal_activity_score ?? 85}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.portal_activity_score ?? 85}%` }}
              />
            </div>
          </div>

          {/* 2. System Usage */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">System Telemetry</span>
              <span className="font-bold text-foreground">
                {healthScore?.system_usage_score ?? 90}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.system_usage_score ?? 90}%` }}
              />
            </div>
          </div>

          {/* 3. Support Sentiment */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Support Sentiment</span>
              <span className="font-bold text-foreground">
                {healthScore?.support_sentiment_score ?? 95}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.support_sentiment_score ?? 95}%` }}
              />
            </div>
          </div>

          {/* 4. Report Engagement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Report Engagement</span>
              <span className="font-bold text-foreground">
                {healthScore?.report_engagement_score ?? 80}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.report_engagement_score ?? 80}%` }}
              />
            </div>
          </div>

          {/* 5. Payment Health */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Payment Health</span>
              <span className="font-bold text-foreground">
                {healthScore?.payment_health_score ?? 90}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.payment_health_score ?? 90}%` }}
              />
            </div>
          </div>

          {/* 6. Champion Engagement */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-muted-foreground">Champion Continuity</span>
              <span className="font-bold text-foreground">
                {healthScore?.champion_engagement_score ?? 75}/100
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-raised overflow-hidden">
              <div
                className="h-full bg-accent transition-all"
                style={{ width: `${healthScore?.champion_engagement_score ?? 75}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Active Risk Signals Table */}
      <section aria-label="Active Risk Signals" className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Active Risk Signals ({signals.length} unresolved)
          </h3>
          <span className="text-xs font-mono text-muted-foreground">Action required</span>
        </div>

        <div className="rounded-xl border border-border bg-panel overflow-hidden">
          {signals.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
              <CheckCircle2 className="size-4 text-accent" />
              <span>No active churn risk signals for this tenant.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-raised text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Signal Details</th>
                    <th className="py-3 px-4">Detected</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {signals.map(s => (
                    <tr key={s.id} className="hover:bg-raised/40 transition-colors">
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider border',
                            s.severity === 'critical'
                              ? 'border-red-500/40 bg-red-500/10 text-red-500'
                              : s.severity === 'high'
                              ? 'border-orange-500/40 bg-orange-500/10 text-orange-500'
                              : 'border-amber-500/40 bg-amber-500/10 text-amber-500'
                          )}
                        >
                          {s.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{s.title}</div>
                        {s.description && (
                          <div className="text-xs text-muted-foreground mt-0.5">{s.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs font-mono text-muted-foreground whitespace-nowrap">
                        {new Date(s.detected_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => handleCreateTask(`Intervention: ${s.title}`)}
                          className="h-7 text-xs px-2.5"
                        >
                          Queue Task
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={isPending}
                          onClick={() => handleResolveSignal(s.id)}
                          className="h-7 text-xs px-2.5"
                        >
                          Resolve
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Recommended Next Actions */}
      <section aria-label="Recommended Next Actions" className="space-y-3">
        <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Recommended Next Actions (Auto-Synthesized)
        </h3>

        <div className="rounded-xl border border-border bg-panel divide-y divide-border">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-accent shrink-0" />
                <span className="text-sm font-medium text-foreground">{rec.text}</span>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => handleCreateTask(rec.text)}
                className="shrink-0 h-8 text-xs"
              >
                Create Task
              </Button>
            </div>
          ))}
        </div>
      </section>

      {/* Modals */}
      {/* 1. Task Creation Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-panel p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">
              Queue Health Intervention Task
            </h3>
            <p className="text-xs text-muted-foreground">
              This injects a priority item into the durable `agent_tasks` queue with client tenancy binding.
            </p>

            <div className="space-y-2">
              <Label htmlFor="task-sub" className="text-xs font-mono">
                Task Subject
              </Label>
              <Input
                id="task-sub"
                value={taskSubject}
                onChange={e => setTaskSubject(e.target.value)}
                placeholder="e.g. Schedule emergency architecture check-in"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowTaskModal(false)}>
                Cancel
              </Button>
              <Button size="sm" disabled={isPending} onClick={() => handleCreateTask()}>
                {isPending ? 'Queuing...' : 'Queue Task'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Log Success Event Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-panel p-6 shadow-xl space-y-4">
            <h3 className="font-display text-lg font-bold text-foreground">Log Client Success Milestone</h3>
            <form onSubmit={handleLogSuccess} className="space-y-3">
              <div>
                <Label className="text-xs font-mono">Event Type</Label>
                <select
                  value={newWinType}
                  onChange={e => setNewWinType(e.target.value as SuccessEventType)}
                  className="w-full rounded-md border border-border bg-raised p-2 text-xs text-foreground mt-1"
                >
                  <option value="first_value_delivered">First Value Delivered</option>
                  <option value="monthly_report_opened">Monthly Report Opened</option>
                  <option value="positive_feedback">Positive Feedback</option>
                  <option value="system_usage_spike">System Usage Spike</option>
                  <option value="qbr_completed">QBR Completed</option>
                  <option value="upsell_accepted">Upsell Accepted</option>
                  <option value="referral_given">Referral Given</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-mono">Milestone Title</Label>
                <Input
                  required
                  value={newWinTitle}
                  onChange={e => setNewWinTitle(e.target.value)}
                  placeholder="e.g. Speed-to-lead sub-40s response benchmark achieved"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-mono">Description / Notes</Label>
                <Input
                  value={newWinDesc}
                  onChange={e => setNewWinDesc(e.target.value)}
                  placeholder="Verified 420 inquiries triaged with zero dropped calls"
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <Label className="text-xs font-mono">Estimated Value Impact ($ saved)</Label>
                <Input
                  type="number"
                  value={newWinImpact}
                  onChange={e => setNewWinImpact(e.target.value)}
                  placeholder="e.g. 1500"
                  className="mt-1 text-xs font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isPending}>
                  {isPending ? 'Logging...' : 'Register Win'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
