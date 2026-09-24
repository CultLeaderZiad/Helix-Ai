import type {
  LeadGenJob,
  LeadGenLead,
  LeadGenRecipe,
  CreateJobPayload,
  CreateJobResponse,
  WorkerHealthResponse,
} from './types'

export class LeadGenApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'LeadGenApiError'
    this.status = status
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `HTTP error ${res.status}`
    try {
      const data = await res.json()
      if (data.error) msg = data.error
    } catch {
      // ignore json parse error
    }
    throw new LeadGenApiError(msg, res.status)
  }
  return res.json()
}

export async function fetchWorkerHealth(): Promise<WorkerHealthResponse> {
  const res = await fetch('/api/leadgen/worker/health', {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  })
  return handleResponse<WorkerHealthResponse>(res)
}

export async function fetchRecipes(): Promise<LeadGenRecipe[]> {
  const res = await fetch('/api/leadgen/recipes', {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  })
  const data = await handleResponse<{ recipes: LeadGenRecipe[] }>(res)
  return data.recipes
}

export async function listJobs(): Promise<LeadGenJob[]> {
  const res = await fetch('/api/leadgen/jobs', {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  })
  const data = await handleResponse<{ jobs: LeadGenJob[] }>(res)
  return data.jobs
}

export async function getJob(id: string): Promise<LeadGenJob> {
  const res = await fetch(`/api/leadgen/jobs/${id}`, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  })
  const data = await handleResponse<{ job: LeadGenJob }>(res)
  return data.job
}

export async function getJobLeads(id: string): Promise<LeadGenLead[]> {
  const res = await fetch(`/api/leadgen/jobs/${id}/leads`, {
    method: 'GET',
    headers: { 'Cache-Control': 'no-store' },
  })
  const data = await handleResponse<{ leads: LeadGenLead[] }>(res)
  return data.leads
}

export async function createJob(payload: CreateJobPayload): Promise<CreateJobResponse> {
  const res = await fetch('/api/leadgen/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return handleResponse<CreateJobResponse>(res)
}

export async function pauseJob(id: string): Promise<{ success: boolean; status: string }> {
  const res = await fetch(`/api/leadgen/jobs/${id}/pause`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse<{ success: boolean; status: string }>(res)
}

export async function resumeJob(id: string): Promise<{ success: boolean; status: string }> {
  const res = await fetch(`/api/leadgen/jobs/${id}/resume`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse<{ success: boolean; status: string }>(res)
}

export async function crmUpsert(id: string): Promise<{
  success: boolean
  contactsUpserted: number
  companiesUpserted: number
  factsRecorded: number
  skipped: number
}> {
  const res = await fetch(`/api/leadgen/jobs/${id}/crm-upsert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return handleResponse(res)
}

export async function tickJob(id: string): Promise<{
  ok: boolean
  job_id?: string
  status?: string
  processed?: number
  remaining?: number
  leads_count?: number
  reason?: string
}> {
  const res = await fetch(`/api/leadgen/jobs/${id}/tick`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  if (res.status === 409) {
    return { ok: false, reason: 'lease_held' }
  }
  return handleResponse(res)
}

export function getExportUrl(id: string, format: 'csv' | 'jsonl'): string {
  return `/api/leadgen/jobs/${id}/export?format=${format}`
}

