import { NextResponse, type NextRequest } from 'next/server'
import { decideRoute, localeFromPath } from './lib/i18n/routing'

export function proxy(request: NextRequest) {
  const decision = decideRoute(request.nextUrl.pathname)
  if (decision.action === 'redirect') {
    return NextResponse.redirect(new URL(decision.location + request.nextUrl.search, request.url))
  }
  // Langue active transmise à global-not-found (qui n'a pas accès aux params de route).
  const headers = new Headers(request.headers)
  headers.set('x-locale', localeFromPath(request.nextUrl.pathname))
  if (decision.action === 'rewrite') {
    return NextResponse.rewrite(new URL(decision.location, request.url), { request: { headers } })
  }
  return NextResponse.next({ request: { headers } })
}

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
