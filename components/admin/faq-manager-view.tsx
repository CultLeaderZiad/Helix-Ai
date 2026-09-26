'use client'

import { useState, useTransition } from 'react'
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/lib/faq/faq-store'
import {
  createFaqAction,
  updateFaqAction,
  deleteFaqAction,
} from '@/lib/faq/actions'

interface FaqManagerViewProps {
  initialFaqs: FAQItem[]
}

export function FaqManagerView({ initialFaqs }: FaqManagerViewProps) {
  const [faqs, setFaqs] = useState<FAQItem[]>(initialFaqs)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null)

  // Form State
  const [formQuestion, setFormQuestion] = useState('')
  const [formAnswer, setFormAnswer] = useState('')
  const [formCategory, setFormCategory] = useState('Platform')
  const [formIsActive, setFormIsActive] = useState(true)

  const openCreateModal = () => {
    setEditingItem(null)
    setFormQuestion('')
    setFormAnswer('')
    setFormCategory('Platform')
    setFormIsActive(true)
    setModalOpen(true)
  }

  const openEditModal = (item: FAQItem) => {
    setEditingItem(item)
    setFormQuestion(item.question)
    setFormAnswer(item.answer)
    setFormCategory(item.category || 'Platform')
    setFormIsActive(item.is_active)
    setModalOpen(true)
  }

  const handleSave = () => {
    if (!formQuestion.trim() || !formAnswer.trim()) {
      setFeedback({ type: 'error', text: 'Question and Answer are required.' })
      return
    }

    startTransition(async () => {
      if (editingItem) {
        // Update
        const res = await updateFaqAction(editingItem.id, {
          question: formQuestion,
          answer: formAnswer,
          category: formCategory,
          is_active: formIsActive,
        })
        if (res.success) {
          setFaqs((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? {
                    ...item,
                    question: formQuestion,
                    answer: formAnswer,
                    category: formCategory,
                    is_active: formIsActive,
                    updated_at: new Date().toISOString(),
                  }
                : item
            )
          )
          setFeedback({ type: 'success', text: 'FAQ question updated successfully.' })
          setModalOpen(false)
        } else {
          setFeedback({ type: 'error', text: res.message })
        }
      } else {
        // Create
        const res = await createFaqAction({
          question: formQuestion,
          answer: formAnswer,
          category: formCategory,
          is_active: formIsActive,
        })
        if (res.success && res.item) {
          setFaqs((prev) => [...prev, res.item!])
          setFeedback({ type: 'success', text: 'New FAQ added successfully.' })
          setModalOpen(false)
        } else {
          setFeedback({ type: 'error', text: res.message })
        }
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ question?')) return

    startTransition(async () => {
      const res = await deleteFaqAction(id)
      if (res.success) {
        setFaqs((prev) => prev.filter((f) => f.id !== id))
        setFeedback({ type: 'success', text: 'FAQ deleted successfully.' })
      } else {
        setFeedback({ type: 'error', text: res.message })
      }
    })
  }

  const handleToggleActive = (item: FAQItem) => {
    startTransition(async () => {
      const nextActive = !item.is_active
      const res = await updateFaqAction(item.id, { is_active: nextActive })
      if (res.success) {
        setFaqs((prev) =>
          prev.map((f) => (f.id === item.id ? { ...f, is_active: nextActive } : f))
        )
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-helix-muted">
            Questions saved here are the ones shown publicly.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-xs font-semibold text-white  hover:bg-ink/90 transition-all"
        >
          <Plus className="size-4" />
          Add FAQ Question
        </button>
      </div>

      {/* Alert Feedback */}
      {feedback && (
        <div
          className={cn(
            'flex items-center justify-between rounded-xl border p-3.5 text-xs',
            feedback.type === 'success'
              ? 'border-[#0B6E4F]/30 bg-[#0B6E4F]/10 text-[#0B6E4F] font-semibold'
              : 'border-rose-300 bg-rose-50 text-rose-700 font-semibold'
          )}
        >
          <span>{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-helix-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* FAQs List Table */}
      <div className="rounded-2xl border border-helix-border bg-helix-canvas overflow-hidden shadow-xl">
        <div className="p-4 border-b border-helix-border/80 flex items-center justify-between bg-helix-surface">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink">
            Current Questions ({faqs.length})
          </span>
          <span className="text-[11px] text-helix-muted font-mono">
            {faqs.filter((f) => f.is_active).length} Active Live
          </span>
        </div>

        {faqs.length === 0 ? (
          <div className="p-12 text-center text-helix-muted text-sm">
            No FAQ questions configured yet. Click &quot;Add FAQ Question&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {faqs.map((item, idx) => (
              <div
                key={item.id}
                className={cn(
                  'p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors',
                  item.is_active ? 'bg-transparent' : 'bg-helix-canvas/60 opacity-80'
                )}
              >
                <div className="space-y-1.5 max-w-3xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-helix-muted">
                      #{idx + 1}
                    </span>
                    <span className="rounded-md border border-helix-border bg-helix-canvas px-2 py-0.5 text-[10px] font-mono uppercase text-ink">
                      {item.category || 'General'}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold uppercase',
                        item.is_active
                          ? 'border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 text-[#0B6E4F]'
                          : 'border border-helix-border bg-helix-canvas text-helix-muted'
                      )}
                    >
                      {item.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                  <h3 className="font-display text-sm sm:text-base font-semibold text-ink">
                    {item.question}
                  </h3>
                  <p className="text-xs text-ink/80 leading-relaxed line-clamp-2">
                    {item.answer}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(item)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-lg border border-helix-border bg-slate-800/80 px-2.5 py-1.5 text-xs text-ink/80 hover:text-ink transition-colors"
                    title={item.is_active ? 'Hide from public site' : 'Publish to public site'}
                  >
                    {item.is_active ? (
                      <>
                        <EyeOff className="size-3.5 text-amber-400" />
                        <span className="hidden sm:inline text-[11px]">Hide</span>
                      </>
                    ) : (
                      <>
                        <Eye className="size-3.5 text-emerald-400" />
                        <span className="hidden sm:inline text-[11px]">Show</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="flex items-center gap-1 rounded-lg border border-helix-border bg-slate-800/80 px-2.5 py-1.5 text-xs text-ink/80 hover:text-ink hover:border-helix-border transition-colors"
                  >
                    <Edit2 className="size-3.5 text-helix-accent" />
                    <span className="hidden sm:inline text-[11px]">Edit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-lg border border-helix-border bg-rose-500/10 px-2.5 py-1.5 text-xs text-rose-400 hover:bg-rose-500/20 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    <span className="hidden sm:inline text-[11px]">Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl rounded-2xl border border-helix-border bg-helix-canvas p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-helix-border pb-3">
              <h3 className="font-display text-lg font-bold text-ink">
                {editingItem ? 'Edit FAQ Question' : 'Add New FAQ Question'}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-helix-muted hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink/80 font-semibold mb-1">
                  Question *
                </label>
                <input
                  type="text"
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  placeholder="e.g. Can I migrate from Salesforce/HubSpot?"
                  className="w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2.5 text-xs text-ink placeholder:text-helix-muted focus:border-ink focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-ink/80 font-semibold mb-1">
                  Answer *
                </label>
                <textarea
                  rows={4}
                  value={formAnswer}
                  onChange={(e) => setFormAnswer(e.target.value)}
                  placeholder="Provide clear, authoritative answer..."
                  className="w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2.5 text-xs text-ink placeholder:text-helix-muted focus:border-ink focus:outline-hidden leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink/80 font-semibold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Platform, Security, Billing, Integrations"
                    className="w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-2 text-xs text-ink placeholder:text-helix-muted focus:border-ink focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-ink/80 font-semibold mb-1">
                    Visibility
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormIsActive((prev) => !prev)}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors',
                      formIsActive
                        ? 'border-[#0B6E4F]/40 bg-[#0B6E4F]/10 text-[#0B6E4F]'
                        : 'border-helix-border bg-helix-surface text-helix-muted'
                    )}
                  >
                    {formIsActive ? <Check className="size-3.5" /> : <X className="size-3.5" />}
                    {formIsActive ? 'Published Active' : 'Hidden Draft'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-helix-border">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-helix-border bg-helix-canvas px-4 py-2 text-xs font-semibold text-ink hover:bg-helix-border/40 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-xl bg-ink px-5 py-2 text-xs font-semibold text-white hover:bg-ink/90 transition-all shadow-md"
              >
                {isPending ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
