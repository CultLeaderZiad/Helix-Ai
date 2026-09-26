'use client'

import { useActionState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { reviewFact, type FactReviewState } from '@/lib/crm/fact-review'

/** Compact projection of a pending contact fact for the review list. */
export interface ReviewableFact {
  id: string
  field_name: string
  field_value: string
  evidence_band: 'verified' | 'probable' | 'possible'
  source_tool: string
  status: 'pending' | 'applied' | 'dismissed' | 'superseded'
  score: number | null
  method: string | null
  observed_at: string
  contact_id: string
  contact: { full_name: string | null; company_name: string | null } | null
}

const initialState: FactReviewState = { status: 'idle' }

export function FactReviewList({ facts }: { facts: ReviewableFact[] }) {
  if (facts.length === 0) {
    return (
      <p className="mt-4 text-sm text-helix-muted">
        No pending facts. Nothing is waiting for review.
        <span className="mt-1 block" dir="rtl" lang="ar">
          لا توجد حقائق معلّقة. لا شيء بانتظار المراجعة.
        </span>
      </p>
    )
  }
  return (
    <ul className="mt-4 space-y-3">
      {facts.map(fact => (
        <FactRow key={fact.id} fact={fact} />
      ))}
    </ul>
  )
}

function FactRow({ fact }: { fact: ReviewableFact }) {
  const [state, formAction, pending] = useActionState(reviewFact, initialState)
  const who = fact.contact?.full_name ?? 'Unknown contact'
  const where = fact.contact?.company_name ? ` · ${fact.contact.company_name}` : ''

  return (
    <li className="rounded-xl border border-white/10 bg-helix-surface p-4.5 shadow-sm hover:border-white/20 transition-all">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={fact.evidence_band} dot={fact.evidence_band === 'verified'}>
              {fact.evidence_band}
            </Badge>
            <p className="text-xs font-semibold text-helix-ink">
              {who}
              <span className="text-helix-muted font-normal">{where}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-helix-ink">
            <span className="font-semibold text-helix-ink capitalize">{fact.field_name.replace(/_/g, ' ')}:</span>{' '}
            {fact.field_value}
          </p>
          <p className="mt-1 text-xs text-helix-muted font-mono">
            Observed by {fact.source_tool}
            {fact.score != null ? ` · ledger score ${fact.score}` : ''} ·{' '}
            {new Date(fact.observed_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        {state.status === 'done' ? (
          <p
            role="status"
            className={cn(
              'shrink-0 text-small',
              state.decision === 'approve'
                ? 'text-status-success'
                : 'text-muted-foreground',
            )}
          >
            {state.decision === 'approve'
              ? 'Approved and written to the contact record.'
              : 'Dismissed. The contact record was not changed.'}
          </p>
        ) : state.status === 'error' ? (
          <p role="alert" className="shrink-0 text-small text-status-danger">
            {state.message}
          </p>
        ) : (
          <form action={formAction} className="flex shrink-0 gap-2">
            <input type="hidden" name="fact_id" value={fact.id} />
            <Button
              type="submit"
              name="decision"
              value="approve"
              size="sm"
              disabled={pending}
              className="gap-1.5"
            >
              {pending ? (
                <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
              ) : (
                <Check aria-hidden="true" className="size-3.5" />
              )}
              Approve
            </Button>
            <Button
              type="submit"
              name="decision"
              value="dismiss"
              size="sm"
              variant="outline"
              disabled={pending}
              className="gap-1.5"
            >
              <X aria-hidden="true" className="size-3.5" />
              Dismiss
            </Button>
          </form>
        )}
      </div>
    </li>
  )
}
