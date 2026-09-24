'use client'

import React, { useState } from 'react'
import { useLeadGenJob } from '@/hooks/useLeadGenJob'
import { SettingsStrip } from './SettingsStrip'
import { EmptyState } from './EmptyStates'
import { BriefForm } from './BriefForm'
import { SeedInput } from './SeedInput'
import { EnginePicker } from './EnginePicker'
import { RecipeLibrary } from './RecipeLibrary'
import { JobProgress } from './JobProgress'
import { LeadsTable } from './LeadsTable'
import { LeadDetail } from './LeadDetail'
import { ExportBar } from './ExportBar'
import { CrmUpsertButton } from './CrmUpsertButton'
import { estimateJobCredits } from '@/lib/leadgen/credits'
import type {
  LeadGenBrief,
  LeadGenSeeds,
  LeadGenEngine,
  LeadGenMode,
  LeadGenRecipe,
} from '@/lib/leadgen/types'

interface LeadGenPageProps {
  businessName?: string | null
  initialJobId?: string
}

export function LeadGenPage({ businessName, initialJobId }: LeadGenPageProps) {
  const [isArabic, setIsArabic] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Form state
  const [brief, setBrief] = useState<LeadGenBrief>({
    icp: 'Commercial construction contractors in Riyadh and Dubai specializing in enterprise fit-outs',
    geos: ['SA', 'AE', 'JO', 'EG'],
    languages: ['ar', 'en'],
    exclude_domains: [],
    max_pages: 80,
    max_leads: 50,
    credit_budget: 50,
    outreach_min_score: 50,
  })

  const [seeds, setSeeds] = useState<LeadGenSeeds>({
    urls: ['https://example.com'],
    sitemap_url: null,
    shopify_url: null,
    domains_csv: null,
  })

  const [engineDefault, setEngineDefault] = useState<LeadGenEngine>('stealth')
  const [mode, setMode] = useState<LeadGenMode>('crawl')
  const [recipeId, setRecipeId] = useState<string>('mena-construction-contact')
  const [robotsObey, setRobotsObey] = useState<boolean>(true)
  const [adaptive, setAdaptive] = useState<boolean>(true)
  const [enrichEmails, setEnrichEmails] = useState<boolean>(true)
  const [generateOutreach, setGenerateOutreach] = useState<boolean>(true)

  const {
    state,
    health,
    recipes,
    jobs,
    activeJob,
    leads,
    selectedLead,
    error,
    crmStatus,
    createJob,
    pause,
    resume,
    refresh,
    selectJob,
    selectLead,
    crmUpsert,
    exportCsv,
    exportJsonl,
    reset,
  } = useLeadGenJob(initialJobId)

  const handleSelectRecipe = (recipe: LeadGenRecipe) => {
    setRecipeId(recipe.id)
    setMode(recipe.mode)
    setEngineDefault(recipe.engine_default)
    setAdaptive(recipe.adaptive)
    setRobotsObey(recipe.robots_obey)
    setBrief(prev => ({
      ...prev,
      max_pages: recipe.max_pages ?? prev.max_pages,
    }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createJob({
        brief,
        seeds,
        engine_default: engineDefault,
        mode,
        recipe_id: recipeId,
        robots_obey: robotsObey,
        adaptive,
        enrich_emails: enrichEmails,
        generate_outreach: generateOutreach,
      })
      setShowCreateForm(false)
    } catch {
      // Error handled by hook
    }
  }

  const estimatedCredits = estimateJobCredits({
    maxPages: brief.max_pages,
    maxLeads: brief.max_leads,
    enrichEmails,
    generateOutreach,
  })

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 font-sans transition-all text-[#0f141b] dark:text-[#e8ecf2]"
    >
      {/* Screen Title & Top Navigation Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d9dee6] dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-[#0e8da6] dark:text-[#38c6e0]">
              {isArabic ? 'محرك الاستحواذ B2B' : 'B2B Acquisition Console'}
            </span>
            {businessName && (
              <span className="font-mono text-[11px] text-[#5b6577] dark:text-[#8b95a7]">
                · {businessName}
              </span>
            )}
          </div>
          {/* Labeled exactly "Lead Generation" as required */}
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'توليد العملاء (Lead Generation)' : 'Lead Generation'}
          </h1>
          <p className="mt-1 text-xs text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'اكتشاف عملاء الشركات من المواقع العامة، الاستخراج المتكيف، والتقييم الذكي بدعم محرك Scrapling.'
              : 'Public website lead discovery, adaptive extraction & scoring powered by Scrapling.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* EN/AR Locale Toggle */}
          <button
            type="button"
            onClick={() => setIsArabic(!isArabic)}
            className="rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1 text-xs font-mono font-medium text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2] transition-colors"
          >
            {isArabic ? 'English (EN)' : 'العربية (AR)'}
          </button>

          {/* Job History Selector */}
          {jobs.length > 0 && (
            <select
              value={activeJob?.id ?? ''}
              onChange={e => {
                const j = jobs.find(x => x.id === e.target.value)
                if (j) {
                  selectJob(j)
                  setShowCreateForm(false)
                }
              }}
              className="max-w-[200px] truncate rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1 text-xs font-mono text-[#0f141b] dark:text-[#e8ecf2]"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.brief?.icp ? `${j.brief.icp.slice(0, 24)}…` : j.id.slice(0, 8)} ({j.status})
                </option>
              ))}
            </select>
          )}

          {/* New Job Button */}
          <button
            type="button"
            onClick={() => {
              setShowCreateForm(!showCreateForm)
              if (!showCreateForm) reset()
            }}
            className="rounded-md bg-[#0f141b] dark:bg-[#e8ecf2] px-3.5 py-1.5 text-xs font-semibold text-[#f4f6f9] dark:text-[#0b0e13] hover:opacity-90 transition-opacity"
          >
            {showCreateForm
              ? isArabic ? 'إلغاء' : 'Cancel'
              : isArabic ? '+ مهمة استخراج جديدة' : '+ New Acquisition Job'}
          </button>
        </div>
      </div>

      {/* Settings / Worker Health Strip */}
      <SettingsStrip health={health} isArabic={isArabic} />

      {/* Error readout if present */}
      {error && (
        <div className="rounded-lg border border-[#c62f2a]/20 dark:border-[#f85149]/30 bg-[#c62f2a]/5 dark:bg-[#f85149]/10 p-3 text-xs text-[#c62f2a] dark:text-[#f85149]">
          <span className="font-semibold">{isArabic ? 'خطأ في العملية:' : 'Error:'}</span> {error}
        </div>
      )}

      {/* Worker Offline Alert if worker is offline */}
      {health?.worker === 'offline' && !showCreateForm && !activeJob && (
        <EmptyState type="worker_offline" isArabic={isArabic} />
      )}

      {/* Creation Wizard / Configuration Form */}
      {showCreateForm ? (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-6 space-y-6"
        >
          <div className="border-b border-[#d9dee6] dark:border-white/10 pb-3">
            <h2 className="font-display text-base font-bold text-[#0f141b] dark:text-[#e8ecf2]">
              {isArabic ? 'تكوين مهمة استخراج عملاء جديدة' : 'Configure New Acquisition Job'}
            </h2>
            <p className="mt-0.5 text-xs text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic
                ? 'حدد معايير العميل المستهدف، الروابط، والمحرك. ستقوم المنصة بالتحقق وجدولة المهمة في Supabase ليقوم مشغل Scrapling بمعالجتها.'
                : 'Define ICP brief, seed targets, and extraction engine. Helix-Ai API will validate and enqueue the job for Scrapling worker execution.'}
            </p>
          </div>

          {/* 1. Recipe Library Selector */}
          <RecipeLibrary
            recipes={recipes}
            selectedRecipeId={recipeId}
            onSelectRecipe={handleSelectRecipe}
            isArabic={isArabic}
            disabled={state === 'enqueueing'}
          />

          <hr className="border-[#d9dee6] dark:border-white/10" />

          {/* 2. Brief Form */}
          <BriefForm
            brief={brief}
            onChange={setBrief}
            isArabic={isArabic}
            disabled={state === 'enqueueing'}
          />

          <hr className="border-[#d9dee6] dark:border-white/10" />

          {/* 3. Seed Targets */}
          <SeedInput
            seeds={seeds}
            onChange={setSeeds}
            isArabic={isArabic}
            disabled={state === 'enqueueing'}
          />

          <hr className="border-[#d9dee6] dark:border-white/10" />

          {/* 4. Engine & Guardrails */}
          <EnginePicker
            engine={engineDefault}
            mode={mode}
            adaptive={adaptive}
            robotsObey={robotsObey}
            enrichEmails={enrichEmails}
            generateOutreach={generateOutreach}
            onChange={up => {
              if (up.engine !== undefined) setEngineDefault(up.engine)
              if (up.mode !== undefined) setMode(up.mode)
              if (up.adaptive !== undefined) setAdaptive(up.adaptive)
              if (up.robotsObey !== undefined) setRobotsObey(up.robotsObey)
              if (up.enrichEmails !== undefined) setEnrichEmails(up.enrichEmails)
              if (up.generateOutreach !== undefined) setGenerateOutreach(up.generateOutreach)
            }}
            isArabic={isArabic}
            disabled={state === 'enqueueing'}
          />

          {/* Submit Action Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#d9dee6] dark:border-white/10 pt-4">
            <div className="text-xs font-mono text-[#5b6577] dark:text-[#8b95a7]">
              {isArabic ? 'الرصيد التقديري:' : 'Estimated usage:'}{' '}
              <span className="font-semibold text-[#0e8da6] dark:text-[#38c6e0]">
                {estimatedCredits} {isArabic ? 'رصيد' : 'credits'}
              </span>{' '}
              · {isArabic ? 'تتبع الاستخدام نشط' : 'tracked on job'}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded border border-[#cfd6df] dark:border-white/15 px-4 py-2 text-xs font-medium text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={state === 'enqueueing'}
                className="rounded-md bg-[#0e8da6] dark:bg-[#38c6e0] px-5 py-2 text-xs font-semibold text-white dark:text-[#06141a] hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {state === 'enqueueing'
                  ? isArabic ? 'جارٍ الإدراج...' : 'Enqueueing Job...'
                  : isArabic ? 'بدء مهمة الاستخراج' : 'Enqueue & Launch Job'}
              </button>
            </div>
          </div>
        </form>
      ) : activeJob ? (
        /* Active Job Workspace */
        <div className="space-y-6">
          {/* Real Job Logs & Stage Progress */}
          <JobProgress
            job={activeJob}
            onPause={pause}
            onResume={resume}
            onRefresh={refresh}
            isArabic={isArabic}
          />

          {/* Action Strip: Export + CRM Upsert */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ExportBar
              leadCount={leads.length}
              onExportCsv={exportCsv}
              onExportJsonl={exportJsonl}
              isArabic={isArabic}
            />

            <CrmUpsertButton
              onUpsert={crmUpsert}
              status={crmStatus}
              isArabic={isArabic}
              disabled={leads.length === 0}
            />
          </div>

          {/* Leads Table or Empty State */}
          {leads.length > 0 ? (
            <LeadsTable
              leads={leads}
              selectedLeadId={selectedLead?.id}
              onSelectLead={selectLead}
              isArabic={isArabic}
            />
          ) : activeJob.status === 'running' || activeJob.status === 'queued' ? (
            <EmptyState type="running_empty" isArabic={isArabic} />
          ) : (
            <EmptyState type="no_leads" isArabic={isArabic} />
          )}

          {/* Selected Lead Detail Modal / Panel */}
          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              onClose={() => selectLead(null)}
              isArabic={isArabic}
            />
          )}
        </div>
      ) : (
        /* No Jobs Available State */
        <EmptyState
          type="no_jobs"
          isArabic={isArabic}
          onAction={() => setShowCreateForm(true)}
          actionLabel={isArabic ? '+ إنشاء أول مهمة استخراج' : '+ Enqueue First Job'}
        />
      )}
    </div>
  )
}
