import { ProviderCall, ProviderAvailability, CallCtx } from '@/lib/search/places/types'
import { incrementProviderUsage } from '@/lib/leadgen/engines/usage'

const TINYFISH_AGENT_BASE = process.env.TINYFISH_AGENT_URL || 'https://agent.tinyfish.ai/v1'

export interface TinyFishAgentRunResponse {
  run_id: string
}

export interface TinyFishAgentStatusResponse {
  run_id: string
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  result?: any
  error?: {
    code: string
    category: string
    retry_after?: number
  }
}

export class TinyFishAgentProvider {
  id = 'tinyfish_agent' as const

  async availability(): Promise<ProviderAvailability> {
    const key = process.env.TINYFISH_API_KEY
    const isEnabled = process.env.TINYFISH_AGENT_ENABLED === 'true'

    if (!key) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Agent unavailable. Set TINYFISH_API_KEY on the server.',
        reason_ar: 'الوكيل غير متاح. أضف TINYFISH_API_KEY على الخادم.',
        env: ['TINYFISH_API_KEY']
      }
    }

    if (!isEnabled) {
      return {
        id: this.id,
        available: false,
        reason_en: 'Agent is off. Set TINYFISH_AGENT_ENABLED=true (billed per step $0.016).',
        reason_ar: 'الوكيل متوقف. فعّل TINYFISH_AGENT_ENABLED=true (يُحتسب لكل خطوة 0.016 دولار).',
        env: ['TINYFISH_AGENT_ENABLED']
      }
    }

    return {
      id: this.id,
      available: true,
      env: ['TINYFISH_API_KEY', 'TINYFISH_AGENT_ENABLED'],
      note_en: 'Agent runs asynchronously and is billed per step ($0.016/step).',
      note_ar: 'يعمل الوكيل بشكل غير متزامن ويُحاسب لكل خطوة (0.016 دولار/خطوة).'
    }
  }

  /**
   * Always launches asynchronous automation run. Never blocks handler execution.
   */
  async startRunAsync(
    url: string,
    goal: string,
    outputSchema?: Record<string, any>,
    ctx?: CallCtx
  ): Promise<ProviderCall<TinyFishAgentRunResponse>> {
    const key = process.env.TINYFISH_API_KEY
    if (!key || process.env.TINYFISH_AGENT_ENABLED !== 'true') {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'TinyFish Agent not enabled'
      }
    }

    const start = Date.now()
    const maxDuration = parseInt(process.env.TINYFISH_AGENT_MAX_SECONDS || '90', 10)

    try {
      const res = await fetch(`${TINYFISH_AGENT_BASE}/automation/run-async`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': key
        },
        body: JSON.stringify({
          url,
          goal,
          output_schema: outputSchema || undefined,
          browser_profile: 'lite',
          agent_config: { max_duration_seconds: maxDuration }
        }),
        signal: AbortSignal.timeout(10000)
      })

      const latency_ms = Date.now() - start
      if (res.status === 402) {
        return {
          ok: false,
          status: 'quota_blocked',
          http_status: 402,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: 'TinyFish wallet balance depleted'
        }
      }

      if (!res.ok) {
        return {
          ok: false,
          status: 'error',
          http_status: res.status,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: `TinyFish Agent HTTP ${res.status}`
        }
      }

      const json = await res.json()
      return {
        ok: true,
        status: 'pending',
        http_status: res.status,
        latency_ms,
        units: 1,
        cost_micros: 0,
        external_ref: json.run_id,
        data: { run_id: json.run_id }
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'Agent run launch failed'
      }
    }
  }

  async checkRun(runId: string): Promise<ProviderCall<TinyFishAgentStatusResponse>> {
    const key = process.env.TINYFISH_API_KEY
    if (!key) {
      return {
        ok: false,
        status: 'unavailable',
        latency_ms: 0,
        units: 0,
        cost_micros: 0,
        detail: 'TINYFISH_API_KEY missing'
      }
    }

    const start = Date.now()
    try {
      const res = await fetch(`${TINYFISH_AGENT_BASE}/runs/${runId}`, {
        method: 'GET',
        headers: { 'X-API-Key': key },
        signal: AbortSignal.timeout(8000)
      })

      const latency_ms = Date.now() - start
      if (!res.ok) {
        return {
          ok: false,
          status: 'error',
          http_status: res.status,
          latency_ms,
          units: 1,
          cost_micros: 0,
          detail: `TinyFish Agent poll HTTP ${res.status}`
        }
      }

      const json = await res.json()
      return {
        ok: true,
        status: json.status === 'COMPLETED' ? 'ok' : json.status === 'FAILED' ? 'error' : 'pending',
        http_status: res.status,
        latency_ms,
        units: 1,
        cost_micros: 0,
        data: json
      }
    } catch (err: any) {
      return {
        ok: false,
        status: 'error',
        latency_ms: Date.now() - start,
        units: 1,
        cost_micros: 0,
        detail: err?.message || 'Agent poll failed'
      }
    }
  }
}
