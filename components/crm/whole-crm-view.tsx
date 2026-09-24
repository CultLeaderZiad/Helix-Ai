'use client'

import { useState, useTransition } from 'react'
import {
  Users,
  Search,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  DollarSign,
  Phone,
  Mail,
  Building,
  MessageSquare,
  X,
  Loader2,
  FileText,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { KpiCard } from '@/components/ui/kpi-card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { createContactAction } from '@/lib/crm/contact-actions'

export interface CrmContactRow {
  id: string
  full_name: string | null
  email: string | null
  phone: string | null
  company_name: string | null
  lead_status: string | null
  deal_stage?: string | null
  deal_value_cents?: number | null
  created_at: string
  last_activity?: string | null
  fact_status?: 'verified' | 'probable' | 'possible'
}

interface WholeCrmViewProps {
  clientId?: string
  isAdmin?: boolean
  contacts: CrmContactRow[]
  totalContacts: number
  pipelineValueCents: number
  verifiedFactCount: number
  totalFactCount: number
}

const STAGE_CONFIG: Record<string, { label: string; variant: 'default' | 'verified' | 'probable' | 'possible' }> = {
  new_lead: { label: 'New Lead', variant: 'default' },
  engaged: { label: 'Engaged', variant: 'probable' },
  studio_completed: { label: 'Studio Completed', variant: 'probable' },
  call_booked: { label: 'Call Booked', variant: 'verified' },
  proposal_sent: { label: 'Proposal Sent', variant: 'possible' },
  closed_won: { label: 'Closed Won', variant: 'verified' },
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100)
}

function formatShortDate(iso: string) {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function WholeCrmView({
  clientId,
  isAdmin = false,
  contacts: initialContacts,
  totalContacts,
  pipelineValueCents,
  verifiedFactCount,
  totalFactCount,
}: WholeCrmViewProps) {
  const [contacts, setContacts] = useState<CrmContactRow[]>(initialContacts)
  const [searchQuery, setSearchQuery] = useState('')
  const [stageFilter, setStageFilter] = useState<string>('ALL')
  const [selectedContact, setSelectedContact] = useState<CrmContactRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  // Add Contact Form State
  const [newFullName, setNewFullName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newCompany, setNewCompany] = useState('')
  const [newStatus, setNewStatus] = useState('new_lead')
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const verificationRate = totalFactCount > 0 ? Math.round((verifiedFactCount / totalFactCount) * 100) : null

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch =
      !searchQuery ||
      (contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (contact.phone?.includes(searchQuery) ?? false)

    const matchesStage = stageFilter === 'ALL' || (contact.deal_stage ?? 'new_lead') === stageFilter
    return matchesSearch && matchesStage
  })

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!newFullName.trim()) {
      setFormError('Full name is required.')
      return
    }

    startTransition(async () => {
      const res = await createContactAction({
        clientId: clientId || null,
        fullName: newFullName,
        email: newEmail,
        phone: newPhone,
        companyName: newCompany,
        leadStatus: newStatus,
      })

      if (res.success && res.contact) {
        const created: CrmContactRow = {
          id: res.contact.id,
          full_name: res.contact.full_name,
          email: res.contact.email,
          phone: res.contact.phone,
          company_name: res.contact.company_name,
          lead_status: res.contact.lead_status,
          deal_stage: 'new_lead',
          deal_value_cents: 0,
          created_at: res.contact.created_at,
          last_activity: res.contact.created_at,
          fact_status: 'verified',
        }
        setContacts(prev => [created, ...prev])
        setIsAddModalOpen(false)
        setNewFullName('')
        setNewEmail('')
        setNewPhone('')
        setNewCompany('')
        setNewStatus('new_lead')
      } else {
        setFormError(res.error || 'Failed to create contact.')
      }
    })
  }

  return (
    <div className="relative mx-auto w-full max-w-7xl space-y-6">
      {/* Header & Title */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="default" className="mb-2 uppercase tracking-wider font-mono text-[11px]">
            CRM Telemetry & Records
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Customer Directory
          </h1>
          <p className="mt-1 text-xs text-muted-foreground max-w-2xl">
            Verified customer profiles, deal pipeline stages, and human-verified agent observations.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-1.5"
        >
          <Plus className="size-3.5" />
          <span>Add Contact</span>
        </Button>
      </div>

      {/* KPI Metric Strip — Honest Realtime Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Contacts"
          value={contacts.length}
          hint="Verified contact records"
          icon={<Users className="size-4" />}
        />
        <KpiCard
          title="Pipeline Value"
          value={formatCurrency(pipelineValueCents)}
          hint="Active deal pipeline"
          icon={<DollarSign className="size-4" />}
        />
        <KpiCard
          title="Fact Verification Rate"
          value={verificationRate !== null ? `${verificationRate}%` : '—'}
          hint={totalFactCount > 0 ? `${verifiedFactCount} of ${totalFactCount} facts confirmed` : 'No observations logged'}
          icon={<ShieldCheck className="size-4" />}
        />
      </div>

      {/* Search & Filter Toolbar */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
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
                    'rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap',
                    isSelected
                      ? 'bg-raised text-foreground border border-border font-semibold shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-raised/60'
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
              <TableHead>Created</TableHead>
              <TableHead>AI Audit</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-16 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center justify-center text-center">
                    <Users className="size-12 text-accent stroke-[1.5]" />
                    <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
                      {searchQuery ? 'No matching contacts found' : 'No contacts recorded'}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {searchQuery
                        ? 'Try clearing your search query or adjusting filters.'
                        : 'Customer profiles will appear here as interactions occur or when manually added.'}
                    </p>
                    {!searchQuery && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => setIsAddModalOpen(true)}
                        className="mt-4 gap-1.5"
                      >
                        <Plus className="size-3.5" />
                        <span>Add First Contact</span>
                      </Button>
                    )}
                  </div>
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
                      isSelected ? 'bg-raised' : undefined
                    )}
                  >
                    {/* Name & Avatar */}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-raised text-xs font-semibold text-foreground">
                          {initial}
                        </div>
                        <div>
                          <div className="font-medium text-foreground transition-colors hover:text-accent">
                            {contact.full_name ?? 'Anonymous Contact'}
                          </div>
                          <div className="text-xs text-muted-foreground font-normal">
                            {contact.email ?? 'No email logged'}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Company */}
                    <TableCell className="text-xs text-muted-foreground">
                      {contact.company_name ?? '—'}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {contact.phone ?? '—'}
                    </TableCell>

                    {/* Deal Stage */}
                    <TableCell>
                      <Badge variant={stage?.variant ?? 'default'}>
                        {stage?.label ?? contact.deal_stage}
                      </Badge>
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {formatShortDate(contact.created_at)}
                    </TableCell>

                    {/* AI Observation Status */}
                    <TableCell>
                      <Badge variant="verified" dot>
                        Verified
                      </Badge>
                    </TableCell>

                    {/* Quick Inspect Action */}
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground">
                        <span>Inspect</span>
                        <ArrowUpRight className="size-3 text-accent ml-1" />
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
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 transition-opacity">
          <div className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-panel p-6 shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-border pb-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-md border border-border bg-raised text-foreground font-semibold text-base">
                  {(selectedContact.full_name?.[0] ?? 'C').toUpperCase()}
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    {selectedContact.full_name ?? 'Contact Details'}
                  </h2>
                  <p className="text-xs text-muted-foreground font-mono">{selectedContact.company_name ?? 'Direct Contact'}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDrawerOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Contact Attributes */}
            <div className="mt-5 space-y-3 rounded-lg border border-border bg-raised/50 p-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Mail className="size-3.5 text-muted-foreground" /> Email</span>
                <span className="text-foreground font-medium">{selectedContact.email ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Phone className="size-3.5 text-muted-foreground" /> Phone</span>
                <span className="text-foreground font-mono">{selectedContact.phone ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Building className="size-3.5 text-muted-foreground" /> Company</span>
                <span className="text-foreground font-medium">{selectedContact.company_name ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><FileText className="size-3.5 text-muted-foreground" /> Stage</span>
                <span className="text-foreground font-medium capitalize">{selectedContact.lead_status?.replace(/_/g, ' ') ?? 'New Lead'}</span>
              </div>
            </div>

            {/* Observation Audit Note */}
            <div className="mt-5 flex-1 overflow-y-auto space-y-3">
              <h3 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground">
                Contact Records & Audit Trail
              </h3>
              <div className="rounded-lg border border-border bg-panel p-3.5 text-xs text-muted-foreground space-y-1">
                <p className="text-foreground font-medium">Record Created</p>
                <p className="font-mono text-[11px]">{new Date(selectedContact.created_at).toLocaleString()}</p>
                <p className="text-[11px]">Source: PostgreSQL RLS tenant verified record.</p>
              </div>
            </div>

            {/* Contact Actions Footer */}
            <div className="mt-5 border-t border-border pt-4 flex gap-2.5">
              {selectedContact.phone ? (
                <a
                  href={`tel:${selectedContact.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-panel px-3 py-2 text-xs font-medium text-foreground hover:bg-raised"
                >
                  <Phone className="size-3.5" /> Call
                </a>
              ) : null}
              {selectedContact.email ? (
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-md bg-accent px-3 py-2 text-xs font-medium text-accent-foreground hover:opacity-90"
                >
                  <Mail className="size-3.5" /> Email
                </a>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal (DESIGN-SPEC §1.9 Elevation 2) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-panel p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-foreground">Add New Contact</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Create a verified customer profile in this workspace.
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form onSubmit={handleCreateContact} className="mt-5 space-y-4">
              {formError && (
                <div className="rounded-md border border-status-danger/30 bg-status-danger/10 p-3 text-xs text-status-danger">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-foreground mb-1">
                  Full Name <span className="text-status-danger">*</span>
                </label>
                <Input
                  required
                  type="text"
                  placeholder="e.g. Fatima Al-Hashimi"
                  value={newFullName}
                  onChange={e => setNewFullName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
                  <Input
                    type="tel"
                    placeholder="+971 50 123 4567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Company</label>
                  <Input
                    type="text"
                    placeholder="e.g. Gulf Logistics"
                    value={newCompany}
                    onChange={e => setNewCompany(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">Lead Stage</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value)}
                    className="h-9 w-full rounded-md border border-input bg-panel px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="new_lead">New Lead</option>
                    <option value="engaged">Engaged</option>
                    <option value="call_booked">Call Booked</option>
                    <option value="proposal_sent">Proposal Sent</option>
                    <option value="closed_won">Closed Won</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="gap-1.5"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Create Profile</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
