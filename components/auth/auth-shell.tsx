import Link from 'next/link'
import { CalendarCheck, Check, Headset, MessageCircle } from 'lucide-react'
import { HelixMark } from '@/components/marketing/helix-mark'
import { getPublicPrefs } from '@/lib/public-prefs'

export async function AuthShell({
  children,
  variant = 'login',
}: {
  children: React.ReactNode
  variant?: 'login' | 'signup'
}) {
  const prefs = await getPublicPrefs()
  const ar = prefs.lang === 'ar'
  return (
    <div className="hx auth-page" data-theme="light" dir={ar ? 'rtl' : 'ltr'} lang={ar ? 'ar' : 'en'}>
      <div className="wrap">
        <aside className="bp">
          <div className="bp-glow" />
          <Link href="/" className="brand" style={{ color: '#F2F0EB', position: 'relative', zIndex: 2 }}>
            <HelixMark size={24} />
            <span className="word">HELIX</span>
          </Link>
          <div className="stage">
            <div className="back1">مرحباً، لاحظنا اتصالك قبل قليل. كيف نقدر نخدمك؟</div>
            <div className="sum">
              <div className="sum-h">
                <div>
                  <b>{ar ? 'بينما كنتم مغلقين' : 'While you were closed'}</b>
                  <small>{ar ? 'الليلة الماضية، ٨ م – ٨ ص' : 'Last night, 8:00 PM – 8:00 AM'}</small>
                </div>
                <span className="ex">{ar ? 'مثال' : 'Example'}</span>
              </div>
              <div className="sum-row"><span className="n num">6</span><span>{ar ? 'مكالمات فائتة رُدّ عليها في واتساب' : 'missed calls answered on WhatsApp'}</span><span className="ic"><MessageCircle size={16} /></span></div>
              <div className="sum-row"><span className="n num">3</span><span>{ar ? 'مواعيد محجوزة' : 'appointments booked'}</span><span className="ic"><CalendarCheck size={16} /></span></div>
              <div className="sum-row"><span className="n num">1</span><span>{ar ? 'محادثة بانتظار فريقك' : 'conversation waiting for your team'}</span><span className="ic a"><Headset size={16} /></span></div>
            </div>
            <div className="back2"><b><Check size={16} /> {ar ? 'محجوز · الخميس ٦:١٥ م' : 'Booked · Thu 6:15 PM'}</b><span>{ar ? 'تنظيف أسنان · مريض جديد' : 'Teeth cleaning · new patient'}</span></div>
          </div>
          <div className="bp-foot">
            <h2>{ar ? 'موظف الاستقبال لديك يواصل العمل بعد الإغلاق.' : 'Your front desk keeps working after you close.'}</h2>
            <p>{ar ? 'مثال توضيحي. تعرض لوحتك نشاطك الفعلي بعد تسجيل الدخول.' : 'Illustrative example. Your dashboard shows your real activity after sign-in.'}</p>
          </div>
        </aside>
        <main className="fs">
          <div className="fs-top">
            <Link href="/" className="brand m-only"><HelixMark size={22} /><span className="word">HELIX</span></Link>
            <Link href="/" className="d-only" style={{ color: 'var(--text-2)' }}>{ar ? '→ العودة للموقع' : '← Back to site'}</Link>
            <span>
              {variant === 'signup' ? (
                <>
                  {ar ? 'لديك حساب؟' : 'Already have an account?'}{' '}
                  <Link className="link" href="/login">{ar ? 'تسجيل الدخول' : 'Sign in'}</Link>
                </>
              ) : (
                <>
                  {ar ? 'جديد على Helix؟' : 'New to Helix?'}{' '}
                  <Link className="link" href="/signup">{ar ? 'أنشئ حسابك' : 'Create your account'}</Link>
                </>
              )}
            </span>
          </div>
          <div className="form">{children}</div>
          <div className="fs-foot">
            <span>{ar ? 'عربي · EN' : 'EN · ع'}</span>
            <span><Link href="/privacy">{ar ? 'الخصوصية' : 'Privacy'}</Link> · <Link href="/terms">{ar ? 'الشروط' : 'Terms'}</Link></span>
          </div>
        </main>
      </div>
    </div>
  )
}
