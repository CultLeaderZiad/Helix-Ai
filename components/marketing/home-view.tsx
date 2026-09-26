'use client'

import Link from 'next/link'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import {
  Calendar,
  CalendarCheck,
  ChartColumn,
  Headset,
  House,
  Inbox,
  MessageCircle,
  Mic,
  PhoneMissed,
  Search,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { HelixMark } from '@/components/marketing/helix-mark'
import { QaAccordion } from '@/components/marketing/qa-accordion'
import { WhatsAppCta } from '@/components/marketing/whatsapp-cta'
import { planDisplay, type PricingPlan } from '@/lib/pricing/tiers'

const CHAT = [
  { side: 'in', text: 'مساء الخير، معك عيادة المثال لطب الأسنان. لاحظنا اتصالك قبل قليل ولم نتمكن من الرد. كيف نقدر نخدمك؟', time: '9:41 PM' },
  { side: 'out', text: 'أبغى أحجز تنظيف أسنان هالأسبوع', time: '9:42 PM' },
  { side: 'in', text: 'أكيد. هل هذه أول زيارة لك عندنا؟', time: '9:42 PM' },
  { side: 'out', text: 'إيه، أول مرة', time: '9:42 PM' },
  { side: 'in', text: 'حيّاك الله. المتاح: الأربعاء ٤:٣٠ م أو الخميس ٦:١٥ م. أي وقت يناسبك؟', time: '9:43 PM' },
  { side: 'out', text: 'الخميس ٦:١٥', time: '9:43 PM' },
  { side: 'in', text: 'تم تأكيد موعدك الخميس ٦:١٥ م. بنرسل لك تذكير قبلها بيوم.', time: '9:44 PM' },
]

function money(n: number) {
  return new Intl.NumberFormat('en-US').format(n)
}

type FlowPill = { t: string; ok?: boolean }
type FlowStep = {
  k: string
  kAr: string
  when: string
  whenAr: string
  title: string
  titleAr: string
  icon: ReactNode
  body?: string
  bodyAr?: string
  bubble?: string
  pills?: FlowPill[]
  pillsAr?: FlowPill[]
}

export function HomeView({ plans }: { plans: PricingPlan[] }) {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const [flow, setFlow] = useState(0)
  const stageRef = useRef<HTMLElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(1)
  const [scrub, setScrub] = useState(false)

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = stageRef.current
    if (!el || reduce) {
      setProgress(1)
      setScrub(false)
      return
    }
    setScrub(true)
    const onScroll = () => {
      const rect = el.getBoundingClientRect()
      const total = el.offsetHeight - window.innerHeight
      const seen = total <= 1
        ? (window.innerHeight - rect.top) / (window.innerHeight + el.offsetHeight)
        : -rect.top / total
      setProgress(Math.min(1, Math.max(0, seen)))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const chatGates = [0, 0.28, 0.4, 0.52, 0.62, 0.72]
  const visibleChats = scrub ? CHAT.filter((_, index) => progress >= chatGates[index]).length : CHAT.length
  const missedIn = !scrub || progress >= 0.1
  const bookedIn = !scrub || progress >= 0.8
  const livePath = progress < 0.12
    ? 'helix.ai/live'
    : progress < 0.3
      ? 'helix.ai/live/missed-call'
      : progress < 0.8
        ? 'helix.ai/live/whatsapp'
        : 'helix.ai/live/booked'
  const sceneStep = progress < 0.3 ? 0 : progress < 0.8 ? 1 : 2

  useEffect(() => {
    const body = chatRef.current
    if (!body) return
    body.scrollTop = body.scrollHeight
  }, [visibleChats])

  const faqs = ar
    ? [
        ['هل أحتاج لتغيير رقم هاتفي؟', 'في معظم الحالات لا. نربط النظام بهاتفك الحالي ونرد من رقم واتساب للأعمال الخاص بك، ونؤكد ما يناسب إعدادك في المكالمة التعريفية.'],
        ['ماذا يحدث إذا لم يعرف النظام الإجابة؟', 'يحوّل المحادثة لفريقك مع كامل سجلها، وأي معلومة غير مؤكدة تذهب إلى قائمة المراجعة بدلاً من حفظها كحقيقة.'],
        ['ما اللغات واللهجات المدعومة؟', 'العربية (الخليجية والمصرية والشامية) والإنجليزية، بما في ذلك الرسائل التي تمزج بينهما.'],
        ['كم يستغرق الإعداد؟', 'يعتمد على النظام وأدواتك. بعد المكالمة التعريفية تحصل على خطة مكتوبة بمراحل واضحة.'],
        ['من يملك النظام والبيانات؟', 'أنت. بعد الإطلاق يبقى الإعداد والتكاملات وأدلة التشغيل ملكك.'],
      ]
    : [
        ['Do I need to change my phone number?', 'In most setups, no. We connect to your existing phone system and reply from your WhatsApp Business number. We confirm what is possible with your setup on the discovery call.'],
        ["What happens when the system can't answer?", 'It hands the conversation to your team with the full history. Anything uncertain goes to a review queue instead of being saved as fact.'],
        ['Which languages and dialects?', 'Arabic (Gulf, Egyptian and Levantine) and English, including messages that mix both.'],
        ['How long does setup take?', 'It depends on the system and your tools. After the discovery call you get a written plan with milestones.'],
        ['Who owns the system and the data?', 'You do. After go-live you keep the setup, the integrations and the runbooks.'],
      ]

  const FLOWS: FlowStep[][] = [
    [
      { k: 'STEP 1', kAr: 'الخطوة 1', when: '9:41 PM', whenAr: '9:41 م', title: 'A call is missed', titleAr: 'تفوتك مكالمة', body: 'Your phone system tells Helix the moment a call goes unanswered, day or night.', bodyAr: 'يُبلغ نظام الهاتف لديك Helix فور عدم الرد على أي مكالمة، ليلاً أو نهاراً.', icon: <PhoneMissed size={22} /> },
      { k: 'STEP 2', kAr: 'الخطوة 2', when: 'seconds later', whenAr: 'بعد ثوانٍ', title: 'WhatsApp reply, in their language', titleAr: 'رد على واتساب بلغة العميل', bubble: 'لاحظنا اتصالك قبل قليل. كيف نقدر نخدمك؟', icon: <MessageCircle size={22} /> },
      { k: 'STEP 3', kAr: 'الخطوة 3', when: '2 messages', whenAr: 'رسالتان', title: 'It asks the right questions', titleAr: 'يسأل الأسئلة الصحيحة', body: 'Which service, how soon, new or returning.', bodyAr: 'أي خدمة، ومتى، وهل هو عميل جديد أم سابق.', pills: [{ t: 'Teeth cleaning' }, { t: 'This week' }, { t: 'New patient' }], pillsAr: [{ t: 'تنظيف أسنان' }, { t: 'هذا الأسبوع' }, { t: 'مريض جديد' }], icon: <Target size={22} /> },
      { k: 'STEP 4', kAr: 'الخطوة 4', when: '9:44 PM', whenAr: '9:44 م', title: 'Booked and confirmed', titleAr: 'حجز وتأكيد', body: 'Slot taken from your real calendar. Reminder the day before.', bodyAr: 'الموعد من تقويمك الفعلي، مع تذكير قبله بيوم.', pills: [{ t: 'Thu · 6:15 PM', ok: true }], pillsAr: [{ t: 'الخميس · 6:15 م', ok: true }], icon: <CalendarCheck size={22} /> },
    ],
    [
      { k: 'STEP 1', kAr: 'الخطوة 1', when: '11:02 AM', whenAr: '11:02 ص', title: 'An inbound call, in Arabic', titleAr: 'مكالمة واردة بالعربية', body: 'The caller asks for a consultation this week. The reply stays in their dialect.', bodyAr: 'المتصل يطلب استشارة هذا الأسبوع، والرد يبقى بلهجته.', icon: <Mic size={22} /> },
      { k: 'STEP 2', kAr: 'الخطوة 2', when: 'live calendar', whenAr: 'التقويم الحقيقي', title: 'It checks your real availability', titleAr: 'يراجع توفرك الحقيقي', body: 'Only open slots from your calendar are offered. Nothing is invented.', bodyAr: 'يعرض المواعيد المفتوحة في تقويمك فقط. لا يخترع وقتاً.', icon: <Calendar size={22} /> },
      { k: 'STEP 3', kAr: 'الخطوة 3', when: '1 choice', whenAr: 'اختيار واحد', title: 'Sunday, 11:00 AM', titleAr: 'الأحد 11:00 ص', body: 'The caller picks a consultation. The slot is taken immediately.', bodyAr: 'يختار المتصل موعد الاستشارة، ويُحجز في لحظته.', pills: [{ t: 'Sun · 11:00 AM', ok: true }], pillsAr: [{ t: 'الأحد · 11:00 ص', ok: true }], icon: <CalendarCheck size={22} /> },
      { k: 'STEP 4', kAr: 'الخطوة 4', when: 'seconds later', whenAr: 'بعد ثوانٍ', title: 'WhatsApp confirmation', titleAr: 'تأكيد على واتساب', bubble: 'تم تأكيد استشارتك الأحد 11:00 ص. هذا موقع العيادة.', icon: <MessageCircle size={22} /> },
    ],
    [
      { k: 'STEP 1', kAr: 'الخطوة 1', when: 'from an ad', whenAr: 'من إعلان', title: 'A new lead arrives', titleAr: 'يصل عميل جديد', body: 'Instagram, Google, or a website form. The source is kept with the lead.', bodyAr: 'من إنستغرام أو بحث أو نموذج الموقع، ويُحفظ مصدر العميل.', icon: <Target size={22} /> },
      { k: 'STEP 2', kAr: 'الخطوة 2', when: '3 questions', whenAr: '3 أسئلة', title: 'It asks three qualifying questions', titleAr: 'يسأل ثلاثة أسئلة للتأهيل', body: 'Service, timing, and whether they are ready to book.', bodyAr: 'الخدمة، والتوقيت، وهل هو جاهز للحجز.', icon: <MessageCircle size={22} /> },
      { k: 'STEP 3', kAr: 'الخطوة 3', when: 'scored', whenAr: 'تقييم', title: 'Scored, then routed', titleAr: 'يُقيَّم ثم يُوجَّه', body: 'Hot leads go to your team. Others get a nurture reply.', bodyAr: 'العميل المهتم يصل لفريقك، وغيره تصله رسالة متابعة.', pills: [{ t: 'Hot', ok: true }, { t: 'Warm' }, { t: 'Nurture' }], pillsAr: [{ t: 'ساخن', ok: true }, { t: 'دافئ' }, { t: 'متابعة لاحقة' }], icon: <Users size={22} /> },
      { k: 'STEP 4', kAr: 'الخطوة 4', when: 'same hour', whenAr: 'في الساعة نفسها', title: 'Booked, or nurtured', titleAr: 'حجز أو متابعة', body: 'A ready lead gets a real slot. Everyone else stays on a respectful follow-up.', bodyAr: 'الجاهز يحصل على موعد حقيقي، والبقية تبقى على متابعة محترمة.', icon: <CalendarCheck size={22} /> },
    ],
  ]
  const FLOW_LINKS = ['/systems/missed-call-responder', '/systems/booking-receptionist', '/systems/lead-attribution']
  const FLOW_LINK_EN = ['Explore missed-call triage', 'Explore booking receptionist', 'Explore lead qualification']
  const FLOW_LINK_AR = ['تعرّف على فرز المكالمات الفائتة', 'تعرّف على موظف الاستقبال', 'تعرّف على تأهيل العملاء']

  return (
    <>
      <section className="hero hero-live" ref={stageRef}>
        <div className="hero-pin">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow">
                <span className="dot" />
                <span className="d-only">{ar ? 'أنظمة ذكاء اصطناعي نبنيها ونشغّلها عنك · الخليج والشرق الأوسط' : 'Done-for-you AI systems for GCC & MENA businesses'}</span>
                <span className="m-only">{ar ? 'أنظمة نبنيها ونشغّلها عنك' : 'Done-for-you AI systems · GCC & MENA'}</span>
              </span>
              <h1 className="display h1">
                {ar ? (
                  <>مكالمة فائتة؟<br /><em>نرد عليها ونحجز الموعد.</em></>
                ) : (
                  <>Missed calls answered.<br /><em>Appointments booked.</em></>
                )}
              </h1>
              <p className="lead">
                {ar
                  ? 'تبني Helix وتشغّل أنظمة ذكاء اصطناعي للعيادات وشركات العقار وأعمال الخدمات. كل مكالمة فائتة يصلها رد على واتساب خلال ثوانٍ، ثم محادثة حقيقية بالعربي أو الإنجليزي، ثم موعد مؤكد في تقويمك. فريقنا يجهّز كل شيء ويتابعه.'
                  : 'Helix builds and runs AI systems for clinics, real-estate and service businesses. Every missed call gets a WhatsApp reply within seconds, a real conversation in Arabic or English, and a confirmed booking in your calendar. Set up and monitored by our team.'}
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href="/contact">
                  {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}
                </Link>
                <Link className="btn btn-ghost" href="#how">{ar ? 'كيف يعمل؟' : 'See how it works'}</Link>
              </div>
              <div className="trust-row">
                <span>{ar ? 'عربي وإنجليزي' : 'Arabic & English'}</span>
                <span>{ar ? 'على رقم واتساب الخاص بك' : 'Your own WhatsApp number'}</span>
                <span>{ar ? 'النظام ملكك بعد الإطلاق' : 'You keep ownership after go-live'}</span>
              </div>
            </div>
            <div className={scrub ? 'visual is-scrub' : 'visual'}>
              <p className="live-url">
                <span className="hx-live" aria-hidden="true"><span className="hx-live-dot" /></span>
                <span className="ltr">{livePath}</span>
                <span className="caret" aria-hidden="true" />
              </p>
              <div className="glow" />
              <div className="phone">
                <div className="island" />
                <div className="screen">
                  <div className="status"><span>9:44</span><span>●●●</span></div>
                  <div className="wa-head">
                    <div className="wa-av">ع</div>
                    <div>
                      <div className="wa-name">عيادة المثال لطب الأسنان</div>
                      <div className="wa-sub">حساب أعمال · نشط الآن</div>
                    </div>
                  </div>
                  <div className={scrub ? 'wa-body is-scrub' : 'wa-body'} ref={chatRef}>
                    <span className="wa-day">اليوم</span>
                    {CHAT.slice(0, visibleChats).map(b => (
                      <div key={b.text} className={`bub ${b.side}`}>
                        {b.text}
                        <span className="t">{b.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="wa-input"><div className="f">اكتب رسالة</div></div>
                </div>
              </div>
              <div className={missedIn ? 'float c-missed is-in' : 'float c-missed'}>
                <div className="c-row">
                  <div className="c-ic amber"><PhoneMissed size={18} /></div>
                  <div>
                    <div className="c-title">{ar ? <>مكالمة فائتة · <bdi>9:41</bdi> م</> : 'Missed call · 9:41 PM'}</div>
                    <div className="c-sub"><bdi className="ltr">+971 50 ••• 4182</bdi><br />{ar ? 'بعد الدوام. لا أحد على الاستقبال.' : 'After hours. Nobody at the desk.'}</div>
                  </div>
                </div>
              </div>
              <div className={bookedIn ? 'float c-booked is-in' : 'float c-booked'}>
                <div className="c-row">
                  <div className="c-ic green"><CalendarCheck size={18} /></div>
                  <div>
                    <div className="c-title">{ar ? 'تم حجز الموعد' : 'Appointment booked'}</div>
                    <div className="c-sub">{ar ? 'أُضيف إلى تقويمك' : 'Added to your calendar'}</div>
                  </div>
                </div>
                <div className="cal">
                  <div className="cal-day"><b>{ar ? 'الخميس' : 'THU'}</b><span>6:15</span></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{ar ? 'تنظيف أسنان · مساءً' : 'Teeth cleaning · PM'}</div>
                    <div className="c-sub">{ar ? 'مريض جديد · عبر واتساب' : 'New patient · via WhatsApp'}<br />{ar ? 'تذكير يوم الأربعاء' : 'Reminder set for Wednesday'}</div>
                  </div>
                </div>
              </div>
              <div className="caption">{ar ? 'مثال توضيحي · العيادة والأسماء والأوقات غير حقيقية' : 'Illustrative example · fictional clinic, names and times'}</div>
            </div>
          </div>
          <div className="scenario">
            <div>
              <span className="chip chip-example">{ar ? 'سيناريو توضيحي' : 'Example scenario'}</span>
              <div className="faint small" style={{ marginTop: 8 }}>{ar ? 'مكالمة فائتة واحدة، من البداية للنهاية' : 'One missed call, start to finish'}</div>
            </div>
            <div className={sceneStep === 0 ? 'is-on' : undefined}><span className="sc-time">{ar ? '9:41 م' : '9:41 PM'}</span><span className="sc-what"><PhoneMissed size={16} />{ar ? 'مكالمة فائتة بعد الدوام' : 'Call missed after hours'}</span></div>
            <div className={sceneStep === 1 ? 'is-on' : undefined}><span className="sc-time">{ar ? '9:41 م' : '9:41 PM'}</span><span className="sc-what"><MessageCircle size={16} />{ar ? 'أُرسل رد على واتساب' : 'WhatsApp reply sent'}</span></div>
            <div className={sceneStep === 2 ? 'is-on' : undefined}><span className="sc-time">{ar ? '9:44 م' : '9:44 PM'}</span><span className="sc-what"><CalendarCheck size={16} />{ar ? 'حُجز موعد الخميس' : 'Booked for Thursday'}</span></div>
            <div><span className="sc-out">{ar ? 'ولم يضطر أحد من فريقك للرد على الهاتف.' : 'Nobody on your team had to pick up the phone.'}</span></div>
          </div>
        </div>
        </div>
      </section>

      <section className="sec">
        <div className="container">
          <div className="sec-head">
            <span className="kicker">{ar ? 'لماذا يهمّك هذا' : 'Why it matters'}</span>
            <h2 className="display h2">{ar ? 'كل استفسار يفوتك هو دخل يذهب إلى غيرك.' : 'The enquiries you miss are revenue that goes to someone else.'}</h2>
          </div>
          <div className="problem-grid">
            <div><span className="p-num">01</span><div className="p-title">{ar ? 'بعد الدوام' : 'After hours'}</div><p className="p-body">{ar ? 'المكالمات بعد الإغلاق تبقى بلا رد، فينتقل المتصل إلى العيادة التالية في القائمة.' : 'Calls after closing go unanswered, and the caller moves on to the next clinic on the list.'}</p></div>
            <div><span className="p-num">02</span><div className="p-title">{ar ? 'استقبال مشغول' : 'A busy front desk'}</div><p className="p-body">{ar ? 'فريقك مشغول مع العميل الذي أمامه. يرنّ الهاتف، ولا أحد يعاود الاتصال.' : 'Your team is with the customer in front of them. The phone rings out, and nobody calls back.'}</p></div>
            <div><span className="p-num">03</span><div className="p-title">{ar ? 'متابعة بطيئة' : 'Slow follow-up'}</div><p className="p-body">{ar ? 'عملاء الإعلانات وإنستغرام ينتظرون الرد لساعات، بعد أن يكون اهتمامهم قد فتر.' : 'Leads from ads and Instagram wait hours for a reply, long after their interest has cooled.'}</p></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }} id="how">
        <div className="container">
          <div className="sec-head">
            <span className="kicker">{ar ? 'كيف يعمل' : 'How it works'}</span>
            <h2 className="display h2">{ar ? 'من مكالمة فائتة إلى موعد محجوز، في أربع خطوات هادئة.' : 'From missed call to booked appointment, in four quiet steps.'}</h2>
            <p className="lead">{ar ? 'لا تطبيق جديد لفريقك. يعمل النظام داخل الأدوات التي تستخدمها أصلاً، ولا يطلب تدخّل أحد إلا عند الحاجة.' : 'No new app for your team. The system works inside the tools you already use and only asks for a person when it should.'}</p>
          </div>
          <div className="flow-panel">
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <div className="tabs" role="tablist">
                {(ar ? ['فرز المكالمات الفائتة', 'موظف الاستقبال والحجوزات', 'تأهيل العملاء'] : ['Missed-call triage', 'Booking receptionist', 'Lead qualification']).map((label, i) => (
                  <button key={label} type="button" role="tab" aria-selected={flow === i} className={`tab${flow === i ? ' on' : ''}`} onClick={() => setFlow(i)}>{label}</button>
                ))}
              </div>
              <span className="chip chip-example d-only">{ar ? 'سيناريو توضيحي' : 'Example scenario'}</span>
            </div>
            <div className="flow" role="tabpanel">
              {FLOWS[flow].map(step => (
                <div className="step done" key={step.k}>
                  <div className="step-dot"><div className="inner">{step.icon}</div></div>
                  <div className="step-card">
                    <div className="step-k"><span>{ar ? step.kAr : step.k}</span><span>{ar ? step.whenAr : step.when}</span></div>
                    <div className="step-t">{ar ? step.titleAr : step.title}</div>
                    {step.bubble ? <div className="mini-bub">{step.bubble}</div> : <div className="step-b">{ar ? step.bodyAr : step.body}</div>}
                    {step.pills ? <div className="tagline">{(ar ? step.pillsAr ?? step.pills : step.pills).map(pill => <span className={`pill${pill.ok ? ' g' : ''}`} key={pill.t}>{pill.t}</span>)}</div> : null}
                  </div>
                </div>
              ))}
            </div>
            <div className="flow-foot">
              <span><Headset size={16} /> {ar ? 'إذا طلب العميل التحدث مع شخص، أو كانت الإجابة غير واضحة، يتسلّم فريقك المحادثة كاملة.' : 'If the customer asks for a person, or the answer is unclear, your team takes over with the full conversation.'}</span>
              <Link className="link" href={FLOW_LINKS[flow]}>{ar ? FLOW_LINK_AR[flow] : FLOW_LINK_EN[flow]}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 0 }} id="systems">
        <div className="container">
          <div className="sec-head">
            <span className="kicker">{ar ? 'الأنظمة' : 'Systems'}</span>
            <h2 className="display h2">{ar ? 'خمسة أنظمة. كل نظام يؤدي مهمة واحدة، بإتقان.' : 'Five systems. Each one does a single job, properly.'}</h2>
            <p className="lead">{ar ? 'ابدأ بالنظام الذي يسدّ أكبر ثغرة لديك، وأضف التالي عندما يثبت الأول قيمته.' : 'Start with the one that fixes your biggest leak. Add the next when the first has earned its place.'}</p>
          </div>
          <div className="sys-grid">
            <article className="sys big">
              <div className="sys-vis"><div className="vstack" style={{ maxWidth: 340 }}>
                <div className="vrow"><span className="c-ic amber" style={{ width: 28, height: 28 }}><PhoneMissed size={14} /></span><span>{ar ? 'مكالمة فائتة' : 'Missed call'}</span><span className="faint" style={{ marginInlineStart: 'auto' }}>{ar ? '9:41 م' : '9:41 PM'}</span></div>
                <div className="vrow"><span className="c-ic green" style={{ width: 28, height: 28 }}><MessageCircle size={14} /></span><span>{ar ? 'أُرسل رد واتساب' : 'WhatsApp reply sent'}</span><span className="faint" style={{ marginInlineStart: 'auto' }}>{ar ? '9:41 م' : '9:41 PM'}</span></div>
                <div className="vrow"><span className="c-ic green" style={{ width: 28, height: 28 }}><Users size={14} /></span><span>{ar ? 'حُوّل إلى الحجوزات' : 'Routed to bookings'}</span><span className="pill g" style={{ marginInlineStart: 'auto' }}>{ar ? 'مؤهَّل' : 'Qualified'}</span></div>
              </div></div>
              <h3>{ar ? 'فرز المكالمات الفائتة' : 'Missed-call triage'}</h3>
              <p>{ar ? 'رد على واتساب خلال ثوانٍ بعد المكالمة الفائتة، يؤهّل الاستفسار ويوجّهه للشخص المناسب.' : 'A WhatsApp reply seconds after a missed call. Qualifies the enquiry and routes it to the right person.'}</p>
              <div className="meta"><span>{ar ? 'الأنسب للعيادات والمقاولات وخدمات المنازل' : 'Best for clinics, contractors, home services'}</span><Link className="link" href="/systems/missed-call-responder">{ar ? 'استكشف' : 'Explore'}</Link></div>
            </article>
            <article className="sys big">
              <div className="sys-vis"><div className="vstack" style={{ maxWidth: 340 }}>
                <div className="vrow"><span className="c-ic green" style={{ width: 28, height: 28 }}><Mic size={14} /></span><span>{ar ? 'مكالمة واردة · عربي' : 'Inbound call · Arabic'}</span><span className="wave" style={{ marginInlineStart: 'auto' }}><i style={{ height: 10 }} /><i style={{ height: 22 }} /><i style={{ height: 14 }} /><i style={{ height: 28 }} /><i style={{ height: 18 }} /><i style={{ height: 9 }} /></span></div>
                <div className="vrow"><span className="c-ic green" style={{ width: 28, height: 28 }}><Calendar size={14} /></span><span>{ar ? 'استشارة · الأحد 11:00 ص' : 'Consultation · Sun 11:00 AM'}</span><span className="pill g" style={{ marginInlineStart: 'auto' }}>{ar ? 'محجوز' : 'Booked'}</span></div>
                <div className="vrow"><span className="c-ic green" style={{ width: 28, height: 28 }}><MessageCircle size={14} /></span><span>{ar ? 'تأكيد وموقع العيادة على واتساب' : 'Confirmation + location on WhatsApp'}</span></div>
              </div></div>
              <h3>{ar ? 'موظف الاستقبال والحجوزات' : 'Booking receptionist'}</h3>
              <p>{ar ? 'يرد على المكالمات بالخليجية والإنجليزية، ويحجز من مواعيدك المتاحة فعلاً، ويؤكد عبر واتساب.' : 'Answers calls in Gulf Arabic and English, books from your real availability, and confirms on WhatsApp.'}</p>
              <div className="meta"><span>{ar ? 'الأنسب للعيادات ومراكز التجميل والعقارات' : 'Best for clinics, salons, real estate'}</span><Link className="link" href="/systems/booking-receptionist">{ar ? 'استكشف' : 'Explore'}</Link></div>
            </article>
            <article className="sys sm">
              <div className="sys-vis"><div className="vstack">
                <div className="vrow"><span>{ar ? 'إعلان إنستغرام' : 'Instagram ad'}</span><span className="pill g" style={{ marginInlineStart: 'auto' }}>{ar ? 'ساخن' : 'Hot'}</span></div>
                <div className="vrow"><span>{ar ? 'بحث Google' : 'Google search'}</span><span className="pill a" style={{ marginInlineStart: 'auto' }}>{ar ? 'دافئ' : 'Warm'}</span></div>
                <div className="vrow"><span>{ar ? 'نموذج الموقع' : 'Website form'}</span><span className="pill" style={{ marginInlineStart: 'auto' }}>{ar ? 'متابعة لاحقة' : 'Nurture'}</span></div>
              </div></div>
              <h3>{ar ? 'تأهيل وإسناد العملاء' : 'Lead qualification & attribution'}</h3>
              <p>{ar ? 'يقيّم كل عميل جديد، ويُظهر أي إعلان جلب حجوزات فعلاً.' : 'Scores every new lead and shows which ad actually produced bookings.'}</p>
              <div className="meta"><span>{ar ? 'الإعلانات، العيادات، العقارات' : 'Paid social, clinics, real estate'}</span><Link className="link" href="/systems/lead-attribution">{ar ? 'استكشف' : 'Explore'}</Link></div>
            </article>
            <article className="sys sm">
              <div className="sys-vis"><div className="vstack">
                <div className="vrow"><span className="faint">{ar ? 'آخر تواصل' : 'Last contact'}</span><span style={{ marginInlineStart: 'auto' }}>{ar ? 'قبل 8 أشهر' : '8 months ago'}</span></div>
                <div className="vrow"><span>{ar ? 'رسالة متابعة ودّية على واتساب' : 'Friendly WhatsApp check-in'}</span></div>
                <div className="vrow"><span>{ar ? 'الرد: «نعم، الأسبوع القادم»' : 'Replied: “Yes, next week”'}</span><span className="pill g" style={{ marginInlineStart: 'auto' }}>{ar ? 'عاد للتواصل' : 'Re-engaged'}</span></div>
              </div></div>
              <h3>{ar ? 'إعادة تنشيط العملاء' : 'Lead reactivation'}</h3>
              <p>{ar ? 'يعيد التواصل مع العملاء والاستفسارات السابقة ممن وافقوا على الرسائل، ويحترم طلب «إيقاف».' : 'Wakes up past enquiries and customers who opted in, with messages that respect “stop”.'}</p>
              <div className="meta"><span>{ar ? 'العقارات، العيادات، الشركات' : 'Real estate, clinics, B2B'}</span><Link className="link" href="/systems/lead-reactivation">{ar ? 'استكشف' : 'Explore'}</Link></div>
            </article>
            <article className="sys sm">
              <div className="sys-vis"><div className="vstack">
                <div className="vrow"><span>{ar ? 'فاتورة · متأخرة 14 يوماً' : 'Invoice · 14 days overdue'}</span></div>
                <div className="vrow"><span>{ar ? 'تذكير مهذّب + رابط دفع' : 'Polite reminder + payment link'}</span></div>
                <div className="vrow"><span>{ar ? 'تم استلام الدفعة' : 'Payment received'}</span><span className="pill g" style={{ marginInlineStart: 'auto' }}>{ar ? 'مدفوعة' : 'Paid'}</span></div>
              </div></div>
              <h3>{ar ? 'تحصيل المستحقات (شركات فقط)' : 'B2B collections'}</h3>
              <p>{ar ? 'متابعات مهذّبة عبر واتساب للفواتير التجارية المتأخرة. لعملاء الشركات فقط.' : 'Courteous WhatsApp follow-ups on overdue commercial invoices. Business clients only.'}</p>
              <div className="meta"><span>{ar ? 'خدمات الشركات والموزعون' : 'B2B services, distributors'}</span><Link className="link" href="/systems/ar-invoicing">{ar ? 'استكشف' : 'Explore'}</Link></div>
            </article>
          </div>
          <div className="price-foot">
            <span>{ar ? 'تشتري نظاماً واحداً؟ اضبطه وشاهد سعره في الاستوديو.' : 'Buying a single system? Configure it and see its price in Studio.'}</span>
            <Link className="link" href="/studio">{ar ? 'افتح الاستوديو' : 'Open Studio'}</Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 24 }}>
        <div className="container split">
          <div className="split-head">
            <div>
              <span className="kicker">{ar ? 'لوحتك' : 'Your dashboard'}</span>
              <h2 className="display h2" style={{ marginTop: 18 }}>{ar ? 'اعرف بالضبط ماذا فعلت أنظمتك.' : 'See exactly what your systems did.'}</h2>
            </div>
            <p className="lead">{ar ? 'كل رد وحجز وتحويل، بلغة واضحة. بلا تخمين ولا مصطلحات تقنية. افتحها من هاتفك أو مكتبك، بالعربي أو الإنجليزي.' : 'Every reply, booking and hand-off in plain language. No guesswork, no jargon. Open it on your phone or your desk, in Arabic or English.'}</p>
          </div>
          <div className="bullets">
            <div><Inbox size={20} /><div><b>{ar ? 'سجل نشاط يومي' : 'A daily activity feed'}</b><span>{ar ? 'ماذا حدث، ومتى، ولمن.' : 'What happened, when, and for which customer.'}</span></div></div>
            <div><ShieldCheck size={20} /><div><b>{ar ? 'قائمة مراجعة لما هو غير مؤكد' : 'A review queue for anything uncertain'}</b><span>{ar ? 'لا يُحفظ شيء غير واضح حتى يراجعه أحد.' : 'Nothing unclear is saved as fact until someone checks it.'}</span></div></div>
            <div><ChartColumn size={20} /><div><b>{ar ? 'عرض أسبوعي وشهري' : 'Week and month views'}</b><span>{ar ? 'الحجوزات والردود والمكالمات الفائتة جنباً إلى جنب.' : 'Bookings, replies and missed calls handled, side by side.'}</span></div></div>
          </div>
          <div className="browser">
            <div className="browser-bar">
              <i /><i /><i />
              <span className="url">{ar ? 'helix · عيادة المثال لطب الأسنان' : 'helix · Example Dental Clinic'}</span>
            </div>
            <div className="dp">
              <div className="dp-side">
                {(ar
                  ? ['نظرة عامة', 'جهات الاتصال', 'قائمة المراجعة', 'توليد العملاء', 'البحث', 'التقارير']
                  : ['Overview', 'Contacts', 'Review queue', 'Lead generation', 'Search', 'Reports']
                ).map((label, index) => {
                  const Icon = [House, Users, Inbox, Target, Search, ChartColumn][index]
                  return (
                    <div className={`it${index === 0 ? ' on' : ''}`} key={label}>
                      <Icon className="ico" size={14} aria-hidden="true" />
                      {label}
                    </div>
                  )
                })}
              </div>
              <div className="dp-main">
                <div className="dp-h">
                  <div>
                    <b>{ar ? 'مساء الخير' : 'Good evening'}</b>
                    <div className="dp-sum">
                      {ar
                        ? 'هذا الأسبوع ردّت أنظمتك على 38 استفساراً وحجزت 11 موعداً.'
                        : 'This week your systems replied to 38 enquiries and booked 11 appointments.'}
                    </div>
                  </div>
                  <span className="ex-chip">{ar ? 'بيانات توضيحية' : 'Example data'}</span>
                </div>
                <div className="kpis">
                  <div className="kpi"><small>{ar ? 'المواعيد المحجوزة' : 'Appointments booked'}</small><b><bdi>11</bdi></b></div>
                  <div className="kpi"><small>{ar ? 'المكالمات الفائتة التي تم الرد عليها' : 'Missed calls answered'}</small><b><bdi>17</bdi></b></div>
                  <div className="kpi"><small>{ar ? 'المحادثات' : 'Conversations'}</small><b><bdi>38</bdi></b></div>
                  <div className="kpi"><small>{ar ? 'متوسط أول رد' : 'Median first reply'}</small><b><bdi>18s</bdi></b></div>
                </div>
                <div className="dp-cols">
                  <div className="panel">
                    <p className="panel-label">
                      {ar ? 'النشاط الأخير' : 'Recent activity'}
                      <span style={{ color: '#5C6168', fontWeight: 400 }}>{ar ? 'اليوم' : 'Today'}</span>
                    </p>
                    <div className="feed">
                      <div>
                        <span className="d" />
                        <span><em>{ar ? 'تم الحجز' : 'Booked'}</em> {ar ? 'تنظيف أسنان · الخميس 6:15 م' : 'teeth cleaning · Thu 6:15 PM'}</span>
                        <span className="tm"><bdi dir="ltr">9:44 PM</bdi></span>
                      </div>
                      <div>
                        <span className="d" />
                        <span>
                          <em>{ar ? 'تم الرد' : 'Replied'}</em>{' '}
                          {ar ? 'على مكالمة فائتة من' : 'to a missed call from'}{' '}
                          <bdi dir="ltr">+971 50 ••• 4182</bdi>
                        </span>
                        <span className="tm"><bdi dir="ltr">9:41 PM</bdi></span>
                      </div>
                      <div>
                        <span className="d a" />
                        <span><em>{ar ? 'تم التحويل لفريقك:' : 'Handed to your team:'}</em> {ar ? 'سؤال عن التأمين' : 'asked about insurance'}</span>
                        <span className="tm"><bdi dir="ltr">6:02 PM</bdi></span>
                      </div>
                      <div>
                        <span className="d" />
                        <span><em>{ar ? 'تم إرسال التذكير' : 'Reminder sent'}</em> {ar ? 'لموعد الغد 10:30 ص' : "for tomorrow's 10:30 AM"}</span>
                        <span className="tm"><bdi dir="ltr">5:00 PM</bdi></span>
                      </div>
                    </div>
                  </div>
                  <div className="panel">
                    <p className="panel-label">{ar ? 'حجوزات هذا الأسبوع' : 'Bookings this week'}</p>
                    <div className="bars" aria-hidden="true">
                      <i style={{ height: '30%' }} />
                      <i style={{ height: '52%' }} />
                      <i style={{ height: '40%' }} />
                      <i style={{ height: '70%' }} />
                      <i className="hi" style={{ height: '88%' }} />
                      <i style={{ height: '46%' }} />
                      <i style={{ height: '24%' }} />
                    </div>
                    <div className="bar-days">
                      {(ar ? ['سبت', 'أحد', 'إثن', 'ثلا', 'أربع', 'خميس', 'جمعة'] : ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri']).map(day => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>
                    <table className="vh">
                      <caption>{ar ? 'بيانات توضيحية: حجوزات هذا الأسبوع، مجموعها 11.' : 'Example data: bookings this week, totalling 11.'}</caption>
                      <thead>
                        <tr>
                          <th>{ar ? 'اليوم' : 'Day'}</th>
                          <th>{ar ? 'الحجوزات' : 'Bookings'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(ar
                          ? [['سبت', '1'], ['أحد', '2'], ['إثن', '1'], ['ثلا', '2'], ['أربع', '3'], ['خميس', '1'], ['جمعة', '1']]
                          : [['Sat', '1'], ['Sun', '2'], ['Mon', '1'], ['Tue', '2'], ['Wed', '3'], ['Thu', '1'], ['Fri', '1']]
                        ).map(([day, count]) => (
                          <tr key={day}><td>{day}</td><td><bdi>{count}</bdi></td></tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container">
          <div className="sec-head">
            <span className="kicker">{ar ? 'مصمم للمنطقة' : 'Built for the region'}</span>
            <h2 className="display h2">{ar ? 'يتحدث مثل موظف استقبالك، ويلتزم بقواعدك.' : 'Speaks like your front desk. Follows your rules.'}</h2>
          </div>
          <div className="region">
            <div className="feat"><div><h3>{ar ? 'لهجات عربية والإنجليزية' : 'Arabic dialects and English'}</h3><p>{ar ? 'خليجي ومصري وشامي وإنجليزي، والمزيج الذي يكتبه عملاؤك فعلاً.' : 'Gulf, Egyptian and Levantine Arabic, English, and the mix of both your customers actually write.'}</p><div className="say"><span className="pill ar">أبغى موعد بكرة</span><span className="pill ar">عايز أحجز</span><span className="pill">Can I book for Sunday?</span></div></div></div>
            <div className="feat"><div><h3>{ar ? 'شخص حقيقي عند الحاجة' : 'A person, whenever it matters'}</h3><p>{ar ? 'إذا طلب العميل بشراً، أو لم يكن النظام متأكداً، تنتقل المحادثة لفريقك مع السياق كاملاً.' : 'If a customer asks for a human, or the system is unsure, the conversation moves to your team with full context.'}</p><div className="say"><span className="pill ar">بشري</span><span className="pill">agent</span></div></div></div>
            <div className="feat"><div><h3>{ar ? 'محترم افتراضياً' : 'Respectful by default'}</h3><p>{ar ? 'ساعات هدوء، وموافقة مسبقة لرسائل التسويق، واحترام طلب الإيقاف.' : 'Quiet hours, opt-in for marketing messages, and “stop” honoured every time.'}</p><div className="say"><span className="pill ar">إيقاف</span><span className="pill">stop</span></div></div></div>
            <div className="feat"><div><h3>{ar ? 'ما نبنيه ملكك' : 'You own what we build'}</h3><p>{ar ? 'بعد الإطلاق يبقى الإعداد والتكاملات وأدلة التشغيل ملكك. بلا ارتباط إجباري.' : 'After go-live you keep the setup, the integrations and the runbooks. No lock-in.'}</p></div></div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 48 }}>
        <div className="container">
          <div className="founder">
            <div className="founder-q">
              <span className="kicker">{ar ? 'كلمة من المؤسس' : 'A note from the founder'}</span>
              <blockquote style={{ marginTop: 22 }}>
                {ar
                  ? '«لن نعرض عليك أرقاماً مبالغاً فيها أو شعارات عملاء ليسوا عملاءنا. قبل أن تلتزم، نعرض لك النظام يعمل على سيناريو من عملك أنت، وكل نظام نشغّله يوضح لك بالضبط ماذا فعل.»'
                  : '“We won’t show you inflated numbers or borrowed logos. Before you commit, we’ll walk you through a live demo built around a scenario from your own business, and every system we run reports exactly what it did.”'}
              </blockquote>
              <div className="sig"><div className="mono">ZS</div><div><b style={{ fontWeight: 500 }}>Ziad Sabry</b><div className="faint small">{ar ? 'المؤسس، Helix' : 'Founder, Helix'}</div></div></div>
            </div>
            <div className="commit">
              <span className="kicker">{ar ? 'التزاماتنا' : 'Our commitments'}</span>
              <ul style={{ marginTop: 14 }}>
                <li><div><b>{ar ? 'عرض حي قبل تحديد النطاق' : 'Live demo before scope'}</b><span>{ar ? 'ترى النظام على حالة من عملك أولاً.' : 'You see it working on your use case first.'}</span></div></li>
                <li><div><b>{ar ? 'تقارير صادقة' : 'Honest reporting'}</b><span>{ar ? 'لا مقاييس مخترعة، لا في البيع ولا في لوحتك.' : 'No invented metrics, in sales or in your dashboard.'}</span></div></li>
                <li><div><b>{ar ? 'مراحل واضحة بالعربي أو الإنجليزي' : 'Bilingual milestones'}</b><span>{ar ? 'الخطط والتحديثات باللغة التي تختارها.' : 'Plans and updates in Arabic or English.'}</span></div></li>
                <li><div><b>{ar ? 'ملكية واضحة' : 'Clear ownership'}</b><span>{ar ? 'النظام يبقى لك بعد الإطلاق.' : 'You keep the system after go-live.'}</span></div></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container">
          <div className="sec-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', maxWidth: 'none' }}>
            <div style={{ maxWidth: 640 }}>
              <span className="kicker">{ar ? 'الباقات الشهرية · درهم' : 'Monthly plans · AED'}</span>
              <h2 className="display h2">{ar ? 'باقات شهرية واضحة، ورسوم إعداد لمرة واحدة.' : 'Clear monthly plans. One-time setup.'}</h2>
            </div>
            <Link className="link d-only" href="/pricing">{ar ? 'قارن كل الباقات' : 'Compare all plans'}</Link>
          </div>
          <div className="plans">
            {plans.map(plan => {
              const copy = planDisplay(plan, ar ? 'ar' : 'en')
              const monthly = plan.prices.AED
              const setup = plan.setupFee.AED
              return (
                <div key={plan.id} className={`plan${plan.featured ? ' feat-plan' : ''}`}>
                  <div className="plan-name">
                    {ar ? plan.nameAr : plan.name}
                    {plan.featured ? <span className="chip">{ar ? 'موصى بها' : 'Recommended'}</span> : null}
                  </div>
                  <p className="muted small" style={{ marginTop: 6 }}>{copy.taglineShort}</p>
                  {typeof monthly === 'number' ? (
                    ar ? (
                      <div className="price"><b className="num"><bdi>{money(monthly)}</bdi></b><span className="cur">درهم</span><span className="per">/ شهرياً</span></div>
                    ) : (
                      <div className="price"><span className="cur">AED</span><b className="num"><bdi>{money(monthly)}</bdi></b><span className="per">/ month</span></div>
                    )
                  ) : null}
                  {typeof setup === 'number' ? (
                    <div className="faint small">
                      {ar ? <>+ <bdi>{money(setup)}</bdi> درهم إعداد لمرة واحدة</> : <>+ AED <bdi>{money(setup)}</bdi> one-time setup</>}
                    </div>
                  ) : null}
                  <ul>
                    {(copy.home ?? copy.features).slice(0, 3).map(feature => (
                      <li key={feature}>{feature}</li>
                    ))}
                  </ul>
                  <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'}`} href={plan.featured ? `/contact?plan=${plan.id}` : '/pricing'}>
                    {plan.featured ? (ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call') : ar ? 'تفاصيل الباقة' : 'See plan details'}
                  </Link>
                </div>
              )
            })}
          </div>
          <div className="price-foot">
            <Link href="/studio">{ar ? 'تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو' : 'Buying a single system? See per-system prices in Studio →'}</Link>
            <Link className="link" href="/contact?scope=custom">{ar ? 'بناء مخصّص، لنحدد النطاق' : "Custom build, let's scope it →"}</Link>
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 80 }}>
        <div className="container faq">
          <div>
            <span className="kicker">{ar ? 'أسئلة' : 'Questions'}</span>
            <h2 className="display h2" style={{ marginTop: 18 }}>{ar ? 'أول ما يسألنا عنه أصحاب الأعمال.' : 'What owners ask us first.'}</h2>
            <p className="lead" style={{ marginTop: 18 }}>
              <Link href="/contact">{ar ? 'سؤال آخر؟ راسلنا من صفحة التواصل.' : 'Anything else? Ask us from the contact page and a person will reply.'}</Link>
            </p>
          </div>
          <QaAccordion idPrefix="home-faq" items={faqs.map(([q, a]) => ({ q, a }))} />
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="container">
          <div className="final">
            <span className="watermark"><HelixMark size={280} /></span>
            <h2 className="display">{ar ? 'أخبرنا أين تضيع الاستفسارات، وسنريك النظام الذي يلتقطها.' : "Tell us where enquiries slip through. We'll show you the system that catches them."}</h2>
            <p className="lead">{ar ? 'مكالمة تعريفية قصيرة: نحدد أصغر نظام يحل المشكلة، ثم نعرضه أمامك مباشرة، بالعربي أو الإنجليزي.' : 'A short discovery call. We map the smallest system that fixes it, then demo it live, in Arabic or English.'}</p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/contact">{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'}</Link>
              <WhatsAppCta ar={ar} className="btn btn-ghost" labelEn="Chat on WhatsApp" labelAr="راسلنا على واتساب">
                <MessageCircle size={16} />
              </WhatsAppCta>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
