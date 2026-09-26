import type { Metadata } from 'next'
import { LegalDocument, type LegalSection } from '@/components/marketing/legal-document'
import { SitePage } from '@/components/marketing/site-page'

export const metadata: Metadata = {
  title: 'Privacy — Helix',
  description: 'How Helix handles conversations, bookings and account details.',
}

const SECTIONS: LegalSection[] = [
  {
    id: 'who',
    titleEn: 'Who we are',
    titleAr: 'من نحن',
    paragraphsEn: [
      'Helix builds and runs systems that reply, qualify and book for businesses in the GCC and MENA. This page explains what we hold when you talk to us or use a system we run for you.',
    ],
    paragraphsAr: [
      'تبني Helix وتشغّل أنظمة ترد وتؤهّل وتحجز للأعمال في الخليج والشرق الأوسط. تشرح هذه الصفحة ما نحتفظ به عندما تتواصل معنا أو تستخدم نظاماً نشغّله لك.',
    ],
  },
  {
    id: 'collect',
    titleEn: 'What we keep',
    titleAr: 'ماذا نحتفظ به',
    paragraphsEn: [
      'When you book a discovery call, we keep the name, business, city, WhatsApp number and note you send us.',
      'When a system is live, we keep the conversations, bookings and hand-offs needed to run it, plus the account details of the people you invite.',
    ],
    paragraphsAr: [
      'عندما تحجز مكالمة تعريفية، نحتفظ بالاسم والنشاط والمدينة ورقم واتساب والملاحظة التي ترسلها.',
      'عندما يعمل النظام، نحتفظ بالمحادثات والحجوزات والتحويلات اللازمة لتشغيله، وبتفاصيل حساب من تدعوهم.',
    ],
  },
  {
    id: 'use',
    titleEn: 'How we use it',
    titleAr: 'كيف نستخدمه',
    paragraphsEn: [
      'We use it to reply to you, to run the system you asked for, and to show your team what happened. We do not sell your customer list.',
    ],
    paragraphsAr: [
      'نستخدمه للرد عليك، ولتشغيل النظام الذي طلبته، ولعرض ما حدث على فريقك. لا نبيع قائمة عملائك.',
    ],
  },
  {
    id: 'keep',
    titleEn: 'How long we keep it',
    titleAr: 'إلى متى نحتفظ به',
    paragraphsEn: [
      'We keep conversation and booking records for the period written in your agreement. When that period ends, we delete them or return them to you.',
    ],
    paragraphsAr: [
      'نحتفظ بسجلات المحادثات والحجوزات للمدة المكتوبة في اتفاقك. عند انتهائها نحذفها أو نعيدها إليك.',
    ],
    review: 'Confirm the default retention period with counsel before stating a number of days.',
  },
  {
    id: 'share',
    titleEn: 'Who else sees it',
    titleAr: 'من يراه غيرنا',
    paragraphsEn: [
      'We share what is needed with the phone, WhatsApp, calendar and hosting providers that run your system. Those providers are named in your agreement.',
      'Your team sees the conversations and bookings in your dashboard.',
    ],
    paragraphsAr: [
      'نشارك ما يلزم مع مزودي الهاتف وواتساب والتقويم والاستضافة الذين يشغّلون نظامك. تُذكر أسماؤهم في اتفاقك.',
      'فريقك يرى المحادثات والحجوزات في لوحتك.',
    ],
    review: 'List the actual providers before publication. Do not invent a company address.',
  },
  {
    id: 'choices',
    titleEn: 'Your choices',
    titleAr: 'خياراتك',
    paragraphsEn: [
      'You can ask for a copy of what we hold, or ask us to delete it, from the contact page. Customers of your business can ask you, and we will help you answer.',
    ],
    paragraphsAr: [
      'يمكنك أن تطلب نسخة مما نحتفظ به، أو أن تطلب حذفه، من صفحة التواصل. عملاء نشاطك يسألونك، ونساعدك على الرد.',
    ],
  },
  {
    id: 'security',
    titleEn: 'How it is protected',
    titleAr: 'كيف يُحمى',
    paragraphsEn: [
      'Each client workspace is kept separate from the others. Records are protected while they move and while they are stored. The exact controls are described in your agreement.',
    ],
    paragraphsAr: [
      'تُفصل مساحة كل عميل عن غيرها. تُحمى السجلات أثناء انتقالها وأثناء تخزينها. تُذكر الضوابط الدقيقة في اتفاقك.',
    ],
    review: 'Counsel should confirm which protection statements we can make. Do not name a specific encryption product here until that review.',
  },
]

export default function PrivacyPage() {
  return (
    <SitePage>
      <LegalDocument
        kickerEn="Privacy"
        kickerAr="الخصوصية"
        titleEn="Privacy"
        titleAr="الخصوصية"
        updatedEn="Last updated 26 September 2026"
        updatedAr="آخر تحديث 26 سبتمبر 2026"
        sections={SECTIONS}
      />
    </SitePage>
  )
}
