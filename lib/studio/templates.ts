export type SystemLane = 'core' | 'preview'
export type SystemHighlight = 'most_booked' | 'highest_roi' | 'b2b_only'

export interface LocalizedContent {
  name: string
  category: string
  vertical: string
  tagline: string
  description: string
  metrics: { label: string; value: string; trend?: string }[]
  simulatedViews: string[]
  badge?: string
}

export interface SystemTemplate {
  id: string
  lane: SystemLane
  highlight?: SystemHighlight
  setupFeeCents: number
  monthlyRetainerCents: number
  pricePrefix?: 'from'
  badge?: string
  en: LocalizedContent
  ar: LocalizedContent
  name: string
  category: string
  vertical: string
  tagline: string
  description: string
  metrics: { label: string; value: string; trend?: string }[]
  simulatedViews: string[]
}

function localize(
  base: Omit<SystemTemplate, 'name' | 'category' | 'vertical' | 'tagline' | 'description' | 'metrics' | 'simulatedViews'>
): SystemTemplate {
  return {
    ...base,
    get name() {
      return this.en.name
    },
    get category() {
      return this.en.category
    },
    get vertical() {
      return this.en.vertical
    },
    get tagline() {
      return this.en.tagline
    },
    get description() {
      return this.en.description
    },
    get metrics() {
      return this.en.metrics
    },
    get simulatedViews() {
      return this.en.simulatedViews
    },
  }
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  localize({
    id: 'booking-receptionist',
    lane: 'core',
    highlight: 'most_booked',
    setupFeeCents: 150000,
    monthlyRetainerCents: 45000,
    badge: 'Most booked',
    en: {
      name: 'Booking receptionist',
      category: 'Voice & WhatsApp',
      vertical: 'Clinics, salons, high-ticket services, real estate',
      tagline: 'Answers in Gulf Arabic & English, books Cal.com, sends WhatsApp confirmation.',
      description:
        'Answers in Gulf Arabic & English, books Cal.com, sends WhatsApp confirmation.',
      badge: 'Most booked',
      metrics: [
        { label: 'Bookings confirmed', value: 'Sample demo', trend: 'Demo script' },
        { label: 'WhatsApp itineraries', value: 'Sent on confirm', trend: 'Live when connected' },
        { label: 'After-hours coverage', value: 'Voice + WA', trend: 'Cal.com slots only' },
      ],
      simulatedViews: ['WhatsApp confirmation', 'Calendar grid', 'Call transcript'],
    },
    ar: {
      name: 'موظف الاستقبال والحجوزات',
      category: 'الصوت والواتساب',
      vertical: 'العيادات، مراكز التجميل، العقارات، والخدمات الراقية',
      tagline: 'يجيب بالخليجية والإنجليزية، يحجز عبر Cal.com، ويرسل تأكيد واتساب.',
      description: 'يجيب بالخليجية والإنجليزية، يحجز عبر Cal.com، ويرسل تأكيد واتساب.',
      badge: 'الأكثر طلباً',
      metrics: [
        { label: 'حجوزات مؤكدة', value: 'عرض تجريبي', trend: 'سيناريو توضيحي' },
        { label: 'تأكيدات الواتساب', value: 'عند التثبيت', trend: 'حي بعد الربط' },
        { label: 'تغطية خارج الدوام', value: 'صوت + واتساب', trend: 'مواعيد Cal.com فقط' },
      ],
      simulatedViews: ['تأكيد الواتساب', 'جدول المواعيد', 'نص المكالمة'],
    },
  }),
  localize({
    id: 'missed-call-responder',
    lane: 'core',
    setupFeeCents: 120000,
    monthlyRetainerCents: 35000,
    en: {
      name: 'Missed-call triage',
      category: 'WhatsApp',
      vertical: 'Contractors, maintenance, home services, legal & auto',
      tagline: 'WhatsApp in seconds after a missed call. Qualify intent, route the lead.',
      description: 'WhatsApp in seconds after a missed call. Qualify intent, route the lead.',
      metrics: [
        { label: 'Missed calls rescued', value: 'Sample demo', trend: 'Demo script' },
        { label: 'WhatsApp response', value: 'Seconds', trend: 'Live when connected' },
        { label: 'Leads routed', value: 'Sales / ops', trend: 'Human handoff available' },
      ],
      simulatedViews: ['WhatsApp thread', 'Dispatch queue', 'Lead sheet'],
    },
    ar: {
      name: 'فرز المكالمات الفائتة',
      category: 'واتساب',
      vertical: 'المقاولات، الصيانة، الخدمات القانونية والسيارات',
      tagline: 'واتساب خلال ثوانٍ بعد المكالمة الفائتة. تأهيل النية وتوجيه العميل.',
      description: 'واتساب خلال ثوانٍ بعد المكالمة الفائتة. تأهيل النية وتوجيه العميل.',
      metrics: [
        { label: 'مكالمات أُنقذت', value: 'عرض تجريبي', trend: 'سيناريو توضيحي' },
        { label: 'رد الواتساب', value: 'ثوانٍ', trend: 'حي بعد الربط' },
        { label: 'توجيه العملاء', value: 'مبيعات / تشغيل', trend: 'تحويل بشري متاح' },
      ],
      simulatedViews: ['محادثة الواتساب', 'طابور المهام', 'ورقة العميل'],
    },
  }),
  localize({
    id: 'lead-reactivation',
    lane: 'core',
    highlight: 'highest_roi',
    setupFeeCents: 200000,
    monthlyRetainerCents: 60000,
    badge: 'Highest ROI',
    en: {
      name: 'Lead reactivation',
      category: 'Pipeline',
      vertical: 'Real estate, B2B services, clinics, high-value retail',
      tagline: 'Wake dormant CRM contacts with contextual WhatsApp sequences.',
      description: 'Wake dormant CRM contacts with contextual WhatsApp sequences.',
      badge: 'Highest ROI',
      metrics: [
        { label: 'Dormant contacts', value: 'Your CRM', trend: 'Opt-in only' },
        { label: 'Replies rescued', value: 'Sample demo', trend: 'Demo script' },
        { label: 'Stop words honored', value: 'إيقاف / stop', trend: 'Required' },
      ],
      simulatedViews: ['WhatsApp sequence', 'Reactivation pipeline', 'Reply classifier'],
    },
    ar: {
      name: 'إعادة تنشيط العملاء',
      category: 'خط الأنابيب',
      vertical: 'العقارات، خدمات الأعمال، العيادات، والتجزئة الراقية',
      tagline: 'إيقاظ جهات CRM الخاملة بتسلسل واتساب سياقي.',
      description: 'إيقاظ جهات CRM الخاملة بتسلسل واتساب سياقي.',
      badge: 'أعلى عائد',
      metrics: [
        { label: 'جهات خاملة', value: 'من CRM', trend: 'بموافقة تسويقية فقط' },
        { label: 'ردود مستعادة', value: 'عرض تجريبي', trend: 'سيناريو توضيحي' },
        { label: 'كلمات الإيقاف', value: 'إيقاف / stop', trend: 'إلزامي' },
      ],
      simulatedViews: ['تسلسل الواتساب', 'خط التنشيط', 'تصنيف الردود'],
    },
  }),
  localize({
    id: 'handbook-answers',
    lane: 'preview',
    setupFeeCents: 150000,
    monthlyRetainerCents: 25000,
    pricePrefix: 'from',
    en: {
      name: 'Handbook',
      category: 'Add-on',
      vertical: 'Ops teams, clinics, field services',
      tagline: 'Private SOP bot for staff. Add-on — does not replace voice/WA core.',
      description: 'Private SOP bot for staff. Add-on — does not replace voice/WA core.',
      metrics: [
        { label: 'Audience', value: 'Staff only', trend: 'Not customer-facing' },
        { label: 'Source', value: 'Your SOPs', trend: 'Preview UI' },
        { label: 'Core systems', value: 'Unchanged', trend: 'Add-on lane' },
      ],
      simulatedViews: ['SOP search', 'Staff answer card', 'Handoff note'],
    },
    ar: {
      name: 'دليل التشغيل',
      category: 'إضافة',
      vertical: 'فرق التشغيل، العيادات، الخدمات الميدانية',
      tagline: 'بوت داخلي لإجراءات العمل. إضافة — لا يستبدل أنظمة الصوت/الواتساب.',
      description: 'بوت داخلي لإجراءات العمل. إضافة — لا يستبدل أنظمة الصوت/الواتساب.',
      metrics: [
        { label: 'الجمهور', value: 'الموظفون فقط', trend: 'ليس للعملاء' },
        { label: 'المصدر', value: 'إجراءاتكم', trend: 'واجهة معاينة' },
        { label: 'الأنظمة الأساسية', value: 'بدون تغيير', trend: 'مسار إضافة' },
      ],
      simulatedViews: ['بحث الإجراءات', 'بطاقة الإجابة', 'ملاحظة التحويل'],
    },
  }),
  localize({
    id: 'proposal-deck-factory',
    lane: 'preview',
    setupFeeCents: 250000,
    monthlyRetainerCents: 20000,
    pricePrefix: 'from',
    en: {
      name: 'Proposal deck',
      category: 'Add-on',
      vertical: 'Agency sales, GCC enterprise, B2B services',
      tagline: '8 fields → branded PPTX on the call. Feeds deal stage Proposal sent.',
      description: '8 fields → branded PPTX on the call. Feeds deal stage Proposal sent.',
      metrics: [
        { label: 'Fields', value: '8', trend: 'On-call capture' },
        { label: 'Output', value: 'Branded PPTX', trend: 'Preview UI' },
        { label: 'CRM stage', value: 'Proposal sent', trend: 'When requested' },
      ],
      simulatedViews: ['Field capture', 'Deck preview', 'Send to deal'],
    },
    ar: {
      name: 'عرض الأسعار',
      category: 'إضافة',
      vertical: 'مبيعات الوكالة، مؤسسات الخليج، خدمات الأعمال',
      tagline: '٨ حقول → عرض PPTX بهويتكم أثناء المكالمة. يغذي مرحلة إرسال العرض.',
      description: '٨ حقول → عرض PPTX بهويتكم أثناء المكالمة. يغذي مرحلة إرسال العرض.',
      metrics: [
        { label: 'الحقول', value: '٨', trend: 'أثناء المكالمة' },
        { label: 'المخرج', value: 'PPTX بهويتكم', trend: 'واجهة معاينة' },
        { label: 'مرحلة CRM', value: 'تم إرسال العرض', trend: 'عند الطلب' },
      ],
      simulatedViews: ['التقاط الحقول', 'معاينة العرض', 'إرسال للصفقة'],
    },
  }),
  localize({
    id: 'ar-invoicing',
    lane: 'core',
    highlight: 'b2b_only',
    setupFeeCents: 180000,
    monthlyRetainerCents: 50000,
    badge: 'B2B only',
    en: {
      name: 'AR collections',
      category: 'B2B finance',
      vertical: 'Wholesale, trading, logistics, retainers, contractors',
      tagline: 'Polite WhatsApp payment follow-ups for commercial invoices. MENA payment links.',
      description:
        'Polite WhatsApp payment follow-ups for commercial invoices only. Payment links via Tap, Paymob, or Moyasar — not consumer debt collection.',
      badge: 'B2B only',
      metrics: [
        { label: 'Scope', value: 'B2B invoices', trend: 'Commercial AR only' },
        { label: 'Payment rails', value: 'Tap / Paymob / Moyasar', trend: 'MENA' },
        { label: 'Tone', value: 'Polite Arabic', trend: 'Human escalate' },
      ],
      simulatedViews: ['WhatsApp payment request', 'Aging ledger', 'Settlement note'],
    },
    ar: {
      name: 'تحصيل المستحقات',
      category: 'مالية الشركات',
      vertical: 'التوريد، المقاولات، الخدمات اللوجستية، والاشتراكات',
      tagline: 'متابعات واتساب مهذبة لفواتير الشركات. روابط دفع إقليمية.',
      description:
        'متابعات واتساب مهذبة لفواتير الشركات فقط. روابط الدفع عبر Tap أو Paymob أو Moyasar — ليست تحصيل ديون استهلاكية.',
      badge: 'شركات فقط',
      metrics: [
        { label: 'النطاق', value: 'فواتير B2B', trend: 'مستحقات تجارية فقط' },
        { label: 'قنوات الدفع', value: 'Tap / Paymob / Moyasar', trend: 'الشرق الأوسط' },
        { label: 'النبرة', value: 'عربية مهذبة', trend: 'تصعيد بشري' },
      ],
      simulatedViews: ['طلب الدفع عبر الواتساب', 'سجل الأعمار', 'ملاحظة التسوية'],
    },
  }),
  localize({
    id: 'evidence-console',
    lane: 'core',
    setupFeeCents: 250000,
    monthlyRetainerCents: 75000,
    en: {
      name: 'Evidence ledger',
      category: 'Review',
      vertical: 'Healthcare, financial services, legal, enterprises',
      tagline: 'Facts verified before CRM writes. Human review for probable claims.',
      description: 'Facts verified before CRM writes. Human review for probable claims.',
      metrics: [
        { label: 'Verified facts', value: 'Auto-apply', trend: 'Trusted tools only' },
        { label: 'Probable / possible', value: 'Human queue', trend: '/facts' },
        { label: 'Export', value: 'Audit log', trend: 'Evidence export' },
      ],
      simulatedViews: ['Fact inspector', 'Review queue', 'Audit export'],
    },
    ar: {
      name: 'سجل الأدلة',
      category: 'مراجعة',
      vertical: 'الرعاية الصحية، الخدمات المالية، القانون، المؤسسات',
      tagline: 'حقائق تُراجع قبل الكتابة في CRM. مراجعة بشرية للادعاءات المحتملة.',
      description: 'حقائق تُراجع قبل الكتابة في CRM. مراجعة بشرية للادعاءات المحتملة.',
      metrics: [
        { label: 'حقائق مؤكدة', value: 'تطبيق تلقائي', trend: 'أدوات موثوقة فقط' },
        { label: 'محتملة / ضعيفة', value: 'طابور بشري', trend: '/facts' },
        { label: 'تصدير', value: 'سجل تدقيق', trend: 'تصدير أدلة' },
      ],
      simulatedViews: ['فاحص الحقائق', 'طابور المراجعة', 'تصدير التدقيق'],
    },
  }),
  localize({
    id: 'lead-attribution',
    lane: 'core',
    setupFeeCents: 220000,
    monthlyRetainerCents: 55000,
    en: {
      name: 'Lead attribution',
      category: 'Growth',
      vertical: 'Paid social, clinics, real estate, B2B lead gen',
      tagline: 'Connect ad source → qualified lead → booking. ROAS from real outcomes.',
      description: 'Connect ad source → qualified lead → booking. ROAS from real outcomes.',
      metrics: [
        { label: 'Source', value: 'UTM + campaign', trend: 'No invented ROAS' },
        { label: 'Score', value: 'Hot / warm / cold', trend: 'Human override' },
        { label: 'Join', value: 'Spend ↔ won deals', trend: 'When ads connected' },
      ],
      simulatedViews: ['Source card', 'Qualification score', 'Booking join'],
    },
    ar: {
      name: 'إسناد العملاء',
      category: 'النمو',
      vertical: 'الإعلانات، العيادات، العقارات، توليد العملاء',
      tagline: 'ربط مصدر الإعلان → عميل مؤهل → حجز. عائد من نتائج حقيقية.',
      description: 'ربط مصدر الإعلان → عميل مؤهل → حجز. عائد من نتائج حقيقية.',
      metrics: [
        { label: 'المصدر', value: 'UTM + الحملة', trend: 'بدون أرقام مختلقة' },
        { label: 'التصنيف', value: 'ساخن / دافئ / بارد', trend: 'تجاوز بشري' },
        { label: 'الربط', value: 'الإنفاق ↔ الصفقات', trend: 'عند ربط الإعلانات' },
      ],
      simulatedViews: ['بطاقة المصدر', 'درجة التأهيل', 'ربط الحجز'],
    },
  }),
]

export function getSystemTemplate(id: string): SystemTemplate | undefined {
  return SYSTEM_TEMPLATES.find(template => template.id === id)
}

export function formatUsdFromCents(cents: number, prefix?: 'from'): string {
  const amount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100)
  return prefix === 'from' ? `From ${amount}` : amount
}

export function formatCatalogPrice(template: SystemTemplate): string {
  const setup = formatUsdFromCents(template.setupFeeCents, template.pricePrefix)
  const monthly = formatUsdFromCents(template.monthlyRetainerCents)
  return `${setup} setup · ${monthly}/mo`
}

export const CORE_SYSTEM_COUNT = SYSTEM_TEMPLATES.filter(t => t.lane === 'core').length
export const PREVIEW_SYSTEM_COUNT = SYSTEM_TEMPLATES.filter(t => t.lane === 'preview').length
