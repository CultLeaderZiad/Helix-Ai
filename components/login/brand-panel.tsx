'use client'

import dynamic from 'next/dynamic'
import type { PlatformStatus } from '@/lib/platform-status'
import { PlatformStatusReadout } from '@/components/login/platform-status-readout'

const Lightfall = dynamic(() => import('@/components/lightfall'), { ssr: false })

// Helix retint of the React Bits defaults: accent cyan, a pale tint of it, and a
// desaturated steel so the field reads as one brand hue, not a purple gradient.
const HELIX_STREAKS = ['#9BE7F5', '#38C6E0', '#6C86A8']
const HELIX_GLOW = '#0B2E3C'

export function BrandPanel({ status }: { status: PlatformStatus }) {
  return (
    <aside className="relative flex h-40 flex-col justify-between overflow-hidden bg-deep text-deep-foreground lg:h-full lg:min-h-svh">
      <div className="absolute inset-0 motion-reduce:hidden">
        <Lightfall
          colors={HELIX_STREAKS}
          backgroundColor={HELIX_GLOW}
          speed={0.5}
          streakCount={3}
          streakWidth={1}
          streakLength={1}
          glow={0.8}
          density={0.6}
          twinkle={0.6}
          zoom={2.4}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={0.6}
          mouseRadius={0.6}
        />
      </div>

      <div className="relative flex items-baseline gap-3 p-6 lg:p-12">
        <span className="font-display text-h3 leading-none tracking-tight">Helix AI</span>
        <span className="text-small text-deep-muted">Operations console</span>
      </div>

      <div className="relative hidden p-12 lg:block">
        <PlatformStatusReadout status={status} />
      </div>
    </aside>
  )
}
