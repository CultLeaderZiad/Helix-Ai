import type { Metadata } from 'next'
import { BrandPanel } from '@/components/login/brand-panel'
import { LoginForm } from '@/components/login/login-form'
import { getPlatformStatus } from '@/lib/platform-status'

export const metadata: Metadata = {
  title: 'Sign in — Helix AI',
  robots: { index: false, follow: false },
}

export default async function LoginPage() {
  const status = await getPlatformStatus()

  return (
    <main className="grid min-h-svh grid-rows-[auto_1fr] lg:grid-cols-[520px_minmax(0,1fr)] lg:grid-rows-1">
      <BrandPanel status={status} />
      <section className="flex flex-col justify-center bg-background px-6 py-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm lg:mx-0">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
