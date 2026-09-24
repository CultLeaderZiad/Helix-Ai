'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type {
  LeadGenJob,
  LeadGenLead,
  LeadGenRecipe,
  CreateJobPayload,
  WorkerHealthResponse,
} from '@/lib/leadgen/types'
import {
  fetchWorkerHealth,
  fetchRecipes,
  listJobs,
  getJob,
  getJobLeads,
  createJob as apiCreateJob,
  pauseJob as apiPauseJob,
  resumeJob as apiResumeJob,
  crmUpsert as apiCrmUpsert,
  getExportUrl,
} from '@/lib/leadgen/client'

export type HookState =
  | 'idle'
  | 'validating'
  | 'enqueueing'
  | 'polling'
  | 'succeeded'
  | 'failed'
  | 'worker_offline'

export function useLeadGenJob(initialJobId?: string) {
  const [state, setState] = useState<HookState>('idle')
  const [health, setHealth] = useState<WorkerHealthResponse | null>(null)
  const [recipes, setRecipes] = useState<LeadGenRecipe[]>([])
  const [jobs, setJobs] = useState<LeadGenJob[]>([])
  const [activeJob, setActiveJob] = useState<LeadGenJob | null>(null)
  const [leads, setLeads] = useState<LeadGenLead[]>([])
  const [selectedLead, setSelectedLead] = useState<LeadGenLead | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [crmStatus, setCrmStatus] = useState<string | null>(null)

  const pollingRef = useRef<NodeJS.Timeout | null>(null)

  // 1. Initial health & recipes & job history load
  const loadInitialData = useCallback(async () => {
    try {
      const [h, r, j] = await Promise.all([
        fetchWorkerHealth(),
        fetchRecipes(),
        listJobs().catch(() => []),
      ])
      setHealth(h)
      setRecipes(r)
      setJobs(j)

      if (h.worker === 'offline') {
        // If worker is offline and no active job, note worker offline
      }

      if (initialJobId) {
        const matching = j.find(item => item.id === initialJobId)
        if (matching) {
          setActiveJob(matching)
          const jobLeads = await getJobLeads(matching.id).catch(() => [])
          setLeads(jobLeads)
          if (matching.status === 'running' || matching.status === 'queued') {
            setState('polling')
          } else if (matching.status === 'succeeded') {
            setState('succeeded')
          } else if (matching.status === 'failed') {
            setState('failed')
          }
        }
      } else if (j.length > 0 && !activeJob) {
        setActiveJob(j[0])
        const jobLeads = await getJobLeads(j[0].id).catch(() => [])
        setLeads(jobLeads)
        if (j[0].status === 'running' || j[0].status === 'queued') {
          setState('polling')
        } else if (j[0].status === 'succeeded') {
          setState('succeeded')
        } else if (j[0].status === 'failed') {
          setState('failed')
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to Lead Generation service'
      setError(msg)
    }
  }, [initialJobId])

  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 2. Polling loop for active job
  useEffect(() => {
    if (!activeJob) return

    const isTerminal = activeJob.status === 'succeeded' || activeJob.status === 'failed'
    if (isTerminal) {
      if (activeJob.status === 'succeeded') setState('succeeded')
      if (activeJob.status === 'failed') setState('failed')
      return
    }

    setState('polling')
    const pollInterval = setInterval(async () => {
      try {
        const [updated, updatedLeads] = await Promise.all([
          getJob(activeJob.id),
          getJobLeads(activeJob.id),
        ])
        setActiveJob(updated)
        setLeads(updatedLeads)

        if (updated.status === 'succeeded') {
          setState('succeeded')
          clearInterval(pollInterval)
        } else if (updated.status === 'failed') {
          setState('failed')
          clearInterval(pollInterval)
        }
      } catch (err: unknown) {
        console.warn('Poll error:', err)
      }
    }, 1800)

    pollingRef.current = pollInterval
    return () => clearInterval(pollInterval)
  }, [activeJob?.id, activeJob?.status])

  // Actions
  const createJob = async (payload: CreateJobPayload) => {
    setError(null)
    setState('validating')
    try {
      setState('enqueueing')
      const resp = await apiCreateJob(payload)
      const freshJob = await getJob(resp.job_id)
      setActiveJob(freshJob)
      setLeads([])
      setSelectedLead(null)
      setState('polling')
      // Refresh jobs list
      listJobs().then(setJobs).catch(() => {})
      return freshJob
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create job'
      setError(msg)
      setState('failed')
      throw err
    }
  }

  const pause = async () => {
    if (!activeJob) return
    try {
      await apiPauseJob(activeJob.id)
      const updated = await getJob(activeJob.id)
      setActiveJob(updated)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to pause job'
      setError(msg)
    }
  }

  const resume = async () => {
    if (!activeJob) return
    try {
      await apiResumeJob(activeJob.id)
      const updated = await getJob(activeJob.id)
      setActiveJob(updated)
      setState('polling')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to resume job'
      setError(msg)
    }
  }

  const refresh = async () => {
    if (!activeJob) return
    try {
      const [updated, updatedLeads, jList] = await Promise.all([
        getJob(activeJob.id),
        getJobLeads(activeJob.id),
        listJobs(),
      ])
      setActiveJob(updated)
      setLeads(updatedLeads)
      setJobs(jList)
    } catch (err: unknown) {
      console.warn('Refresh error:', err)
    }
  }

  const selectJob = async (job: LeadGenJob) => {
    setActiveJob(job)
    setSelectedLead(null)
    try {
      const jobLeads = await getJobLeads(job.id)
      setLeads(jobLeads)
      if (job.status === 'running' || job.status === 'queued') {
        setState('polling')
      } else if (job.status === 'succeeded') {
        setState('succeeded')
      } else if (job.status === 'failed') {
        setState('failed')
      } else {
        setState('idle')
      }
    } catch {
      setLeads([])
    }
  }

  const crmUpsert = async () => {
    if (!activeJob) return
    setCrmStatus('pushing')
    try {
      const res = await apiCrmUpsert(activeJob.id)
      setCrmStatus(`Pushed ${res.contactsUpserted} contacts, ${res.companiesUpserted} companies.`)
      // Refresh leads to see crm_contact_id links
      const freshLeads = await getJobLeads(activeJob.id)
      setLeads(freshLeads)
      const freshJob = await getJob(activeJob.id)
      setActiveJob(freshJob)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'CRM push failed'
      setCrmStatus(`Error: ${msg}`)
    }
  }

  const exportCsv = () => {
    if (!activeJob) return
    window.open(getExportUrl(activeJob.id, 'csv'), '_blank')
  }

  const exportJsonl = () => {
    if (!activeJob) return
    window.open(getExportUrl(activeJob.id, 'jsonl'), '_blank')
  }

  const reset = () => {
    setActiveJob(null)
    setLeads([])
    setSelectedLead(null)
    setError(null)
    setState('idle')
  }

  return {
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
    selectLead: setSelectedLead,
    crmUpsert,
    exportCsv,
    exportJsonl,
    reset,
  }
}
