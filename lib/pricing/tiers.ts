import type { RegionTier } from '@/lib/schema'

export interface PricingPlan {
  id: string
  name: string
  nameAr: string
  tagline: string
  taglineAr: string
  featured?: boolean
  prices: {
    USD: number
    AED?: number
    SAR?: number
    EGP?: number
    JOD?: number
  }
  setupFee: {
    USD: number
    AED?: number
    SAR?: number
    EGP?: number
    JOD?: number
  }
  features: string[]
  featuresAr: string[]
  /** Owner-facing copy. Marketing pages render this, never the raw feature strings. */
  display?: {
    en: PlanCopy
    ar: PlanCopy
  }
}

export interface PlanCopy {
  tagline: string
  taglineShort: string
  features: string[]
  /** Three short rows for the home teaser. Pricing uses `features`. */
  home?: string[]
}

/** Section 8 display copy. Prices stay on the plan objects. */
export const GCC_PLAN_DISPLAY: Record<string, { en: PlanCopy; ar: PlanCopy }> = {
  'starter-gcc': {
    en: {
      tagline: 'For a single location automating its phone and WhatsApp.',
      taglineShort: 'Single location, phone and WhatsApp.',
      features: [
        'Up to 1,500 customer conversations a month',
        'Bilingual voice agent, Gulf Arabic and English',
        'Official WhatsApp Business connection',
        'Cal.com and Google Calendar sync',
        'Human review before anything uncertain is saved',
        'UAE and KSA VAT-compliant invoices',
      ],
      home: [
        'Up to 1,500 conversations a month',
        'Voice agent in Gulf Arabic & English',
        'Calendar sync and WhatsApp confirmations',
      ],
    },
    ar: {
      tagline: 'لموقع واحد يؤتمت الهاتف وواتساب.',
      taglineShort: 'موقع واحد، هاتف وواتساب.',
      features: [
        'حتى 1,500 محادثة مع العملاء شهرياً',
        'وكيل صوتي ثنائي اللغة: خليجي وإنجليزي',
        'ربط رسمي مع واتساب للأعمال',
        'مزامنة مع Cal.com وتقويم Google',
        'مراجعة بشرية قبل حفظ أي معلومة غير مؤكدة',
        'فواتير متوافقة مع ضريبة القيمة المضافة في الإمارات والسعودية',
      ],
      home: [
        'حتى 1,500 محادثة شهرياً',
        'وكيل صوتي بالخليجي والإنجليزية',
        'مزامنة التقويم وتأكيدات واتساب',
      ],
    },
  },
  'growth-gcc': {
    en: {
      tagline: 'Missed-call triage, voice and WhatsApp working together.',
      taglineShort: 'Missed-call triage, voice and WhatsApp together.',
      features: [
        'Up to 10,000 customer conversations a month',
        'Voice, WhatsApp and email automation',
        'Missed-call WhatsApp text-back and triage, in seconds',
        'B2B payment reminders with Mada and Apple Pay links',
      ],
      home: [
        'Up to 10,000 conversations a month',
        'Voice, WhatsApp and email automation',
        'Missed-call WhatsApp text-back and triage',
      ],
    },
    ar: {
      tagline: 'فرز المكالمات الفائتة والصوت وواتساب معاً.',
      taglineShort: 'فرز المكالمات الفائتة، الصوت وواتساب معاً.',
      features: [
        'حتى 10,000 محادثة مع العملاء شهرياً',
        'أتمتة الصوت وواتساب والبريد الإلكتروني',
        'رد على المكالمات الفائتة عبر واتساب وفرزها، خلال ثوانٍ',
        'تذكيرات دفع للشركات مع روابط مدى وApple Pay',
      ],
      home: [
        'حتى 10,000 محادثة شهرياً',
        'أتمتة الصوت وواتساب والبريد الإلكتروني',
        'رد على المكالمات الفائتة عبر واتساب وفرزها',
      ],
    },
  },
  'scale-gcc': {
    en: {
      tagline: 'For groups running multiple branches and brands.',
      taglineShort: 'Multiple branches and brands.',
      features: [
        'Unlimited workspaces across branches and brands',
        'Dialect tuning: Emirati, Najdi, Hijazi, Qatari',
        'B2B collections and dispute handling',
        'Cross-branch CRM governance and exports',
        'Priority escalation support',
      ],
      home: [
        'Unlimited workspaces across branches',
        'Custom dialect tuning',
        'Priority escalation support',
      ],
    },
    ar: {
      tagline: 'للمجموعات التي تدير عدة فروع وعلامات تجارية.',
      taglineShort: 'عدة فروع وعلامات تجارية.',
      features: [
        'مساحات عمل غير محدودة لكل الفروع والعلامات',
        'ضبط اللهجات: الإماراتية والنجدية والحجازية والقطرية',
        'تحصيل مستحقات الشركات ومعالجة الاعتراضات',
        'حوكمة بيانات العملاء وتصديرها عبر الفروع',
        'دعم تصعيد ذو أولوية',
      ],
      home: [
        'مساحات عمل غير محدودة للفروع',
        'ضبط اللهجات',
        'دعم تصعيد ذو أولوية',
      ],
    },
  },
}

export interface RegionPricingConfig {
  tier: RegionTier
  name: string
  nameAr: string
  defaultCurrency: 'AED' | 'USD' | 'EGP' | 'SAR' | 'JOD'
  availableCurrencies: ('AED' | 'SAR' | 'USD' | 'EGP' | 'JOD')[]
  badge: string
  badgeAr: string
  description: string
  descriptionAr: string
  plans: PricingPlan[]
}

export const REGIONAL_PRICING_CONFIGS: Record<RegionTier, RegionPricingConfig> = {
  gcc_enterprise: {
    tier: 'gcc_enterprise',
    name: 'GCC Enterprise (UAE, KSA, Qatar)',
    nameAr: 'المؤسسات الكبرى في الخليج العربي (الإمارات، السعودية، قطر)',
    defaultCurrency: 'AED',
    availableCurrencies: ['AED', 'SAR', 'USD'],
    badge: 'GCC plans',
    badgeAr: 'باقات الخليج',
    description:
      'Built and run for multi-location businesses in the GCC.',
    descriptionAr: 'نبنيها ونشغّلها للأعمال متعددة الفروع في الخليج.',
    plans: [
      {
        id: 'starter-gcc',
        name: 'Enterprise Starter',
        nameAr: 'انطلاقة المؤسسات',
        tagline: 'For a single location automating its phone and WhatsApp.',
        taglineAr: 'لموقع واحد يؤتمت الهاتف وواتساب.',
        display: GCC_PLAN_DISPLAY['starter-gcc'],
        prices: { AED: 1800, SAR: 1850, USD: 490 },
        setupFee: { AED: 4500, SAR: 4600, USD: 1200 },
        features: GCC_PLAN_DISPLAY['starter-gcc'].en.features,
        featuresAr: GCC_PLAN_DISPLAY['starter-gcc'].ar.features,
      },
      {
        id: 'growth-gcc',
        name: 'Growth Enterprise',
        nameAr: 'نمو المؤسسات',
        tagline: 'Missed-call triage, voice and WhatsApp working together.',
        taglineAr: 'فرز المكالمات الفائتة والصوت وواتساب معاً.',
        display: GCC_PLAN_DISPLAY['growth-gcc'],
        featured: true,
        prices: { AED: 4600, SAR: 4700, USD: 1250 },
        setupFee: { AED: 7500, SAR: 7650, USD: 2000 },
        features: GCC_PLAN_DISPLAY['growth-gcc'].en.features,
        featuresAr: GCC_PLAN_DISPLAY['growth-gcc'].ar.features,
      },
      {
        id: 'scale-gcc',
        name: 'Sovereign Scale',
        nameAr: 'المؤسسات الكبرى متعددة الفروع',
        tagline: 'For groups running multiple branches and brands.',
        taglineAr: 'للمجموعات التي تدير عدة فروع وعلامات تجارية.',
        display: GCC_PLAN_DISPLAY['scale-gcc'],
        prices: { AED: 10200, SAR: 10500, USD: 2800 },
        setupFee: { AED: 15000, SAR: 15500, USD: 4000 },
        features: GCC_PLAN_DISPLAY['scale-gcc'].en.features,
        featuresAr: GCC_PLAN_DISPLAY['scale-gcc'].ar.features,
      },
    ],
  },
  mena_sme: {
    tier: 'mena_sme',
    name: 'MENA SME & High-Velocity Business (Egypt & Jordan)',
    nameAr: 'الشركات الناشئة والمتوسطة (مصر، الأردن، وشمال إفريقيا)',
    defaultCurrency: 'EGP',
    availableCurrencies: ['EGP', 'JOD', 'USD'],
    badge: 'MENA plans',
    badgeAr: 'باقات المنطقة',
    description:
      'Hidden catalogue for clinics and service businesses in Egypt and Jordan. Not shown on the public pricing page.',
    descriptionAr:
      'دليل مخفي للعيادات وأعمال الخدمات في مصر والأردن. لا يظهر في صفحة الأسعار العامة.',
    plans: [
      {
        id: 'starter-mena',
        name: 'SME Starter',
        nameAr: 'باقة البداية للشركات',
        tagline: 'High-speed missed-call WhatsApp text-back to capture lost leads instantly.',
        taglineAr: 'الرد السريع على المكالمات الفائتة عبر الواتساب لمنع ضياع أي زبون.',
        prices: { EGP: 9500, JOD: 175, USD: 250 },
        setupFee: { EGP: 15000, JOD: 280, USD: 400 },
        features: [
          'Up to 800 WhatsApp lead conversations / mo',
          'WhatsApp reply when a call is missed',
          'Lead qualification and technician / sales routing',
          'Core CRM contact list & conversation logging',
          'Fawry & local card payment collection links',
          'Arabic interface & WhatsApp technical onboarding',
        ],
        featuresAr: [
          'حتى 800 محادثة واستفسار عميل شهرياً عبر الواتساب',
          'رد آلي خلال 5 ثوانٍ عند فوات أي مكالمة هاتفية',
          'تأهيل العميل وتحديد نوع الطلب وتحويله للمبيعات',
          'تسجيل جهات الاتصال والمحادثات في CRM فوراً',
          'روابط دفع محلية سريعة متوافقة مع فوري والبطاقات',
          'واجهة عربية كاملة مع دعم فني عبر الواتساب',
        ],
      },
      {
        id: 'accelerator-mena',
        name: 'Business Accelerator',
        nameAr: 'مسرّع الأعمال',
        tagline: 'Automated booking agent + CRM lead reactivation to drive repeat customer revenue.',
        taglineAr: 'حجز المواعيد تلقائياً وإعادة تنشيط الزبائن القدامى لزيادة المبيعات.',
        featured: true,
        prices: { EGP: 19500, JOD: 350, USD: 500 },
        setupFee: { EGP: 25000, JOD: 450, USD: 650 },
        features: [
          'Up to 3,500 active customer conversations / mo',
          'Voice AI receptionist in Egyptian & Levantine Arabic',
          'Automated WhatsApp appointment booking & reminders',
          'Dormant lead reactivation campaigns for old CRM contacts',
          'Automated WhatsApp invoice payment links (InstaPay / CliQ ready)',
          'A written summary of what the system did',
        ],
        featuresAr: [
          'حتى 3,500 محادثة واستفسار نشط شهرياً',
          'وكيل صوتي ذكي باللهجة المصرية والشامية والعربية الفصحى',
          'تأكيد المواعيد وتذكير العملاء تلقائياً عبر الواتساب',
          'محرك إعادة تنشيط العملاء السابقين في قاعدة البيانات',
          'إرسال الفواتير وروابط الدفع (متوافق مع إنستاباي و CliQ)',
          'تقارير دورية كل أسبوعين لقياس العائد على الاستثمار',
        ],
      },
      {
        id: 'omni-mena',
        name: 'Omni Operations',
        nameAr: 'العمليات المتكاملة الشاملة',
        tagline: 'Full agency automation covering voice, WhatsApp, lead reactivation, and debt collection.',
        taglineAr: 'أتمتة شاملة للصوت والواتساب ومتابعة التحصيل والتنشيط لفروع متعددة.',
        prices: { EGP: 38000, JOD: 690, USD: 980 },
        setupFee: { EGP: 45000, JOD: 800, USD: 1200 },
        features: [
          'Up to 10,000 conversations across voice & WhatsApp',
          'Full A/R accounts receivable & debt collection sequences',
          'Multi-branch lead distribution & role-based access',
          'Anything uncertain goes to your review queue, never saved as fact',
          'Connections to the accounting tools you already use',
          'A setup walkthrough with your team',
        ],
        featuresAr: [
          'حتى 10,000 محادثة ومكالمة عبر الصوت والواتساب',
          'سلسلة متابعة وتحصيل الديون والفواتير المتأخرة آلياً',
          'توزيع جهات الاتصال بين الفروع والموظفين بصلاحيات دقيقة',
          'سجل تدقيق كامل ومراقبة تامة لصحة المعلومات',
          'ربط مخصص مع أنظمة المحاسبة والـ ERP لديكم',
          'مستشار فني خاص لمتابعة التنفيذ وتدريب الموظفين',
        ],
      },
    ],
  },
}

export function planDisplay(plan: PricingPlan, lang: 'en' | 'ar'): PlanCopy {
  const embedded = plan.display?.[lang]
  if (embedded && embedded.features.length > 0) return embedded
  const seeded = GCC_PLAN_DISPLAY[plan.id]?.[lang]
  if (seeded) return seeded
  const features = lang === 'ar' ? plan.featuresAr : plan.features
  const tagline = lang === 'ar' ? plan.taglineAr : plan.tagline
  return { tagline, taglineShort: tagline, features }
}
