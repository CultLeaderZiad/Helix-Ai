export const motionTokens = {
  ease: {
    out: [0.16, 1, 0.3, 1] as const,
  },
  duration: {
    hover: 0.14,
    reveal: 0.7,
  },
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
  },
  stagger: {
    dashboard: 0.025,
    dashboardCap: 12,
    marketing: 0.07,
  },
} as const
