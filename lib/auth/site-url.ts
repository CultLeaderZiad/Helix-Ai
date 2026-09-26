/**
 * Public origin used in Supabase auth emails.
 * Production must never fall back to localhost: a confirmation link built
 * from http://localhost:3000 is undeliverable or rejected by the redirect allow-list.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, '')
}

function isLocalHost(url: string): boolean {
  return /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(url)
}

function withProtocol(hostOrUrl: string): string {
  if (/^https?:\/\//i.test(hostOrUrl)) return stripTrailingSlash(hostOrUrl)
  return `https://${hostOrUrl.replace(/\/+$/, '')}`
}

export function getPublicSiteUrl(env: NodeJS.ProcessEnv = process.env): string {
  const explicit = (env.NEXT_PUBLIC_SITE_URL || '').trim()
  const vercelEnv = (env.VERCEL_ENV || '').trim()
  const productionHost = (env.VERCEL_PROJECT_PRODUCTION_URL || '').trim()
  const deploymentHost = (env.VERCEL_URL || '').trim()
  const onVercel = vercelEnv === 'production' || vercelEnv === 'preview' || Boolean(env.VERCEL)

  if (explicit && !(onVercel && vercelEnv === 'production' && isLocalHost(explicit))) {
    return stripTrailingSlash(explicit)
  }

  if (vercelEnv === 'production' && productionHost) return withProtocol(productionHost)
  if (deploymentHost) return withProtocol(deploymentHost)
  if (productionHost) return withProtocol(productionHost)
  if (explicit) return stripTrailingSlash(explicit)
  return 'http://localhost:3000'
}

/** Reject protocol-relative and off-site next values. */
export function safeNextPath(next: string | null | undefined, fallback = '/dashboard'): string {
  if (!next) return fallback
  if (!next.startsWith('/') || next.startsWith('//') || next.includes('\\') || next.includes('://')) {
    return fallback
  }
  return next
}

export function authCallbackUrl(nextPath: string, env: NodeJS.ProcessEnv = process.env): string {
  const next = safeNextPath(nextPath)
  return `${getPublicSiteUrl(env)}/auth/callback?next=${encodeURIComponent(next)}`
}
