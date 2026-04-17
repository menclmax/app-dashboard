import 'server-only'
import { cookies } from 'next/headers'

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7, // 7 days
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies()
  jar.set('sb-access-token', accessToken, COOKIE_OPTS)
  jar.set('sb-refresh-token', refreshToken, COOKIE_OPTS)
}

export async function clearAuthCookies() {
  const jar = await cookies()
  jar.delete('sb-access-token')
  jar.delete('sb-refresh-token')
}
