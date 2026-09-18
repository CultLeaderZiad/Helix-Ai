'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ClientStatus, IntegrationStatus, RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { PageHeader, HelixKpi, EmptyState, Pill } from '@/components/ui/helix'
import { Button, buttonVariants } from '@/components/ui/button'
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

const STAGE_LABEL: Record<string, string> = {
  new_lead: 'New lead',
  engaged: 'Engaged',
  studio_completed: 'Studio done',
  call_booked: 'Call booked',
  proposal_sent: 'Proposal sent',
  closed_won: 'Closed won',
  closed_lost: 'Closed lost',
  DEMO_BOOKED: 'Call booked',
  QUALIFIED_TO_BUY: 'Studio done',
}

function regionLabel(row: ClientRosterItem) {
  const country = row.country || '—'
  const tier = row.region_tier === 'mena_sme' ? 'MENA SME' : 'GCC'
  return `${country} · ${tier}`
}

function integrationLabel(row: ClientRosterItem) {
  if (row.integration === 'connected' || (!row.integration && row.systemCount > 0)) {
    return { label: 'Connected', tone: 'ok' as const }
  }
  if (row.integration === 'degraded') {
    return { label: 'Degraded', tone: 'warn' as const }
  }
  return { label: 'Disconnected', tone: 'muted' as const }
}

export function ClientsRosterView({ clients }: { clients: ClientRosterItem[] }) {
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('ALL')

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const matchesSearch =
        c.business_name.toLowerCase().includes(search.toLowerCase()) ||
        (c.vertical?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        (c.country?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchesStage = selectedStage === 'ALL' || c.funnelStage === selectedStage
      return matchesSearch && matchesStage
    })
  }, [clients, search, selectedStage])

  const totalSystems = clients.reduce((acc, c) => acc + c.systemCount, 0)
  const connectedCount = clients.filter(
    c => c.integration === 'connected' || (!c.integration && c.systemCount > 0)
  ).length
  const pendingCount = clients.reduce((acc, c) => acc + c.pendingFacts, 0)
  const healthyDenom = Math.max(clients.length, 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client workspaces"
        subtitle={`${clients.length} workspace${clients.length === 1 ? '' : 's'} · regional isolation on`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => window.location.reload()}>
              Sync
            </Button>
            <Link href="/admin/crm" className={buttonVariants({ size: 'sm' })}>
              Open pipeline
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HelixKpi value={clients.length} label="Workspaces" />
        <HelixKpi value={totalSystems} label="Systems active" />
        <HelixKpi
          value={healthyDenom > 0 ? `${connectedCount}/${healthyDenom}` : '0'}
          label="Integrations healthy"
        />
        <HelixKpi value={pendingCount} label="Facts to review" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            type="search"
            placeholder="Search workspace or region"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-9"
          />
        </div>
        <div className="flex items-center gap-1 overflow-x-auto">
          {['ALL', 'new_lead', 'engaged', 'studio_completed', 'closed_won'].map(stage => {
            const isSelected = selectedStage === stage
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-13 transition-colors whitespace-nowrap',
                  isSelected
                    ? 'bg-helix-ink text-helix-surface'
                    : 'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink'
                )}
              >
                {stage === 'ALL' ? 'All stages' : STAGE_LABEL[stage] ?? stage}
              </button>
            )
          })}
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <EmptyState
          title="No matching workspaces"
          body="Clear search or stage filters to see the roster again."
          action={
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setSelectedStage('ALL') }}>
              Reset filters
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Workspace</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Systems</TableHead>
              <TableHead>Integrations</TableHead>
              <TableHead className="text-right"> </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredClients.map(row => {
              const integration = integrationLabel(row)
              return (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <Link href={`/admin/clients/${row.id}`} className="text-helix-ink hover:underline">
                      {row.business_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-helix-muted">{regionLabel(row)}</TableCell>
                  <TableCell>
                    <Pill tone={row.funnelStage === 'engaged' || row.funnelStage === 'closed_won' ? 'live' : 'demo'}>
                      {STAGE_LABEL[row.funnelStage] ?? row.funnelStage.replaceAll('_', ' ')}
                    </Pill>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-13 font-medium',
                        row.status === 'active' && 'text-helix-ok',
                        row.status === 'onboarding' && 'text-helix-warn',
                        row.status === 'paused' && 'text-helix-muted',
                        row.status === 'churned' && 'text-helix-danger'
                      )}
                    >
                      {row.status === 'onboarding' ? 'Onboarding' : row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="tabular-nums">{row.systemCount}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        'text-13 font-medium',
                        integration.tone === 'ok' && 'text-helix-ok',
                        integration.tone === 'warn' && 'text-helix-warn',
                        integration.tone === 'muted' && 'text-helix-muted'
                      )}
                    >
                      {integration.label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href={`/admin/clients/${row.id}`}
                      className="text-13 text-helix-muted hover:text-helix-ink"
                    >
                      Inspect →
                    </Link>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
