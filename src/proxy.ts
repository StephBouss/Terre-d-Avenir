import { NextResponse, type NextRequest } from 'next/server'
import { decideRoute } from './lib/i18n/routing'

export function proxy(request: NextRequest) {
  const decision = decideRoute(request.nextUrl.pathname)
  if (decision.action === 'redirect') {
    return NextResponse.redirect(new URL(decision.location + request.nextUrl.search, request.url))
  }
  if (decision.action === 'rewrite') {
    return NextResponse.rewrite(new URL(decision.location, request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
