'use client'

import React, { useRef, useEffect } from 'react'
import type { LeadGenJob } from '@/lib/schema'

interface JobProgressProps {
  job: LeadGenJob
  onPause: () => void
  onResume: () => void
  onRefresh: () => void
  isArabic?: boolean
  isTabPaused?: boolean
}

const STAGES = [
  { key: 'brief', label: 'Brief', labelAr: 'الموجز' },
  { key: 'seed', label: 'Seed', labelAr: 'الروابط' },
  { key: 'discover', label: 'Discover', labelAr: 'الاستكشاف' },
  { key: 'fetch', label: 'Fetch', labelAr: 'الجلب' },
  { key: 'extract', label: 'Extract', labelAr: 'الاستخراج' },
  { key: 'enrich', label: 'Enrich', labelAr: 'الإثراء' },
  { key: 'score', label: 'Score', labelAr: 'التقييم' },
  { key: 'outreach', label: 'Outreach', labelAr: 'المسودة' },
  { key: 'export', label: 'Export', labelAr: 'التصدير' },
]

export function JobProgress({
  job,
  onPause,
  onResume,
  onRefresh,
  isArabic = false,
  isTabPaused = false,
}: JobProgressProps) {
  const [showLogs, setShowLogs] = React.useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [job.logs])

  const isRunning = job.status === 'running' || job.status === 'queued'
  const isPaused = job.status === 'paused'
  const isSucceeded = job.status === 'succeeded'
  const isFailed = job.status === 'failed'

  const currentStageIndex = STAGES.findIndex(s => s.key === job.stage)
  const activeIndex = currentStageIndex >= 0 ? currentStageIndex : job.stage_index

  return (
    <div className="rounded-xl border border-[#d9dee6] dark:border-white/10 bg-white dark:bg-[#11151c] p-4 space-y-4">
      {/* Tab Pause Notice (Honest pause semantics) */}
      {isTabPaused && isRunning && (
        <div className="rounded-md border border-[#a86a00]/30 bg-[#a86a00]/10 px-3 py-2 text-xs text-[#a86a00] dark:text-[#d29922] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">!</span>
            <span>
              {isArabic
                ? 'متوقف مؤقتاً: أبقِ هذه الصفحة مفتوحة لمواصلة معالجة مهام استخراج العملاء.'
                : 'Paused: open this page to continue processing.'}
            </span>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="underline font-semibold hover:opacity-80"
          >
            {isArabic ? 'استئناف الآن' : 'Tick now'}
          </button>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#d9dee6] dark:border-white/10 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isRunning
                  ? 'bg-[#0e8da6] dark:bg-[#38c6e0] animate-pulse'
                  : isPaused
                  ? 'bg-[#a86a00] dark:bg-[#d29922]'
                  : isSucceeded
                  ? 'bg-[#1f8a3b] dark:bg-[#3fb950]'
                  : 'bg-[#c62f2a] dark:bg-[#f85149]'
              }`}
            />
            <span className="font-display text-sm font-semibold uppercase tracking-wider text-[#0f141b] dark:text-[#e8ecf2]">
              {job.status}
            </span>
          </div>

          <span className="font-mono text-xs text-[#5b6577] dark:text-[#8b95a7]">
            job:{job.id.slice(0, 8)} · engine:{job.engine_default}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isRunning && (
            <button
              type="button"
              onClick={onPause}
              className="rounded border border-[#cfd6df] dark:border-white/15 px-3 py-1 text-xs font-medium text-[#0f141b] dark:text-[#e8ecf2] hover:bg-[#eaeef3] dark:hover:bg-[#171c25] transition-colors"
            >
              {isArabic ? 'إيقاف مؤقت' : 'Pause'}
            </button>
          )}

          {isPaused && (
            <button
              type="button"
              onClick={onResume}
              className="rounded bg-[#0e8da6] dark:bg-[#38c6e0] px-3 py-1 text-xs font-semibold text-white dark:text-[#06141a] hover:opacity-90 transition-opacity"
            >
              {isArabic ? 'استئناف' : 'Resume'}
            </button>
          )}

          <button
            type="button"
            onClick={onRefresh}
            className="rounded border border-[#cfd6df] dark:border-white/15 px-2.5 py-1 font-mono text-xs text-[#5b6577] dark:text-[#8b95a7] hover:text-[#0f141b] dark:hover:text-[#e8ecf2] transition-colors"
            title="Refresh job status"
          >
            ↻
          </button>
        </div>
      </div>

      {/* 9-Stage Pipeline Sequence */}
      <div>
        <div className="flex items-center justify-between text-[11px] font-mono text-[#5b6577] dark:text-[#8b95a7] mb-2">
          <span>{isArabic ? 'المرحلة الحالية:' : 'Current step:'} {job.stage_label}</span>
          <span>{activeIndex + 1}/9</span>
        </div>
        <div className="grid grid-cols-9 gap-1">
          {STAGES.map((stage, idx) => {
            const isCompleted = isSucceeded || idx < activeIndex
            const isCurrent = idx === activeIndex && !isSucceeded

            return (
              <div key={stage.key} className="flex flex-col items-center">
                <div
                  className={`h-1.5 w-full rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-[#1f8a3b] dark:bg-[#3fb950]'
                      : isCurrent
                      ? 'bg-[#0e8da6] dark:bg-[#38c6e0]'
                      : 'bg-[#eaeef3] dark:bg-[#171c25]'
                  }`}
                />
                <span className="mt-1 text-[9px] font-mono truncate max-w-full text-[#5b6577] dark:text-[#8b95a7]">
                  {isArabic ? stage.labelAr : stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Real Performance Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-y border-[#d9dee6] dark:border-white/10 py-2.5 text-center font-mono">
        <div>
          <div className="text-[10px] text-[#5b6577] dark:text-[#8b95a7] uppercase">
            {isArabic ? 'العملاء المستخرجون' : 'Leads Found'}
          </div>
          <div className="text-sm font-semibold text-[#0f141b] dark:text-[#e8ecf2] tabular-nums">
            {job.leads_count}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#5b6577] dark:text-[#8b95a7] uppercase">
            {isArabic ? 'صفحات مجلوبة' : 'Pages Fetched'}
          </div>
          <div className="text-sm font-semibold text-[#0f141b] dark:text-[#e8ecf2] tabular-nums">
            {job.pages_fetched}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#5b6577] dark:text-[#8b95a7] uppercase">
            {isArabic ? 'صفحات محجوبة' : 'Pages Blocked'}
          </div>
          <div className="text-sm font-semibold text-[#a86a00] dark:text-[#d29922] tabular-nums">
            {job.pages_blocked}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#5b6577] dark:text-[#8b95a7] uppercase">
            {isArabic ? 'الوقت المنقضي' : 'Elapsed Time'}
          </div>
          <div className="text-sm font-semibold text-[#0f141b] dark:text-[#e8ecf2] tabular-nums">
            {job.elapsed_ms ? `${Math.round(job.elapsed_ms / 1000)}s` : '0s'}
          </div>
        </div>

        <div>
          <div className="text-[10px] text-[#5b6577] dark:text-[#8b95a7] uppercase">
            {isArabic ? 'الرصيد المستخدم' : 'Credits Used'}
          </div>
          <div className="text-sm font-semibold text-[#0e8da6] dark:text-[#38c6e0] tabular-nums">
            {Number(job.credits_used).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Terminal Real Log Output */}
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px] font-mono text-[#5b6577] dark:text-[#8b95a7]">
          <span>{isArabic ? 'سجل العمليات المباشر' : 'Live Execution Logs'}</span>
          <button
            type="button"
            onClick={() => setShowLogs(!showLogs)}
            className="text-xs text-[#0e8da6] dark:text-[#38c6e0] hover:underline"
          >
            {showLogs
              ? (isArabic ? 'إخفاء السجل' : 'Hide log')
              : (isArabic ? 'عرض السجل' : 'Show log')} ({job.logs?.length ?? 0} {isArabic ? 'أسطر' : 'lines'})
          </button>
        </div>
        {showLogs && (
        <div
          ref={terminalRef}
          role="log"
          aria-live="polite"
          className="h-44 overflow-y-auto rounded-lg bg-[#0b0e13] p-3 font-mono text-xs text-[#e8ecf2] border border-white/10"
        >
          {job.logs && job.logs.length > 0 ? (
            job.logs.map((log, index) => {
              const isError = log.includes('error') || log.includes('blocked')
              const isAudit = log.includes('audit')
              const isHeader = log.includes('engine:')
              return (
                <div
                  key={index}
                  className={`leading-relaxed ${
                    isError
                      ? 'text-[#f85149]'
                      : isAudit
                      ? 'text-[#d29922]'
                      : isHeader
                      ? 'text-[#38c6e0] font-semibold'
                      : 'text-[#8b95a7]'
                  }`}
                >
                  {log}
                </div>
              )
            })
          ) : (
            <div className="text-[#8b95a7] italic">
              {isArabic ? 'في انتظار استلام المهمة من قبل المشغل الآلي...' : 'Awaiting worker execution heartbeat...'}
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  )
}
