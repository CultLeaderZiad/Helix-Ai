import { redirect } from 'next/navigation'

interface ClientHealthRouteProps {
  params: Promise<{ id: string }>
}

export default async function ClientHealthRedirectPage({ params }: ClientHealthRouteProps) {
  const { id } = await params
  redirect(`/admin/risk?clientId=${id}`)
}
