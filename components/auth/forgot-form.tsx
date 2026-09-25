'use client'

import { useActionState, useId } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { requestPasswordReset, type PasswordResetState } from '@/lib/auth/password-reset'
import { authCopy, localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

const initialState: PasswordResetState = { status: 'idle' }

export function ForgotForm({ lang }: { lang: HelixLang }) {
  const copy = authCopy[lang]
  const [state, formAction, pending] = useActionState(requestPasswordReset, initialState)
  const emailId = useId()
  const errorId = useId()

  return (
    <>
      <Link href="/login" className="auth-back">
        <ArrowLeft size={14} className={lang === 'ar' ? 'flip' : undefined} />
        {copy.backSignIn}
      </Link>
      {state.status === 'success' ? (
        <div className="auth-success">
          <span className="tick"><Check size={18} aria-hidden="true" /></span>
          <h1 className="auth-title">{copy.inboxTitle}</h1>
          <p className="auth-lead">{copy.inboxBody}</p>
          <Link href="/login" className="btn btn-primary auth-submit" style={{ marginTop: 12 }}>{copy.returnSignIn}</Link>
        </div>
      ) : (
        <>
          <h1 className="auth-title">{copy.resetTitle}</h1>
          <p className="auth-lead">{copy.resetLead}</p>
          <form action={formAction} noValidate className="auth-form">
            <div className="auth-field">
              <label htmlFor={emailId}>{copy.email}</label>
              <input
                id={emailId}
                className="fld"
                name="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                placeholder={copy.emailPh}
                disabled={pending}
                aria-invalid={Boolean(state.error) || undefined}
                aria-describedby={state.error ? errorId : undefined}
              />
              {state.error ? <p id={errorId} className="auth-error">{localizeAuthError(lang, state.error)}</p> : null}
            </div>
            <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
              {pending ? (<><Loader2 size={16} className="spin" aria-hidden="true" />{copy.sending}</>) : copy.send}
            </button>
          </form>
        </>
      )}
    </>
  )
}
