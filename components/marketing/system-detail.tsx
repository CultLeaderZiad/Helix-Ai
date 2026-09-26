'use client'

import Link from 'next/link'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { QaAccordion } from '@/components/marketing/qa-accordion'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import { formatUsdFromCents } from '@/lib/studio/templates'
import { MessageCircle } from 'lucide-react'

export interface SystemDetailModel {
  id: string
  name: string
  nameAr: string
  tagline: string
  taglineAr: string
  vertical: string
  verticalAr: string
  setupFeeCents: number
  monthlyRetainerCents: number
}

type Pair = { en: string; ar: string }
type Step = { title: Pair; body: Pair }

const COPY: Record<string, {
  outcome: Pair
  steps: Step[]
  rules: Pair[]
  needs: Pair[]
  activity: Pair[]
  faqs: { q: Pair; a: Pair }[]
}> = {
  'missed-call-responder': {
    outcome: { en: 'Every missed call gets a reply within seconds.', ar: 'كل مكالمة فائتة يصلها رد خلال ثوانٍ.' },
    steps: [
      { title: { en: 'A call is missed', ar: 'تفوتك مكالمة' }, body: { en: 'Your phone system tells Helix the moment a call goes unanswered, day or night.', ar: 'يُبلغ نظام الهاتف لديك Helix فور عدم الرد، ليلاً أو نهاراً.' } },
      { title: { en: 'WhatsApp reply, in their language', ar: 'رد على واتساب بلغة العميل' }, body: { en: 'The reply uses the dialect they wrote in, Arabic or English.', ar: 'الرد بلهجتهم، بالعربي أو الإنجليزي.' } },
      { title: { en: 'It asks the right questions', ar: 'يسأل الأسئلة الصحيحة' }, body: { en: 'Which service, how soon, and whether they are new or returning.', ar: 'أي خدمة، ومتى، وهل الزيارة جديدة أم سابقة.' } },
      { title: { en: 'Booked, or handed to your team', ar: 'حجز أو تحويل لفريقك' }, body: { en: 'A clear request can take a real slot. Anything unclear comes to you with the full conversation.', ar: 'الطلب الواضح يأخذ موعداً حقيقياً. وغير الواضح يصلك مع المحادثة كاملة.' } },
    ],
    rules: [
      { en: 'Quiet hours. It does not message people in the middle of the night.', ar: 'ساعات هدوء. لا يراسل أحداً في منتصف الليل.' },
      { en: '“Stop” and «إيقاف» end the thread.', ar: '«إيقاف» وstop ينهيان المحادثة.' },
      { en: 'بشري or “agent” hands the chat to your team.', ar: '«بشري» أو agent يحوّل المحادثة لفريقك.' },
      { en: 'It does not invent appointment times.', ar: 'لا يخترع أوقات مواعيد.' },
    ],
    needs: [
      { en: 'Your WhatsApp Business number', ar: 'رقم واتساب للأعمال الخاص بك' },
      { en: 'Missed-call alerts from your phone system', ar: 'تنبيهات المكالمات الفائتة من نظام هاتفك' },
      { en: 'Your services and opening hours', ar: 'خدماتك وساعات العمل' },
      { en: 'Who should receive a hand-off', ar: 'من يستلم المحادثة عند التحويل' },
    ],
    activity: [
      { en: 'Replied to a missed call', ar: 'تم الرد على مكالمة فائتة' },
      { en: 'Asked which service they needed', ar: 'سأل عن الخدمة المطلوبة' },
      { en: 'Handed to your team: asked for a person', ar: 'تم التحويل لفريقك: طلب التحدث مع شخص' },
    ],
    faqs: [
      { q: { en: 'Do I need a new phone number?', ar: 'هل أحتاج رقم هاتف جديداً؟' }, a: { en: 'In most setups, no. We connect to the phone system you already use and reply from your WhatsApp Business number.', ar: 'في معظم الحالات لا. نربط النظام بهاتفك الحالي ونرد من رقم واتساب للأعمال الخاص بك.' } },
      { q: { en: 'What if the caller wants a person?', ar: 'ماذا لو أراد المتصل شخصاً؟' }, a: { en: 'The conversation moves to your team with the full history. Nothing unclear is saved as fact.', ar: 'تنتقل المحادثة لفريقك مع سجلها كاملاً. لا يُحفظ شيء غير واضح كحقيقة.' } },
    ],
  },
  'booking-receptionist': {
    outcome: { en: 'Calls become appointments on your real calendar.', ar: 'المكالمات تصبح مواعيد على تقويمك الحقيقي.' },
    steps: [
      { title: { en: 'An inbound call, in Arabic or English', ar: 'مكالمة واردة بالعربي أو الإنجليزي' }, body: { en: 'The caller asks for a service. The reply stays in their dialect.', ar: 'المتصل يطلب خدمة، والرد يبقى بلهجته.' } },
      { title: { en: 'It checks your real availability', ar: 'يراجع توفرك الحقيقي' }, body: { en: 'Only open slots from your calendar are offered.', ar: 'يعرض المواعيد المفتوحة في تقويمك فقط.' } },
      { title: { en: 'The slot is taken immediately', ar: 'يُحجز الموعد في لحظته' }, body: { en: 'The caller picks one of those slots. Nothing else is offered.', ar: 'يختار المتصل أحد تلك المواعيد. لا يُعرض غيره.' } },
      { title: { en: 'WhatsApp confirmation', ar: 'تأكيد على واتساب' }, body: { en: 'They get the time, and a reminder the day before.', ar: 'يصله الوقت، وتذكير قبل الموعد بيوم.' } },
    ],
    rules: [
      { en: 'It never invents slots. If the calendar is closed, it says so.', ar: 'لا يخترع مواعيد. إذا كان التقويم مغلقاً يقول ذلك.' },
      { en: 'Quiet hours, and “stop” / «إيقاف» are honoured.', ar: 'ساعات هدوء، ويُحترم «إيقاف» وstop.' },
      { en: 'بشري or “agent” brings your team in with the full conversation.', ar: '«بشري» أو agent يُدخل فريقك مع المحادثة كاملة.' },
    ],
    needs: [
      { en: 'Your WhatsApp Business number', ar: 'رقم واتساب للأعمال الخاص بك' },
      { en: 'Calendar access (Cal.com or Google)', ar: 'الوصول إلى التقويم (Cal.com أو Google)' },
      { en: 'Your services, durations and hours', ar: 'خدماتك ومددها وساعاتك' },
      { en: 'Missed-call or inbound call connection', ar: 'ربط المكالمات الواردة أو الفائتة' },
    ],
    activity: [
      { en: 'Booked a consultation · Sun 11:00 AM', ar: 'تم حجز استشارة · الأحد 11:00 ص' },
      { en: 'Confirmation sent on WhatsApp', ar: 'أُرسل التأكيد على واتساب' },
      { en: 'Reminder set for the day before', ar: 'تم ضبط تذكير قبل الموعد بيوم' },
    ],
    faqs: [
      { q: { en: 'Can it offer times I did not open?', ar: 'هل يعرض أوقاتاً لم أفتحها؟' }, a: { en: 'No. It only offers open slots from your calendar.', ar: 'لا. يعرض فقط المواعيد المفتوحة في تقويمك.' } },
      { q: { en: 'What languages does the call use?', ar: 'بأي لغة تكون المكالمة؟' }, a: { en: 'Gulf Arabic and English, including a mix of both.', ar: 'الخليجية والإنجليزية، بما في ذلك المزيج بينهما.' } },
    ],
  },
  'lead-attribution': {
    outcome: { en: 'Every new lead is scored before your team spends time on it.', ar: 'كل عميل جديد يُقيَّم قبل أن يصرف فريقك وقته عليه.' },
    steps: [
      { title: { en: 'A new lead arrives', ar: 'يصل عميل جديد' }, body: { en: 'Instagram, Google, or a website form. The source stays with the lead.', ar: 'من إنستغرام أو بحث أو نموذج الموقع، ويُحفظ المصدر مع العميل.' } },
      { title: { en: 'Three qualifying questions', ar: 'ثلاثة أسئلة للتأهيل' }, body: { en: 'Service, timing, and whether they are ready to book.', ar: 'الخدمة، والتوقيت، وهل هو جاهز للحجز.' } },
      { title: { en: 'Scored, then routed', ar: 'يُقيَّم ثم يُوجَّه' }, body: { en: 'Hot leads go to your team. Others get a nurture reply.', ar: 'العميل المهتم يصل لفريقك، وغيره تصله رسالة متابعة.' } },
      { title: { en: 'Booked, or nurtured', ar: 'حجز أو متابعة' }, body: { en: 'A ready lead gets a real slot. Everyone else stays on a respectful follow-up.', ar: 'الجاهز يحصل على موعد حقيقي، والبقية تبقى على متابعة محترمة.' } },
    ],
    rules: [
      { en: 'The source of the lead is kept. It is not guessed.', ar: 'يُحفظ مصدر العميل. لا يُخمَّن.' },
      { en: 'Opt-in for follow-up messages, and “stop” / «إيقاف» are honoured.', ar: 'المتابعة بموافقة، ويُحترم «إيقاف» وstop.' },
      { en: 'بشري or “agent” hands the conversation to your team.', ar: '«بشري» أو agent يحوّل المحادثة لفريقك.' },
    ],
    needs: [
      { en: 'Where leads arrive (ads, forms, or WhatsApp)', ar: 'من أين يصل العملاء (إعلانات أو نماذج أو واتساب)' },
      { en: 'Your WhatsApp Business number', ar: 'رقم واتساب للأعمال الخاص بك' },
      { en: 'The questions that matter for your service', ar: 'الأسئلة التي تهم خدمتك' },
      { en: 'Who should receive a hot lead', ar: 'من يستلم العميل المهتم' },
    ],
    activity: [
      { en: 'New lead from an Instagram ad · Hot', ar: 'عميل جديد من إعلان إنستغرام · ساخن' },
      { en: 'Asked three qualifying questions', ar: 'طرح ثلاثة أسئلة للتأهيل' },
      { en: 'Routed to your team', ar: 'وُجّه إلى فريقك' },
    ],
    faqs: [
      { q: { en: 'Does it invent where a lead came from?', ar: 'هل يخترع مصدر العميل؟' }, a: { en: 'No. The source that arrived with the lead is the source you see.', ar: 'لا. المصدر الذي وصل مع العميل هو الذي تراه.' } },
      { q: { en: 'What happens to leads that are not ready?', ar: 'ماذا يحدث لمن ليس جاهزاً؟' }, a: { en: 'They get a respectful follow-up. They are not booked into a fake slot.', ar: 'تصله متابعة محترمة. لا يُحجز في موعد غير حقيقي.' } },
    ],
  },
  'lead-reactivation': {
    outcome: { en: 'Past customers hear from you again, only if they agreed.', ar: 'العملاء السابقون يسمعون منك مجدداً، فقط إذا وافقوا.' },
    steps: [
      { title: { en: 'Someone who opted in', ar: 'شخص وافق على الرسائل' }, body: { en: 'A past enquiry or customer who agreed to hear from you.', ar: 'استفسار أو عميل سابق وافق أن تصله رسالة.' } },
      { title: { en: 'A respectful check-in', ar: 'رسالة متابعة محترمة' }, body: { en: 'One WhatsApp message, in their language, during allowed hours.', ar: 'رسالة واتساب واحدة بلغتهم، في الساعات المسموحة.' } },
      { title: { en: 'If they reply, the conversation continues', ar: 'إذا رد، تستمر المحادثة' }, body: { en: 'A ready reply can move toward a real booking.', ar: 'الرد الجاهز يمكن أن يتجه إلى حجز حقيقي.' } },
      { title: { en: 'Stop ends it', ar: 'الإيقاف ينهيها' }, body: { en: '“Stop” or «إيقاف» stops further messages.', ar: '«إيقاف» أو stop يوقف أي رسالة لاحقة.' } },
    ],
    rules: [
      { en: 'No message without opt-in.', ar: 'لا رسالة من دون موافقة.' },
      { en: 'Quiet hours.', ar: 'ساعات هدوء.' },
      { en: '“Stop” and «إيقاف» are honoured immediately.', ar: 'يُحترم «إيقاف» وstop فوراً.' },
      { en: 'A person takes over when the reply is unclear.', ar: 'يتدخل شخص عندما يكون الرد غير واضح.' },
    ],
    needs: [
      { en: 'A list of people who agreed to be contacted', ar: 'قائمة بمن وافقوا على التواصل' },
      { en: 'Your WhatsApp Business number', ar: 'رقم واتساب للأعمال الخاص بك' },
      { en: 'What you want to offer them', ar: 'ما الذي تريد عرضه عليهم' },
      { en: 'Your hours', ar: 'ساعات عملك' },
    ],
    activity: [
      { en: 'Check-in sent to an opted-in contact', ar: 'أُرسلت متابعة لجهة وافقت' },
      { en: 'They replied: ready next week', ar: 'ردّوا: جاهزون الأسبوع القادم' },
      { en: 'Stop honoured on another thread', ar: 'تم احترام طلب الإيقاف في محادثة أخرى' },
    ],
    faqs: [
      { q: { en: 'Will it message people who never agreed?', ar: 'هل يراسل من لم يوافق؟' }, a: { en: 'No. Only contacts who opted in are included.', ar: 'لا. فقط من وافقوا على الرسائل.' } },
      { q: { en: 'How do they opt out?', ar: 'كيف يوقفون الرسائل؟' }, a: { en: 'They reply “stop” or «إيقاف». That ends the messages.', ar: 'يردّون بـ stop أو «إيقاف». فتتوقف الرسائل.' } },
    ],
  },
  'ar-invoicing': {
    outcome: { en: 'Overdue commercial invoices get a polite follow-up.', ar: 'الفواتير التجارية المتأخرة تصلها متابعة مهذبة.' },
    steps: [
      { title: { en: 'An invoice passes the date you set', ar: 'فاتورة تتجاوز التاريخ الذي حددته' }, body: { en: 'Commercial invoices only. This is not for consumer debt.', ar: 'فواتير تجارية فقط. هذا ليس لتحصيل ديون الأفراد.' } },
      { title: { en: 'A polite WhatsApp reminder', ar: 'تذكير مهذّب على واتساب' }, body: { en: 'It includes the payment link you provide.', ar: 'يتضمن رابط الدفع الذي تقدمه.' } },
      { title: { en: 'Disputes go to your team', ar: 'الاعتراضات تذهب لفريقك' }, body: { en: 'A question or a dispute is handed over with the history.', ar: 'السؤال أو الاعتراض يُحوَّل مع السجل.' } },
      { title: { en: 'Paid invoices stop', ar: 'الفواتير المدفوعة تتوقف' }, body: { en: 'Once you mark it paid, the reminders stop.', ar: 'عندما تعلّمها مدفوعة، تتوقف التذكيرات.' } },
    ],
    rules: [
      { en: 'Business clients only. Never consumer debt.', ar: 'لعملاء الشركات فقط. ليس لديون الأفراد.' },
      { en: 'The tone stays polite.', ar: 'تبقى النبرة مهذبة.' },
      { en: '“Stop” and «إيقاف» end the reminders.', ar: '«إيقاف» وstop يوقفان التذكيرات.' },
      { en: 'بشري or “agent” brings your team in.', ar: '«بشري» أو agent يُدخل فريقك.' },
    ],
    needs: [
      { en: 'The commercial invoices you want followed up', ar: 'الفواتير التجارية التي تريد متابعتها' },
      { en: 'Your WhatsApp Business number', ar: 'رقم واتساب للأعمال الخاص بك' },
      { en: 'A payment link for each invoice', ar: 'رابط دفع لكل فاتورة' },
      { en: 'Who handles a dispute', ar: 'من يعالج الاعتراض' },
    ],
    activity: [
      { en: 'Reminder sent · invoice 14 days overdue', ar: 'أُرسل تذكير · فاتورة متأخرة 14 يوماً' },
      { en: 'Payment link included', ar: 'تم تضمين رابط الدفع' },
      { en: 'Marked paid · reminders stopped', ar: 'عُلّمت مدفوعة · توقفت التذكيرات' },
    ],
    faqs: [
      { q: { en: 'Is this for personal debts?', ar: 'هل هذا للديون الشخصية؟' }, a: { en: 'No. It follows up commercial invoices for business clients only.', ar: 'لا. يتابع الفواتير التجارية لعملاء الشركات فقط.' } },
      { q: { en: 'What if they dispute the invoice?', ar: 'ماذا لو اعترضوا على الفاتورة؟' }, a: { en: 'The conversation is handed to your team. The system does not argue the debt.', ar: 'تُحوَّل المحادثة لفريقك. النظام لا يجادل في الدين.' } },
    ],
  },
}

const LEAD: Record<string, Pair> = {
  'lead-attribution': {
    en: 'Scores every new lead and shows which ad produced the booking.',
    ar: 'يقيّم كل عميل جديد ويُظهر أي إعلان جلب الحجز.',
  },
}

function splitVerticals(value: string) {
  return value.split(/[,،]/).map(part => part.trim()).filter(Boolean).slice(0, 3)
}

export function SystemDetail({ system }: { system: SystemDetailModel }) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const copy = COPY[system.id] ?? COPY['missed-call-responder']
  const leadOverride = LEAD[system.id]
  const t = (pair: Pair) => (ar ? pair.ar : pair.en)
  const name = system.id === 'ar-invoicing' ? (ar ? system.nameAr : 'B2B collections') : (ar ? system.nameAr : system.name)
  const verticals = splitVerticals(ar ? system.verticalAr : system.vertical)
  const setup = formatUsdFromCents(system.setupFeeCents)
  const monthly = formatUsdFromCents(system.monthlyRetainerCents)

  return (
    <>
      <section className="container sys-hero">
        <p className="kicker">
          <Link href="/#systems">{ar ? 'الأنظمة' : 'Systems'}</Link>
          <span aria-hidden="true"> / </span>
          {name}
        </p>
        <h1 className="display">{t(copy.outcome)}</h1>
        <p className="lead">{leadOverride ? t(leadOverride) : ar ? system.taglineAr : system.tagline}</p>
        <div className="cta-row">
          <Link className="btn btn-primary" href={`/contact?systems=${system.id}`}>
            {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}
          </Link>
          <Link className="btn btn-ghost" href="/studio">{ar ? 'افتحه في الاستوديو' : 'Open in Studio'}</Link>
        </div>
        <div className="sys-vignette">
          <span className="ex-chip">{ar ? 'مثال' : 'Example'}</span>
          {copy.activity.map(row => (
            <div className="vrow" key={row.en}>{t(row)}</div>
          ))}
        </div>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'لمن هذا النظام' : "Who it's for"}</h2>
        <div className="who">
          {verticals.map(item => (
            <article key={item}><h3>{ar ? `الأنسب لـ${item}` : `Best for ${item}`}</h3></article>
          ))}
        </div>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'كيف يعمل' : 'How it works'}</h2>
        <div className="steps">
          {copy.steps.map((step, index) => (
            <div className="st" key={step.title.en}>
              <span className="n">{index + 1}</span>
              <b>{t(step.title)}</b>
              <span>{t(step.body)}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'القواعد التي يلتزم بها' : 'The rules it follows'}</h2>
        <ul className="rule-list">
          {copy.rules.map(rule => (
            <li key={rule.en}>{t(rule)}</li>
          ))}
        </ul>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'ما نحتاجه منك' : 'What we need from you'}</h2>
        <ul className="rule-list">
          {copy.needs.map(need => (
            <li key={need.en}>{t(need)}</li>
          ))}
        </ul>
      </section>

      <section className="container sys-block">
        <h2 className="display h2">{ar ? 'ما ستراه في لوحتك' : "What you'll see in your dashboard"}</h2>
        <div className="dash-crop">
          <span className="ex-chip">{ar ? 'بيانات توضيحية' : 'Example data'}</span>
          {copy.activity.map(row => (
            <div className="vrow" key={`dash-${row.en}`}><span className="d" /><span>{t(row)}</span></div>
          ))}
        </div>
      </section>

      <section className="container sys-block">
        <p className="kicker">{ar ? 'تسعير لكل نظام · دولار · إعداد لمرة واحدة + شهري' : 'Per-system pricing · USD · one-time setup + monthly'}</p>
        <div className="price-card">
          <p><bdi dir="ltr">{setup}</bdi> {ar ? 'إعداد' : 'setup'}</p>
          <p><bdi dir="ltr">{monthly}</bdi> {ar ? '/ شهرياً' : '/ month'}</p>
          <p className="faint small">{ar ? 'السعر النهائي يُؤكَّد في المكالمة التعريفية.' : 'Final price confirmed on your discovery call.'}</p>
          <Link className="link" href="/pricing">{ar ? 'تفضل باقة شهرية مجمّعة؟ شاهد الباقات بالدرهم' : 'Prefer a bundled monthly plan? See plans in AED'}</Link>
        </div>
      </section>

      <section className="container sys-block faq">
        <div>
          <span className="kicker">{ar ? 'أسئلة' : 'Questions'}</span>
          <h2 className="display h2" style={{ marginTop: 12 }}>{ar ? 'عن هذا النظام' : 'About this system'}</h2>
        </div>
        <QaAccordion
          idPrefix={`sys-${system.id}`}
          items={copy.faqs.map(item => ({ q: t(item.q), a: t(item.a) }))}
        />
      </section>

      <section className="container sys-block">
        <div className="final">
          <h2 className="display">{ar ? 'نبدأ بمكالمة تعريفية حول هذا النظام.' : 'Start with a discovery call about this system.'}</h2>
          <div className="cta-row">
            <Link className="btn btn-primary" href={`/contact?systems=${system.id}`}>
              {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}
            </Link>
            <WhatsAppCta ar={ar} className="btn btn-ghost" labelEn="Chat on WhatsApp" labelAr="راسلنا على واتساب">
              <MessageCircle size={16} />
            </WhatsAppCta>
          </div>
        </div>
      </section>
    </>
  )
}
