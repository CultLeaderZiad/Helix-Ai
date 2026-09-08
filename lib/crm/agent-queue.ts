import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { AgentTask } from '@/lib/schema'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'

export interface QueueRunSummary {
  claimed: number
  applied: number
  noop: number
  failed: number
}

const FACT_COLUMNS = 'id, client_id, contact_id, field_name, field_value, evidence_band, status'

/** Clamp claim parameters to the same ranges the SQL function enforces. */
export function clampQueueOptions(options: { maxTasks?: number; leaseSeconds?: number }) {
  return {
    maxTasks: Math.min(Math.max(options.maxTasks ?? 10, 1), 50),
    leaseSeconds: Math.min(Math.max(options.leaseSeconds ?? 300, 5), 3600),
  }
}

/**
 * Drain the agent work queue once, service-role only. claim_agent_tasks
 * leases rows with FOR UPDATE SKIP LOCKED so parallel cron runs never
 * double-process a task. Every claimed task ends in exactly one complete/fail
 * call; an intermediate crash simply lets the lease expire, after which the
 * task is retried while budget remains and dead-lettered by the SQL itself.
 */
export async function runAgentTaskQueue(
  options: { supabase?: SupabaseClient; maxTasks?: number; leaseSeconds?: number } = {},
): Promise<QueueRunSummary> {
  const supabase = options.supabase ?? createSupabaseAdminClient()
  const { maxTasks, leaseSeconds } = clampQueueOptions(options)

  const { data: claimed, error } = await supabase.rpc('claim_agent_tasks', {
    p_limit: maxTasks,
    p_lease_seconds: leaseSeconds,
  })
  if (error) throw new Error(`Queue claim failed: ${error.message}`)
  const tasks = (claimed ?? []) as Pick<AgentTask, 'id' | 'kind' | 'payload'>[]

  const summary: QueueRunSummary = { claimed: tasks.length, applied: 0, noop: 0, failed: 0 }
  for (const task of tasks) {
    const result = await processTask(supabase, task)
    summary[result] += 1
  }
  return summary
}

async function processTask(
  supabase: SupabaseClient,
  task: Pick<AgentTask, 'id' | 'kind' | 'payload'>,
): Promise<'applied' | 'noop' | 'failed'> {
  if (task.kind !== 'apply_contact_fact') {
    await settle(supabase, task.id, 'fail', `unsupported kind: ${task.kind}`)
    return 'failed'
  }
  const factId = (task.payload as Record<string, unknown> | null)?.fact_id
  if (typeof factId !== 'string') {
    await settle(supabase, task.id, 'fail', 'invalid payload: fact_id missing')
    return 'failed'
  }

  const { data: fact, error: factError } = await supabase
    .from('contact_facts')
    .select(FACT_COLUMNS)
    .eq('id', factId)
    .maybeSingle()

  if (factError || !fact) {
    // The fact (or its contact) was removed while queued; nothing to write.
    await settle(supabase, task.id, 'complete', 'noop: fact no longer exists')
    return 'noop'
  }
  if (fact.status !== 'pending') {
    // Superseded or already reviewed between enqueue and now.
    await settle(supabase, task.id, 'complete', `noop: fact already ${fact.status}`)
    return 'noop'
  }

  const { error: applyError } = await supabase.rpc('apply_contact_fact', {
    p_fact_id: factId,
    p_reviewer_profile_id: null,
  })
  if (applyError) {
    await settle(supabase, task.id, 'fail', applyError.message)
    return 'failed'
  }
  await settle(supabase, task.id, 'complete', 'applied')
  return 'applied'
}

async function settle(
  supabase: SupabaseClient,
  taskId: string,
  kind: 'complete' | 'fail',
  outcome: string,
) {
  const rpc = kind === 'complete' ? 'complete_agent_task' : 'fail_agent_task'
  const { error } = await supabase.rpc(rpc, { p_task_id: taskId, p_outcome: outcome })
  if (error) throw new Error(`Queue ${kind} failed for ${taskId}: ${error.message}`)
}