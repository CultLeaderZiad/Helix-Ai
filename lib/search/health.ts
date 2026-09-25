import { ProviderAvailability } from '@/lib/search/places/types'
import { GooglePlacesProvider } from '@/lib/search/places/google'
import { OsmOverpassProvider } from '@/lib/search/places/osm-overpass'
import { FoursquarePlacesProvider } from '@/lib/search/places/foursquare'
import { BrightDataSerpProvider } from '@/lib/search/places/brightdata-serp'
import { TinyFishSearchProvider } from '@/lib/search/providers/tinyfish-search'
import { TinyFishFetchProvider } from '@/lib/search/providers/tinyfish-fetch'
import { TinyFishAgentProvider } from '@/lib/search/providers/tinyfish-agent'

export async function getProvidersHealth(): Promise<ProviderAvailability[]> {
  const providers = [
    new TinyFishSearchProvider(),
    new GooglePlacesProvider(),
    new FoursquarePlacesProvider(),
    new OsmOverpassProvider(),
    new TinyFishFetchProvider(),
    {
      id: 'hunter',
      availability: async () => {
        const key = process.env.HUNTER_API_KEY
        return {
          id: 'hunter',
          available: Boolean(key),
          reason_en: key ? undefined : 'Hunter unavailable. Set HUNTER_API_KEY on the server.',
          reason_ar: key ? undefined : 'Hunter غير متاح. أضف HUNTER_API_KEY على الخادم.',
          env: ['HUNTER_API_KEY']
        }
      }
    },
    new TinyFishAgentProvider(),
    new BrightDataSerpProvider()
  ]

  const healthList = await Promise.all(
    providers.map(async p => {
      try {
        return await p.availability()
      } catch (err: any) {
        return {
          id: (p as any).id || 'unknown',
          available: false,
          reason_en: err?.message || 'Check failed'
        }
      }
    })
  )

  return healthList
}
