import { getClientEntitlements } from '@/lib/billing/entitlements'

interface RateLimitStore {
  count: number
  resetAt: number
}

// In-memory store for rate limiting (can be replaced with Redis later)
const store = new Map<string, RateLimitStore>()

export async function checkRateLimit(clientId: string): Promise<{ allowed: boolean; limit: number; remaining: number }> {
  const entitlements = await getClientEntitlements(clientId)
  const limit = entitlements.apiRequestsPerMinute
  
  if (limit <= 0) {
    return { allowed: false, limit: 0, remaining: 0 }
  }

  const now = Date.now()
  const key = `rl:${clientId}`
  
  let record = store.get(key)
  
  if (!record || record.resetAt < now) {
    record = { count: 1, resetAt: now + 60000 }
    store.set(key, record)
    return { allowed: true, limit, remaining: limit - 1 }
  }
  
  if (record.count >= limit) {
    return { allowed: false, limit, remaining: 0 }
  }
  
  record.count += 1
  return { allowed: true, limit, remaining: limit - record.count }
}
