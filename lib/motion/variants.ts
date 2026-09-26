import type { Variants } from 'motion/react'
import { motionTokens } from './tokens'

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: motionTokens.duration.reveal,
      ease: motionTokens.ease.out,
    },
  },
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionTokens.duration.reveal,
      ease: motionTokens.ease.out,
    },
  },
}

export const staggerContainer = (staggerTime = motionTokens.stagger.marketing): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerTime,
      delayChildren: 0.05,
    },
  },
})

export const hoverScale: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: {
      duration: motionTokens.duration.hover,
      ease: motionTokens.ease.out,
    },
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: motionTokens.duration.hover,
      ease: motionTokens.ease.out,
    },
  },
}
