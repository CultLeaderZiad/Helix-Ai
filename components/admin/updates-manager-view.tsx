'use client'

import { useState, useTransition } from 'react'
import {
  GitCommit,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Tag,
  Check,
  X,
} from 'lucide-react'
import Link from 'next/link'
import type { PlatformUpdate } from '@/lib/updates/updates-store'
import {
  createUpdateAction,
  updateReleaseAction,
  deleteUpdateAction,
  togglePublishUpdateAction,
} from '@/lib/updates/actions'

interface UpdatesManagerViewProps {
  initialUpdates: PlatformUpdate[]
}

export function UpdatesManagerView({ initialUpdates }: UpdatesManagerViewProps) {
  const [updates, setUpdates] = useState<PlatformUpdate[]>(initialUpdates)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState<Omit<PlatformUpdate, 'id'>>({
    version: 'v2.5.0',
    date: 'September 2026',
    title: '',
    category: 'Core Architecture',
    is_published: true,
    highlights: [''],
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleOpenCreate = () => {
    setEditingId(null)
    setFormData({
      version: `v2.${updates.length + 2}.0`,
      date: new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date()),
      title: '',
      category: 'Core Architecture',
      is_published: true,
      highlights: [''],
    })
    setShowModal(true)
  }

  const handleOpenEdit = (up: PlatformUpdate) => {
    setEditingId(up.id)
    setFormData({
      version: up.version,
      date: up.date,
      title: up.title,
      category: up.category,
      is_published: up.is_published,
      highlights: [...up.highlights],
    })
    setShowModal(true)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title || !formData.version) {
      alert('Version and Title are required.')
      return
    }

    const filteredHighlights = formData.highlights.filter((h) => h.trim().length > 0)
    if (filteredHighlights.length === 0) {
      alert('Please provide at least one highlight bullet point.')
      return
    }

    startTransition(async () => {
      if (editingId) {
        const res = await updateReleaseAction(editingId, {
          ...formData,
          highlights: filteredHighlights,
        })
        if (res.success) {
          setUpdates((prev) =>
            prev.map((u) =>
              u.id === editingId
                ? { ...u, ...formData, highlights: filteredHighlights }
                : u
            )
          )
          setShowModal(false)
          showNotification('success', `Updated release ${formData.version}!`)
        } else {
          showNotification('error', res.error || 'Failed to update release')
        }
      } else {
        const res = await createUpdateAction({
          ...formData,
          highlights: filteredHighlights,
        })
        if (res.success && res.update) {
          setUpdates((prev) => [res.update!, ...prev])
          setShowModal(false)
          showNotification('success', `Published new release ${formData.version}!`)
        } else {
          showNotification('error', res.error || 'Failed to create update')
        }
      }
    })
  }

  const handleDelete = (id: string, version: string) => {
    if (!confirm(`Delete update release ${version}?`)) return
    startTransition(async () => {
      const res = await deleteUpdateAction(id)
      if (res.success) {
        setUpdates((prev) => prev.filter((u) => u.id !== id))
        showNotification('success', `Deleted release ${version}.`)
      } else {
        showNotification('error', res.error || 'Failed to delete release')
      }
    })
  }

  const handleTogglePublish = (id: string) => {
    startTransition(async () => {
      const res = await togglePublishUpdateAction(id)
      if (res.success) {
        setUpdates((prev) =>
          prev.map((u) => (u.id === id ? { ...u, is_published: !u.is_published } : u))
        )
        showNotification('success', 'Release visibility updated.')
      } else {
        showNotification('error', res.error || 'Failed to toggle publish')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-helix-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-raised px-2.5 py-0.5 text-xs font-semibold text-accent">
              <GitCommit className="size-3.5" />
              CHANGELOG & RELEASES
            </span>
            <span className="text-xs text-helix-muted font-mono">// Live sync with /updates</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-helix-ink sm:text-3xl font-display">
            Platform Updates & Changelog Control
          </h1>
          <p className="mt-1 text-sm text-helix-muted">
            Publish system upgrades, feature announcements, and security advisories shown to public visitors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/updates"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-helix-border bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-helix-ink hover:border-slate-600 hover:text-helix-ink transition-all shadow-sm"
          >
            <span>Preview /updates</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-helix-ink px-4 py-2 text-xs font-bold text-helix-surface hover:bg-helix-ink/90 transition-all"
          >
            <Plus className="size-3.5" />
            <span>Create New Release</span>
          </button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl p-3 text-sm font-medium border animate-in fade-in slide-in-from-top-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="size-4 shrink-0" /> : <AlertCircle className="size-4 shrink-0" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Releases List */}
      <div className="space-y-4">
        {updates.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-helix-border p-12 text-center text-helix-muted">
            No updates created yet. Click &quot;Create New Release&quot; to publish one.
          </div>
        ) : (
          updates.map((update) => (
            <div
              key={update.id}
              className={`rounded-2xl border p-6 transition-all ${
                update.is_published
                  ? 'border-helix-border bg-helix-canvas/80'
                  : 'border-helix-border/50 bg-[#090e18]/60 opacity-75'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-helix-border/80 pb-4">
                <div className="flex items-center gap-3">
                  <span className="rounded-md bg-sky-500/15 px-2.5 py-1 font-mono text-xs font-bold text-sky-300">
                    {update.version}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs text-helix-muted">
                    <Calendar className="size-3.5" />
                    {update.date}
                  </span>
                  <span className="rounded-full border border-helix-border bg-slate-800/60 px-2.5 py-0.5 text-[11px] font-medium text-helix-ink/80">
                    {update.category}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(update.id)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                      update.is_published
                        ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25'
                        : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                    }`}
                  >
                    {update.is_published ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                    <span>{update.is_published ? 'Published' : 'Draft (Hidden)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(update)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-helix-border bg-slate-800 px-2.5 py-1 text-xs font-medium text-helix-ink hover:bg-slate-700"
                  >
                    <Edit2 className="size-3" />
                    <span>Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(update.id, update.version)}
                    disabled={isPending}
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-base font-bold text-helix-ink sm:text-lg">{update.title}</h3>
                <ul className="mt-3 space-y-2">
                  {update.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-helix-ink/80">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-helix-accent" />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-helix-border bg-helix-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-helix-ink flex items-center gap-2">
              <GitCommit className="size-4 text-accent" />
              {editingId ? 'Edit Release Details' : 'Create New Release'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-helix-muted">Version (e.g. v2.5.0)</label>
                  <input
                    required
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-helix-border bg-slate-900 px-3.5 py-2 text-xs font-mono text-helix-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-helix-muted">Date (e.g. September 2026)</label>
                  <input
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-helix-border bg-slate-900 px-3.5 py-2 text-xs text-helix-ink"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-slate-900 px-3.5 py-2 text-xs text-helix-ink"
                >
                  <option value="Core Architecture">Core Architecture</option>
                  <option value="Security Hardening">Security Hardening</option>
                  <option value="Integrations">Integrations & Telephony</option>
                  <option value="AI Engine">AI Engine & LLM Upgrades</option>
                  <option value="Performance">Performance & SLA</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Title</label>
                <input
                  required
                  placeholder="e.g. Dual-workspace authentication & cross-tenant RLS isolation"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-slate-900 px-3.5 py-2 text-xs text-helix-ink"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-helix-muted">Highlights / Key Features</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, highlights: [...formData.highlights, ''] })}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-sky-400 hover:text-sky-300"
                  >
                    <Plus className="size-3" />
                    <span>Add Bullet</span>
                  </button>
                </div>
                {formData.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      value={item}
                      placeholder={`Highlight #${idx + 1}`}
                      onChange={(e) => {
                        const val = e.target.value
                        setFormData({
                          ...formData,
                          highlights: formData.highlights.map((h, i) => (i === idx ? val : h)),
                        })
                      }}
                      className="flex-1 rounded-xl border border-helix-border bg-slate-900 px-3.5 py-2 text-xs text-helix-ink"
                    />
                    {formData.highlights.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            highlights: formData.highlights.filter((_, i) => i !== idx),
                          })
                        }
                        className="p-1 text-helix-muted hover:text-rose-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="pubToggle"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="h-4 w-4 rounded border-helix-border bg-slate-900 text-sky-500"
                />
                <label htmlFor="pubToggle" className="text-xs font-medium text-helix-ink/80 cursor-pointer">
                  Publish to public /updates immediately
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-helix-border">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-helix-border bg-slate-800 px-4 py-2 text-xs font-semibold text-helix-ink/80 hover:text-helix-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-helix-ink px-4 py-2 text-xs font-bold text-helix-surface hover:bg-helix-ink/90"
                >
                  {editingId ? 'Save Changes' : 'Publish Release'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
