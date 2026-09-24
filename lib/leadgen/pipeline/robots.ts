import { isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'

interface RobotsCacheEntry {
  disallowedPrefixes: string[]
  expiresAt: number
}

// In-memory cache for robots.txt rules keyed by hostname
const robotsCache = new Map<string, RobotsCacheEntry>()
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

/**
 * Checks whether a given URL is permitted by the domain's robots.txt.
 * Strict zero-fabrication: only actual Disallow rules for User-agent: * are enforced.
 */
export async function isUrlAllowedByRobots(urlStr: string): Promise<{ allowed: boolean; reason?: string }> {
  try {
    const parsed = new URL(urlStr)
    const hostname = parsed.hostname.toLowerCase()
    const pathname = parsed.pathname || '/'

    const now = Date.now()
    let cached = robotsCache.get(hostname)

    if (!cached || cached.expiresAt < now) {
      const robotsUrl = `${parsed.protocol}//${parsed.host}/robots.txt`
      if (isPrivateOrLocalhost(robotsUrl)) {
        return { allowed: false, reason: 'Disallowed private host for robots.txt' }
      }

      const disallowedPrefixes: string[] = []
      try {
        const controller = new AbortController()
        const timer = setTimeout(() => controller.abort(), 6000)

        const res = await fetch(robotsUrl, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Helix-Ai-LeadGen/1.0 (+https://helix-ai-two.vercel.app/dashboard/lead-generation)',
            'Accept': 'text/plain',
          },
        })
        clearTimeout(timer)

        if (res.ok) {
          const text = await res.text()
          const lines = text.split('\n')
          let appliesToAll = false

          for (const rawLine of lines) {
            const line = rawLine.trim()
            if (!line || line.startsWith('#')) continue

            const lower = line.toLowerCase()
            if (lower.startsWith('user-agent:')) {
              const agent = line.slice(11).trim()
              appliesToAll = agent === '*'
            } else if (appliesToAll && lower.startsWith('disallow:')) {
              const rule = line.slice(9).trim()
              if (rule && rule !== '/') {
                disallowedPrefixes.push(rule)
              } else if (rule === '/') {
                disallowedPrefixes.push('/')
              }
            }
          }
        }
      } catch {
        // If robots.txt cannot be fetched (404, network error), standard practice is allow
      }

      cached = { disallowedPrefixes, expiresAt: now + CACHE_TTL_MS }
      robotsCache.set(hostname, cached)
    }

    // Check pathname against disallowed prefixes
    for (const prefix of cached.disallowedPrefixes) {
      if (prefix === '/' && pathname === '/') {
        return { allowed: false, reason: 'robots.txt Disallow: /' }
      }
      if (prefix !== '/' && pathname.startsWith(prefix)) {
        return { allowed: false, reason: `robots.txt Disallow: ${prefix}` }
      }
    }

    return { allowed: true }
  } catch {
    return { allowed: true }
  }
}
