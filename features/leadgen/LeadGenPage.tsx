'use client'

import React, { useState } from 'react'
import { useLeadGenJob } from '@/hooks/useLeadGenJob'
import { SettingsStrip } from './SettingsStrip'
import { EmptyState } from './EmptyStates'
import { ModeTabs, LeadGenModeTab } from './ModeTabs'
import { EnrichForm } from './EnrichForm'
import { FindForm } from './FindForm'
import { AdvancedPanel } from './AdvancedPanel'
import { JobProgress } from './JobProgress'
import { LeadsTable } from './LeadsTable'
import { LeadDetail } from './LeadDetail'
import { ExportBar } from './ExportBar'
import { CrmUpsertButton } from './CrmUpsertButton'
import { getExportUrl } from '@/lib/leadgen/client'
import type { LeadGenEngine } from '@/lib/leadgen/types'

interface LeadGenPageProps {
  businessName?: string | null
  initialJobId?: string
}

export function LeadGenPage({ businessName, initialJobId }: LeadGenPageProps) {
  const [isArabic, setIsArabic] = useState(false)
  const [activeTab, setActiveTab] = useState<LeadGenModeTab>('enrich')

  // Form states
  const [enrichUrls, setEnrichUrls] = useState('')
  const [findQuery, setFindQuery] = useState('')
  const [findLimit, setFindLimit] = useState(20)
  const [hunterEnabled, setHunterEnabled] = useState(false)
  const [engine, setEngine] = useState<LeadGenEngine>('auto')
  const [pagesPerSite, setPagesPerSite] = useState(4)
  const [robotsObey, setRobotsObey] = useState(true)

  const {
    state,
    health,
    jobs,
    activeJob,
    leads,
    selectedLead,
    error,
    crmStatus,
    isTabPaused,
    createJob,
    pause,
    resume,
    refresh,
    selectJob,
    selectLead,
    crmUpsert,
    exportJsonl,
    reset,
  } = useLeadGenJob(initialJobId)

  const handleEnrichSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const urls = enrichUrls
      .split(/[\r\n]+/)
      .map(u => u.trim())
      .filter(Boolean)
      .slice(0, 25)

    if (urls.length === 0) return

    try {
      await createJob({
        job_kind: 'enrich',
        seeds: { urls },
        engine_default: engine,
        mode: 'crawl',
        recipe_id: 'mena-construction-contact',
        robots_obey: robotsObey,
        adaptive: true,
        enrich_emails: true,
        generate_outreach: false,
        hunter: { enabled: hunterEnabled },
        brief: {
          icp: 'Direct website enrichment',
          geos: ['SA', 'AE', 'EG', 'JO'],
          languages: ['ar', 'en'],
          exclude_domains: [],
          max_pages: urls.length * pagesPerSite,
          max_leads: urls.length,
          credit_budget: urls.length,
          outreach_min_score: 50
        }
      })
    } catch {
      // Handled in hook
    }
  }

  const handleFindSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!findQuery.trim()) return

    try {
      await createJob({
        job_kind: 'find',
        find: {
          query: findQuery.trim(),
          limit: findLimit,
          radius_m: 50000
        },
        seeds: { urls: [] },
        engine_default: engine,
        mode: 'crawl',
        recipe_id: 'mena-construction-contact',
        robots_obey: robotsObey,
        adaptive: true,
        enrich_emails: true,
        generate_outreach: false,
        hunter: { enabled: hunterEnabled },
        brief: {
          icp: findQuery.trim(),
          geos: ['SA', 'AE', 'EG', 'JO'],
          languages: ['ar', 'en'],
          exclude_domains: [],
          max_pages: findLimit * pagesPerSite,
          max_leads: findLimit,
          credit_budget: findLimit,
          outreach_min_score: 50
        }
      })
    } catch {
      // Handled in hook
    }
  }

  const handleExportCsv = (detail: 'simple' | 'full' = 'simple') => {
    if (!activeJob) return
    window.open(getExportUrl(activeJob.id, 'csv', detail, isArabic ? 'ar' : 'en'), '_blank')
  }

  const handleExportXlsx = () => {
    if (!activeJob) return
    window.open(getExportUrl(activeJob.id, 'xlsx', 'simple', isArabic ? 'ar' : 'en'), '_blank')
  }

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8 font-sans transition-all text-[#0f141b] dark:text-[#e8ecf2]"
    >
      {/* Top Header Strip */}
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
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#0f141b] dark:text-[#e8ecf2]">
            {isArabic ? 'توليد العملاء' : 'Lead Generation'}
          </h1>
          <p className="mt-1 text-xs text-[#5b6577] dark:text-[#8b95a7]">
            {isArabic
              ? 'إثراء مواقع الشركات واكتشاف العملاء المحتملين عبر الخرائط ومحركات البحث.'
              : 'Enrich business websites or find leads using Places and Web search with verified provenance.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsArabic(!isArabic)}
            className="rounded border border-[#cfd6df] dark:border-white/15 bg-white dark:bg-[#11151c] px-2.5 py-1 text-xs font-mono font-medium text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2] transition-colors"
          >
            {isArabic ? 'English (EN)' : 'العربية (AR)'}
          </button>

          {jobs.length > 0 && (
            <select
              value={activeJob?.id ?? ''}
              onChange={e => {
                const j = jobs.find(x => x.id === e.target.value)
                if (j) selectJob(j)
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

          {activeJob && (
            <button
              type="button"
              onClick={reset}
              className="rounded-md border border-[#cfd6df] dark:border-white/15 px-3 py-1.5 text-xs font-medium text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2]"
            >
              {isArabic ? '+ مهمة جديدة' : '+ New Task'}
            </button>
          )}
        </div>
      </div>

      {/* Settings / Engine Strip */}
      <SettingsStrip health={health} isArabic={isArabic} />

      {/* Error Banner */}
      {error && (
        <div className="rounded-lg border border-[#c62f2a]/20 dark:border-[#f85149]/30 bg-[#c62f2a]/5 dark:bg-[#f85149]/10 p-3 text-xs text-[#c62f2a] dark:text-[#f85149]">
          <span className="font-semibold">{isArabic ? 'خطأ:' : 'Error:'}</span> {error}
        </div>
      )}

      {/* 2-Mode Creation Form (Active when no job or user clicked + New Task) */}
      {!activeJob && (
        <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-6 space-y-6">
          <ModeTabs activeTab={activeTab} onChange={setActiveTab} isArabic={isArabic} />

          {activeTab === 'enrich' ? (
            <EnrichForm
              urlsText={enrichUrls}
              onChangeUrlsText={setEnrichUrls}
              hunterEnabled={hunterEnabled}
              onChangeHunterEnabled={setHunterEnabled}
              hunterAvailable={true}
              onSubmit={handleEnrichSubmit}
              isSubmitting={state === 'enqueueing'}
              isArabic={isArabic}
            />
          ) : (
            <FindForm
              query={findQuery}
              onChangeQuery={setFindQuery}
              limit={findLimit}
              onChangeLimit={setFindLimit}
              hunterEnabled={hunterEnabled}
              onChangeHunterEnabled={setHunterEnabled}
              hunterAvailable={true}
              googleAvailable={true}
              osmAvailable={true}
              onSubmit={handleFindSubmit}
              isSubmitting={state === 'enqueueing'}
              isArabic={isArabic}
            />
          )}

          <AdvancedPanel
            engine={engine}
            onChangeEngine={v => setEngine(v as LeadGenEngine)}
            pagesPerSite={pagesPerSite}
            onChangePagesPerSite={setPagesPerSite}
            robotsObey={robotsObey}
            onChangeRobotsObey={setRobotsObey}
            isArabic={isArabic}
          />
        </div>
      )}

      {/* Active Job Workspace */}
      {activeJob && (
        <div className="space-y-6">
          <JobProgress
            job={activeJob}
            onPause={pause}
            onResume={resume}
            onRefresh={refresh}
            isArabic={isArabic}
            isTabPaused={isTabPaused}
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <ExportBar
              leadCount={leads.length}
              onExportCsv={handleExportCsv}
              onExportXlsx={handleExportXlsx}
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

          {selectedLead && (
            <LeadDetail
              lead={selectedLead}
              onClose={() => selectLead(null)}
              isArabic={isArabic}
            />
          )}
        </div>
      )}
    </div>
  )
}
