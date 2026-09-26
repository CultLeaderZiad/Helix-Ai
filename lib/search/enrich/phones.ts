import { parsePhoneNumberWithError, CountryCode } from 'libphonenumber-js'

export interface ExtractedPhone {
  raw: string
  e164: string
  country?: string
}

/**
 * Validates and formats candidate phone numbers into E.164.
 * Deduplicates, filters out invalid phones, and returns at most maxResults (default 3).
 */
export function sanitizeAndValidatePhones(
  candidates: string[],
  defaultCountry?: string,
  maxResults = 3
): string[] {
  const seenE164 = new Set<string>()
  const validPhones: string[] = []

  // Ensure default country code is 2 upper-case letters if provided
  const countryCode = (defaultCountry && defaultCountry.length === 2
    ? defaultCountry.toUpperCase()
    : undefined) as CountryCode | undefined

  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue
    const cleaned = raw.trim()
    if (cleaned.length < 7 || cleaned.length > 30) continue

    try {
      const parsed = parsePhoneNumberWithError(cleaned, countryCode)
      if (parsed && parsed.isValid()) {
        const e164 = parsed.format('E.164')
        if (!seenE164.has(e164)) {
          seenE164.add(e164)
          validPhones.push(e164)
          if (validPhones.length >= maxResults) break
        }
      }
    } catch {
      // Ignore unparseable phone candidates silently
    }
  }

  return validPhones
}
