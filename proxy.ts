import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getVerifiedSession } from '@/lib/auth/session'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })
  const path = request.nextUrl.pathname
  const isLogin = path === '/login' || path.startsWith('/login/')
  const isApi = path.startsWith('/api/')

  function finish(result: NextResponse) {
    for (const cookie of response.cookies.getAll()) result.cookies.set(cookie)
    result.headers.set('Cache-Control', 'private, no-store')
    result.headers.set('X-Robots-Tag', 'noindex, nofollow')
    return result
  }

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_ANON_KEY
  if (!url || !key) {
    if (isLogin) return finish(response)
    return finish(NextResponse.json({ error: 'Authentication unavailable.' }, { status: 503 }))
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(values) {
        for (const { name, value } of values) request.cookies.set(name, value)
        response = NextResponse.next({ request })
        for (const { name, value, options } of values) response.cookies.set(name, value, options)
      },
    },
  })

  try {
    const session = await getVerifiedSession(supabase)
    if (isLogin) return finish(response)
    if (!session) {
      return finish(isApi
        ? NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url)))
    }
    if ((path === '/admin' || path.startsWith('/admin/')) && session.claims.role !== 'agency_admin') {
      return finish(NextResponse.json({ error: 'Access denied.' }, { status: 403 }))
    }
    return finish(response)
  } catch {
    if (isLogin) return finish(response)
    return finish(NextResponse.json({ error: 'Authentication unavailable.' }, { status: 503 }))
  }
}

// Cron endpoints carry their own shared-secret guard (CRON_SECRET) and must
// stay reachable by the scheduler without a browser session, so /api/cron/*
// is the one explicit matcher exception. Every other /api path still
// requires a verified session.
export const config = {
  matcher: [
    '/login/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    '/client/:path*',
    '/api/((?!cron/).*)',
  ],
}