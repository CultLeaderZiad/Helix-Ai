import type { Metadata } from 'next'
import { SitePage } from '@/components/marketing/site-page'
import { StudioIntro } from '@/components/marketing/studio-intro'
import { StudioWorkspace } from '@/components/studio/studio-workspace'

export const metadata: Metadata = {
  title: 'Studio — Helix',
  description: 'Per-system pricing in USD. Pick the systems you need and see each setup and monthly price.',
}

export default function PublicStudioPage() {
  return (
    <SitePage>
      <StudioIntro />
      <div className="container" style={{ paddingBottom: 80 }}>
        <StudioWorkspace initialClientName="Al Noor Specialty Clinic" />
      </div>
    </SitePage>
  )
}
