'use client'

import { useActionState } from 'react'
import { Check, Loader2, X, ListChecks } from 'lucide-react'
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
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
        <ListChecks className="size-12 text-accent stroke-[1.5]" />
        <h3 className="mt-4 font-display text-lg font-semibold text-foreground">
          No pending observations
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Agent observations and items requiring verification will appear here as incoming interactions are processed.
        </p>
      </div>
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
    <li className="rounded-lg border border-border bg-panel p-4 transition-colors hover:bg-raised/40">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={fact.evidence_band} dot={fact.evidence_band === 'verified'}>
              {fact.evidence_band}
            </Badge>
            <p className="text-xs font-semibold text-foreground">
              {who}
              <span className="text-muted-foreground font-normal">{where}</span>
            </p>
          </div>
          <p className="mt-2 text-sm text-foreground">
            <span className="font-semibold capitalize">{fact.field_name.replace(/_/g, ' ')}:</span>{' '}
            {fact.field_value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground font-mono">
            Observed by {fact.source_tool}
          </p>
          {fact.score !== null && (
            <p className="mt-1 text-[11px] text-muted-foreground tabular-nums font-mono">
              Score: {fact.score.toFixed(2)}
              {fact.method ? ` • Method: ${fact.method}` : ''}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 pt-1 lg:pt-0">
          <form action={formAction}>
            <input type="hidden" name="fact_id" value={fact.id} />
            <input type="hidden" name="decision" value="applied" />
            <Button
              type="submit"
              size="sm"
              disabled={pending}
              className="gap-1.5"
            >
              {pending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Check className="size-3.5" />
              )}
              <span>Approve</span>
            </Button>
          </form>

          <form action={formAction}>
            <input type="hidden" name="fact_id" value={fact.id} />
            <input type="hidden" name="decision" value="dismissed" />
            <Button
              type="submit"
              size="sm"
              variant="outline"
              disabled={pending}
              className="gap-1.5"
            >
              <X className="size-3.5" />
              <span>Dismiss</span>
            </Button>
          </form>
        </div>
      </div>

      {state.status === 'error' && (
        <p role="alert" className="mt-2 text-xs text-status-danger">
          {state.error}
        </p>
      )}
      {state.status === 'applied' && (
        <p role="status" className="mt-2 text-xs text-status-success font-medium">
          Fact approved and committed to contact profile.
        </p>
      )}
      {state.status === 'dismissed' && (
        <p role="status" className="mt-2 text-xs text-muted-foreground font-medium">
          Fact dismissed and archived.
        </p>
      )}
    </li>
  )
}
