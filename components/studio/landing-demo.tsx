'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'

const Demo = dynamic(() => import('./studio-motion-demo').then(mod => mod.StudioMotionDemo), {
  loading: () => <p role="status" className="p-12 text-slate-300">Loading walkthrough…</p>,
})

/** Keep the optional animation and its dependencies off the initial load. */
export function LandingDemo() {
  const [opened, setOpened] = useState(false)
  return (
    <div className="mx-auto min-h-80 w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#090D16]">
      {opened ? <Demo autoplay={true} loop={false} /> : (
        <div className="flex min-h-80 flex-col items-center justify-center gap-5 px-6 py-10">
          <p className="text-sm text-slate-300">Voice reception → booking confirmation → CRM evidence</p>
          <button
            type="button"
            onClick={() => setOpened(true)}
            className="min-h-11 rounded-lg bg-sky-600 px-6 py-3 font-medium text-white hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-400"
          >
            Play workflow demo
          </button>
          <p className="text-xs text-slate-400">Optional scripted walkthrough. Loads only when you press play.</p>
        </div>
      )}
    </div>
  )
}
