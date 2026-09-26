import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google'

export const geistSans = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
})

export const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  variable: '--font-plex-ar',
  weight: ['400', '500', '600', '700'],
  subsets: ['arabic'],
  display: 'swap',
})
