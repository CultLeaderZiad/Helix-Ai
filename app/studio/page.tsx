import type { Metadata } from 'next'
import { SystemsCatalog } from '@/components/marketing/home-view'
import { SitePage } from '@/components/marketing/site-page'
import { StudioWorkspace } from '@/components/studio/studio-workspace'

export const metadata: Metadata = {
  title: 'Studio — Helix AI',
  description: 'Core production packs and preview add-ons. Try a demo or read a guide.',
}

export default function PublicStudioPage() {
  return (
    <SitePage bare>
      <SystemsCatalog />
      <div className="page-main">
        <div className="wrap">
          <StudioWorkspace initialClientName="Al Noor Specialty Clinic" />
        </div>
      </div>
    </SitePage>
  )
}
