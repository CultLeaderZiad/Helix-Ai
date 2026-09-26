import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, IBM_Plex_Sans_Arabic, Instrument_Serif } from 'next/font/google'
import { AuthHashHandler } from '@/components/auth/auth-hash-handler'
import { AppProviders } from '@/components/providers/app-providers'
import { getPublicPrefs } from '@/lib/public-prefs'
import './globals.css'
import './v5.css'

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const instrument = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-instrument',
  display: 'swap',
})

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Helix — AI front desk for clinics and service businesses in the GCC',
  description:
    'Helix builds and runs AI systems for clinics, real-estate and service businesses across the GCC and MENA. Missed calls get a WhatsApp reply, a real conversation, and a confirmed booking.',
  authors: [{ name: 'Helix' }],
  openGraph: {
    title: 'Helix — Missed calls answered. Appointments booked.',
    description:
      'Helix builds and runs AI systems for clinics, real-estate and service businesses. Every missed call gets a WhatsApp reply and a confirmed booking.',
    url: siteUrl,
    siteName: 'Helix',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F7F5F0' },
    { media: '(prefers-color-scheme: dark)', color: '#0A0B0D' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const prefs = await getPublicPrefs()
  const lang = prefs.lang === 'ar' ? 'ar' : 'en'
  return (
    <html
      lang={lang}
      dir={prefs.lang === 'ar' ? 'rtl' : 'ltr'}
      data-theme={prefs.theme}
      className={`${geist.variable} ${geistMono.variable} ${plexArabic.variable} ${instrument.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=document.cookie.match(/(?:^|; )helix_theme=([^;]+)/);var l=document.cookie.match(/(?:^|; )helix_lang=([^;]+)/);if(!l){l=document.cookie.match(/(?:^|; )helix-lang=([^;]+)/);}var theme=t&&decodeURIComponent(t[1])==='day'?'day':'night';var lang=l&&decodeURIComponent(l[1])==='ar'?'ar':'en';document.documentElement.dataset.theme=theme;document.documentElement.lang=lang==='ar'?'ar':'en';document.documentElement.dir=lang==='ar'?'rtl':'ltr';}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Helix',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              areaServed: [
                { '@type': 'Country', name: 'United Arab Emirates' },
                { '@type': 'Country', name: 'Saudi Arabia' },
                { '@type': 'Country', name: 'Qatar' },
                { '@type': 'Country', name: 'Egypt' },
                { '@type': 'Country', name: 'Jordan' },
              ],
            }),
          }}
        />
        <AppProviders initialLanguage={lang}>
          <AuthHashHandler />
          {children}
        </AppProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
