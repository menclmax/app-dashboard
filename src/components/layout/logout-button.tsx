'use client'
import { LogOut } from 'lucide-react'
import { logout } from '@/app/actions/auth'
import { supabaseBrowser } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'

export function LogoutButton({ variant }: { variant?: 'destructive' | 'icon' }) {
  async function handleLogout() {
    await supabaseBrowser.auth.signOut()
    await logout()
  }

  if (variant === 'destructive') {
    return (
      <Button variant="destructive" onClick={handleLogout} className="gap-2">
        <LogOut className="h-4 w-4" />
        Sign Out
      </Button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-red-500 transition-colors"
      title="Sign out"
    >
      <LogOut className="h-4 w-4" />
    </button>
  )
}
