import { getSystemTemplate, type SystemTemplate } from '@/lib/studio/templates'

export interface SystemGuide {
  id: string
  who: string
  whoAr: string
  what: string
  whatAr: string
  steps: string[]
  stepsAr: string[]
}

const GUIDES: Record<string, SystemGuide> = {
  'booking-receptionist': {
    id: 'booking-receptionist',
    who: 'Clinics, salons, and teams that lose bookings after hours.',
    whoAr: 'العيادات والمراكز التي تضيع الحجوزات خارج الدوام.',
    what: 'A bilingual voice + WhatsApp receptionist that books real Cal.com slots and sends confirmation. It never invents availability.',
    whatAr: 'موظف استقبال صوتي وواتساب ثنائي اللغة يحجز مواعيد Cal.com الحقيقية ويرسل تأكيداً. لا يخترع أوقاتاً فارغة.',
    steps: [
      'Connect the phone number and Cal.com availability.',
      'Approve the WhatsApp confirmation template.',
      'Try the demo script, then request a production build.',
    ],
    stepsAr: [
      'اربط رقم الهاتف ومواعيد Cal.com.',
      'اعتمد قالب تأكيد الواتساب.',
      'جرّب العرض ثم اطلب بناء الإنتاج.',
    ],
  },
  'missed-call-responder': {
    id: 'missed-call-responder',
    who: 'Contractors and services that miss inbound calls during jobs.',
    whoAr: 'المقاولون والخدمات التي تفوت المكالمات أثناء العمل.',
    what: 'A WhatsApp reply in seconds after a missed call, qualifying intent and routing the lead.',
    whatAr: 'رد واتساب خلال ثوانٍ بعد المكالمة الفائتة لتأهيل النية وتوجيه العميل.',
    steps: [
      'Connect missed-call webhooks from telephony.',
      'Set routing rules for sales vs operations.',
      'Try demo, then request build.',
    ],
    stepsAr: [
      'اربط إشعار المكالمات الفائتة.',
      'حدد توجيه المبيعات مقابل التشغيل.',
      'جرّب العرض ثم اطلب البناء.',
    ],
  },
  'lead-reactivation': {
    id: 'lead-reactivation',
    who: 'Teams sitting on paid-for CRM lists that went quiet.',
    whoAr: 'فرق لديها قوائم CRM مدفوعة أصبحت خاملة.',
    what: 'Contextual WhatsApp sequences for dormant contacts with opt-in and stop-word respect.',
    whatAr: 'تسلسل واتساب سياقي للجهات الخاملة مع احترام الموافقة وكلمات الإيقاف.',
    steps: [
      'Import opted-in dormant contacts.',
      'Approve sequence copy in Gulf Arabic and English.',
      'Monitor replies and book or qualify.',
    ],
    stepsAr: [
      'استورد الجهات الخاملة بموافقة تسويقية.',
      'اعتمد نص التسلسل بالخليجية والإنجليزية.',
      'راقب الردود ثم احجز أو أهّل.',
    ],
  },
  'handbook-answers': {
    id: 'handbook-answers',
    who: 'Staff who need SOP answers without replacing the customer-facing core.',
    whoAr: 'موظفون يحتاجون إجابات إجراءات دون استبدال الأنظمة الأساسية.',
    what: 'Preview add-on: a private handbook bot. It does not replace voice or WhatsApp core systems.',
    whatAr: 'إضافة معاينة: بوت داخلي للدليل. لا يستبدل أنظمة الصوت أو الواتساب.',
    steps: [
      'Upload staff SOPs when the add-on is live.',
      'Keep customer channels on core systems.',
      'Request build if you want this lane scoped.',
    ],
    stepsAr: [
      'ارفع إجراءات الموظفين عند تفعيل الإضافة.',
      'أبقِ قنوات العملاء على الأنظمة الأساسية.',
      'اطلب البناء إذا رغبت في تحديد النطاق.',
    ],
  },
  'proposal-deck-factory': {
    id: 'proposal-deck-factory',
    who: 'Sales calls that need a branded deck before the hour ends.',
    whoAr: 'مكالمات مبيعات تحتاج عرضاً بهويتكم قبل نهاية الساعة.',
    what: 'Preview add-on: eight fields become a branded PPTX and can move the deal to Proposal sent.',
    whatAr: 'إضافة معاينة: ثمانية حقول تتحول إلى PPTX بهويتكم ويمكنها نقل الصفقة إلى إرسال العرض.',
    steps: [
      'Capture the eight commercial fields on the call.',
      'Generate the deck preview.',
      'Request build to wire it to live deals.',
    ],
    stepsAr: [
      'التقط الحقول التجارية الثمانية أثناء المكالمة.',
      'ولّد معاينة العرض.',
      'اطلب البناء لربطه بالصفقات الحية.',
    ],
  },
  'ar-invoicing': {
    id: 'ar-invoicing',
    who: 'B2B teams collecting commercial invoices — never consumer debt.',
    whoAr: 'فرق الشركات التي تحصّل فواتير تجارية — ليست ديون المستهلك.',
    what: 'Polite WhatsApp follow-ups with MENA payment links (Tap, Paymob, Moyasar).',
    whatAr: 'متابعات واتساب مهذبة مع روابط دفع إقليمية (Tap و Paymob و Moyasar).',
    steps: [
      'Sync open commercial invoices only.',
      'Choose Tap, Paymob, or Moyasar per market.',
      'Escalate to a human on dispute or hardship.',
    ],
    stepsAr: [
      'زامن الفواتير التجارية المستحقة فقط.',
      'اختر Tap أو Paymob أو Moyasar حسب السوق.',
      'صعّد لموظف عند النزاع أو التعثر.',
    ],
  },
  'evidence-console': {
    id: 'evidence-console',
    who: 'Operators who cannot let unverified claims write into CRM.',
    whoAr: 'مشغّلون لا يسمحون بكتابة ادعاءات غير مؤكدة في CRM.',
    what: 'Verified facts may auto-apply. Probable and possible wait in the human review queue.',
    whatAr: 'الحقائق المؤكدة قد تُطبَّق تلقائياً. المحتملة والضعيفة تنتظر المراجعة البشرية.',
    steps: [
      'Connect transcripts and WhatsApp threads.',
      'Review the facts queue.',
      'Export an audit log when you need evidence.',
    ],
    stepsAr: [
      'اربط التفريغ ومحادثات الواتساب.',
      'راجع طابور الحقائق.',
      'صدّر سجل تدقيق عند الحاجة.',
    ],
  },
  'lead-attribution': {
    id: 'lead-attribution',
    who: 'Teams spending on ads who need outcome truth, not vanity ROAS.',
    whoAr: 'فرق تنفق على الإعلانات وتحتاج حقيقة النتائج لا أرقاماً تجميلية.',
    what: 'Joins ad source to qualified leads and bookings. Numbers only appear when events exist.',
    whatAr: 'يربط مصدر الإعلان بالعملاء المؤهلين والحجوزات. الأرقام تظهر فقط عند وجود أحداث.',
    steps: [
      'Pass UTM and campaign ids on capture.',
      'Score hot / warm / cold with a human override.',
      'Join spend to won deals when ads are connected.',
    ],
    stepsAr: [
      'مرّر UTM ومعرّف الحملة عند الالتقاط.',
      'صنّف ساخن / دافئ / بارد مع تجاوز بشري.',
      'اربط الإنفاق بالصفقات عند توصيل الإعلانات.',
    ],
  },
}

export function getSystemGuide(id: string, template?: SystemTemplate): SystemGuide {
  if (GUIDES[id]) return GUIDES[id]
  const name = template?.en.name ?? id
  return {
    id,
    who: `Teams evaluating ${name}.`,
    whoAr: `فرق تقيّم ${template?.ar.name ?? id}.`,
    what: template?.en.description ?? 'Helix system guide.',
    whatAr: template?.ar.description ?? 'دليل نظام هليكس.',
    steps: ['Open the demo.', 'Read the outcome.', 'Request a build if it fits.'],
    stepsAr: ['افتح العرض.', 'اقرأ النتيجة.', 'اطلب البناء إذا ناسبكم.'],
  }
}
