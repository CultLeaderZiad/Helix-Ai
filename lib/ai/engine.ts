import type { RegionTier } from '@/lib/schema'

export interface AssessmentInput {
  businessName: string
  contactName: string
  email: string
  phone: string
  vertical: string
  regionTier: RegionTier
  country?: string
  monthlyCallVolume: 'under_100' | '100_500' | '500_2000' | '2000_plus'
  primaryPainPoint:
    | 'missed_calls'
    | 'booking_overhead'
    | 'dormant_leads'
    | 'unpaid_invoices'
    | 'hallucination_compliance'
  language?: 'en' | 'ar'
}

export interface RecommendationResult {
  systemId: 'booking-receptionist' | 'missed-call-responder' | 'lead-reactivation' | 'evidence-console' | 'ar-invoicing'
  systemName: string
  systemNameAr: string
  matchScore: number
  headline: string
  headlineAr: string
  rationale: string
  rationaleAr: string
  estimatedMonthlyRoi: string
  setupFeeCents: number
  monthlyRetainerCents: number
  currency: string
  suggestedSteps: string[]
  suggestedStepsAr: string[]
  whatsappStrategy: string
  whatsappStrategyAr: string
}

const REGIONAL_PRICING: Record<RegionTier, { currency: string; setupMult: number; retainerMult: number }> = {
  gcc_enterprise: { currency: 'AED', setupMult: 1.0, retainerMult: 1.0 },
  mena_sme: { currency: 'USD', setupMult: 0.6, retainerMult: 0.65 },
}

export async function generateEngineRecommendation(
  input: AssessmentInput
): Promise<RecommendationResult> {
  const isAr = input.language === 'ar'
  const pricing = REGIONAL_PRICING[input.regionTier] ?? REGIONAL_PRICING.gcc_enterprise

  // 1. Determine primary system ID based on pain points and volume
  let systemId: RecommendationResult['systemId'] = 'missed-call-responder'
  let baseSetup = 120000
  let baseRetainer = 35000

  if (input.primaryPainPoint === 'booking_overhead') {
    systemId = 'booking-receptionist'
    baseSetup = 150000
    baseRetainer = 45000
  } else if (input.primaryPainPoint === 'dormant_leads') {
    systemId = 'lead-reactivation'
    baseSetup = 200000
    baseRetainer = 60000
  } else if (input.primaryPainPoint === 'hallucination_compliance') {
    systemId = 'evidence-console'
    baseSetup = 250000
    baseRetainer = 75000
  } else if (input.primaryPainPoint === 'unpaid_invoices') {
    systemId = 'ar-invoicing'
    baseSetup = 180000
    baseRetainer = 50000
  } else {
    // missed_calls
    systemId = 'missed-call-responder'
    baseSetup = 120000
    baseRetainer = 35000
  }

  const setupFeeCents = Math.round(baseSetup * pricing.setupMult)
  const monthlyRetainerCents = Math.round(baseRetainer * pricing.retainerMult)

  // 2. Groq Paid-tier AI Recommendation call if API key exists
  const groqApiKey = process.env.GROQ_API_KEY
  if (groqApiKey) {
    try {
      const prompt = `You are the Master AI Systems Architect for Helix AI (a MENA/GCC enterprise agency).
Client context:
- Business: ${input.businessName} (${input.vertical})
- Contact: ${input.contactName}
- Region Tier: ${input.regionTier} (${input.country || 'GCC'})
- Volume: ${input.monthlyCallVolume}
- Core Pain Point: ${input.primaryPainPoint}
- Recommended System: ${systemId}

Output a strictly valid JSON object matching this schema:
{
  "matchScore": number (88-99),
  "headline": string (punchy executive summary),
  "headlineAr": string (Arabic translation),
  "rationale": string (2 sentences on why this architecture solves their specific bottleneck),
  "rationaleAr": string (Arabic translation),
  "estimatedMonthlyRoi": string (e.g. "$14,500/mo in recovered billable appointments"),
  "suggestedSteps": string[] (3 bullet points for rollout),
  "suggestedStepsAr": string[] (Arabic rollout steps),
  "whatsappStrategy": string (WhatsApp-first integration strategy),
  "whatsappStrategyAr": string (Arabic WhatsApp strategy)
}`

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' },
          temperature: 0.3,
        }),
      })

      if (response.ok) {
        const json = await response.json()
        const parsed = JSON.parse(json.choices[0].message.content)
        return {
          systemId,
          systemName: getSystemName(systemId, 'en'),
          systemNameAr: getSystemName(systemId, 'ar'),
          matchScore: parsed.matchScore || 94,
          headline: parsed.headline,
          headlineAr: parsed.headlineAr,
          rationale: parsed.rationale,
          rationaleAr: parsed.rationaleAr,
          estimatedMonthlyRoi: parsed.estimatedMonthlyRoi,
          setupFeeCents,
          monthlyRetainerCents,
          currency: pricing.currency,
          suggestedSteps: parsed.suggestedSteps,
          suggestedStepsAr: parsed.suggestedStepsAr,
          whatsappStrategy: parsed.whatsappStrategy,
          whatsappStrategyAr: parsed.whatsappStrategyAr,
        }
      }
    } catch (err) {
      console.warn('Groq API recommendation failed, falling back to deterministic matrix:', err)
    }
  }

  // Deterministic fallback matrix
  return getDeterministicRecommendation(systemId, input, setupFeeCents, monthlyRetainerCents, pricing.currency)
}

function getSystemName(id: string, lang: 'en' | 'ar'): string {
  const names: Record<string, { en: string; ar: string }> = {
    'booking-receptionist': {
      en: 'Booking receptionist',
      ar: 'موظف الاستقبال والحجوزات',
    },
    'missed-call-responder': {
      en: 'Missed-call triage',
      ar: 'فرز المكالمات الفائتة',
    },
    'lead-reactivation': {
      en: 'Lead reactivation',
      ar: 'إعادة تنشيط العملاء',
    },
    'evidence-console': {
      en: 'Evidence ledger',
      ar: 'سجل الأدلة',
    },
    'ar-invoicing': {
      en: 'AR collections',
      ar: 'تحصيل المستحقات',
    },
  }
  return names[id]?.[lang] ?? id
}

function getDeterministicRecommendation(
  systemId: RecommendationResult['systemId'],
  input: AssessmentInput,
  setupFeeCents: number,
  monthlyRetainerCents: number,
  currency: string
): RecommendationResult {
  const matrix: Record<
    RecommendationResult['systemId'],
    Omit<RecommendationResult, 'systemId' | 'setupFeeCents' | 'monthlyRetainerCents' | 'currency'>
  > = {
    'booking-receptionist': {
      systemName: 'Booking receptionist',
      systemNameAr: 'موظف الاستقبال والحجوزات',
      matchScore: 96,
      headline: `For ${input.businessName}, after-hours and peak overflow drop when voice + WhatsApp book into Cal.com automatically.`,
      headlineAr: `بالنسبة لـ ${input.businessName}، تقل الضياعات خارج الدوام وفي الذروة عندما يحجز الصوت والواتساب في Cal.com تلقائياً.`,
      rationale: `For ${input.businessName}, staff miss bookings when the line is busy. The receptionist answers in Gulf Arabic and English, books a real Cal.com slot, and sends WhatsApp confirmation.`,
      rationaleAr: `بالنسبة لـ ${input.businessName}، يضيع الفريق الحجوزات عند انشغال الخط. يجيب موظف الاستقبال بالخليجية والإنجليزية، يحجز موعد Cal.com حقيقي، ويرسل تأكيد واتساب.`,
      estimatedMonthlyRoi: 'Illustrative only — recovered bookings vs fee, not a live metric',
      suggestedSteps: [
        'Connect Twilio / Retell SIP trunk to existing phone lines',
        'Configure calendar availability & Cal.com webhook integration',
        'Deploy Meta WhatsApp Cloud API confirmation template',
      ],
      suggestedStepsAr: [
        'ربط خط الاتصال الحالي عبر Twilio / Retell SIP',
        'مزامنة جداول الأطباء والمختصين عبر Cal.com',
        'تفعيل قالب إشعارات الواتساب المعتمد من Meta',
      ],
      whatsappStrategy: 'Sends direct calendar links, Google Maps directions, and 2-hour pre-visit reminders via WhatsApp.',
      whatsappStrategyAr: 'إرسال تفاصيل الموعد ورابط الموقع الجغرافي وتذكير تلقائي قبل ساعتين عبر الواتساب.',
    },
    'missed-call-responder': {
      systemName: 'Missed-call triage',
      systemNameAr: 'فرز المكالمات الفائتة',
      matchScore: 98,
      headline: 'WhatsApp in seconds after a missed call. Qualify intent, route the lead.',
      headlineAr: 'واتساب خلال ثوانٍ بعد المكالمة الفائتة. تأهيل النية وتوجيه العميل.',
      rationale: `In ${input.vertical}, callers immediately dial competitors when unanswered. The instant WhatsApp responder captures project details and coordinates technician dispatch automatically.`,
      rationaleAr: `في قطاع ${input.vertical}، يتصل العميل بالمنافسين فوراً عند عدم الرد. يقوم النظام بمراسلته فوراً عبر الواتساب وجمع تفاصيل الطلب والموقع وتعيين فريق العمل.`,
      estimatedMonthlyRoi: 'Illustrative only — rescued leads vs fee, not a live metric',
      suggestedSteps: [
        'Implement telephony missed-call webhook trigger',
        'Deploy interactive WhatsApp triage sequence for qualification',
        'Sync address capture sheet to technician dispatch queue',
      ],
      suggestedStepsAr: [
        'ربط إشعار المكالمات الفائتة عبر webhook',
        'تشغيل محادثة الواتساب التفاعلية لتأهيل العميل',
        'إرسال بيانات الموقع للفرق الميدانية في الوقت الفعلي',
      ],
      whatsappStrategy: 'Immediate 4-second conversational qualification capturing location pin and emergency urgency.',
      whatsappStrategyAr: 'رد خلال 4 ثوانٍ يجمع الموقع الجغرافي وتفاصيل العطل الطارئ فوراً.',
    },
    'lead-reactivation': {
      systemName: 'Lead reactivation',
      systemNameAr: 'إعادة تنشيط العملاء',
      matchScore: 92,
      headline: 'Wake dormant CRM contacts with contextual WhatsApp sequences.',
      headlineAr: 'إيقاظ جهات CRM الخاملة بتسلسل واتساب سياقي.',
      rationale: `Past inquiries in ${input.businessName}'s database remain warm. Automated WhatsApp sequences re-engage legacy contacts with contextual offers and friction-free booking links.`,
      rationaleAr: `جهات الاتصال القديمة لدى ${input.businessName} تمثل فرصة نمو هائلة. تقوم السلسلة الذكية بإعادة تنشيطهم بعروض مخصصة بناءً على طلباتهم السابقة.`,
      estimatedMonthlyRoi: 'Illustrative only — reactivated pipeline vs fee, not a live metric',
      suggestedSteps: [
        'Audit & import legacy CRM contacts into segmented tiers',
        'Configure WhatsApp conversational reactivation sequences',
        'Monitor reply sentiment and route interested leads to sales',
      ],
      suggestedStepsAr: [
        'فرز وتصنيف جهات الاتصال السابقة في CRM',
        'برمجة رسائل الواتساب المخصصة وجدولتها',
        'تحويل الردود الإيجابية لممثلي المبيعات فوراً',
      ],
      whatsappStrategy: 'Conversational 3-touch cadence referencing previous inquiries with 1-click booking reply buttons.',
      whatsappStrategyAr: 'سلسلة من 3 رسائل محادثة مع أزرار رد تفاعلية للحجز الفوري بنقرة واحدة.',
    },
    'evidence-console': {
      systemName: 'Evidence ledger',
      systemNameAr: 'سجل الأدلة',
      matchScore: 95,
      headline: 'Facts verified before CRM writes. Human review for probable claims.',
      headlineAr: 'حقائق تُراجع قبل الكتابة في CRM. مراجعة بشرية للادعاءات المحتملة.',
      rationale: `Enterprises in ${input.vertical} cannot let unverified claims write into CRM. Verified facts may auto-apply; probable and possible wait in the review queue.`,
      rationaleAr: `المؤسسات في قطاع ${input.vertical} لا تسمح بكتابة ادعاءات غير مؤكدة في CRM. الحقائق المؤكدة قد تُطبَّق تلقائياً؛ المحتملة والضعيفة تنتظر المراجعة.`,
      estimatedMonthlyRoi: 'Illustrative only — audit readiness is not a live ROI figure',
      suggestedSteps: [
        'Connect audio transcript and WhatsApp message ingestion pipeline',
        'Configure supervisory approval gates for high-value claims',
        'Enable audit-log / evidence export for reviewed facts',
      ],
      suggestedStepsAr: [
        'ربط تفريغ المكالمات ورسائل الواتساب بنظام التدقيق',
        'تحديد بوابات الاعتماد البشري للقرارات الحساسة',
        'تفعيل سجل التدقيق وتصدير الأدلة للمراجعة',
      ],
      whatsappStrategy: 'Verifies customer promises and claims in WhatsApp transcripts against master contracts.',
      whatsappStrategyAr: 'مطابقة شروط الاتفاقيات الواردة في الواتساب مع العقود الرسمية للمؤسسة.',
    },
    'ar-invoicing': {
      systemName: 'AR collections',
      systemNameAr: 'تحصيل المستحقات',
      matchScore: 94,
      headline: 'Polite WhatsApp follow-ups for commercial invoices. MENA payment links (Tap, Paymob, Moyasar). B2B only.',
      headlineAr: 'متابعات واتساب مهذبة لفواتير الشركات. روابط دفع إقليمية (Tap و Paymob و Moyasar). للشركات فقط.',
      rationale: `Manual collection calls burn staff time. The B2B WhatsApp follow-up sends itemized commercial invoices with Tap, Paymob, or Moyasar payment links — never consumer debt collection.`,
      rationaleAr: `المتابعة اليدوية تستهلك وقت الفريق. متابعة الواتساب للشركات ترسل الفواتير التجارية مع روابط Tap أو Paymob أو Moyasar — وليست تحصيل ديون استهلاكية.`,
      estimatedMonthlyRoi: 'Illustrative only — recovered AR vs fee, not a live metric',
      suggestedSteps: [
        'Sync open accounts receivable ledger to Supabase',
        'Configure polite tiered WhatsApp payment notification schedules',
        'Integrate MENA payment links (Tap / Paymob / Moyasar)',
      ],
      suggestedStepsAr: [
        'مزامنة الفواتير المستحقة مع قاعدة البيانات',
        'جدولة رسائل التذكير التدريجية والمهنية عبر الواتساب',
        'تفعيل روابط الدفع الإقليمية (Tap / Paymob / Moyasar)',
      ],
      whatsappStrategy: 'Itemized invoice PDF dispatch with one-tap payment links and automatic settlement receipts.',
      whatsappStrategyAr: 'إرسال الفاتورة بصيغة PDF مع رابط سداد مباشر وإشعار إلكتروني فوري بالسداد.',
    },
  }

  return {
    systemId,
    setupFeeCents,
    monthlyRetainerCents,
    currency,
    ...matrix[systemId],
  }
}
