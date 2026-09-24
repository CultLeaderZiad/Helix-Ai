import type { ExtractedContacts } from './types'

export interface ScoreOutput {
  score: number
  priority: 'high' | 'med' | 'low'
  breakdown: {
    base: number
    email: number
    phone: number
    icp_boost: number
  }
}

/**
 * Deterministic lead scoring matching Scrapling worker intent:
 * - Base domain & entity identification: 25 pts
 * - Real verified email: +35 pts
 * - Direct telephone contact: +20 pts
 * - ICP keyword presence in excerpt: up to +20 pts (5 pts per token > 3 chars)
 * Clamped to 0..100.
 * Priority: high >= 70, med >= 40, else low.
 */
export function computeLeadScore(contacts: ExtractedContacts, icpText: string): ScoreOutput {
  const base = 25
  const emailPts = contacts.emails.length > 0 ? 35 : 0
  const phonePts = contacts.phones.length > 0 ? 20 : 0

  const excerptLower = (contacts.markdown_excerpt || '').toLowerCase()
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

  const icp_boost = Math.min(20, matches * 5)
  const total = Math.min(100, Math.max(0, base + emailPts + phonePts + icp_boost))

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
      icp_boost,
    },
  }
}
