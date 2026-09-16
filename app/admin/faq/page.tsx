import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'
import { ConsoleShell } from '@/components/shell/console-shell'
import { AdminTabs } from '@/components/admin/admin-tabs'
import { FaqManagerView } from '@/components/admin/faq-manager-view'
import { getAllAdminFaqs } from '@/lib/faq/actions'

export const metadata = {
  title: 'FAQ Management — Helix AI Admin',
  robots: { index: false, follow: false },
}

export default async function AdminFaqPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role !== 'agency_admin') redirect('/dashboard')

  const faqs = await getAllAdminFaqs()

  return (
    <ConsoleShell variant="admin" email={session.user.email ?? ''} businessName={null}>
      <div className="mx-auto w-full max-w-6xl">
        <AdminTabs />
        <FaqManagerView initialFaqs={faqs} />
      </div>
    </ConsoleShell>
  )
}
