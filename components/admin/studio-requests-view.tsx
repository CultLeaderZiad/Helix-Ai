'use client'

import { useState, useTransition } from 'react'
import {
  Sparkles,
  ArrowRight,
  DollarSign,
  Building2,
  CheckCircle2,
  Clock,
  FileCheck2,
  Loader2,
} from 'lucide-react'
import { generateProposalAction } from '@/lib/proposals/actions'
import { ProposalModal } from '@/components/proposals/proposal-modal'
import type { ProposalDocument } from '@/lib/proposals/generator'
import type { Deal } from '@/lib/schema'

interface StudioRequestsViewProps {
  deals: Deal[]
  clientMap: Record<string, string>
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    cents / 100
  )
}

export function StudioRequestsView({ deals, clientMap }: StudioRequestsViewProps) {
  const [activeProposal, setActiveProposal] = useState<ProposalDocument | null>(null)
  const [loadingDealId, setLoadingDealId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

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

  return (
    <>
      <div className="mt-4 divide-y divide-slate-800/80">
        {deals.length > 0 ? (
          deals.map(deal => (
            <div key={deal.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div>
                <p className="font-semibold text-white">{deal.name}</p>
                <p className="text-xs text-slate-400">
                  Client Workspace:{' '}
                  <span className="text-cyan-300 font-medium">
                    {clientMap[deal.client_id] ?? 'Client Workspace'}
                  </span>{' '}
                  • Stage:{' '}
                  <span className="text-emerald-400 uppercase font-mono font-medium">
                    {deal.stage}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-display text-base font-bold text-white">
                  {formatCurrency(deal.value_cents ?? 195000)}
                </span>
                <button
                  type="button"
                  disabled={isPending && loadingDealId === deal.id}
                  onClick={() => handleGenerateProposal(deal.id)}
                  className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 transition-colors disabled:opacity-50"
                >
                  {isPending && loadingDealId === deal.id ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="size-3.5" />
                      Generate Proposal →
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No active build requests found in database. Build requests created in the Studio or AI Engine will appear here.
          </div>
        )}
      </div>

      {activeProposal && (
        <ProposalModal proposal={activeProposal} onClose={() => setActiveProposal(null)} />
      )}
    </>
  )
}
