export interface PlanTier {
  id: string
  name: string
  features: string[]
  apiRequestsPerMinute: number
  maxConcurrentTasks: number
  monthlySearchQuota: number
}

export const COMMERCIAL_CATALOG: Record<string, PlanTier> = {
  'free': {
    id: 'free',
    name: 'Free Trial',
    features: [],
    apiRequestsPerMinute: 0, // No API access unless paid
    maxConcurrentTasks: 0,
    monthlySearchQuota: 0,
  },
  'starter-mena': {
    id: 'starter-mena',
    name: 'SME Starter',
    features: ['whatsapp_lead_capture', 'crm_core'],
    apiRequestsPerMinute: 10,
    maxConcurrentTasks: 1,
    monthlySearchQuota: 100,
  },
  'accelerator-mena': {
    id: 'accelerator-mena',
    name: 'Business Accelerator',
    features: ['whatsapp_lead_capture', 'crm_core', 'voice_ai_receptionist', 'dormant_lead_reactivation'],
    apiRequestsPerMinute: 30,
    maxConcurrentTasks: 3,
    monthlySearchQuota: 500,
  },
  'omni-mena': {
    id: 'omni-mena',
    name: 'Omni Operations',
    features: ['whatsapp_lead_capture', 'crm_core', 'voice_ai_receptionist', 'dormant_lead_reactivation', 'debt_collection'],
    apiRequestsPerMinute: 100,
    maxConcurrentTasks: 10,
    monthlySearchQuota: 2000,
  }
}
