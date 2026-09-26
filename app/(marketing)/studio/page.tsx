import type { Metadata } from 'next'
import { StudioConfigurator } from '@/components/marketing/studio-configurator'
import { StudioIntro } from '@/components/marketing/studio-intro'

export const metadata: Metadata = {
  title: 'Studio: Helix',
  description: 'Per-system pricing in USD. Pick the systems you need and see each setup and monthly price.',
}

export default function PublicStudioPage() {
  return (
    <>
      <StudioIntro />
      <StudioConfigurator />
    </>
  )
}
