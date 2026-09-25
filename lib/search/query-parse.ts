export interface ParsedSearchQuery {
  raw: string
  category: string
  city?: string
  country?: string // ISO2 (e.g. SA, AE, EG)
  platform?: 'instagram' | 'tiktok' | 'linkedin' | 'facebook' | 'x'
  requireWhatsApp: boolean
  language: 'en' | 'ar'
}

const CITY_MAPPINGS: Record<string, { city: string; country: string }> = {
  // Saudi Arabia
  'riyadh': { city: 'Riyadh', country: 'SA' },
  'الرياض': { city: 'Riyadh', country: 'SA' },
  'jeddah': { city: 'Jeddah', country: 'SA' },
  'جدة': { city: 'Jeddah', country: 'SA' },
  'dammam': { city: 'Dammam', country: 'SA' },
  'الدمام': { city: 'Dammam', country: 'SA' },
  'khobar': { city: 'Khobar', country: 'SA' },
  'الخبر': { city: 'Khobar', country: 'SA' },
  'mecca': { city: 'Mecca', country: 'SA' },
  'مكة': { city: 'Mecca', country: 'SA' },
  'medina': { city: 'Medina', country: 'SA' },
  'المدينة': { city: 'Medina', country: 'SA' },

  // UAE
  'dubai': { city: 'Dubai', country: 'AE' },
  'دبي': { city: 'Dubai', country: 'AE' },
  'abu dhabi': { city: 'Abu Dhabi', country: 'AE' },
  'أبوظبي': { city: 'Abu Dhabi', country: 'AE' },
  'sharjah': { city: 'Sharjah', country: 'AE' },
  'الشارقة': { city: 'Sharjah', country: 'AE' },

  // Egypt
  'cairo': { city: 'Cairo', country: 'EG' },
  'القاهرة': { city: 'Cairo', country: 'EG' },
  'giza': { city: 'Giza', country: 'EG' },
  'الجيزة': { city: 'Giza', country: 'EG' },
  'alexandria': { city: 'Alexandria', country: 'EG' },
  'الإسكندرية': { city: 'Alexandria', country: 'EG' },

  // Other MENA
  'amman': { city: 'Amman', country: 'JO' },
  'عمّان': { city: 'Amman', country: 'JO' },
  'عمان': { city: 'Amman', country: 'JO' },
  'kuwait': { city: 'Kuwait City', country: 'KW' },
  'الكويت': { city: 'Kuwait City', country: 'KW' },
  'doha': { city: 'Doha', country: 'QA' },
  'الدوحة': { city: 'Doha', country: 'QA' },
  'manama': { city: 'Manama', country: 'BH' },
  'المنامة': { city: 'Manama', country: 'BH' },
  'muscat': { city: 'Muscat', country: 'OM' },
  'مسقط': { city: 'Muscat', country: 'OM' }
}

const COUNTRY_MAPPINGS: Record<string, string> = {
  'saudi arabia': 'SA',
  'saudi': 'SA',
  'السعودية': 'SA',
  'المملكة': 'SA',
  'uae': 'AE',
  'emirates': 'AE',
  'الإمارات': 'AE',
  'egypt': 'EG',
  'مصر': 'EG',
  'jordan': 'JO',
  'الأردن': 'JO',
  'kuwait': 'KW',
  'qatar': 'QA',
  'قطر': 'QA',
  'bahrain': 'BH',
  'البحرين': 'BH',
  'oman': 'OM',
  'عُمان': 'OM'
}

/**
 * Deterministically parses free text search queries for Lead Gen / Search Bus:
 * - Detects Arabic script.
 * - Extracts platform targets (Instagram, TikTok, LinkedIn, etc.).
 * - Detects WhatsApp intent.
 * - Resolves city and country using bilingual gazetteer.
 */
export function parseSearchQuery(queryText: string): ParsedSearchQuery {
  const raw = queryText.trim()
  const lower = raw.toLowerCase()

  // 1. Language detection
  const hasArabic = /[\u0600-\u06FF]/.test(raw)
  const language: 'en' | 'ar' = hasArabic ? 'ar' : 'en'

  // 2. WhatsApp intent
  const requireWhatsApp = /whatsapp|واتساب|واتس/.test(lower)

  // 3. Platform intent
  let platform: ParsedSearchQuery['platform']
  if (/instagram|انستغرام|انستقرام/.test(lower)) platform = 'instagram'
  else if (/tiktok|تيك توك/.test(lower)) platform = 'tiktok'
  else if (/linkedin|لينكد إن/.test(lower)) platform = 'linkedin'
  else if (/facebook|فيسبوك/.test(lower)) platform = 'facebook'
  else if (/twitter|x\.com/.test(lower)) platform = 'x'

  // 4. City and Country detection
  let detectedCity: string | undefined
  let detectedCountry: string | undefined

  for (const [key, mapping] of Object.entries(CITY_MAPPINGS)) {
    const wordBoundaryRegex = new RegExp(`(^|\\s|[.,;])${key}($|\\s|[.,;])`, 'i')
    if (wordBoundaryRegex.test(lower)) {
      detectedCity = mapping.city
      detectedCountry = mapping.country
      break
    }
  }

  if (!detectedCountry) {
    for (const [key, code] of Object.entries(COUNTRY_MAPPINGS)) {
      const wordBoundaryRegex = new RegExp(`(^|\\s|[.,;])${key}($|\\s|[.,;])`, 'i')
      if (wordBoundaryRegex.test(lower)) {
        detectedCountry = code
        break
      }
    }
  }

  // 5. Category extraction (strip platform, city, whatsapp keywords from category)
  let cleanCategory = raw
  const stopWords = [
    'in', 'at', 'near', 'with', 'whatsapp', 'واتساب', 'واتس', 'في',
    'instagram', 'انستغرام', 'انستقرام', 'tiktok', 'تيك توك', 'linkedin'
  ]
  if (detectedCity) stopWords.push(detectedCity.toLowerCase())

  return {
    raw,
    category: cleanCategory.trim(),
    city: detectedCity,
    country: detectedCountry,
    platform,
    requireWhatsApp,
    language
  }
}
