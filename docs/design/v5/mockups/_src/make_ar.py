import re
h=open('home-en.html').read()
# drop sections not needed for the AR screen (dashboard preview, region, founder, faq)
def cut(h, start_marker, end_marker):
    a=h.index(start_marker); b=h.index(end_marker,a); return h[:a]+h[b:]
h=cut(h,'<!-- DASHBOARD PREVIEW -->','<!-- PRICING TEASER')
h=cut(h,'<!-- FAQ -->','<!-- FINAL CTA -->')
R=[
('<html lang="en" dir="ltr">','<html lang="ar" dir="rtl">'),
('<title>Helix AI — Missed calls answered. Appointments booked. (v5 mockup)</title>','<title>Helix — مكالمة فائتة؟ نرد عليها ونحجز الموعد (نموذج v5)</title>'),
('<nav class="nav-links d-only"><a>Systems</a><a>How it works</a><a>Pricing</a><a>Studio</a><a>About</a></nav>','<nav class="nav-links d-only"><a>الأنظمة</a><a>كيف نعمل</a><a>الأسعار</a><a>الاستوديو</a><a>من نحن</a></nav>'),
('<div class="lang d-only"><span class="on">EN</span><span class="ar">ع</span></div>','<div class="lang d-only"><span>EN</span><span class="on ar">ع</span></div>'),
('<a class="d-only">Sign in</a>','<a class="d-only">تسجيل الدخول</a>'),
('<a class="btn btn-primary btn-sm d-only">Book a call</a>','<a class="btn btn-primary btn-sm d-only">احجز مكالمة</a>'),
('<span class="d-only">Done-for-you AI systems for GCC &amp; MENA businesses</span><span class="m-only">Done-for-you AI systems · GCC &amp; MENA</span>','<span>أنظمة ذكاء اصطناعي نبنيها ونشغّلها عنك · الخليج والشرق الأوسط</span>'),
('<h1 class="display h1">Missed calls answered.<br><em>Appointments booked.</em></h1>','<h1 class="display h1">مكالمة فائتة؟<br><em>نرد عليها ونحجز الموعد.</em></h1>'),
('Helix builds and runs AI systems for clinics, real-estate and service businesses. Every missed call gets a WhatsApp reply within seconds, a real conversation in Arabic or English, and a confirmed booking in your calendar. Set up and monitored by our team.',
 'تبني Helix وتشغّل أنظمة ذكاء اصطناعي للعيادات وشركات العقار وأعمال الخدمات. كل مكالمة فائتة يصلها رد على واتساب خلال ثوانٍ، ثم محادثة حقيقية بالعربي أو الإنجليزي، ثم موعد مؤكد في تقويمك. فريقنا يجهّز كل شيء ويتابعه.'),
('<a class="btn btn-primary">Book a discovery call {{i:arrow arrow}}</a>\n          <a class="btn btn-ghost">See how it works</a>','<a class="btn btn-primary">احجز مكالمة تعريفية {{i:arrow arrow}}</a>\n          <a class="btn btn-ghost">كيف يعمل؟</a>'),
('<span>{{i:check}}Arabic &amp; English</span>\n          <span>{{i:check}}Your own WhatsApp number</span>\n          <span>{{i:check}}You keep ownership after go-live</span>','<span>{{i:check}}عربي وإنجليزي</span>\n          <span>{{i:check}}على رقم واتساب الخاص بك</span>\n          <span>{{i:check}}النظام ملكك بعد الإطلاق</span>'),
('<div class="c-title">Missed call · 9:41 PM</div><div class="c-sub"><span class="ltr">+971 50 ••• 4182</span><br>After hours. Nobody at the desk.</div>','<div class="c-title">مكالمة فائتة · <bdi>9:41</bdi> م</div><div class="c-sub"><bdi class="ltr">+971 50 ••• 4182</bdi><br>بعد الدوام. لا أحد على الاستقبال.</div>'),
('<div class="c-title">Appointment booked</div><div class="c-sub">Added to your calendar</div>','<div class="c-title">تم حجز الموعد</div><div class="c-sub">أُضيف إلى تقويمك</div>'),
('<div class="cal"><div class="cal-day"><b>THU</b><span>6:15</span></div>\n            <div><div style="font-size:14px;font-weight:500">Teeth cleaning · PM</div><div class="c-sub">New patient · via WhatsApp<br>Reminder set for Wednesday</div></div></div>',
 '<div class="cal"><div class="cal-day"><b>الخميس</b><span>6:15</span></div>\n            <div><div style="font-size:14px;font-weight:500">تنظيف أسنان · مساءً</div><div class="c-sub">مريض جديد · عبر واتساب<br>تذكير يوم الأربعاء</div></div></div>'),
('<div class="caption">Illustrative example · fictional clinic, names and times</div>','<div class="caption">مثال توضيحي · العيادة والأسماء والأوقات غير حقيقية</div>'),
('<span class="chip chip-example" style="width:max-content">Example scenario</span><div class="faint small" style="margin-top:8px">One missed call, start to finish</div>','<span class="chip chip-example" style="width:max-content">سيناريو توضيحي</span><div class="faint small" style="margin-top:8px">مكالمة فائتة واحدة، من البداية للنهاية</div>'),
('<span class="sc-time">9:41 PM</span><span class="sc-what">{{i:phone-missed}}Call missed after hours</span>','<span class="sc-time">9:41 م</span><span class="sc-what">{{i:phone-missed}}مكالمة فائتة بعد الدوام</span>'),
('<span class="sc-time">9:41 PM</span><span class="sc-what">{{i:message}}WhatsApp reply sent</span>','<span class="sc-time">9:41 م</span><span class="sc-what">{{i:message}}أُرسل رد على واتساب</span>'),
('<span class="sc-time">9:44 PM</span><span class="sc-what">{{i:calendar-check}}Booked for Thursday</span>','<span class="sc-time">9:44 م</span><span class="sc-what">{{i:calendar-check}}حُجز موعد الخميس</span>'),
('<span class="sc-out">Nobody on your team had to pick up the phone.</span>','<span class="sc-out">ولم يضطر أحد من فريقك للرد على الهاتف.</span>'),
('<span class="kicker">Why it matters</span><h2 class="display h2">The enquiries you miss are revenue that goes to someone else.</h2>','<span class="kicker">لماذا يهمّك هذا</span><h2 class="display h2">كل استفسار يفوتك هو دخل يذهب إلى غيرك.</h2>'),
('<div class="p-title">After hours</div><p class="p-body">Calls after closing go unanswered, and the caller moves on to the next clinic on the list.</p>','<div class="p-title">بعد الدوام</div><p class="p-body">المكالمات بعد الإغلاق تبقى بلا رد، فينتقل المتصل إلى العيادة التالية في القائمة.</p>'),
('<div class="p-title">A busy front desk</div><p class="p-body">Your team is with the customer in front of them. The phone rings out, and nobody calls back.</p>','<div class="p-title">استقبال مشغول</div><p class="p-body">فريقك مشغول مع العميل الذي أمامه. يرنّ الهاتف، ولا أحد يعاود الاتصال.</p>'),
('<div class="p-title">Slow follow-up</div><p class="p-body">Leads from ads and Instagram wait hours for a reply, long after their interest has cooled.</p>','<div class="p-title">متابعة بطيئة</div><p class="p-body">عملاء الإعلانات وإنستغرام ينتظرون الرد لساعات، بعد أن يكون اهتمامهم قد فتر.</p>'),
('<span class="kicker">How it works</span><h2 class="display h2">From missed call to booked appointment, in four quiet steps.</h2><p class="lead">No new app for your team. The system works inside the tools you already use and only asks for a person when it should.</p>',
 '<span class="kicker">كيف يعمل</span><h2 class="display h2">من مكالمة فائتة إلى موعد محجوز، في أربع خطوات هادئة.</h2><p class="lead">لا تطبيق جديد لفريقك. يعمل النظام داخل الأدوات التي تستخدمها أصلاً، ولا يطلب تدخّل أحد إلا عند الحاجة.</p>'),
('<span class="tab on">Missed-call triage</span><span class="tab">Booking receptionist</span><span class="tab">Lead qualification</span></div>\n        <span class="chip chip-example d-only">Example scenario</span>','<span class="tab on">فرز المكالمات الفائتة</span><span class="tab">موظف الاستقبال والحجوزات</span><span class="tab">تأهيل العملاء</span></div>\n        <span class="chip chip-example d-only">سيناريو توضيحي</span>'),
('<span>STEP 1</span><span>9:41 PM</span></div><div class="step-t">A call is missed</div><div class="step-b">Your phone system tells Helix the moment a call goes unanswered, day or night.</div>','<span>الخطوة 1</span><span>9:41 م</span></div><div class="step-t">تفوتك مكالمة</div><div class="step-b">يُبلغ نظام الهاتف لديك Helix فور عدم الرد على أي مكالمة، ليلاً أو نهاراً.</div>'),
('<span>STEP 2</span><span>seconds later</span></div><div class="step-t">WhatsApp reply, in their language</div>','<span>الخطوة 2</span><span>بعد ثوانٍ</span></div><div class="step-t">رد على واتساب بلغة العميل</div>'),
('<span>STEP 3</span><span>2 messages</span></div><div class="step-t">It asks the right questions</div><div class="step-b">Which service, how soon, new or returning.</div><div class="tagline"><span class="pill">Teeth cleaning</span><span class="pill">This week</span><span class="pill">New patient</span></div>',
 '<span>الخطوة 3</span><span>رسالتان</span></div><div class="step-t">يسأل الأسئلة الصحيحة</div><div class="step-b">أي خدمة، ومتى، وهل هو عميل جديد أم سابق.</div><div class="tagline"><span class="pill">تنظيف أسنان</span><span class="pill">هذا الأسبوع</span><span class="pill">مريض جديد</span></div>'),
('<span>STEP 4</span><span>9:44 PM</span></div><div class="step-t">Booked and confirmed</div><div class="step-b">Slot taken from your real calendar. Reminder the day before.</div><div class="tagline"><span class="pill g">{{i:check}} Thu · 6:15 PM</span></div>',
 '<span>الخطوة 4</span><span>9:44 م</span></div><div class="step-t">حجز وتأكيد</div><div class="step-b">الموعد من تقويمك الفعلي، مع تذكير قبله بيوم.</div><div class="tagline"><span class="pill g">{{i:check}} الخميس · 6:15 م</span></div>'),
('<span>{{i:headset}}&nbsp; If the customer asks for a person, or the answer is unclear, your team takes over with the full conversation.</span><a class="link">Explore missed-call triage {{i:arrow arrow}}</a>','<span>{{i:headset}}&nbsp; إذا طلب العميل التحدث مع شخص، أو كانت الإجابة غير واضحة، يتسلّم فريقك المحادثة كاملة.</span><a class="link">تعرّف على فرز المكالمات الفائتة {{i:arrow arrow}}</a>'),
('<span class="kicker">Systems</span><h2 class="display h2">Five systems. Each one does a single job, properly.</h2><p class="lead">Start with the one that fixes your biggest leak. Add the next when the first has earned its place.</p>','<span class="kicker">الأنظمة</span><h2 class="display h2">خمسة أنظمة. كل نظام يؤدي مهمة واحدة، بإتقان.</h2><p class="lead">ابدأ بالنظام الذي يسدّ أكبر ثغرة لديك، وأضف التالي عندما يثبت الأول قيمته.</p>'),
('<span>Missed call</span><span class="faint" style="margin-left:auto">9:41 PM</span>','<span>مكالمة فائتة</span><span class="faint" style="margin-inline-start:auto">9:41 م</span>'),
('<span>WhatsApp reply sent</span><span class="faint" style="margin-left:auto">9:41 PM</span>','<span>أُرسل رد واتساب</span><span class="faint" style="margin-inline-start:auto">9:41 م</span>'),
('<span>Routed to bookings</span><span class="pill g" style="margin-left:auto">Qualified</span>','<span>حُوّل إلى الحجوزات</span><span class="pill g" style="margin-inline-start:auto">مؤهَّل</span>'),
('<h3>Missed-call triage</h3><p>A WhatsApp reply seconds after a missed call. Qualifies the enquiry and routes it to the right person.</p>\n        <div class="meta"><span>Best for clinics, contractors, home services</span><a class="link">Explore {{i:arrow arrow}}</a></div>',
 '<h3>فرز المكالمات الفائتة</h3><p>رد على واتساب خلال ثوانٍ بعد المكالمة الفائتة، يؤهّل الاستفسار ويوجّهه للشخص المناسب.</p>\n        <div class="meta"><span>الأنسب للعيادات والمقاولات وخدمات المنازل</span><a class="link">استكشف {{i:arrow arrow}}</a></div>'),
('<span>Inbound call · Arabic</span><span class="wave" style="margin-left:auto">','<span>مكالمة واردة · عربي</span><span class="wave" style="margin-inline-start:auto">'),
('<span>Consultation · Sun 11:00 AM</span><span class="pill g" style="margin-left:auto">Booked</span>','<span>استشارة · الأحد 11:00 ص</span><span class="pill g" style="margin-inline-start:auto">محجوز</span>'),
('<span>Confirmation + location on WhatsApp</span>','<span>تأكيد وموقع العيادة على واتساب</span>'),
('<h3>Booking receptionist</h3><p>Answers calls in Gulf Arabic and English, books from your real availability, and confirms on WhatsApp.</p>\n        <div class="meta"><span>Best for clinics, salons, real estate</span><a class="link">Explore {{i:arrow arrow}}</a></div>',
 '<h3>موظف الاستقبال والحجوزات</h3><p>يرد على المكالمات بالخليجية والإنجليزية، ويحجز من مواعيدك المتاحة فعلاً، ويؤكد عبر واتساب.</p>\n        <div class="meta"><span>الأنسب للعيادات ومراكز التجميل والعقارات</span><a class="link">استكشف {{i:arrow arrow}}</a></div>'),
('<span>Instagram ad</span><span class="pill g" style="margin-left:auto">Hot</span>','<span>إعلان إنستغرام</span><span class="pill g" style="margin-inline-start:auto">ساخن</span>'),
('<span>Google search</span><span class="pill a" style="margin-left:auto">Warm</span>','<span>بحث Google</span><span class="pill a" style="margin-inline-start:auto">دافئ</span>'),
('<span>Website form</span><span class="pill" style="margin-left:auto">Nurture</span>','<span>نموذج الموقع</span><span class="pill" style="margin-inline-start:auto">متابعة لاحقة</span>'),
('<h3>Lead qualification &amp; attribution</h3><p>Scores every new lead and shows which ad actually produced bookings.</p>\n        <div class="meta"><span>Paid social, clinics, real estate</span>','<h3>تأهيل وإسناد العملاء</h3><p>يقيّم كل عميل جديد، ويُظهر أي إعلان جلب حجوزات فعلاً.</p>\n        <div class="meta"><span>الإعلانات، العيادات، العقارات</span>'),
('<span class="faint">Last contact</span><span style="margin-left:auto">8 months ago</span>','<span class="faint">آخر تواصل</span><span style="margin-inline-start:auto">قبل 8 أشهر</span>'),
('<span>Friendly WhatsApp check-in</span>','<span>رسالة متابعة ودّية على واتساب</span>'),
('<span>Replied: “Yes, next week”</span><span class="pill g" style="margin-left:auto">Re-engaged</span>','<span>الرد: «نعم، الأسبوع القادم»</span><span class="pill g" style="margin-inline-start:auto">عاد للتواصل</span>'),
('<h3>Lead reactivation</h3><p>Wakes up past enquiries and customers who opted in, with messages that respect “stop”.</p>\n        <div class="meta"><span>Real estate, clinics, B2B</span>','<h3>إعادة تنشيط العملاء</h3><p>يعيد التواصل مع العملاء والاستفسارات السابقة ممن وافقوا على الرسائل، ويحترم طلب «إيقاف».</p>\n        <div class="meta"><span>العقارات، العيادات، الشركات</span>'),
('<span>Invoice · 14 days overdue</span>','<span>فاتورة · متأخرة 14 يوماً</span>'),
('<span>Polite reminder + payment link</span>','<span>تذكير مهذّب + رابط دفع</span>'),
('<span>Payment received</span><span class="pill g" style="margin-left:auto">Paid</span>','<span>تم استلام الدفعة</span><span class="pill g" style="margin-inline-start:auto">مدفوعة</span>'),
('<h3>B2B collections</h3><p>Courteous WhatsApp follow-ups on overdue commercial invoices. Business clients only.</p>\n        <div class="meta"><span>B2B services, distributors</span>','<h3>تحصيل المستحقات (شركات فقط)</h3><p>متابعات مهذّبة عبر واتساب للفواتير التجارية المتأخرة. لعملاء الشركات فقط.</p>\n        <div class="meta"><span>خدمات الشركات والموزعون</span>'),
('<span>Buying a single system? Configure it and see its price in Studio.</span><a class="link">Open Studio {{i:arrow arrow}}</a>','<span>تشتري نظاماً واحداً؟ اضبطه واطّلع على سعره في الاستوديو.</span><a class="link">افتح الاستوديو {{i:arrow arrow}}</a>'),
('<span class="kicker">Monthly plans · AED</span><h2 class="display h2">Clear monthly plans. One-time setup.</h2></div><a class="link d-only">Compare all plans {{i:arrow arrow}}</a>','<span class="kicker">الباقات الشهرية · درهم</span><h2 class="display h2">باقات شهرية واضحة، ورسوم إعداد لمرة واحدة.</h2></div><a class="link d-only">قارن كل الباقات {{i:arrow arrow}}</a>'),
('<div class="plan-name">Enterprise Starter</div><p class="muted small" style="margin-top:6px">Single location, phone and WhatsApp.</p>\n        <div class="price"><span class="cur">AED</span><b class="num">1,800</b><span class="per">/ month</span></div><div class="faint small">+ AED 4,500 one-time setup</div>\n        <ul><li>{{i:check}}Up to 1,500 conversations a month</li><li>{{i:check}}Voice agent in Gulf Arabic &amp; English</li><li>{{i:check}}Calendar sync and WhatsApp confirmations</li></ul>\n        <a class="btn btn-ghost">See plan details</a>',
 '<div class="plan-name">انطلاقة المؤسسات</div><p class="muted small" style="margin-top:6px">لفرع واحد: الهاتف وواتساب.</p>\n        <div class="price"><b class="num">1,800</b><span class="cur">درهم</span><span class="per">/ شهرياً</span></div><div class="faint small">+ <bdi>4,500</bdi> درهم رسوم إعداد لمرة واحدة</div>\n        <ul><li>{{i:check}}حتى 1,500 محادثة شهرياً</li><li>{{i:check}}وكيل صوتي بالخليجية والإنجليزية</li><li>{{i:check}}مزامنة التقويم وتأكيدات واتساب</li></ul>\n        <a class="btn btn-ghost">تفاصيل الباقة</a>'),
('<div class="plan-name">Growth Enterprise <span class="chip" style="border-color:rgba(0,0,0,.15);color:#0E6E4F">Recommended</span></div><p class="muted small" style="margin-top:6px">Missed-call triage, voice and WhatsApp together.</p>\n        <div class="price"><span class="cur">AED</span><b class="num">4,600</b><span class="per" style="color:#8A8C90">/ month</span></div><div class="small" style="color:#8A8C90">+ AED 7,500 one-time setup</div>\n        <ul><li>{{i:check}}Up to 10,000 conversations a month</li><li>{{i:check}}Voice, WhatsApp and email automation</li><li>{{i:check}}Missed-call WhatsApp text-back and triage</li></ul>\n        <a class="btn btn-primary">Book a discovery call</a>',
 '<div class="plan-name">نمو المؤسسات <span class="chip" style="border-color:rgba(0,0,0,.15);color:#0E6E4F">موصى بها</span></div><p class="muted small" style="margin-top:6px">فرز المكالمات الفائتة والصوت وواتساب معاً.</p>\n        <div class="price"><b class="num">4,600</b><span class="cur">درهم</span><span class="per" style="color:#8A8C90">/ شهرياً</span></div><div class="small" style="color:#8A8C90">+ <bdi>7,500</bdi> درهم رسوم إعداد لمرة واحدة</div>\n        <ul><li>{{i:check}}حتى 10,000 محادثة شهرياً</li><li>{{i:check}}أتمتة الصوت وواتساب والبريد الإلكتروني</li><li>{{i:check}}رد واتساب تلقائي على المكالمات الفائتة</li></ul>\n        <a class="btn btn-primary">احجز مكالمة تعريفية</a>'),
('<div class="plan-name">Sovereign Scale</div><p class="muted small" style="margin-top:6px">Multiple branches and brands.</p>\n        <div class="price"><span class="cur">AED</span><b class="num">10,200</b><span class="per">/ month</span></div><div class="faint small">+ AED 15,000 one-time setup</div>\n        <ul><li>{{i:check}}Unlimited workspaces across branches</li><li>{{i:check}}Custom dialect tuning</li><li>{{i:check}}Priority escalation support</li></ul>\n        <a class="btn btn-ghost">See plan details</a>',
 '<div class="plan-name">المؤسسات الكبرى متعددة الفروع</div><p class="muted small" style="margin-top:6px">لعدة فروع وعلامات تجارية.</p>\n        <div class="price"><b class="num">10,200</b><span class="cur">درهم</span><span class="per">/ شهرياً</span></div><div class="faint small">+ <bdi>15,000</bdi> درهم رسوم إعداد لمرة واحدة</div>\n        <ul><li>{{i:check}}مساحات عمل غير محدودة للفروع</li><li>{{i:check}}تخصيص اللهجات المحلية</li><li>{{i:check}}دعم بأولوية للتصعيد</li></ul>\n        <a class="btn btn-ghost">تفاصيل الباقة</a>'),
("<span>Buying a single system? See per-system prices in Studio →</span><span>Need something bespoke? <a class=\"link\">Custom build, let's scope it →</a></span>",'<span>تشتري نظاماً واحداً؟ شاهد أسعار كل نظام في الاستوديو ←</span><span>تحتاج شيئاً مخصّصاً؟ <a class="link">بناء مخصّص، لنحدد النطاق ←</a></span>'),
("<h2 class=\"display\">Tell us where enquiries slip through. We'll show you the system that catches them.</h2>",'<h2 class="display">أخبرنا أين تضيع الاستفسارات، وسنريك النظام الذي يلتقطها.</h2>'),
('<p class="lead">A short discovery call. We map the smallest system that fixes it, then demo it live, in Arabic or English.</p>','<p class="lead">مكالمة تعريفية قصيرة: نحدد أصغر نظام يحل المشكلة، ثم نعرضه أمامك مباشرة، بالعربي أو الإنجليزي.</p>'),
('<div class="cta-row"><a class="btn btn-primary">Book a discovery call {{i:arrow arrow}}</a><a class="btn btn-ghost">{{i:message}} Chat on WhatsApp</a></div>','<div class="cta-row"><a class="btn btn-primary">احجز مكالمة تعريفية {{i:arrow arrow}}</a><a class="btn btn-ghost">{{i:message}} راسلنا على واتساب</a></div>'),
('AI systems that answer, qualify and book, in Arabic and English. For businesses across the GCC and MENA.','أنظمة ذكاء اصطناعي ترد وتؤهّل وتحجز، بالعربي والإنجليزي. للأعمال في الخليج والشرق الأوسط.'),
('<div><h6>Product</h6><a>Systems</a><a>Studio</a><a>Pricing</a><a>Client sign in</a></div>\n      <div><h6>Company</h6><a>About</a><a>Contact</a><a>Updates</a></div>\n      <div><h6>Legal</h6><a>Privacy</a><a>Terms</a></div>',
 '<div><h6>المنتج</h6><a>الأنظمة</a><a>الاستوديو</a><a>الأسعار</a><a>دخول العملاء</a></div>\n      <div><h6>الشركة</h6><a>من نحن</a><a>تواصل معنا</a><a>التحديثات</a></div>\n      <div><h6>قانوني</h6><a>الخصوصية</a><a>الشروط</a></div>'),
('<span>English · <span class="ar">العربية</span></span>','<span><span class="ltr">English</span> · العربية</span>'),
]
for a,b in R:
    assert a in h, "MISSING: "+a[:90]; h=h.replace(a,b)
# RTL overrides appended to page style
rtl_css='''
/* ---------- RTL overrides ---------- */
[dir="rtl"] .visual .phone{left:4px}
[dir="rtl"] .c-missed{left:auto;right:-8px}
[dir="rtl"] .c-booked{left:auto;right:-36px}
[dir="rtl"] .caption{left:4px}
[dir="rtl"] .glow{left:-120px}
[dir="rtl"] .scenario>div{border-left:0;border-right:1px solid var(--line)}
[dir="rtl"] .scenario>div:first-child{border-right:0}
[dir="rtl"] .scenario{grid-template-columns:200px 1fr 1fr 1fr 1.3fr}
[dir="rtl"] .problem-grid>div{padding:36px 0 0 36px}
[dir="rtl"] .problem-grid>div+div{padding-left:36px;padding-right:36px;border-left:0;border-right:1px solid var(--line)}
[dir="rtl"] .sc-time,[dir="rtl"] .step-k,[dir="rtl"] .p-num{font-family:var(--f-ar);font-size:13px}
[dir="rtl"] .sc-what .ico{margin-right:0;margin-left:6px}
[dir="rtl"] .sc-out{font-family:var(--f-ar);font-size:19px;font-weight:500;line-height:1.6}
[dir="rtl"] .p-title{font-size:21px;font-weight:600}
[dir="rtl"] .step-t{font-size:16.5px}
[dir="rtl"] .sys h3{font-size:21px;font-weight:600}
[dir="rtl"] .hero .h1{font-size:64px;line-height:1.3}
[dir="rtl"] .final .display{font-size:46px;line-height:1.4}
[dir="rtl"] .flow::before{background:repeating-linear-gradient(270deg,var(--line-2) 0 6px,transparent 6px 12px)}
[dir="rtl"] .price{gap:8px}
[dir="rtl"] .watermark{right:auto;left:-40px}
[dir="rtl"] .eyebrow{font-size:14px}
[dir="rtl"] .trust-row{font-size:15px}
[dir="rtl"] .nav-links,[dir="rtl"] .nav-right{font-size:15px}
</style>'''
h=h.replace('</style>\n</head>',rtl_css+'\n</head>',1)
open('home-ar.html','w').write(h)
print("ok")
