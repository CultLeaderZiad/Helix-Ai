import React from 'react'
import { cookies } from 'next/headers'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { PillNav } from '@/components/navigation/pill-nav'
import { HelixFooter } from '@/components/footer/helix-footer'
import { MarketingThemeSync } from '@/components/marketing/marketing-theme-sync'

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const themeCookie = cookieStore.get('helix-mk-theme')?.value
  const theme = themeCookie === 'light' ? 'light' : 'dark'
  const navAuth = await getNavAuth()

  return (
    <div className="mk relative min-h-screen w-full flex flex-col bg-[#07090C] text-[#F2F4F7]" data-theme={theme}>
      <MarketingThemeSync defaultTheme={theme} />
      <PillNav
        isAuthenticated={navAuth.isAuthenticated}
        consoleHref={navAuth.consoleHref}
      />
      <main id="main" className="flex-1 w-full">
        {children}
      </main>
      <HelixFooter />
    </div>
  )
}
