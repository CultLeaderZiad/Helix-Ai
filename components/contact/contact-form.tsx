'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Shield, Check, Loader2, AlertCircle } from 'lucide-react'
import { submitContactInquiryAction } from '@/lib/contact/actions'

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [monthlyVolume, setMonthlyVolume] = useState('10,000 – 50,000')
  const [message, setMessage] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    startTransition(async () => {
      const res = await submitContactInquiryAction({
        name,
        email,
        organization,
        monthlyVolume,
        message,
      })

      if (res.success) {
        setSubmitted(true)
      } else {
        setErrorMessage(res.error || 'Failed to submit inquiry. Please try again or email us directly.')
      }
    })
  }

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[400px_1fr]">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-accent">Contact Operations</div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Speak with an operations architect
        </h1>
        <p className="mt-4 text-body text-muted-foreground leading-relaxed">
          Discuss agency rollouts, high-volume telemetry ingestion, custom voice models, or dedicated PostgreSQL
          tenancy.
        </p>

        <div className="mt-8 space-y-4 text-small">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Mail className="size-4 text-accent" />
            <span className="text-foreground">operations@helix-ai.com</span>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground">
            <Shield className="size-4 text-accent" />
            <span className="text-foreground">security@helix-ai.com</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-panel p-6 sm:p-8">
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-status-success/10 text-status-success">
              <Check className="size-6 stroke-[2]" />
            </div>
            <h3 className="mt-4 font-display text-h3 font-semibold text-foreground">Inquiry received</h3>
            <p className="mt-2 max-w-sm text-small text-muted-foreground">
              Your inquiry has been recorded. An operations architect will review your technical requirements and respond to {email} within one business day.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setSubmitted(false)
                setMessage('')
              }}
              className="mt-6 h-10"
            >
              Send another message
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-md border border-status-danger/30 bg-status-danger/10 p-3 text-xs text-status-danger">
                <AlertCircle className="size-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-name" className="text-small font-medium text-foreground">
                  Your name <span className="text-status-danger">*</span>
                </Label>
                <Input
                  id="contact-name"
                  name="name"
                  required
                  placeholder="Fatima Al-Hashimi"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="h-10 text-small"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-small font-medium text-foreground">
                  Work email <span className="text-status-danger">*</span>
                </Label>
                <Input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="fatima@enterprise.ae"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="h-10 text-small"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contact-org" className="text-small font-medium text-foreground">
                  Organization / Agency
                </Label>
                <Input
                  id="contact-org"
                  name="organization"
                  placeholder="Apex Operations Group"
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="h-10 text-small"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact-volume" className="text-small font-medium text-foreground">
                  Monthly call / message volume
                </Label>
                <select
                  id="contact-volume"
                  name="monthlyVolume"
                  value={monthlyVolume}
                  onChange={e => setMonthlyVolume(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-panel px-3 py-2 text-small text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="Under 10,000">Under 10,000 events</option>
                  <option value="10,000 – 50,000">10,000 – 50,000 events</option>
                  <option value="50,000 – 250,000">50,000 – 250,000 events</option>
                  <option value="250,000+">250,000+ (Dedicated cluster)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-message" className="text-small font-medium text-foreground">
                Architecture requirements <span className="text-status-danger">*</span>
              </Label>
              <textarea
                id="contact-message"
                name="message"
                required
                rows={4}
                placeholder="Describe your current telephony providers, expected WhatsApp throughput, and CRM integration requirements..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="flex w-full rounded-md border border-input bg-panel px-3 py-2 text-small text-foreground shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="h-10 w-full sm:w-auto gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Recording inquiry...</span>
                </>
              ) : (
                <span>Submit inquiry</span>
              )}
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
