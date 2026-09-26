'use client'

import { useActionState, useId, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, type SignInState } from '@/lib/auth/sign-in'
import { localizeAuthError } from '@/components/auth/auth-copy'
import type { HelixLang } from '@/lib/public-prefs'

const initialState: SignInState = { status: 'idle' }

export function LoginForm({ lang, verifyFailed = false }: { lang: HelixLang; verifyFailed?: boolean }) {
  const ar = lang === 'ar'
  const [state, formAction, pending] = useActionState(signIn, initialState)
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState(state.status === 'idle' ? '' : state.values.email)
  const ids = { email: useId(), password: useId(), emailErr: useId(), passwordErr: useId(), banner: useId() }
  const fieldErrors = state.status === 'field_error' ? state.errors : {}
  const authError = state.status === 'auth_error' ? state : null

  return (
    <>
      <h1>{ar ? 'أهلاً بعودتك' : 'Welcome back'}</h1>
      <p className="sub">{ar ? 'سجّل الدخول إلى مساحة عمل Helix.' : 'Sign in to your Helix workspace.'}</p>
      <form action={formAction} noValidate aria-busy={pending}>
        <input type="hidden" name="portal" value="client" />
        {verifyFailed ? <p role="alert" className="auth-error">{ar ? 'تعذّر تأكيد البريد. اطلب رابطاً جديداً.' : 'Email confirmation could not be completed. Request a new link.'}</p> : null}
        {authError ? (
          <p id={ids.banner} role="alert" className="auth-error">{localizeAuthError(lang, authError.message)}</p>
        ) : null}
        <div className="field">
          <label htmlFor={ids.email}>{ar ? 'البريد الإلكتروني للعمل' : 'Work email'}</label>
          <input
            id={ids.email}
            className="fld"
            name="email"
            type="email"
            dir="ltr"
            autoComplete="username"
            value={email}
            onChange={e => setEmail(e.target.value)}
            aria-invalid={Boolean(fieldErrors.email) || undefined}
            aria-describedby={fieldErrors.email ? ids.emailErr : undefined}
          />
          {fieldErrors.email ? <p id={ids.emailErr} className="auth-error">{localizeAuthError(lang, fieldErrors.email)}</p> : null}
        </div>
        <div className="field">
          <label htmlFor={ids.password}>
            {ar ? 'كلمة المرور' : 'Password'}
            <Link href="/forgot-password">{ar ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</Link>
          </label>
          <div className="input">
            <input
              id={ids.password}
              name="password"
              type={showPassword ? 'text' : 'password'}
              dir="ltr"
              autoComplete="current-password"
              aria-invalid={Boolean(fieldErrors.password) || undefined}
              aria-describedby={fieldErrors.password ? ids.passwordErr : undefined}
            />
            <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} style={{ background: 'none', border: 0, color: 'var(--text-3)' }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {fieldErrors.password ? <p id={ids.passwordErr} className="auth-error">{localizeAuthError(lang, fieldErrors.password)}</p> : null}
        </div>
        <button type="submit" className="submit" disabled={pending}>
          {pending ? <><Loader2 size={16} className="spin" /> {ar ? 'جارٍ تسجيل الدخول…' : 'Signing in…'}</> : <>{ar ? 'تسجيل الدخول' : 'Sign in'} <ArrowRight size={16} className="arrow" /></>}
        </button>
        <div className="alt">
          <span>{ar ? 'تواجه مشكلة؟' : 'Trouble signing in?'} <Link href="/contact">{ar ? 'راسل دعم Helix' : 'Message Helix support on WhatsApp'}</Link></span>
          <span>{ar ? 'من فريق Helix؟' : 'Helix team member?'} <Link href="/login?portal=agency">{ar ? 'دخول الوكالة' : 'Agency sign-in'}</Link></span>
        </div>
      </form>
    </>
  )
}
