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
        <div className="rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D9D4CB]/80 pb-3">
            <div className="flex items-center gap-2">
              <FileCode className="size-4 text-[#0B6E4F]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#141414]">
                {isAr ? 'موجهات وتعليمات النظام الذكي (System Directives)' : 'System Prompt Directives'}
              </span>
            </div>
            <span className="rounded-full bg-[#0B6E4F]/10 text-[#0B6E4F] border border-[#0B6E4F]/30 px-2.5 py-0.5 text-[10px] font-mono font-semibold">
              Deterministic RLS Guard
            </span>
          </div>

          <div className="rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-4 font-mono text-xs text-[#141414] leading-relaxed whitespace-pre-line max-h-[280px] overflow-y-auto">
            {promptSnippet}
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6E6B65] font-mono pt-1">
            <span>Estimated Token Size: ~240 Tokens</span>
            <span className="text-[#0B6E4F] flex items-center gap-1 font-semibold">
              <CheckCircle2 className="size-3 text-[#0B6E4F]" />
              Syntax &amp; Guardrails Verified
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Guardrails & Regional Dialect Tuning (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Dialect Engine */}
        <div className="rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#141414] uppercase tracking-wider">
            <Globe className="size-4 text-[#0B6E4F]" />
            <span>{isAr ? 'محرك اللهجات الإقليمية' : 'Regional Dialect Engine'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDialect('gulf')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'gulf'
                  ? 'border-[#0B6E4F] bg-[#0B6E4F]/5 text-[#141414] font-semibold ring-1 ring-[#0B6E4F]/20'
                  : 'border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65] hover:text-[#141414] hover:bg-[#EBE7DF]'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'اللهجة الخليجية' : 'Gulf Arabic'}</div>
              <div className="text-[9px] text-[#6E6B65]">UAE, KSA, Qatar</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('egyptian')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'egyptian'
                  ? 'border-[#0B6E4F] bg-[#0B6E4F]/5 text-[#141414] font-semibold ring-1 ring-[#0B6E4F]/20'
                  : 'border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65] hover:text-[#141414] hover:bg-[#EBE7DF]'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'اللهجة المصرية' : 'Egyptian Arabic'}</div>
              <div className="text-[9px] text-[#6E6B65]">High-velocity SME</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('white')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'white'
                  ? 'border-[#0B6E4F] bg-[#0B6E4F]/5 text-[#141414] font-semibold ring-1 ring-[#0B6E4F]/20'
                  : 'border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65] hover:text-[#141414] hover:bg-[#EBE7DF]'
              )}
            >
              <div className="text-[11px] font-semibold">{isAr ? 'العربية البيضاء' : 'Modern Standard'}</div>
              <div className="text-[9px] text-[#6E6B65]">Pan-Arab Corporate</div>
            </button>

            <button
              type="button"
              onClick={() => setDialect('english')}
              className={cn(
                'rounded-xl border p-2.5 text-left transition-colors',
                dialect === 'english'
                  ? 'border-[#0B6E4F] bg-[#0B6E4F]/5 text-[#141414] font-semibold ring-1 ring-[#0B6E4F]/20'
                  : 'border-[#D9D4CB] bg-[#F7F5F0] text-[#6E6B65] hover:text-[#141414] hover:bg-[#EBE7DF]'
              )}
            >
              <div className="text-[11px] font-semibold">Global English</div>
              <div className="text-[9px] text-[#6E6B65]">Multinational GCC</div>
            </button>
          </div>
        </div>

        {/* Safety & Human Escalation */}
        <div className="rounded-2xl border border-[#D9D4CB] bg-[#FFFEFA] p-4 space-y-3 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#141414] uppercase tracking-wider">
            <ShieldAlert className="size-4 text-[#0B6E4F]" />
            <span>{isAr ? 'صمامات الأمان والتحويل البشري' : 'Safety & Escalation Controls'}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-2.5 cursor-pointer hover:bg-[#EBE7DF] transition-colors">
              <span className="text-[#141414] text-[11px] font-medium">
                {isAr ? 'تحويل فوري للمشرف عند رصد استياء' : 'Escalate on Negative Sentiment'}
              </span>
              <input
                type="checkbox"
                checked={escalateOnDispute}
                onChange={(e) => setEscalateOnDispute(e.target.checked)}
                className="size-4 accent-[#0B6E4F]"
              />
            </label>

            <label className="flex items-center justify-between rounded-xl border border-[#D9D4CB] bg-[#F7F5F0] p-2.5 cursor-pointer hover:bg-[#EBE7DF] transition-colors">
              <span className="text-[#141414] text-[11px] font-medium">
                {isAr ? 'إرسال خريطة الموقع الجغرافي تلقائياً' : 'Auto-Dispatch WhatsApp GPS Location'}
              </span>
              <input
                type="checkbox"
                checked={autoShareLocation}
                onChange={(e) => setAutoShareLocation(e.target.checked)}
                className="size-4 accent-[#0B6E4F]"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
