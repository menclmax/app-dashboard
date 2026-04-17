import { createServerClient, createServiceClient } from "@/lib/supabase"
import { Header } from "@/components/layout/header"
import { SettingsClient } from "./settings-client"
import { redirect } from "next/navigation"

export default async function SettingsPage() {
  const supabase = await createServerClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const sb = createServiceClient()
  const { data: profile } = await sb
    .from('profiles')
    .select('id, username, name, bio, avatar_url, website, location, pronouns, location_sharing, xp, level, verified, is_admin')
    .eq('id', authUser.id)
    .single()

  return (
    <main className="flex-1">
      <Header title="Settings" description="Manage your admin profile" />
      <SettingsClient profile={profile} email={authUser.email ?? ''} />
    </main>
  )
}
