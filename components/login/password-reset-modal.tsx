'use client'

import { useActionState, useEffect, useId, useRef } from 'react'
import { Check, Loader2, X } from 'lucide-react'
import { requestPasswordReset, type PasswordResetState } from '@/lib/auth/password-reset'
import { authCopy, localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

interface PasswordResetModalProps {
  lang: HelixLang
  initialEmail: string
  open: boolean
  onClose: () => void
}

const initialState: PasswordResetState = { status: 'idle' }

export function PasswordResetModal({ lang, initialEmail, open, onClose }: PasswordResetModalProps) {
  const copy = authCopy[lang]
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
      className="auth-modal-back"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget && !pending) onClose()
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="auth-modal"
      >
        <header className="auth-modal-head">
          <div>
            <h3 id={titleId}>{copy.modalTitle}</h3>
            <p className="auth-lead">{copy.modalLead}</p>
          </div>
          <button type="button" disabled={pending} onClick={onClose} aria-label={copy.close} className="auth-eye" style={{ position: 'static', width: 36, height: 36 }}>
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        {state.status === 'success' ? (
          <div className="auth-form">
            <div className="auth-success">
              <span className="tick"><Check size={18} aria-hidden="true" /></span>
              <p>{copy.modalSuccess}</p>
            </div>
            <div className="auth-modal-actions">
              <button type="button" className="btn btn-ghost" onClick={onClose}>{copy.done}</button>
            </div>
          </div>
        ) : (
          <form action={formAction} noValidate className="auth-form">
            <div className="auth-field">
              <label htmlFor={emailId}>{copy.email}</label>
              <input
                ref={inputRef}
                id={emailId}
                className="fld"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                defaultValue={initialEmail}
                disabled={pending}
                aria-invalid={Boolean(state.error) || undefined}
                aria-describedby={state.error ? errorId : undefined}
              />
              {state.error ? <p id={errorId} className="auth-error">{localizeAuthError(lang, state.error)}</p> : null}
            </div>
            <div className="auth-modal-actions">
              <button type="button" className="btn btn-ghost" disabled={pending} onClick={onClose}>{copy.cancel}</button>
              <button type="submit" className="btn btn-primary" disabled={pending}>
                {pending ? (<><Loader2 size={16} className="spin" aria-hidden="true" />{copy.sending}</>) : copy.send}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
