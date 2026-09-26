import { cleanDomain, isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'
import { routeFetchTarget } from '@/lib/leadgen/engines/router'
import { extractContactsFromHtml } from '@/lib/leadgen/pipeline/extract'
import { extractSocialLinks } from '@/lib/search/enrich/socials'
import { extractDescription } from '@/lib/search/enrich/describe'
import { extractGeoFromHtmlAndDomain } from '@/lib/search/enrich/geo'
import { sanitizeAndValidatePhones } from '@/lib/search/enrich/phones'
import { searchDomainWithHunter } from '@/lib/search/providers/hunter'
import { mergeHunterEmails, HunterPerson } from '@/lib/search/enrich/hunter-merge'
import { computeLeadScore } from '@/lib/leadgen/pipeline/score'
import { LeadGenDecisionMaker } from '@/lib/leadgen/types'

export interface EnrichDomainOptions {
  domainOrUrl: string
  pagesPerSite?: number // default 4 (homepage + <= 3 linked contact/about pages)
  engine?: string // default 'auto'
  robotsObey?: boolean // default true
  clientId?: string | null
  hunter?: {
    enabled?: boolean
    departments?: string[]
    limit?: number
  }
  defaultCountry?: string
  icpText?: string
}

export interface EnrichedDomainResult {
  domain: string
  company: string
  website: string
  description?: string
  description_source: 'meta' | 'og' | 'jsonld' | 'page' | 'tinyfish_fetch' | 'tinyfish_agent' | 'google_places' | 'none'
  city?: string
  country?: string
  geo_source: 'schema_org' | 'address_text' | 'tld' | 'google_places' | 'foursquare' | 'osm' | 'none'
  primary_email?: string
  all_emails: string[]
  email_source: 'website' | 'hunter' | 'none'
  phones: string[]
  socials: Record<string, string>
  score: number
  score_priority: 'high' | 'med' | 'low'
  pages_checked: number
  people: HunterPerson[]
  decision_makers: LeadGenDecisionMaker[]
  sources: string[]
  logs: string[]
}

/**
 * Discovers internal contact and about pages directly linked from the homepage HTML.
 */
function discoverLinksFromHtml(html: string, baseOrigin: string, maxLinks = 3): string[] {
  const links: string[] = []
  const seen = new Set<string>()

  const hrefRegex = /href=["']([^"']+)["']/gi
  let match: RegExpExecArray | null

  while ((match = hrefRegex.exec(html)) !== null) {
    const rawHref = match[1]?.trim()
    if (!rawHref || rawHref.startsWith('#') || rawHref.startsWith('javascript:') || rawHref.startsWith('mailto:') || rawHref.startsWith('tel:')) {
      continue
    }

    try {
      const parsed = new URL(rawHref, baseOrigin)
      // Check same origin or same root domain
      if (parsed.origin !== baseOrigin && cleanDomain(parsed.hostname) !== cleanDomain(baseOrigin)) {
        continue
      }

      const pathAndQuery = parsed.pathname.toLowerCase()
      // Check if it matches contact, about, team, connect, or Arabic equivalents
      const isContactOrAbout = /contact|about|team|connect|support|اتصل|تواصل|من-نحن|عن/i.test(pathAndQuery)
      if (isContactOrAbout) {
        const fullUrl = `${parsed.origin}${parsed.pathname}`
        if (!seen.has(fullUrl) && !isPrivateOrLocalhost(fullUrl)) {
          seen.add(fullUrl)
          links.push(fullUrl)
          if (links.length >= maxLinks) break
        }
      }
    } catch {
      // ignore invalid URLs
    }
  }

  return links
}

/**
 * Enriches a single domain or URL across up to `pagesPerSite` pages.
 * Reuses router, extract, score, and new search/enrich modules.
 */
export async function enrichDomain(options: EnrichDomainOptions): Promise<EnrichedDomainResult> {
  const { domainOrUrl, pagesPerSite = 4, engine = 'auto', robotsObey = true, clientId = null, hunter, defaultCountry, icpText } = options
  const logs: string[] = []

  let cleanTarget = domainOrUrl.trim()
  if (!cleanTarget.startsWith('http://') && !cleanTarget.startsWith('https://')) {
    cleanTarget = `https://${cleanTarget}`
  }

  const domain = cleanDomain(cleanTarget)
  let origin = ''
  try {
    origin = new URL(cleanTarget).origin
  } catch {
    origin = `https://${domain}`
  }

  const candidateUrls: string[] = [origin]
  let pagesOk = 0
  let pagesSkipped404 = 0

  const gatheredEmails = new Set<string>()
  const gatheredPhoneCandidates: string[] = []
  let combinedSocials: Record<string, string> = {}
  let firstDescription: string | undefined
  let descriptionSource: 'meta' | 'og' | 'jsonld' | 'page' | 'tinyfish_fetch' | 'tinyfish_agent' | 'google_places' | 'none' = 'none'
  let bestCity: string | undefined
  let bestCountry: string | undefined
  let geoSource: 'schema_org' | 'address_text' | 'tld' | 'google_places' | 'foursquare' | 'osm' | 'none' = 'none'
  let inferredCompany = domain.split('.')[0]
  inferredCompany = inferredCompany.charAt(0).toUpperCase() + inferredCompany.slice(1)
  let excerptForScore = ''

  // 1. Fetch homepage first
  const { result: homeRes } = await routeFetchTarget(origin, {
    engine: (engine as any) || 'auto',
    robotsObey,
    clientId: clientId || null
  })

  if (homeRes.fetch_status === 'not_found') {
    pagesSkipped404 += 1
  } else if (homeRes.ok && homeRes.html) {
    pagesOk += 1
    const homeContacts = extractContactsFromHtml(homeRes.html, origin)
    homeContacts.emails.forEach(e => gatheredEmails.add(e))
    homeContacts.phones.forEach(p => gatheredPhoneCandidates.push(p))
    if (homeContacts.company_name && homeContacts.company_name !== 'Unknown Company') {
      inferredCompany = homeContacts.company_name
    }
    excerptForScore += ` ${homeContacts.markdown_excerpt || ''}`

    // Socials
    combinedSocials = { ...combinedSocials, ...extractSocialLinks(homeRes.html) }

    // Description
    const descResult = extractDescription(homeRes.html)
    if (descResult.description) {
      firstDescription = descResult.description
      descriptionSource = descResult.source
    }

    // Geo
    const geoResult = extractGeoFromHtmlAndDomain(homeRes.html, domain)
    if (geoResult.city) bestCity = geoResult.city
    if (geoResult.country) bestCountry = geoResult.country
    if (geoResult.source !== 'none') geoSource = geoResult.source

    // Discover internal contact / about links
    const maxSubPages = Math.max(0, pagesPerSite - 1)
    const discoveredLinks = discoverLinksFromHtml(homeRes.html, origin, maxSubPages)

    if (discoveredLinks.length > 0) {
      discoveredLinks.forEach(l => candidateUrls.push(l))
    } else if (maxSubPages > 0) {
      // Fallback: try max 2 conventional contact paths if no links were present
      candidateUrls.push(`${origin}/contact`)
      candidateUrls.push(`${origin}/about`)
    }
  }

  // 2. Fetch discovered sub-pages (pages 2..N)
  const subPages = candidateUrls.slice(1, pagesPerSite)
  for (const pageUrl of subPages) {
    try {
      const { result: subRes } = await routeFetchTarget(pageUrl, {
        engine: (engine as any) || 'auto',
        robotsObey,
        clientId: clientId || null
      })

      if (subRes.fetch_status === 'not_found') {
        pagesSkipped404 += 1
        continue
      }

      if (subRes.ok && subRes.html) {
        pagesOk += 1
        const subContacts = extractContactsFromHtml(subRes.html, pageUrl)
        subContacts.emails.forEach(e => gatheredEmails.add(e))
        subContacts.phones.forEach(p => gatheredPhoneCandidates.push(p))
        excerptForScore += ` ${subContacts.markdown_excerpt || ''}`

        // Additional socials
        combinedSocials = { ...combinedSocials, ...extractSocialLinks(subRes.html) }

        // Description fallback if missing
        if (!firstDescription) {
          const descResult = extractDescription(subRes.html)
          if (descResult.description) {
            firstDescription = descResult.description
            descriptionSource = descResult.source
          }
        }

        // Geo fallback if missing
        if (!bestCity || !bestCountry) {
          const geoResult = extractGeoFromHtmlAndDomain(subRes.html, domain)
          if (!bestCity && geoResult.city) bestCity = geoResult.city
          if (!bestCountry && geoResult.country) bestCountry = geoResult.country
          if (geoSource === 'none' && geoResult.source !== 'none') geoSource = geoResult.source
        }
      }
    } catch {
      // quiet skip
    }
  }

  // One aggregate line per domain (F3)
  logs.push(`> enrich · ${domain} · pages=${pagesOk} ok · ${pagesSkipped404} skipped(404)`)

  // 3. WhatsApp in socials also feeds phone candidates (Spec §8.1)
  if (combinedSocials.whatsapp) {
    const waDigits = combinedSocials.whatsapp.replace(/[^0-9+]/g, '')
    if (waDigits.length >= 7) {
      gatheredPhoneCandidates.push(waDigits.startsWith('+') ? waDigits : `+${waDigits}`)
    }
  }

  // 4. Validate and sanitize phone numbers with libphonenumber-js
  const countryForPhones = bestCountry || defaultCountry
  const validPhones = sanitizeAndValidatePhones(gatheredPhoneCandidates, countryForPhones, 3)

  // 5. Hunter Integration (opt-in)
  let hunterPeople: HunterPerson[] = []
  let decisionMakers: LeadGenDecisionMaker[] = []
  let primaryEmail = Array.from(gatheredEmails)[0]
  let emailSource: 'website' | 'hunter' | 'none' = primaryEmail ? 'website' : 'none'

  if (hunter?.enabled && process.env.HUNTER_API_KEY) {
    // Only call Hunter if no personal email found yet or always if requested
    try {
      const hunterRes = await searchDomainWithHunter(domain, {
        limit: hunter.limit || 5,
        departments: hunter.departments,
        clientId
      })
      if (hunterRes.ok && hunterRes.data) {
        const merged = mergeHunterEmails(hunterRes.data, Array.from(gatheredEmails), primaryEmail)
        hunterPeople = merged.people
        decisionMakers = merged.decision_makers
        if (merged.primary_email) {
          primaryEmail = merged.primary_email
        }
        emailSource = merged.email_source
      }
    } catch (err) {
      console.warn(`[enrichDomain] Hunter enrichment error for ${domain}:`, err)
    }
  }

  const sources: string[] = ['website']
  if (emailSource === 'hunter' || hunterPeople.length > 0) {
    sources.push('hunter')
  }

  // 6. Compute lead score v2
  const scoreResult = computeLeadScore({
    emails: primaryEmail ? [primaryEmail, ...Array.from(gatheredEmails)] : Array.from(gatheredEmails),
    phones: validPhones,
    socials: combinedSocials,
    description: firstDescription,
    city: bestCity,
    country: bestCountry,
    markdown_excerpt: excerptForScore,
    people: hunterPeople
  }, icpText)

  return {
    domain,
    company: inferredCompany,
    website: origin,
    description: firstDescription,
    description_source: descriptionSource,
    city: bestCity,
    country: bestCountry,
    geo_source: geoSource,
    primary_email: primaryEmail,
    all_emails: Array.from(gatheredEmails),
    email_source: emailSource,
    phones: validPhones,
    socials: combinedSocials,
    score: scoreResult.score,
    score_priority: scoreResult.priority,
    pages_checked: pagesOk + pagesSkipped404,
    people: hunterPeople,
    decision_makers: decisionMakers,
    sources,
    logs
  }
}
