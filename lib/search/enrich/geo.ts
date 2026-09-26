import type { LeadGeoSource } from '@/lib/schema'

export interface GeoResult {
  city: string | null
  country: string | null
  source: LeadGeoSource
}

const CITY_GAZETTEER: Array<{ en: string; ar: string; country: string }> = [
  { en: 'Riyadh', ar: 'الرياض', country: 'SA' },
  { en: 'Jeddah', ar: 'جدة', country: 'SA' },
  { en: 'Dammam', ar: 'الدمام', country: 'SA' },
  { en: 'Khobar', ar: 'الخبر', country: 'SA' },
  { en: 'Mecca', ar: 'مكة', country: 'SA' },
  { en: 'Medina', ar: 'المدينة', country: 'SA' },
  { en: 'Dubai', ar: 'دبي', country: 'AE' },
  { en: 'Abu Dhabi', ar: 'أبوظبي', country: 'AE' },
  { en: 'Sharjah', ar: 'الشارقة', country: 'AE' },
  { en: 'Ajman', ar: 'عجمان', country: 'AE' },
  { en: 'Cairo', ar: 'القاهرة', country: 'EG' },
  { en: 'Giza', ar: 'الجيزة', country: 'EG' },
  { en: 'Alexandria', ar: 'الإسكندرية', country: 'EG' },
  { en: 'Amman', ar: 'عمان', country: 'JO' },
  { en: 'Kuwait City', ar: 'الكويت', country: 'KW' },
  { en: 'Doha', ar: 'الدوحة', country: 'QA' },
  { en: 'Manama', ar: 'المنامة', country: 'BH' },
  { en: 'Muscat', ar: 'مسقط', country: 'OM' },
]

const CCTLD_COUNTRIES: Record<string, string> = {
  sa: 'SA',
  ae: 'AE',
  eg: 'EG',
  jo: 'JO',
  kw: 'KW',
  qa: 'QA',
  bh: 'BH',
  om: 'OM',
  uk: 'GB',
  us: 'US',
}

/**
 * Extracts city and country from JSON-LD PostalAddress or page gazetteer matching.
 * Factual only: never infers city from a phone number prefix.
 */
export function extractGeo(html: string, targetUrl: string): GeoResult {
  if (!html) return { city: null, country: null, source: 'none' }

  // 1. JSON-LD PostalAddress
  const jsonLdMatches = html.matchAll(/<script\b[^>]*type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/gi)
  for (const jm of jsonLdMatches) {
    try {
      const data = JSON.parse(jm[1])
      const objects = Array.isArray(data) ? data : [data]
      for (const obj of objects) {
        const address = obj?.address || (obj?.['@type'] === 'PostalAddress' ? obj : null)
        if (address) {
          const city = address.addressLocality || address.addressRegion || null
          const country = address.addressCountry || null
          if (city || country) {
            return {
              city: typeof city === 'string' ? city.trim() : null,
              country: typeof country === 'string' ? country.slice(0, 2).toUpperCase() : null,
              source: 'schema_org',
            }
          }
        }
      }
    } catch {
      // ignore
    }
  }

  // 2. Gazetteer scan in page text
  const cleanText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  for (const entry of CITY_GAZETTEER) {
    if (cleanText.includes(entry.en) || cleanText.includes(entry.ar)) {
      return {
        city: entry.en,
        country: entry.country,
        source: 'address_text',
      }
    }
  }

  // 3. Fallback to ccTLD for country only
  try {
    const parsed = new URL(targetUrl)
    const hostParts = parsed.hostname.toLowerCase().split('.')
    const tld = hostParts[hostParts.length - 1]
    if (CCTLD_COUNTRIES[tld]) {
      return {
        city: null,
        country: CCTLD_COUNTRIES[tld],
        source: 'tld',
      }
    }
  } catch {
    // ignore
  }

  return { city: null, country: null, source: 'none' }
}

export const extractGeoFromHtmlAndDomain = extractGeo

