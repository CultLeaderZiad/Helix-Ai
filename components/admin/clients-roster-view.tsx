'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ClientRosterItem } from '@/lib/admin/roster'
import { PageHeader, HelixKpi, EmptyState, Pill } from '@/components/ui/helix'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { seedDemoWorkspace } from '@/lib/admin/seed-demo-workspace'

export type { ClientRosterItem }

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

function RosterSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <div className="h-10 w-64 animate-pulse rounded-[12px] bg-helix-surface" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-[88px] animate-pulse rounded-[16px] border border-helix-border bg-helix-surface" />
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-[16px] border border-helix-border bg-helix-surface sm:block">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-14 animate-pulse border-b border-helix-border last:border-0 bg-helix-canvas/40" />
        ))}
      </div>
      <div className="space-y-3 sm:hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-28 animate-pulse rounded-[16px] border border-helix-border bg-helix-surface" />
        ))}
      </div>
    </div>
  )
}

function WorkspaceCard({ row }: { row: ClientRosterItem }) {
  const integration = integrationLabel(row)
  return (
    <article className="rounded-[16px] border border-helix-border bg-helix-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/clients/${row.id}`} className="helix-title text-15 hover:underline">
            {row.business_name}
          </Link>
          <p className="mt-1 text-12 text-helix-muted">{regionLabel(row)}</p>
        </div>
        {row.isSample ? <Pill tone="sample">Sample</Pill> : null}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-13">
        <Pill tone={row.funnelStage === 'engaged' || row.funnelStage === 'closed_won' ? 'live' : 'demo'}>
          {STAGE_LABEL[row.funnelStage] ?? row.funnelStage.replaceAll('_', ' ')}
        </Pill>
        <span className="text-helix-muted">{row.systemCount} systems</span>
        <span
          className={cn(
            'font-medium',
            integration.tone === 'ok' && 'text-helix-ok',
            integration.tone === 'warn' && 'text-helix-warn',
            integration.tone === 'muted' && 'text-helix-muted'
          )}
        >
          {integration.label}
        </span>
      </div>
    </article>
  )
}

export function ClientsRosterView({
  clients,
  error,
  degraded,
}: {
  clients: ClientRosterItem[]
  error?: string | null
  degraded?: boolean
}) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [selectedStage, setSelectedStage] = useState<string>('ALL')
  const [seedMessage, setSeedMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  const retry = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  const seed = () => {
    setSeedMessage(null)
    startTransition(async () => {
      const result = await seedDemoWorkspace()
      setSeedMessage(result.message)
      if (result.success) router.refresh()
    })
  }

  if (isPending && clients.length === 0) {
    return <RosterSkeleton />
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client workspaces"
        subtitle={
          error
            ? 'Roster fetch failed — retry or seed a sample workspace.'
            : `${clients.length} workspace${clients.length === 1 ? '' : 's'} · regional isolation on`
        }
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={retry} disabled={isPending}>
              {isPending ? 'Refreshing' : 'Retry'}
            </Button>
            <Link href="/admin/crm" className={buttonVariants({ size: 'sm' })}>
              Open pipeline
            </Link>
          </>
        }
      />

      {error ? (
        <div role="alert" className="rounded-[16px] border border-helix-border bg-helix-surface p-5">
          <h2 className="helix-title text-15">The client roster could not be loaded</h2>
          <p className="mt-1 text-13 text-helix-muted">{error}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" onClick={retry} disabled={isPending}>
              Retry
            </Button>
            <Button size="sm" variant="secondary" onClick={seed} disabled={isPending}>
              Seed sample workspace
            </Button>
          </div>
          {seedMessage ? <p className="mt-3 text-13 text-helix-muted">{seedMessage}</p> : null}
        </div>
      ) : null}

      {degraded && !error ? (
        <p className="text-13 text-helix-muted">
          Region columns are unavailable in this database. Core workspace rows still loaded.
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HelixKpi value={clients.length} label="Workspaces" />
        <HelixKpi value={totalSystems} label="Systems active" />
        <HelixKpi
          value={healthyDenom > 0 ? `${connectedCount}/${healthyDenom}` : '0'}
          label="Integrations healthy"
        />
        <HelixKpi value={pendingCount} label="Facts to review" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="min-w-0 flex-1 sm:min-w-[220px]">
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
                    : 'text-helix-muted hover:bg-helix-surface hover:text-helix-ink'
                )}
              >
                {stage === 'ALL' ? 'All stages' : STAGE_LABEL[stage] ?? stage}
              </button>
            )
          })}
        </div>
      </div>

      {!error && clients.length === 0 ? (
        <EmptyState
          title="No client workspaces yet"
          body="This is an empty tenant, not a failed load. Retry the live fetch or seed a labeled Sample workspace."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button size="sm" onClick={retry} disabled={isPending}>
                Retry
              </Button>
              <Button size="sm" variant="secondary" onClick={seed} disabled={isPending}>
                Seed sample workspace
              </Button>
            </div>
          }
        />
      ) : null}

      {seedMessage && clients.length === 0 && !error ? (
        <p className="text-center text-13 text-helix-muted">{seedMessage}</p>
      ) : null}

      {filteredClients.length === 0 && clients.length > 0 ? (
        <EmptyState
          title="No matching workspaces"
          body="Clear search or stage filters to see the roster again."
          action={
            <Button variant="secondary" size="sm" onClick={() => { setSearch(''); setSelectedStage('ALL') }}>
              Reset filters
            </Button>
          }
        />
      ) : null}

      {filteredClients.length > 0 ? (
        <>
          <div className="hidden sm:block">
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
                        <div className="flex items-center gap-2">
                          <Link href={`/admin/clients/${row.id}`} className="text-helix-ink hover:underline">
                            {row.business_name}
                          </Link>
                          {row.isSample ? <Pill tone="sample">Sample</Pill> : null}
                        </div>
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
          </div>
          <div className="grid grid-cols-1 gap-3 sm:hidden">
            {filteredClients.map(row => (
              <WorkspaceCard key={row.id} row={row} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
