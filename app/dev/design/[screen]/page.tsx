import { notFound } from 'next/navigation'
import { SampleFrame } from '@/components/dashboard/sample-frame'
import { SampleLeadgen, SampleOverview, SampleSearch } from '@/components/dashboard/sample-views'

const SCREENS = ['overview', 'leadgen', 'search', 'cmdk'] as const

export default async function DesignPreviewPage({ params }: { params: Promise<{ screen: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { screen } = await params
  if (!SCREENS.includes(screen as (typeof SCREENS)[number])) notFound()

  if (screen === 'overview' || screen === 'cmdk') {
    return (
      <SampleFrame active="overview" crumb="Overview" palette={screen === 'cmdk'} toast={screen === 'overview'}>
        <SampleOverview />
      </SampleFrame>
    )
  }
  if (screen === 'leadgen') {
    return (
      <SampleFrame active="lead" crumb="Lead Generation">
        <SampleLeadgen />
      </SampleFrame>
    )
  }
  return (
    <SampleFrame active="search" crumb="Search">
      <SampleSearch />
    </SampleFrame>
  )
}
