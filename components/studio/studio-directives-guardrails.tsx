'use client'

import { useState } from 'react'
import {
  ShieldAlert,
  Sliders,
  Sparkles,
  CheckCircle2,
  Lock,
  Globe,
  AlertTriangle,
  FileCode,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemTemplate } from '@/lib/studio/templates'

interface StudioDirectivesGuardrailsProps {
  template: SystemTemplate
  brandName: string
  isAr?: boolean
}

export function StudioDirectivesGuardrails({
  template,
  brandName,
  isAr = false,
}: StudioDirectivesGuardrailsProps) {
  const [dialect, setDialect] = useState<'gulf' | 'egyptian' | 'white' | 'english'>('gulf')
  const [strictness, setStrictness] = useState<'strict' | 'balanced' | 'creative'>('strict')
  const [escalateOnDispute, setEscalateOnDispute] = useState(true)
  const [autoShareLocation, setAutoShareLocation] = useState(true)

  const promptSnippet = isAr
    ? `أنت الوكيل الذكي الرسمي لشركة "${brandName}".
مهمتك: استقبال استفسارات ومكالمات العملاء باللهجة الخليجية والعربية الفصحى بأعلى درجات الاحترافية.
القواعد الإلزامية:
1. عدم اختلاق أي مواعيد أو أسعار غير موجودة في قاعدة بيانات CRM.
2. تصنيف كل معلومة واردة في سجل الحقائق (Verified / Probable / Possible).
3. إرسال تأكيد الحجز وموقع الفرع عبر واتساب كلاود فور تثبيت الموعد.
4. في حال رصد استياء من العميل أو طلب مشرف بشري، يتم التحويل فوراً خلال ثانيتين.`
    : `You are the official autonomous operations agent for "${brandName}".
Your mission: Answer client inquiries with sub-400ms latency across voice and WhatsApp with zero hallucinations.
Mandatory Rules:
1. Never invent calendar availability or pricing concessions outside CRM records.
2. Categorize all extracted assertions into tri-state evidence bands (Verified, Probable, Possible).
3. Dispatch instant WhatsApp itinerary and Google Maps location pin upon confirmation.
4. Trigger automated human supervisor escalation if client sentiment drops below -0.6.`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Directives & Prompt Window (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="rounded-2xl border border-helix-border bg-[#090e1a] p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-helix-border/80 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="size-4 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-helix-ink">
                {isAr ? 'موجهات وتعليمات النظام الذكي (System Directives)' : 'System Prompt Directives'}
              </span>
            </div>
            <span className="rounded-full bg-purple-500/20 text-purple-300 px-2 py-0.5 text-[10px] font-mono">
              Deterministic RLS Guard
            </span>
          </div>

          <div className="rounded-xl border border-helix-border bg-[#060a14] p-4 font-mono text-xs text-helix-ink/80 leading-relaxed whitespace-pre-line shadow-inner max-h-[280px] overflow-y-auto">
            {promptSnippet}
          </div>

          <div className="flex items-center justify-between text-[11px] text-helix-muted font-mono pt-1">
            <span>Estimated Token Size: ~240 Tokens</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3" />
              Syntax &amp; Guardrails Verified
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Guardrails & Regional Dialect Tuning (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Dialect Engine */}
        <div className="rounded-2xl border border-helix-border bg-helix-surface p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-helix-ink uppercase tracking-wider">
            <Globe className="size-4 text-helix-accent" />
            <span>{isAr ? 'محرك اللهجات الإقليمية' : 'Regional Dialect Engine'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDialect('gulf')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'gulf'
                  ? 'border-helix-ink bg-helix-accent-soft text-helix-ink font-semibold'
                  : 'border-helix-border bg-helix-canvas text-helix-muted hover:text-helix-ink'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'اللهجة الخليجية' : 'Gulf Arabic'}</div>
              <div className="text-[9px] text-helix-muted">UAE, KSA, Qatar</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('egyptian')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'egyptian'
                  ? 'border-helix-ink bg-helix-accent-soft text-helix-ink font-semibold'
                  : 'border-helix-border bg-helix-canvas text-helix-muted hover:text-helix-ink'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'اللهجة المصرية' : 'Egyptian Arabic'}</div>
              <div className="text-[9px] text-helix-muted">High-velocity SME</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('white')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'white'
                  ? 'border-helix-ink bg-helix-accent-soft text-helix-ink font-semibold'
                  : 'border-helix-border bg-helix-canvas text-helix-muted hover:text-helix-ink'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'العربية البيضاء' : 'Modern Standard'}</div>
              <div className="text-[9px] text-helix-muted">Pan-Arab Corporate</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('english')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'english'
                  ? 'border-helix-ink bg-helix-accent-soft text-helix-ink font-semibold'
                  : 'border-helix-border bg-helix-canvas text-helix-muted hover:text-helix-ink'
              )}
            >
              <div className="text-[11px] font-semibold">Global English</div>
              <div className="text-[9px] text-helix-muted">Multinational GCC</div>
            </button>
          </div>
        </div>

        {/* Safety & Human Escalation */}
        <div className="rounded-2xl border border-helix-border bg-helix-surface p-4 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-helix-ink uppercase tracking-wider">
            <ShieldAlert className="size-4 text-emerald-400" />
            <span>{isAr ? 'صمامات الأمان والتحويل البشري' : 'Safety & Escalation Controls'}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between rounded-xl border border-helix-border bg-helix-canvas p-2.5 cursor-pointer">
              <span className="text-helix-ink/80 text-[11px]">
                {isAr ? 'تحويل فوري للمشرف عند رصد استياء' : 'Escalate on Negative Sentiment'}
              </span>
              <input
                type="checkbox"
                checked={escalateOnDispute}
                onChange={(e) => setEscalateOnDispute(e.target.checked)}
                className="size-4 accent-helix-accent"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-helix-border bg-helix-canvas p-2.5 cursor-pointer">
              <span className="text-helix-ink/80 text-[11px]">
                {isAr ? 'إرسال خريطة الموقع الجغرافي تلقائياً' : 'Auto-Dispatch WhatsApp GPS Location'}
              </span>
              <input
                type="checkbox"
                checked={autoShareLocation}
                onChange={(e) => setAutoShareLocation(e.target.checked)}
                className="size-4 accent-helix-accent"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
