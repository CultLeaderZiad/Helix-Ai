'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'

const Demo = dynamic(() => import('./studio-motion-demo').then(mod => mod.StudioMotionDemo), {
  loading: () => <p role="status" className="p-12 text-muted-foreground font-mono text-xs text-center">Loading walkthrough…</p>,
})

/** Keep the optional animation and its dependencies off the initial load. */
export function LandingDemo() {
  const [opened, setOpened] = useState(false)
  return (
    <div className="mx-auto min-h-80 w-full max-w-4xl rounded-xl border border-border bg-panel">
      {opened ? (
        <Demo autoplay={true} loop={false} />
      ) : (
        <div className="flex min-h-80 flex-col items-center justify-center gap-5 px-6 py-12 text-center">
          <p className="text-sm text-foreground font-medium">Voice reception → booking confirmation → CRM evidence</p>
          <Button
            type="button"
            onClick={() => setOpened(true)}
            size="lg"
            className="gap-2"
          >
            <Play className="size-4 fill-current" />
            <span>Play workflow demo</span>
          </Button>
          <p className="text-xs text-muted-foreground max-w-md">
            Scripted walkthrough demonstrating deterministic telephony ingestion, evidence bands, and audit trails.
          </p>
        </div>
      )}
    </div>
  )
}
