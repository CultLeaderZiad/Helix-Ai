import { Hanken_Grotesk, IBM_Plex_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google'

export const hanken = Hanken_Grotesk({
  variable: '--font-hanken',
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

export const plexMono = IBM_Plex_Mono({
  variable: '--font-plex-mono',
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
})

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-plex-ar',
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
})
