'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window === 'undefined') return

    // 1. If email confirmation link redirected to root or login with ?code= or ?token_hash=
    const search = window.location.search
    const pathname = window.location.pathname
    if (pathname !== '/auth/callback' && (search.includes('code=') || search.includes('token_hash='))) {
      const searchParams = new URLSearchParams(search)
      if (!searchParams.has('next')) {
        searchParams.set('next', '/dashboard')
      }
      window.location.href = `/auth/callback?${searchParams.toString()}`
      return
    }

    // 2. If email confirmation link redirected with hash fragment #access_token=
    const hash = window.location.hash
    if (hash && (hash.includes('access_token=') || hash.includes('type='))) {
      void (async () => {
        try {
          const { createSupabaseBrowserClient } = await import('@/lib/supabase-browser')
          const supabase = createSupabaseBrowserClient()
          const { data, error } = await supabase.auth.getSession()
          if (!error && data.session) {
            window.history.replaceState(null, '', window.location.pathname)
            router.push('/dashboard')
            router.refresh()
          }
        } catch (err) {
          console.error('Error handling auth hash:', err)
        }
      })()
    }
  }, [router])

  return null
}
