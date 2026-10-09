import dns from 'dns'

/**
 * SSRF and Localhost validation for Lead Generation fetch targets.
 * Strict rejection of RFC1918 private subnets, loopback, link-local, and non-http(s) schemes.
 */
export function isPrivateOrLocalhost(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    let host = url.hostname.toLowerCase()
    
    // strip brackets for ipv6
    if (host.startsWith('[') && host.endsWith(']')) {
      host = host.slice(1, -1)
    }

    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '0.0.0.0' ||
      host === '::1' ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host.endsWith('.home')
    ) {
      return true
    }
    
    // IPv6 checks (unique local fc00::/7, link local fe80::/10, IPv4-mapped)
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

    // Check IPv4 private octets (10.x, 192.168.x, 172.16-31.x, 127.x, 169.254.x)
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
    const match = host.match(ipv4Regex)
    if (match) {
      const b1 = parseInt(match[1], 10)
      const b2 = parseInt(match[2], 10)
      if (b1 === 10) return true
      if (b1 === 127) return true
      if (b1 === 169 && b2 === 254) return true // Link-local
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
    // Basic check on the resolved address by wrapping in a fake URL
    return !isPrivateOrLocalhost(`http://${address}`)
  } catch {
    // If it doesn't resolve, we block it just to be safe or maybe allow?
    // Actually, if it doesn't resolve, fetch will fail anyway. Let's block it.
    return false
  }
}

export async function safeFetch(urlStr: string, init?: RequestInit, maxRedirects = 5): Promise<Response> {
  let currentUrl = urlStr
  let redirects = 0
  let currentInit = { ...init, redirect: 'manual' as RequestRedirect }

  while (redirects <= maxRedirects) {
    if (isPrivateOrLocalhost(currentUrl)) {
      throw new Error("SSRF protection: Disallowed private host or non-HTTP(S) scheme")
    }
    
    const u = new URL(currentUrl)
    if (!(await isSafeIp(u.hostname))) {
      throw new Error("SSRF protection: Resolved to disallowed private IP")
    }
    
    const res = await fetch(currentUrl, currentInit)
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
