import { cleanDomain } from '@/lib/leadgen/ssrf'
import { fetchHttp } from './http'
import { fetchCloudflareBrowser, isCloudflareConfigured } from './cloudflare'
import { fetchBrightDataStealth, isBrightDataConfigured } from './brightdata'
import { checkEngineQuota, recordEngineUsage } from './usage'
import type { FetchResult, FetchEngineId } from '@/lib/leadgen/pipeline/types'
import type { LeadGenEngine } from '@/lib/schema'

export interface RouteFetchOptions {
  engine: LeadGenEngine
  clientId: string | null
  robotsObey: boolean
}

export interface RouteFetchOutput {
  result: FetchResult
  logLines: string[]
}

const SPA_MARKERS = [
  '<div id="root"></div>',
  '<div id="app"></div>',
  '<div id="__next"></div>',
  'enable javascript to run this app',
  'you need to enable javascript',
  'please enable javascript',
]

const BLOCK_MARKERS = [
  'cf-browser-verification',
  'cf-challenge',
  'challenge-platform',
  'attention required! | cloudflare',
  'recaptcha',
  'hcaptcha',
  'access denied',
  'security check to access',
  'pardon our interruption',
]

export function isJsShell(html: string): boolean {
  if (!html) return true
  const lower = html.toLowerCase()
  const trimmed = html.replace(/\s+/g, ' ').trim()

  // Has explicit SPA placeholders with very little content
  if (SPA_MARKERS.some(m => lower.includes(m)) && trimmed.length < 2500) {
    // If no mailto/tel hrefs present, likely needs hydration
    if (!lower.includes('mailto:') && !lower.includes('tel:')) {
      return true
    }
  }

  // Very small body without contacts
  if (trimmed.length < 600 && !lower.includes('mailto:') && !lower.includes('tel:')) {
    return true
  }

  return false
}

export function isBlockedContent(status: number, html: string): boolean {
  if (status === 403 || status === 429 || status === 503) {
    return true
  }
  if (!html) return false
  const lower = html.toLowerCase()
  return BLOCK_MARKERS.some(marker => lower.includes(marker))
}

/**
 * Routes fetch request to requested engine or executes auto-escalation.
 * Escapes honestly when quotas or credentials are unavailable.
 */
export async function routeFetchTarget(
  targetUrl: string,
  options: RouteFetchOptions
): Promise<RouteFetchOutput> {
  const domain = cleanDomain(targetUrl)
  const logLines: string[] = []
  const { engine, clientId, robotsObey } = options

  // 1. Direct HTTP Engine
  if (engine === 'http') {
    const res = await fetchHttp(targetUrl, { robotsObey })
    await recordEngineUsage('http', clientId, 0, 1)
    if (res.fetch_status === 'ok') {
      logLines.push(`> fetch · ${domain} · http·ok`)
    } else {
      logLines.push(`> fetch · ${domain} · http·${res.fetch_status}`)
    }
    return { result: res, logLines }
  }

  // 2. Direct Dynamic Engine (Cloudflare Browser Run)
  if (engine === 'dynamic') {
    if (!isCloudflareConfigured()) {
      logLines.push(`> fetch · ${domain} · dynamic·unavailable · missing_credentials`)
      return {
        result: {
          ok: false,
          engine: 'dynamic',
          status: 503,
          fetch_status: 'error',
          html: '',
          error: 'Cloudflare credentials not configured',
        },
        logLines,
      }
    }

    const quota = await checkEngineQuota('dynamic', clientId)
    if (!quota.allowed) {
      logLines.push(`> fetch · ${domain} · dynamic·cap_blocked · remaining=0`)
      logLines.push(`> quota · dynamic · cap_reached`)
      return {
        result: {
          ok: false,
          engine: 'dynamic',
          status: 429,
          fetch_status: 'rate_limited',
          html: '',
          error: quota.reason,
        },
        logLines,
      }
    }

    const res = await fetchCloudflareBrowser(targetUrl)
    await recordEngineUsage('dynamic', clientId, res.browser_ms || 0, 1)
    if (res.fetch_status === 'ok') {
      logLines.push(`> fetch · ${domain} · dynamic·ok · browser_ms=${res.browser_ms || 0}`)
    } else {
      logLines.push(`> fetch · ${domain} · dynamic·${res.fetch_status}`)
    }
    return { result: res, logLines }
  }

  // 3. Direct Stealth Engine (Bright Data Unlocker)
  if (engine === 'stealth') {
    if (!isBrightDataConfigured()) {
      logLines.push(`> fetch · ${domain} · stealth·unavailable · missing_token`)
      return {
        result: {
          ok: false,
          engine: 'stealth',
          status: 503,
          fetch_status: 'error',
          html: '',
          error: 'Bright Data token not configured',
        },
        logLines,
      }
    }

    const quota = await checkEngineQuota('stealth', clientId)
    if (!quota.allowed) {
      logLines.push(`> fetch · ${domain} · stealth·cap_blocked · remaining=0`)
      logLines.push(`> quota · stealth · cap_reached`)
      return {
        result: {
          ok: false,
          engine: 'stealth',
          status: 429,
          fetch_status: 'rate_limited',
          html: '',
          error: quota.reason,
        },
        logLines,
      }
    }

    const res = await fetchBrightDataStealth(targetUrl)
    await recordEngineUsage('stealth', clientId, 0, 1)
    if (res.fetch_status === 'ok') {
      logLines.push(`> fetch · ${domain} · stealth·ok`)
    } else {
      logLines.push(`> fetch · ${domain} · stealth·${res.fetch_status}`)
    }
    return { result: res, logLines }
  }

  // 4. Auto Escalation Engine: HTTP -> Dynamic -> Stealth
  let currentResult = await fetchHttp(targetUrl, { robotsObey })
  await recordEngineUsage('http', clientId, 0, 1)

  // F3: Never escalate or spam errors on 404/410
  if (currentResult.status === 404 || currentResult.status === 410 || currentResult.fetch_status === 'not_found') {
    return { result: currentResult, logLines }
  }

  const isBlocked = isBlockedContent(currentResult.status, currentResult.html)
  const isShell = !isBlocked && isJsShell(currentResult.html)

  if (!isBlocked && !isShell && currentResult.fetch_status === 'ok') {
    logLines.push(`> fetch · ${domain} · http·ok`)
    return { result: currentResult, logLines }
  }

  // If empty/JS-shell, try escalating to Cloudflare Dynamic
  if (isShell && !isBlocked) {
    if (isCloudflareConfigured()) {
      const dynamicQuota = await checkEngineQuota('dynamic', clientId)
      if (dynamicQuota.allowed) {
        logLines.push(`> fetch · ${domain} · http·empty → escalate→dynamic`)
        const cfRes = await fetchCloudflareBrowser(targetUrl)
        await recordEngineUsage('dynamic', clientId, cfRes.browser_ms || 0, 1)
        cfRes.escalated_from = 'http'

        if (cfRes.fetch_status === 'ok') {
          logLines.push(`> fetch · ${domain} · dynamic·ok · browser_ms=${cfRes.browser_ms || 0}`)
          return { result: cfRes, logLines }
        } else if (cfRes.fetch_status === 'rate_limited') {
          logLines.push(`> fetch · ${domain} · dynamic·429`)
          currentResult = cfRes
        } else {
          logLines.push(`> fetch · ${domain} · dynamic·${cfRes.fetch_status}`)
          currentResult = cfRes
        }
      } else {
        logLines.push(`> fetch · ${domain} · dynamic·cap_blocked · remaining=0`)
      }
    } else {
      logLines.push(`> fetch · ${domain} · http·empty (dynamic unavailable)`)
    }
  }

  // Check if we need stealth escalation (403, 429, captcha, or blocked)
  const needsStealth = isBlockedContent(currentResult.status, currentResult.html)
  if (needsStealth) {
    if (isBrightDataConfigured()) {
      const stealthQuota = await checkEngineQuota('stealth', clientId)
      if (stealthQuota.allowed) {
        const fromEngine = currentResult.engine
        logLines.push(`> fetch · ${domain} · ${fromEngine}·blocked → escalate→stealth`)
        const bdRes = await fetchBrightDataStealth(targetUrl)
        await recordEngineUsage('stealth', clientId, 0, 1)
        bdRes.escalated_from = fromEngine

        if (bdRes.fetch_status === 'ok') {
          logLines.push(`> fetch · ${domain} · stealth·ok`)
          return { result: bdRes, logLines }
        } else {
          logLines.push(`> fetch · ${domain} · stealth·${bdRes.fetch_status}`)
          return { result: bdRes, logLines }
        }
      } else {
        logLines.push(`> fetch · ${domain} · stealth·cap_blocked · remaining=0`)
      }
    } else {
      logLines.push(`> fetch · ${domain} · blocked (stealth unavailable)`)
    }
  }

  return { result: currentResult, logLines }
}
