import dns from 'dns'

export function isPrivateOrLocalhost(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    let host = url.hostname.toLowerCase()
    
    if (host.startsWith('[')) {
      host = host.replace('[', '').replace(']', '')
    }

    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host.endsWith('.home') ||
      host === '169.254.169.254'
    ) {
      return true
    }
    
    if (host.includes(':')) {
      if (
        host === '::1' ||
        host.startsWith('fc') ||
        host.startsWith('fd') ||
        host.startsWith('fe8') ||
        host.startsWith('fe9') ||
        host.startsWith('fea') ||
        host.startsWith('feb') ||
        host.includes('::ffff:127.') ||
        host.includes('::ffff:10.') ||
        host.includes('::ffff:192.168.') ||
        host.includes('::ffff:172.')
      ) {
        return true
      }
    }

    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = host.match(ipv4Regex)
    if (match) {
      const b1 = parseInt(match[1], 10)
      const b2 = parseInt(match[2], 10)
      if (b1 === 10) return true
      if (b1 === 127) return true
      if (b1 === 169 && b2 === 254) return true 
      if (b1 === 192 && b2 === 168) return true
      if (b1 === 172 && b2 >= 16 && b2 <= 31) return true
      if (b1 === 0) return true
    }
    return false
  } catch {
    return true
  }
}

export function cleanDomain(urlStr: string): string {
  try {
    const u = new URL(urlStr)
    return u.hostname.replace(/^www\./, '')
  } catch {
    return urlStr
  }
}

export async function isSafeIp(host: string): Promise<boolean> {
  try {
    const { address } = await dns.promises.lookup(host)
    return !isPrivateOrLocalhost(`http://${address}`)
  } catch {
    return false
  }
}

interface SafeFetchOptions extends RequestInit {
  timeoutMs?: number;
  maxRedirects?: number;
  maxBodySize?: number;
}

export interface SafeFetchResult {
  res: Response;
  text: string;
  data: any;
  cleanup: () => void;
}

/**
 * Perform a fetch safely, guarding against SSRF and bounding the response size.
 * It also applies a timeout across both connection and body reading.
 */
export async function safeFetchFull(urlStr: string, options: SafeFetchOptions = {}): Promise<SafeFetchResult> {
  const { timeoutMs = 8000, maxRedirects = 5, maxBodySize = 5 * 1024 * 1024, ...init } = options
  
  let currentUrl = urlStr
  let redirects = 0
  
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  
  const cleanup = () => clearTimeout(timeout)
  
  try {
    let res: Response | null = null
    while (redirects <= maxRedirects) {
      if (isPrivateOrLocalhost(currentUrl)) {
        throw new Error("SSRF protection: Disallowed private host or non-HTTP(S) scheme")
      }
      
      const u = new URL(currentUrl)
      if (!(await isSafeIp(u.hostname))) {
        throw new Error("SSRF protection: Resolved to disallowed private IP")
      }
      
      res = await fetch(currentUrl, {
        ...init,
        redirect: 'manual',
        signal: controller.signal
      })
      
      if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
        redirects++
        const location = res.headers.get('location')!
        currentUrl = new URL(location, currentUrl).toString()
        continue
      }
      break
    }
    
    if (!res) {
      throw new Error("SSRF protection: Too many redirects")
    }
    
    const contentLength = res.headers.get('content-length')
    if (contentLength && parseInt(contentLength, 10) > maxBodySize) {
      throw new Error("SafeFetch: Content length exceeds maximum allowed size")
    }

    // Read bounded response
    let text = ''
    let data = null

    if (res.body) {
      const reader = res.body.getReader()
      const chunks: Uint8Array[] = []
      let bytesRead = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        if (value) {
          bytesRead += value.length
          if (bytesRead > maxBodySize) {
            throw new Error("Response body exceeds maximum allowed size")
          }
          chunks.push(value)
        }
      }

      const totalLength = chunks.reduce((acc, c) => acc + c.length, 0)
      const fullBuffer = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        fullBuffer.set(chunk, offset)
        offset += chunk.length
      }

      text = new TextDecoder().decode(fullBuffer)
      try {
        data = JSON.parse(text)
      } catch {
        // Not JSON
      }
    }

    cleanup()
    return { res, text, data, cleanup }
  } catch (err) {
    cleanup()
    throw err
  }
}

/**
 * Basic safeFetch that mimics native fetch but handles SSRF constraints.
 * It's up to the caller to manage the timeout through AbortSignal and bound body reading.
 */
export async function safeFetch(urlStr: string, options: SafeFetchOptions = {}): Promise<Response> {
  const { timeoutMs = 8000, maxRedirects = 5, ...init } = options
  
  let currentUrl = urlStr
  let redirects = 0
  
  while (redirects <= maxRedirects) {
    if (isPrivateOrLocalhost(currentUrl)) {
      throw new Error("SSRF protection: Disallowed private host or non-HTTP(S) scheme")
    }
    
    const u = new URL(currentUrl)
    if (!(await isSafeIp(u.hostname))) {
      throw new Error("SSRF protection: Resolved to disallowed private IP")
    }
    
    const res = await fetch(currentUrl, {
      ...init,
      redirect: 'manual'
    })
    
    if (res.status >= 300 && res.status < 400 && res.headers.has('location')) {
      redirects++
      const location = res.headers.get('location')!
      currentUrl = new URL(location, currentUrl).toString()
      continue
    }
    
    return res
  }
  
  throw new Error("SSRF protection: Too many redirects")
}
