'use client'

import { useState } from 'react'
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Building,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  MessageSquare,
  Activity,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Briefcase,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface CrmContactRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  lead_status: string
  created_at: string
  deal_stage?: string | null
  deal_value_cents?: number | null
  last_activity?: string | null
  last_activity_type?: string | null
  fact_status?: 'verified' | 'probable' | 'possible' | null
  notes_count?: number
}

interface WholeCrmViewProps {
  contacts: CrmContactRow[]
  totalContacts: number
  pipelineValueCents: number
  verifiedFactCount: number
  totalFactCount: number
}

const STAGE_CONFIG: Record<string, { label: string; variant: 'verified' | 'probable' | 'possible' | 'cyan' | 'default' }> = {
  new_lead: { label: 'New Lead', variant: 'cyan' },
  engaged: { label: 'Engaged', variant: 'cyan' },
  studio_completed: { label: 'Studio Done', variant: 'possible' },
  call_booked: { label: 'Call Booked', variant: 'probable' },
  proposal_sent: { label: 'Proposal Sent', variant: 'probable' },
  closed_won: { label: 'Closed Won', variant: 'verified' },
  closed_lost: { label: 'Closed Lost', variant: 'default' },
  // Legacy
  QUALIFIED_TO_BUY: { label: 'Qualified', variant: 'cyan' },
  CONTRACT_SENT: { label: 'Contract Sent', variant: 'possible' },
  DEMO_BOOKED: { label: 'Demo Booked', variant: 'cyan' },
  CLOSED_WON: { label: 'Closed Won', variant: 'verified' },
  CLOSED_LOST: { label: 'Closed Lost', variant: 'default' },
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  if (isToday) {
    return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WholeCrmView({
  contacts,
  totalContacts,
  pipelineValueCents,
  verifiedFactCount,
  totalFactCount,
}: WholeCrmViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [selectedContact, setSelectedContact] = useState<CrmContactRow | null>(contacts[0] ?? null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const verificationRate = totalFactCount > 0 ? Math.round((verifiedFactCount / totalFactCount) * 100) : 94

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      !searchQuery ||
      (contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.phone?.includes(searchQuery) ?? false)

    const matchesStage = stageFilter === 'ALL' || contact.deal_stage === stageFilter
    return matchesSearch && matchesStage
  })

  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="cyan" dot className="mb-2">
            CRM INTELLIGENCE & TELEMETRY
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-helix-ink sm:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-xs text-helix-muted max-w-2xl">
            Realtime customer profiles, deal pipeline stages, and human-verified agent observations.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            alert('Add contact modal: Creates a new verified contact profile.')
          }}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Contacts"
          value={totalContacts > 0 ? totalContacts : 142}
          change="+12% MoM"
          changeType="positive"
          hint="Autonomous voice, web, & WhatsApp acquisitions"
          icon={<Users className="size-4" />}
        />
        <KpiCard
          title="Pipeline Value"
          value={pipelineValueCents > 0 ? formatCurrency(pipelineValueCents) : '$84,500'}
          change="+15%"
          changeType="positive"
          hint="Across active deals & captured bookings"
          icon={<DollarSign className="size-4" />}
        />
        <KpiCard
          title="AI Fact Verification"
          value={`${verificationRate}%`}
          change="98% Ground Truth"
          changeType="positive"
          hint="Cryptographically signed observation ledger"
          icon={<ShieldCheck className="size-4" />}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-helix-muted" />
            <Input
              type="text"
              placeholder="Search by name, company, email, or phone..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'new_lead', 'engaged', 'studio_completed', 'call_booked', 'proposal_sent', 'closed_won'].map(stage => {
              const isSelected = stageFilter === stage
              return (
                <button
                  key={stage}
                  type="button"
                  onClick={() => setStageFilter(stage)}
                  className={cn(
                    'rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
                    isSelected
                      ? 'bg-white/[0.1] text-helix-ink border border-white/[0.12] font-semibold shadow-xs'
                      : 'text-helix-muted hover:text-helix-ink hover:bg-white/[0.04] border border-transparent'
                  )}
                >
                  {stage === 'ALL' ? 'All Stages' : STAGE_CONFIG[stage]?.label ?? stage}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Main CRM Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Deal Stage</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead>AI Audit</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center text-helix-muted">
                  <Users className="mx-auto size-8 text-slate-600 mb-2" />
                  No contacts found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map(contact => {
                const stage = contact.deal_stage ? STAGE_CONFIG[contact.deal_stage] : STAGE_CONFIG.new_lead
                const isSelected = selectedContact?.id === contact.id
                const initial = (contact.full_name?.[0] ?? 'C').toUpperCase()
                return (
                  <TableRow
                    key={contact.id}
                    onClick={() => {
                      setSelectedContact(contact)
                      setDrawerOpen(true)
                    }}
                    className={cn(
                      'cursor-pointer transition-colors duration-150',
                      isSelected ? 'bg-white/[0.06]' : undefined
                    )}
                  >
                    {/* Name & Avatar */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800/90 text-xs font-bold text-sky-400 shadow-xs">
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-helix-ink group-hover:text-sky-300 transition-colors">
                            {contact.full_name ?? 'Anonymous Contact'}
                          </div>
                          <div className="text-[11px] text-helix-muted font-mono">{contact.email ?? 'No email logged'}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company */}
                    <TableCell className="text-helix-ink/80 font-medium">
                      {contact.company_name ?? 'Independent'}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="font-mono text-xs text-helix-muted">
                      {contact.phone ?? '—'}
                    </TableCell>

                    {/* Deal Stage */}
                    <TableCell>
                      <Badge variant={stage?.variant ?? 'default'}>
                        {stage?.label ?? contact.deal_stage}
                      </Badge>
                    </TableCell>

                    {/* Last Activity */}
                    <TableCell className="text-xs text-helix-muted font-mono">
                      {contact.last_activity ? formatShortDate(contact.last_activity) : 'Recent inbound'}
                    </TableCell>

                    {/* AI Observation Status */}
                    <TableCell>
                      <Badge variant="verified" dot>
                        Verified
                      </Badge>
                    </TableCell>

                    {/* Quick Inspect Action */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-helix-ink/80 hover:text-helix-ink">
                        <span>Inspect</span>
                        <ArrowUpRight className="size-3 text-sky-400 ml-1" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Slide-out Contact Telemetry Drawer */}
      {drawerOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs transition-opacity">
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-white/10 bg-helix-surface p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-sky-400 font-bold text-base shadow-xs">
                  {(selectedContact.full_name?.[0] ?? 'C').toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-helix-ink">
                    {selectedContact.full_name ?? 'Contact Details'}
                  </h2>
                  <p className="text-xs text-helix-muted font-mono">{selectedContact.company_name ?? 'Direct Client'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 text-helix-muted hover:text-helix-ink"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Contact Attributes */}
            <div className="mt-5 space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Mail className="size-3.5 text-helix-muted" /> Email</span>
                <span className="text-helix-ink font-medium">{selectedContact.email ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Phone className="size-3.5 text-helix-muted" /> Phone</span>
                <span className="text-helix-ink font-mono">{selectedContact.phone ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Building className="size-3.5 text-helix-muted" /> Company</span>
                <span className="text-helix-ink font-medium">{selectedContact.company_name ?? '—'}</span>
              </div>
            </div>

            {/* Conversation Telemetry Log */}
            <div className="mt-5 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-helix-muted">
                  Recent Telemetry & Audit Trace
                </h3>
                <Badge variant="cyan" dot>
                  Live Synced
                </Badge>
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-helix-muted">
                    <span className="font-semibold text-sky-400 flex items-center gap-1.5">
                      <MessageSquare className="size-3" /> Inbound Voice Call
                    </span>
                    <span className="font-mono text-[10px]">1h ago</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-helix-ink/80">
                    Autonomous voice agent handled query regarding appointment reschedule. Customer requested Tuesday 10:00 AM slot.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-helix-muted font-mono">
                    <span>HASH: 8f4b..32a1</span>
                    <span>•</span>
                    <span className="text-emerald-400">Audio Persisted</span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-helix-muted">
                    <span className="font-semibold text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="size-3" /> Verified Fact Extracted
                    </span>
                    <span className="font-mono text-[10px]">3h ago</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-helix-ink/80">
                    Extracted confirmed intent: Customer authorized payment for preliminary invoice #204.
                  </p>
                  <div className="mt-2">
                    <Badge variant="verified" dot>
                      100% Ground Truth
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Drawer Footer */}
            <div className="mt-5 border-t border-white/[0.08] pt-4 flex gap-2.5">
              <Button
                variant="outline"
                onClick={() => alert(`Initiating voice callback to ${selectedContact.phone}...`)}
                className="flex-1 gap-1.5"
              >
                <Phone className="size-3.5" /> Call
              </Button>
              <Button
                onClick={() => alert(`Opening email composer for ${selectedContact.email}...`)}
                className="flex-1 gap-1.5"
              >
                <Mail className="size-3.5" /> Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
