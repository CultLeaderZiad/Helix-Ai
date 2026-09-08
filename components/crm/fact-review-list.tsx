'use client'

import { useActionState } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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

const BAND_STYLES: Record<ReviewableFact['evidence_band'], string> = {
  verified: 'border-status-success/40 bg-status-success/10 text-status-success',
  probable: 'border-status-warning/40 bg-status-warning/10 text-status-warning',
  possible: 'border-border bg-raised text-muted-foreground',
}

const initialState: FactReviewState = { status: 'idle' }

export function FactReviewList({ facts }: { facts: ReviewableFact[] }) {
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
    <li className="border bg-panel p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'rounded-sm border px-1.5 py-0.5 text-xs font-medium uppercase tracking-wide',
                BAND_STYLES[fact.evidence_band],
              )}
            >
              {fact.evidence_band}
            </span>
            <p className="text-small font-medium text-foreground">
              {who}
              <span className="text-muted-foreground">{where}</span>
            </p>
          </div>
          <p className="mt-2 text-body text-foreground">
            <span className="font-medium">{fact.field_name.replace(/_/g, ' ')}:</span>{' '}
            {fact.field_value}
          </p>
          <p className="mt-1 text-small text-muted-foreground">
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
