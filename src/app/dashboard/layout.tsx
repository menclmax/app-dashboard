export const dynamic = 'force-dynamic'
import { Sidebar } from "@/components/layout/sidebar"
import { UserProvider } from "@/components/layout/user-context"
import { createServerClient, createServiceClient } from "@/lib/supabase"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let user = undefined

  try {
    const supabase = await createServerClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (authUser) {
      const sb = createServiceClient()
      const { data: profile } = await sb
        .from('profiles')
        .select('name, username, avatar_url, verified, is_admin, xp, level, bio, location, website, pronouns, location_sharing')
        .eq('id', authUser.id)
        .single()

      user = {
        name: profile?.name ?? null,
        username: profile?.username ?? authUser.email?.split('@')[0] ?? 'admin',
        email: authUser.email ?? '',
        avatar_url: profile?.avatar_url ?? null,
        verified: profile?.verified ?? false,
        is_admin: profile?.is_admin ?? false,
        xp: profile?.xp ?? 0,
        level: profile?.level ?? 1,
        bio: profile?.bio ?? null,
        location: profile?.location ?? null,
        website: profile?.website ?? null,
        pronouns: profile?.pronouns ?? null,
        location_sharing: profile?.location_sharing ?? true,
      }
    }
  } catch {
    // proceed without user info
  }

  return (
    <UserProvider user={user}>
      <div className="flex min-h-screen bg-slate-50 overflow-x-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col pl-64 min-w-0 max-w-full">
          {children}
        </div>
      </div>
    </UserProvider>
  )
}
