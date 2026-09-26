'use client'

import React, { useState } from 'react'
import { useDashLang } from '@/components/dashboard/use-lang'
import { InlineError, PageHead } from '@/components/dashboard/ui'
import { tx, type DashLang } from '@/lib/dashboard/lang'
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
  lang?: DashLang
}

export function LeadGenPage({ businessName, initialJobId, lang: langProp }: LeadGenPageProps) {
  const lang = useDashLang(langProp ?? 'en')
  const isArabic = lang === 'ar'
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
    <div className="stack">
      <PageHead
        title={tx(lang, 'Lead generation', 'توليد العملاء')}
        lede={tx(
          lang,
          'Find new businesses to contact, or enrich a list you already have. Every field shows where it came from.',
          'ابحث عن أنشطة تجارية جديدة للتواصل معها، أو أثرِ قائمة لديك. كل حقل يوضح مصدره.',
        )}
        actions={
          <div className="ph-actions">
            {businessName ? <span className="faint">{businessName}</span> : null}
            {jobs.length > 0 && (
            <select
              value={activeJob?.id ?? ''}
              onChange={e => {
                const j = jobs.find(x => x.id === e.target.value)
                if (j) selectJob(j)
              }}
              className="fld"
            >
              {jobs.map(j => (
                <option key={j.id} value={j.id}>
                  {j.brief?.icp ? `${j.brief.icp.slice(0, 24)}…` : j.id.slice(0, 8)} ({j.status})
                </option>
              ))}
            </select>
          )}

          {activeJob && (
            <button type="button" onClick={reset} className="btn-o">
              {tx(lang, 'New job', 'مهمة جديدة')}
            </button>
          )}
          </div>
        }
      />

      {/* Settings / Engine Strip */}
      <SettingsStrip health={health} isArabic={isArabic} />

      {/* Error Banner */}
      {error ? <InlineError>{error}</InlineError> : null}

      {!activeJob && (
        <div className="pnl">
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
