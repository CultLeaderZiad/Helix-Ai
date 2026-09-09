'use client'

import dynamic from 'next/dynamic'
import type { LightfallProps } from './lightfall'

// Client-side dynamic import ensures OGL and WebGL are never included in the initial SSR bundle
const DynamicLightfall = dynamic(
  () => import('./lightfall').then((mod) => mod.Lightfall),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 bg-[#0B0F19]" aria-hidden="true" />,
  }
)

export function LightfallCanvas(props: LightfallProps) {
  return <DynamicLightfall {...props} />
}
