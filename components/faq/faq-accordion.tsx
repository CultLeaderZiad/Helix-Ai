'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FAQItem } from '@/lib/faq/faq-store'

interface FaqAccordionProps {
  initialFaqs: FAQItem[]
}

export function FaqAccordion({ initialFaqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index))
  }

  return (
    <div className="relative mx-auto w-full max-w-4xl px-4 py-16 sm:py-24">
      {/* Header Block */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-accent">
          // Knowledge Base
        </div>
        <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl uppercase">
          Frequently Asked Questions
        </h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
          Common architectural, integration, and security questions about deploying Helix AI for autonomous operations.
        </p>
      </div>

      {/* Accordion Container */}
      <div className="mt-14 divide-y divide-border border-t border-b border-border">
        {initialFaqs.map((faq, index) => {
          const isOpen = openIndex === index

          return (
            <div key={faq.id} className="py-5 sm:py-6 transition-colors">
              <button
                type="button"
                onClick={() => toggleItem(index)}
                className="flex w-full items-center justify-between gap-6 text-left focus:outline-hidden"
                aria-expanded={isOpen}
              >
                <span className="font-display text-base sm:text-lg font-semibold tracking-tight text-foreground transition-colors hover:text-accent">
                  {faq.question}
                </span>

                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200',
                    isOpen ? 'rotate-45 text-foreground' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Plus className="size-5" />
                </span>
              </button>

              <div
                className={cn(
                  'grid transition-[grid-template-rows,opacity] duration-250 ease-in-out',
                  isOpen ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'
                )}
              >
                <div className="overflow-hidden">
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-3xl">
                    {faq.answer}
                  </p>
                  {faq.category && (
                    <div className="mt-3">
                      <span className="inline-block rounded-md border border-border bg-raised px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                        {faq.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
