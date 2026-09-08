'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { requestPasswordReset, type PasswordResetState } from '@/lib/auth/password-reset'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface PasswordResetModalProps {
  initialEmail: string
  open: boolean
  onClose: () => void
}

const initialState: PasswordResetState = { status: 'idle' }

export function PasswordResetModal({ initialEmail, open, onClose }: PasswordResetModalProps) {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)
  const titleId = useId()
  const emailId = useId()
  const errorId = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !pending) {
          onClose()
        }
      }
      window.addEventListener('keydown', handleKeyDown)
      inputRef.current?.focus()
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, pending, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div
        aria-hidden="true"
        onClick={() => {
          if (!pending) onClose()
        }}
        className="fixed inset-0 bg-black/40 transition-opacity"
      />

      <div className="relative z-10 w-full max-w-[480px] rounded-xl border border-border bg-panel p-6 shadow-2xl transition-all">
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h3 id={titleId} className="font-display text-h3 font-semibold text-foreground">
              Reset your password
            </h3>
            <p className="text-small text-muted-foreground">
              We&apos;ll email a reset link to your account manager address.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-raised hover:text-foreground disabled:opacity-50"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </header>

        {state.status === 'success' ? (
          <div className="mt-6 flex flex-col gap-6">
            <div className="flex items-start gap-3 text-small text-foreground">
              <Check className="size-5 shrink-0 text-status-success" aria-hidden="true" />
              <p>If that address has an account, a reset link is on its way.</p>
            </div>
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClose} className="h-10">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form action={formAction} noValidate className="mt-6 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor={emailId}>Work email</Label>
              <Input
                ref={inputRef}
                id={emailId}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                defaultValue={initialEmail}
                disabled={pending}
                aria-invalid={Boolean(state.error) || undefined}
                aria-describedby={state.error ? errorId : undefined}
                className="h-10 rounded-md bg-panel px-3 text-body"
              />
              {state.error ? (
                <p id={errorId} className="text-small text-status-danger">
                  {state.error}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={onClose}
                className="h-10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="h-10 bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
              >
                {pending ? (
                  <>
                    <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                    Sending link
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
