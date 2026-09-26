'use client'

import Link from 'next/link'

export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <main className="hx status-page" role="alert">
      <h1>
        <span className="only-en">This page couldn’t load</span>
        <span className="only-ar">تعذّر تحميل هذه الصفحة</span>
      </h1>
      <p className="lead">
        <span className="only-en">Try again, or go back home.</span>
        <span className="only-ar">حاول مرة أخرى، أو ارجع للرئيسية.</span>
      </p>
      {error.digest ? <p className="faint small"><bdi>{error.digest}</bdi></p> : null}
      <div className="cta-row">
        <button type="button" className="btn btn-primary" onClick={() => retry()}>
          <span className="only-en">Try again</span>
          <span className="only-ar">حاول مرة أخرى</span>
        </button>
        <Link className="btn btn-ghost" href="/">
          <span className="only-en">Back to home</span>
          <span className="only-ar">العودة للرئيسية</span>
        </Link>
        <Link className="btn btn-ghost" href="/contact">
          <span className="only-en">Book a discovery call</span>
          <span className="only-ar">احجز مكالمة تعريفية</span>
        </Link>
      </div>
    </main>
  )
}
