import { notFound } from 'next/navigation'
import { SampleFrame } from '@/components/dashboard/sample-frame'
import { ExampleOverview } from '@/components/dashboard/example-overview'
import { SampleLeadgen, SampleSearch } from '@/components/dashboard/sample-views'

const SCREENS = ['overview', 'leadgen', 'search', 'cmdk', 'empty'] as const

export default async function DesignPreviewPage({ params }: { params: Promise<{ screen: string }> }) {
  if (process.env.NODE_ENV === 'production') notFound()
  const { screen } = await params
  if (!SCREENS.includes(screen as (typeof SCREENS)[number])) notFound()

  if (screen === 'overview' || screen === 'empty') {
    return screen === 'empty' ? <ExampleOverview mode="empty" /> : <ExampleOverview />
  }
  if (screen === 'cmdk') {
    return (
      <SampleFrame active="overview" crumb="Overview" palette>
        <ExampleOverview />
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
