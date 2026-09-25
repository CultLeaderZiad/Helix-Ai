'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signUpUser, type SignUpState } from '@/lib/auth/sign-up'
import { authCopy, localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

const initialState: SignUpState = { status: 'idle' }

export function SignUpForm({ lang }: { lang: HelixLang }) {
  const copy = authCopy[lang]
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
      <div className="auth-success">
        <span className="tick"><Check size={18} aria-hidden="true" /></span>
        <h1 className="auth-title">{copy.checkTitle}</h1>
        <p className="auth-lead">
          {copy.checkBody} <span style={{ color: 'var(--text)', fontWeight: 600 }}>{state.email}</span>. {copy.checkRest}
        </p>
        <Link href="/login" className="btn btn-primary auth-submit" style={{ marginTop: 12 }}>
          {copy.goSignIn}
        </Link>
      </div>
    )
  }

  return (
    <>
      <Link href="/" className="auth-back">
        <ArrowLeft size={14} className={lang === 'ar' ? 'flip' : undefined} />
        {copy.backHome}
      </Link>
      <h1 className="auth-title">{copy.signupTitle}</h1>
      <p className="auth-lead">{copy.signupLead}</p>
      <form action={formAction} noValidate className="auth-form">
        {state.status === 'auth_error' && (
          <div role="alert" className="auth-alert">
            <AlertCircle size={16} aria-hidden="true" />
            <div>
              <p>{localizeAuthError(lang, state.message)}</p>
              {state.message?.includes('already exists') ? (
                <Link href="/login">{copy.signInLink}</Link>
              ) : null}
            </div>
          </div>
        )}

        <div className="auth-field">
          <label htmlFor={ids.name}>{copy.fullName}</label>
          <input id={ids.name} className="fld" name="full_name" required autoComplete="name" placeholder={copy.namePh} disabled={pending} aria-invalid={Boolean(errors.full_name) || undefined} />
          {errors.full_name ? <p className="auth-error">{localizeAuthError(lang, errors.full_name)}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor={ids.company}>{copy.company}</label>
          <input id={ids.company} className="fld" name="company_name" required autoComplete="organization" placeholder={copy.companyPh} disabled={pending} aria-invalid={Boolean(errors.company_name) || undefined} />
          {errors.company_name ? <p className="auth-error">{localizeAuthError(lang, errors.company_name)}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor={ids.email}>{copy.email}</label>
          <input id={ids.email} className="fld" name="email" type="email" required autoComplete="email" placeholder={copy.emailPh} disabled={pending} aria-invalid={Boolean(errors.email) || undefined} />
          {errors.email ? <p className="auth-error">{localizeAuthError(lang, errors.email)}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor={ids.password}>{copy.password}</label>
          <div className="auth-field-wrap">
            <input id={ids.password} className="fld" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" disabled={pending} aria-invalid={Boolean(errors.password) || undefined} />
            <button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? copy.hide : copy.show} aria-pressed={showPassword}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="auth-hint">{copy.minChars}</p>
          {errors.password ? <p className="auth-error">{localizeAuthError(lang, errors.password)}</p> : null}
        </div>

        <div className="auth-field">
          <label htmlFor={ids.confirm}>{copy.confirm}</label>
          <div className="auth-field-wrap">
            <input id={ids.confirm} className="fld" name="confirm_password" type={showConfirm ? 'text' : 'password'} required autoComplete="new-password" disabled={pending} aria-invalid={Boolean(errors.confirm_password) || undefined} />
            <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? copy.hide : copy.show} aria-pressed={showConfirm}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.confirm_password ? <p className="auth-error">{localizeAuthError(lang, errors.confirm_password)}</p> : null}
        </div>

        <div className="auth-check">
          <input id={ids.terms} name="terms" type="checkbox" required disabled={pending} />
          <label htmlFor={ids.terms}>
            {copy.termsBefore}{' '}
            <Link href="/terms" target="_blank">{copy.terms}</Link>{' '}
            {copy.and}{' '}
            <Link href="/privacy" target="_blank">{copy.privacy}</Link>.
          </label>
        </div>
        {errors.terms ? <p className="auth-error">{localizeAuthError(lang, errors.terms)}</p> : null}

        <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
          {pending ? (<><Loader2 size={16} className="spin" aria-hidden="true" />{copy.creating}</>) : copy.start}
        </button>
        <p className="auth-foot">
          {copy.haveAccount} <Link href="/login">{copy.signInLink}</Link>
        </p>
      </form>
    </>
  )
}
