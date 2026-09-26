'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import type { ClientStatus, IntegrationStatus, RegionTier } from '@/lib/schema'
import { DataTable, EmptyState, Panel, Stat } from '@/components/admin/v5'

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

const STAGES = ['ALL', 'closed_won', 'proposal_sent', 'engaged', 'new_lead'] as const

function regionLabel(tier?: RegionTier) {
  if (tier === 'mena_sme') return 'MENA SME'
  if (tier === 'gcc_enterprise') return 'GCC Enterprise'
  return '—'
}

function integrationLabel(status: IntegrationStatus | null, clientStatus: ClientStatus) {
  if (status === 'connected') return 'Connected'
  if (status === 'degraded' || clientStatus === 'onboarding') return 'Needs attention'
  if (status === 'disconnected') return 'Disconnected'
  return 'Unknown'
}

export function ClientsRosterView({ clients }: { clients: ClientRosterItem[]; isDemo?: boolean }) {
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
  const connected = clients.filter(client => client.integration === 'connected').length

  return (
    <div className="hx-admin" style={{ gap: 16 }}>
      <div className="hx-admin-stats">
        <Stat label="Workspaces" labelAr="مساحات العمل" value={clients.length} hint="Rows in clients." hintAr="صفوف جدول العملاء." />
        <Stat label="Installed systems" labelAr="الأنظمة المثبتة" value={totalSystems} hint="Count of client_systems rows." hintAr="عدد صفوف الأنظمة." />
        <Stat label="Connected integrations" labelAr="تكاملات متصلة" value={connected} hint="Workspaces whose worst channel is connected." hintAr="مساحات أسوأ قناة فيها متصلة." />
      </div>

      <Panel
        title="Client workspaces"
        titleAr="مساحات عمل العملاء"
        actions={
          <div className="hx-admin-row">
            <input
              className="hx-admin-field"
              type="search"
              placeholder="Search business, vertical, country"
              value={search}
              onChange={event => setSearch(event.target.value)}
              aria-label="Search workspaces"
            />
            <select
              className="hx-admin-field"
              value={selectedStage}
              onChange={event => setSelectedStage(event.target.value)}
              aria-label="Stage"
            >
              {STAGES.map(stage => (
                <option key={stage} value={stage}>
                  {stage === 'ALL' ? 'All stages' : STAGE_LABEL[stage] ?? stage}
                </option>
              ))}
            </select>
            <Link className="hx-admin-btn solid" href="/admin/crm">
              Pipeline
            </Link>
          </div>
        }
      >
        {filteredClients.length === 0 ? (
          <EmptyState
            title="No workspaces match"
            titleAr="لا توجد مساحات مطابقة"
            body="Adjust the search or stage."
            bodyAr="عدّل البحث أو المرحلة."
          />
        ) : (
          <DataTable
            columns={[
              { key: 'name', label: 'Workspace' },
              { key: 'vertical', label: 'Vertical' },
              { key: 'region', label: 'Region' },
              { key: 'systems', label: 'Systems' },
              { key: 'integration', label: 'Integration' },
              { key: 'stage', label: 'Stage' },
              { key: 'action', label: 'Open', align: 'end' },
            ]}
          >
            {filteredClients.map(row => (
              <tr key={row.id}>
                <td>
                  <Link href={`/admin/clients/${row.id}`}>{row.business_name}</Link>
                  {row.country ? <div className="hx-admin-lede">{row.country}</div> : null}
                </td>
                <td>{row.vertical || 'Not set'}</td>
                <td>{regionLabel(row.region_tier)}</td>
                <td>{row.systemCount}</td>
                <td>{integrationLabel(row.integration, row.status)}</td>
                <td>{STAGE_LABEL[row.funnelStage] ?? row.funnelStage}</td>
                <td style={{ textAlign: 'end' }}>
                  <Link href={`/admin/clients/${row.id}`}>Manage</Link>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </Panel>
    </div>
  )
}
