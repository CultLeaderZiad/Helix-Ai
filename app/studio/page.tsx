import type { Metadata } from 'next'
import { PillNav } from '@/components/navigation/pill-nav'
import { StudioWorkspace } from '@/components/studio/studio-workspace'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { ConsoleLanguageProvider } from '@/components/shell/console-language'

export const metadata: Metadata = {
  title: 'Studio — Helix AI',
  description: 'Core production packs and preview add-ons. Try a demo or read a guide.',
}

export default async function PublicStudioPage() {
  const navAuth = await getNavAuth()

  return (
    <div className="relative min-h-dvh w-full bg-helix-canvas text-helix-ink">
      <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />
      <main className="relative z-10 w-full px-4 pt-28 pb-20 md:px-6 md:pt-36">
        <ConsoleLanguageProvider>
          <StudioWorkspace />
        </ConsoleLanguageProvider>
      </main>
      <HelixFooter />
    </div>
  )
}
