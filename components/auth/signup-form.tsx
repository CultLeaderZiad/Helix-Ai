'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signUpUser, type SignUpState } from '@/lib/auth/sign-up'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const initialState: SignUpState = { status: 'idle' }

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpUser, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const ids = {
    name: useId(),
    company: useId(),
    email: useId(),
    password: useId(),
    confirm: useId(),
    terms: useId(),
  }

  const errors = state.errors ?? {}

  if (state.status === 'success') {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-status-success/15 text-status-success">
          <Check className="size-7" />
        </div>
        <h3 className="mt-4 font-display text-2xl font-bold">Check your email</h3>
        <p className="mt-2 text-small text-muted-foreground leading-relaxed">
          We sent a verification link to <span className="font-medium text-foreground">{state.email}</span>. Click
          the link in the message to activate your 7-day trial and launch your workspace.
        </p>
        <div className="mt-8 flex flex-col gap-3 w-full">
          <Link
            href="/login"
            className="flex h-11 w-full items-center justify-center rounded-md bg-accent text-small font-medium text-accent-foreground shadow-xs hover:bg-accent/90"
          >
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form action={formAction} noValidate className="space-y-5">
      {state.status === 'auth_error' && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-md border border-status-danger/40 bg-status-danger/10 p-3.5 text-small text-foreground"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-status-danger" />
          <div className="flex-1">
            <p>{state.message}</p>
            {state.message?.includes('already exists') && (
              <Link href="/login" className="mt-1 inline-block text-accent underline-offset-4 hover:underline">
                Sign in instead →
              </Link>
            )}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={ids.name}>Full name</Label>
        <Input
          id={ids.name}
          name="full_name"
          required
          autoComplete="name"
          placeholder="Jane Doe"
          disabled={pending}
          aria-invalid={Boolean(errors.full_name) || undefined}
          className="h-10"
        />
        {errors.full_name && <p className="text-small text-status-danger">{errors.full_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.company}>Company or agency name</Label>
        <Input
          id={ids.company}
          name="company_name"
          required
          autoComplete="organization"
          placeholder="Acme Operations"
          disabled={pending}
          aria-invalid={Boolean(errors.company_name) || undefined}
          className="h-10"
        />
        {errors.company_name && <p className="text-small text-status-danger">{errors.company_name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.email}>Work email</Label>
        <Input
          id={ids.email}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="jane@acme.com"
          disabled={pending}
          aria-invalid={Boolean(errors.email) || undefined}
          className="h-10"
        />
        {errors.email && <p className="text-small text-status-danger">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.password}>Password</Label>
        <div className="relative">
          <Input
            id={ids.password}
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            disabled={pending}
            aria-invalid={Boolean(errors.password) || undefined}
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
        <p className="text-xs text-muted-foreground">Minimum 8 characters.</p>
        {errors.password && <p className="text-small text-status-danger">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor={ids.confirm}>Confirm password</Label>
        <div className="relative">
          <Input
            id={ids.confirm}
            name="confirm_password"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            disabled={pending}
            aria-invalid={Boolean(errors.confirm_password) || undefined}
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
        {errors.confirm_password && <p className="text-small text-status-danger">{errors.confirm_password}</p>}
      </div>

      <div className="flex items-start gap-2 pt-1">
        <input
          id={ids.terms}
          name="terms"
          type="checkbox"
          required
          disabled={pending}
          className="mt-1 size-4 rounded-sm border-input text-accent focus:ring-accent"
        />
        <label htmlFor={ids.terms} className="text-xs text-muted-foreground leading-normal">
          I accept the{' '}
          <Link href="/terms" target="_blank" className="text-accent underline-offset-2 hover:underline">
            Terms of Service
          </Link>{' '}
          and acknowledge the{' '}
          <Link href="/privacy" target="_blank" className="text-accent underline-offset-2 hover:underline">
            Privacy Policy
          </Link>
          .
        </label>
      </div>
      {errors.terms && <p className="text-small text-status-danger">{errors.terms}</p>}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full bg-accent text-accent-foreground shadow-xs hover:bg-accent/90"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating workspace...
          </>
        ) : (
          'Start 7-day free trial'
        )}
      </Button>
    </form>
  )
}
