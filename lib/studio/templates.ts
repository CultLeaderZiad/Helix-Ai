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
  setupFeeCents: number
  monthlyRetainerCents: number
  badge?: string
  en: LocalizedContent
  ar: LocalizedContent
  // Convenience getters for backward compatibility
  name: string
  category: string
  vertical: string
  tagline: string
  description: string
  metrics: { label: string; value: string; trend?: string }[]
  simulatedViews: string[]
}

export const SYSTEM_TEMPLATES: SystemTemplate[] = [
  {
    id: 'booking-receptionist',
    setupFeeCents: 150000,
    monthlyRetainerCents: 45000,
    badge: 'MOST POPULAR',
    en: {
      name: 'Autonomous Booking Receptionist',
      category: 'Voice & Scheduling',
      vertical: 'Clinics, Salons, High-Ticket Services, Real Estate',
      tagline: '24/7 Bilingual Voice Agent with Instant WhatsApp Confirmation',
      description:
        'Picks up inbound phone calls in < 400ms in English & Gulf Arabic, answers inquiries with zero hallucinations, and coordinates confirmed calendar slots directly with an automated WhatsApp confirmation itinerary.',
      badge: 'MOST POPULAR',
      metrics: [
        { label: 'Inbound Captured', value: '18 Calls Today', trend: '+100% Zero Missed' },
        { label: 'Bookings Logged', value: '7 Confirmed', trend: '$4,900 Est. Value' },
        { label: 'WhatsApp Itineraries', value: '100% Sent', trend: 'Instant delivery' },
      ],
      simulatedViews: ['WhatsApp Confirmation', 'Live Calendar Grid', 'Call Audio Transcript'],
    },
    ar: {
      name: 'موظف الاستقبال والحجوزات الذكي',
      category: 'الصوت والجدولة الذكية',
      vertical: 'العيادات، مراكز التجميل، العقارات، والخدمات الراقية',
      tagline: 'وكيل صوتي على مدار الساعة مع تأكيد فوري عبر الواتساب',
      description:
        'يجيب على المكالمات الهاتفية خلال أقل من 400 ميلي ثانية باللهجة الخليجية والعربية الفصحى والإنجليزية، ويؤكد المواعيد ويرسل تفاصيل الحجز وتنبيهات الموقع مباشرة إلى واتساب العميل.',
      badge: 'الأكثر طلباً',
      metrics: [
        { label: 'مكالمات تم استقبالها', value: '18 مكالمة اليوم', trend: '100% استجابة فورية' },
        { label: 'مواعيد مؤكدة', value: '7 حجوزات', trend: 'قيمة متوقعة $4,900' },
        { label: 'تأكيدات الواتساب', value: '100% تسليم', trend: 'إشعار فوري للعميل' },
      ],
      simulatedViews: ['تأكيد الواتساب', 'جدول المواعيد الحي', 'نص المكالمة المفرغ'],
    },
    get name() { return this.en.name },
    get category() { return this.en.category },
    get vertical() { return this.en.vertical },
    get tagline() { return this.en.tagline },
    get description() { return this.en.description },
    get metrics() { return this.en.metrics },
    get simulatedViews() { return this.en.simulatedViews },
  },
  {
    id: 'missed-call-responder',
    setupFeeCents: 120000,
    monthlyRetainerCents: 35000,
    en: {
      name: 'Missed-Call WhatsApp Lead Triage',
      category: 'Lead Capture & WhatsApp',
      vertical: 'Contractors, Maintenance, Home Services, Legal & Auto',
      tagline: 'Instant 5-Second WhatsApp Message & Lead Dispatch',
      description:
        'When your team misses an incoming call, the AI instantly fires an intelligent WhatsApp message within 5 seconds to qualify intent, capture client requirements, and dispatch technicians or sales reps.',
      metrics: [
        { label: 'Missed Calls Saved', value: '29 this week', trend: '94% Recovery' },
        { label: 'WhatsApp Response', value: '3.8s', trend: 'Instant conversational outreach' },
        { label: 'Dispatches Created', value: '16 Active', trend: '$22,500 Pipeline' },
      ],
      simulatedViews: ['WhatsApp Lead Thread', 'Dispatch Queue', 'Client Location Sheet'],
    },
    ar: {
      name: 'الرد الفوري وتأهيل العملاء عبر الواتساب',
      category: 'التقاط العملاء والواتساب',
      vertical: 'المقاولات، الصيانة، الطوارئ، الخدمات القانونية والسيارات',
      tagline: 'مراسلة ذكية عبر الواتساب خلال 5 ثوانٍ من فوات المكالمة',
      description:
        'في حال انشغال الخط أو فوات أي مكالمة، يُرسل النظام رسالة واتساب فورية وذكية لجمع طلب العميل، وتأكيد نوع الخدمة والموقع، وإرسال تنبيه فوري لفريق العمل.',
      metrics: [
        { label: 'مكالمات فائتة تم إنقاذها', value: '29 هذا الأسبوع', trend: '94% نسبة استرداد' },
        { label: 'سرعة رد الواتساب', value: '3.8 ثانية', trend: 'محادثة تلقائية فورية' },
        { label: 'مهام تم تعيينها', value: '16 مهمة نشطة', trend: 'قيمة متوقعة $22,500' },
      ],
      simulatedViews: ['محادثة الواتساب التلقائية', 'طابور المهام والفنيين', 'ورقة بيانات الموقع والطلب'],
    },
    get name() { return this.en.name },
    get category() { return this.en.category },
    get vertical() { return this.en.vertical },
    get tagline() { return this.en.tagline },
    get description() { return this.en.description },
    get metrics() { return this.en.metrics },
    get simulatedViews() { return this.en.simulatedViews },
  },
  {
    id: 'lead-reactivation',
    setupFeeCents: 200000,
    monthlyRetainerCents: 60000,
    badge: 'HIGHEST ROI',
    en: {
      name: 'WhatsApp CRM Reactivation Engine',
      category: 'Growth & Pipeline',
      vertical: 'Real Estate, B2B Services, High-Value Retail, Clinics',
      tagline: 'Turn Stale CRM Contacts into Revenue with WhatsApp Sequences',
      description:
        'Scans dormant contacts sitting in your CRM and executes personalized, high-context WhatsApp conversations tailored to their past inquiry, reviving interest and securing new appointments.',
      badge: 'HIGHEST ROI',
      metrics: [
        { label: 'Dormant Contacts Scanned', value: '1,450', trend: 'Full CRM Scan' },
        { label: 'Re-engaged via WhatsApp', value: '44 Leads', trend: '$112,000 Pipeline' },
        { label: 'Conversation Reply Rate', value: '28.4%', trend: '4x higher than email' },
      ],
      simulatedViews: ['WhatsApp Broadcast Flow', 'Reactivation Pipeline', 'Recovered Revenue Board'],
    },
    ar: {
      name: 'محرك تنشيط العملاء السابقين عبر الواتساب',
      category: 'النمو وزيادة المبيعات',
      vertical: 'العقارات، التجارة الراقية، العيادات، واستشارات الأعمال',
      tagline: 'تحويل جهات الاتصال القديمة إلى صفقات نشطة عبر الواتساب',
      description:
        'يفحص قاعدة بيانات عملائك السابقة ويطلق محادثات واتساب مخصصة وذكية بناءً على اهتماماتهم السابقة، مما يعيد تنشيطهم وتحويلهم إلى طلبات حقيقية دون أي تكلفة إعلانية.',
      badge: 'أعلى عائد استثماري',
      metrics: [
        { label: 'عملاء خاملون تم فحصهم', value: '1,450 جهة اتصال', trend: 'مسح شامل لقاعدة البيانات' },
        { label: 'تفاعلوا عبر الواتساب', value: '44 عميل مهتم', trend: 'قيمة صفقات $112,000' },
        { label: 'نسبة الرد على الرسائل', value: '28.4%', trend: '4 أضعاف معدل البريد الإلكتروني' },
      ],
      simulatedViews: ['مسار حملة الواتساب', 'خط أنابيب الصفقات المستعادة', 'لوحة الإيرادات المستردة'],
    },
    get name() { return this.en.name },
    get category() { return this.en.category },
    get vertical() { return this.en.vertical },
    get tagline() { return this.en.tagline },
    get description() { return this.en.description },
    get metrics() { return this.en.metrics },
    get simulatedViews() { return this.en.simulatedViews },
  },
  {
    id: 'evidence-console',
    setupFeeCents: 250000,
    monthlyRetainerCents: 75000,
    en: {
      name: 'Executive Evidence & Audit Console',
      category: 'Governance & Compliance',
      vertical: 'Financial Services, Corporate Law, Healthcare Enterprises',
      tagline: 'Supervisory Ground-Truth Ledger for Voice & WhatsApp Agents',
      description:
        'Guarantees your autonomous WhatsApp and voice agents never hallucinate or promise unauthorized concessions. Categorizes all extracted facts into Verified, Probable, and Possible with full audit trails.',
      metrics: [
        { label: 'Verified Facts', value: '98.8%', trend: 'Cryptographic ground truth' },
        { label: 'WhatsApp Claims Audited', value: '184 Facts', trend: 'Zero unauthorized promises' },
        { label: 'Audit Trail Hashing', value: 'SHA-256', trend: 'Tamper-proof compliance' },
      ],
      simulatedViews: ['WhatsApp Evidence Inspector', 'Cryptographic Audit Trail', 'Supervisory Gate'],
    },
    ar: {
      name: 'لوحة الرقابة التنفيذية وتدقيق الذكاء الاصطناعي',
      category: 'الحوكمة والامتثال',
      vertical: 'القطاع المالي، مكاتب المحاماة، والمؤسسات الطبية الكبرى',
      tagline: 'سجل تدقيق الحقيقة الصارمة للمحادثات الصوتية والواتساب',
      description:
        'يضمن عدم إصدار الذكاء الاصطناعي لأي وعود خاطئة أو غير مصرح بها للعملاء. يقوم بفحص كل محادثة واتساب ومكالمة وتصنيف المعلومات إلى (مؤكدة، محتملة، قابلة للشك) تحت إشراف الإدارة.',
      metrics: [
        { label: 'حقائق تم تدقيقها', value: '98.8%', trend: 'مطابقة تامة لسياسات المؤسسة' },
        { label: 'ملاحظات واتساب مفحوصة', value: '184 معلومة', trend: 'صفر تجاوزات إدارية' },
        { label: 'تشفير سجل التدقيق', value: 'SHA-256', trend: 'سجل غير قابل للتلاعب' },
      ],
      simulatedViews: ['فاحص أدلة الواتساب', 'سجل التدقيق المشفر', 'بوابة الإشراف الإداري'],
    },
    get name() { return this.en.name },
    get category() { return this.en.category },
    get vertical() { return this.en.vertical },
    get tagline() { return this.en.tagline },
    get description() { return this.en.description },
    get metrics() { return this.en.metrics },
    get simulatedViews() { return this.en.simulatedViews },
  },
  {
    id: 'ar-invoicing',
    setupFeeCents: 180000,
    monthlyRetainerCents: 50000,
    en: {
      name: 'WhatsApp A/R & Payment Collections',
      category: 'Finance & Invoicing',
      vertical: 'Wholesale, Trading, Logistics, B2B Retainers, Contractors',
      tagline: 'Autonomous WhatsApp Reminders with Direct Payment Links',
      description:
        'Monitors overdue invoices and reaches out to clients respectfully on WhatsApp with itemized statements and localized direct pay links (Tabby, Tamara, Stripe, Mada, Fawry), negotiating settlement terms automatically.',
      metrics: [
        { label: 'Overdue Collected', value: '$68,400', trend: 'Last 30 days' },
        { label: 'DSO Reduction', value: '-16 Days', trend: 'Faster enterprise cashflow' },
        { label: 'WhatsApp Pay Conversion', value: '76%', trend: 'Paid within 24 hours' },
      ],
      simulatedViews: ['WhatsApp Payment Request', 'Aging Invoice Ledger', 'Settlement Schedule'],
    },
    ar: {
      name: 'تحصيل المستحقات والفواتير عبر الواتساب',
      category: 'المالية والفوترة',
      vertical: 'شركات التوريد، المقاولات، الخدمات اللوجستية، والاشتراكات الشهرية',
      tagline: 'تذكير محترم عبر الواتساب وروابط دفع إلكترونية فورية',
      description:
        'يراقب الفواتير المستحقة ويرسل إشعارات مهنية ودية للعملاء عبر الواتساب مع رابط مباشر للدفع الفوري (مدى، تابي، تمارا، فوري، فيزا)، مع إمكانية جدولة الدفعات تلقائياً وفق سياساتكم.',
      metrics: [
        { label: 'مستحقات تم تحصيلها', value: '$68,400', trend: 'خلال آخر 30 يوماً' },
        { label: 'تسريع دورة التحصيل', value: '-16 يوماً', trend: 'سيولة نقدية أسرع' },
        { label: 'الاستجابة عبر الواتساب', value: '76%', trend: 'تم الدفع خلال 24 ساعة' },
      ],
      simulatedViews: ['رسالة طلب الدفع عبر الواتساب', 'سجل الفواتير المستحقة', 'جدول التسويات والدفعات'],
    },
    get name() { return this.en.name },
    get category() { return this.en.category },
    get vertical() { return this.en.vertical },
    get tagline() { return this.en.tagline },
    get description() { return this.en.description },
    get metrics() { return this.en.metrics },
    get simulatedViews() { return this.en.simulatedViews },
  },
]
