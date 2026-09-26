export interface MarketingCopy {
  nav: {
    brand: string
    links: {
      systems: string
      leadgen: string
      howItWorks: string
      pricing: string
      studio: string
    }
    langToggle: string
    signIn: string
    console: string
    cta: string
  }
  hero: {
    eyebrow: string
    titlePrefix: string
    titleEmphasis: string
    lead: string
    primaryCta: string
    secondaryCta: string
    microCopy: string
  }
  productWindow: {
    title: string
    sampleChip: string
    streamingChip: string
    pipelineTitle: string
    steps: Array<{
      title: string
      time: string
      badge: string
      status: 'done' | 'running' | 'waiting'
    }>
    tenantName: string
    tenantSub: string
    chatTag: string
    bubbles: string[]
    metrics: {
      firstReplyLabel: string
      firstReplyValue: string
      firstReplyChip: string
      intentLabel: string
      intentValue: string
      intentConfidence: string
      intentPercentage: number
      nextActionLabel: string
      nextActionTitle: string
      nextActionSub: string
    }
  }
  integrations: {
    label: string
  }
  liveDemo: {
    kicker: string
    h2: string
    lead: string
    demoScriptChip: string
    systems: Array<{
      id: string
      title: string
    }>
  }
  catalog: {
    kicker: string
    h2: string
    lead: string
    tabs: {
      all: string
      core: string
      preview: string
    }
    usdCaption: string
    viewPricingLink: string
  }
  howItWorks: {
    kicker: string
    h2: string
    steps: Array<{
      num: string
      title: string
      desc: string
    }>
  }
  pricing: {
    kicker: string
    h2: string
    caption: string
    studioLinkText: string
    customBuildText: string
    trialButtonText: string
    customButtonText: string
    disclaimer: string
  }
  cta: {
    h2: string
    lead: string
    primaryButton: string
    whatsappButton: string
  }
  footer: {
    tagline: string
    copyright: string
    columns: {
      product: {
        title: string
        links: Array<{ label: string; href: string }>
      }
      company: {
        title: string
        links: Array<{ label: string; href: string }>
      }
      legal: {
        title: string
        links: Array<{ label: string; href: string }>
      }
    }
  }
}

export const marketingCopy: Record<'en' | 'ar', MarketingCopy> = {
  en: {
    nav: {
      brand: 'Helix',
      links: {
        systems: 'Systems',
        leadgen: 'Lead Gen',
        howItWorks: 'How it works',
        pricing: 'Pricing',
        studio: 'Studio',
      },
      langToggle: 'عربي',
      signIn: 'Sign in',
      console: 'Console',
      cta: 'Build my system →',
    },
    hero: {
      eyebrow: 'New · Lead Gen v2 — enrich websites or find leads by search ›',
      titlePrefix: 'AI systems that answer, qualify and book — ',
      titleEmphasis: 'in Arabic and English.',
      lead: 'Helix builds and runs WhatsApp & voice receptionists, lead generation and CRM automations on n8n — with a console that shows exactly what every agent did.',
      primaryCta: 'Build my system →',
      secondaryCta: '▷ Watch a live run',
      microCopy: '7-day unrestricted trial · No credit card required · Gulf Arabic + English',
    },
    productWindow: {
      title: 'helix · console / Live run — Missed-call triage',
      sampleChip: 'SAMPLE RUN',
      streamingChip: 'Streaming',
      pipelineTitle: 'PIPELINE',
      steps: [
        {
          title: 'Missed call detected',
          time: '00:00.012',
          badge: 'Vapi SIP ✓',
          status: 'done',
        },
        {
          title: 'Caller parsed · AE',
          time: '00:00.045',
          badge: 'HMAC verified ✓',
          status: 'done',
        },
        {
          title: 'WhatsApp sent (ar_AE)',
          time: '00:00.134',
          badge: 'template ✓',
          status: 'done',
        },
        {
          title: 'Qualifying intent…',
          time: 'Gulf Arabic dialect',
          badge: 'running',
          status: 'running',
        },
        {
          title: 'Book on Cal.com',
          time: 'waiting',
          badge: 'waiting',
          status: 'waiting',
        },
        {
          title: 'Write to CRM',
          time: 'waiting',
          badge: 'waiting',
          status: 'waiting',
        },
      ],
      tenantName: 'WhatsApp · +971 50 *** 4182',
      tenantSub: 'Dental clinic · example tenant',
      chatTag: 'Arabic · Gulf',
      bubbles: [
        'مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟',
        'أبغى أحجز موعد تنظيف أسنان بكرة العصر',
        'تمام! عندنا ٤:٣٠ أو ٥:١٥ مساءً. أي وقت يناسبك؟',
        '٥:١٥ ممتاز',
      ],
      metrics: {
        firstReplyLabel: 'First reply',
        firstReplyValue: '4.2s',
        firstReplyChip: 'SAMPLE VALUE',
        intentLabel: 'Intent',
        intentValue: 'Booking · cleaning',
        intentConfidence: 'Probable',
        intentPercentage: 72,
        nextActionLabel: 'Next action',
        nextActionTitle: 'Hold 17:15 on Cal.com',
        nextActionSub: 'Needs confirmation from caller',
      },
    },
    integrations: {
      label: 'PLUGS INTO THE TOOLS YOU ALREADY RUN · integrations, not endorsements',
    },
    liveDemo: {
      kicker: 'LIVE DEMO',
      h2: 'Watch a system run, step by step.',
      lead: 'Every webhook, decision and message is logged. Pick a system and replay a scripted run — the same trace your team sees in the console.',
      demoScriptChip: 'DEMO SCRIPT',
      systems: [
        { id: '01', title: '01 Missed-call triage' },
        { id: '02', title: '02 Voice receptionist' },
        { id: '11', title: '11 Lead qualification' },
      ],
    },
    catalog: {
      kicker: 'SYSTEMS CATALOG',
      h2: 'Production systems, not chatbots.',
      lead: 'Each system is an n8n workflow + a Helix console module. Start with one.',
      tabs: {
        all: 'All',
        core: 'Core',
        preview: 'Preview add-ons',
      },
      usdCaption: 'Per-system pricing · USD · one-time setup + monthly',
      viewPricingLink: 'View monthly bundle plans →',
    },
    howItWorks: {
      kicker: 'HOW IT WORKS',
      h2: 'From brief to live system — you see every step.',
      steps: [
        {
          num: '01',
          title: 'Describe the workflow',
          desc: 'Answer a short brief at helixx.xo.je/build: channels, languages, calendar, CRM.',
        },
        {
          num: '02',
          title: 'We build it on n8n',
          desc: 'Workflows, prompts and templates wired to your WhatsApp number and tools.',
        },
        {
          num: '03',
          title: 'Test on your phone',
          desc: 'Call, message and try to break it — in Arabic and English — before going live.',
        },
        {
          num: '04',
          title: 'Run it in the console',
          desc: 'Every action logged with evidence bands. Weekly report, human review queue.',
        },
      ],
    },
    pricing: {
      kicker: 'OFFER PACKS',
      h2: 'Start with 7 days, unrestricted.',
      caption: 'Monthly plans · AED',
      studioLinkText: 'Browse per-system pricing in Studio →',
      customBuildText: "Custom build — let's scope it →",
      trialButtonText: 'Start 7-day trial',
      customButtonText: 'Build my system ↗',
      disclaimer: 'Prices rendered from platform tiers — confirm before launch.',
    },
    cta: {
      h2: "Tell us the workflow. We'll build the system.",
      lead: 'Five-minute brief. You get a scoped plan in English or Arabic.',
      primaryButton: 'Start at helixx.xo.je/build ↗',
      whatsappButton: 'Talk to us on WhatsApp',
    },
    footer: {
      tagline: 'Autonomous AI receptionists, missed-call triage, and revenue workflows built on n8n for high-growth teams in the GCC and MENA.',
      copyright: `© ${new Date().getFullYear()} Helix AI. All rights reserved.`,
      columns: {
        product: {
          title: 'Product',
          links: [
            { label: 'Systems', href: '/#systems' },
            { label: 'Studio Sandbox', href: '/studio' },
            { label: 'Live Demo', href: '/#demo' },
            { label: 'Integrations', href: '/#integrations' },
            { label: 'Pricing', href: '/pricing' },
          ],
        },
        company: {
          title: 'Company',
          links: [
            { label: 'About', href: '/about' },
            { label: 'Updates & Releases', href: '/updates' },
            { label: 'FAQ', href: '/faq' },
            { label: 'Contact', href: '/contact' },
          ],
        },
        legal: {
          title: 'Legal',
          links: [
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Privacy Policy', href: '/privacy' },
          ],
        },
      },
    },
  },
  ar: {
    nav: {
      brand: 'Helix',
      links: {
        systems: 'الأنظمة',
        leadgen: 'توليد العملاء',
        howItWorks: 'كيف نعمل',
        pricing: 'الأسعار',
        studio: 'الاستوديو',
      },
      langToggle: 'EN',
      signIn: 'تسجيل الدخول',
      console: 'لوحة التحكم',
      cta: 'ابنِ نظامك ←',
    },
    hero: {
      eyebrow: 'جديد · توليد العملاء v2 — أثرِ بيانات المواقع أو ابحث عن عملاء جدد ›',
      titlePrefix: 'أنظمة ذكاء اصطناعي تردّ وتؤهّل وتحجز — ',
      titleEmphasis: 'بالعربي والإنجليزي.',
      lead: 'نبني ونشغّل موظفي استقبال على واتساب والهاتف، وتوليد العملاء، وأتمتة إدارة العملاء على n8n — مع لوحة تحكم تُظهر بالضبط ما فعله كل وكيل.',
      primaryCta: 'ابنِ نظامك ←',
      secondaryCta: '▷ شاهد تشغيلاً مباشراً',
      microCopy: 'تجربة ٧ أيام بلا قيود · بدون بطاقة ائتمان · عربي خليجي + إنجليزي',
    },
    productWindow: {
      title: 'helix · console / تشغيل مباشر — فرز المكالمات الفائتة',
      sampleChip: 'تشغيل تجريبي',
      streamingChip: 'مباشر',
      pipelineTitle: 'مسار التنفيذ',
      steps: [
        {
          title: 'رُصدت مكالمة فائتة',
          time: '00:00.012',
          badge: 'Vapi SIP ✓',
          status: 'done',
        },
        {
          title: 'تحليل المتصل · الإمارات',
          time: '00:00.045',
          badge: 'تم التحقق من التوقيع ✓',
          status: 'done',
        },
        {
          title: 'أُرسلت رسالة واتساب',
          time: '00:00.134',
          badge: 'ar_AE · قالب ✓',
          status: 'done',
        },
        {
          title: 'جارٍ تحديد النية...',
          time: 'لهجة خليجية',
          badge: 'قيد المعالجة',
          status: 'running',
        },
        {
          title: 'الحجز على Cal.com',
          time: 'في الانتظار',
          badge: 'في الانتظار',
          status: 'waiting',
        },
        {
          title: 'التسجيل في CRM',
          time: 'في الانتظار',
          badge: 'في الانتظار',
          status: 'waiting',
        },
      ],
      tenantName: 'واتساب · +971 50 *** 4182',
      tenantSub: 'عيادة أسنان · عميل تجريبي',
      chatTag: 'عربي · خليجي',
      bubbles: [
        'مرحباً! لاحظنا اتصالك قبل قليل. كيف نقدر نساعدك؟',
        'أبغى أحجز موعد تنظيف أسنان بكرة العصر',
        'تمام! عندنا ٤:٣٠ أو ٥:١٥ مساءً. أي وقت يناسبك؟',
        '٥:١٥ ممتاز',
      ],
      metrics: {
        firstReplyLabel: 'أول رد',
        firstReplyValue: '4.2 ث',
        firstReplyChip: 'قيمة تجريبية',
        intentLabel: 'النية',
        intentValue: 'حجز · تنظيف',
        intentConfidence: 'مرجّح',
        intentPercentage: 72,
        nextActionLabel: 'الإجراء التالي',
        nextActionTitle: 'حجز مبدئي ٥:١٥ على Cal.com',
        nextActionSub: 'بانتظار تأكيد المتصل',
      },
    },
    integrations: {
      label: 'يتكامل مع الأدوات التي تستخدمها · تكاملات وليست شراكات',
    },
    liveDemo: {
      kicker: 'عرض توضيحي حي',
      h2: 'شاهد النظام يعمل، خطوة بخطوة.',
      lead: 'كل خطوة وقرار ورسالة مسجلة بالكامل. اختر نظاماً وشاهد مسار التنفيذ كما يظهر لفريقك في لوحة التحكم.',
      demoScriptChip: 'سيناريو تجريبي',
      systems: [
        { id: '01', title: '٠١ فرز المكالمات الفائتة' },
        { id: '02', title: '٠٢ موظف الاستقبال الصوتي' },
        { id: '11', title: '١١ تأهيل العملاء المحتملين' },
      ],
    },
    catalog: {
      kicker: 'كتالوج الأنظمة',
      h2: 'أنظمة إنتاجية حقيقية، وليست مجرد روبوتات محادثة.',
      lead: 'كل نظام عبارة عن مسار عمل n8n مخصص + وحدة في لوحة تحكم Helix. ابدأ بنظام واحد.',
      tabs: {
        all: 'الكل',
        core: 'الأساسية',
        preview: 'إضافات تجريبية',
      },
      usdCaption: 'تسعير لكل نظام · دولار أمريكي · إعداد لمرة واحدة + شهري',
      viewPricingLink: 'عرض باقات الاشتراكات الشهرية ←',
    },
    howItWorks: {
      kicker: 'كيف نعمل',
      h2: 'من الملخص إلى نظام حي — ترى كل خطوة بوضوح.',
      steps: [
        {
          num: '01',
          title: 'اشرح مسار العمل',
          desc: 'إجابة مختصرة على استبيان helixx.xo.je/build: القنوات، اللغات، التقويم، ونظام CRM.',
        },
        {
          num: '02',
          title: 'نبنيه على n8n',
          desc: 'مسارات عمل وأوامر ذكاء اصطناعي وقوالب متصلة برقم واتساب وأدواتك.',
        },
        {
          num: '03',
          title: 'اختبره على هاتفك',
          desc: 'اتصل وأرسل رسائل واختبر كل الاحتمالات — بالعربي والإنجليزي — قبل الإطلاق.',
        },
        {
          num: '04',
          title: 'شغّله في لوحة التحكم',
          desc: 'كل إجراء موثق بالأدلة الكاملة. تقرير أسبوعي، وقائمة مراجعة للمشرفين.',
        },
      ],
    },
    pricing: {
      kicker: 'باقات الخدمة',
      h2: 'ابدأ بتجربة ٧ أيام، بلا أي قيود.',
      caption: 'خطط شهرية · درهم إماراتي',
      studioLinkText: 'تصفح أسعار الأنظمة المستقلة في الاستوديو ←',
      customBuildText: 'بناء مخصص — لنتحدث عنه ←',
      trialButtonText: 'ابدأ تجربة ٧ أيام',
      customButtonText: 'ابنِ نظامك ↗',
      disclaimer: 'الأسعار معروضة وفق باقات المنصة المعتمدة — يُرجى التأكيد قبل الإطلاق.',
    },
    cta: {
      h2: 'أخبرنا بمسار العمل. وسنبني لك النظام.',
      lead: 'ملخص في خمس دقائق. تحصل على خطة عمل واضحة بالعربي أو الإنجليزي.',
      primaryButton: 'ابدأ عبر helixx.xo.je/build ↗',
      whatsappButton: 'تحدث معنا على واتساب',
    },
    footer: {
      tagline: 'أنظمة استقبال ذكية، فرز المكالمات الفائتة، وأتمتة مسارات الإيرادات على n8n لفرق العمل المتميزة في الخليج والشرق الأوسط.',
      copyright: `© ${new Date().getFullYear()} Helix AI. جميع الحقوق محفوظة.`,
      columns: {
        product: {
          title: 'المنتج',
          links: [
            { label: 'الأنظمة', href: '/#systems' },
            { label: 'استوديو الأنظمة', href: '/studio' },
            { label: 'العرض التوضيحي', href: '/#demo' },
            { label: 'التكاملات', href: '/#integrations' },
            { label: 'الأسعار', href: '/pricing' },
          ],
        },
        company: {
          title: 'الشركة',
          links: [
            { label: 'من نحن', href: '/about' },
            { label: 'التحديثات والإصدارات', href: '/updates' },
            { label: 'الأسئلة الشائعة', href: '/faq' },
            { label: 'اتصل بنا', href: '/contact' },
          ],
        },
        legal: {
          title: 'قانوني',
          links: [
            { label: 'شروط الخدمة', href: '/terms' },
            { label: 'سياسة الخصوصية', href: '/privacy' },
          ],
        },
      },
    },
  },
}
