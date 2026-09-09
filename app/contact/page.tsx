'use client'

import { useState } from 'react'
import { PillNav } from '@/components/navigation/pill-nav'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Check, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)
  const [pending, setPending] = useState(false)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setTimeout(() => {
      setPending(false)
      setSubmitted(true)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PillNav />

      <main className="mx-auto max-w-5xl px-4 pt-28 pb-24 md:pt-36">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[400px_1fr]">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-accent">Contact Operations</div>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Speak with an operations architect
            </h1>
            <p className="mt-4 text-body text-muted-foreground leading-relaxed">
              Discuss agency rollouts, high-volume telemetry ingestion, custom voice models, or dedicated PostgreSQL
              tenancy.
            </p>

            <div className="mt-8 space-y-4 text-small">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 text-accent" />
                <span>operations@helix-ai.com</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="size-4 text-accent" />
                <span>security@helix-ai.com</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-panel p-6 shadow-sm sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-status-success/10 text-status-success">
                  <Check className="size-6" />
                </div>
                <h3 className="mt-4 font-display text-h3 font-semibold">Inquiry received</h3>
                <p className="mt-2 max-w-sm text-small text-muted-foreground">
                  An operations lead will review your requirements and respond within one business day.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSubmitted(false)}
                  className="mt-6 h-10"
                >
                  Send another inquiry
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="contact-name">Full name</Label>
                  <Input id="contact-name" name="name" required placeholder="Jane Doe" className="h-10" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-email">Work email</Label>
                  <Input
                    id="contact-email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@acme.com"
                    className="h-10"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-volume">Estimated monthly interaction volume</Label>
                  <select
                    id="contact-volume"
                    name="volume"
                    defaultValue="< 5,000 interactions"
                    className="flex h-10 w-full rounded-md border border-input bg-panel px-3 text-body shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    <option value="< 5,000 interactions">&lt; 5,000 interactions / mo</option>
                    <option value="5,000 - 50,000 interactions">5,000 – 50,000 interactions / mo</option>
                    <option value="50,000+ interactions">50,000+ interactions / mo</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contact-message">Requirements & timeline</Label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    required
                    placeholder="Tell us about your channels, clients, or specific compliance needs..."
                    className="flex w-full rounded-md border border-input bg-panel p-3 text-body shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/60"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={pending}
                  className="h-10 w-full bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending inquiry...
                    </>
                  ) : (
                    'Submit inquiry'
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
