export interface AssessmentInput {
  businessName: string
  contactName: string
  email: string
  phone: string
  vertical: string
  regionTier: 'gcc_enterprise' | 'mena_sme'
  country?: string
  monthlyCallVolume: 'under_100' | '100_500' | '500_2000' | '2000_plus'
  primaryPainPoint: string
  language?: 'en' | 'ar'
}

export interface RecommendationResult {
  systemId: string
  systemName: string
  systemNameAr: string
  headline: string
  headlineAr: string
  rationale: string
  rationaleAr: string
  estimatedMonthlyRoi: string
  setupFeeCents: number
  monthlyRetainerCents: number
  currency: string
  suggestedSteps: string[]
  suggestedStepsAr: string[]
  whatsappStrategy: string
  whatsappStrategyAr: string
}
