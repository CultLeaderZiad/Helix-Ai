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
    | 'competitor_pricing'
    | 'staff_sop_training'
    | 'local_seo_visibility'
    | 'sales_proposal_prep'
    | 'social_video_content'
  language?: 'en' | 'ar'
}

export interface RecommendationResult {
  systemId:
    | 'booking-receptionist'
    | 'missed-call-responder'
    | 'lead-reactivation'
    | 'evidence-console'
    | 'ar-invoicing'
    | 'rival-watch'
    | 'handbook-answers'
    | 'seo-scorecard'
    | 'proposal-deck-factory'
    | 'clip-factory'
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
  } else if (input.primaryPainPoint === 'competitor_pricing') {
    systemId = 'rival-watch'
    baseSetup = 160000
    baseRetainer = 35000
  } else if (input.primaryPainPoint === 'staff_sop_training') {
    systemId = 'handbook-answers'
    baseSetup = 150000
    baseRetainer = 25000
  } else if (input.primaryPainPoint === 'local_seo_visibility') {
    systemId = 'seo-scorecard'
    baseSetup = 140000
    baseRetainer = 30000
  } else if (input.primaryPainPoint === 'sales_proposal_prep') {
    systemId = 'proposal-deck-factory'
    baseSetup = 250000
    baseRetainer = 20000
  } else if (input.primaryPainPoint === 'social_video_content') {
    systemId = 'clip-factory'
    baseSetup = 300000
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
  "matchScore": number (use 0; do not invent a confidence percentage),
  "headline": string (punchy executive summary that does not claim live telemetry),
  "headlineAr": string (Arabic translation),
  "rationale": string (2 sentences on why this architecture solves their specific bottleneck),
  "rationaleAr": string (Arabic translation),
  "estimatedMonthlyRoi": "Not measured",
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
          matchScore: typeof parsed.matchScore === 'number' ? parsed.matchScore : 0,
          headline: parsed.headline,
          headlineAr: parsed.headlineAr,
          rationale: parsed.rationale,
          rationaleAr: parsed.rationaleAr,
          estimatedMonthlyRoi: 'Not measured',
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
      en: 'Saved details',
      ar: 'التفاصيل المحفوظة',
    },
    'ar-invoicing': {
      en: 'AR collections (B2B only)',
      ar: 'تحصيل المستحقات (شركات فقط)',
    },
    'rival-watch': {
      en: 'Rival Watch',
      ar: 'رصد المنافسين',
    },
    'handbook-answers': {
      en: 'Handbook Answers',
      ar: 'إجابات دليل التشغيل',
    },
    'seo-scorecard': {
      en: 'Visibility Scorecard',
      ar: 'بطاقة الظهور المحلي',
    },
    'proposal-deck-factory': {
      en: 'Deck Factory',
      ar: 'مصنع العروض',
    },
    'clip-factory': {
      en: 'Clip Factory',
      ar: 'مصنع المقاطع',
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
      estimatedMonthlyRoi: 'Illustrative only: recovered bookings vs fee, not a live metric',
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
      estimatedMonthlyRoi: 'Illustrative only: rescued leads vs fee, not a live metric',
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
      estimatedMonthlyRoi: 'Illustrative only: reactivated pipeline vs fee, not a live metric',
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
      systemName: 'Saved details',
      systemNameAr: 'التفاصيل المحفوظة',
      matchScore: 95,
      headline: 'Facts verified before CRM writes. Human review for probable claims.',
      headlineAr: 'حقائق تُراجع قبل الكتابة في CRM. مراجعة بشرية للادعاءات المحتملة.',
      rationale: `Enterprises in ${input.vertical} cannot let unverified claims write into CRM. Verified facts may auto-apply; probable and possible wait in the review queue.`,
      rationaleAr: `المؤسسات في قطاع ${input.vertical} لا تسمح بكتابة ادعاءات غير مؤكدة في CRM. الحقائق المؤكدة قد تُطبَّق تلقائياً؛ المحتملة والضعيفة تنتظر المراجعة.`,
      estimatedMonthlyRoi: 'Illustrative only: audit readiness is not a live ROI figure',
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
      systemName: 'AR collections (B2B only)',
      systemNameAr: 'تحصيل المستحقات (شركات فقط)',
      matchScore: 94,
      headline: 'Polite WhatsApp follow-ups for commercial invoices. MENA payment links. B2B only.',
      headlineAr: 'متابعات واتساب مهذبة لفواتير الشركات. روابط دفع إقليمية. للشركات فقط.',
      rationale: `Manual collection calls burn staff time. The B2B WhatsApp follow-up sends itemized commercial invoices with Tap, Paymob, or Moyasar payment links: strictly commercial B2B AR, never consumer debt.`,
      rationaleAr: `المتابعة اليدوية تستهلك وقت الفريق. متابعة الواتساب للشركات ترسل الفواتير التجارية مع روابط سداد إقليمية: مستحقات تجارية فقط.`,
      estimatedMonthlyRoi: 'Illustrative only: recovered AR vs fee, not a live metric',
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
    'rival-watch': {
      systemName: 'Rival Watch',
      systemNameAr: 'رصد المنافسين',
      matchScore: 93,
      headline: 'Automated competitor pricing and stock intelligence alerts on WhatsApp.',
      headlineAr: 'رصد آلي لتحركات أسعار ومخزون المنافسين مع تنبيهات واتساب.',
      rationale: `In ${input.vertical}, pricing shifts happen daily. Rival Watch scrapes competitor public catalogs and alerts your pricing team to market changes via WhatsApp.`,
      rationaleAr: `في قطاع ${input.vertical}، تتغير الأسعار بشكل دوري. يقوم نظام رصد المنافسين بجمع الأسعار العامة وإشعار فريقك بأي تغييرات في السوق.`,
      estimatedMonthlyRoi: 'Illustrative only: margin preservation vs fee',
      suggestedSteps: [
        'Submit list of competitor public storefront URLs',
        'Configure scraping interval & price delta threshold',
        'Set up WhatsApp alert recipient group in n8n',
      ],
      suggestedStepsAr: [
        'تحديد روابط المتاجر والصفحات العامة للمنافسين',
        'ضبط وتيرة الفحص ونسبة التغير المنبهة للأسعار',
        'تفعيل مجموعة إشعارات الواتساب عبر n8n',
      ],
      whatsappStrategy: 'Daily/weekly delta digests sent directly to WhatsApp sales leadership.',
      whatsappStrategyAr: 'ملخص يومي أو أسبوعي بفروقات الأسعار يُرسل لمسؤولي المبيعات عبر الواتساب.',
    },
    'handbook-answers': {
      systemName: 'Handbook Answers',
      systemNameAr: 'إجابات دليل التشغيل',
      matchScore: 91,
      headline: 'Private staff assistant trained strictly on company SOPs and policies.',
      headlineAr: 'مساعد ذكي خاص بالموظفين مدرب على سياسات وإجراءات الشركة بدقة.',
      rationale: `Internal operations staff waste hours searching PDFs for operational guidelines. Handbook Answers provides instant grounded answers with citations.`,
      rationaleAr: `يستهلك فريق التشغيل وقتاً طويلاً في البحث داخل الملفات. يقدم بوت دليل التشغيل إجابات دقيقة وموثقة من لوائح الشركة المعتمدة فوراً.`,
      estimatedMonthlyRoi: 'Illustrative only: internal labor hours saved',
      suggestedSteps: [
        'Upload verified company SOP documents and handbooks',
        'Configure private retrieval-augmented generation vector store',
        'Integrate internal staff WhatsApp or Slack gateway',
      ],
      suggestedStepsAr: [
        'رفع ملفات لوائح وإجراءات العمل المعتمدة',
        'بناء قاعدة المعرفة والبحث الدلالي الخاص بالمؤسسة',
        'تفعيل بوابة وصول الموظفين عبر الواتساب أو سلاك',
      ],
      whatsappStrategy: 'Internal WhatsApp bot providing verified policy answers with page citations.',
      whatsappStrategyAr: 'بوت واتساب داخلي للموظفين يقدم الإجابات المعتمدة مع الإشارة لرقم الصفحة في الدليل.',
    },
    'seo-scorecard': {
      systemName: 'Visibility Scorecard',
      systemNameAr: 'بطاقة الظهور المحلي',
      matchScore: 90,
      headline: 'Monthly local visibility scorecard + top 3 high-impact ranking fixes.',
      headlineAr: 'بطاقة تقييم شهرية للظهور المحلي مع أهم ٣ حلول لتحسين الترتيب.',
      rationale: `Local service businesses lose organic inquiries when Google Business Profile signals decay. Visibility Scorecard identifies missing rank signals automatically.`,
      rationaleAr: `تفقد الشركات المحلية العملاء عند تراجع إشارات خرائط جوجل. تقوم بطاقة الظهور بكشف الفجوات وتحديد أهم 3 تحسينات مطلوبة.`,
      estimatedMonthlyRoi: 'Illustrative only: pipeline door opener',
      suggestedSteps: [
        'Input business location and primary search keywords',
        'Run automated Google Business Profile & local directory audit',
        'Generate monthly white-label scorecard PDF for client delivery',
      ],
      suggestedStepsAr: [
        'إدخال بيانات الموقع الجغرافي والكلمات المفتاحية',
        'تشغيل التدقيق الآلي لملف النشاط التجاري والأدلة المحلية',
        'إصدار تقرير التقييم الشهري بهوية الوكالة للعميل',
      ],
      whatsappStrategy: 'Monthly PDF scorecard delivery via WhatsApp with automated consultation booking link.',
      whatsappStrategyAr: 'إرسال بطاقة التقييم بصيغة PDF عبر الواتساب مع رابط حجز جلسة استشارية.',
    },
    'proposal-deck-factory': {
      systemName: 'Deck Factory',
      systemNameAr: 'مصنع العروض',
      matchScore: 94,
      headline: '8 fields → branded editable PPTX client proposal deck in minutes.',
      headlineAr: '٨ حقول → عرض تقديمي PPTX بهوية العميل جاهز للتعديل خلال دقائق.',
      rationale: `Agency deals stall when proposal creation takes days. Deck Factory generates custom client-ready presentations on the discovery call and advances deal stage.`,
      rationaleAr: `تتعطل الصفقات عندما يتأخر إعداد العروض لأيام. يقوم مصنع العروض بإنشاء عرض مقترح مخصص وقابل للتعديل أثناء المكالمة فوراً.`,
      estimatedMonthlyRoi: 'Illustrative only: sales velocity acceleration',
      suggestedSteps: [
        'Complete the 8-field discovery qualification form',
        'Trigger automated proposal presentation generation',
        'Review customized PPTX slides and auto-update deal stage to Proposal Sent',
      ],
      suggestedStepsAr: [
        'تعبئة نموذج التأهيل المكون من 8 حقول أثناء المكالمة',
        'تشغيل التوليد الآلي للشرائح بهوية العميل والوكالة',
        'مراجعة ملف PPTX وتحديث مرحلة الصفقة تلقائياً إلى "تم إرسال العرض"',
      ],
      whatsappStrategy: 'Sends proposal preview link and meeting agenda directly to prospect WhatsApp.',
      whatsappStrategyAr: 'إرسال رابط معاينة العرض المقترح وجدول الاجتماع للعميل عبر الواتساب.',
    },
    'clip-factory': {
      systemName: 'Clip Factory',
      systemNameAr: 'مصنع المقاطع',
      matchScore: 89,
      headline: 'Long-form webinar or podcast video → 8–10 captioned vertical short clips.',
      headlineAr: 'تحويل الفيديوهات والندوات الطويلة إلى ٨-١٠ مقاطع رأسية مع ترجمة توضيحية.',
      rationale: `Creating short-form video for social distribution requires hours of manual editing. Clip Factory segments long recordings into viral vertical clips automatically.`,
      rationaleAr: `صناعة المقاطع القصيرة تستنزف ساعات من المونتاج اليدوي. يقوم مصنع المقاطع بتقطيع التسجيلات الطويلة إلى مقاطع رأسية مصنفة مع ترجمة نصوص ديناميكية.`,
      estimatedMonthlyRoi: 'Illustrative only: media repurposing speed',
      suggestedSteps: [
        'Provide long-form recording URL (webinar, podcast, or presentation)',
        'Automated AI transcript analysis identifies high-engagement hooks',
        'Export vertical MP4 clips with animated captions for social distribution',
      ],
      suggestedStepsAr: [
        'إدخال رابط التسجيل الطويل (بودكاست، ندوة، أو عرض تقديمي)',
        'تحليل النص واكتشاف اللحظات الأكثر جذباً وتأثيراً',
        'تصدير مقاطع رأسية MP4 مع نصوص ملونة للنشر في المنصات',
      ],
      whatsappStrategy: 'Sends finished clip download zip and approval links to client WhatsApp marketing channel.',
      whatsappStrategyAr: 'إرسال روابط تحميل المقاطع الجاهزة إلى فريق التسويق عبر الواتساب للاعتماد.',
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
