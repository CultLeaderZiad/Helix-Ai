import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import { AuthHashHandler } from '@/components/auth/auth-hash-handler'
import { geistSans, geistMono, ibmPlexSansArabic } from '@/app/fonts'
import { getLang, dirOf } from '@/lib/i18n/server'
import { AppProviders } from '@/components/providers/app-providers'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'Helix AI — Autonomous CRM & Revenue AI Systems',
  description:
    'Enterprise-grade autonomous AI receptionists, missed-call triage, and CRM revenue intelligence for high-growth businesses across the GCC and MENA.',
  keywords: [
    'Helix AI',
    'AI Receptionist',
    'WhatsApp Business Automation',
    'CRM Intelligence',
    'Voice AI Middle East',
    'Dubai AI Automation',
    'Saudi Enterprise AI',
  ],
  authors: [{ name: 'Helix AI' }],
  other: {
    'geo.region': 'AE;SA;QA;EG;JO',
    'geo.placename': 'Dubai, Riyadh, Doha, Cairo, Amman',
  },
  openGraph: {
    title: 'Helix AI — Autonomous CRM & Revenue AI Systems',
    description: 'Autonomous voice and WhatsApp AI infrastructure for modern enterprises.',
    url: 'https://helixai.co',
    siteName: 'Helix AI',
    locale: 'en_US',
    type: 'website',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  colorScheme: 'light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3F1EC' },
    { media: '(prefers-color-scheme: dark)', color: '#1C1B19' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const lang = await getLang()
  const dir = dirOf(lang)

  return (
    <html
      lang={lang}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSansArabic.variable} ${inter.variable} ${spaceGrotesk.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-[#F3F1EC] text-[#141414]" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Helix AI',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                priceCurrency: 'USD',
                eligibleRegion: ['AE', 'SA', 'QA', 'EG', 'JO'],
              },
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

