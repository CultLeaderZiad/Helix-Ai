/**
 * Cloudflare Browser Run — /content Quick Action (Dynamic Engine)
 *
 * Verified API Reference & Documentation:
 * - Quick Action: https://developers.cloudflare.com/browser-run/quick-actions/content-endpoint/
 * - API Reference: https://developers.cloudflare.com/api/resources/browser_rendering/subresources/content/methods/create/
 * - Limits: https://developers.cloudflare.com/browser-run/limits/
 * - Pricing / X-Browser-Ms-Used: https://developers.cloudflare.com/browser-run/pricing/
 *
 * NOTE: Cloudflare Browser Run traffic is identified as an automated browser (bot) by Cloudflare.
 * It executes JavaScript and renders SPAs, but is NOT stealthy against Cloudflare bot management.
 */

import { isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'
import type { FetchResult } from '@/lib/leadgen/pipeline/types'

export interface CloudflareContentResponse {
  success: boolean
  result?: string
  meta?: {
    finalUrl?: string
    status?: number
    title?: string
  }
  errors?: Array<{ code: number; message: string }>
}

export function isCloudflareConfigured(): boolean {
  return Boolean(process.env.CF_ACCOUNT_ID && process.env.CF_BROWSER_TOKEN)
}

/**
 * Renders target URL with Cloudflare Browser Run /content endpoint.
 */
export async function fetchCloudflareBrowser(
  targetUrl: string,
  options: { waitUntil?: 'networkidle0' | 'domcontentloaded'; timeout?: number } = {}
): Promise<FetchResult> {
  const accountId = process.env.CF_ACCOUNT_ID
  const token = process.env.CF_BROWSER_TOKEN

  if (!accountId || !token) {
    return {
      ok: false,
      engine: 'dynamic',
      status: 503,
      fetch_status: 'error',
      html: '',
      error: 'Cloudflare Browser Run credentials not configured (CF_ACCOUNT_ID / CF_BROWSER_TOKEN missing)',
    }
  }

  if (isPrivateOrLocalhost(targetUrl)) {
    return {
      ok: false,
      engine: 'dynamic',
      status: 400,
      fetch_status: 'error',
      html: '',
      error: 'SSRF protection: Disallowed private host or scheme for Cloudflare Browser Run',
    }
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/content`
  const timeoutMs = Math.min(options.timeout || 45000, 60000)

  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs + 5000)

    const res = await fetch(endpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: targetUrl,
        gotoOptions: {
          waitUntil: options.waitUntil || 'networkidle0',
          timeout: timeoutMs,
        },
      }),
    })
    clearTimeout(timer)

    // Read X-Browser-Ms-Used header for honest usage tracking
    const browserMsHeader = res.headers.get('x-browser-ms-used')
    const browser_ms = browserMsHeader ? parseInt(browserMsHeader, 10) : 0

    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after')
      return {
        ok: false,
        engine: 'dynamic',
        status: 429,
        fetch_status: 'rate_limited',
        html: '',
        browser_ms,
        error: `Cloudflare Browser Run rate limit or daily quota reached (Retry-After: ${retryAfter || '10s'})`,
      }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      return {
        ok: false,
        engine: 'dynamic',
        status: res.status,
        fetch_status: res.status === 403 ? 'blocked' : 'error',
        html: '',
        browser_ms,
        error: `Cloudflare Browser Run API HTTP ${res.status}: ${errText.slice(0, 200)}`,
      }
    }

    const data: CloudflareContentResponse = await res.json()
    if (!data.success || !data.result) {
      const msg = data.errors?.map(e => e.message).join(', ') || 'Unknown rendering error'
      return {
        ok: false,
        engine: 'dynamic',
        status: 500,
        fetch_status: 'error',
        html: '',
        browser_ms,
        error: `Cloudflare rendering failed: ${msg}`,
      }
    }

    const metaStatus = data.meta?.status || 200
    if (metaStatus === 404 || metaStatus === 410) {
      return {
        ok: false,
        engine: 'dynamic',
        status: metaStatus,
        fetch_status: 'not_found',
        html: data.result,
        finalUrl: data.meta?.finalUrl || targetUrl,
        browser_ms,
        error: `Page not found (HTTP ${metaStatus})`,
      }
    }

    if (metaStatus >= 400) {
      return {
        ok: false,
        engine: 'dynamic',
        status: metaStatus,
        fetch_status: metaStatus === 403 ? 'blocked' : 'error',
        html: data.result,
        finalUrl: data.meta?.finalUrl || targetUrl,
        browser_ms,
        error: `Page returned HTTP ${metaStatus}`,
      }
    }

    return {
      ok: true,
      engine: 'dynamic',
      status: metaStatus,
      fetch_status: 'ok',
      html: data.result,
      finalUrl: data.meta?.finalUrl || targetUrl,
      browser_ms,
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      engine: 'dynamic',
      status: 500,
      fetch_status: 'error',
      html: '',
      error,
    }
  }
}
