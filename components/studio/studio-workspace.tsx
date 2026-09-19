'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import {
  CheckCircle2,
  X,
  Play,
} from 'lucide-react'
import { SYSTEM_TEMPLATES, getSystemTemplate, type SystemTemplate } from '@/lib/studio/templates'
import { requestSystemBuild, type RequestBuildResult } from '@/lib/studio/request-build'
import dynamic from 'next/dynamic'
import { PageHeader, Pill } from '@/components/ui/helix'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { SystemCard } from '@/components/studio/system-card'
import { useConsoleLanguage } from '@/components/shell/console-language'

const panelLoading = () => <p role="status" className="min-h-64 p-8 text-helix-muted">Loading studio panel…</p>
const StudioMotionDemo = dynamic(() => import('./studio-motion-demo').then(mod => mod.StudioMotionDemo), { loading: panelLoading })
const StudioPipelineVisualizer = dynamic(() => import('./studio-pipeline-visualizer').then(mod => mod.StudioPipelineVisualizer), { loading: panelLoading })
const StudioInteractiveSimulator = dynamic(() => import('./studio-interactive-simulator').then(mod => mod.StudioInteractiveSimulator), { loading: panelLoading })
const StudioDirectivesGuardrails = dynamic(() => import('./studio-directives-guardrails').then(mod => mod.StudioDirectivesGuardrails), { loading: panelLoading })

type StudioMachineTab = 'simulator' | 'topology' | 'directives'

export function StudioWorkspace({
  initialClientName,
  initialSystemId,
  isSample = false,
}: {
  initialClientName?: string
  initialSystemId?: string
  isSample?: boolean
}) {
  const initialTemplate = getSystemTemplate(initialSystemId ?? '') ?? SYSTEM_TEMPLATES[0]
  const [selectedTemplate, setSelectedTemplate] = useState<SystemTemplate>(initialTemplate)
  const consoleLanguage = useConsoleLanguage()
  const [language, setLanguage] = useState<'en' | 'ar'>(consoleLanguage.language)
  const isAr = language === 'ar'
  const [view, setView] = useState<'catalog' | 'demo'>(initialSystemId ? 'demo' : 'catalog')
  const [brandName, setBrandName] = useState(initialClientName || '')
  const [machineTab, setMachineTab] = useState<StudioMachineTab>('simulator')
  const [isPending, startTransition] = useTransition()
  const [modalResult, setModalResult] = useState<RequestBuildResult | null>(null)
  const [showDemoModal, setShowDemoModal] = useState(false)

  const content = selectedTemplate[language]
  const accentColor = '#0B6E4F'

  const handleRequestBuild = () => {
    startTransition(async () => {
      const res = await requestSystemBuild(selectedTemplate.id, {
        brandName,
        accentColor,
        themeVariant: 'warm-command',
      })
      setModalResult(res)
    })
  }

  const openDemo = (template: SystemTemplate) => {
    setSelectedTemplate(template)
    setView('demo')
  }

  const catalog = useMemo(() => SYSTEM_TEMPLATES, [])

  return (
    <div className="w-full space-y-6" dir={isAr ? 'rtl' : 'ltr'}>
      <PageHeader
        title={isAr ? 'كتالوج الأنظمة' : view === 'catalog' ? 'System catalog' : content.name}
        subtitle={
          view === 'catalog'
            ? isAr
              ? 'حزم الإنتاج الأساسية وإضافات المعاينة. العرض التجريبي ≠ التشغيل الحي.'
              : 'Core production packs + preview add-ons. Demo is not live.'
            : content.description
        }
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {isSample ? <Pill tone="sample">Sample</Pill> : null}
            <div className="flex items-center rounded-[12px] border border-helix-border p-1">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={cn(
                  'rounded-[10px] px-2.5 py-1 text-12',
                  language === 'en' ? 'bg-helix-ink text-helix-surface' : 'text-helix-muted'
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('ar')}
                className={cn(
                  'rounded-[10px] px-2.5 py-1 text-12',
                  language === 'ar' ? 'bg-helix-ink text-helix-surface' : 'text-helix-muted'
                )}
              >
                عربي
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className={buttonVariants({ variant: 'secondary', size: 'sm' })}
            >
              <Play className="size-3.5" />
              {isAr ? 'جولة قصيرة' : 'Short walkthrough'}
            </button>
          </div>
        }
      />

      {view === 'catalog' ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {catalog.map(template => (
            <SystemCard
              key={template.id}
              template={template}
              language={language}
              brandName={brandName}
              onDemo={() => openDemo(template)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" size="sm" onClick={() => setView('catalog')}>
              {isAr ? 'العودة للكتالوج' : 'Back to catalog'}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/studio/guides/${selectedTemplate.id}`}
                className={buttonVariants({ variant: 'secondary', size: 'sm' })}
              >
                {isAr ? 'الدليل' : 'Guide'}
              </Link>
              <Button size="sm" onClick={handleRequestBuild} disabled={isPending}>
                {isPending ? (isAr ? 'جارٍ الإرسال' : 'Sending') : isAr ? 'اطلب البناء' : 'Request build'}
              </Button>
            </div>
          </div>

          <label className="block text-13">
            <span className="helix-field-label">{isAr ? 'اسم المنشأة في العرض' : 'Business name in demo'}</span>
            <input
              className="helix-field"
              value={brandName}
              placeholder={isAr ? 'اسم المنشأة في العرض' : 'Business name in demo'}
              onChange={e => setBrandName(e.target.value)}
            />
          </label>

          <div className="flex gap-1 overflow-x-auto">
            {(
              [
                { id: 'simulator', label: isAr ? 'المحاكي' : 'Simulator' },
                { id: 'topology', label: isAr ? 'المسار' : 'Flow' },
                { id: 'directives', label: isAr ? 'التعليمات' : 'Directives' },
              ] as const
            ).map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setMachineTab(tab.id)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-13',
                  machineTab === tab.id ? 'bg-helix-ink text-helix-surface' : 'text-helix-muted hover:bg-helix-canvas'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="rounded-[16px] border border-helix-border bg-helix-surface p-4">
            {machineTab === 'simulator' && (
              <StudioInteractiveSimulator
                template={selectedTemplate}
                brandName={brandName}
                accentColor={accentColor}
                isAr={isAr}
              />
            )}
            {machineTab === 'topology' && (
              <StudioPipelineVisualizer
                template={selectedTemplate}
                brandName={brandName}
                accentColor={accentColor}
                isAr={isAr}
              />
            )}
            {machineTab === 'directives' && (
              <StudioDirectivesGuardrails
                template={selectedTemplate}
                brandName={brandName}
                isAr={isAr}
              />
            )}
          </div>
        </div>
      )}

      {modalResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-helix-ink/40 p-4">
          <div className="w-full max-w-md rounded-[16px] border border-helix-border bg-helix-surface p-6 shadow-helix">
            <div className="flex items-center justify-between">
              <CheckCircle2 className="size-6 text-helix-ok" />
              <button type="button" onClick={() => setModalResult(null)} className="text-helix-muted">
                <X className="size-5" />
              </button>
            </div>
            <h3 className="mt-3 helix-title text-22">
              {modalResult.success
                ? isAr
                  ? 'تم إرسال طلب البناء'
                  : 'Build request sent'
                : isAr
                  ? 'تعذر إرسال الطلب'
                  : 'Request failed'}
            </h3>
            <p className="mt-2 text-13 text-helix-muted">{modalResult.message}</p>
            <div className="mt-5 flex justify-end">
              <Button size="sm" onClick={() => setModalResult(null)}>
                {isAr ? 'إغلاق' : 'Close'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-helix-ink/50 p-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={() => setShowDemoModal(false)}
              className="mb-3 text-13 text-white"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
            <StudioMotionDemo
              variant="modal"
              autoplay={true}
              loop={false}
              onCloseOrSkip={() => setShowDemoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
