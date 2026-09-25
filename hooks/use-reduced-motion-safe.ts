'use client'

import { useEffect, useState } from 'react'
import { useReducedMotion } from 'motion/react'

export function useReducedMotionSafe(): boolean {
  const motionReduced = useReducedMotion()
  const [isReduced, setIsReduced] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setIsReduced(mediaQuery.matches || Boolean(motionReduced))

    const handler = (event: MediaQueryListEvent) => {
      setIsReduced(event.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [motionReduced])

  return isReduced
}

export function useAmbientAllowed(): boolean {
  const isReduced = useReducedMotionSafe()
  const [isDesktop, setIsDesktop] = useState<boolean>(false)
  const [isIdleReady, setIsIdleReady] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const updateSize = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    updateSize()
    window.addEventListener('resize', updateSize)

    // Wait until idle after load
    if ('requestIdleCallback' in window) {
      const handle = (window as unknown as { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(() => {
        setIsIdleReady(true)
      })
      return () => {
        window.removeEventListener('resize', updateSize)
        if ('cancelIdleCallback' in window) {
          (window as unknown as { cancelIdleCallback: (h: number) => void }).cancelIdleCallback(handle)
        }
      }
    } else {
      const timer = setTimeout(() => setIsIdleReady(true), 200)
      return () => {
        window.removeEventListener('resize', updateSize)
        clearTimeout(timer)
      }
    }
  }, [])

  return !isReduced && isDesktop && isIdleReady
}
