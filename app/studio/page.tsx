import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { LightfallCanvas } from '@/components/lightfall-canvas'
import { StudioWorkspace } from '@/components/studio/studio-workspace'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'

export const metadata: Metadata = {
  title: 'Studio IDE — Helix AI',
  description:
    'Interactive Autonomous Systems Engineering Studio. Inspect execution topologies, test simulated caller dialogues, calibrate prompt directives, and model economic ROI.',
}

export default async function PublicStudioPage() {
  const navAuth = await getNavAuth()

  return (
    <div className="relative min-h-screen bg-[#0B0F19] text-[#F8FAFC]">
      {/* Ambient Cyber Canvas */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <LightfallCanvas
          colors={['#38BDF8', '#0EA5E9', '#0284C7']}
          backgroundColor="#0B0F19"
          speed={0.6}
          streakCount={6}
          density={0.7}
          glow={0.8}
          mouseInteraction={true}
          className="h-full w-full opacity-60"
        />
        <div className="absolute inset-0 bg-[#0B0F19]/40 backdrop-blur-xs" />
      </div>

      <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

      <main className="relative z-10 mx-auto max-w-7xl px-4 pt-28 pb-20 md:pt-36">
        <StudioWorkspace initialClientName="Apex Medical & Surgical" />
      </main>

      <HelixFooter />
    </div>
  )
}
