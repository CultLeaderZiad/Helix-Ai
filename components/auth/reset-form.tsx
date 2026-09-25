'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, Check, Eye, EyeOff, Loader2 } from 'lucide-react'
import { updatePassword, type UpdatePasswordState } from '@/lib/auth/update-password'
import { authCopy, localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

const initialState: UpdatePasswordState = { status: 'idle' }

export function ResetForm({ lang }: { lang: HelixLang }) {
  const copy = authCopy[lang]
  const [state, formAction, pending] = useActionState(updatePassword, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const passwordId = useId()
  const confirmId = useId()
  const errorId = useId()

  if (state.status === 'success') {
    return (
      <div className="auth-success">
        <span className="tick"><Check size={18} aria-hidden="true" /></span>
        <h1 className="auth-title">{copy.updatedTitle}</h1>
        <p className="auth-lead">{copy.updatedBody}</p>
        <Link href="/login" className="btn btn-primary auth-submit" style={{ marginTop: 12 }}>{copy.signInWorkspace}</Link>
      </div>
    )
  }

  return (
    <>
      <h1 className="auth-title">{copy.setTitle}</h1>
      <p className="auth-lead">{copy.setLead}</p>
      <form action={formAction} noValidate className="auth-form">
        {state.status === 'auth_error' ? (
          <div role="alert" className="auth-alert">
            <AlertCircle size={16} aria-hidden="true" />
            <div>
              <p>{localizeAuthError(lang, state.error)}</p>
              <Link href="/forgot-password">{copy.requestNew}</Link>
            </div>
          </div>
        ) : null}

        <div className="auth-field">
          <label htmlFor={passwordId}>{copy.newPassword}</label>
          <div className="auth-field-wrap">
            <input id={passwordId} className="fld" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="new-password" disabled={pending} />
            <button type="button" className="auth-eye" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? copy.hide : copy.show} aria-pressed={showPassword}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div className="auth-field">
          <label htmlFor={confirmId}>{copy.confirmNew}</label>
          <div className="auth-field-wrap">
            <input
              id={confirmId}
              className="fld"
              name="confirm_password"
              type={showConfirm ? 'text' : 'password'}
              required
              autoComplete="new-password"
              disabled={pending}
              aria-describedby={state.status === 'field_error' ? errorId : undefined}
            />
            <button type="button" className="auth-eye" onClick={() => setShowConfirm(v => !v)} aria-label={showConfirm ? copy.hide : copy.show} aria-pressed={showConfirm}>
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {state.status === 'field_error' ? <p id={errorId} className="auth-error">{localizeAuthError(lang, state.error)}</p> : null}
        </div>

        <button type="submit" className="btn btn-primary auth-submit" disabled={pending}>
          {pending ? (<><Loader2 size={16} className="spin" aria-hidden="true" />{copy.updating}</>) : copy.update}
        </button>
      </form>
    </>
  )
}
