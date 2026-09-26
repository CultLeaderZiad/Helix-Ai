'use client'

import { useActionState } from 'react'
import { Loader2 } from 'lucide-react'
import { resendSignupConfirmation, type ResendConfirmationState } from '@/lib/auth/resend-confirmation'
import { Button } from '@/components/ui/button'

const initialState: ResendConfirmationState | null = null

export function ResendConfirmation({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendSignupConfirmation, initialState)

  return (
    <form action={formAction} className="mt-6 w-full space-y-3 text-left">
      <input type="hidden" name="email" value={email} />
      <Button
        type="submit"
        variant="outline"
        disabled={pending || state?.status === 'cooldown'}
        className="h-10 w-full"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending…
          </>
        ) : (
          'Resend confirmation email'
        )}
      </Button>
      <p className="text-center text-xs text-muted-foreground" dir="rtl" lang="ar">
        إعادة إرسال رسالة التأكيد
      </p>
      {state ? (
        <p
          role="status"
          className={state.status === 'error' ? 'text-small text-status-danger' : 'text-small text-muted-foreground'}
        >
          {state.message}
          <span className="mt-1 block" dir="rtl" lang="ar">
            {state.messageAr}
          </span>
        </p>
      ) : null}
    </form>
  )
}
