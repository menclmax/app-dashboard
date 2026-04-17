'use client'
import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CheckCircle2, Shield, Star, Zap, AlertCircle } from 'lucide-react'
import { LogoutButton } from '@/components/layout/logout-button'

type Profile = {
  id: string
  username: string
  name: string | null
  bio: string | null
  avatar_url: string | null
  website: string | null
  location: string | null
  pronouns: string | null
  location_sharing: boolean
  xp: number
  level: number
  verified: boolean
  is_admin: boolean
}

function initials(name: string | null, username: string) {
  const src = name ?? username
  return src.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

export function SettingsClient({ profile, email }: { profile: Profile | null; email: string }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  if (!profile) return <p className="p-6 text-slate-500">Profile not found.</p>

  return (
    <div className="p-6 max-w-2xl space-y-6">

      {/* Profile card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="text-lg font-bold">{initials(profile.name, profile.username)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-slate-900">{profile.name ?? profile.username}</p>
              <p className="text-sm text-slate-500">@{profile.username}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {profile.verified && (
                  <Badge variant="success" className="gap-1 text-xs"><CheckCircle2 className="h-3 w-3" />Verified</Badge>
                )}
                {profile.is_admin && (
                  <Badge className="gap-1 text-xs bg-slate-900 text-white"><Shield className="h-3 w-3" />Admin</Badge>
                )}
                <Badge variant="outline" className="gap-1 text-xs"><Star className="h-3 w-3" />Level {profile.level}</Badge>
                <Badge variant="outline" className="gap-1 text-xs"><Zap className="h-3 w-3" />{profile.xp} XP</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit profile */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Name</label>
                <Input name="name" defaultValue={profile.name ?? ''} placeholder="Your name" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Username</label>
                <Input name="username" defaultValue={profile.username} placeholder="username" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Bio</label>
              <textarea
                name="bio"
                defaultValue={profile.bio ?? ''}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Location</label>
                <Input name="location" defaultValue={profile.location ?? ''} placeholder="City, Country" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">Pronouns</label>
                <Input name="pronouns" defaultValue={profile.pronouns ?? ''} placeholder="e.g. they/them" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Website</label>
              <Input name="website" defaultValue={profile.website ?? ''} placeholder="https://..." type="url" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Location Sharing</p>
                <p className="text-xs text-slate-500">Allow others to see your approximate location</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" name="location_sharing" defaultChecked={profile.location_sharing} className="sr-only peer" />
                <div className="h-5 w-9 rounded-full bg-slate-200 peer-checked:bg-yellow-400 peer-focus:ring-2 peer-focus:ring-yellow-300 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-all peer-checked:after:translate-x-4" />
              </label>
            </div>

            {state?.error && (
              <div className="flex items-center gap-2 rounded-md bg-red-50 border border-red-100 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {state.error}
              </div>
            )}
            {state === null && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-600">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Profile saved.
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={pending} className="bg-slate-900 hover:bg-slate-700">
                {pending ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Account */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Email</label>
            <Input value={email} disabled className="bg-slate-50 text-slate-500" />
            <p className="text-xs text-slate-400">Email is managed by your sign-in provider and cannot be changed here.</p>
          </div>
        </CardContent>
      </Card>

      {/* Sign out */}
      <Card className="border-red-100">
        <CardHeader className="pb-4">
          <CardTitle className="text-base text-red-600">Sign Out</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500 mb-4">You will be redirected to the login page.</p>
          <LogoutButton variant="destructive" />
        </CardContent>
      </Card>

    </div>
  )
}
