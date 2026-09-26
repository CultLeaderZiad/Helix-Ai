import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import { getVerifiedSession } from '@/lib/auth/session'

export const metadata = {
  title: 'Helix — Systems',
  robots: { index: false, follow: false },
}

export default async function StudioPage() {
  const supabase = await createSupabaseServerClient()
  const session = await getVerifiedSession(supabase)
  if (!session) redirect('/login')
  if (session.claims.role === 'agency_admin') redirect('/admin/studio')
  redirect('/dashboard/systems')
}
