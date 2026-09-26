'use client'

import React from 'react'
import { LazyMotion, MotionConfig } from 'motion/react'
import { loadFeatures } from '@/lib/motion/features'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict={false}>
      <MotionConfig reducedMotion="user">
        {children}
      </MotionConfig>
    </LazyMotion>
  )
}
