'use client'

import dynamic from 'next/dynamic'
import type { PlatformStatus } from '@/lib/platform-status'
import { PlatformStatusReadout } from '@/components/login/platform-status-readout'
import { HelixMark } from '@/components/brand/helix-mark'

const Lightfall = dynamic(() => import('@/components/lightfall'), { ssr: false })

// Palette taken from the logo's navy: a pale sky tint, the brand blue itself,
// and the accent cyan. Background glow sits in the same blue so the field reads
// as one hue rather than a purple gradient.
const HELIX_STREAKS = ['#A6C8FF', '#2F6BFF', '#7FE3F3']
const HELIX_GLOW = '#0A3F8F'

export function BrandPanel({ status }: { status: PlatformStatus }) {
  return (
    <aside className="relative flex h-56 flex-col justify-between overflow-hidden bg-deep text-deep-foreground lg:h-full lg:min-h-svh">
      <div className="absolute inset-0 motion-reduce:hidden">
        <Lightfall
          colors={HELIX_STREAKS}
          backgroundColor={HELIX_GLOW}
          speed={1}
          streakCount={8}
          streakWidth={1}
          streakLength={1}
          glow={1}
          density={1}
          twinkle={1}
          zoom={2}
          backgroundGlow={1}
          opacity={1}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.6}
        />
      </div>
      {/* Bottom fade so the status readout sits on a legible surface without a box shadow. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-72 bg-linear-to-t from-deep/90 to-transparent lg:block" />

      <div className="relative flex items-center gap-3 p-6 lg:p-12">
        <HelixMark size={40} />
        <div className="flex flex-col">
          <span className="font-display text-h3 leading-none tracking-tight">Helix AI</span>
          <span className="text-small text-deep-muted">Operations console</span>
        </div>
      </div>

      <div className="relative hidden p-12 lg:block">
        <PlatformStatusReadout status={status} />
      </div>
    </aside>
  )
}
