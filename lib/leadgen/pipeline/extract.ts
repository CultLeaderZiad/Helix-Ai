import { cleanDomain } from '@/lib/leadgen/ssrf'
import type { ExtractedContacts } from './types'

const EMAIL_REGEX = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g
// Comprehensive phone regex covering international (+966..., +971..., +20..., +1...) and regional formats
const PHONE_REGEX = /(?:\+?\d{1,4}[-.\s]?)?(?:\(?\d{1,4}\)?[-.\s]?)?\d{2,4}[-.\s]?\d{2,4}(?:[-.\s]?\d{2,4})?/g

const STATIC_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.js', '.css', '.woff', '.woff2']

/**
 * Deterministic contact and company extraction from HTML with strict zero-fabrication guarantees.
 */
export function extractContactsFromHtml(html: string, targetUrl: string): ExtractedContacts {
  const fallbackCompany = cleanDomain(targetUrl)

  if (!html) {
    return {
      company_name: fallbackCompany,
      emails: [],
      phones: [],
      address: null,
      markdown_excerpt: '',
      extract_status: 'empty',
    }
  }

  const emailsSet = new Set<string>()
  const phonesSet = new Set<string>()

  // 1. Mailto links
  const mailtoMatches = html.matchAll(/href=['"]mailto:([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)['"]/gi)
  for (const match of mailtoMatches) {
    const raw = match[1]?.trim().toLowerCase()
    if (raw && !STATIC_EXTENSIONS.some(ext => raw.endsWith(ext))) {
      emailsSet.add(raw)
    }
  }

  // 2. Tel links
  const telMatches = html.matchAll(/href=['"]tel:([^'"]+)['"]/gi)
  for (const match of telMatches) {
    const raw = match[1]?.trim()
    if (raw) {
      const digitsOnly = raw.replace(/\D/g, '')
      if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
        phonesSet.add(raw)
      }
    }
  }

  // 3. Body text email regex search
  const textEmailMatches = html.match(EMAIL_REGEX)
  if (textEmailMatches) {
    for (const em of textEmailMatches) {
      const clean = em.trim().toLowerCase()
      if (!STATIC_EXTENSIONS.some(ext => clean.endsWith(ext))) {
        emailsSet.add(clean)
      }
    }
  }

  // 4. Strip scripts, styles, and tags for clean text extraction
  const cleanBody = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim()

  // 5. Body text phone regex search (TS fix: Scrapling Python had PHONE_REGEX defined but unused)
  const textPhoneMatches = cleanBody.match(PHONE_REGEX)
  if (textPhoneMatches) {
    for (const ph of textPhoneMatches) {
      const cleanPh = ph.trim()
      const digits = cleanPh.replace(/\D/g, '')
      // Filter out isolated years (e.g. 2024, 2026) or short numbers
      if (digits.length >= 7 && digits.length <= 15) {
        // Exclude common date patterns like 2024-05-12
        if (!/^\d{4}-\d{2}-\d{2}$/.test(cleanPh)) {
          phonesSet.add(cleanPh)
        }
      }
    }
  }

  // 6. Title / Company Name Extraction (No trailing space requirement)
  let company_name: string | null = null
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  if (titleMatch && titleMatch[1]) {
    const rawTitle = titleMatch[1].trim()
    const firstPart = rawTitle.split(/[|\-–—•]/)[0]?.trim()
    if (firstPart && firstPart.length > 1) {
      company_name = firstPart
    }
  }

  if (!company_name) {
    company_name = fallbackCompany
  }

  const excerptText = cleanBody.slice(0, 1200)
  const markdown_excerpt = `### ${company_name}\n\n**Source URL:** ${targetUrl}\n\n${excerptText.slice(0, 600)}${excerptText.length > 600 ? '...' : ''}`

  const emails = Array.from(emailsSet).slice(0, 5)
  const phones = Array.from(phonesSet).slice(0, 5)

  let extract_status: ExtractedContacts['extract_status'] = 'empty'
  if (emails.length > 0 || phones.length > 0) {
    extract_status = 'ok'
  } else if (company_name && company_name !== fallbackCompany) {
    extract_status = 'partial'
  }

  return {
    company_name,
    emails,
    phones,
    address: null,
    markdown_excerpt,
    extract_status,
  }
}
