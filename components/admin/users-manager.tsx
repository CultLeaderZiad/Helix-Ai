'use client'

import { useState, useTransition } from 'react'
import {
  ShieldCheck,
  UserPlus,
  Search,
  Building2,
  Mail,
  User,
  Key,
  Check,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  MoreVertical,
  Trash2,
  Sparkles,
} from 'lucide-react'
import type { UserRole, Profile } from '@/lib/schema'
import { inviteOrRegisterUser, updateUserRole, deleteUser } from '@/lib/admin/user-actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { KpiCard } from '@/components/ui/kpi-card'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface ClientOption {
  id: string
  business_name: string
}

interface UserWithClient extends Profile {
  clientName?: string
}

interface UsersManagerProps {
  initialUsers: UserWithClient[]
  clients: ClientOption[]
  currentUserId: string
}

export function UsersManager({ initialUsers, clients, currentUserId }: UsersManagerProps) {
  const [users, setUsers] = useState<UserWithClient[]>(initialUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserWithClient | null>(null)

  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Invite Form State
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('client_user')
  const [inviteClientId, setInviteClientId] = useState<string>(clients[0]?.id || '')
  const [invitePassword, setInvitePassword] = useState('HelixUser2026!')

  // Edit/Upgrade Role State
  const [newRole, setNewRole] = useState<UserRole>('agency_admin')
  const [targetClientId, setTargetClientId] = useState<string>(clients[0]?.id || '')

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      (user.full_name?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (user.clientName?.toLowerCase().includes(search.toLowerCase()) ?? false)

    const matchesRole = roleFilter === 'all' ? true : user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const adminCount = users.filter(u => u.role === 'agency_admin').length
  const clientUserCount = users.filter(u => u.role === 'client_user').length
  const staffCount = users.filter(u => u.role === 'client_staff').length

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    startTransition(async () => {
      const res = await inviteOrRegisterUser({
        email: inviteEmail,
        fullName: inviteName,
        role: inviteRole,
        clientId: inviteRole === 'agency_admin' ? null : inviteClientId,
        password: invitePassword,
      })

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to invite user.' })
        return
      }

      setFeedback({ type: 'success', message: res.message || 'User successfully invited.' })
      setIsInviteOpen(false)
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('HelixUser2026!')

      // Local optimistic update
      const client = clients.find(c => c.id === inviteClientId)
      setUsers(prev => [
        {
          id: crypto.randomUUID(),
          email: inviteEmail,
          full_name: inviteName,
          role: inviteRole,
          client_id: inviteRole === 'agency_admin' ? null : inviteClientId,
          clientName: inviteRole === 'agency_admin' ? 'Agency Console' : client?.business_name,
          created_at: new Date().toISOString(),
        },
        ...prev.filter(u => u.email?.toLowerCase() !== inviteEmail.toLowerCase()),
      ])
    })
  }

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setFeedback(null)

    startTransition(async () => {
      const res = await updateUserRole(
        editingUser.id,
        newRole,
        newRole === 'agency_admin' ? null : targetClientId
      )

      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to update role.' })
        return
      }

      setFeedback({ type: 'success', message: res.message || 'User role successfully updated.' })
      const client = clients.find(c => c.id === targetClientId)

      setUsers(prev =>
        prev.map(u =>
          u.id === editingUser.id
            ? {
                ...u,
                role: newRole,
                client_id: newRole === 'agency_admin' ? null : targetClientId,
                clientName: newRole === 'agency_admin' ? 'Agency Console' : client?.business_name,
              }
            : u
        )
      )
      setEditingUser(null)
    })
  }

  const handleDelete = (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to remove user ${email}? This action cannot be undone.`)) {
      return
    }

    startTransition(async () => {
      const res = await deleteUser(userId)
      if (!res.success) {
        setFeedback({ type: 'error', message: res.error || 'Failed to delete user.' })
        return
      }
      setFeedback({ type: 'success', message: 'User removed.' })
      setUsers(prev => prev.filter(u => u.id !== userId))
    })
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Badge variant="demo" dot className="mb-2">
            IDENTITY & ACCESS CONTROL
          </Badge>
          <h1 className="font-display text-2xl font-bold tracking-tight text-helix-ink sm:text-3xl">
            Team & Role Management
          </h1>
          <p className="mt-1 text-xs text-helix-muted max-w-2xl">
            Provision new user accounts, upgrade agency administrator privileges, and assign client workspace scopes.
          </p>
        </div>

        <Button
          type="button"
          size="sm"
          onClick={() => {
            setFeedback(null)
            setIsInviteOpen(true)
          }}
          className="gap-1.5"
        >
          <UserPlus className="size-3.5" />
          <span>Invite New User</span>
        </Button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-3.5 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="size-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="size-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total Users"
          value={users.length}
          change="Active Accounts"
          changeType="positive"
          hint="Authorized identities across the cluster"
          icon={<User className="size-4" />}
        />

        <KpiCard
          title="Agency Administrators"
          value={adminCount}
          change="Full Authority"
          changeType="positive"
          hint="Superuser clearance across all tenants"
          icon={<ShieldCheck className="size-4 text-purple-400" />}
        />

        <KpiCard
          title="Client Workspace Operators"
          value={clientUserCount + staffCount}
          change={`Across ${clients.length} Workspaces`}
          changeType="positive"
          hint="Scoped by PostgreSQL Row-Level Security"
          icon={<Building2 className="size-4 text-sky-400" />}
        />
      </div>

      {/* Search & Filters */}
      <Card className="p-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative min-w-[260px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-helix-muted" />
            <Input
              type="text"
              placeholder="Search by name, email, or client workspace..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(
              [
                { id: 'all', label: `All (${users.length})` },
                { id: 'agency_admin', label: `Agency Admins (${adminCount})` },
                { id: 'client_user', label: `Client Owners (${clientUserCount})` },
                { id: 'client_staff', label: `Staff (${staffCount})` },
              ] as const
            ).map(tab => {
              const active = roleFilter === tab.id
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRoleFilter(tab.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'bg-white/[0.1] text-helix-ink border border-white/[0.12] font-semibold shadow-xs'
                      : 'text-helix-muted hover:text-helix-ink hover:bg-white/[0.04] border border-transparent'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User Identity</TableHead>
              <TableHead>Role Authority</TableHead>
              <TableHead>Assigned Workspace</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-10 text-center text-helix-muted font-mono text-xs">
                  No users matching the active filter.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map(user => {
                const isCurrent = user.id === currentUserId
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-xs font-bold text-sky-400 shadow-xs">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-helix-ink flex items-center gap-1.5">
                            {user.full_name || 'Anonymous User'}
                            {isCurrent && (
                              <Badge variant="default" className="text-[9px] px-1.5 py-0">
                                YOU
                              </Badge>
                            )}
                          </div>
                          <div className="text-helix-muted text-[11px] font-mono">{user.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.role === 'agency_admin' && (
                        <Badge variant="possible" dot>
                          Agency Admin
                        </Badge>
                      )}
                      {user.role === 'client_user' && (
                        <Badge variant="demo" dot>
                          Client Owner
                        </Badge>
                      )}
                      {user.role === 'client_staff' && (
                        <Badge variant="default">
                          Client Staff
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      <span className="font-medium text-helix-ink">
                        {user.role === 'agency_admin' ? (
                          <span className="text-purple-300 font-mono text-[11px]">Global Agency Console</span>
                        ) : (
                          user.clientName || 'Unassigned Workspace'
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="text-helix-muted text-xs font-mono">
                      {new Date(user.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingUser(user)
                            setNewRole(user.role)
                            setTargetClientId(user.client_id || clients[0]?.id || '')
                          }}
                          className="h-7 px-2.5 text-xs text-sky-400 border-sky-500/30 hover:border-sky-500/50 hover:bg-sky-500/10 gap-1"
                        >
                          <ShieldCheck className="size-3" />
                          <span>Role</span>
                        </Button>

                        {!isCurrent && (
                          <Button
                            variant="destructive"
                            size="icon-xs"
                            onClick={() => handleDelete(user.id, user.email || '')}
                            title="Delete user"
                            className="size-7"
                          >
                            <Trash2 className="size-3" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-helix-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-helix-ink">
                <UserPlus className="size-4 text-sky-400" />
                <span>Invite & Provision New User</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsInviteOpen(false)}
                className="h-7 w-7 text-helix-muted hover:text-helix-ink"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                  User Full Name
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                  Work Email Address
                </label>
                <Input
                  type="email"
                  required
                  placeholder="e.g. alex@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="mt-1.5 h-10"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                  Role Authority
                </label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#161E31] px-3.5 text-xs text-helix-ink focus:border-sky-500 focus:outline-none"
                >
                  <option value="agency_admin">Agency Administrator (Full Agency Access)</option>
                  <option value="client_user">Client Owner (Manage Client Workspace)</option>
                  <option value="client_staff">Client Staff (Operator)</option>
                </select>
                <p className="mt-1 text-[11px] text-helix-muted">
                  {inviteRole === 'agency_admin'
                    ? 'Grants access to /admin, all clients, CRM cross-tenant records, and billing.'
                    : 'Constrained by RLS to their assigned client workspace only.'}
                </p>
              </div>

              {inviteRole !== 'agency_admin' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                    Assign to Client Workspace
                  </label>
                  <select
                    value={inviteClientId}
                    onChange={e => setInviteClientId(e.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#161E31] px-3.5 text-xs text-helix-ink focus:border-sky-500 focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                  Initial Password
                </label>
                <Input
                  type="text"
                  required
                  value={invitePassword}
                  onChange={e => setInvitePassword(e.target.value)}
                  className="mt-1.5 h-10 font-mono"
                />
                <p className="mt-1 text-[11px] text-helix-muted">
                  User can immediately log in with this password and change it anytime.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <Button
                  variant="outline"
                  onClick={() => setIsInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    'Provision & Save User'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Upgrade Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-helix-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-helix-ink">
                <ShieldCheck className="size-4 text-purple-400" />
                <span>Upgrade / Change User Role</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingUser(null)}
                className="h-7 w-7 text-helix-muted hover:text-helix-ink"
              >
                ✕
              </Button>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-[#161E31] p-3.5 text-xs text-helix-ink/80">
              <p className="font-semibold text-helix-ink">{editingUser.full_name || 'User'}</p>
              <p className="text-helix-muted font-mono text-[11px]">{editingUser.email}</p>
              <p className="mt-2 text-helix-muted">
                Current Role:{' '}
                <strong className="text-sky-300 font-semibold">{editingUser.role}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateRole} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                  Select New Role Authority
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#161E31] px-3.5 text-xs text-helix-ink focus:border-sky-500 focus:outline-none"
                >
                  <option value="agency_admin">Agency Administrator (Full Agency Access)</option>
                  <option value="client_user">Client Owner (Workspace Operator)</option>
                  <option value="client_staff">Client Staff</option>
                </select>
                <div className="mt-2">
                  {newRole === 'agency_admin' ? (
                    <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-2.5 text-[11px] text-purple-200">
                      ★ <strong>Upgrading to Agency Admin:</strong> User will gain immediate access to the
                      Agency Console (`/admin`), cross-client CRM, template builds, and agent queues.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-[#161E31] p-2.5 text-[11px] text-helix-muted">
                      User will be scoped to their specific assigned workspace under Postgres RLS.
                    </div>
                  )}
                </div>
              </div>

              {newRole !== 'agency_admin' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-helix-muted">
                    Assign to Client Workspace
                  </label>
                  <select
                    value={targetClientId}
                    onChange={e => setTargetClientId(e.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-white/10 bg-[#161E31] px-3.5 text-xs text-helix-ink focus:border-sky-500 focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
                <Button
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-helix-ink hover:from-purple-400 hover:to-indigo-500"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Confirm Role Change'
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
