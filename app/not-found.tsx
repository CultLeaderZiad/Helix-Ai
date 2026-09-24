import Link from 'next/link'
import { PillNav } from '@/components/navigation/pill-nav'
import { HelixFooter } from '@/components/footer/helix-footer'
import { getNavAuth } from '@/lib/auth/nav-auth'
import { FileQuestion, ArrowRight } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export default async function NotFound() {
  const navAuth = await getNavAuth()

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <div>
        <PillNav isAuthenticated={navAuth.isAuthenticated} consoleHref={navAuth.consoleHref} />

        <main className="mx-auto max-w-3xl px-4 pt-36 pb-24 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-xl border border-border bg-panel text-accent">
            <FileQuestion className="size-7 stroke-[1.5]" />
          </div>

          <p className="mt-6 font-mono text-xs font-semibold uppercase tracking-wider text-accent">
            404 — Route Not Found
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
            This surface does not exist
          </h1>
          <p className="mx-auto mt-3 max-w-md text-small text-muted-foreground leading-relaxed">
            The page you requested may have been relocated or requires different workspace permissions.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={navAuth.isAuthenticated ? navAuth.consoleHref : '/'}
              className={buttonVariants({ size: 'default', className: 'gap-2' })}
            >
              <span>{navAuth.isAuthenticated ? 'Return to Console' : 'Return Home'}</span>
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/contact"
              className={buttonVariants({ variant: 'outline', size: 'default' })}
            >
              Contact Support
            </Link>
          </div>
        </main>
      </div>

      <HelixFooter />
    </div>
  )
}
