export const SAMPLE_WORKSPACE_NAME = 'Al Noor Specialty Clinic'
export const SAMPLE_VERTICAL = 'Sample · Healthcare'

export function isSampleWorkspace(vertical: string | null | undefined, businessName?: string | null) {
  if (vertical && /^\s*sample(\s*·|\s+-|\s+)/i.test(vertical)) return true
  return Boolean(businessName && vertical && /sample/i.test(vertical))
}
