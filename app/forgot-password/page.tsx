'use client'

import { useActionState, useId } from 'react'
import Link from 'next/link'
import { HelixMark } from '@/components/brand/helix-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Loader2, ArrowLeft } from 'lucide-react'
import { requestPasswordReset, type PasswordResetState } from '@/lib/auth/password-reset'

const initialState: PasswordResetState = { status: 'idle' }

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)
  const emailId = useId()
  const errorId = useId()

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <header className="flex flex-col items-center text-center">
          <Link href="/" aria-label="Helix AI Home" className="transition-transform hover:scale-105">
            <HelixMark size={36} />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">Reset your password</h1>
          <p className="mt-2 text-small text-muted-foreground">
            Enter your registered work email to receive a recovery link.
          </p>
        </header>

        <div className="mt-8 rounded-xl border border-border bg-panel p-6 shadow-sm sm:p-8">
          {state.status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-status-success/15 text-status-success">
                <Check className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">Check your inbox</h3>
              <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                If that address is associated with a workspace, an access link has been sent. The link expires in
                1 hour.
              </p>
              <Link
                href="/login"
                className="mt-6 flex h-10 w-full items-center justify-center rounded-md border border-border bg-panel text-small font-medium hover:bg-raised transition-colors"
              >
                Return to sign in
              </Link>
            </div>
          ) : (
            <form action={formAction} noValidate className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor={emailId}>Work email</Label>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="jane@acme.com"
                  disabled={pending}
                  aria-invalid={Boolean(state.error) || undefined}
                  aria-describedby={state.error ? errorId : undefined}
                  className="h-10"
                />
                {state.error && (
                  <p id={errorId} className="text-small text-status-danger">
                    {state.error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={pending}
                className="h-10 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sending recovery link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-small">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Back to Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
