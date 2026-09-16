'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
      {/* Background Subtle Grid Texture (Matches Image 5) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)]"
      />

      {/* Header Block matching Image 5 */}
      <div className="text-center">
        <div className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-slate-400">
          // FAQ
        </div>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl uppercase">
          GOT QUESTIONS?
        </h1>
        <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
          Common architectural, integration, and security questions about deploying Helix AI for autonomous operations.
        </p>
      </div>

      {/* Accordion Container */}
      <div className="mt-14 divide-y divide-white/10 border-t border-b border-white/10">
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
                <span className="font-display text-base sm:text-lg md:text-xl font-bold tracking-tight text-white transition-colors hover:text-cyan-300">
                  {faq.question}
                </span>

                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-transform duration-200',
                    isOpen ? 'rotate-45 text-cyan-400' : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Plus className="size-5" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="pt-4 text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
                      {faq.answer}
                    </p>
                    {faq.category && (
                      <div className="mt-3">
                        <span className="inline-block rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          {faq.category}
                        </span>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
