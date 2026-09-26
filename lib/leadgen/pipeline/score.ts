import type { ExtractedContacts } from './types'

export interface ScoreOutput {
  score: number
  priority: 'high' | 'med' | 'low'
  breakdown: {
    base: number
    email: number
    phone: number
    socials: number
    description: number
    geo: number
    icp_boost: number
  }
}

export interface ScoreLeadInput {
  emails?: string[]
  phones?: string[]
  socials?: Record<string, string>
  description?: string
  city?: string
  country?: string
  markdown_excerpt?: string
  people?: Array<{ type?: string; confidence?: number }>
}

/**
 * Score v2 (Lead Gen v2 Spec §8.5):
 * 25 base + 30 email + 15 phone + 10 socials + 5 description + 5 geo + ICP <= 10
 * Clamped to 0..100.
 * Priority: high >= 70, med >= 40, else low.
 * A Hunter personal email with confidence >= 80 counts as email.
 * An empty site like example.com scores 25.
 */
export function computeLeadScore(
  input: ScoreLeadInput | ExtractedContacts,
  icpText: string = ''
): ScoreOutput {
  const base = 25

  // Check email: on-site emails or Hunter personal email with confidence >= 80
  const hasOnSiteEmail = Array.isArray(input.emails) && input.emails.length > 0
  const hasHunterPersonalEmail = Array.isArray((input as any).people) &&
    (input as any).people.some((p: any) => p.type === 'personal' && (p.confidence ?? 0) >= 80)

  const emailPts = (hasOnSiteEmail || hasHunterPersonalEmail) ? 30 : 0

  // Phones
  const phonePts = Array.isArray(input.phones) && input.phones.length > 0 ? 15 : 0

  // Socials: at least one valid social platform link
  const socialsMap = (input as any).socials || {}
  const hasSocials = Object.values(socialsMap).some(v => typeof v === 'string' && v.trim().length > 0)
  const socialsPts = hasSocials ? 10 : 0

  // Description: non-empty meaningful description
  const hasDesc = typeof (input as any).description === 'string' && (input as any).description.trim().length > 0
  const descPts = hasDesc ? 5 : 0

  // Geo: city or country present
  const hasGeo = Boolean((input as any).city || (input as any).country)
  const geoPts = hasGeo ? 5 : 0

  // ICP boost: up to +10 pts (2.5 pts per token)
  const excerptLower = ((input as any).markdown_excerpt || (input as any).description || '').toLowerCase()
  const icpTokens = (icpText || '')
    .split(/\s+/)
    .map(t => t.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/gi, ''))
    .filter(t => t.length > 3)

  let matches = 0
  for (const token of icpTokens) {
    if (excerptLower.includes(token)) {
      matches += 1
    }
  }

  const icp_boost = Math.min(10, Math.floor(matches * 2.5))
  const total = Math.min(100, Math.max(0, base + emailPts + phonePts + socialsPts + descPts + geoPts + icp_boost))

  let priority: 'high' | 'med' | 'low' = 'low'
  if (total >= 70) {
    priority = 'high'
  } else if (total >= 40) {
    priority = 'med'
  }

  return {
    score: total,
    priority,
    breakdown: {
      base,
      email: emailPts,
      phone: phonePts,
      socials: socialsPts,
      description: descPts,
      geo: geoPts,
      icp_boost,
    },
  }
}
