import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="hx status-page">
      <p className="kicker">
        <span className="only-en">Helix</span>
        <span className="only-ar">Helix</span>
      </p>
      <h1>
        <span className="only-en">Page not found</span>
        <span className="only-ar">الصفحة غير موجودة</span>
      </h1>
      <p className="lead">
        <span className="only-en">That address is not on this site.</span>
        <span className="only-ar">هذا العنوان غير موجود في الموقع.</span>
      </p>
      <div className="cta-row">
        <Link className="btn btn-ghost" href="/">
          <span className="only-en">Back to home</span>
          <span className="only-ar">العودة للرئيسية</span>
        </Link>
        <Link className="btn btn-primary" href="/contact">
          <span className="only-en">Book a discovery call</span>
          <span className="only-ar">احجز مكالمة تعريفية</span>
        </Link>
      </div>
    </main>
  )
}
