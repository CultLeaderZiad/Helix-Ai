'use client'

import { useState } from 'react'
import {
  MessageSquare,
  PhoneCall,
  Send,
  Bot,
  User,
  Calendar,
  MapPin,
  ShieldCheck,
  Zap,
  Volume2,
  Clock,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SystemTemplate } from '@/lib/studio/templates'

interface StudioInteractiveSimulatorProps {
  template: SystemTemplate
  brandName: string
  accentColor: string
  isAr?: boolean
}

export function StudioInteractiveSimulator({
  template,
  brandName,
  accentColor,
  isAr = false,
}: StudioInteractiveSimulatorProps) {
  const [messages, setMessages] = useState<
    Array<{ sender: 'user' | 'agent'; text: string; time: string; verifiedFacts?: string[] }>
  >([
    {
      sender: 'agent',
      text: isAr
        ? `أهلاً بك في ${brandName}! أنا المساعد الذكي المعتمد. كيف يمكنني خدمتك اليوم وتأكيد موعدك أو استفسارك؟`
        : `Hello and welcome to ${brandName}! I am your autonomous AI assistant. How may I coordinate your appointment or assist you today?`,
      time: '14:30',
    },
  ])

  const [inputMessage, setInputMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activePreset, setActivePreset] = useState<number | null>(null)

  const PRESETS = isAr
    ? [
        { label: 'حجز موعد أسنان طارئ', text: 'أحتاج حجز موعد عاجل لفحص الأسنان غداً بعد الظهر' },
        { label: 'استفسار عن عطل تكييف', text: 'لدينا عطل طارئ في المكيف في فيلا المرابع العربية' },
        { label: 'سداد دفعة الفاتورة', text: 'هل يمكنني تقسيم الفاتورة وسداد 50% عبر أبل باي الآن؟' },
      ]
    : [
        { label: 'Book VIP Dental Slot', text: 'I need an urgent dental checkup appointment tomorrow afternoon.' },
        { label: 'Emergency AC Repair', text: 'Our central AC unit stopped cooling in Arabian Ranches Villa.' },
        { label: 'Invoice & Installments', text: 'Can I settle 50% of our overdue invoice via Apple Pay right now?' },
      ]

  const handleSend = (overrideText?: string) => {
    const textToSend = overrideText || inputMessage
    if (!textToSend.trim() || isProcessing) return

    const now = new Date()
    const timeStr = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`

    const newMsgs = [
      ...messages,
      { sender: 'user' as const, text: textToSend, time: timeStr },
    ]
    setMessages(newMsgs)
    setInputMessage('')
    setIsProcessing(true)

    // Simulate real AI processing & Fact Extraction
    setTimeout(() => {
      let agentReply = ''
      let facts: string[] = []

      if (template.id === 'booking-receptionist') {
        agentReply = isAr
          ? `تم استلام طلبكم بنجاح! تم حجز موعد مؤكد مع الاستشاري المختص غداً الساعة 3:30 مساءً. تم إرسال تذكرة الموعد ورابط الموقع الجغرافي إلى رقم واتسابكم فوراً.`
          : `Appointment confirmed! We have reserved tomorrow at 3:30 PM with our senior specialist. Your calendar confirmation and direct clinic navigation pin have been dispatched to your WhatsApp.`
        facts = [
          isAr ? 'حقيقة مؤكدة: موعد غداً 3:30 م' : 'Fact: Appointment Tomorrow 3:30 PM',
          isAr ? 'مستخلصة من: طلب العميل المباشر' : 'Source: User Inbound Request',
        ]
      } else if (template.id === 'missed-call-responder') {
        agentReply = isAr
          ? `تم رصد اتصالكم وتوثيق الحالة كطوارئ صيانة. تم تعيين الفني المناوب والتوجه للموقع خلال 30 دقيقة. هل ترغب في تتبع وصول الفني؟`
          : `Inbound emergency logged. On-duty field specialist has been dispatched to your location with an estimated arrival time of 30 minutes.`
        facts = [
          isAr ? 'الحالة: طوارئ صيانة معتمدة' : 'Status: Emergency Dispatch Assigned',
          isAr ? 'الموقع: دبي المرابع العربية' : 'Location: Arabian Ranches Villa',
        ]
      } else {
        agentReply = isAr
          ? `تم استلام استفساركم وتوثيق الإجراء في سجل العمليات. تم إرسال رابط الدفع الإلكتروني المباشر (أبل باي / مدى) إلى تطبيق الواتساب بنجاح.`
          : `Your request has been logged to the operational ledger. A direct payment link supporting Apple Pay & Mada has been generated and dispatched to your WhatsApp.`
        facts = [
          isAr ? 'إجراء: رابط دفع فوري 50%' : 'Action: 50% Split Payment Link',
          isAr ? 'الحالة: مسودة معتمدة' : 'Status: RLS Verified',
        ]
      }

      setMessages([
        ...newMsgs,
        {
          sender: 'agent' as const,
          text: agentReply,
          time: timeStr,
          verifiedFacts: facts,
        },
      ])
      setIsProcessing(false)
    }, 700)
  }

  const resetChat = () => {
    setMessages([
      {
        sender: 'agent',
        text: isAr
          ? `أهلاً بك في ${brandName}! أنا المساعد الذكي المعتمد. كيف يمكنني خدمتك اليوم وتأكيد موعدك أو استفسارك؟`
          : `Hello and welcome to ${brandName}! I am your autonomous AI assistant. How may I coordinate your appointment or assist you today?`,
        time: '14:30',
      },
    ])
    setActivePreset(null)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Interactive Chat Canvas (7 cols) */}
      <div className="lg:col-span-7 flex flex-col rounded-xl border border-border bg-panel shadow-sm overflow-hidden min-h-[460px]">
        {/* Simulator Bar */}
        <div className="flex items-center justify-between border-b border-border bg-raised px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <Bot className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                <span>{brandName} AI Simulator</span>
                <span className="inline-flex items-center gap-1 text-[9px] font-mono text-muted-foreground border border-border bg-panel px-1.5 py-0.5 rounded">
                  <span className="size-1 rounded-full bg-accent" />
                  ONLINE
                </span>
              </h4>
              <p className="text-[10px] text-muted-foreground">
                Official WhatsApp Business Cloud API &amp; Voice Telemetry
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={resetChat}
            className="flex items-center gap-1 rounded-lg border border-border bg-raised px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            title="Reset Simulator"
          >
            <RotateCcw className="size-3" />
            <span className="hidden sm:inline">{isAr ? 'إعادة ضبط' : 'Reset'}</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 space-y-3.5 overflow-y-auto max-h-[340px] bg-panel">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                'flex flex-col max-w-[85%]',
                m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              )}
            >
              <div
                className={cn(
                  'rounded-2xl p-3.5 text-xs leading-relaxed',
                  m.sender === 'user'
                    ? 'bg-accent text-accent-foreground rounded-br-xs'
                    : 'bg-raised border border-border text-foreground rounded-bl-xs'
                )}
              >
                <div className="flex items-center justify-between gap-3 text-[10px] text-muted-foreground mb-1 border-b border-border/40 pb-1">
                  <span className="font-semibold text-foreground/80">
                    {m.sender === 'user' ? (isAr ? 'العميل' : 'Customer') : brandName}
                  </span>
                  <span className="font-mono text-[9px]">{m.time} ✓✓</span>
                </div>
                <p>{m.text}</p>

                {/* Ground Truth Facts Extracted */}
                {m.verifiedFacts && m.verifiedFacts.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-border/60 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-accent font-semibold flex items-center gap-1">
                      <ShieldCheck className="size-3 text-accent" />
                      {isAr ? 'حقائق مستخلصة ومحققة في سجل العمليات' : 'Verified Evidence Extracted:'}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.verifiedFacts.map((fact, fIdx) => (
                        <span
                          key={fIdx}
                          className="rounded bg-panel border border-border px-1.5 py-0.5 text-[9px] font-mono text-foreground"
                        >
                          {fact}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="mr-auto flex items-center gap-2 rounded-xl bg-raised border border-border px-3 py-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-accent animate-pulse" />
              <span className="size-1.5 rounded-full bg-accent animate-pulse delay-100" />
              <span className="size-1.5 rounded-full bg-accent animate-pulse delay-200" />
              <span className="font-mono text-[10px] text-accent ml-1">
                Reasoning &amp; Fact-Checking...
              </span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="border-t border-border bg-raised p-3 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              isAr
                ? 'اكتب رسالة تجريبية لاختبار رد واستجابة الوكيل الذكي...'
                : 'Type a message to simulate live agent response...'
            }
            className="flex-1 rounded-xl border border-border bg-panel px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-hidden"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={isProcessing || !inputMessage.trim()}
            className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Send className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Simulator Control & Telemetry Panel (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Preset Inquiries */}
        <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
            <Zap className="size-3.5 text-accent" />
            <span>{isAr ? 'سيناريوهات اختبار سريعة' : 'Quick Scenario Presets'}</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {isAr
              ? 'اضغط لاختبار استجابة النظام الفورية مع مختلف حالات العملاء.'
              : 'Click a scenario to run the demo script:'}
          </p>
          <div className="space-y-2">
            {PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setActivePreset(idx)
                  handleSend(p.text)
                }}
                className="w-full text-left rounded-xl border border-border bg-raised p-2.5 text-xs hover:border-accent/40 hover:bg-panel transition-colors"
              >
                <div className="font-semibold text-foreground text-[11px] flex items-center justify-between">
                  <span>{p.label}</span>
                  <Zap className="size-3 text-accent" />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 truncate">{p.text}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Live Audio Telemetry Card */}
        <div className="rounded-xl border border-border bg-panel p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Volume2 className="size-3.5 text-accent" />
              <span>{isAr ? 'محاكاة المكالمة الصوتية' : 'Voice Telemetry Simulation'}</span>
            </span>
            <span className="rounded-full border border-border bg-raised text-muted-foreground px-2 py-0.5 text-[9px] font-mono">
              Deepgram Nova-2
            </span>
          </div>

          <div className="rounded-xl border border-border bg-raised p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>{isAr ? 'المتصل: +971 50 892 4102' : 'Caller: +971 50 892 4102'}</span>
              <span>1m 18s • 24kHz HD</span>
            </div>
            {/* Audio Waveform visualization */}
            <div className="flex items-center gap-1 h-6 py-1">
              {[40, 70, 30, 90, 60, 100, 45, 80, 55, 95, 30, 85, 65, 45, 90, 60, 40, 75, 50, 85].map(
                (h, idx) => (
                  <span
                    key={idx}
                    className="flex-1 bg-accent/60 rounded-full"
                    style={{ height: `${h}%` }}
                  />
                )
              )}
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              {isAr
                ? `وكيل ${brandName}: أهلاً بك! تم حجز الموعد وتثبيت بياناتك وسنرسل إشعار الموعد والموقع إلى واتسابك فوراً.`
                : `Agent: Thank you for contacting ${brandName}. Your reservation is confirmed and direct itinerary has been sent to your WhatsApp.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
