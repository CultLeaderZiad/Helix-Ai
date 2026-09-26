'use client'

import { useActionState, useState } from 'react'
import { createContact, type CreateContactState } from '@/lib/crm/contacts'
import type { DirectoryActivity, DirectoryContactRow } from '@/lib/crm/directory'
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

export type CrmContactRow = DirectoryContactRow

interface WholeCrmViewProps {
  contacts: CrmContactRow[]
  totalContacts: number
  pipelineValueCents: number
  verifiedFactCount: number
  totalFactCount: number
  activities?: DirectoryActivity[]
  allowCreate?: boolean
}

const STAGE_CONFIG: Record<string, { label: string; variant: 'verified' | 'probable' | 'possible' | 'demo' | 'default' }> = {
  new_lead: { label: 'New Lead', variant: 'demo' },
  engaged: { label: 'Engaged', variant: 'demo' },
  studio_completed: { label: 'Studio Done', variant: 'possible' },
  call_booked: { label: 'Call Booked', variant: 'probable' },
  proposal_sent: { label: 'Proposal Sent', variant: 'probable' },
  closed_won: { label: 'Closed Won', variant: 'verified' },
  closed_lost: { label: 'Closed Lost', variant: 'default' },
  // Legacy
  QUALIFIED_TO_BUY: { label: 'Qualified', variant: 'demo' },
  CONTRACT_SENT: { label: 'Contract Sent', variant: 'possible' },
  DEMO_BOOKED: { label: 'Demo Booked', variant: 'demo' },
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

const idleContact: CreateContactState = { status: 'idle' }

export function WholeCrmView({
  contacts,
  totalContacts,
  pipelineValueCents,
  verifiedFactCount,
  totalFactCount,
  activities = [],
  allowCreate = false,
}: WholeCrmViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [selectedContact, setSelectedContact] = useState<CrmContactRow | null>(contacts[0] ?? null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [createState, createAction, createPending] = useActionState(createContact, idleContact)

  const verificationRate = totalFactCount > 0 ? Math.round((verifiedFactCount / totalFactCount) * 100) : null

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
    <div className="relative w-full space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="demo" dot className="mb-2">
            CRM INTELLIGENCE & TELEMETRY
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-xs text-helix-muted max-w-2xl">
            Realtime customer profiles, deal pipeline stages, and human-verified agent observations.
          </p>
        </div>

        {allowCreate ? (
          <Button type="button" size="sm" onClick={() => setShowCreate(value => !value)} className="gap-1.5">
            <Plus className="size-3.5" />
            <span>Add Contact</span>
          </Button>
        ) : (
          <p className="max-w-xs text-xs text-helix-muted">
            Add contacts from a client workspace. This agency view is read-only.
            <span className="mt-1 block" dir="rtl" lang="ar">
              أضف جهات الاتصال من مساحة عمل العميل. عرض الوكالة للقراءة فقط.
            </span>
          </p>
        )}
      </div>

      {showCreate && allowCreate ? (
        <Card className="p-4">
          <form action={createAction} className="grid gap-3 sm:grid-cols-2">
            <Input name="full_name" required placeholder="Full name" className="h-9 text-xs" />
            <Input name="email" type="email" placeholder="Email" className="h-9 text-xs" />
            <Input name="phone" placeholder="Phone" className="h-9 text-xs" />
            <Input name="company_name" placeholder="Company" className="h-9 text-xs" />
            <div className="sm:col-span-2 flex items-center justify-between gap-3">
              <Button type="submit" size="sm" disabled={createPending}>
                {createPending ? 'Saving…' : 'Save contact'}
              </Button>
              <p className="text-xs text-helix-muted" dir="rtl" lang="ar">
                حفظ جهة اتصال
              </p>
            </div>
            {createState.status !== 'idle' && createState.message ? (
              <p
                role="status"
                className={`sm:col-span-2 text-xs ${createState.status === 'error' ? 'text-status-danger' : 'text-helix-muted'}`}
              >
                {createState.message}
                {createState.messageAr ? (
                  <span className="mt-1 block" dir="rtl" lang="ar">
                    {createState.messageAr}
                  </span>
                ) : null}
              </p>
            ) : null}
          </form>
        </Card>
      ) : null}

      {/* KPI Metric Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Contacts"
          value={totalContacts}
          hint="Rows stored for this workspace"
          icon={<Users className="size-4" />}
        />
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValueCents)}
          hint="Sum of deal values on file"
          icon={<DollarSign className="size-4" />}
        />
        <KpiCard
          title="AI Fact Verification"
          value={verificationRate == null ? '—' : `${verificationRate}%`}
          hint={verificationRate == null ? 'No facts recorded' : 'Verified facts divided by facts on file'}
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
                      ? 'bg-white/[0.1] text-ink border border-white/[0.12] font-semibold shadow-xs'
                      : 'text-helix-muted hover:text-ink hover:bg-white/[0.04] border border-transparent'
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
                  {contacts.length === 0
                    ? 'No contacts yet. Add one when you have a real lead.'
                    : 'No contacts found matching your criteria.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredContacts.map(contact => {
                const stage = contact.deal_stage ? STAGE_CONFIG[contact.deal_stage] : null
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
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-helix-border bg-helix-canvas text-xs font-bold text-ink shadow-xs">
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-ink transition-colors">
                            {contact.full_name ?? 'Anonymous Contact'}
                          </div>
                          <div className="text-[11px] text-helix-muted font-mono">{contact.email ?? 'No email logged'}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company */}
                    <TableCell className="text-ink/80 font-medium">
                      {contact.company_name ?? 'Independent'}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="font-mono text-xs text-helix-muted">
                      {contact.phone ?? '—'}
                    </TableCell>

                    {/* Deal Stage */}
                    <TableCell>
                      <Badge variant={stage?.variant ?? 'default'}>
                        {stage?.label ?? 'No deal'}
                      </Badge>
                    </TableCell>

                    {/* Last Activity */}
                    <TableCell className="text-xs text-helix-muted font-mono">
                      {contact.last_activity ? formatShortDate(contact.last_activity) : '—'}
                    </TableCell>

                    {/* AI Observation Status */}
                    <TableCell>
                      <Badge variant={contact.fact_status ?? 'default'} dot={contact.fact_status === 'verified'}>
                        {contact.fact_status ?? 'No facts'}
                      </Badge>
                    </TableCell>

                    {/* Quick Inspect Action */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-ink/80 hover:text-ink">
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
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-helix-border bg-helix-surface p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-helix-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg border border-helix-border bg-helix-canvas text-ink font-bold text-base shadow-xs">
                  {(selectedContact.full_name?.[0] ?? 'C').toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-ink">
                    {selectedContact.full_name ?? 'Contact Details'}
                  </h2>
                  <p className="text-xs text-helix-muted font-mono">{selectedContact.company_name ?? 'Direct Client'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 text-helix-muted hover:text-ink"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Contact Attributes */}
            <div className="mt-5 space-y-3 rounded-xl border border-helix-border bg-helix-canvas p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Mail className="size-3.5 text-helix-muted" /> Email</span>
                <span className="text-ink font-medium">{selectedContact.email ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Phone className="size-3.5 text-helix-muted" /> Phone</span>
                <span className="text-ink font-mono">{selectedContact.phone ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-helix-muted flex items-center gap-2"><Building className="size-3.5 text-helix-muted" /> Company</span>
                <span className="text-ink font-medium">{selectedContact.company_name ?? '—'}</span>
              </div>
            </div>

            <div className="mt-5 flex-1 overflow-y-auto">
              <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-helix-muted">
                Recorded activity
              </h3>
              <div className="mt-3 space-y-3">
                {activities.filter(item => item.contact_id === selectedContact.id).length === 0 ? (
                  <p className="text-xs text-helix-muted">
                    No activity recorded yet.
                    <span className="mt-1 block" dir="rtl" lang="ar">
                      لا يوجد نشاط مسجّل بعد.
                    </span>
                  </p>
                ) : (
                  activities
                    .filter(item => item.contact_id === selectedContact.id)
                    .map(item => (
                      <div key={item.id ?? item.occurred_at ?? item.type} className="rounded-xl border border-helix-border bg-helix-canvas p-3.5">
                        <p className="text-[11px] font-semibold text-ink">{item.type || 'Activity'}</p>
                        <p className="mt-1 text-xs text-ink">{item.subject || item.body || 'No note stored.'}</p>
                        <p className="mt-1 font-mono text-[10px] text-helix-muted">
                          {item.occurred_at ? formatShortDate(item.occurred_at) : '—'}
                        </p>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="mt-5 border-t border-helix-border pt-4 flex gap-2.5">
              {selectedContact.phone ? (
                <a href={`tel:${selectedContact.phone}`} className="flex-1">
                  <Button variant="outline" className="w-full gap-1.5">
                    <Phone className="size-3.5" /> Call
                  </Button>
                </a>
              ) : (
                <Button variant="outline" disabled className="flex-1 gap-1.5" title="No phone on file. Voice calling is not connected.">
                  <Phone className="size-3.5" /> Call
                </Button>
              )}
              {selectedContact.email ? (
                <a href={`mailto:${selectedContact.email}`} className="flex-1">
                  <Button className="w-full gap-1.5">
                    <Mail className="size-3.5" /> Email
                  </Button>
                </a>
              ) : (
                <Button disabled className="flex-1 gap-1.5" title="No email on file.">
                  <Mail className="size-3.5" /> Email
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
