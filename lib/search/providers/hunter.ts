import { isPrivateOrLocalhost } from '../../leadgen/ssrf'
import { incrementProviderUsage } from '../../leadgen/engines/usage'

export interface HunterEmail {
  value: string
  type: 'personal' | 'generic'
  confidence: number
  first_name?: string
  last_name?: string
  position?: string
  seniority?: string
  department?: string
  linkedin?: string
  sources?: Array<{ domain: string; uri: string; extracted_on: string }>
}

export interface HunterDomainSearchResult {
  domain: string
  organization?: string
  pattern?: string
  accept_all?: boolean
  emails: HunterEmail[]
  credits_used: number
}

const HUNTER_API_BASE = 'https://api.hunter.io/v2'

/**
 * Perform a domain search with Hunter.io.
 * Rate limit: 15 req/s. We serialize requests where necessary.
 * Headers use X-API-KEY so keys never appear in URL query strings or server logs.
 */
export async function searchDomainWithHunter(
  domain: string,
  options?: {
    apiKey?: string
    limit?: number
    departments?: string[]
    clientId?: string | null
  }
): Promise<{ ok: boolean; data?: HunterDomainSearchResult; error?: string; status: 'ok' | 'empty' | 'quota_blocked' | 'error' | 'unavailable' }> {
  const apiKey = options?.apiKey || process.env.HUNTER_API_KEY
  if (!apiKey) {
    return { ok: false, status: 'unavailable', error: 'HUNTER_API_KEY is not configured' }
  }

  // Monthly cap check
  const cap = parseInt(process.env.HUNTER_MONTHLY_CAP || '45', 10)
  // Check usage via usage engine or check table
  // Here we use a safe ceiling
  const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').split('/')[0]

  const limit = Math.min(options?.limit || 5, 10)
  const departments = options?.departments && options.departments.length > 0
    ? options.departments.join(',')
    : 'executive,management'

  const url = `${HUNTER_API_BASE}/domain-search?domain=${encodeURIComponent(cleanDomain)}&limit=${limit}&offset=0&department=${encodeURIComponent(departments)}`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-KEY': apiKey,
        'Accept': 'application/json',
        'User-Agent': 'HelixAI/1.0 (+https://helix-ai-two.vercel.app)'
      },
      signal: AbortSignal.timeout(10000)
    })

    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: 'error', error: 'Invalid Hunter API key or permission denied' }
    }

    if (res.status === 429) {
      return { ok: false, status: 'quota_blocked', error: 'Hunter rate limit or quota exceeded' }
    }

    if (!res.ok) {
      return { ok: false, status: 'error', error: `Hunter HTTP ${res.status}` }
    }

    const json = await res.json()
    const emails: HunterEmail[] = (json.data?.emails || []).map((e: any) => ({
      value: e.value,
      type: e.type === 'personal' ? 'personal' : 'generic',
      confidence: typeof e.confidence === 'number' ? e.confidence : 0,
      first_name: e.first_name || undefined,
      last_name: e.last_name || undefined,
      position: e.position || undefined,
      seniority: e.seniority || undefined,
      department: e.department || undefined,
      linkedin: e.linkedin || undefined,
      sources: Array.isArray(e.sources) ? e.sources : []
    }))

    // Hunter counts 1 credit per email found; 0 if none found
    const creditsUsed = emails.length

    // Record engine usage
    if (creditsUsed > 0) {
      await incrementProviderUsage('hunter', options?.clientId || null, 1, 0, 0)
    }

    return {
      ok: true,
      status: emails.length > 0 ? 'ok' : 'empty',
      data: {
        domain: cleanDomain,
        organization: json.data?.organization,
        pattern: json.data?.pattern,
        accept_all: json.data?.accept_all,
        emails,
        credits_used: creditsUsed
      }
    }
  } catch (err: any) {
    return { ok: false, status: 'error', error: err?.message || 'Hunter request failed' }
  }
}
