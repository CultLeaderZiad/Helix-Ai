export type SystemLane = 'core' | 'add_on' | 'preview'
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
  systemTypeKey: string
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
  // Core System 2
  localize({
    id: 'booking-receptionist',
    systemTypeKey: 'booking_receptionist',
    lane: 'core',
    highlight: 'most_booked',
    setupFeeCents: 150000,
    monthlyRetainerCents: 45000,
    badge: undefined,
    en: {
      name: 'Booking receptionist',
      category: 'Voice & WhatsApp',
      vertical: 'Clinics, salons, high-ticket services, real estate',
      tagline: 'Answers in Gulf Arabic & English, books Cal.com, sends WhatsApp confirmation.',
      description: 'Answers in Gulf Arabic & English, books Cal.com, sends WhatsApp confirmation.',
      badge: undefined,
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
      badge: undefined,
      metrics: [
        { label: 'حجوزات مؤكدة', value: 'عرض تجريبي', trend: 'سيناريو توضيحي' },
        { label: 'تأكيدات الواتساب', value: 'عند التثبيت', trend: 'حي بعد الربط' },
        { label: 'تغطية خارج الدوام', value: 'صوت + واتساب', trend: 'مواعيد Cal.com فقط' },
      ],
      simulatedViews: ['تأكيد الواتساب', 'جدول المواعيد', 'نص المكالمة'],
    },
  }),

  // Core System 1
  localize({
    id: 'missed-call-responder',
    systemTypeKey: 'missed_call_response',
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

  // Core System 4
  localize({
    id: 'lead-reactivation',
    systemTypeKey: 'lead_reactivation',
    lane: 'core',
    highlight: 'highest_roi',
    setupFeeCents: 200000,
    monthlyRetainerCents: 60000,
    badge: undefined,
    en: {
      name: 'Lead reactivation',
      category: 'Pipeline',
      vertical: 'Real estate, B2B services, clinics, high-value retail',
      tagline: 'Wake dormant CRM contacts with contextual WhatsApp sequences.',
      description: 'Wake dormant CRM contacts with contextual WhatsApp sequences.',
      badge: undefined,
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

  // Core System 11
  localize({
    id: 'lead-attribution',
    systemTypeKey: 'lead_attribution',
    lane: 'core',
    setupFeeCents: 220000,
    monthlyRetainerCents: 55000,
    en: {
      name: 'Lead qualification & attribution',
      category: 'Growth',
      vertical: 'Paid social, clinics, real estate, B2B lead gen',
      tagline: 'Connect ad source → qualified lead → booking. ROAS from real outcomes.',
      description: 'Connect ad source → qualified lead → booking. ROAS from real outcomes.',
      metrics: [
        { label: 'Source tracking', value: 'UTM + forms', trend: 'No invented ROAS' },
        { label: 'Score', value: 'Hot / warm / cold', trend: 'Human override' },
        { label: 'Attribution sync', value: 'Ad spend join', trend: 'n8n attribution' },
      ],
      simulatedViews: ['Source card', 'Qualification score', 'Booking join'],
    },
    ar: {
      name: 'تأهيل وإسناد العملاء',
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

  // Core System 13 (B2B Only)
  localize({
    id: 'ar-invoicing',
    systemTypeKey: 'ar_collections',
    lane: 'core',
    highlight: 'b2b_only',
    setupFeeCents: 180000,
    monthlyRetainerCents: 50000,
    badge: 'B2B only',
    en: {
      name: 'AR collections (B2B only)',
      category: 'B2B finance',
      vertical: 'Wholesale, trading, logistics, retainers, contractors',
      tagline: 'Polite WhatsApp payment follow-ups for commercial invoices. MENA payment links.',
      description:
        'Polite WhatsApp payment follow-ups for commercial invoices only. Payment links via Tap, Paymob, or Moyasar — strictly commercial B2B AR, never consumer debt.',
      badge: 'B2B only',
      metrics: [
        { label: 'Scope', value: 'B2B invoices', trend: 'Commercial AR only' },
        { label: 'Payment rails', value: 'Tap / Paymob / Moyasar', trend: 'MENA' },
        { label: 'Tone', value: 'Polite Arabic', trend: 'Human escalate' },
      ],
      simulatedViews: ['WhatsApp payment request', 'Aging ledger', 'Settlement note'],
    },
    ar: {
      name: 'تحصيل المستحقات (شركات فقط)',
      category: 'مالية الشركات',
      vertical: 'التوريد، المقاولات، الخدمات اللوجستية، والاشتراكات',
      tagline: 'متابعات واتساب مهذبة لفواتير الشركات. روابط دفع إقليمية.',
      description:
        'متابعات واتساب مهذبة لفواتير الشركات فقط. روابط الدفع عبر Tap أو Paymob أو Moyasar — مستحقات تجارية فقط وليس استهلاكية.',
      badge: 'شركات فقط',
      metrics: [
        { label: 'النطاق', value: 'فواتير B2B', trend: 'مستحقات تجارية فقط' },
        { label: 'قنوات الدفع', value: 'Tap / Paymob / Moyasar', trend: 'الشرق الأوسط' },
        { label: 'النبرة', value: 'عربية مهذبة', trend: 'تصعيد بشري' },
      ],
      simulatedViews: ['طلب الدفع عبر الواتساب', 'سجل الأعمار', 'ملاحظة التسوية'],
    },
  }),

  // OSS Add-on 2.1: Rival Watch (Scrapling outcome)
  localize({
    id: 'rival-watch',
    systemTypeKey: 'rival_watch',
    lane: 'add_on',
    setupFeeCents: 160000,
    monthlyRetainerCents: 35000,
    pricePrefix: 'from',
    badge: 'Add-on',
    en: {
      name: 'Rival Watch',
      category: 'Add-on · Intelligence',
      vertical: 'E-commerce, retail, contractors, automotive',
      tagline: 'Weekly rival price, stock, and listing intelligence report + WhatsApp alerts.',
      description: 'Monitors competitor pricing and stock changes automatically. Feeds alerts to WhatsApp or Google Sheets.',
      badge: 'Add-on',
      metrics: [
        { label: 'Target pages', value: 'Competitors', trend: 'Public URLs only' },
        { label: 'Alert rhythm', value: 'Weekly / instant', trend: 'WhatsApp alert' },
        { label: 'Output format', value: 'Sheet + Digest', trend: 'Actionable delta' },
      ],
      simulatedViews: ['Competitor price delta', 'WhatsApp price alert', 'Stock alert'],
    },
    ar: {
      name: 'رصد المنافسين (Rival Watch)',
      category: 'إضافة · استخبارات سوقية',
      vertical: 'التجارة الإلكترونية، التجزئة، المقاولات، وتجارة السيارات',
      tagline: 'تقرير أسبوعي بأسعار ومخزون المنافسين مع تنبيهات واتساب فورية.',
      description: 'مراقبة تحركات المنافسين وقوائم الأسعار تلقائياً وتنبيه فريق المبيعات عبر الواتساب.',
      badge: 'إضافة',
      metrics: [
        { label: 'الصفحات المستهدفة', value: 'المنافسون', trend: 'صفحات عامة فقط' },
        { label: 'تكرار التنبيه', value: 'أسبوعي / فوري', trend: 'تنبيه واتساب' },
        { label: 'صيغة المخرج', value: 'جدول + ملخص', trend: 'فروقات الأسعار' },
      ],
      simulatedViews: ['فروقات أسعار المنافسين', 'تنبيه واتساب فوري', 'تقرير المخزون'],
    },
  }),

  // OSS Add-on 2.2: Handbook Answers (Dify outcome)
  localize({
    id: 'handbook-answers',
    systemTypeKey: 'handbook_bot',
    lane: 'add_on',
    setupFeeCents: 150000,
    monthlyRetainerCents: 25000,
    pricePrefix: 'from',
    badge: 'Add-on',
    en: {
      name: 'Handbook Answers',
      category: 'Add-on · Knowledge',
      vertical: 'Ops teams, clinics, field services, corporate staff',
      tagline: 'Private SOP and policy answers bot for staff. Monthly doc refresh retainer.',
      description: 'Private staff assistant trained strictly on company SOPs, employee handbooks, and service manuals. Answers internal inquiries instantly.',
      badge: 'Add-on',
      metrics: [
        { label: 'Target audience', value: 'Internal staff', trend: 'Not customer-facing' },
        { label: 'Source ground', value: 'Your verified SOPs', trend: 'Zero hallucination' },
        { label: 'Refresh cadence', value: 'Monthly sync', trend: 'Retainer included' },
      ],
      simulatedViews: ['SOP search', 'Staff answer card', 'Handoff note'],
    },
    ar: {
      name: 'إجابات دليل التشغيل (Handbook Answers)',
      category: 'إضافة · قاعدة المعرفة',
      vertical: 'فرق التشغيل، العيادات، الخدمات الميدانية، موظفي الشركات',
      tagline: 'بوت داخلي لإجراءات وسياسات العمل للموظفين مع تحديث شهري للوثائق.',
      description: 'مساعد داخلي للموظفين مدرب حصراً على أدلة وإجراءات الشركة يجيب على الاستفسارات فوراً.',
      badge: 'إضافة',
      metrics: [
        { label: 'الجمهور المستهدف', value: 'الموظفون فقط', trend: 'داخلي' },
        { label: 'المصدر', value: 'إجراءاتكم المعتمدة', trend: 'بدون اختلاق' },
        { label: 'وتيرة التحديث', value: 'شهرياً', trend: 'شامل بالاشتراك' },
      ],
      simulatedViews: ['بحث الإجراءات', 'بطاقة الإجابة', 'ملاحظة التحويل'],
    },
  }),

  // OSS Add-on 2.3: Visibility Scorecard (OpenSEO outcome)
  localize({
    id: 'seo-scorecard',
    systemTypeKey: 'seo_scorecard',
    lane: 'add_on',
    setupFeeCents: 140000,
    monthlyRetainerCents: 30000,
    pricePrefix: 'from',
    badge: 'Add-on',
    en: {
      name: 'Visibility Scorecard',
      category: 'Add-on · Local Growth',
      vertical: 'Clinics, HVAC, legal, local service contractors',
      tagline: 'Monthly local visibility scorecard + 3 high-impact fixes (door-opener).',
      description: 'Automated local SEO ranking, Google Business Profile signals, and directory audit that proves visibility gaps before pitching receptionist upgrades.',
      badge: 'Add-on',
      metrics: [
        { label: 'Audit scope', value: 'GBP + Local SEO', trend: 'Monthly report' },
        { label: 'Action items', value: 'Top 3 fixes', trend: 'Client ready' },
        { label: 'Sales role', value: 'Door opener', trend: 'Upsells System 2' },
      ],
      simulatedViews: ['Scorecard overview', 'Local rank grid', 'Fix recommendations'],
    },
    ar: {
      name: 'بطاقة الظهور المحلي (Visibility Scorecard)',
      category: 'إضافة · النمو المحلي',
      vertical: 'العيادات، الصيانة، مكاتب المحاماة، مقاولو الخدمات المحلية',
      tagline: 'بطاقة تقييم شهرية للظهور المحلي + ٣ حلول ذات أثر فوري لفتح الصفقات.',
      description: 'تدقيق آلي لترتيب البحث المحلي وإشارات خرائط جوجل لكشف الفجوات قبل تقديم خدمات موظف الاستقبال.',
      badge: 'إضافة',
      metrics: [
        { label: 'نطاق الفحص', value: 'خرائط جوجل والبحث', trend: 'تقرير شهري' },
        { label: 'التوصيات', value: 'أهم ٣ حلول', trend: 'جاهز للعميل' },
        { label: 'الهدف البيعي', value: 'مدخل تعاقد', trend: 'ترقية لنظام ٢' },
      ],
      simulatedViews: ['نظرة عامة على النقاط', 'شبكة الترتيب المحلي', 'توصيات التحسين'],
    },
  }),

  // OSS Add-on 2.5: Deck Factory (Presenton outcome)
  localize({
    id: 'proposal-deck-factory',
    systemTypeKey: 'deck_factory',
    lane: 'add_on',
    setupFeeCents: 250000,
    monthlyRetainerCents: 20000,
    pricePrefix: 'from',
    badge: 'Add-on',
    en: {
      name: 'Deck Factory',
      category: 'Add-on · Sales Ops',
      vertical: 'Agency sales, GCC enterprise, B2B consulting',
      tagline: '8 fields → branded editable PPTX proposal deck in minutes.',
      description: 'Converts deal qualification notes into a customized, client-ready proposal presentation during or right after the call. Feeds deal stage Proposal sent.',
      badge: 'Add-on',
      metrics: [
        { label: 'Fields required', value: '8 inputs', trend: 'On-call capture' },
        { label: 'Output asset', value: 'Editable PPTX', trend: 'Branded layout' },
        { label: 'CRM stage', value: 'Proposal sent', trend: 'Automated deal update' },
      ],
      simulatedViews: ['Field capture', 'Deck preview', 'Send to deal'],
    },
    ar: {
      name: 'مصنع العروض (Deck Factory)',
      category: 'إضافة · عمليات المبيعات',
      vertical: 'مبيعات الوكالة، مؤسسات الخليج، الاستشارات التجارية',
      tagline: '٨ حقول → عرض تقديمي PPTX بهوية العميل جاهز للتعديل خلال دقائق.',
      description: 'تحويل بيانات تأهيل العميل إلى عرض مقترح مخصص وقابل للتعديل أثناء المكالمة وتحديث مرحلة الصفقة فوراً.',
      badge: 'إضافة',
      metrics: [
        { label: 'الحقول المطلوبة', value: '٨ حقول', trend: 'أثناء المكالمة' },
        { label: 'المخرج', value: 'PPTX قابل للتعديل', trend: 'بهوية معتمدة' },
        { label: 'مرحلة CRM', value: 'تم إرسال العرض', trend: 'تحديث آلي' },
      ],
      simulatedViews: ['إدخال البيانات', 'معاينة الشرائح', 'ربط بالصفقة'],
    },
  }),

  // OSS Preview 2.4: Clip Factory (OpenShorts outcome)
  localize({
    id: 'clip-factory',
    systemTypeKey: 'shorts_factory',
    lane: 'preview',
    setupFeeCents: 300000,
    monthlyRetainerCents: 50000,
    pricePrefix: 'from',
    badge: 'Preview',
    en: {
      name: 'Clip Factory',
      category: 'Preview · Media',
      vertical: 'Podcasts, webinars, course creators, brand media',
      tagline: 'Long-form video → 8–10 captioned vertical short clips for social.',
      description: 'Automated video ingest pipeline turning long webinars and client presentations into curated vertical clips with animated captions.',
      badge: 'Preview',
      metrics: [
        { label: 'Input', value: 'Webinar / Video URL', trend: 'Long form' },
        { label: 'Output', value: '8-10 Vertical clips', trend: 'With captions' },
        { label: 'Availability', value: 'Preview lane', trend: 'On request' },
      ],
      simulatedViews: ['Video ingest', 'Clip selection', 'Caption export'],
    },
    ar: {
      name: 'مصنع المقاطع (Clip Factory)',
      category: 'معاينة · إنتاج المحتوى',
      vertical: 'البودكاست، الويبينار، صناع المحتوى، والوسائط المؤسسية',
      tagline: 'الفيديوهات الطويلة → ٨-١٠ مقاطع رأسية مصنفة مع ترجمة توضيحية.',
      description: 'مسار آلي لتحويل الاجتماعات والويبينارات الطويلة إلى مقاطع قصيرة عالية التفاعل مع نصوص ملونة.',
      badge: 'معاينة',
      metrics: [
        { label: 'المدخل', value: 'رابط فيديو / ويبينار', trend: 'محتوى طويل' },
        { label: 'المخرج', value: '٨-١٠ مقاطع رأسية', trend: 'مع نصوص' },
        { label: 'الحالة', value: 'مسار تجريبي', trend: 'عند الطلب' },
      ],
      simulatedViews: ['استيراد الفيديو', 'اختيار اللقطات', 'تصدير المقاطع'],
    },
  }),

  // Add-on System: Lead Generation (Scrapling outcome)
  localize({
    id: 'lead-generation',
    systemTypeKey: 'lead_generation',
    lane: 'add_on',
    setupFeeCents: 180000,
    monthlyRetainerCents: 45000,
    pricePrefix: 'from',
    badge: 'Add-on',
    en: {
      name: 'Lead Generation',
      category: 'Add-on · Acquisition',
      vertical: 'B2B services, contractors, clinics, regional wholesale',
      tagline: 'Public website lead discovery, adaptive extraction & scoring powered by Scrapling.',
      description: 'Crawls public business websites, extracts verified emails and phone numbers with provenance, scores ICP match, and drafts targeted outreach.',
      badge: 'Add-on',
      metrics: [
        { label: 'Extraction engine', value: 'Scrapling worker', trend: 'Live worker status' },
        { label: 'Contact provenance', value: 'Website / Hunter', trend: 'Zero fake leads' },
        { label: 'Outreach mode', value: 'Drafts only', trend: 'Never auto-send' },
      ],
      simulatedViews: ['Lead discovery queue', 'Extracted contact card', 'Outreach preview'],
    },
    ar: {
      name: 'توليد العملاء (Lead Generation)',
      category: 'إضافة · اكتساب العملاء',
      vertical: 'خدمات الشركات، المقاولات، العيادات، والتجارة الإقليمية',
      tagline: 'اكتشاف عملاء الشركات وتوليد جهات الاتصال الموثوقة عبر محرك Scrapling.',
      description: 'استخراج جهات اتصال موثوقة من مواقع الشركات العامة مع توثيق المصدر، تقييم المطابقة، وصياغة مسودات المراسلة دون إرسال آلي.',
      badge: 'إضافة',
      metrics: [
        { label: 'محرك الاستخراج', value: 'محرك Scrapling', trend: 'حالة المشغل المباشرة' },
        { label: 'مصدر البيانات', value: 'الموقع / Hunter', trend: 'بدون اختلاق' },
        { label: 'المراسلة', value: 'مسودات فقط', trend: 'لا إرسال آلي' },
      ],
      simulatedViews: ['طابور استكشاف العملاء', 'بطاقة جهة الاتصال', 'معاينة مسودة المراسلة'],
    },
  }),
]

export function getSystemTemplate(id: string): SystemTemplate | undefined {
  return SYSTEM_TEMPLATES.find(template => template.id === id || template.systemTypeKey === id)
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
export const ADDON_SYSTEM_COUNT = SYSTEM_TEMPLATES.filter(t => t.lane === 'add_on').length
export const PREVIEW_SYSTEM_COUNT = SYSTEM_TEMPLATES.filter(t => t.lane === 'preview').length
