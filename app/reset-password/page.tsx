'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import { HelixMark } from '@/components/brand/helix-mark'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Check, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { updatePassword, type UpdatePasswordState } from '@/lib/auth/update-password'

const initialState: UpdatePasswordState = { status: 'idle' }

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(updatePassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const passwordId = useId()
  const confirmId = useId()
  const errorId = useId()

  return (
    <main className="min-h-screen bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <header className="flex flex-col items-center text-center">
          <Link href="/" aria-label="Helix AI Home" className="transition-transform hover:scale-105">
            <HelixMark size={36} />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">Set new password</h1>
          <p className="mt-2 text-small text-muted-foreground">Must be at least 8 characters long.</p>
        </header>

        <div className="mt-8 rounded-xl border border-border bg-panel p-6 shadow-sm sm:p-8">
          {state.status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-status-success/15 text-status-success">
                <Check className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-bold">Password updated</h3>
              <p className="mt-2 text-small text-muted-foreground leading-relaxed">
                Your new password is now active. You may now sign in to your workspace console.
              </p>
              <Link
                href="/login"
                className="mt-6 flex h-10 w-full items-center justify-center rounded-md bg-accent text-small font-medium text-accent-foreground hover:bg-accent/90 transition-colors"
              >
                Sign in to workspace
              </Link>
            </div>
          ) : (
            <form action={formAction} noValidate className="space-y-5">
              {state.status === 'auth_error' && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-md border border-status-danger/40 bg-status-danger/10 p-3.5 text-small text-foreground"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-status-danger" />
                  <div className="flex-1">
                    <p>{state.error}</p>
                    <Link
                      href="/forgot-password"
                      className="mt-1 inline-block text-accent underline-offset-4 hover:underline"
                    >
                      Request a new recovery link →
                    </Link>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor={passwordId}>New password</Label>
                <div className="relative">
                  <Input
                    id={passwordId}
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    disabled={pending}
                    className="h-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={confirmId}>Confirm new password</Label>
                <div className="relative">
                  <Input
                    id={confirmId}
                    name="confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    disabled={pending}
                    className="h-10 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-muted-foreground hover:text-foreground"
                  >
                    {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                {state.status === 'field_error' && (
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
                    Updating password...
                  </>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
