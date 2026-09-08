'use client'

import { useActionState, useId, useState } from 'react'
import { AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, type Portal, type SignInState } from '@/lib/auth/sign-in'
import { PasswordResetModal } from '@/components/login/password-reset-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

const initialState: SignInState = { status: 'idle' }

const PORTALS: { value: Portal; label: string; hint: string }[] = [
  { value: 'admin', label: 'Agency console', hint: 'Agency administrators' },
  { value: 'client', label: 'Client portal', hint: 'Client users and staff' },
]

export function LoginForm() {
  const [state, formAction, pending] = useActionState(signIn, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [email, setEmail] = useState('')
  const [portal, setPortal] = useState<Portal>(() =>
    state.status === 'field_error' || state.status === 'auth_error' ? state.values.portal : 'admin',
  )
  const ids = { email: useId(), password: useId(), emailErr: useId(), passwordErr: useId(), banner: useId() }

  const fieldErrors = state.status === 'field_error' ? state.errors : {}
  const authError = state.status === 'auth_error' ? (state as Extract<SignInState, { status: 'auth_error' }>) : null
  const locked = false

  return (
    <>
      <form action={formAction} noValidate aria-busy={pending} className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h2 className="font-display text-h2 font-semibold text-balance text-foreground">Sign in</h2>
          <p className="text-small text-muted-foreground">Helix AI operations console</p>
        </header>

        {authError ? (
          <div
            id={ids.banner}
            role="alert"
            className="flex gap-3 border border-status-danger/40 bg-status-danger/10 p-3 text-small text-foreground"
          >
            <AlertCircle aria-hidden="true" className="mt-px size-4 shrink-0 text-status-danger" />
            <div className="flex flex-col gap-2">
              <p>{authError.message}</p>
              {authError.code === 'ROLE_MISMATCH' && authError.actual_portal ? (
                <button
                  type="button"
                  onClick={() => setPortal(authError.actual_portal as Portal)}
                  className="self-start text-accent underline-offset-4 hover:underline"
                >
                  Switch to {authError.actual_portal === 'admin' ? 'Agency console' : 'Client portal'}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <fieldset className="flex flex-col gap-2" disabled={pending || locked}>
          <legend className="pb-2 text-small font-medium text-foreground">Workspace</legend>
          <div role="radiogroup" aria-label="Workspace" className="grid grid-cols-2 gap-px border bg-border">
            {PORTALS.map(p => {
              const checked = portal === p.value
              return (
                <label
                  key={p.value}
                  className={cn(
                    'flex cursor-pointer flex-col gap-1 bg-panel p-3 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-ring/60',
                    checked ? 'bg-raised' : 'hover:bg-raised/60',
                  )}
                >
                  <input
                    type="radio"
                    name="portal"
                    value={p.value}
                    checked={checked}
                    onChange={() => setPortal(p.value)}
                    className="sr-only"
                  />
                  <span className="flex items-center gap-2 text-small font-medium text-foreground">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'size-2 rounded-full border',
                        checked ? 'border-accent bg-accent' : 'border-muted-foreground',
                      )}
                    />
                    {p.label}
                  </span>
                  <span className="font-mono text-[11px] leading-4 text-muted-foreground">{p.hint}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor={ids.email}>Email</Label>
            <Input
              id={ids.email}
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={pending || locked}
              aria-invalid={Boolean(fieldErrors.email) || undefined}
              aria-describedby={fieldErrors.email ? ids.emailErr : undefined}
              className="h-10 rounded-md bg-panel px-3 text-body"
            />
            {fieldErrors.email ? (
              <p id={ids.emailErr} className="text-small text-status-danger">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={ids.password}>Password</Label>
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="text-small text-accent underline-offset-4 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Input
                id={ids.password}
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                disabled={pending || locked}
                aria-invalid={Boolean(fieldErrors.password) || undefined}
                aria-describedby={fieldErrors.password ? ids.passwordErr : undefined}
                className="h-10 rounded-md bg-panel px-3 pr-12 text-body"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                disabled={pending || locked}
                className="absolute inset-y-0 right-0 flex min-h-[44px] min-w-[44px] items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
            {fieldErrors.password ? (
              <p id={ids.passwordErr} className="text-small text-status-danger">
                {fieldErrors.password}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <Button
            type="submit"
            size="lg"
            disabled={pending || locked}
            className="h-10 sm:h-11 w-full bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-60"
          >
            {pending ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                Verifying credentials
              </>
            ) : (
              'Sign in'
            )}
          </Button>
          <p className="text-small text-muted-foreground">
            Authentication is managed by Supabase. Contact your account manager if you did not request access.
          </p>
        </div>
      </form>

      <PasswordResetModal
        initialEmail={email}
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  )
}

