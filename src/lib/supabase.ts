import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

/** Service-role client — bypasses RLS, use for admin-only server-side operations */
export function createServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Unauthenticated client — use for login only */
export function createAnonClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

/** Authenticated client — restores session from cookies */
export async function createServerClient() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('sb-access-token')?.value
  const refreshToken = cookieStore.get('sb-refresh-token')?.value

  const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  if (accessToken && refreshToken) {
    await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
  }

  return client
}
