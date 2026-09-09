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
    <main className="grid min-h-svh grid-rows-[auto_1fr] lg:grid-cols-[480px_minmax(0,1fr)] lg:grid-rows-1">
      <BrandPanel status={status} />
      <section className="flex flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-[440px] rounded-2xl border border-border bg-panel p-6 shadow-xl sm:p-8">
          <LoginForm />
        </div>
      </section>
    </main>
  )
}
