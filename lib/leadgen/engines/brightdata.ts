/**
 * Bright Data Web Unlocker — Direct API (Stealth Engine)
 *
 * Verified API Reference & Documentation:
 * - Send first request: https://docs.brightdata.com/scraping-automation/web-unlocker/send-your-first-request
 * - API reference: https://docs.brightdata.com/api-reference/rest-api/unlocker/unlock-website
 * - Introduction: https://docs.brightdata.com/scraping-automation/web-unlocker/introduction
 * - Error codes: https://docs.brightdata.com/scraping-automation/web-unlocker/error-codes
 */

import { isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'
import type { FetchResult } from '@/lib/leadgen/pipeline/types'

export function isBrightDataConfigured(): boolean {
  return Boolean(process.env.BRIGHTDATA_API_TOKEN)
}

/**
 * Executes a stealth fetch via Bright Data Web Unlocker direct API.
 */
export async function fetchBrightDataStealth(targetUrl: string): Promise<FetchResult> {
  const token = process.env.BRIGHTDATA_API_TOKEN
  const zone = process.env.BRIGHTDATA_UNLOCKER_ZONE || 'helix_unlocker'

  if (!token) {
    return {
      ok: false,
      engine: 'stealth',
      status: 503,
      fetch_status: 'error',
      html: '',
      error: 'Bright Data API token not configured (BRIGHTDATA_API_TOKEN missing)',
    }
  }

  if (isPrivateOrLocalhost(targetUrl)) {
    return {
      ok: false,
      engine: 'stealth',
      status: 400,
      fetch_status: 'error',
      html: '',
      error: 'SSRF protection: Disallowed private host or scheme for Bright Data Unlocker',
    }
  }

  const endpoint = 'https://api.brightdata.com/request'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 35000)

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        zone,
        url: targetUrl,
        format: 'raw',
      }),
    })
    clearTimeout(timer)

    if (res.status === 401) {
      return {
        ok: false,
        engine: 'stealth',
        status: 401,
        fetch_status: 'error',
        html: '',
        error: 'Bright Data authentication failed: invalid BRIGHTDATA_API_TOKEN',
      }
    }

    if (res.status === 402) {
      return {
        ok: false,
        engine: 'stealth',
        status: 402,
        fetch_status: 'error',
        html: '',
        error: 'Bright Data billing or payment required (quota/balance exhausted)',
      }
    }

    if (res.status === 429) {
      return {
        ok: false,
        engine: 'stealth',
        status: 429,
        fetch_status: 'rate_limited',
        html: '',
        error: 'Bright Data rate limit exceeded',
      }
    }

    const bodyText = await res.text()

    if (!res.ok) {
      return {
        ok: false,
        engine: 'stealth',
        status: res.status,
        fetch_status: res.status === 403 ? 'blocked' : 'error',
        html: '',
        error: `Bright Data error (HTTP ${res.status}): ${bodyText.slice(0, 200)}`,
      }
    }

    // Check for zone error in 200 body
    if (bodyText.includes('"error"') && bodyText.includes('zone')) {
      return {
        ok: false,
        engine: 'stealth',
        status: 400,
        fetch_status: 'error',
        html: '',
        error: `Bright Data zone configuration error: ${bodyText.slice(0, 200)}`,
      }
    }

    return {
      ok: true,
      engine: 'stealth',
      status: 200,
      fetch_status: 'ok',
      html: bodyText,
      finalUrl: targetUrl,
    }
  } catch (err: unknown) {
    clearTimeout(timer)
    const error = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      engine: 'stealth',
      status: 500,
      fetch_status: 'error',
      html: '',
      error,
    }
  }
}
