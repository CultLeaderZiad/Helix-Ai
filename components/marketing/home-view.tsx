'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  ArrowRight,
  CalendarCheck,
  ChartColumn,
  Check,
  Globe,
  Headset,
  Inbox,
  KeyRound,
  MessageCircle,
  Moon,
  PhoneMissed,
  ShieldCheck,
  Target,
} from 'lucide-react'
import { useMarketingPrefs } from '@/components/marketing/public-frame'
import { HelixMark } from '@/components/marketing/helix-mark'
import { REGIONAL_PRICING_CONFIGS } from '@/lib/pricing/tiers'

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

export function HomeView() {
  const { lang } = useMarketingPrefs()
  const ar = lang === 'ar'
  const plans = REGIONAL_PRICING_CONFIGS.gcc_enterprise.plans
  const [openFaq, setOpenFaq] = useState(0)

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

  return (
    <>
      <section className="hero">
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
                  {ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'} <ArrowRight className="arrow" size={16} />
                </Link>
                <Link className="btn btn-ghost" href="#how">{ar ? 'كيف يعمل؟' : 'See how it works'}</Link>
              </div>
              <div className="trust-row">
                <span><Check size={16} />{ar ? 'عربي وإنجليزي' : 'Arabic & English'}</span>
                <span><Check size={16} />{ar ? 'على رقم واتساب الخاص بك' : 'Your own WhatsApp number'}</span>
                <span><Check size={16} />{ar ? 'النظام ملكك بعد الإطلاق' : 'You keep ownership after go-live'}</span>
              </div>
            </div>
            <div className="visual">
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
                  <div className="wa-body">
                    <span className="wa-day">اليوم</span>
                    {CHAT.map(b => (
                      <div key={b.text} className={`bub ${b.side}`}>
                        {b.text}
                        <span className="t">{b.time}</span>
                      </div>
                    ))}
                  </div>
                  <div className="wa-input"><div className="f">اكتب رسالة</div></div>
                </div>
              </div>
              <div className="float c-missed">
                <div className="c-row">
                  <div className="c-ic amber"><PhoneMissed size={18} /></div>
                  <div>
                    <div className="c-title">{ar ? 'مكالمة فائتة · 9:41 م' : 'Missed call · 9:41 PM'}</div>
                    <div className="c-sub"><bdi className="ltr">+971 50 ••• 4182</bdi><br />{ar ? 'بعد الدوام. لا أحد في الاستقبال.' : 'After hours. Nobody at the desk.'}</div>
                  </div>
                </div>
              </div>
              <div className="float c-booked">
                <div className="c-row">
                  <div className="c-ic green"><CalendarCheck size={18} /></div>
                  <div>
                    <div className="c-title">{ar ? 'تم حجز الموعد' : 'Appointment booked'}</div>
                    <div className="c-sub">{ar ? 'أُضيف إلى تقويمك' : 'Added to your calendar'}</div>
                  </div>
                </div>
                <div className="cal">
                  <div className="cal-day"><b>THU</b><span>6:15</span></div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{ar ? 'تنظيف أسنان · م' : 'Teeth cleaning · PM'}</div>
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
            <div><span className="sc-time">9:41 PM</span><span className="sc-what"><PhoneMissed size={16} />{ar ? 'فاتت مكالمة بعد الدوام' : 'Call missed after hours'}</span></div>
            <div><span className="sc-time">9:41 PM</span><span className="sc-what"><MessageCircle size={16} />{ar ? 'أُرسل رد واتساب' : 'WhatsApp reply sent'}</span></div>
            <div><span className="sc-time">9:44 PM</span><span className="sc-what"><CalendarCheck size={16} />{ar ? 'حُجز موعد الخميس' : 'Booked for Thursday'}</span></div>
            <div><span className="sc-out">{ar ? 'لم يحتج أحد من فريقك لرفع السماعة.' : 'Nobody on your team had to pick up the phone.'}</span></div>
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
              <div className="tabs">
                <span className="tab on">{ar ? 'فرز المكالمات الفائتة' : 'Missed-call triage'}</span>
                <span className="tab">{ar ? 'موظف الاستقبال والحجوزات' : 'Booking receptionist'}</span>
                <span className="tab">{ar ? 'تأهيل العملاء' : 'Lead qualification'}</span>
              </div>
              <span className="chip chip-example d-only">{ar ? 'سيناريو توضيحي' : 'Example scenario'}</span>
            </div>
            <div className="flow">
              <div className="step done"><div className="step-dot"><div className="inner"><PhoneMissed size={22} /></div></div><div className="step-card"><div className="step-k"><span>{ar ? '١' : 'STEP 1'}</span><span>9:41 PM</span></div><div className="step-t">{ar ? 'تفوتك مكالمة' : 'A call is missed'}</div><div className="step-b">{ar ? 'يُبلَّغ النظام لحظة عدم الرد، ليلاً أو نهاراً.' : 'Your phone system tells Helix the moment a call goes unanswered, day or night.'}</div></div></div>
              <div className="step done"><div className="step-dot"><div className="inner"><MessageCircle size={22} /></div></div><div className="step-card"><div className="step-k"><span>{ar ? '٢' : 'STEP 2'}</span><span>{ar ? 'بعد ثوانٍ' : 'seconds later'}</span></div><div className="step-t">{ar ? 'رد على واتساب بلغة العميل' : 'WhatsApp reply, in their language'}</div><div className="mini-bub">لاحظنا اتصالك قبل قليل. كيف نقدر نخدمك؟</div></div></div>
              <div className="step done"><div className="step-dot"><div className="inner"><Target size={22} /></div></div><div className="step-card"><div className="step-k"><span>{ar ? '٣' : 'STEP 3'}</span><span>{ar ? 'رسالتان' : '2 messages'}</span></div><div className="step-t">{ar ? 'يسأل الأسئلة الصحيحة' : 'It asks the right questions'}</div><div className="step-b">{ar ? 'أي خدمة، ومتى، وزيارة أولى أم عودة.' : 'Which service, how soon, new or returning.'}</div><div className="tagline"><span className="pill">{ar ? 'تنظيف أسنان' : 'Teeth cleaning'}</span><span className="pill">{ar ? 'هذا الأسبوع' : 'This week'}</span><span className="pill">{ar ? 'مريض جديد' : 'New patient'}</span></div></div></div>
              <div className="step done"><div className="step-dot"><div className="inner"><CalendarCheck size={22} /></div></div><div className="step-card"><div className="step-k"><span>{ar ? '٤' : 'STEP 4'}</span><span>9:44 PM</span></div><div className="step-t">{ar ? 'حجز وتأكيد' : 'Booked and confirmed'}</div><div className="step-b">{ar ? 'الموعد من تقويمك الحقيقي، مع تذكير في اليوم السابق.' : 'Slot taken from your real calendar. Reminder the day before.'}</div><div className="tagline"><span className="pill g"><Check size={14} /> Thu · 6:15 PM</span></div></div></div>
            </div>
            <div className="flow-foot">
              <span><Headset size={16} /> {ar ? 'إذا طلب العميل شخصاً، أو كانت الإجابة غير واضحة، يتولى فريقك المحادثة بكامل سجلها.' : 'If the customer asks for a person, or the answer is unclear, your team takes over with the full conversation.'}</span>
              <Link className="link" href="/systems/missed-call-responder">{ar ? 'استكشف فرز المكالمات' : 'Explore missed-call triage'} <ArrowRight className="arrow" size={14} /></Link>
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
            {[
              { big: true, href: '/systems/missed-call-responder', title: ar ? 'فرز المكالمات الفائتة' : 'Missed-call triage', body: ar ? 'رد واتساب بعد ثوانٍ من المكالمة الفائتة، ثم تأهيل الاستفسار وتوجيهه.' : 'A WhatsApp reply seconds after a missed call. Qualifies the enquiry and routes it to the right person.', meta: ar ? 'عيادات، مقاولون، خدمات منزلية' : 'Best for clinics, contractors, home services' },
              { big: true, href: '/systems/booking-receptionist', title: ar ? 'موظف الاستقبال والحجوزات' : 'Booking receptionist', body: ar ? 'يرد على المكالمات بالخليجي والإنجليزي، ويحجز من توفرك الحقيقي، ويؤكد على واتساب.' : 'Answers calls in Gulf Arabic and English, books from your real availability, and confirms on WhatsApp.', meta: ar ? 'عيادات، صالونات، عقار' : 'Best for clinics, salons, real estate' },
              { big: false, href: '/systems/lead-attribution', title: ar ? 'تأهيل وإسناد العملاء' : 'Lead qualification & attribution', body: ar ? 'يقيّم كل عميل جديد ويُظهر أي إعلان أنتج الحجوزات.' : 'Scores every new lead and shows which ad actually produced bookings.', meta: ar ? 'إعلانات، عيادات، عقار' : 'Paid social, clinics, real estate' },
              { big: false, href: '/systems/lead-reactivation', title: ar ? 'إعادة تنشيط العملاء' : 'Lead reactivation', body: ar ? 'يعيد التواصل مع من وافقوا سابقاً، مع احترام طلب الإيقاف.' : 'Wakes up past enquiries and customers who opted in, with messages that respect “stop”.', meta: ar ? 'عقار، عيادات، شركات' : 'Real estate, clinics, B2B' },
              { big: false, href: '/systems/ar-invoicing', title: ar ? 'تحصيل المستحقات' : 'B2B collections', body: ar ? 'متابعات مهذبة على واتساب للفواتير التجارية المتأخرة. للشركات فقط.' : 'Courteous WhatsApp follow-ups on overdue commercial invoices. Business clients only.', meta: ar ? 'خدمات الشركات' : 'B2B services, distributors' },
            ].map(card => (
              <article key={card.href} className={`sys ${card.big ? 'big' : 'sm'}`}>
                <div className="sys-vis" />
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <div className="meta"><span>{card.meta}</span><Link className="link" href={card.href}>{ar ? 'استكشف' : 'Explore'} <ArrowRight className="arrow" size={14} /></Link></div>
              </article>
            ))}
          </div>
          <div className="price-foot">
            <span>{ar ? 'تشتري نظاماً واحداً؟ اضبطه وشاهد سعره في الاستوديو.' : 'Buying a single system? Configure it and see its price in Studio.'}</span>
            <Link className="link" href="/studio">{ar ? 'افتح الاستوديو' : 'Open Studio'} <ArrowRight className="arrow" size={14} /></Link>
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
            <div className="browser-bar"><i /><i /><i /><span className="url">helix · Example Dental Clinic</span></div>
            <div className="dp">
              <div className="dp-side">
                <div className="it on">Overview</div>
                <div className="it">Contacts</div>
                <div className="it">Review queue</div>
                <div className="it">Lead generation</div>
              </div>
              <div className="dp-main">
                <div className="dp-h"><div><b>Good evening</b><div className="dp-sum">This week your systems replied to 38 enquiries and booked 11 appointments.</div></div><span className="ex-chip">Example data</span></div>
                <div className="kpis">
                  <div className="kpi"><small>Appointments booked</small><b>11</b></div>
                  <div className="kpi"><small>Missed calls answered</small><b>17</b></div>
                  <div className="kpi"><small>Conversations</small><b>38</b></div>
                  <div className="kpi"><small>Median first reply</small><b>18s</b></div>
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
            <div className="feat"><Globe size={22} /><div><h4>{ar ? 'لهجات عربية والإنجليزية' : 'Arabic dialects and English'}</h4><p>{ar ? 'خليجي ومصري وشامي وإنجليزي، والمزيج الذي يكتبه عملاؤك فعلاً.' : 'Gulf, Egyptian and Levantine Arabic, English, and the mix of both your customers actually write.'}</p><div className="say"><span className="pill ar">أبغى موعد بكرة</span><span className="pill ar">عايز أحجز</span><span className="pill">Can I book for Sunday?</span></div></div></div>
            <div className="feat"><Headset size={22} /><div><h4>{ar ? 'شخص حقيقي عند الحاجة' : 'A person, whenever it matters'}</h4><p>{ar ? 'إذا طلب العميل بشراً، أو لم يكن النظام متأكداً، تنتقل المحادثة لفريقك مع السياق كاملاً.' : 'If a customer asks for a human, or the system is unsure, the conversation moves to your team with full context.'}</p></div></div>
            <div className="feat"><Moon size={22} /><div><h4>{ar ? 'محترم افتراضياً' : 'Respectful by default'}</h4><p>{ar ? 'ساعات هدوء، وموافقة مسبقة لرسائل التسويق، واحترام طلب الإيقاف.' : 'Quiet hours, opt-in for marketing messages, and “stop” honoured every time.'}</p><div className="say"><span className="pill ar">إيقاف</span><span className="pill">stop</span></div></div></div>
            <div className="feat"><KeyRound size={22} /><div><h4>{ar ? 'ما نبنيه ملكك' : 'You own what we build'}</h4><p>{ar ? 'بعد الإطلاق يبقى الإعداد والتكاملات وأدلة التشغيل ملكك.' : 'After go-live you keep the setup, the integrations and the runbooks.'}</p></div></div>
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
                <li><Check size={18} /><div><b>{ar ? 'عرض حي قبل تحديد النطاق' : 'Live demo before scope'}</b><span>{ar ? 'ترى النظام على حالة من عملك أولاً.' : 'You see it working on your use case first.'}</span></div></li>
                <li><Check size={18} /><div><b>{ar ? 'تقارير صادقة' : 'Honest reporting'}</b><span>{ar ? 'لا مقاييس مخترعة، لا في البيع ولا في لوحتك.' : 'No invented metrics, in sales or in your dashboard.'}</span></div></li>
                <li><Check size={18} /><div><b>{ar ? 'مراحل واضحة بالعربي أو الإنجليزي' : 'Bilingual milestones'}</b><span>{ar ? 'الخطط والتحديثات باللغة التي تختارها.' : 'Plans and updates in Arabic or English.'}</span></div></li>
                <li><Check size={18} /><div><b>{ar ? 'ملكية واضحة' : 'Clear ownership'}</b><span>{ar ? 'النظام يبقى لك بعد الإطلاق.' : 'You keep the system after go-live.'}</span></div></li>
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
            <Link className="link d-only" href="/pricing">{ar ? 'قارن كل الباقات' : 'Compare all plans'} <ArrowRight className="arrow" size={14} /></Link>
          </div>
          <div className="plans">
            {plans.map(plan => (
              <div key={plan.id} className={`plan${plan.featured ? ' feat-plan' : ''}`}>
                <div className="plan-name">
                  {ar ? plan.nameAr : plan.name}
                  {plan.featured ? <span className="chip">{ar ? 'موصى بها' : 'Recommended'}</span> : null}
                </div>
                <p className="muted small" style={{ marginTop: 6 }}>{ar ? plan.taglineAr : plan.tagline}</p>
                <div className="price"><span className="cur">AED</span><b className="num"><bdi>{money(plan.prices.AED ?? 0)}</bdi></b><span className="per">{ar ? '/ شهرياً' : '/ month'}</span></div>
                <div className="faint small">+ AED <bdi>{money(plan.setupFee.AED ?? 0)}</bdi> {ar ? 'إعداد لمرة واحدة' : 'one-time setup'}</div>
                <ul>
                  {(ar ? plan.featuresAr : plan.features).slice(0, 3).map(f => (
                    <li key={f}><Check size={16} />{f}</li>
                  ))}
                </ul>
                <Link className={`btn ${plan.featured ? 'btn-primary' : 'btn-ghost'}`} href={`/contact?plan=${plan.id}`}>
                  {plan.featured ? (ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call') : ar ? 'تفاصيل الباقة' : 'See plan details'}
                </Link>
              </div>
            ))}
          </div>
          <div className="price-foot">
            <Link href="/studio">{ar ? 'تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو' : 'Buying a single system? See per-system prices in Studio →'}</Link>
            <Link className="link" href="/build">{ar ? 'بناء مخصّص، لنحدد النطاق' : "Custom build, let's scope it →"}</Link>
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
          <div>
            {faqs.map(([q, a], i) => (
              <div className="qa" key={q}>
                <button type="button" className="q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)} style={{ width: '100%', background: 'none', border: 0, color: 'inherit', textAlign: 'start', cursor: 'pointer' }}>
                  {q}
                </button>
                {openFaq === i ? <div className="a">{a}</div> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sec" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <div className="container">
          <div className="final">
            <span className="watermark"><HelixMark size={280} /></span>
            <h2 className="display">{ar ? 'أخبرنا أين تضيع الاستفسارات، وسنريك النظام الذي يلتقطها.' : "Tell us where enquiries slip through. We'll show you the system that catches them."}</h2>
            <p className="lead">{ar ? 'مكالمة تعريفية قصيرة: نحدد أصغر نظام يحل المشكلة، ثم نعرضه أمامك مباشرة، بالعربي أو الإنجليزي.' : 'A short discovery call. We map the smallest system that fixes it, then demo it live, in Arabic or English.'}</p>
            <div className="cta-row">
              <Link className="btn btn-primary" href="/contact">{ar ? 'احجز مكالمة تعريفية' : 'Book a discovery call'} <ArrowRight className="arrow" size={16} /></Link>
              <Link className="btn btn-ghost" href="/contact"><MessageCircle size={16} /> {ar ? 'راسلنا' : 'Chat on WhatsApp'}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
