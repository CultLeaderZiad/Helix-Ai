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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-cyan-400">
            <ShieldCheck className="size-3.5" /> Identity & Access Control
          </div>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Team & Role Management
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Provision new user accounts, upgrade agency administrator privileges, and assign client workspace scopes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFeedback(null)
            setIsInviteOpen(true)
          }}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-4 py-2.5 text-xs font-bold text-slate-950 shadow-[0_0_20px_rgba(0,210,255,0.3)] hover:opacity-95 transition-opacity"
        >
          <UserPlus className="size-4" /> Invite New User
        </button>
      </div>

      {/* Global Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center gap-3 rounded-xl border p-4 text-xs font-medium ${
            feedback.type === 'success'
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/40 bg-red-500/10 text-red-300'
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
        <div className="rounded-2xl border border-slate-800 bg-[#0e1422] p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Users</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{users.length}</span>
            <span className="text-xs text-slate-400">active accounts</span>
          </div>
        </div>

        <div className="rounded-2xl border border-purple-500/20 bg-[#0e1422] p-5 shadow-[0_0_25px_rgba(168,85,247,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">Agency Administrators</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{adminCount}</span>
            <span className="text-xs text-purple-300">full authority</span>
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-[#0e1422] p-5 shadow-[0_0_25px_rgba(0,210,255,0.05)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Client Workspace Operators</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{clientUserCount + staffCount}</span>
            <span className="text-xs text-cyan-300">across {clients.length} workspaces</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-[#0e1422] p-4">
        <div className="relative min-w-[280px] flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, email, or client workspace..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] pl-10 pr-4 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none"
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
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-cyan-500/15 text-[#00f2fe] border border-cyan-500/40 shadow-[0_0_12px_rgba(0,210,255,0.2)]'
                    : 'text-slate-400 hover:text-white border border-transparent hover:bg-slate-800/60'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl border border-slate-800 bg-[#0e1422] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 bg-slate-900/60 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3.5">User Identity</th>
                <th className="px-6 py-3.5">Role Authority</th>
                <th className="px-6 py-3.5">Assigned Workspace</th>
                <th className="px-6 py-3.5">Joined</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">
                    No users matching the active filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrent = user.id === currentUserId
                  return (
                    <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 font-bold uppercase">
                            {user.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-white flex items-center gap-2">
                              {user.full_name || 'Anonymous User'}
                              {isCurrent && (
                                <span className="rounded-md bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400 border border-slate-700">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-slate-400 text-[11px] font-mono">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {user.role === 'agency_admin' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/40 bg-purple-500/15 px-3 py-1 text-xs font-semibold text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.2)]">
                            <Sparkles className="size-3 text-purple-400" /> Agency Admin
                          </span>
                        )}
                        {user.role === 'client_user' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300 shadow-[0_0_12px_rgba(0,210,255,0.2)]">
                            <Building2 className="size-3 text-cyan-400" /> Client Owner
                          </span>
                        )}
                        {user.role === 'client_staff' && (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-300">
                            Client Staff
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-white">
                          {user.role === 'agency_admin' ? (
                            <span className="text-purple-400">Global Agency Console</span>
                          ) : (
                            user.clientName || 'Unassigned Workspace'
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-400 text-[11px]">
                        {new Date(user.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingUser(user)
                              setNewRole(user.role)
                              setTargetClientId(user.client_id || clients[0]?.id || '')
                            }}
                            className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                          >
                            <ShieldCheck className="size-3.5" /> Upgrade / Change Role
                          </button>

                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id, user.email || '')}
                              title="Delete user"
                              className="rounded-lg border border-red-500/30 bg-red-500/10 p-1.5 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <UserPlus className="size-4 text-cyan-400" /> Invite & Provision New User
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  User Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Vance"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. alex@company.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role Authority
                </label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as UserRole)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="agency_admin">Agency Administrator (Full Agency Access)</option>
                  <option value="client_user">Client Owner (Manage Client Workspace)</option>
                  <option value="client_staff">Client Staff (Operator)</option>
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                  {inviteRole === 'agency_admin'
                    ? 'Grants access to /admin, all clients, CRM cross-tenant records, and billing.'
                    : 'Constrained by RLS to their assigned client workspace only.'}
                </p>
              </div>

              {inviteRole !== 'agency_admin' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Assign to Client Workspace
                  </label>
                  <select
                    value={inviteClientId}
                    onChange={e => setInviteClientId(e.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
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
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Initial Password
                </label>
                <input
                  type="text"
                  required
                  value={invitePassword}
                  onChange={e => setInvitePassword(e.target.value)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white font-mono focus:border-cyan-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                  User can immediately log in with this password and change it anytime.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-cyan-400 disabled:opacity-50 shadow-[0_0_15px_rgba(0,210,255,0.3)]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Provisioning...
                    </>
                  ) : (
                    'Provision & Save User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit / Upgrade Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0e1422] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldCheck className="size-4 text-purple-400" /> Upgrade / Change User Role
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-slate-800 bg-[#131b2e] p-3.5 text-xs text-slate-300">
              <p className="font-semibold text-white">{editingUser.full_name || 'User'}</p>
              <p className="text-slate-400 font-mono text-[11px]">{editingUser.email}</p>
              <p className="mt-2 text-slate-400">
                Current Role:{' '}
                <strong className="text-cyan-300 font-semibold">{editingUser.role}</strong>
              </p>
            </div>

            <form onSubmit={handleUpdateRole} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Select New Role Authority
                </label>
                <select
                  value={newRole}
                  onChange={e => setNewRole(e.target.value as UserRole)}
                  className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
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
                    <div className="rounded-lg border border-slate-800 bg-[#131b2e] p-2.5 text-[11px] text-slate-400">
                      User will be scoped to their specific assigned workspace under Postgres RLS.
                    </div>
                  )}
                </div>
              </div>

              {newRole !== 'agency_admin' && (
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Assign to Client Workspace
                  </label>
                  <select
                    value={targetClientId}
                    onChange={e => setTargetClientId(e.target.value)}
                    required
                    className="mt-1.5 h-10 w-full rounded-xl border border-slate-800 bg-[#131b2e] px-3.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.business_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="rounded-xl border border-slate-800 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex items-center gap-2 rounded-xl bg-purple-500 px-4 py-2 text-xs font-bold text-white hover:bg-purple-600 disabled:opacity-50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Saving Changes...
                    </>
                  ) : (
                    'Confirm Role Change'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
