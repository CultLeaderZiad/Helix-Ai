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
      en: 'Autonomous Booking Receptionist & Cal.com Scheduler',
      ar: 'موظف الاستقبال الصوتي والحجوزات الذكي',
    },
    'missed-call-responder': {
      en: 'Missed-Call WhatsApp Instant Triage Engine',
      ar: 'الرد الفوري وتأهيل العملاء عبر الواتساب للمكالمات الفائتة',
    },
    'lead-reactivation': {
      en: 'WhatsApp CRM Reactivation & Campaign Engine',
      ar: 'محرك تنشيط العملاء السابقين عبر الواتساب',
    },
    'evidence-console': {
      en: 'Executive Evidence & Cryptographic Fact Ledger',
      ar: 'لوحة الرقابة التنفيذية وسجل تدقيق الحقائق',
    },
    'ar-invoicing': {
      en: 'Automated WhatsApp A/R Invoicing & Payment Collector',
      ar: 'تحصيل الفواتير والمستحقات آلياً عبر الواتساب',
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
      systemName: 'Autonomous Booking Receptionist & Cal.com Scheduler',
      systemNameAr: 'موظف الاستقبال الصوتي والحجوزات الذكي',
      matchScore: 96,
      headline: 'Eliminate reception bottlenecks with 24/7 bilingual booking automation',
      headlineAr: 'القضاء التام على ضغط الاستقبال عبر أتمتة الحجوزات الثنائية طوال 24 ساعة',
      rationale: `For ${input.businessName}, manual scheduling creates dropped calls during peak hours. Our voice agent answers in < 400ms, reserves the appointment, and dispatches an instant WhatsApp itinerary.`,
      rationaleAr: `بالنسبة لـ ${input.businessName}، يؤدي الحجز اليدوي إلى ضياع استفسارات المرضى والعملاء خلال أوقات الذروة. يجيب وكيلنا في 400 ميلي ثانية ويثبت الموعد ويرسل تأكيد الواتساب فوراً.`,
      estimatedMonthlyRoi: '$12,800/mo in recovered billable appointments',
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
      systemName: 'Missed-Call WhatsApp Instant Triage Engine',
      systemNameAr: 'الرد الفوري وتأهيل العملاء عبر الواتساب للمكالمات الفائتة',
      matchScore: 98,
      headline: 'Rescue every missed call within 4 seconds via automated WhatsApp triage',
      headlineAr: 'استرداد كل مكالمة فائتة خلال 4 ثوانٍ عبر محادثة واتساب ذكية',
      rationale: `In ${input.vertical}, callers immediately dial competitors when unanswered. The instant WhatsApp responder captures project details and coordinates technician dispatch automatically.`,
      rationaleAr: `في قطاع ${input.vertical}، يتصل العميل بالمنافسين فوراً عند عدم الرد. يقوم النظام بمراسلته فوراً عبر الواتساب وجمع تفاصيل الطلب والموقع وتعيين فريق العمل.`,
      estimatedMonthlyRoi: '$18,400/mo in saved emergency service jobs',
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
      systemName: 'WhatsApp CRM Reactivation & Campaign Engine',
      systemNameAr: 'محرك تنشيط العملاء السابقين عبر الواتساب',
      matchScore: 92,
      headline: 'Unlock dormant pipeline value without spending an extra dollar on ads',
      headlineAr: 'إعادة إحياء العملاء القدامى دون إنفاق أي درهم إضافي على الإعلانات',
      rationale: `Past inquiries in ${input.businessName}'s database remain warm. Automated WhatsApp sequences re-engage legacy contacts with contextual offers and friction-free booking links.`,
      rationaleAr: `جهات الاتصال القديمة لدى ${input.businessName} تمثل فرصة نمو هائلة. تقوم السلسلة الذكية بإعادة تنشيطهم بعروض مخصصة بناءً على طلباتهم السابقة.`,
      estimatedMonthlyRoi: '$24,000/mo in re-engaged contracts',
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
      systemName: 'Executive Evidence & Cryptographic Fact Ledger',
      systemNameAr: 'لوحة الرقابة التنفيذية وسجل تدقيق الحقائق',
      matchScore: 95,
      headline: 'Zero hallucinations and complete regulatory compliance for voice and chat agents',
      headlineAr: 'صفر أخطاء أو هلوسات مع امتثال قانوني وتنظيمي كامل للمحادثات الصوتية والمكتوبة',
      rationale: `Enterprises in ${input.vertical} cannot tolerate inaccurate commitments. Our evidence engine subjects every extracted claim to cryptographic multi-band verification before state modification.`,
      rationaleAr: `المؤسسات في قطاع ${input.vertical} لا تحتمل الوعود غير الدقيقة. يقوم النظام بتدقيق كل معلومة وتصنيفها بدقة تامة قبل تعديل أي سجلات رسمية.`,
      estimatedMonthlyRoi: '100% audit readiness and zero regulatory risk',
      suggestedSteps: [
        'Connect audio transcript and WhatsApp message ingestion pipeline',
        'Configure supervisory approval gates for high-value claims',
        'Enable SHA-256 tamper-proof ledger audit export',
      ],
      suggestedStepsAr: [
        'ربط تفريغ المكالمات ورسائل الواتساب بنظام التدقيق',
        'تحديد بوابات الاعتماد البشري للقرارات الحساسة',
        'تفعيل سجل التدقيق المشفر والمحمي بـ SHA-256',
      ],
      whatsappStrategy: 'Verifies customer promises and claims in WhatsApp transcripts against master contracts.',
      whatsappStrategyAr: 'مطابقة شروط الاتفاقيات الواردة في الواتساب مع العقود الرسمية للمؤسسة.',
    },
    'ar-invoicing': {
      systemName: 'Automated WhatsApp A/R Invoicing & Payment Collector',
      systemNameAr: 'تحصيل الفواتير والمستحقات آلياً عبر الواتساب',
      matchScore: 94,
      headline: 'Accelerate DSO by 16 days with polite, automated WhatsApp payment links',
      headlineAr: 'تسريع دورة التحصيل بـ 16 يوماً عبر تذكيرات الواتساب وروابط الدفع السريعة',
      rationale: `Manual collection calls alienate clients. Our automated WhatsApp A/R agent provides itemized statements, payment plan options, and instant Apple Pay/Mada checkout links.`,
      rationaleAr: `المتابعة الهاتفية اليدوية تستهلك وقت المحاسبين. يرسل وكيل الواتساب الفواتير التفصيلية وروابط الدفع المباشرة مع خيارات الجدولة الميسرة.`,
      estimatedMonthlyRoi: '$32,000/mo in faster cash recovery & DSO drop',
      suggestedSteps: [
        'Sync open accounts receivable ledger to Supabase',
        'Configure polite tiered WhatsApp payment notification schedules',
        'Integrate localized payment gateway (Mada / Apple Pay / Tabby)',
      ],
      suggestedStepsAr: [
        'مزامنة الفواتير المستحقة مع قاعدة البيانات',
        'جدولة رسائل التذكير التدريجية والمهنية عبر الواتساب',
        'تفعيل بوابات الدفع الإلكترونية السريعة (مدى، آبل باي، تابي)',
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
