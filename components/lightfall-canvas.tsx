'use client'

import dynamic from 'next/dynamic'
import type { LightfallProps } from './lightfall'

const Lightfall = dynamic(() => import('./lightfall'), { ssr: false })

export function LightfallCanvas({
  colors = ['#A6C8FF', '#5227FF', '#FF9FFC'],
  backgroundColor = '#0A29FF',
  speed = 1,
  streakCount = 8,
  streakWidth = 1,
  streakLength = 1,
  glow = 1,
  density = 1,
  twinkle = 1,
  zoom = 2,
  backgroundGlow = 1,
  opacity = 1,
  mouseInteraction = true,
  mouseStrength = 1,
  mouseRadius = 0.6,
  className,
  ...rest
}: LightfallProps) {
  return (
    <Lightfall
      colors={colors}
      backgroundColor={backgroundColor}
      speed={speed}
      streakCount={streakCount}
      streakWidth={streakWidth}
      streakLength={streakLength}
      glow={glow}
      density={density}
      twinkle={twinkle}
      zoom={zoom}
      backgroundGlow={backgroundGlow}
      opacity={opacity}
      mouseInteraction={mouseInteraction}
      mouseStrength={mouseStrength}
      mouseRadius={mouseRadius}
      className={className}
      {...rest}
    />
  )
}

export { Lightfall }
export default LightfallCanvas
