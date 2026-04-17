import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const hasSession = req.cookies.has('sb-access-token')

  const isProtected = path.startsWith('/dashboard')
  const isLogin = path === '/login'

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', req.nextUrl))
  }

  if (isLogin && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
