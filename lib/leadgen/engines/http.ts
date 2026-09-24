import { isPrivateOrLocalhost } from '@/lib/leadgen/ssrf'
import { isUrlAllowedByRobots } from '@/lib/leadgen/pipeline/robots'
import type { FetchResult } from '@/lib/leadgen/pipeline/types'

const MAX_RESPONSE_SIZE = 3 * 1024 * 1024 // 3 MiB cap
const TIMEOUT_MS = 12000 // 12 seconds

/**
 * Native HTTP fetch engine with SSRF validation, size caps, robots.txt check, and browser-like headers.
 */
export async function fetchHttp(
  targetUrl: string,
  options: { robotsObey?: boolean } = {}
): Promise<FetchResult> {
  if (isPrivateOrLocalhost(targetUrl)) {
    return {
      ok: false,
      engine: 'http',
      status: 400,
      fetch_status: 'error',
      html: '',
      error: 'SSRF protection: Disallowed private host or non-HTTP(S) scheme',
    }
  }

  if (options.robotsObey) {
    const robotsCheck = await isUrlAllowedByRobots(targetUrl)
    if (!robotsCheck.allowed) {
      return {
        ok: false,
        engine: 'http',
        status: 403,
        fetch_status: 'blocked',
        html: '',
        error: robotsCheck.reason || 'Blocked by robots.txt Disallow rule',
      }
    }
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  try {
    const res = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 HelixLeadGen/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Upgrade-Insecure-Requests': '1',
      },
    })
    clearTimeout(timer)

    // Validate redirect target for SSRF
    if (res.url && res.url !== targetUrl && isPrivateOrLocalhost(res.url)) {
      return {
        ok: false,
        engine: 'http',
        status: 400,
        fetch_status: 'error',
        html: '',
        error: 'SSRF protection: Redirected to disallowed host',
      }
    }

    const contentType = res.headers.get('content-type') || ''
    const isHtmlOrText =
      contentType.includes('text/html') ||
      contentType.includes('application/xhtml+xml') ||
      contentType.includes('text/plain')

    if (!isHtmlOrText && contentType) {
      return {
        ok: false,
        engine: 'http',
        status: res.status,
        fetch_status: 'error',
        html: '',
        finalUrl: res.url,
        error: `Unexpected Content-Type: ${contentType}`,
      }
    }

    // Stream and cap response size to prevent OOM
    if (!res.body) {
      const text = await res.text()
      return {
        ok: res.ok,
        engine: 'http',
        status: res.status,
        fetch_status: res.ok ? 'ok' : res.status === 403 || res.status === 429 ? 'blocked' : 'error',
        html: text.slice(0, MAX_RESPONSE_SIZE),
        finalUrl: res.url,
      }
    }

    const reader = res.body.getReader()
    const chunks: Uint8Array[] = []
    let receivedBytes = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        receivedBytes += value.length
        chunks.push(value)
        if (receivedBytes > MAX_RESPONSE_SIZE) {
          await reader.cancel()
          break
        }
      }
    }

    const totalBuffer = new Uint8Array(receivedBytes)
    let offset = 0
    for (const chunk of chunks) {
      totalBuffer.set(chunk, offset)
      offset += chunk.length
    }

    const decoder = new TextDecoder('utf-8', { fatal: false, ignoreBOM: true })
    const html = decoder.decode(totalBuffer)

    let fetch_status: FetchResult['fetch_status'] = 'ok'
    if (!res.ok) {
      if (res.status === 403 || res.status === 429 || res.status === 503) {
        fetch_status = 'blocked'
      } else {
        fetch_status = 'error'
      }
    }

    return {
      ok: res.ok,
      engine: 'http',
      status: res.status,
      fetch_status,
      html,
      finalUrl: res.url,
    }
  } catch (err: unknown) {
    clearTimeout(timer)
    const error = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      engine: 'http',
      status: 500,
      fetch_status: 'error',
      html: '',
      error,
    }
  }
}
