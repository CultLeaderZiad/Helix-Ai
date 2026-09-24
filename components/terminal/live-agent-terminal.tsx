'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import {
  Terminal,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  PhoneCall,
  Calendar,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  MapPin,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type TerminalSystemType = 'system_1' | 'system_2' | 'system_11'

interface TerminalLogLine {
  id: number
  time: string
  tag: 'INBOUND' | 'EGRESS' | 'REASON' | 'DISPATCH' | 'SUPABASE' | 'OK' | 'AUDIT'
  text: string
  highlight?: string
}

interface SystemScriptConfig {
  id: TerminalSystemType
  systemNumber: string
  title: string
  shortLabel: string
  category: string
  targetLatency: string
  lines: TerminalLogLine[]
}

const SYSTEM_SCRIPTS: Record<TerminalSystemType, SystemScriptConfig> = {
  system_1: {
    id: 'system_1',
    systemNumber: '01',
    title: 'Missed-Call WhatsApp Triage & CRM Ingestion',
    shortLabel: '01 · Missed Call Triage',
    category: 'Core Voice & WhatsApp',
    targetLatency: '142ms',
    lines: [
      { id: 1, time: '00:00.012', tag: 'INBOUND', text: 'Telephony webhook received: event="call.missed" channel="Vapi_SIP"' },
      { id: 2, time: '00:00.028', tag: 'AUDIT', text: 'Headers verified: HMAC-SHA256 signature valid · tenant_id="cl_neogen_089"' },
      { id: 3, time: '00:00.045', tag: 'REASON', text: 'Caller identifier parsed: +971 50 *** 4182 · country="AE" · carrier="du"' },
      { id: 4, time: '00:00.061', tag: 'EGRESS', text: 'POST https://n8n.internal.helix/webhook/system-1-missed-call' },
      { id: 5, time: '00:00.082', tag: 'EGRESS', text: 'Payload: idempotency_key="idem_8f9c2d1b" system_type="missed_call_triage"' },
      { id: 6, time: '00:00.099', tag: 'DISPATCH', text: 'Triggering Meta WhatsApp Cloud API v20.0 via authorized template' },
      { id: 7, time: '00:00.118', tag: 'DISPATCH', text: 'Template: "rescue_inbound_ar_en" · lang="ar_AE" · recipient="+971 50 *** 4182"' },
      { id: 8, time: '00:00.134', tag: 'DISPATCH', text: 'Message content: "مرحباً بك في نيوجين داينامكس، لاحظنا اتصالك الآن. كيف يمكننا مساعدتك فوراً؟"' },
      { id: 9, time: '00:00.155', tag: 'INBOUND', text: 'WhatsApp delivery receipt: wamid="wamid.HBgMN...QzMjE" status="DELIVERED"' },
      { id: 10, time: '00:00.180', tag: 'REASON', text: 'Prospect reply received: "أحتاج استشارة طبية بخصوص زراعة الأسنان غداً إذا أمكن"' },
      { id: 11, time: '00:00.210', tag: 'REASON', text: 'Llama-3.3-70b dialect extractor: intent="CONSULTATION_INQUIRY" urgency="HIGH"' },
      { id: 12, time: '00:00.235', tag: 'SUPABASE', text: 'UPSERT INTO public.contacts (phone, intent, deal_stage, tenant_id)' },
      { id: 13, time: '00:00.260', tag: 'SUPABASE', text: 'Committed contact_id="cnt_77b102" · deal_value="AED 3,500" · stage="QUALIFIED"' },
      { id: 14, time: '00:00.285', tag: 'AUDIT', text: 'Evidence recorded to contact_facts: confidence=0.98 status="verified"' },
      { id: 15, time: '00:00.310', tag: 'OK', text: 'Pipeline finished in 298ms · Egress ACK 200 · End of execution' },
    ],
  },
  system_2: {
    id: 'system_2',
    systemNumber: '02',
    title: '24/7 Autonomous Voice Booking & Cal.com Scheduling',
    shortLabel: '02 · Voice Receptionist',
    category: 'Bilingual Voice AI',
    targetLatency: '215ms',
    lines: [
      { id: 1, time: '00:00.015', tag: 'INBOUND', text: 'SIP trunk connect: inbound_caller="+966 55 *** 9210" tenant="cl_aramco_012"' },
      { id: 2, time: '00:00.032', tag: 'AUDIT', text: 'Tenant verified: region_tier="gcc_enterprise" · billing_state="active"' },
      { id: 3, time: '00:00.054', tag: 'REASON', text: 'Retell Voice Engine streaming: Gulf Arabic tokenization active' },
      { id: 4, time: '00:00.078', tag: 'INBOUND', text: 'Caller audio transcript: "أبغى موعد كشفية مع الدكتور طارق يوم الخميس العصر"' },
      { id: 5, time: '00:00.105', tag: 'REASON', text: 'Groq LPU Intent Classifier: action="BOOK_CALENDAR" doctor="Dr. Tariq" target="Thu 15:00"' },
      { id: 6, time: '00:00.128', tag: 'EGRESS', text: 'POST https://api.cal.com/v2/bookings/reserve · slot="2026-09-24T15:00:00Z"' },
      { id: 7, time: '00:00.155', tag: 'EGRESS', text: 'Cal.com reservation response: booking_id="cal_88921" status="ACCEPTED"' },
      { id: 8, time: '00:00.182', tag: 'DISPATCH', text: 'Voice synthesis: "تم تثبيت موعدك يا فهد يوم الخميس الساعة ٣ عصراً. أرسلنا التفاصيل للواتساب."' },
      { id: 9, time: '00:00.210', tag: 'EGRESS', text: 'POST https://n8n.internal.helix/webhook/system-2-booking-dispatch' },
      { id: 10, time: '00:00.238', tag: 'DISPATCH', text: 'WhatsApp automated dispatch: Cal.com ICS calendar invite + Google Maps clinic pin' },
      { id: 11, time: '00:00.265', tag: 'SUPABASE', text: 'INSERT INTO public.deals (client_id, stage, booking_ref, deal_value)' },
      { id: 12, time: '00:00.290', tag: 'SUPABASE', text: 'Committed deal_id="deal_094" stage="DEMO_BOOKED" amount="SAR 1,200"' },
      { id: 13, time: '00:00.315', tag: 'AUDIT', text: 'SHA-256 evidence ledger signed: hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"' },
      { id: 14, time: '00:00.340', tag: 'OK', text: 'Call completed duration=42s · Cal.com synced · WhatsApp delivered [200 OK]' },
    ],
  },
  system_11: {
    id: 'system_11',
    systemNumber: '11',
    title: 'Lead Qualification, Scoring & Real-Time Deal Attribution',
    shortLabel: '11 · Lead Qualification',
    category: 'High-Intent Revenue Engine',
    targetLatency: '88ms',
    lines: [
      { id: 1, time: '00:00.010', tag: 'INBOUND', text: 'Inbound lead webhook from Meta Ads campaign: utm_campaign="gcc_ai_ops_2026"' },
      { id: 2, time: '00:00.022', tag: 'AUDIT', text: 'Tenant match: workspace="Al-Futtaim Tech" tenant_id="cl_alfuttaim_tech"' },
      { id: 3, time: '00:00.038', tag: 'REASON', text: 'Parsing form telemetry: employees="50-200" call_vol="1500/mo" pain="missed_calls"' },
      { id: 4, time: '00:00.052', tag: 'EGRESS', text: 'POST https://n8n.internal.helix/webhook/system-11-lead-qualification' },
      { id: 5, time: '00:00.071', tag: 'REASON', text: 'Rule evaluation: call_volume > 1000 && gcc_enterprise -> Qualified Tier A' },
      { id: 6, time: '00:00.089', tag: 'REASON', text: 'Scoring: intent_score=94/100 · attribution="PAID_META_LEAD" · target_mrr="AED 4,500"' },
      { id: 7, time: '00:00.110', tag: 'SUPABASE', text: 'UPSERT INTO public.clients (status="engaged", funnel_stage="QUALIFIED_TO_BUY")' },
      { id: 8, time: '00:00.130', tag: 'SUPABASE', text: 'INSERT INTO public.deals (client_id, stage="proposal_sent", value=4500)' },
      { id: 9, time: '00:00.152', tag: 'DISPATCH', text: 'Internal alert dispatched to Agency Admin queue via webhook egress' },
      { id: 10, time: '00:00.175', tag: 'DISPATCH', text: 'Automated WhatsApp briefing dispatched to assigned account manager' },
      { id: 11, time: '00:00.198', tag: 'AUDIT', text: 'Attribution key linked: idempotency="idem_meta_lead_448192" committed' },
      { id: 12, time: '00:00.220', tag: 'OK', text: 'Lead scored and enrolled in autonomous sequence · Latency 88ms [200 OK]' },
    ],
  },
}

export function LiveAgentTerminal({
  initialSystem = 'system_1',
  isLive = false,
  brandName,
  compact = false,
  className,
}: {
  initialSystem?: TerminalSystemType
  isLive?: boolean
  brandName?: string
  compact?: boolean
  className?: string
}) {
  const [activeSystem, setActiveSystem] = useState<TerminalSystemType>(initialSystem)
  const [isPlaying, setIsPlaying] = useState<boolean>(true)
  const [visibleLineCount, setVisibleLineCount] = useState<number>(0)
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1)
  const terminalScrollRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = useState<boolean>(true)

  const currentScript = useMemo(() => SYSTEM_SCRIPTS[activeSystem], [activeSystem])

  // Pause when off screen to conserve resources
  useEffect(() => {
    const el = containerRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries
        setIsIntersecting(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Check prefers-reduced-motion
  const prefersReducedMotion = useMemo(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Reset lines when switching system
  useEffect(() => {
    if (prefersReducedMotion) {
      setVisibleLineCount(currentScript.lines.length)
    } else {
      setVisibleLineCount(1)
    }
  }, [activeSystem, currentScript.lines.length, prefersReducedMotion])

  // Line-by-line typewriter progression
  useEffect(() => {
    if (!isPlaying || !isIntersecting || prefersReducedMotion) return

    if (visibleLineCount < currentScript.lines.length) {
      const lineDelay = (speedMultiplier === 2 ? 45 : 85)
      const timer = setTimeout(() => {
        setVisibleLineCount(prev => prev + 1)
      }, lineDelay)
      return () => clearTimeout(timer)
    } else {
      // Pause on finished "OK", then loop after delay
      const loopTimer = setTimeout(() => {
        setVisibleLineCount(1)
      }, 4500)
      return () => clearTimeout(loopTimer)
    }
  }, [isPlaying, isIntersecting, visibleLineCount, currentScript.lines.length, speedMultiplier, prefersReducedMotion])

  // Auto-scroll terminal log
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight
    }
  }, [visibleLineCount])

  const visibleLines = useMemo(
    () => currentScript.lines.slice(0, visibleLineCount),
    [currentScript.lines, visibleLineCount]
  )

  const handleRestart = useCallback(() => {
    setVisibleLineCount(1)
    setIsPlaying(true)
  }, [])

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative w-full rounded-2xl border border-[#D9D4CB] bg-[#0E131F] text-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-left',
        className
      )}
    >
      {/* Top Window Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0A0E17] px-4 py-3">
        {/* Left: Window Dots & Path */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="size-3 rounded-full bg-[#FF5F56] shadow-[0_0_6px_rgba(255,95,86,0.6)]" />
            <span className="size-3 rounded-full bg-[#FFBD2E] shadow-[0_0_6px_rgba(255,189,46,0.6)]" />
            <span className="size-3 rounded-full bg-[#27C93F] shadow-[0_0_6px_rgba(39,201,63,0.6)]" />
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
            <Terminal className="size-3.5 text-slate-400" />
            <span className="text-slate-400">~/helix/live-pipeline/</span>
            <span className="text-emerald-400 font-semibold">{activeSystem}</span>
          </div>
        </div>

        {/* Right: Badge Status & Play Controls */}
        <div className="flex items-center gap-2">
          {/* Honest Demo vs Live Badge */}
          {isLive ? (
            <span
              title="Real-time telemetry event stream from connected production webhooks"
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-300"
            >
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              LIVE STREAM
            </span>
          ) : (
            <span
              title="Deterministic scripted simulation of production n8n & telephony pipeline. Demo is not live."
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300"
            >
              <span className="size-1.5 rounded-full bg-amber-400" />
              DEMO SCRIPT
            </span>
          )}

          {/* Speed Toggle */}
          <button
            type="button"
            onClick={() => setSpeedMultiplier(s => (s === 1 ? 2 : 1))}
            className="rounded-md border border-slate-800 bg-slate-900/80 px-2 py-0.5 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
            title="Toggle playback speed"
          >
            {speedMultiplier}x
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={() => setIsPlaying(p => !p)}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-1 text-slate-300 hover:text-white transition-colors"
            title={isPlaying ? 'Pause simulation' : 'Resume simulation'}
          >
            {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          </button>

          {/* Restart */}
          <button
            type="button"
            onClick={handleRestart}
            className="rounded-md border border-slate-800 bg-slate-900/80 p-1 text-slate-300 hover:text-white transition-colors"
            title="Restart simulation"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* System Selector Subnav Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 bg-[#0B0F19] px-4 py-2 overflow-x-auto text-xs">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider hidden sm:inline">
          System:
        </span>
        {(['system_1', 'system_2', 'system_11'] as const).map(sysKey => {
          const sys = SYSTEM_SCRIPTS[sysKey]
          const isSelected = activeSystem === sysKey
          return (
            <button
              key={sysKey}
              type="button"
              onClick={() => setActiveSystem(sysKey)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-mono transition-all whitespace-nowrap',
                isSelected
                  ? 'border border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-300 shadow-xs'
                  : 'border border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              )}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  isSelected ? 'bg-emerald-400' : 'bg-slate-600'
                )}
              />
              {sys.shortLabel}
            </button>
          )
        })}

        <div className="ml-auto hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-400">
          <Clock className="size-3 text-slate-500" />
          <span>E2E Latency: {currentScript.targetLatency}</span>
        </div>
      </div>

      {/* Main Grid: Left is Streaming Terminal Log, Right is Synchronized Side Mock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[360px]">
        {/* Left: Terminal Log Stream */}
        <div
          ref={terminalScrollRef}
          className="lg:col-span-7 flex flex-col justify-start p-4 font-mono text-xs overflow-y-auto max-h-[460px] scrollbar-thin scrollbar-thumb-slate-800"
        >
          <div className="space-y-1 text-[11px] leading-relaxed">
            {visibleLines.map(line => (
              <div
                key={line.id}
                className={cn(
                  'flex items-start gap-2 py-0.5 rounded transition-colors',
                  line.tag === 'OK' && 'bg-emerald-500/10 text-emerald-300 px-2 font-semibold border border-emerald-500/30'
                )}
              >
                <span className="shrink-0 text-slate-600 select-none">
                  {line.id < 10 ? `0${line.id}` : line.id}
                </span>
                <span className="shrink-0 text-slate-500 text-[10px]">[{line.time}]</span>

                {/* Tag Badge */}
                <span
                  className={cn(
                    'shrink-0 rounded px-1.5 py-0.2 text-[9px] font-bold tracking-wide uppercase',
                    line.tag === 'INBOUND' && 'bg-sky-500/20 text-sky-300 border border-sky-500/30',
                    line.tag === 'EGRESS' && 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
                    line.tag === 'REASON' && 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
                    line.tag === 'DISPATCH' && 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
                    line.tag === 'SUPABASE' && 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30',
                    line.tag === 'AUDIT' && 'bg-slate-700/50 text-slate-300 border border-slate-600',
                    line.tag === 'OK' && 'bg-emerald-500 text-slate-950 font-extrabold'
                  )}
                >
                  {line.tag}
                </span>

                {/* Line text */}
                <span
                  className={cn(
                    'break-all leading-snug',
                    line.tag === 'OK' ? 'text-emerald-300 font-bold' : 'text-slate-300'
                  )}
                >
                  {line.text}
                </span>
              </div>
            ))}

            {visibleLineCount < currentScript.lines.length && isPlaying && (
              <div className="flex items-center gap-2 text-slate-500 pt-1 pl-6">
                <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-slate-400 italic">Streaming next pipeline execution frame...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Side Mock (Real Product Proof: WhatsApp / Cal.com / CRM) */}
        <div className="lg:col-span-5 border-t lg:border-t-0 lg:border-l border-slate-800 bg-[#090D16] p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Sparkles className="size-3 text-emerald-400" />
                Live Side Telemetry Mock
              </span>
              <span className="rounded bg-slate-800 px-2 py-0.5 text-[9px] font-mono text-slate-400">
                {currentScript.category}
              </span>
            </div>

            {/* System 1 Mock: WhatsApp Thread */}
            {activeSystem === 'system_1' && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-emerald-500/25 bg-[#0A1815] p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-b border-emerald-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="size-3.5" />
                      Instant WhatsApp Itinerary
                    </span>
                    <span className="text-[9px] font-mono text-emerald-300/80">Delivered in 155ms</span>
                  </div>

                  <div className="rounded-lg bg-[#0F2620] p-2.5 text-[11px] text-slate-200 space-y-1 border border-emerald-500/20">
                    <p className="font-bold text-white">
                      {brandName || 'Neogen Dynamics'} // Reception
                    </p>
                    <p className="text-slate-300 leading-relaxed text-[10.5px]">
                      &ldquo;مرحباً بك، لاحظنا اتصالك الآن دون رد نظراً لضغط الخطوط. تم فتح تذكرة خاصة بك مباشرة، كيف يمكن لمكتب الاستقبال خدمتك؟&rdquo;
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-900/90 p-2.5 text-[11px] text-slate-200 border border-slate-800">
                    <span className="text-[9px] font-mono text-slate-400 uppercase">Prospect Reply</span>
                    <p className="mt-0.5 text-white font-medium text-[10.5px]">
                      &ldquo;أحتاج استشارة طبية بخصوص زراعة الأسنان غداً إذا أمكن&rdquo;
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                    <span className="text-emerald-400 font-semibold">✓✓ Qualified via Llama 3.3</span>
                    <span>Stage: Proposal Ready</span>
                  </div>
                </div>
              </div>
            )}

            {/* System 2 Mock: Cal.com Booking Card */}
            {activeSystem === 'system_2' && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-emerald-500/30 bg-[#0A1815] p-3.5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold border-b border-emerald-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Cal.com Confirmed Slot
                    </span>
                    <span className="rounded bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-mono text-emerald-300">
                      ID: cal_88921
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Consultation Appointment</div>
                    <div className="text-sm font-bold text-white mt-0.5">Dr. Tariq Al-Mansoor</div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                      <Clock className="size-3 text-emerald-400" />
                      <span>Thursday, Sept 24 • 3:00 PM (GST)</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-300">
                      <MapPin className="size-3 text-emerald-400" />
                      <span>Abu Dhabi Specialty Branch</span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-emerald-950/40 border border-emerald-500/20 p-2 text-[10px] font-mono text-emerald-300 flex items-center justify-between">
                    <span>Retell Voice Latency</span>
                    <span className="font-bold">215ms (Gulf Dialect)</span>
                  </div>
                </div>
              </div>
            )}

            {/* System 11 Mock: Qualified Deal in CRM */}
            {activeSystem === 'system_11' && (
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-indigo-500/30 bg-[#0E1528] p-3.5 text-xs space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-indigo-300 font-semibold border-b border-indigo-500/20 pb-1.5">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-sky-400" />
                      Attributed CRM Deal
                    </span>
                    <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">
                      Tier A Lead
                    </span>
                  </div>

                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Account Qualified</div>
                    <div className="text-sm font-bold text-white mt-0.5">Al-Futtaim Tech Operations</div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                        <div className="text-slate-400">Target MRR</div>
                        <div className="text-emerald-400 font-bold text-xs mt-0.5">AED 4,500/mo</div>
                      </div>
                      <div className="rounded bg-slate-900 p-1.5 border border-slate-800">
                        <div className="text-slate-400">Intent Score</div>
                        <div className="text-white font-bold text-xs mt-0.5">94 / 100</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 text-[10.5px] text-slate-400 leading-snug">
                    <span className="text-indigo-300 font-semibold">Attribution Route:</span> Meta Ads → n8n Egress → Supabase Isolated Tenant Schema.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Mock Honest Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800 text-[10.5px] text-slate-400 flex items-center justify-between">
            <span className="text-slate-500">
              {isLive ? 'Connected to live n8n callback' : 'Deterministic sample execution'}
            </span>
            <a
              href="/dashboard/studio"
              className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Open Studio &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
