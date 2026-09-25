'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, type Portal, type SignInState } from '@/lib/auth/sign-in'
import { authCopy, localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

// Lazy load modal only if user triggers password recovery
const PasswordResetModal = dynamic(
  () => import('@/components/login/password-reset-modal').then((m) => m.PasswordResetModal),
  { ssr: false }
)

const initialState: SignInState = { status: 'idle' }

export function LoginForm({ lang, verifyFailed = false }: { lang: HelixLang; verifyFailed?: boolean }) {
  const copy = authCopy[lang]
  const [state, formAction, pending] = useActionState(signIn, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [email, setEmail] = useState('')
  const [portal, setPortal] = useState<Portal>(() => {
    if (state.status === 'field_error' || state.status === 'auth_error') {
      return state.values.portal
    }
    if (typeof window !== 'undefined') {
      const p = new URLSearchParams(window.location.search).get('portal')
      if (p === 'admin') return 'admin'
    }
    return 'client'
  })
  const ids = { email: useId(), password: useId(), emailErr: useId(), passwordErr: useId(), banner: useId() }

  const fieldErrors = state.status === 'field_error' ? state.errors : {}
  const authError = state.status === 'auth_error' ? (state as Extract<SignInState, { status: 'auth_error' }>) : null
  const locked = false

  const portals: { value: Portal; label: string; hint: string }[] = [
    { value: 'admin', label: copy.agency, hint: copy.agencyHint },
    { value: 'client', label: copy.client, hint: copy.clientHint },
  ]

  return (
    <>
      <Link href="/" className="auth-back">
        <ArrowLeft size={14} className={lang === 'ar' ? 'flip' : undefined} />
        {copy.backHome}
      </Link>
      <h1 className="auth-title">{copy.signInTitle}</h1>
      <p className="auth-lead">{copy.signInLead}</p>

      <form action={formAction} noValidate aria-busy={pending} className="auth-form">
        {verifyFailed ? (
          <div role="alert" className="auth-alert">
            <AlertCircle aria-hidden="true" size={16} />
            <p>{copy.verifyFailed}</p>
          </div>
        ) : null}
        {authError ? (
          <div id={ids.banner} role="alert" className="auth-alert">
            <AlertCircle aria-hidden="true" size={16} />
            <div>
              <p>{localizeAuthError(lang, authError.message)}</p>
              {authError.code === 'ROLE_MISMATCH' && authError.actual_portal ? (
                <button type="button" onClick={() => setPortal(authError.actual_portal as Portal)}>
                  {authError.actual_portal === 'admin' ? copy.switchAgency : copy.switchClient}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <fieldset disabled={pending || locked}>
          <legend className="auth-legend">{copy.workspace}</legend>
          <div role="radiogroup" aria-label={copy.workspace} className="auth-seg">
            {portals.map(item => {
              const checked = portal === item.value
              return (
                <label key={item.value} className={checked ? 'on' : undefined}>
                  <input
                    type="radio"
                    name="portal"
                    value={item.value}
                    checked={checked}
                    onChange={() => setPortal(item.value)}
                    className="sr-only"
                  />
                  <span className="seg-name">
                    <span className="pip" aria-hidden="true" />
                    {item.label}
                  </span>
                  <span className="seg-hint">{item.hint}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="auth-field">
          <label htmlFor={ids.email}>{copy.email}</label>
          <input
            id={ids.email}
            className="fld"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={pending || locked}
            placeholder={copy.emailPh}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            aria-describedby={fieldErrors.email ? ids.emailErr : undefined}
          />
          {fieldErrors.email ? (
            <p id={ids.emailErr} className="auth-error">{localizeAuthError(lang, fieldErrors.email)}</p>
          ) : null}
        </div>

        <div className="auth-field">
          <div className="auth-label-row">
            <label htmlFor={ids.password}>{copy.password}</label>
            <button type="button" className="auth-linkish" onClick={() => setShowResetModal(true)}>
              {copy.forgot}
            </button>
          </div>
          <div className="auth-field-wrap">
            <input
              id={ids.password}
              className="fld"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              disabled={pending || locked}
              aria-invalid={Boolean(fieldErrors.password) || undefined}
              aria-describedby={fieldErrors.password ? ids.passwordErr : undefined}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword(v => !v)}
              aria-label={showPassword ? copy.hide : copy.show}
              aria-pressed={showPassword}
              disabled={pending || locked}
            >
              {showPassword ? <EyeOff size={16} aria-hidden="true" /> : <Eye size={16} aria-hidden="true" />}
            </button>
          </div>
          {fieldErrors.password ? (
            <p id={ids.passwordErr} className="auth-error">{localizeAuthError(lang, fieldErrors.password)}</p>
          ) : null}
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={pending || locked}>
          {pending ? (
            <>
              <Loader2 aria-hidden="true" size={16} className="spin" />
              {copy.verifying}
            </>
          ) : (
            copy.open
          )}
        </button>
        <p className="auth-foot">
          {copy.noAccount} <Link href="/signup">{copy.trial}</Link>
        </p>
      </form>

      <PasswordResetModal
        lang={lang}
        initialEmail={email}
        open={showResetModal}
        onClose={() => setShowResetModal(false)}
      />
    </>
  )
}

