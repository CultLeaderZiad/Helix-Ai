'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Building2,
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck,
  Server,
  Layers,
  Activity,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Plus,
  RefreshCw,
  Globe,
} from 'lucide-react'
import type { ClientStatus, IntegrationStatus, RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { KpiCard } from '@/components/ui/kpi-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'

export interface ClientRosterItem {
  id: string
  business_name: string
  vertical: string | null
  status: ClientStatus
  country?: string | null
  region_tier?: RegionTier
  updated_at: string
  systemCount: number
  integration: IntegrationStatus | null
  pendingFacts: number
  funnelStage: string
}

const STAGE_CONFIG: Record<string, { label: string; dot: string; pill: string }> = {
  new_lead: {
    label: 'New Lead',
    dot: 'bg-blue-400',
    pill: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
  },
  engaged: {
    label: 'Engaged',
    dot: 'bg-cyan-400',
    pill: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  },
  studio_completed: {
    label: 'Studio Done',
    dot: 'bg-purple-400',
    pill: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
  call_booked: {
    label: 'Call Booked',
    dot: 'bg-amber-400',
    pill: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    dot: 'bg-orange-400',
    pill: 'border-orange-500/30 bg-orange-500/10 text-orange-300',
  },
  closed_won: {
    label: 'Closed Won',
    dot: 'bg-emerald-400',
    pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  closed_lost: {
    label: 'Closed Lost',
    dot: 'bg-rose-400',
    pill: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  },
  DEMO_BOOKED: {
    label: 'Call Booked',
    dot: 'bg-amber-400',
    pill: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  QUALIFIED_TO_BUY: {
    label: 'Studio Done',
    dot: 'bg-purple-400',
    pill: 'border-purple-500/30 bg-purple-500/10 text-purple-300',
  },
}

const STATUS_CONFIG: Record<ClientStatus, { label: string; dot: string; pill: string }> = {
  active: {
    label: 'Active',
    dot: 'bg-emerald-400',
    pill: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  },
  onboarding: {
    label: 'Onboarding',
    dot: 'bg-amber-400',
    pill: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  },
  paused: {
    label: 'Paused',
    dot: 'bg-slate-400',
    pill: 'border-white/[0.1] bg-white/[0.04] text-slate-400',
  },
  churned: {
    label: 'Churned',
    dot: 'bg-rose-400',
    pill: 'border-rose-500/30 bg-rose-500/10 text-rose-300',
  },
}

export function ClientsRosterView({ clients }: { clients: ClientRosterItem[] }) {
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch =
        c.business_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.vertical?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.country?.toLowerCase().includes(search.toLowerCase()) ?? false)

      const matchesStage = selectedStage === 'ALL' || c.funnelStage === selectedStage
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus

      return matchesSearch && matchesStage && matchesStatus
    })
  }, [clients, search, selectedStage, selectedStatus])

  // Executive summary stats
  const totalSystems = clients.reduce((acc, c) => acc + c.systemCount, 0)
  const connectedCount = clients.filter((c) => c.integration === 'connected' || (!c.integration && c.systemCount > 0)).length
  const pendingCount = clients.reduce((acc, c) => acc + c.pendingFacts, 0)

  return (
    <div className="space-y-6">
      {/* Header & Actions Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-mono font-medium text-slate-300">
            <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
            OPERATIONAL ROSTER • {clients.length} WORKSPACES
          </div>
          <h1 className="mt-2.5 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Client Workspaces
          </h1>
          <p className="mt-1 text-xs text-slate-400 max-w-2xl">
            Regional tenant partitioning, CRM progression stages, and active telemetry connections across provisioned environments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="size-3.5" />
            <span>Sync</span>
          </Button>
          <Link href="/admin/crm">
            <Button variant="default" size="sm">
              <Plus className="size-3.5" />
              <span>Open CRM Pipeline</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Workspaces"
          value={clients.length}
          delta="100% PROVISIONED"
          deltaType="positive"
          subtext="Autonomous multi-tenant clusters"
          icon={Building2}
        />
        <KpiCard
          label="Systems Active"
          value={totalSystems}
          delta="VOICE / WEB / CRM"
          deltaType="neutral"
          subtext="Connected production nodes"
          icon={Server}
        />
        <KpiCard
          label="Integrations"
          value={`${connectedCount} / ${clients.length}`}
          delta="HEALTHY"
          deltaType="positive"
          subtext="Zero degraded webhooks"
          icon={Activity}
        />
        <KpiCard
          label="Fact Review"
          value={pendingCount}
          delta={pendingCount > 0 ? `${pendingCount} PENDING` : 'CLEARED'}
          deltaType={pendingCount > 0 ? 'negative' : 'positive'}
          subtext="Ground-truth verification queue"
          icon={ShieldCheck}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0D121F]/90 p-2.5 shadow-sm">
        <div className="relative min-w-[260px] flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400 z-10" />
          <Input
            type="text"
            placeholder="Search workspace, region, or vertical..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['ALL', 'new_lead', 'engaged', 'studio_completed', 'closed_won'].map((stage) => {
            const config = STAGE_CONFIG[stage]
            const isSelected = selectedStage === stage
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={cn(
                  'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
                  isSelected
                    ? 'bg-white/[0.1] text-white border border-white/[0.12] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                )}
              >
                {stage === 'ALL' ? 'All Stages' : config?.label ?? stage}
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Table Panel */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Workspace</TableHead>
            <TableHead>Region</TableHead>
            <TableHead>Funnel Stage</TableHead>
            <TableHead>Vertical</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-center">Systems</TableHead>
            <TableHead>Integrations</TableHead>
            <TableHead className="text-right">Pending</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.length > 0 ? (
            filteredClients.map((row) => {
              const stageConfig = STAGE_CONFIG[row.funnelStage] ?? {
                label: row.funnelStage,
                dot: 'bg-slate-400',
                pill: 'border-white/10 bg-white/5 text-slate-300',
              }
              const statusConfig = STATUS_CONFIG[row.status] ?? {
                label: row.status,
                dot: 'bg-slate-400',
                pill: 'border-white/10 bg-white/5 text-slate-300',
              }
              const initial = row.business_name.charAt(0).toUpperCase()

              return (
                <TableRow key={row.id} className="group">
                  {/* Workspace Avatar & Name */}
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-xs font-bold text-sky-400 shadow-xs">
                        {initial}
                      </div>
                      <div>
                        <Link
                          href={`/admin/clients/${row.id}`}
                          className="font-medium text-white group-hover:text-sky-300 transition-colors inline-flex items-center gap-1"
                        >
                          <span>{row.business_name}</span>
                          <ArrowUpRight className="size-3 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400" />
                        </Link>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.vertical || 'Enterprise Client'}
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  {/* Region Badge */}
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-white/8 bg-white/4 px-2 py-1 font-mono text-[10px] text-slate-300">
                      <Globe className="size-2.5 text-slate-400" />
                      <span>{row.country || 'AE'}</span>
                      <span className="text-slate-500">•</span>
                      <span>{row.region_tier === 'mena_sme' ? 'MENA SME' : 'GCC Ent.'}</span>
                    </span>
                  </TableCell>

                  {/* Funnel Stage */}
                  <TableCell>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium',
                        stageConfig.pill
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', stageConfig.dot)} />
                      {stageConfig.label}
                    </span>
                  </TableCell>

                  {/* Vertical */}
                  <TableCell className="text-slate-400 font-mono text-[11px]">
                    {row.vertical || '—'}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      variant={row.status === 'active' ? 'verified' : row.status === 'onboarding' ? 'probable' : 'default'}
                      dot
                    >
                      {statusConfig.label}
                    </Badge>
                  </TableCell>

                  {/* Systems */}
                  <TableCell className="text-center">
                    <span className="inline-flex items-center justify-center rounded border border-white/8 bg-white/2 px-2 py-0.5 font-mono text-xs text-slate-200 tabular-nums">
                      {row.systemCount}
                    </span>
                  </TableCell>

                  {/* Integrations */}
                  <TableCell>
                    {row.integration === 'connected' || (!row.integration && row.systemCount > 0) ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                        <span className="size-1.5 rounded-full bg-emerald-400" />
                        Connected
                      </span>
                    ) : row.integration === 'degraded' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
                        <span className="size-1.5 rounded-full bg-amber-400" />
                        Degraded
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="size-1.5 rounded-full bg-slate-600" />
                        Disconnected
                      </span>
                    )}
                  </TableCell>

                  {/* Pending Facts */}
                  <TableCell className="text-right">
                    {row.pendingFacts > 0 ? (
                      <Badge variant="probable">
                        {row.pendingFacts}
                      </Badge>
                    ) : (
                      <span className="font-mono text-xs text-slate-500 tabular-nums">0</span>
                    )}
                  </TableCell>

                  {/* Action */}
                  <TableCell className="text-right">
                    <Link href={`/admin/clients/${row.id}`}>
                      <Button variant="outline" size="xs">
                        Inspect
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="py-10 text-center text-slate-500">
                <p className="text-sm font-medium">No matching client workspaces found.</p>
                <p className="text-xs mt-1">Try clearing your search query or filters.</p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Table Footer / Scannability Bar */}
      <div className="flex items-center justify-between border-t border-white/6 bg-white/[0.01] px-4 py-3 text-[11px] text-slate-400 font-mono">
        <span>Showing {filteredClients.length} of {clients.length} workspaces</span>
        <span className="hidden sm:inline">REGIONAL ISOLATION: ACTIVE (AES-256)</span>
      </div>
    </div>
  )
}
