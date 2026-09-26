import type { Metadata } from 'next'
import { LegalDocument, type LegalSection } from '@/components/marketing/legal-document'

export const metadata: Metadata = {
  title: 'Terms: Helix',
  description: 'The terms for using Helix systems, in plain language.',
}

const SECTIONS: LegalSection[] = [
  {
    id: 'agreement',
    titleEn: 'The agreement',
    titleAr: 'الاتفاق',
    paragraphsEn: [
      'These terms cover the public site and a discovery call. The system we build for you is covered by the written quote you accept. If the two differ, the signed quote wins.',
      'If you use the site for a business, you confirm you can agree on its behalf.',
    ],
    paragraphsAr: [
      'تغطي هذه الشروط الموقع العام والمكالمة التعريفية. النظام الذي نبنيه لك يغطيه عرض السعر المكتوب الذي تقبله. إذا اختلفا، يُعتد بالعرض الموقّع.',
      'إذا استخدمت الموقع لنشاط تجاري، فأنت تؤكد أنك تستطيع الموافقة نيابة عنه.',
    ],
  },
  {
    id: 'service',
    titleEn: 'What Helix does',
    titleAr: 'ماذا تفعل Helix',
    paragraphsEn: [
      'We design, build and run systems that reply on WhatsApp or by phone, qualify enquiries, and book from your real calendar. A person on your team can take over any conversation.',
      'Anything uncertain waits for someone on your team. It is not saved as fact.',
    ],
    paragraphsAr: [
      'نصمم ونبني ونشغّل أنظمة ترد على واتساب أو بالهاتف، وتؤهّل الاستفسارات، وتحجز من تقويمك الحقيقي. يمكن لشخص من فريقك أن يتسلم أي محادثة.',
      'أي شيء غير مؤكد ينتظر أحداً من فريقك. لا يُحفظ كحقيقة.',
    ],
  },
  {
    id: 'yours',
    titleEn: 'What you do',
    titleAr: 'ماذا تفعل أنت',
    paragraphsEn: [
      'You give us accurate services, hours, and the WhatsApp number and calendar we should use. You make sure you have the right to message the people we contact, and that “stop” is honoured.',
      'You are responsible for what your team sends after a hand-off.',
    ],
    paragraphsAr: [
      'تعطينا خدمات وساعات دقيقة، ورقم واتساب والتقويم الذي ينبغي استخدامه. وتتأكد أن لديك الحق في مراسلة من نتواصل معهم، وأن طلب الإيقاف يُحترم.',
      'أنت مسؤول عما يرسله فريقك بعد التحويل.',
    ],
  },
  {
    id: 'data',
    titleEn: 'Customer records',
    titleAr: 'سجلات العملاء',
    paragraphsEn: [
      'Your customers’ conversations and bookings are yours. We use them only to run the system. Each workspace is kept separate from other clients.',
      'After go-live you keep the setup, the connections and the runbooks, as the quote describes.',
    ],
    paragraphsAr: [
      'محادثات عملائك وحجوزاتهم ملكك. نستخدمها فقط لتشغيل النظام. تُفصل كل مساحة عمل عن عملاء آخرين.',
      'بعد الإطلاق يبقى الإعداد والربط وأدلة التشغيل ملكك، كما يصف عرض السعر.',
    ],
    review: 'Confirm ownership wording against the signed quote before publication.',
  },
  {
    id: 'fees',
    titleEn: 'Fees',
    titleAr: 'الرسوم',
    paragraphsEn: [
      'Fees are the one-time setup and the monthly amount in your written quote, in the currency that quote names. Payment is arranged in that quote. This website does not open a workspace by itself.',
      'If a plan has a conversation limit, we tell you what happens when you pass it before any extra charge.',
    ],
    paragraphsAr: [
      'الرسوم هي إعداد لمرة واحدة والمبلغ الشهري في عرض السعر المكتوب، بالعملة التي يسميها العرض. هذا الموقع لا يبدأ تجربة ولا يأخذ بطاقة.',
      'إذا كان للباقة حد محادثات، نخبرك بما يحدث عند تجاوزه قبل أي رسم إضافي.',
    ],
    review: 'Overage rules are not confirmed. Do not add a price or a penalty until Ziad confirms them.',
  },
  {
    id: 'end',
    titleEn: 'Ending the service',
    titleAr: 'إنهاء الخدمة',
    paragraphsEn: [
      'Either of us can end the monthly service as the quote describes. We will hand you the setup and a copy of the records the quote says are yours.',
    ],
    paragraphsAr: [
      'يمكن لأي منا إنهاء الخدمة الشهرية كما يصف عرض السعر. نسلّمك الإعداد ونسخة من السجلات التي يقول العرض إنها ملكك.',
    ],
    review: 'Notice period for cancellation must match the signed agreement. Do not invent a number of days here.',
  },
  {
    id: 'limits',
    titleEn: 'Limits',
    titleAr: 'حدود المسؤولية',
    paragraphsEn: [
      'We run the system with care. We do not promise that every caller will book, or that a reply will arrive in a fixed number of seconds. The signed quote states what we are responsible for.',
    ],
    paragraphsAr: [
      'نشغّل النظام بعناية. لا نعد بأن كل متصل سيحجز، ولا أن الرد يصل خلال عدد ثابت من الثواني. عرض السعر الموقّع يبيّن ما نتحمّل مسؤوليته.',
    ],
    review: 'Limitation of liability must be drafted by counsel for the law named in the signed agreement.',
  },
  {
    id: 'law',
    titleEn: 'Which law applies',
    titleAr: 'أي قانون يُطبق',
    paragraphsEn: [
      'The agreement you sign names the law that applies. This page does not choose a court or a country for you.',
    ],
    paragraphsAr: [
      'الاتفاق الذي توقّعه يسمّي القانون الذي يُطبق. هذه الصفحة لا تختار محكمة أو بلداً نيابة عنك.',
    ],
    review: 'Do not add a city, court, or company address until counsel provides them.',
  },
]

export default function TermsPage() {
  return (
          <LegalDocument
        kickerEn="Terms"
        kickerAr="الشروط"
        titleEn="Terms"
        titleAr="الشروط"
        updatedEn="Last updated 26 September 2026"
        updatedAr="آخر تحديث 26 سبتمبر 2026"
        sections={SECTIONS}
      />
      )
}
