'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  PhoneCall,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  Building2,
  Languages,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export function PlaybooksView() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'scripts' | 'whatsapp' | 'links' | 'objections'>('scripts')
  const [language, setLanguage] = useState<'en' | 'ar'>('en')
  const isAr = language === 'ar'

  const copyToClipboard = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  return (
    <div className="mx-auto w-full max-w-6xl" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-helix-border pb-6">
        <div>
          <h1 className="helix-title text-28">
            {isAr ? 'أدلة الأنظمة والتوزيع' : 'Guides'}
          </h1>
          <p className="mt-1 text-13 text-helix-muted">
            {isAr
              ? 'نصوص المكالمات، قوالب الواتساب، وروابط العروض التجريبية.'
              : 'Call scripts, WhatsApp cadences, and demo links for GCC and MENA.'}
          </p>
        </div>

        {/* Language Switcher */}
        <button
          type="button"
          onClick={() => setLanguage(l => (l === 'en' ? 'ar' : 'en'))}
          className="flex items-center gap-1.5 rounded-xl border border-helix-border bg-helix-surface px-3.5 py-2 text-xs font-semibold text-helix-ink hover:bg-helix-canvas transition-colors"
        >
          <Languages className="size-3.5" />
          {isAr ? 'English' : 'العربية'}
        </button>
      </div>

      {/* Tabs */}
      <div className="mt-6 flex items-center gap-2 border-b border-helix-border pb-2 overflow-x-auto">
        {[
          { id: 'scripts', label: isAr ? 'نصوص المكالمات الهاتفية' : 'Phone Cold Scripts', icon: PhoneCall },
          { id: 'whatsapp', label: isAr ? 'سلاسل رسائل الواتساب' : 'WhatsApp Outreach', icon: MessageSquare },
          { id: 'links', label: isAr ? 'روابط العرض التجريبي الحي' : 'Live Demo Assets', icon: Sparkles },
          { id: 'objections', label: isAr ? 'التعامل مع الاعتراضات' : 'Objection Handling', icon: ShieldCheck },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-helix-accent-soft text-helix-accent border border-helix-border shadow-xs'
                  : 'text-helix-muted hover:text-helix-ink hover:bg-helix-border/40'
              )}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab 1: Cold Call Scripts */}
      {activeTab === 'scripts' && (
        <div className="mt-8 space-y-6">
          {/* Script A: Night Test */}
          <div className="rounded-2xl border border-helix-border bg-helix-canvas p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-helix-border pb-3">
              <div>
                <span className="rounded-full bg-helix-accent-soft border border-helix-accent/20 px-2.5 py-0.5 text-[10px] text-helix-accent font-mono">
                  CLINICS & HIGH-TICKET SERVICES
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-helix-ink">
                  {isAr ? 'سيناريو مكالمة المساء (The Night Test)' : 'Script A: The "Night Test" Angle'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'script-a',
                    `Hi [Name], quick question—have you ever called your own clinic line at 8:30 PM to see what a new patient hears? When patients search for appointments after hours, they hang up and book with whoever answers first. We deployed an autonomous bilingual voice receptionist that answers in < 400ms in Gulf Arabic, confirms calendar slots on Cal.com, and sends an instant WhatsApp itinerary. Can I send you a 1-minute test sandbox to test on your phone?`
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-helix-border bg-helix-surface px-3 py-1.5 text-xs font-medium text-helix-ink hover:bg-helix-border/40 transition-colors"
              >
                {copiedKey === 'script-a' ? <Check className="size-3.5 text-[#0B6E4F]" /> : <Copy className="size-3.5" />}
                {copiedKey === 'script-a' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Pitch')}
              </button>
            </div>
            <div className="mt-4 text-xs text-helix-ink space-y-2 leading-relaxed bg-helix-surface p-4 rounded-xl border border-helix-border">
              <p>
                <strong>{isAr ? 'المتصل (الممثل):' : 'Caller (Rep):'}</strong> "
                {isAr
                  ? 'مرحباً دكتور [الاسم]، مكالمة سريعة لمدة 30 ثانية: هل جربت الاتصال على رقم عيادتكم الساعة 8:30 مساءً لسماع ما يجده المريض الجديد؟'
                  : "Hi [Director Name], quick 30-second question: have you ever called your own clinic line at 8:30 PM to see what a prospective patient hears?"}
                "
              </p>
              <p>
                <strong>{isAr ? 'العميل:' : 'Prospect:'}</strong> "
                {isAr ? 'لا، نكون قد أغلقنا دوام الاستقبال.' : "No, our reception is closed then."}"
              </p>
              <p>
                <strong>{isAr ? 'المتصل:' : 'Caller:'}</strong> "
                {isAr
                  ? 'بالضبط. ما يحدث في دبي والرياض أن المريض يغلق الخط ويحجز فوراً مع أول عيادة تجيب عليه. قمنا بتطوير موظف استقبال صوتي ذكي يجيب خلال ثانيتين باللهجة الخليجية، يثبت الموعد على تقويمكم، ويرسل رسالة واتساب بالموقع وتأكيد الحجز قبل إغلاق الخط. جهزنا مختبراً تفاعلياً لتجربة صوت الواتساب باسم عيادتك: هل يمكنني إرسال الرابط لرقمك الآن؟'
                  : "Right. High-intent patients hanging up simply book with whoever answers next. We deployed an autonomous bilingual voice receptionist answering in < 400ms in natural Gulf Arabic, booking calendar slots, and firing an automated WhatsApp itinerary. Can I send you the interactive demo link to test on your phone?"}
                "
              </p>
            </div>
          </div>

          {/* Script B: 5-Second Rescue */}
          <div className="rounded-2xl border border-helix-border bg-helix-canvas p-6 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-helix-border pb-3">
              <div>
                <span className="rounded-full bg-[#0B6E4F]/10 border border-[#0B6E4F]/20 px-2.5 py-0.5 text-[10px] text-[#0B6E4F] font-mono font-semibold">
                  CONTRACTORS & HOME SERVICES
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-helix-ink">
                  {isAr ? 'سيناريو إنقاذ المكالمة الفائتة في 5 ثوانٍ' : 'Script B: The "5-Second Rescue"'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'script-b',
                    `Hi [Name], in emergency home services, 70% of missed calls hire a competitor within 3 minutes. When your line is busy, Helix AI fires a WhatsApp in under 4 seconds: 'Hi, we missed your call—what emergency service do you need right now?' It captures the address and pings your technician dispatch queue instantly.`
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-helix-border bg-helix-surface px-3 py-1.5 text-xs font-medium text-helix-ink hover:bg-helix-border/40 transition-colors"
              >
                {copiedKey === 'script-b' ? <Check className="size-3.5 text-[#0B6E4F]" /> : <Copy className="size-3.5" />}
                {copiedKey === 'script-b' ? (isAr ? 'تم النسخ!' : 'Copied!') : (isAr ? 'نسخ النص' : 'Copy Pitch')}
              </button>
            </div>
            <div className="mt-4 text-xs text-helix-ink space-y-2 leading-relaxed bg-helix-surface p-4 rounded-xl border border-helix-border">
              <p>
                <strong>{isAr ? 'المتصل (الممثل):' : 'Caller (Rep):'}</strong> "
                {isAr
                  ? 'أهلاً بك، عندما يكون فني الصيانة في موقع العمل وتفوته مكالمة طارئة، 90% من العملاء يتصلون بالمنافس فوراً. نظامنا يُرسل رسالة واتساب خلال 4 ثوانٍ لجمع تفاصيل المشكلة وتأكيد الموقع وإرسال المهمة لفريقك.'
                  : 'In emergency services, 7 out of 10 callers hire a competitor within 3 minutes if you miss the ring. Our system fires a WhatsApp in under 4 seconds, qualifies the emergency, captures the address pin, and alerts your crew.'}
                "
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: WhatsApp Outreach Sequences */}
      {activeTab === 'whatsapp' && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl border border-helix-border bg-helix-canvas p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-helix-border pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B6E4F] flex items-center gap-2">
                <MessageSquare className="size-4" />
                {isAr ? 'رسالة الواتساب المباشرة الأولى (Touch 1)' : 'WhatsApp First Touch Sequence'}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    'wa-touch-1',
                    isAr
                      ? `مرحباً أستاذ [الاسم]، لاحظنا تميز أعمالكم في [الشركة]. عندما يتصل عميل مهتم خارج أوقات الدوام، هل يُفقد الاتصال أم يُثبت حجزه فوراً؟ قمنا بتطوير موظف استقبال صوتي ذكي يجيب خلال 400 ميلي ثانية باللهجة الخليجية ويثبت الموعد ويرسل تأكيد الواتساب فوراً. جرب المختبر التفاعلي هنا: https://helixai.com/dashboard/studio`
                      : `Hi [Name], when prospective high-value clients call [Business] after hours, do they get sent to voicemail or booked instantly? Our autonomous voice & WhatsApp agent picks up in < 400ms in Gulf Arabic/English, coordinates Cal.com bookings, and sends instant WhatsApp itineraries: https://helixai.com/dashboard/studio`
                  )
                }
                className="flex items-center gap-1.5 rounded-lg border border-[#0B6E4F]/30 bg-[#0B6E4F]/10 px-3 py-1.5 text-xs font-semibold text-[#0B6E4F] hover:bg-[#0B6E4F]/20 transition-colors"
              >
                {copiedKey === 'wa-touch-1' ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                {copiedKey === 'wa-touch-1' ? 'Copied!' : 'Copy Template'}
              </button>
            </div>
            <p className="mt-4 text-xs text-helix-ink leading-relaxed font-mono bg-helix-surface p-4 rounded-xl border border-helix-border">
              {isAr
                ? 'مرحباً أستاذ [الاسم]، لاحظنا تميز أعمالكم في [الشركة]. عندما يتصل عميل مهتم خارج أوقات الدوام، هل يُفقد الاتصال أم يُثبت حجزه فوراً؟ قمنا بتطوير موظف استقبال صوتي ذكي يجيب خلال 400 ميلي ثانية باللهجة الخليجية ويثبت الموعد ويرسل تأكيد الواتساب فوراً. جرب المختبر التفاعلي هنا: https://helixai.com/dashboard/studio'
                : 'Hi [Name], when prospective high-value clients call [Business] after hours, do they get sent to voicemail or booked instantly? Our autonomous voice & WhatsApp agent picks up in < 400ms in Gulf Arabic/English, coordinates Cal.com bookings, and sends instant WhatsApp itineraries: https://helixai.com/dashboard/studio'}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Live Demo Links */}
      {activeTab === 'links' && (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[
            {
              title: 'System Preview Studio',
              href: '/dashboard/studio',
              desc: 'Live interactive sandbox with real-time brand and color preview.',
            },
            {
              title: 'AI Diagnostic Engine',
              href: '/dashboard/engine',
              desc: '60-second assessment calculating projected ROI and CRM pipeline.',
            },
            {
              title: 'Regional Pricing Engine',
              href: '/pricing',
              desc: 'Dynamic regional economic model (AED, SAR, EGP, JOD, USD) across AED, SAR, EGP, JOD and USD.',
            },
            {
              title: 'Autonomous Receptionist',
              href: '/receptionist',
              desc: 'Direct landing rewrite for voice booking receptionist architecture.',
            },
            {
              title: 'Missed-Call WhatsApp Triage',
              href: '/missed-call',
              desc: 'Landing rewrite showcasing sub-5-second lead rescue and dispatch.',
            },
            {
              title: 'Lead Reactivation Engine',
              href: '/lead-reactivation',
              desc: 'Demonstration of WhatsApp sequences converting dormant CRM records.',
            },
          ].map(link => (
            <div
              key={link.title}
              className="flex items-center justify-between rounded-xl border border-helix-border bg-helix-canvas p-4 text-xs"
            >
              <div>
                <h4 className="font-bold text-helix-ink text-sm">{link.title}</h4>
                <p className="mt-1 text-helix-muted">{link.desc}</p>
                <span className="mt-2 block font-mono text-[11px] text-helix-accent">
                  {link.href}
                </span>
              </div>
              <Link
                href={link.href}
                className="flex items-center gap-1 rounded-lg bg-helix-accent-soft border border-helix-border px-3 py-1.5 text-xs font-semibold text-helix-accent hover:bg-helix-accent-soft"
              >
                Open <ExternalLink className="size-3" />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Objection Handling */}
      {activeTab === 'objections' && (
        <div className="mt-8 space-y-4">
          <div className="rounded-xl border border-helix-border bg-helix-canvas p-5 text-xs space-y-2">
            <h4 className="font-bold text-helix-ink text-sm">
              {isAr ? 'الاعتراض: هل يبدو الصوت آلياً أو مزعجاً للعميل؟' : 'Objection: Does the voice sound robotic?'}
            </h4>
            <p className="text-helix-ink/80 leading-relaxed">
              {isAr
                ? 'الإجابة: إطلاقاً. نستخدم محركات توليد صوت عصبي فائق التطور مخصص للهجات الخليجية والمصرية والشامية بزمن استجابة أقل من 400 ميلي ثانية، مع قدرة ذكية على التوقف عند مقاطعة المتصل كما يتحدث البشر تماماً.'
                : 'Response: Not at all. We utilize ultra-low latency neural speech models (< 400ms response) tuned specifically for Gulf and regional Arabic dialects with natural conversational interruptions.'}
            </p>
          </div>

          <div className="rounded-xl border border-helix-border bg-helix-canvas p-5 text-xs space-y-2">
            <h4 className="font-bold text-helix-ink text-sm">
              {isAr ? 'الاعتراض: ماذا لو ارتكب الذكاء الاصطناعي أخطاء في الأسعار؟' : 'Objection: What if the AI hallucinates prices?'}
            </h4>
            <p className="text-helix-ink/80 leading-relaxed">
              {isAr
                ? 'الإجابة: صممنا سجل تدقيق حقائق مشفر (Evidence Ledger). أي استفسار غير مألوف أو تقل نسبة الثقة فيه عن 85% يُحوّل تلقائياً إلى طابور مراجعة الإدارة قبل تأكيد أي معاملة.'
                : 'Response: Anything uncertain goes to the review queue before it is saved as fact.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
