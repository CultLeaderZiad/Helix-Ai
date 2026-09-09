import type { Metadata } from 'next'
import Link from 'next/link'
import { HelixMark } from '@/components/brand/helix-mark'
import { SignUpForm } from '@/components/auth/signup-form'

export const metadata: Metadata = {
  title: 'Start your free trial — Helix AI',
  description: 'Create your workspace and start your 7-day unrestricted trial.',
  robots: { index: false, follow: false },
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <header className="flex flex-col items-center text-center">
          <Link href="/" aria-label="Helix AI Home" className="transition-transform hover:scale-105">
            <HelixMark size={36} />
          </Link>
          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Create your Helix AI workspace
          </h1>
          <p className="mt-2 text-small text-muted-foreground">
            7-day unrestricted access. No credit card required.
          </p>
        </header>

        <div className="mt-8 rounded-xl border border-border bg-panel p-6 shadow-sm sm:p-8">
          <SignUpForm />
        </div>

        <p className="mt-6 text-center text-small text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-accent underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}
