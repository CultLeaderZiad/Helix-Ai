'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase'
import { createSupabaseAdminClient } from '@/lib/supabase-admin'
import { getVerifiedSession } from '@/lib/auth/session'
import type { RiskLevel, SuccessEventType } from '@/lib/schema'

/**
 * 1. Resolve an active churn risk signal
 */
export async function resolveChurnSignalAction(signalId: string, resolutionNotes?: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, error: 'Unauthorized: Agency Admin role required.' }
    }

    const adminClient = createSupabaseAdminClient()

    // 1. Fetch signal to get client_id
    const { data: signal, error: fetchErr } = await adminClient
      .from('client_churn_signals')
      .select('id, client_id, title')
      .eq('id', signalId)
      .single()

    if (fetchErr || !signal) {
      return { success: false, error: 'Signal not found.' }
    }

    // 2. Mark signal resolved
    const { error: updateErr } = await adminClient
      .from('client_churn_signals')
      .update({
        resolved_at: new Date().toISOString(),
        resolved_by: session.user.id,
      })
      .eq('id', signalId)

    if (updateErr) {
      return { success: false, error: updateErr.message }
    }

    // 3. Log to CRM activities timeline
    await adminClient.from('activities').insert({
      client_id: signal.client_id,
      type: 'task',
      subject: `Resolved Risk Signal: ${signal.title}`,
      body: resolutionNotes || `Risk signal was reviewed and resolved by ${session.user.email}.`,
    })

    revalidatePath(`/admin/risk`)
    revalidatePath(`/dashboard/health`)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to resolve signal.' }
  }
}

/**
 * 2. Create high-priority intervention task in agent_tasks
 */
export async function createHealthTaskAction(
  clientId: string,
  subject: string,
  priority: number = 8,
  reason: string = 'Intervention task generated from Account Health review'
) {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, error: 'Unauthorized: Agency Admin role required.' }
    }

    const adminClient = createSupabaseAdminClient()

    const { data, error } = await adminClient
      .from('agent_tasks')
      .insert({
        client_id: clientId,
        kind: 'notify_churn_risk',
        subject,
        reason,
        priority,
        payload: {
          created_by_admin: session.user.email,
          created_at: new Date().toISOString(),
        },
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log to activity timeline
    await adminClient.from('activities').insert({
      client_id: clientId,
      type: 'task',
      subject: `Health Task Created: ${subject}`,
      body: reason,
    })

    revalidatePath(`/admin/risk`)
    revalidatePath(`/admin/queue`)
    return { success: true, taskId: data.id }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to create task.' }
  }
}

/**
 * 3. Log a positive success event for a client
 */
export async function logSuccessEventAction(
  clientId: string,
  eventType: SuccessEventType,
  title: string,
  description?: string,
  valueImpact?: number
) {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, error: 'Unauthorized: Agency Admin role required.' }
    }

    const adminClient = createSupabaseAdminClient()

    const { data, error } = await adminClient
      .from('client_success_events')
      .insert({
        client_id: clientId,
        event_type: eventType,
        title,
        description: description || null,
        value_impact: valueImpact || null,
        created_by: session.user.id,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    // Log to activities
    await adminClient.from('activities').insert({
      client_id: clientId,
      type: 'note',
      subject: `Success Milestone: ${title}`,
      body: description || `Event type: ${eventType}. Value impact: $${valueImpact ?? 0}.`,
    })

    revalidatePath(`/admin/risk`)
    revalidatePath(`/dashboard/health`)
    return { success: true, eventId: data.id }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to log success event.' }
  }
}

/**
 * 4. Recalculate deterministic health score for a tenant
 */
export async function recalculateHealthScoreAction(clientId: string) {
  try {
    const supabase = await createSupabaseServerClient()
    const session = await getVerifiedSession(supabase)
    if (!session || session.claims.role !== 'agency_admin') {
      return { success: false, error: 'Unauthorized: Agency Admin role required.' }
    }

    const adminClient = createSupabaseAdminClient()

    // 1. Gather live signals
    const [clientRes, signalsRes, integrationsRes, ticketsRes, successRes] = await Promise.all([
      adminClient.from('clients').select('*').eq('id', clientId).single(),
      adminClient.from('client_churn_signals').select('*').eq('client_id', clientId).is('resolved_at', null),
      adminClient.from('client_integrations').select('*').eq('client_id', clientId),
      adminClient.from('support_tickets').select('*').eq('client_id', clientId).eq('status', 'open'),
      adminClient.from('client_success_events').select('*').eq('client_id', clientId),
    ])

    const client = clientRes.data
    if (!client) {
      return { success: false, error: 'Client not found.' }
    }

    const openSignals = signalsRes.data || []
    const integrations = integrationsRes.data || []
    const openTickets = ticketsRes.data || []
    const successes = successRes.data || []

    // 2. Component Scoring (0 to 100 each)
    // A. Portal Activity: 85 base, minus if inactive
    const daysSincePortal = client.last_portal_activity_at
      ? Math.floor((Date.now() - new Date(client.last_portal_activity_at).getTime()) / (1000 * 60 * 60 * 24))
      : 10
    const portalScore = Math.max(20, Math.min(100, 95 - daysSincePortal * 4))

    // B. System Usage & Reliability
    const totalInts = integrations.length
    const connectedInts = integrations.filter(i => i.status === 'connected').length
    const systemScore = totalInts > 0 ? Math.round((connectedInts / totalInts) * 100) : 85

    // C. Support Sentiment & Volume
    const supportScore = Math.max(15, 100 - openTickets.length * 20)

    // D. Report Engagement: 85 base
    const reportScore = 85

    // E. Payment Health: 90 base
    const paymentScore = 90

    // F. Champion Engagement
    const championScore = client.primary_champion_user_id ? 90 : 65

    // Weighted composite
    // Portal 15%, System 30%, Support 20%, Report 10%, Payment 15%, Champion 10%
    let composite = Math.round(
      portalScore * 0.15 +
        systemScore * 0.3 +
        supportScore * 0.2 +
        reportScore * 0.1 +
        paymentScore * 0.15 +
        championScore * 0.1
    )

    // Penalize heavily for critical or high open signals
    const criticalSignals = openSignals.filter(s => s.severity === 'critical').length
    const highSignals = openSignals.filter(s => s.severity === 'high').length
    const mediumSignals = openSignals.filter(s => s.severity === 'medium').length

    composite = Math.max(
      10,
      Math.min(100, composite - criticalSignals * 30 - highSignals * 15 - mediumSignals * 5 + Math.min(10, successes.length * 2))
    )

    let riskLevel: RiskLevel = 'healthy'
    if (composite < 40 || criticalSignals > 0) {
      riskLevel = 'critical'
    } else if (composite < 60 || highSignals > 0) {
      riskLevel = 'at_risk'
    } else if (composite < 80 || mediumSignals > 0) {
      riskLevel = 'watch'
    }

    const previousScore = client.current_health_score ?? null

    // 3. Insert into client_health_scores
    await adminClient.from('client_health_scores').insert({
      client_id: clientId,
      score: composite,
      risk_level: riskLevel,
      portal_activity_score: portalScore,
      system_usage_score: systemScore,
      support_sentiment_score: supportScore,
      report_engagement_score: reportScore,
      payment_health_score: paymentScore,
      champion_engagement_score: championScore,
      previous_score: previousScore,
      calculated_at: new Date().toISOString(),
      notes: `Deterministic audit: ${openSignals.length} open signals, ${openTickets.length} open tickets, ${connectedInts}/${totalInts} integrations connected.`,
    })

    // 4. Update cached fields on client
    await adminClient
      .from('clients')
      .update({
        current_health_score: composite,
        current_risk_level: riskLevel,
        last_health_calculated_at: new Date().toISOString(),
      })
      .eq('id', clientId)

    // 5. Update daily snapshot
    await adminClient
      .from('client_health_snapshots')
      .upsert(
        {
          client_id: clientId,
          score: composite,
          risk_level: riskLevel,
          snapshot_date: new Date().toISOString().split('T')[0],
        },
        { onConflict: 'client_id,snapshot_date' }
      )

    // 6. Log activity
    await adminClient.from('activities').insert({
      client_id: clientId,
      type: 'task',
      subject: `Health Score Recalculated: ${composite}/100 (${riskLevel.toUpperCase()})`,
      body: `Audited by ${session.user.email}. Previous score: ${previousScore ?? 'None'}. Delta: ${previousScore ? composite - previousScore : 0}.`,
    })

    revalidatePath(`/admin/risk`)
    revalidatePath(`/dashboard/health`)
    return { success: true, score: composite, riskLevel }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to recalculate score.' }
  }
}
