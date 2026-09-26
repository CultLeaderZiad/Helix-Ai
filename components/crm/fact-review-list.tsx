'use client'

import { useActionState } from 'react'
import { reviewFact, type FactReviewState } from '@/lib/crm/fact-review'
import { tx, type DashLang } from '@/lib/dashboard/lang'
import { useDashLang } from '@/components/dashboard/use-lang'
import { EmptyState, StatusChip } from '@/components/dashboard/ui'

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

export function FactReviewList({ facts, lang }: { facts: ReviewableFact[]; lang?: DashLang }) {
  const active = useDashLang(lang ?? 'en')
  if (facts.length === 0) {
    return (
      <EmptyState
        title={tx(active, 'All clear. Nothing needs checking.', 'كل شيء واضح. لا شيء يحتاج مراجعة.')}
      />
    )
  }
  return (
    <ul className="att">
      {facts.map(fact => (
        <FactRow key={fact.id} fact={fact} lang={active} />
      ))}
    </ul>
  )
}

function plainField(name: string) {
  return name.replaceAll('_', ' ')
}

function FactRow({ fact, lang }: { fact: ReviewableFact; lang: DashLang }) {
  const [state, formAction, pending] = useActionState(reviewFact, initialState)
  const who = fact.contact?.full_name || tx(lang, 'Unknown contact', 'جهة غير معروفة')
  const when = new Date(fact.observed_at).toLocaleString(lang === 'ar' ? 'ar' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Dubai',
  })

  return (
    <li>
      <div style={{ minWidth: 0, flex: 1 }}>
        <b>{who}</b>
        <span>
          {tx(lang, 'Suggested', 'القيمة المقترحة')}: {plainField(fact.field_name)} — {fact.field_value}
        </span>
        <span className="faint"> · {when}</span>
      </div>
      {state.status === 'done' ? (
        <StatusChip tone={state.decision === 'approve' ? 'ok' : 'neutral'}>
          {state.decision === 'approve'
            ? tx(lang, 'Saved to the contact', 'حُفظ في جهة الاتصال')
            : tx(lang, 'Dismissed', 'تم التجاهل')}
        </StatusChip>
      ) : state.status === 'error' ? (
        <p role="alert" className="faint">{state.message}</p>
      ) : (
        <form action={formAction} className="ph-actions">
          <input type="hidden" name="fact_id" value={fact.id} />
          <button type="submit" name="decision" value="approve" className="btn-d" disabled={pending}>
            {pending ? tx(lang, 'Saving…', 'جارٍ الحفظ…') : tx(lang, 'Approve', 'موافقة')}
          </button>
          <button type="submit" name="decision" value="dismiss" className="btn-o" disabled={pending}>
            {tx(lang, 'Dismiss', 'تجاهل')}
          </button>
        </form>
      )}
    </li>
  )
}
