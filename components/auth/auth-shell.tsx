import Link from 'next/link'
import { HelixMark } from '@/components/marketing/helix-mark'
import { authCopy } from '@/components/auth/auth-copy'
import { getPublicPrefs } from '@/lib/public-prefs'

export async function AuthShell({ children }: { children: React.ReactNode }) {
  const prefs = await getPublicPrefs()
  const copy = authCopy[prefs.lang]
  const day = prefs.theme === 'day'

  return (
    <div className={`mk auth${day ? ' day' : ''}`}>
      <div className="auth-grid">
        <aside className="auth-brand">
          <div className="auth-brand-inner">
            <Link href="/" className="brand" aria-label="Helix AI">
              <span className="mark">
                <HelixMark size={18} light={day} />
              </span>
              <span>
                <span className="auth-brand-name">{copy.brand}</span>
                <span className="auth-brand-kicker">{copy.kicker}</span>
              </span>
            </Link>
            <div className="auth-story">
              <h2 className="auth-h">{copy.headline}</h2>
              <ul className="auth-points">
                {copy.points.map(point => (
                  <li key={point}>
                    <span className="dot" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div className="auth-preview" aria-hidden="true">
              <div className="auth-preview-bar">
                <span>{copy.sampleTitle}</span>
                <span className="sample">{copy.sample}</span>
              </div>
              <div className="auth-bubbles" dir="rtl">
                <div className="bubble out">{copy.bubbleOut}</div>
                <div className="bubble in">{copy.bubbleIn}</div>
              </div>
              <div className="auth-preview-meta">{copy.sampleMeta}</div>
            </div>
          </div>
        </aside>
        <section className="auth-pane">
          <div className="auth-card">{children}</div>
        </section>
      </div>
    </div>
  )
}
