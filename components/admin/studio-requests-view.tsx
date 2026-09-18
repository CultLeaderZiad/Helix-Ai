'use client'

import { useState, useTransition } from 'react'
import { FileCheck2, Loader2 } from 'lucide-react'
import { generateProposalAction } from '@/lib/proposals/actions'
import { ProposalModal } from '@/components/proposals/proposal-modal'
import { EmptyState } from '@/components/ui/helix'
import { Button } from '@/components/ui/button'
import type { ProposalDocument } from '@/lib/proposals/generator'
import type { Deal } from '@/lib/schema'

interface StudioRequestsViewProps {
  deals: Deal[]
  clientMap: Record<string, string>
  studioUrl?: string
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export function StudioRequestsView({ deals, clientMap, studioUrl = '/dashboard/studio' }: StudioRequestsViewProps) {
  const [activeProposal, setActiveProposal] = useState<ProposalDocument | null>(null)
  const [loadingDealId, setLoadingDealId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [copied, setCopied] = useState(false)

  const handleGenerateProposal = (dealId: string) => {
    setLoadingDealId(dealId)
    startTransition(async () => {
      const res = await generateProposalAction(dealId)
      setLoadingDealId(null)
      if (res.success && res.proposal) {
        setActiveProposal(res.proposal)
      } else {
        alert(res.message || 'Failed to generate proposal.')
      }
    })
  }

  const shareStudio = async () => {
    const url = typeof window === 'undefined' ? studioUrl : `${window.location.origin}${studioUrl}`
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (deals.length === 0) {
    return (
      <>
        <EmptyState
          title="No inbound build requests yet"
          body="When a client hits Request build, it lands here."
          action={
            <Button variant="secondary" size="sm" onClick={shareStudio}>
              {copied ? 'Link copied' : 'Share studio link'}
            </Button>
          }
        />
        {activeProposal && (
          <ProposalModal proposal={activeProposal} onClose={() => setActiveProposal(null)} />
        )}
      </>
    )
  }

  return (
    <>
      <div className="mt-2 divide-y divide-helix-border">
        {deals.map(deal => (
          <div key={deal.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
            <div>
              <p className="font-medium text-helix-ink">{deal.name}</p>
              <p className="text-12 text-helix-muted">
                {clientMap[deal.client_id] ?? 'Client workspace'} · {deal.stage.replaceAll('_', ' ')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {typeof deal.value_cents === 'number' ? (
                <span className="text-14 font-medium tabular-nums text-helix-ink">
                  {formatCurrency(deal.value_cents)}
                </span>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isPending && loadingDealId === deal.id}
                onClick={() => handleGenerateProposal(deal.id)}
              >
                {isPending && loadingDealId === deal.id ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating
                  </>
                ) : (
                  <>
                    <FileCheck2 className="size-3.5" />
                    Generate proposal
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      {activeProposal && (
        <ProposalModal proposal={activeProposal} onClose={() => setActiveProposal(null)} />
      )}
    </>
  )
}
