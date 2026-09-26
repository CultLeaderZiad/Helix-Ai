'use client'

import { useActionState, useState } from 'react'
import { createContact, type CreateContactState } from '@/lib/crm/contacts'
import { tx, type DashLang } from '@/lib/dashboard/lang'
import { useDashLang } from '@/components/dashboard/use-lang'
import { FormField } from '@/components/dashboard/ui'

const idle: CreateContactState = { status: 'idle' }

export function AddContact({ lang }: { lang?: DashLang }) {
  const active = useDashLang(lang ?? 'en')
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(createContact, idle)

  if (!open) {
    return (
      <button type="button" className="btn-d" onClick={() => setOpen(true)}>
        {tx(active, 'Add contact', 'إضافة جهة اتصال')}
      </button>
    )
  }

  return (
    <form action={action} className="grid-2">
      <FormField label={tx(active, 'Name', 'الاسم')} htmlFor="full_name">
        <input className="fld" id="full_name" name="full_name" required autoComplete="name" />
      </FormField>
      <FormField label={tx(active, 'Phone', 'الهاتف')} htmlFor="phone">
        <input className="fld" id="phone" name="phone" autoComplete="tel" dir="ltr" />
      </FormField>
      <FormField label={tx(active, 'Email', 'البريد')} htmlFor="email">
        <input className="fld" id="email" name="email" type="email" autoComplete="email" dir="ltr" />
      </FormField>
      <FormField label={tx(active, 'Company', 'الشركة')} htmlFor="company_name">
        <input className="fld" id="company_name" name="company_name" autoComplete="organization" />
      </FormField>
      <div className="ph-actions">
        <button type="submit" className="btn-d" disabled={pending}>
          {pending ? tx(active, 'Saving…', 'جارٍ الحفظ…') : tx(active, 'Save contact', 'حفظ جهة الاتصال')}
        </button>
        <button type="button" className="btn-o" onClick={() => setOpen(false)}>
          {tx(active, 'Cancel', 'إلغاء')}
        </button>
      </div>
      {state.status !== 'idle' && state.message ? (
        <p role="status" className={state.status === 'error' ? 'faint' : 'muted'}>{state.message}</p>
      ) : null}
    </form>
  )
}
