'use client'

import { useEffect, useState, useTransition } from 'react'
import type { ClientIntegration } from '@/lib/schema'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'
import { tx, type DashLang } from '@/lib/dashboard/lang'
import { useDashLang } from '@/components/dashboard/use-lang'
import { EmptyState, PageHead, Panel, StatusChip } from '@/components/dashboard/ui'

interface IntegrationsHealthViewProps {
  initialIntegrations: ClientIntegration[]
  pingAction: () => Promise<{ success?: boolean; error?: string; message?: string }>
  lang?: DashLang
}

const NAMES: Record<string, { en: string; ar: string; detailEn: string; detailAr: string }> = {
  missed_call_response: {
    en: 'WhatsApp',
    ar: 'واتساب',
    detailEn: 'Used after a missed call.',
    detailAr: 'يُستخدم بعد المكالمة الفائتة.',
  },
  booking_receptionist: {
    en: 'Calendar',
    ar: 'التقويم',
    detailEn: 'Cal.com or Google Calendar.',
    detailAr: 'Cal.com أو تقويم Google.',
  },
  lead_attribution: {
    en: 'Phone line',
    ar: 'خط الهاتف',
    detailEn: 'Where missed calls are noticed.',
    detailAr: 'حيث تُلتقط المكالمات الفائتة.',
  },
}

export function IntegrationsHealthView({ initialIntegrations, pingAction, lang }: IntegrationsHealthViewProps) {
  const active = useDashLang(lang ?? 'en')
  const [integrations, setIntegrations] = useState<ClientIntegration[]>(initialIntegrations)
  const [isPending, startTransition] = useTransition()
  const [pingMessage, setPingMessage] = useState<string | null>(null)
  const [pingOk, setPingOk] = useState(false)

  useEffect(() => {
    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel('realtime:client_integrations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'client_integrations' },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const updated = payload.new as ClientIntegration
            setIntegrations(prev => prev.map(item => item.id === updated.id ? updated : item))
          } else if (payload.eventType === 'INSERT') {
            const inserted = payload.new as ClientIntegration
            setIntegrations(prev => [...prev, inserted])
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handlePing = () => {
    setPingMessage(null)
    startTransition(async () => {
      const res = await pingAction()
      if (res.success) {
        setPingOk(true)
        setPingMessage(res.message || tx(active, 'Connected.', 'تم الربط.'))
      } else {
        setPingOk(false)
        setPingMessage(res.error || tx(active, 'Not connected.', 'غير موصول.'))
      }
    })
  }

  return (
    <>
      <PageHead
        title={tx(active, 'Integrations', 'التكاملات')}
        lede={tx(active, 'WhatsApp, calendar, and phone. Reconnect when a line drops.', 'واتساب والتقويم والهاتف. أعد الربط إذا انقطع الاتصال.')}
        actions={
          <button type="button" className="btn-d" onClick={handlePing} disabled={isPending}>
            {isPending ? tx(active, 'Checking…', 'جارٍ الفحص…') : tx(active, 'Reconnect', 'إعادة الربط')}
          </button>
        }
      />
      {pingMessage ? <p className={pingOk ? 'muted' : 'faint'} role="status" style={{ marginTop: 12 }}>{pingMessage}</p> : null}
      <div className="stack">
        {integrations.length === 0 ? (
          <Panel>
            <EmptyState title={tx(active, 'Not connected.', 'غير موصول.')} body={tx(active, 'Connections appear here once they are saved for this workspace.', 'تظهر الاتصالات هنا بعد حفظها لمساحة العمل.')} />
          </Panel>
        ) : (
          <div className="grid-3">
            {integrations.map(item => {
              const meta = NAMES[item.system_type]
              const connected = item.status === 'connected'
              const title = meta ? (active === 'ar' ? meta.ar : meta.en) : item.system_type.replaceAll('_', ' ')
              return (
                <Panel key={item.id} title={title}>
                  <p className="muted">{meta ? (active === 'ar' ? meta.detailAr : meta.detailEn) : tx(active, 'Saved for this workspace.', 'محفوظ لمساحة العمل.')}</p>
                  <div style={{ marginTop: 12 }}>
                    <StatusChip tone={connected ? 'ok' : 'warn'}>
                      {connected ? tx(active, 'Connected', 'موصول') : tx(active, 'Not connected', 'غير موصول')}
                    </StatusChip>
                  </div>
                </Panel>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
