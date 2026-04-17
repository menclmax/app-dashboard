"use client"

import { Bell, Search, LogOut, User, Settings, Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input as ShadInput } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import Link from "next/link"
import { updateProfile } from "@/app/actions/admin"
import { supabaseBrowser } from "@/lib/supabase-browser"
import { logout } from "@/app/actions/auth"
import { useUser } from "./user-context"

export type HeaderUser = {
  name: string | null
  username: string
  email: string
  avatar_url: string | null
  verified?: boolean
  is_admin?: boolean
  xp?: number
  level?: number
  bio?: string | null
  location?: string | null
  website?: string | null
  pronouns?: string | null
  location_sharing?: boolean
}

function getInitials(name: string | null, username: string) {
  const src = name ?? username
  return src.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

interface HeaderProps {
  title: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const user = useUser()
  const [profileOpen, setProfileOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleLogout() {
    await supabaseBrowser.auth.signOut()
    await logout()
  }

  async function handleSave(formData: FormData) {
    setSaving(true)
    await updateProfile(undefined, formData)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setProfileOpen(false) }, 1000)
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/80 backdrop-blur-md px-6">
        <div>
          <h1 className="text-lg font-semibold text-slate-900 leading-tight">{title}</h1>
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input placeholder="Search..." className="pl-8 w-56 h-8 text-sm" />
          </div>

          <button className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-yellow-400 text-[8px] font-bold text-yellow-900">
              4
            </span>
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-yellow-400 text-yellow-900 text-xs font-bold">
                      {getInitials(user.name, user.username)}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" sideOffset={8} className="w-60">
                <div className="flex items-center gap-3 px-3 py-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.avatar_url ?? undefined} />
                    <AvatarFallback className="bg-yellow-400 text-yellow-900 text-sm font-bold">
                      {getInitials(user.name, user.username)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-slate-900 truncate">{user.name ?? user.username}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    {user.is_admin && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem className="gap-2.5 cursor-pointer" onSelect={() => setProfileOpen(true)}>
                  <User className="h-4 w-4 text-slate-500" />
                  Edit Profile
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="gap-2.5 cursor-pointer flex items-center">
                    <Settings className="h-4 w-4 text-slate-500" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="gap-2.5 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onSelect={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </header>

      <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          <form action={handleSave} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <ShadInput id="name" name="name" defaultValue={user?.name ?? ''} placeholder="Your name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <ShadInput id="username" name="username" defaultValue={user?.username ?? ''} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                defaultValue={user?.bio ?? ''}
                placeholder="Short bio..."
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <ShadInput id="location" name="location" defaultValue={user?.location ?? ''} placeholder="City, Country" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pronouns">Pronouns</Label>
                <ShadInput id="pronouns" name="pronouns" defaultValue={user?.pronouns ?? ''} placeholder="e.g. they/them" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <ShadInput id="website" name="website" defaultValue={user?.website ?? ''} placeholder="https://..." />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              {saved && <span className="text-sm text-emerald-600 mr-auto">Saved!</span>}
              <Button type="button" variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
