import type { Metadata } from 'next'
import { SitePage } from '@/components/marketing/site-page'
import { UpdatesView } from '@/components/marketing/updates-view'
import { getUpdatesAction } from '@/lib/updates/actions'

export const metadata: Metadata = {
  title: 'Updates — Helix',
  description: 'What changed in Helix, in plain language.',
}

export default async function UpdatesPage() {
  const releases = await getUpdatesAction()
  return (
    <SitePage>
      <UpdatesView releases={releases} />
    </SitePage>
  )
}
