import { isPrivateOrLocalhost, cleanDomain } from '@/lib/leadgen/ssrf'
import { fetchHttp } from '@/lib/leadgen/engines/http'

export interface BuildUrlQueueOptions {
  seeds: {
    urls: string[]
    sitemap_url?: string | null
    shopify_url?: string | null
    domains_csv?: string | null
  }
  maxPages: number
  mode?: string
}

// Keep 2 primary contact paths for fallback only when no internal links are found
const FALLBACK_CONTACT_PATHS = [
  '/contact',
  '/contact-us'
]

/**
 * Builds the initial target URL queue from seeds, sitemaps, and common discovery paths.
 * Guarantees SSRF protection and domain deduplication within maxPages budget.
 */
export async function buildUrlQueue(options: BuildUrlQueueOptions): Promise<string[]> {
  const { seeds, maxPages } = options
  const queue: string[] = []
  const seenUrls = new Set<string>()

  function addUrl(rawUrl: string): boolean {
    if (!rawUrl || queue.length >= maxPages) return false
    let clean = rawUrl.trim()
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      clean = `https://${clean}`
    }
    if (isPrivateOrLocalhost(clean)) return false
    if (seenUrls.has(clean)) return false

    seenUrls.add(clean)
    queue.push(clean)
    return true
  }

  // 1. Ingest base URLs from seeds.urls
  for (const url of seeds.urls || []) {
    addUrl(url)
  }

  // 2. Parse domains from domains_csv if provided
  if (seeds.domains_csv) {
    const lines = seeds.domains_csv.split(/[\r\n,]+/)
    for (const line of lines) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        addUrl(trimmed)
      }
    }
  }

  // 3. Shopify store seed URL
  if (seeds.shopify_url) {
    addUrl(seeds.shopify_url)
    try {
      const parsed = new URL(seeds.shopify_url)
      addUrl(`${parsed.origin}/pages/contact`)
      addUrl(`${parsed.origin}/pages/about-us`)
    } catch {
      // ignore
    }
  }

  // 4. Ingest sitemap XML if provided
  if (seeds.sitemap_url && queue.length < maxPages) {
    try {
      if (!isPrivateOrLocalhost(seeds.sitemap_url)) {
        const sitemapRes = await fetchHttp(seeds.sitemap_url, { robotsObey: false })
        if (sitemapRes.ok && sitemapRes.html) {
          const locMatches = sitemapRes.html.matchAll(/<loc>([^<]+)<\/loc>/gi)
          const candidateUrls: string[] = []
          for (const match of locMatches) {
            const loc = match[1]?.trim()
            if (loc && !isPrivateOrLocalhost(loc)) {
              candidateUrls.push(loc)
            }
          }

          // Prioritize contact / about URLs
          const highPriority = candidateUrls.filter(u =>
            /contact|about|team|connect|support|\/ar\//i.test(u)
          )
          const remaining = candidateUrls.filter(u =>
            !/contact|about|team|connect|support|\/ar\//i.test(u)
          )

          for (const u of [...highPriority, ...remaining]) {
            if (queue.length >= maxPages) break
            addUrl(u)
          }
        }
      }
    } catch (err) {
      console.warn('[leadgen/discover] Sitemap ingestion error:', err)
    }
  }

  // 5. If queue still has budget, enqueue max 2 contact variants for unique seed domains as fallbacks (F2)
  if (queue.length < maxPages) {
    const seedOrigins = new Set<string>()
    for (const url of queue) {
      try {
        const parsed = new URL(url)
        seedOrigins.add(parsed.origin)
      } catch {
        // ignore
      }
    }

    for (const origin of seedOrigins) {
      for (const path of FALLBACK_CONTACT_PATHS) {
        if (queue.length >= maxPages) break
        addUrl(`${origin}${path}`)
      }
    }
  }

  return queue.slice(0, maxPages)
}
