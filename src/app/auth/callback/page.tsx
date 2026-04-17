'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { setSessionFromClient } from '@/app/actions/auth'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    supabaseBrowser.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.replace('/login?error=google_failed')
        return
      }
      const result = await setSessionFromClient(session.access_token, session.refresh_token)
      router.replace(result ? `/login?error=${result.error}` : '/dashboard')
    })
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-slate-400 text-sm">Signing you in…</p>
    </div>
  )
}
