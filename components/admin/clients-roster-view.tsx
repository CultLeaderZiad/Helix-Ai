'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { ClientStatus, IntegrationStatus, RegionTier } from '@/lib/schema'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Search,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Plus,
} from 'lucide-react'

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
  isSample?: boolean
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

function flagForCountry(country?: string | null) {
  if (!country) return '🌐'
  if (country === 'AE') return '🇦🇪'
  if (country === 'SA') return '🇸🇦'
  if (country === 'QA') return '🇶🇦'
  if (country === 'KW') return '🇰🇼'
  if (country === 'OM') return '🇴🇲'
  if (country === 'BH') return '🇧🇭'
  return country
}

export function ClientsRosterView({
  clients,
  isDemo = false,
}: {
  clients: ClientRosterItem[]
  isDemo?: boolean
}) {
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

  return (
    <div className="space-y-6">
      {/* Sample Banner if showing demo fixtures */}
      {isDemo && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] px-4 py-3 text-xs text-[#6E6A63] shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#EBE7DF] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase text-[#141414]">
              Sample Data
            </span>
            <span>
              Displaying illustrative GCC enterprise workspaces. Live mode displays your real connected clients.
            </span>
          </div>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-1 font-mono text-11 font-medium text-[#0B6E4F] hover:underline"
          >
            <RefreshCw className="size-3" />
            Refresh Roster
          </button>
        </div>
      )}

      {/* KPI Band — Warm Command Style */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Card 1: Total ARR */}
        <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6E6A63]">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#6E6A63]">
              Total ARR
            </span>
            <span className="rounded bg-[#E6F3EE] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#0B6E4F]">
              +18.4% YoY
            </span>
          </div>
          <div className="mt-2 font-display text-28 font-bold tracking-tight text-[#141414]">
            $18,450,300
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#EBE7DF] overflow-hidden">
              <div className="h-full w-[78%] rounded-full bg-[#0B6E4F]" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Deployed Agents */}
        <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#6E6A63]">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#6E6A63]">
              Active Deployed Agents
            </span>
            <span className="font-mono text-[11px] text-[#0B6E4F] font-semibold">
              Live Systems
            </span>
          </div>
          <div className="mt-2 font-display text-28 font-bold tracking-tight text-[#141414]">
            {totalSystems.toLocaleString()}{' '}
            <span className="text-15 font-normal text-[#6E6A63] font-mono">/ 4,000</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#EBE7DF] overflow-hidden">
              <div className="h-full w-[65%] rounded-full bg-[#0B6E4F]" />
            </div>
          </div>
        </div>

        {/* Card 3: System Health */}
        <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#6E6A63]">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#6E6A63]">
              System Health
            </span>
            <span className="rounded-full bg-[#E6F3EE] px-2 py-0.5 font-mono text-[11px] font-bold text-[#0B6E4F]">
              Match 98.7%
            </span>
          </div>
          <div className="mt-2 font-display text-28 font-bold tracking-tight text-[#141414]">
            98.7% <span className="text-15 font-normal text-[#6E6A63] font-mono">/ GCC OPS</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
            <div className="h-1.5 w-full rounded-full bg-[#EBE7DF] overflow-hidden">
              <div className="h-full w-[98%] rounded-full bg-[#0B6E4F]" />
            </div>
          </div>
        </div>
      </div>

      {/* Enterprise Roster Header & Search */}
      <div className="rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-display text-16 font-bold tracking-tight text-[#141414]">
              Enterprise Clients Roster
            </h2>
            <p className="mt-0.5 text-13 text-[#6E6A63]">
              {filteredClients.length} managed client workspaces · Regional GCC isolation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[240px] flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-[#6E6A63]" />
              <Input
                type="search"
                placeholder="Search business, vertical, country..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-9 w-full rounded-lg border-[#D9D4CB] bg-[#F3F1EC] pl-9 text-13 text-[#141414] placeholder:text-[#9E9B95] focus:border-[#141414] focus:ring-0"
              />
            </div>

            <Link
              href="/admin/crm"
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#141414] px-3.5 text-12 font-medium text-white hover:bg-[#2B2A27] transition-colors shadow-2xs"
            >
              <Sparkles className="size-3.5" />
              Open Pipeline
            </Link>
          </div>
        </div>

        {/* Stage Filter Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto border-t border-[#D9D4CB] pt-3">
          <span className="text-[11px] font-mono text-[#6E6A63] mr-1">Filter:</span>
          {['ALL', 'closed_won', 'proposal_sent', 'engaged', 'new_lead'].map(stage => {
            const isSelected = selectedStage === stage
            return (
              <button
                key={stage}
                type="button"
                onClick={() => setSelectedStage(stage)}
                className={cn(
                  'rounded-full px-3 py-1 text-12 font-medium transition-colors whitespace-nowrap',
                  isSelected
                    ? 'bg-[#141414] text-white shadow-xs'
                    : 'text-[#6E6A63] hover:bg-[#E6E2D9] hover:text-[#141414]'
                )}
              >
                {stage === 'ALL' ? 'All Stages' : STAGE_LABEL[stage] ?? stage}
              </button>
            )
          })}
        </div>
      </div>

      {/* High-Density Data Table */}
      <div className="overflow-hidden rounded-xl border border-[#D9D4CB] bg-[#FFFEFA] shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-13">
            <thead>
              <tr className="border-b border-[#D9D4CB] bg-[#F8F6F0] text-[11px] font-mono uppercase tracking-wider text-[#6E6A63]">
                <th className="py-3 pl-4 pr-3 font-semibold">Client Business Name</th>
                <th className="px-3 py-3 font-semibold">Vertical</th>
                <th className="px-3 py-3 font-semibold">Regional Tier</th>
                <th className="px-3 py-3 font-semibold">Deployed Systems</th>
                <th className="px-3 py-3 font-semibold">Integration Health</th>
                <th className="py-3 pl-3 pr-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D4CB]">
              {filteredClients.map(row => {
                const isOptimal = row.integration === 'connected' || (!row.integration && row.systemCount > 20)
                const isCaution = row.integration === 'degraded' || row.status === 'onboarding'

                return (
                  <tr
                    key={row.id}
                    className="group transition-colors hover:bg-[#F8F6F0]"
                  >
                    {/* Business Name */}
                    <td className="py-3 pl-4 pr-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-[#D9D4CB] bg-[#F3F1EC] text-[#141414]">
                          <Building2 className="size-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/admin/clients/${row.id}`}
                              className="font-semibold text-[#141414] hover:underline"
                            >
                              {row.business_name}
                            </Link>
                            {isDemo && (
                              <span className="rounded bg-[#EBE7DF] px-1 py-0.2 text-[9px] font-mono font-medium text-[#6E6A63] uppercase">
                                Sample
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#6E6A63] font-mono truncate">
                            ID: {row.id.slice(0, 16)}...
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Vertical */}
                    <td className="px-3 py-3 text-[#141414]">
                      <span className="rounded border border-[#D9D4CB] bg-[#F3F1EC] px-2 py-0.5 text-12 text-[#141414]">
                        {row.vertical || 'Enterprise'}
                      </span>
                    </td>

                    {/* Regional Tier */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-[#141414]">
                        <span className="text-14">{flagForCountry(row.country)}</span>
                        <span className="font-mono text-12">
                          {row.region_tier === 'mena_sme' ? 'MENA SME' : 'GCC Enterprise'}
                        </span>
                      </div>
                    </td>

                    {/* Deployed Systems */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-semibold text-[#141414] min-w-[24px]">
                          {row.systemCount}
                        </span>
                        <div className="h-1.5 w-20 rounded-full bg-[#EBE7DF] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-[#0B6E4F]"
                            style={{ width: `${Math.min(100, Math.max(15, row.systemCount * 2))}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Integration Health */}
                    <td className="px-3 py-3">
                      {isOptimal ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E6F3EE] px-2.5 py-0.5 text-12 font-medium text-[#0B6E4F]">
                          <span className="size-1.5 rounded-full bg-[#0B6E4F]" />
                          Connected
                        </span>
                      ) : isCaution ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEF3C7] px-2.5 py-0.5 text-12 font-medium text-[#B45309]">
                          <span className="size-1.5 rounded-full bg-[#B45309]" />
                          Onboarding
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FEE2E2] px-2.5 py-0.5 text-12 font-medium text-[#B42318]">
                          <span className="size-1.5 rounded-full bg-[#B42318]" />
                          Disconnected
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 pl-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/clients/${row.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-[#D9D4CB] bg-[#FFFEFA] px-2.5 py-1 text-12 font-medium text-[#141414] hover:bg-[#F3F1EC] transition-colors"
                        >
                          Manage
                          <ArrowUpRight className="size-3 text-[#6E6A63]" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
