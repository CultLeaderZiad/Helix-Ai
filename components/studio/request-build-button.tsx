'use client'

import { useState, useTransition } from 'react'
import { requestSystemBuild } from '@/lib/studio/request-build'
import { Button } from '@/components/ui/button'

export function RequestBuildButton({
  templateId,
  brandName,
  language = 'en',
  size = 'sm',
}: {
  templateId: string
  brandName?: string
  language?: 'en' | 'ar'
  size?: 'sm' | 'default'
}) {
  const isAr = language === 'ar'
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  const onClick = () => {
    startTransition(async () => {
      const res = await requestSystemBuild(templateId, {
        brandName: brandName?.trim() || 'Workspace',
        accentColor: '#0B6E4F',
        themeVariant: 'warm-command',
      })
      setMessage(res.message)
    })
  }

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Button type="button" variant="secondary" size={size} onClick={onClick} disabled={isPending}>
        {isPending ? (isAr ? 'جارٍ الإرسال' : 'Sending') : isAr ? 'اطلب البناء' : 'Request build'}
      </Button>
      {message ? <p className="max-w-[16rem] text-12 text-helix-muted">{message}</p> : null}
    </div>
  )
}
