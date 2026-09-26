'use server'

import { cookies } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { authCallbackUrl } from '@/lib/auth/site-url'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COOLDOWN_MS = 60_000
const COOKIE = 'helix_confirm_resend'

export interface ResendConfirmationState {
  status: 'sent' | 'cooldown' | 'error'
  message: string
  messageAr: string
  retryAfterSeconds?: number
}

export async function resendSignupConfirmation(
  _prev: ResendConfirmationState | null,
  formData: FormData,
): Promise<ResendConfirmationState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return {
      status: 'error',
      message: 'Enter the email address you used to sign up.',
      messageAr: 'أدخل البريد الذي استخدمته للتسجيل.',
    }
  }

  const jar = await cookies()
  const previous = Number(jar.get(COOKIE)?.value ?? '0')
  const elapsed = Date.now() - previous
  if (previous && elapsed < COOLDOWN_MS) {
    const retryAfterSeconds = Math.ceil((COOLDOWN_MS - elapsed) / 1000)
    return {
      status: 'cooldown',
      retryAfterSeconds,
      message: `Wait ${retryAfterSeconds}s before requesting another confirmation email.`,
      messageAr: `انتظر ${retryAfterSeconds} ثانية قبل طلب رسالة تأكيد أخرى.`,
    }
  }

  try {
    const supabase = await createSupabaseServerClient()
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authCallbackUrl('/dashboard') },
    })
    if (error) {
      const lower = error.message.toLowerCase()
      if (error.status === 429 || lower.includes('rate')) {
        return {
          status: 'error',
          message: 'The email provider is rate limiting confirmation messages. Wait and try again.',
          messageAr: 'مزود البريد يقيّد رسائل التأكيد. انتظر ثم أعد المحاولة.',
        }
      }
      if (lower.includes('redirect') || lower.includes('not allowed')) {
        return {
          status: 'error',
          message: 'Supabase rejected the confirmation link. Add this site URL to the Auth redirect allow-list.',
          messageAr: 'رفض Supabase رابط التأكيد. أضف عنوان الموقع إلى قائمة عناوين إعادة التوجيه.',
        }
      }
      return {
        status: 'error',
        message: error.message || 'The confirmation email could not be requested.',
        messageAr: 'تعذر طلب رسالة التأكيد.',
      }
    }
  } catch {
    return {
      status: 'error',
      message: 'Authentication is not configured, so the confirmation email could not be sent.',
      messageAr: 'المصادقة غير مهيأة، لذلك تعذر إرسال رسالة التأكيد.',
    }
  }

  jar.set(COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 120,
  })

  return {
    status: 'sent',
    message: 'If that address still needs confirmation, Supabase was asked to send another message. Check spam. Delivery still depends on the project SMTP provider.',
    messageAr: 'إذا كان هذا العنوان ما زال بحاجة إلى تأكيد، فقد طُلب من Supabase إرسال رسالة أخرى. تحقق من البريد غير الهام. وصول الرسالة يعتمد على مزود SMTP في المشروع.',
  }
}
