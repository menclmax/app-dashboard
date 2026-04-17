'use server'
import { redirect } from 'next/navigation'
import { createAnonClient, createServerClient } from '@/lib/supabase'
import { setAuthCookies, clearAuthCookies } from '@/lib/session'

export type LoginState = { error?: string } | undefined

export async function setSessionFromClient(
  accessToken: string,
  refreshToken: string
): Promise<{ error: string } | null> {
  const supabase = createAnonClient()
  const { data } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })

  if (!data.session) return { error: 'google_failed' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user!.id)
    .single()

  if (!profile?.is_admin) return { error: 'not_admin' }

  await setAuthCookies(data.session.access_token, data.session.refresh_token)
  return null
}

export async function login(state: LoginState, formData: FormData): Promise<LoginState> {
  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  const supabase = createAnonClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return { error: 'Invalid email or password.' }
  }

  // Verify admin access
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single()

  if (!profile?.is_admin) {
    await supabase.auth.signOut()
    return { error: 'Access denied. Admin privileges required.' }
  }

  await setAuthCookies(data.session.access_token, data.session.refresh_token)
  redirect('/dashboard')
}


export async function logout() {
  try {
    const supabase = await createServerClient()
    await supabase.auth.signOut()
  } catch {
    // ignore — always clear cookies regardless
  }
  await clearAuthCookies()
  redirect('/login')
}
