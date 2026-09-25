import type { LeadDescriptionSource } from '@/lib/schema'

export interface DescriptionResult {
  description: string | null
  source: LeadDescriptionSource
}

const COOKIE_LEGAL_MARKERS = [
  'cookie',
  'privacy policy',
  'terms of service',
  'all rights reserved',
  'copyright',
  'سياسة الخصوصية',
  'شروط الاستخدام',
  'ملفات تعريف الارتباط',
]

/**
 * Extracts a factual description from the page markup.
 * Order: JSON-LD description -> og:description -> meta description -> first substantial <p>.
 * Strictly capped at 280 chars. Never hallucinated by an LLM.
 */
export function extractDescription(html: string): DescriptionResult {
  if (!html) return { description: null, source: 'none' }

  // 1. JSON-LD Organization / LocalBusiness description
  const jsonLdMatches = html.matchAll(/<script\b[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi)
  for (const jm of jsonLdMatches) {
    try {
      const data = JSON.parse(jm[1])
      const objects = Array.isArray(data) ? data : [data]
      for (const obj of objects) {
        if (obj?.description && typeof obj.description === 'string' && obj.description.trim().length > 10) {
          return {
            description: cleanText(obj.description),
            source: 'jsonld',
          }
        }
      }
    } catch {
      // ignore JSON errors
    }
  }

  // 2. OpenGraph og:description
  const ogMatch = html.match(/<meta\b[^>]*property=['"]og:description['"][^>]*content=['"]([^'"]+)['"]/i)
    || html.match(/<meta\b[^>]*content=['"]([^'"]+)['"][^>]*property=['"]og:description['"]/i)
  if (ogMatch && ogMatch[1] && ogMatch[1].trim().length > 10) {
    return {
      description: cleanText(ogMatch[1]),
      source: 'og',
    }
  }

  // 3. Meta description
  const metaMatch = html.match(/<meta\b[^>]*name=['"]description['"][^>]*content=['"]([^'"]+)['"]/i)
    || html.match(/<meta\b[^>]*content=['"]([^'"]+)['"][^>]*name=['"]description['"]/i)
  if (metaMatch && metaMatch[1] && metaMatch[1].trim().length > 10) {
    return {
      description: cleanText(metaMatch[1]),
      source: 'meta',
    }
  }

  // 4. First substantial <p> tag (>= 60 chars, skipping legal/cookies)
  const pMatches = html.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)
  for (const pm of pMatches) {
    const raw = pm[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (raw.length >= 60) {
      const lower = raw.toLowerCase()
      if (!COOKIE_LEGAL_MARKERS.some(m => lower.includes(m))) {
        return {
          description: cleanText(raw),
          source: 'page',
        }
      }
    }
  }

  return { description: null, source: 'none' }
}

function cleanText(text: string): string {
  const cleaned = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned.slice(0, 280)
}
