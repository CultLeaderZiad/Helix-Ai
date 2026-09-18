'use client'

import { useState, useTransition } from 'react'
import {
  DollarSign,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Building2,
  Globe2,
  Tag,
} from 'lucide-react'
import Link from 'next/link'
import type { RegionTier } from '@/lib/schema'
import type { PricingPlan, RegionPricingConfig } from '@/lib/pricing/tiers'
import {
  savePlanAction,
  deletePlanAction,
  updateTierHeaderAction,
  resetPricingAction,
} from '@/lib/pricing/actions'

interface PricingManagerViewProps {
  initialConfigs: Record<RegionTier, RegionPricingConfig>
}

export function PricingManagerView({ initialConfigs }: PricingManagerViewProps) {
  const [configs, setConfigs] = useState<Record<RegionTier, RegionPricingConfig>>(initialConfigs)
  const [selectedTier, setSelectedTier] = useState<RegionTier>('gcc_enterprise')
  const [activePlanId, setActivePlanId] = useState<string | null>(
    initialConfigs.gcc_enterprise.plans[0]?.id ?? null
  )

  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  )

  const [showAddPlanModal, setShowAddPlanModal] = useState(false)
  const [newPlan, setNewPlan] = useState<PricingPlan>({
    id: '',
    name: '',
    nameAr: '',
    tagline: '',
    taglineAr: '',
    featured: false,
    prices: { USD: 500, AED: 1850, SAR: 1850 },
    setupFee: { USD: 1000, AED: 3700, SAR: 3700 },
    features: ['High-throughput Voice AI Receptionist', 'Bilingual WhatsApp Lead Triage'],
    featuresAr: ['وكيل صوتي ذكي للمكالمات', 'تأهيل وتصنيف العملاء عبر الواتساب'],
  })

  const currentTierConfig = configs[selectedTier]
  const currentPlan = currentTierConfig.plans.find((p) => p.id === activePlanId) || currentTierConfig.plans[0]

  const showNotification = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Save changes to current plan
  const handleSavePlan = (planToSave: PricingPlan) => {
    startTransition(async () => {
      const res = await savePlanAction(selectedTier, planToSave)
      if (res.success) {
        setConfigs((prev) => {
          const updatedPlans = prev[selectedTier].plans.map((p) =>
            p.id === planToSave.id ? planToSave : p
          )
          return {
            ...prev,
            [selectedTier]: {
              ...prev[selectedTier],
              plans: updatedPlans,
            },
          }
        })
        showNotification('success', `Saved plan "${planToSave.name}" successfully!`)
      } else {
        showNotification('error', res.error || 'Failed to save plan')
      }
    })
  }

  // Delete plan
  const handleDeletePlan = (planId: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return
    startTransition(async () => {
      const res = await deletePlanAction(selectedTier, planId)
      if (res.success) {
        setConfigs((prev) => {
          const updatedPlans = prev[selectedTier].plans.filter((p) => p.id !== planId)
          return {
            ...prev,
            [selectedTier]: {
              ...prev[selectedTier],
              plans: updatedPlans,
            },
          }
        })
        setActivePlanId(currentTierConfig.plans.find((p) => p.id !== planId)?.id || null)
        showNotification('success', 'Plan deleted successfully.')
      } else {
        showNotification('error', res.error || 'Failed to delete plan')
      }
    })
  }

  // Save tier header info
  const handleSaveHeader = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const badge = form.get('badge') as string
    const badgeAr = form.get('badgeAr') as string
    const description = form.get('description') as string
    const descriptionAr = form.get('descriptionAr') as string

    startTransition(async () => {
      const res = await updateTierHeaderAction(selectedTier, {
        badge,
        badgeAr,
        description,
        descriptionAr,
      })
      if (res.success) {
        setConfigs((prev) => ({
          ...prev,
          [selectedTier]: {
            ...prev[selectedTier],
            badge,
            badgeAr,
            description,
            descriptionAr,
          },
        }))
        showNotification('success', 'Tier header details updated!')
      } else {
        showNotification('error', res.error || 'Failed to update tier header')
      }
    })
  }

  // Add new plan
  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlan.id || !newPlan.name) {
      alert('Plan ID and Name are required.')
      return
    }

    startTransition(async () => {
      const res = await savePlanAction(selectedTier, newPlan)
      if (res.success) {
        setConfigs((prev) => ({
          ...prev,
          [selectedTier]: {
            ...prev[selectedTier],
            plans: [...prev[selectedTier].plans, newPlan],
          },
        }))
        setActivePlanId(newPlan.id)
        setShowAddPlanModal(false)
        showNotification('success', `Created new plan "${newPlan.name}"!`)
      } else {
        showNotification('error', res.error || 'Failed to create plan')
      }
    })
  }

  // Reset to defaults
  const handleReset = () => {
    if (!confirm('Reset all regional pricing to initial platform defaults? This will overwrite custom edits.')) return
    startTransition(async () => {
      const res = await resetPricingAction()
      if (res.success) {
        window.location.reload()
      } else {
        showNotification('error', res.error || 'Failed to reset')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Top Banner & Quick Links */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-helix-border pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
              <DollarSign className="size-3.5" />
              LIVE PRICING ENGINE
            </span>
            <span className="text-xs text-helix-muted font-mono">// Instant sync with /pricing</span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-helix-ink sm:text-3xl font-display">
            Pricing & Commercial Tier Control
          </h1>
          <p className="mt-1 text-sm text-helix-muted">
            Control retainers, setup fees, feature bullets, and bilingual currencies across GCC and MENA markets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/pricing"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-helix-border bg-slate-800/80 px-3.5 py-2 text-xs font-semibold text-helix-ink hover:border-slate-600 hover:text-helix-ink transition-all shadow-sm"
          >
            <span>Preview /pricing</span>
            <ExternalLink className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={handleReset}
            disabled={isPending}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset Defaults</span>
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

      {/* Region Selector Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-helix-border bg-helix-canvas p-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedTier('gcc_enterprise')
              setActivePlanId(configs.gcc_enterprise.plans[0]?.id || null)
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTier === 'gcc_enterprise'
                ? 'bg-helix-ink text-helix-surface'
                : 'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink'
            }`}
          >
            <Building2 className="size-4" />
            <span>GCC Enterprise (UAE, KSA, Qatar)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedTier('mena_sme')
              setActivePlanId(configs.mena_sme.plans[0]?.id || null)
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition-all ${
              selectedTier === 'mena_sme'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                : 'text-helix-muted hover:bg-helix-canvas hover:text-helix-ink'
            }`}
          >
            <Globe2 className="size-4" />
            <span>MENA SME (Egypt, Jordan)</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            setNewPlan({
              id: `plan-${Date.now()}`,
              name: 'New Custom Tier',
              nameAr: 'باقة جديدة مخصصة',
              tagline: 'Custom operational scope and integrations.',
              taglineAr: 'نطاق تشغيلي مخصص للشركات.',
              featured: false,
              prices: selectedTier === 'gcc_enterprise' ? { AED: 2500, SAR: 2600, USD: 680 } : { EGP: 15000, JOD: 250, USD: 380 },
              setupFee: selectedTier === 'gcc_enterprise' ? { AED: 5000, SAR: 5100, USD: 1350 } : { EGP: 20000, JOD: 350, USD: 500 },
              features: ['Dedicated Voice AI Receptionist', 'Realtime WhatsApp Lead Routing'],
              featuresAr: ['وكيل صوتي ذكي مخصص', 'توزيع جهات الاتصال عبر الواتساب'],
            })
            setShowAddPlanModal(true)
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-helix-ink px-3.5 py-2 text-xs font-bold text-white hover:bg-helix-ink/90 transition-all shadow-md"
        >
          <Plus className="size-3.5" />
          <span>Add New Plan</span>
        </button>
      </div>

      {/* Tier Header Config Box */}
      <div className="rounded-2xl border border-helix-border bg-helix-canvas/70 p-5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-helix-ink/80 mb-3 flex items-center gap-2">
          <Tag className="size-4 text-helix-accent" />
          Regional Tier Description & Badge
        </h3>
        <form onSubmit={handleSaveHeader} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-helix-muted">Badge Label (EN)</label>
            <input
              name="badge"
              defaultValue={currentTierConfig.badge}
              className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs font-medium text-helix-ink focus:border-helix-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-helix-muted">Badge Label (AR)</label>
            <input
              name="badgeAr"
              dir="rtl"
              defaultValue={currentTierConfig.badgeAr}
              className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs font-medium text-helix-ink focus:border-helix-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-helix-muted">Description (EN)</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={currentTierConfig.description}
              className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink focus:border-helix-ink focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-helix-muted">Description (AR)</label>
            <textarea
              name="descriptionAr"
              rows={2}
              dir="rtl"
              defaultValue={currentTierConfig.descriptionAr}
              className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink focus:border-helix-ink focus:outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-xl border border-helix-border bg-slate-800 px-4 py-1.5 text-xs font-semibold text-helix-ink hover:bg-slate-700 hover:text-helix-ink transition-all"
            >
              <Save className="size-3.5" />
              <span>Update Tier Header</span>
            </button>
          </div>
        </form>
      </div>

      {/* Plans Navigation & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column: List of Plans in this Tier */}
        <div className="space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-helix-muted px-1">
            Plans ({currentTierConfig.plans.length})
          </div>
          {currentTierConfig.plans.map((p) => {
            const isSelected = p.id === (currentPlan?.id ?? '')
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setActivePlanId(p.id)}
                className={`w-full text-left rounded-xl p-3 border transition-all ${
                  isSelected
                    ? 'border-helix-ink bg-helix-accent-soft text-helix-ink shadow-sm'
                    : 'border-helix-border bg-helix-surface/80 text-helix-muted hover:border-helix-border hover:text-helix-ink'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-helix-ink">{p.name}</span>
                  {p.featured && (
                    <span className="rounded-full bg-helix-accent-soft px-2 py-0.5 text-[10px] font-bold text-helix-accent">
                      Popular
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-helix-muted mt-1 truncate">{p.tagline}</div>
                <div className="text-xs font-mono font-semibold text-helix-accent mt-2">
                  {selectedTier === 'gcc_enterprise'
                    ? `${p.prices.AED?.toLocaleString()} AED / mo`
                    : `${p.prices.EGP?.toLocaleString()} EGP / mo`}
                </div>
              </button>
            )
          })}
        </div>

        {/* Right Column: Active Plan Editor */}
        {currentPlan ? (
          <div className="lg:col-span-3 rounded-2xl border border-helix-border bg-helix-canvas/80 p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-helix-border pb-4">
              <div>
                <span className="text-xs font-mono text-helix-accent">ID: {currentPlan.id}</span>
                <h2 className="text-xl font-bold text-helix-ink mt-0.5">{currentPlan.name}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDeletePlan(currentPlan.id)}
                  disabled={isPending || currentTierConfig.plans.length <= 1}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" />
                  <span>Delete Plan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePlan(currentPlan)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-helix-ink px-4 py-1.5 text-xs font-bold text-helix-surface hover:bg-helix-ink/90 transition-all"
                >
                  <Save className="size-3.5" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </div>

            {/* Plan Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-helix-muted">Plan Name (English)</label>
                <input
                  value={currentPlan.name}
                  onChange={(e) => {
                    const val = e.target.value
                    setConfigs((prev) => ({
                      ...prev,
                      [selectedTier]: {
                        ...prev[selectedTier],
                        plans: prev[selectedTier].plans.map((p) =>
                          p.id === currentPlan.id ? { ...p, name: val } : p
                        ),
                      },
                    }))
                  }}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs font-semibold text-helix-ink focus:border-helix-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Plan Name (Arabic)</label>
                <input
                  dir="rtl"
                  value={currentPlan.nameAr}
                  onChange={(e) => {
                    const val = e.target.value
                    setConfigs((prev) => ({
                      ...prev,
                      [selectedTier]: {
                        ...prev[selectedTier],
                        plans: prev[selectedTier].plans.map((p) =>
                          p.id === currentPlan.id ? { ...p, nameAr: val } : p
                        ),
                      },
                    }))
                  }}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs font-semibold text-helix-ink focus:border-helix-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Tagline (English)</label>
                <textarea
                  rows={2}
                  value={currentPlan.tagline}
                  onChange={(e) => {
                    const val = e.target.value
                    setConfigs((prev) => ({
                      ...prev,
                      [selectedTier]: {
                        ...prev[selectedTier],
                        plans: prev[selectedTier].plans.map((p) =>
                          p.id === currentPlan.id ? { ...p, tagline: val } : p
                        ),
                      },
                    }))
                  }}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink focus:border-helix-ink focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Tagline (Arabic)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={currentPlan.taglineAr}
                  onChange={(e) => {
                    const val = e.target.value
                    setConfigs((prev) => ({
                      ...prev,
                      [selectedTier]: {
                        ...prev[selectedTier],
                        plans: prev[selectedTier].plans.map((p) =>
                          p.id === currentPlan.id ? { ...p, taglineAr: val } : p
                        ),
                      },
                    }))
                  }}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink focus:border-helix-ink focus:outline-none"
                />
              </div>

              {/* Featured Badge Toggle */}
              <div className="md:col-span-2 flex items-center gap-3 border-y border-helix-border py-3">
                <input
                  type="checkbox"
                  id="featuredToggle"
                  checked={Boolean(currentPlan.featured)}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setConfigs((prev) => ({
                      ...prev,
                      [selectedTier]: {
                        ...prev[selectedTier],
                        plans: prev[selectedTier].plans.map((p) =>
                          p.id === currentPlan.id ? { ...p, featured: checked } : p
                        ),
                      },
                    }))
                  }}
                  className="h-4 w-4 rounded border-helix-border bg-helix-surface text-helix-accent focus:ring-helix-ink"
                />
                <label htmlFor="featuredToggle" className="text-xs font-bold text-helix-ink cursor-pointer">
                  Mark as &quot;Featured / Most Popular&quot; tier (highlights card with glowing border on /pricing)
                </label>
              </div>

              {/* Pricing in Currencies */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-helix-ink/80">
                  Monthly Retainer Prices
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-helix-muted">USD ($)</label>
                    <input
                      type="number"
                      value={currentPlan.prices.USD ?? 0}
                      onChange={(e) => {
                        const num = Number(e.target.value)
                        setConfigs((prev) => ({
                          ...prev,
                          [selectedTier]: {
                            ...prev[selectedTier],
                            plans: prev[selectedTier].plans.map((p) =>
                              p.id === currentPlan.id ? { ...p, prices: { ...p.prices, USD: num } } : p
                            ),
                          },
                        }))
                      }}
                      className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                    />
                  </div>
                  {selectedTier === 'gcc_enterprise' ? (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">AED (د.إ)</label>
                        <input
                          type="number"
                          value={currentPlan.prices.AED ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, prices: { ...p.prices, AED: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">SAR (ر.س)</label>
                        <input
                          type="number"
                          value={currentPlan.prices.SAR ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, prices: { ...p.prices, SAR: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">EGP (ج.م)</label>
                        <input
                          type="number"
                          value={currentPlan.prices.EGP ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, prices: { ...p.prices, EGP: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">JOD (د.أ)</label>
                        <input
                          type="number"
                          value={currentPlan.prices.JOD ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, prices: { ...p.prices, JOD: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Setup Fees */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-helix-ink/80">
                  One-Time Setup & Calibration Fees
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-helix-muted">USD ($)</label>
                    <input
                      type="number"
                      value={currentPlan.setupFee.USD ?? 0}
                      onChange={(e) => {
                        const num = Number(e.target.value)
                        setConfigs((prev) => ({
                          ...prev,
                          [selectedTier]: {
                            ...prev[selectedTier],
                            plans: prev[selectedTier].plans.map((p) =>
                              p.id === currentPlan.id ? { ...p, setupFee: { ...p.setupFee, USD: num } } : p
                            ),
                          },
                        }))
                      }}
                      className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                    />
                  </div>
                  {selectedTier === 'gcc_enterprise' ? (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">AED (د.إ)</label>
                        <input
                          type="number"
                          value={currentPlan.setupFee.AED ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, setupFee: { ...p.setupFee, AED: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">SAR (ر.س)</label>
                        <input
                          type="number"
                          value={currentPlan.setupFee.SAR ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, setupFee: { ...p.setupFee, SAR: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">EGP (ج.م)</label>
                        <input
                          type="number"
                          value={currentPlan.setupFee.EGP ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, setupFee: { ...p.setupFee, EGP: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-helix-muted">JOD (د.أ)</label>
                        <input
                          type="number"
                          value={currentPlan.setupFee.JOD ?? 0}
                          onChange={(e) => {
                            const num = Number(e.target.value)
                            setConfigs((prev) => ({
                              ...prev,
                              [selectedTier]: {
                                ...prev[selectedTier],
                                plans: prev[selectedTier].plans.map((p) =>
                                  p.id === currentPlan.id ? { ...p, setupFee: { ...p.setupFee, JOD: num } } : p
                                ),
                              },
                            }))
                          }}
                          className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink font-mono"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Feature Bullets Editor */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-helix-ink/80">
                    Feature Inclusions (Bilingual EN / AR)
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setConfigs((prev) => ({
                        ...prev,
                        [selectedTier]: {
                          ...prev[selectedTier],
                          plans: prev[selectedTier].plans.map((p) =>
                            p.id === currentPlan.id
                              ? {
                                  ...p,
                                  features: [...p.features, 'New capability specification'],
                                  featuresAr: [...p.featuresAr, 'ميزة تشغيلية جديدة'],
                                }
                              : p
                          ),
                        },
                      }))
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-helix-accent hover:text-helix-accent"
                  >
                    <Plus className="size-3.5" />
                    <span>Add Bullet Point</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {currentPlan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        value={feat}
                        placeholder="Feature in English"
                        onChange={(e) => {
                          const val = e.target.value
                          setConfigs((prev) => ({
                            ...prev,
                            [selectedTier]: {
                              ...prev[selectedTier],
                              plans: prev[selectedTier].plans.map((p) =>
                                p.id === currentPlan.id
                                  ? {
                                      ...p,
                                      features: p.features.map((f, i) => (i === idx ? val : f)),
                                    }
                                  : p
                              ),
                            },
                          }))
                        }}
                        className="flex-1 rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink"
                      />
                      <input
                        dir="rtl"
                        value={currentPlan.featuresAr[idx] || ''}
                        placeholder="الميزة بالعربية"
                        onChange={(e) => {
                          const val = e.target.value
                          setConfigs((prev) => ({
                            ...prev,
                            [selectedTier]: {
                              ...prev[selectedTier],
                              plans: prev[selectedTier].plans.map((p) =>
                                p.id === currentPlan.id
                                  ? {
                                      ...p,
                                      featuresAr: p.featuresAr.map((f, i) => (i === idx ? val : f)),
                                    }
                                  : p
                              ),
                            },
                          }))
                        }}
                        className="flex-1 rounded-xl border border-helix-border bg-helix-surface px-3 py-1.5 text-xs text-helix-ink"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setConfigs((prev) => ({
                            ...prev,
                            [selectedTier]: {
                              ...prev[selectedTier],
                              plans: prev[selectedTier].plans.map((p) =>
                                p.id === currentPlan.id
                                  ? {
                                      ...p,
                                      features: p.features.filter((_, i) => i !== idx),
                                      featuresAr: p.featuresAr.filter((_, i) => i !== idx),
                                    }
                                  : p
                              ),
                            },
                          }))
                        }}
                        className="p-1.5 text-helix-muted hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-4 border-t border-helix-border">
              <button
                type="button"
                onClick={() => handleSavePlan(currentPlan)}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-xl bg-helix-ink px-5 py-2 text-xs font-bold text-white hover:bg-helix-ink/90 transition-all shadow-md"
              >
                <Save className="size-4" />
                <span>Save All Changes for &quot;{currentPlan.name}&quot;</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-3 rounded-2xl border border-dashed border-helix-border p-12 text-center text-helix-muted">
            No plan selected. Click a plan on the left or add a new one.
          </div>
        )}
      </div>

      {/* Modal: Add New Plan */}
      {showAddPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-helix-border bg-helix-surface p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-helix-ink flex items-center gap-2">
              <Sparkles className="size-4 text-helix-accent" />
              Create New Pricing Plan
            </h3>

            <form onSubmit={handleCreatePlan} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-helix-muted">Unique Plan ID (e.g. enterprise-pro)</label>
                <input
                  required
                  value={newPlan.id}
                  onChange={(e) => setNewPlan({ ...newPlan, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-helix-muted">Name (EN)</label>
                  <input
                    required
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-helix-muted">Name (AR)</label>
                  <input
                    dir="rtl"
                    value={newPlan.nameAr}
                    onChange={(e) => setNewPlan({ ...newPlan, nameAr: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-helix-muted">Tagline</label>
                <input
                  value={newPlan.tagline}
                  onChange={(e) => setNewPlan({ ...newPlan, tagline: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs text-helix-ink"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-helix-border">
                <button
                  type="button"
                  onClick={() => setShowAddPlanModal(false)}
                  className="rounded-xl border border-helix-border bg-slate-800 px-4 py-2 text-xs font-semibold text-helix-ink/80 hover:text-helix-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-helix-ink px-4 py-2 text-xs font-bold text-white hover:bg-helix-ink/90"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
