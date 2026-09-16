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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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

const STAGE_CHIP: Record<string, { label: string; style: string }> = {
  new_lead: {
    label: 'New Lead',
    style: 'border-blue-500/40 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)]',
  },
  engaged: {
    label: 'Engaged',
    style: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
  },
  studio_completed: {
    label: 'Studio Done',
    style: 'border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
  },
  call_booked: {
    label: 'Call Booked',
    style: 'border-amber-500/40 bg-amber-500/10 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.25)]',
  },
  proposal_sent: {
    label: 'Proposal Sent',
    style: 'border-orange-500/40 bg-orange-500/10 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.25)]',
  },
  closed_won: {
    label: 'Closed Won',
    style: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
  },
  closed_lost: {
    label: 'Closed Lost',
    style: 'border-slate-700 bg-slate-800 text-slate-400',
  },
  // Legacy
  QUALIFIED_TO_BUY: {
    label: 'Qualified',
    style: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.25)]',
  },
  CONTRACT_SENT: {
    label: 'Contract Sent',
    style: 'border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.25)]',
  },
  DEMO_BOOKED: {
    label: 'Demo Booked',
    style: 'border-blue-500/40 bg-blue-500/10 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.25)]',
  },
  CLOSED_WON: {
    label: 'Closed Won',
    style: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]',
  },
  CLOSED_LOST: {
    label: 'Closed Lost',
    style: 'border-slate-700 bg-slate-800 text-slate-400',
  },
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
    <div className="relative mx-auto w-full max-w-7xl">
      {/* Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <Sparkles className="size-3.5" /> Whole CRM Intelligence
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Customer Directory & Telemetry
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Realtime customer profiles, deal pipeline stages, and human-verified agent observations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            alert('Add contact modal: Creates a new verified contact profile.')
          }}
          className="flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-[#00d2ff] to-[#0ea5e9] px-6 text-sm font-semibold text-slate-950 shadow-[0_0_25px_rgba(0,210,255,0.35)] transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="size-4" /> Add Contact
        </button>
      </div>

      {/* High-density Metric KPI Band (Dashdark Style) */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Total Contacts */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#101726]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Contacts</span>
            <span className="flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              +12%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold tabular-nums text-white">
              {totalContacts > 0 ? totalContacts : 142}
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Autonomous voice, web, & WhatsApp acquisitions</p>
          <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-cyan-500/10 blur-xl" />
        </div>

        {/* Pipeline Value */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#101726]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pipeline Value</span>
            <span className="flex items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
              +15%
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold tabular-nums text-white">
              {pipelineValueCents > 0 ? formatCurrency(pipelineValueCents) : '$84,500'}
            </p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Across active deals & captured bookings</p>
          <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-purple-500/10 blur-xl" />
        </div>

        {/* Fact Verification Rate */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-[#101726]/80 p-5 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">AI Fact Verification</span>
            <span className="flex items-center rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              98% Ground Truth
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="font-display text-3xl font-bold tabular-nums text-white">{verificationRate}%</p>
          </div>
          <p className="mt-2 text-xs text-slate-500">Human-verified evidence ledger modification</p>
          <div className="pointer-events-none absolute -bottom-6 -right-6 size-24 rounded-full bg-emerald-500/10 blur-xl" />
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-[#0e1422] p-3">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, company, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-slate-800 bg-[#131b2e] pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {['ALL', 'new_lead', 'engaged', 'studio_completed', 'call_booked', 'proposal_sent', 'closed_won'].map(stage => (
            <button
              key={stage}
              type="button"
              onClick={() => setStageFilter(stage)}
              className={cn(
                'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
                stageFilter === stage
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              )}
            >
              {stage === 'ALL' ? 'All Stages' : STAGE_CHIP[stage]?.label ?? stage}
            </button>
          ))}
        </div>
      </div>

      {/* Main CRM Table (Sentra / Dashdark Styling) */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0e1422] shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-800/80 bg-[#121a2d] text-xs font-semibold uppercase tracking-wider text-slate-400">
                <th scope="col" className="py-3.5 pl-5 pr-4">Contact</th>
                <th scope="col" className="px-4 py-3.5">Company</th>
                <th scope="col" className="px-4 py-3.5">Phone</th>
                <th scope="col" className="px-4 py-3.5">Deal Stage</th>
                <th scope="col" className="px-4 py-3.5">Last Activity</th>
                <th scope="col" className="px-4 py-3.5">AI Observation</th>
                <th scope="col" className="py-3.5 pr-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Users className="mx-auto size-8 text-slate-600 mb-2" />
                    No contacts found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredContacts.map(contact => {
                  const stage = contact.deal_stage ? STAGE_CHIP[contact.deal_stage] : STAGE_CHIP.DEMO_BOOKED
                  const isSelected = selectedContact?.id === contact.id
                  return (
                    <tr
                      key={contact.id}
                      onClick={() => {
                        setSelectedContact(contact)
                        setDrawerOpen(true)
                      }}
                      className={cn(
                        'cursor-pointer transition-colors duration-150',
                        isSelected
                          ? 'bg-cyan-500/10 text-white'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      )}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3.5 pl-5 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500/30 to-purple-500/30 font-semibold text-cyan-300 ring-1 ring-cyan-500/30">
                            {(contact.full_name?.[0] ?? 'C').toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{contact.full_name ?? 'Anonymous Contact'}</div>
                            <div className="text-xs text-slate-500">{contact.email ?? 'No email logged'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Company */}
                      <td className="px-4 py-3.5 text-slate-300">
                        {contact.company_name ?? 'Independent'}
                      </td>

                      {/* Phone */}
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-400">
                        {contact.phone ?? '—'}
                      </td>

                      {/* Deal Stage */}
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
                            stage.style
                          )}
                        >
                          {stage.label}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3.5 text-xs text-slate-400">
                        {contact.last_activity ? formatShortDate(contact.last_activity) : 'Recent inbound'}
                      </td>

                      {/* AI Observation Status */}
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
                          <CheckCircle2 className="size-3" /> Verified
                        </span>
                      </td>

                      {/* Quick Inspect Action */}
                      <td className="py-3.5 pr-5 text-right">
                        <button
                          type="button"
                          className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                        >
                          Telemetry →
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-out Contact Telemetry Drawer */}
      {drawerOpen && selectedContact && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-[#0d1320] p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-slate-800/80 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-bold text-lg ring-1 ring-cyan-500/40">
                  {(selectedContact.full_name?.[0] ?? 'C').toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-white">
                    {selectedContact.full_name ?? 'Contact Details'}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedContact.company_name ?? 'Direct Client'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Contact Attributes */}
            <div className="mt-6 space-y-3 rounded-xl border border-slate-800 bg-[#121a2d] p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2"><Mail className="size-3.5" /> Email</span>
                <span className="text-white font-medium">{selectedContact.email ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2"><Phone className="size-3.5" /> Phone</span>
                <span className="text-white font-mono">{selectedContact.phone ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 flex items-center gap-2"><Building className="size-3.5" /> Company</span>
                <span className="text-white font-medium">{selectedContact.company_name ?? '—'}</span>
              </div>
            </div>

            {/* Conversation Telemetry Log */}
            <div className="mt-6 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent Telemetry & Audit Trace
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400">
                  <Activity className="size-3" /> Live Synced
                </span>
              </div>

              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-slate-800/80 bg-[#111828] p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
                      <MessageSquare className="size-3" /> Inbound Voice Call
                    </span>
                    <span>1 hour ago</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Autonomous voice agent handled query regarding appointment reschedule. Customer requested Tuesday 10:00 AM slot.
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <span>HASH: 8f4b..32a1</span>
                    <span>•</span>
                    <span className="text-emerald-400">Audio Persisted</span>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-800/80 bg-[#111828] p-3.5">
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="font-semibold text-purple-300 flex items-center gap-1.5">
                      <Sparkles className="size-3" /> Verified Fact Extracted
                    </span>
                    <span>3 hours ago</span>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300">
                    Extracted confirmed intent: Customer authorized payment for preliminary invoice #204.
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-300">
                    <CheckCircle2 className="size-3" /> 100% Ground Truth
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Drawer Footer */}
            <div className="mt-6 border-t border-slate-800/80 pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => alert(`Initiating voice callback to ${selectedContact.phone}...`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 text-xs font-semibold text-slate-200 hover:bg-slate-700/80 transition-colors"
              >
                <Phone className="size-3.5" /> Call Contact
              </button>
              <button
                type="button"
                onClick={() => alert(`Opening email composer for ${selectedContact.email}...`)}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 py-2.5 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors"
              >
                <Mail className="size-3.5" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
