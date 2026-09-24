/**
 * SSRF and Localhost validation for Lead Generation fetch targets.
 * Strict rejection of RFC1918 private subnets, loopback, link-local, and non-http(s) schemes.
 */
export function isPrivateOrLocalhost(urlString: string): boolean {
  try {
    const url = new URL(urlString)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return true
    const host = url.hostname.toLowerCase()
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
